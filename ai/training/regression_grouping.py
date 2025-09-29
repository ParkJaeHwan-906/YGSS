# -*- coding: utf-8 -*-
"""
Main pipeline orchestrator for ETF/Fund prediction and recommendation system.
Integrates all modules to provide a complete workflow.
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional
import json
import requests
from sklearn.preprocessing import RobustScaler
from dotenv import load_dotenv
load_dotenv()

juptyer_base_path = os.getenv("JUPYTER_BASE_PATH", "")
print(juptyer_base_path)
juptyer_data_path = f"{juptyer_base_path}/data"
fastapi_base_path = os.getenv("FASTAPI_BASE_PATH", "")

# 각 서비스 모듈을 가져옵니다.
from data_service import load_market_data, normalize_asset_df, merge_asset_and_market
from feature_engineering import create_sequences_with_ids, prepare_prophet_data
from model_builder import build_advanced_lstm_model, build_conservative_prophet_model, configure_gpu
from model_manager import ModelManager, create_data_config
from model_evaluator import evaluate_lstm_model, evaluate_prophet_model, evaluate_predictions, compare_models, generate_evaluation_report
from predict_service import predict_all, send_predictions
from recommender import recommend_etfs, generate_recommendation_report
from model_trainer import split_sequences_by_id, create_ensemble_predictions
from sync_service import post_predictions

import pandas as pd
from itertools import combinations
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

# 기존 함수들은 그대로 있다고 가정 (load_market_data, normalize_asset_df, merge_asset_and_market, create_sequences_with_ids, split_sequences_by_id 등)

def find_best_regression_columns(merged_data: pd.DataFrame = None):
    """
    merged_data의 모든 market data 컬럼 조합에 대해 회귀 분석을 수행하여 
    가장 성능이 좋은 컬럼 조합을 찾습니다.
    """
    if merged_data is None:
        raise ValueError("merged_data는 필수 인자입니다.")

    # 회귀 분석을 위한 데이터 준비
    regression_data = merged_data.dropna()
    
    # 'date', 'id', 'return' 컬럼을 제외한 모든 컬럼을 후보 특성으로 지정
    all_possible_features = [col for col in regression_data.columns 
                             if col not in ['date', 'id', 'return']]

    print("후보 특성:", all_possible_features)
    
    # 모든 특성 조합 생성
    all_feature_combinations = []
    for i in range(1, len(all_possible_features) + 1):
        for combo in combinations(all_possible_features, i):
            all_feature_combinations.append(list(combo))
    
    print(f"총 {len(all_feature_combinations)}개의 특성 조합을 탐색합니다.")

    results = {}
    
    # 각 특성 조합에 대해 회귀 모델 학습 및 평가
    for combo in all_feature_combinations:
        regression_features = combo
        
        # 'id'를 기준으로 학습/테스트 데이터 분할
        X = regression_data[regression_features]
        y = regression_data['return']
        
        # 'id' 컬럼을 이용하여 시계열 순서를 유지하며 데이터 분할
        unique_ids = regression_data['id'].unique()
        train_ids, test_ids = train_test_split(unique_ids, test_size=0.2, random_state=42)
        
        X_train = X[regression_data['id'].isin(train_ids)]
        X_test = X[regression_data['id'].isin(test_ids)]
        y_train = y[regression_data['id'].isin(train_ids)]
        y_test = y[regression_data['id'].isin(test_ids)]
        
        # 학습 데이터가 비어있을 경우 건너뛰기
        if X_train.empty or X_test.empty:
            continue
            
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        
        results[tuple(regression_features)] = {'R-squared': r2, 'MAE': mae, 'MSE': mse}
        
    # 결과가 없을 경우 예외 처리
    if not results:
        print("경고: 회귀 분석 결과를 찾을 수 없습니다. 기본 특성을 사용합니다.")
        return ['oil_price', 'cny_krw', 'kospi', 'interest_rate', 'price_index']

    # 최적의 특성 조합 선택 (R-squared 기준)
    best_combo = max(results, key=lambda combo: results[combo]['R-squared'])
    
    print("\n최적의 회귀 특성 조합:", best_combo)
    print("최고 R-squared:", results[best_combo]['R-squared'])
    
    return list(best_combo)

def main(asset_data: pd.DataFrame = None, **legacy_kwargs):
    # ... (기존 데이터 로딩 및 전처리 로직)
    configure_gpu()
    try:
        market_data = load_market_data(f"{juptyer_data_path}/market_data.pkl")
        asset_data = normalize_asset_df(asset_data)
        
        # 모든 market data 컬럼을 포함하여 데이터 병합
        merged_data_all_features, _ = merge_asset_and_market(asset_data, market_data, market_data.columns.tolist())
        
        # find_best_regression_columns 함수를 호출하여 최적의 regression_group을 찾음
        regression_group = find_best_regression_columns(merged_data=merged_data_all_features)
        
        print(f"최종 선택된 회귀 그룹: {regression_group}")
    
        # 이후 LSTM 모델 학습을 위해 선택된 regression_group으로 데이터 다시 병합
        merged_data, model_data = merge_asset_and_market(asset_data, market_data, regression_group)
        
        # Step 2: Feature Engineering (기존 코드와 동일)
        lstm_cols = regression_group + ['id', 'return']
        data_for_lstm = model_data[lstm_cols].copy()
        X_sequences_unscaled, y_sequences_unscaled, sequence_ids = create_sequences_with_ids(
            data=data_for_lstm, seq_len=12, target_column='return', id_column='id'
        )
        
        X_train_unscaled, X_test_unscaled, y_train, y_test = split_sequences_by_id(
            X_sequences_unscaled, y_sequences_unscaled, sequence_ids, test_ratio=0.2
        )
        
        
        # Step 3: Model Training and Saving
        print("\n3. 모델 학습 및 저장...")
        print("   - 데이터 스케일링 시작...")
        feature_scaler = RobustScaler()
        target_scaler = RobustScaler()
        y_train_scaled = target_scaler.fit_transform(y_train.reshape(-1, 1))
        X_train_reshaped = X_train_unscaled.reshape(-1, X_train_unscaled.shape[-1])
        X_train_scaled_reshaped = feature_scaler.fit_transform(X_train_reshaped)
        X_train = X_train_scaled_reshaped.reshape(X_train_unscaled.shape)
        X_test_reshaped = X_test_unscaled.reshape(-1, X_test_unscaled.shape[-1])
        X_test_scaled_reshaped = feature_scaler.transform(X_test_reshaped)
        X_test = X_test_scaled_reshaped.reshape(X_test_unscaled.shape)
        y_test_scaled = target_scaler.transform(y_test.reshape(-1, 1))
        print("   - 데이터 스케일링 완료!")
        
        training_results['feature_scaler'] = feature_scaler
        training_results['target_scaler'] = target_scaler
        training_results['X_train'] = X_train
        training_results['X_test'] = X_test
        training_results['y_train'] = y_train_scaled
        training_results['y_test'] = y_test_scaled
        
        print("   - LSTM 모델 빌드 및 학습...")
        lstm_model = build_advanced_lstm_model(input_shape=(X_train.shape[1], X_train.shape[2]))
        lstm_model.fit(X_train, y_train_scaled, epochs=50, batch_size=32, validation_split=0.1, verbose=1)
        training_results['lstm_model'] = lstm_model
        
        print("   - Prophet 모델 빌드 및 학습...")
        prophet_model = build_conservative_prophet_model()
        prophet_data_train = prophet_data.iloc[:len(y_train)]
        prophet_model.fit(prophet_data_train)
        training_results['prophet_model'] = prophet_model

        # Step 4: Model Evaluation
        print("\n4. 모델 평가...")
        lstm_results = None
        prophet_results = None
        ensemble_results = None
        evaluation_report = ""
        best_model_name = 'LSTM'
        try:
            if training_results.get('lstm_model') and training_results.get('prophet_model'):
                lstm_results = evaluate_lstm_model(model=training_results['lstm_model'], X_test=training_results['X_test'], y_test=training_results['y_test'], target_scaler=training_results['target_scaler'], model_name="LSTM")
                prophet_results = evaluate_prophet_model(model=training_results['prophet_model'], test_dates=model_data.iloc[len(model_data) - len(training_results['y_test']) - sequence_length:].iloc[sequence_length:]['date'], y_test=training_results['y_test'].flatten(), model_name="Prophet")
                ensemble_predictions = create_ensemble_predictions(lstm_results['predictions'], prophet_results['predictions'].reshape(-1, 1))
                ensemble_metrics = evaluate_predictions(training_results['y_test'].flatten(), ensemble_predictions.flatten())
                ensemble_results = {'predictions': ensemble_predictions, 'y_true': training_results['y_test'], 'metrics': ensemble_metrics, 'model_name': 'Ensemble'}
                all_results = [lstm_results, prophet_results, ensemble_results]
                comparison_df = compare_models(all_results)
                best_r2_idx = comparison_df['R²'].idxmax()
                best_model_name = comparison_df.loc[best_r2_idx, 'Model']
                evaluation_report = generate_evaluation_report(all_results)
                print("   - 모델 평가 완료")
        except Exception as e:
            print(f"모델 평가 오류: {e}")

        print("\n   - 모델 저장 시작...")
        data_config = create_data_config(regression_group, sequence_length, model_data)
        models_to_save = {
            'lstm_model': lstm_model, 'prophet_model': prophet_model,
            'feature_scaler': feature_scaler, 'target_scaler': target_scaler
        }
        training_results['data_config'] = data_config
        saved_hash = model_manager.save_models(models_to_save, data_config, best_model_name)
        print(f"   - 모델 저장 완료: {saved_hash}")
        
    except Exception as e:
        print(f"모델 학습/저장 오류: {e}")
        pipeline_status = "failure"
        return {'error': f'Model training or saving failed: {e}'}


        
    # Step 5: Generate Predictions
    print(f"\n5. 전체 {asset_type} 예측 생성...")
    try:
        # 예측에 필요한 모든 객체가 존재하는지 확인
        required_keys = ['feature_scaler', 'target_scaler', 'lstm_model', 'prophet_model', 'data_config']
        if not all(key in training_results for key in required_keys):
            raise KeyError(f"예측에 필요한 모델 또는 스케일러가 없습니다: {required_keys}")
            
        predicted_returns_df = predict_all(
            merged_data=merged_data,
            regression_group=training_results['data_config']['regression_group'],
            sequence_length=sequence_length, 
            training_results=training_results,
            lstm_data=lstm_data,
            id_col='id',
            mode=best_model_name,
            prophet_model=training_results.get('prophet_model'), last_date=model_data['date'].max() if 'date' in model_data.columns else None
        )
        if not predicted_returns_df.empty:
            print(f"   - {len(predicted_returns_df)}개 {asset_type} 예측 완료")
            # update_response = post_predictions(predicted_returns_df)
            # print("수익률 업데이트 요청 결과", update_response)
        else:
            print(f"   - 예측 가능한 {asset_type}가 없습니다")
            raise ValueError(f"예측 결과 DataFrame이 비어 있습니다.")

    except (KeyError, ValueError) as e:
        print(f"**{asset_type} 예측 오류:** {e}")
        predicted_returns_df = pd.DataFrame()
        pipeline_status = "failure"
    except Exception as e:
        print(f"**{asset_type} 예측 오류:** {e}")
        predicted_returns_df = pd.DataFrame()
        pipeline_status = "failure"
        
    # Step 6: FastAPI에 모델 업로드
    # if upload_to_fastapi and saved_hash:
    #     try:
    #         print(f"\n6-2. FastAPI 업로드 시작...")
            
    #         base_path_root = Path(__file__).parent.parent / "saved_models"
    #         asset_base_path = base_path_root / asset_type.lower()
    #         metadata_path = asset_base_path / "metadata" / f"metadata_{saved_hash}.json"
    
    #         if not metadata_path.exists():
    #             print(f"  - 오류: 메타데이터 파일이 존재하지 않습니다: {metadata_path}")
    #             pipeline_status = "failure"
    #         else:
    #             with open(metadata_path, 'r', encoding='utf-8') as f:
    #                 metadata = json.load(f)
                
    #             upload_list = []
    #             upload_list.append(('metadata', metadata_path))
                
    #             if 'files' in metadata:
    #                 for model_type_key, file_info in metadata['files'].items():
    #                     if 'file_name' in file_info and 'relative_path' in file_info:
    #                         file_path = asset_base_path / file_info['relative_path'] / file_info['file_name']
                
    #                         # 💡 수정된 부분: model_type을 더 간결하게 정의
    #                         if 'feature_scaler' in model_type_key:
    #                             simple_model_type = 'feature_scaler'
    #                         elif 'target_scaler' in model_type_key:
    #                             simple_model_type = 'target_scaler'
    #                         else:
    #                             simple_model_type = model_type_key.replace('_model', '')
                            
    #                         upload_list.append((simple_model_type, file_path))

    
    #             upload_url = f"{fastapi_url}/models/upload"
                
    #             for model_type, file_path in upload_list:
    #                 if file_path.exists():
    #                     print(f"  - {model_type} 파일 업로드 시도: {file_path}")
    #                     with open(file_path, 'rb') as f:
    #                         files = {'model_file': (os.path.basename(file_path), f)}
                            
    #                         data = {'model_type': model_type, 'asset_type': asset_type, 'model_hash': saved_hash, 'force_overwrite': force_retrain}
                            
    #                         response = requests.post(upload_url, files=files, data=data, timeout=600)
    #                         if response.status_code == 200:
    #                             print(f"  - {model_type} 업로드 성공: {response.json()}")
    #                         else:
    #                             print(f"  - {model_type} 업로드 실패: {response.status_code}, 응답: {response.text}")
    #                             pipeline_status = "failure"
    #                             break
    #                 else:
    #                     print(f"  - 경고: 파일이 존재하지 않아 업로드를 건너뜁니다: {file_path}")
    #                     pipeline_status = "failure"
    #                     break
    
    #     except requests.exceptions.RequestException as e:
    #         print(f"  - FastAPI 업로드 요청 오류: {e}")
    #         pipeline_status = "failure"
    # elif upload_to_fastapi and not saved_hash:
    #     print("  - 모델 해시가 없어 FastAPI 업로드를 건너뜀")
    
    # Step 7: Compile Results
    results = {
        'evaluation_report': evaluation_report,
        'predicted_returns_df': predicted_returns_df,
        'recommendations': recommendations,
        'recommendation_report': recommendation_report,
        'model_hash': saved_hash,
        'asset_type': asset_type,
        'pipeline_status': pipeline_status
    }

    print("\n" + "=" * 60)
    print("파이프라인 실행 완료!")
    print("=" * 60)
    
    if not predicted_returns_df.empty:
        # 기존 출력 로직...
        print(f"\n상위 5개 예측 수익률:")
        for idx, row in predicted_returns_df.head().iterrows():
            print(f"  {row['name']}: {row['predicted_return']:.4f}")
    
    return results

if __name__ == "__main__":
    print("데이터셋 로딩...")
    etf_data = pd.read_pickle(f"{juptyer_data_path}/etf_data.pkl")
    etf_data = pd.DataFrame(etf_data)
    etf_data.columns = ['date', 'open', 'close', 'return', 'id']
    etf_data['return'] = pd.to_numeric(etf_data['return'], errors='coerce')
    etf_data['date'] = pd.to_datetime(etf_data['date'], errors='coerce')
    
    print("Fund 데이터 로딩...")
    fund_data = pd.read_pickle(f"{juptyer_data_path}/fund_data.pkl")
    fund_data = pd.DataFrame(fund_data)
    fund_data.columns = ['date', 'open', 'close', 'return', 'id']
    fund_data['return'] = pd.to_numeric(fund_data['return'], errors='coerce')
    fund_data['date'] = pd.to_datetime(fund_data['date'], errors='coerce')
    
    print("\n" + "="*60)
    print("ETF 파이프라인 실행")
    print("="*60)
    # etf_results = main(etf_data, ['kospi', 'oil_price', 'interest_rate', 'price_index', 'usd_krw'], asset_type="ETF")
    etf_results = main(etf_data)
    print("\n" + "="*60)
    print("Fund 파이프라인 실행")
    print("="*60)
    # fund_results = main(fund_data, ['kospi', 'oil_price', 'interest_rate', 'cny_krw', 'usd_krw', 'jpy_krw'], asset_type="Fund")
    fund_results = main(fund_data)
    
    print("\n모든 파이프라인 실행 완료!")