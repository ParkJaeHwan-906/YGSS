from typing import List, Optional
import numpy as np
import pandas as pd


def _ensure_asset_prefix(df: pd.DataFrame, id_col: str = "id", prefix_col: str = "asset_id_prefix") -> pd.DataFrame:
    if prefix_col not in df.columns:
        df[prefix_col] = df[id_col].apply(lambda x: str(x).split('_')[0] if '_' in str(x) else str(x))
    return df


def _prophet_next_yhat(prophet_model, last_date: pd.Timestamp) -> Optional[float]:
    """Predict next-step yhat from Prophet as a scalar."""
    try:
        future = pd.DataFrame({"ds": [pd.to_datetime(last_date) + pd.Timedelta(days=1)]})
        forecast = prophet_model.predict(future)
        return float(forecast["yhat"].iloc[0])
    except Exception:
        return None


def predict_all(
    merged_data: pd.DataFrame,
    regression_group: List[str],
    sequence_length: int,
    training_results: dict,
    lstm_data: dict,
    id_col: str = "id",
    mode: str = "lstm",  # "lstm" | "prophet" | "ensemble"
    prophet_model=None,
    lstm_weight: float = 0.7,
    prophet_weight: float = 0.3,
    last_date: Optional[pd.Timestamp] = None,
) -> pd.DataFrame:
    """
    Generate predictions for all assets using selected mode.
    """
    if merged_data is None or merged_data.empty:
        return pd.DataFrame()

    predicted = []
    df = _ensure_asset_prefix(merged_data.copy(), id_col=id_col, prefix_col="asset_id_prefix")
    grouped = df.groupby("asset_id_prefix")

    # Pre-compute global prophet next-step if needed
    global_prophet_next = None
    if mode in ("prophet", "ensemble") and prophet_model is not None:
        if last_date is None and not merged_data.empty:
            last_date = pd.to_datetime(merged_data["date"].max())
        global_prophet_next = _prophet_next_yhat(prophet_model, last_date)

    for asset_id_prefix, g in grouped:
        g = g.sort_values(by="date").dropna().copy()
        if len(g) < sequence_length:
            continue

        # Scale features/target using training scalers
        # Feature names 경고를 방지하기 위해 numpy array로 변환
        scaled_features = lstm_data['feature_scaler'].transform(g[regression_group].values)
        scaled_target = lstm_data['target_scaler'].transform(g[["return"]].values)

        scaled_combined = np.hstack((scaled_features, scaled_target))
        last_sequence = scaled_combined[-sequence_length:].reshape(1, sequence_length, scaled_combined.shape[1])

        pred_scaled = training_results['lstm_model'].predict(last_sequence, verbose=0)
        
        # 안전한 역정규화 - StandardScaler 사용 시 클리핑 범위 조정
        if hasattr(lstm_data['target_scaler'], 'scale_'):
            # StandardScaler인 경우
            pred_scaled_clipped = np.clip(pred_scaled, -3, 3)  # 3 표준편차 범위로 클리핑
        else:
            # MinMaxScaler인 경우
            pred_scaled_clipped = np.clip(pred_scaled, 0, 1)  # 0-1 범위로 클리핑
        
        lstm_pred = float(lstm_data['target_scaler'].inverse_transform(pred_scaled_clipped)[0][0])

        if mode == "lstm":
            pred_return = lstm_pred
        elif mode == "prophet" and global_prophet_next is not None:
            pred_return = float(global_prophet_next)
        elif mode == "ensemble" and global_prophet_next is not None:
            total = lstm_weight + prophet_weight
            wl = lstm_weight / total
            wp = prophet_weight / total
            pred_return = wl * lstm_pred + wp * float(global_prophet_next)
        else:
            pred_return = lstm_pred
        
        # 예측값이 비현실적으로 크거나 작으면 최근 실제 수익률의 평균으로 대체
        recent_returns = g['return'].tail(12).values  # 최근 12개월 수익률
        if len(recent_returns) > 0:
            mean_recent_return = np.mean(recent_returns)
            std_recent_return = np.std(recent_returns)
            
            # 예측값이 평균 ± 3*표준편차 범위를 벗어나면 조정
            if abs(pred_return - mean_recent_return) > 3 * std_recent_return:
                pred_return = mean_recent_return
                print(f"   - {asset_id_prefix}: 예측값이 비현실적이어서 최근 평균 수익률로 조정: {pred_return:.4f}")

        if 'company' in g.columns and 'name' in g.columns:
            info = g[['company', 'name']].iloc[-1]
            company, name = info['company'], info['name']
        else:
            company, name = 'Unknown', asset_id_prefix

        predicted.append({
            'id': asset_id_prefix,
            'company': company,
            'name': name,
            'predicted_return': float(pred_return),
        })

    pred_df = pd.DataFrame(predicted)
    if not pred_df.empty:
        pred_df = pred_df.sort_values('predicted_return', ascending=False).reset_index(drop=True)
    return pred_df
