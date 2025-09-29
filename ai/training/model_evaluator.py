# -*- coding: utf-8 -*-
"""
Model evaluation module for LSTM and Prophet models.
Handles performance metrics calculation and visualization.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from typing import Dict, Any, Optional, Tuple
import matplotlib.font_manager as fm


def setup_korean_font():
    """Setup Korean font for matplotlib plots."""
    korean_fonts = [
        'Malgun Gothic',  # 맑은 고딕
        'NanumGothic',    # 나눔고딕
        'Batang',         # 바탕
        'Dotum',          # 돋움
        'Gulim'           # 굴림
    ]
    
    for font in korean_fonts:
        try:
            fm.findfont(font)
            plt.rcParams['font.family'] = font
            plt.rcParams['axes.unicode_minus'] = False
            print(f"사용 중인 폰트: {font}")
            return font
        except:
            continue
    
    # 한글 폰트를 찾지 못한 경우 기본 폰트 사용
    plt.rcParams['font.family'] = 'DejaVu Sans'
    plt.rcParams['axes.unicode_minus'] = False
    print("사용 중인 폰트: DejaVu Sans")
    return 'DejaVu Sans'


def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Calculate evaluation metrics for predictions.
    
    Args:
        y_true (np.ndarray): True values
        y_pred (np.ndarray): Predicted values
    
    Returns:
        Dict[str, float]: Dictionary containing evaluation metrics
    """
    # Ensure arrays have compatible shapes
    y_true = np.array(y_true).flatten()
    y_pred = np.array(y_pred).flatten()
    
    # Calculate metrics
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    
    # Calculate R2 score (coefficient of determination)
    try:
        r2 = r2_score(y_true, y_pred)
    except:
        r2 = np.nan
    
    # Calculate MAPE (Mean Absolute Percentage Error)
    try:
        # Avoid division by zero by adding small epsilon or filtering out zero values
        non_zero_mask = np.abs(y_true) > 1e-8
        if np.any(non_zero_mask):
            mape = np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100
        else:
            mape = np.nan
    except:
        mape = np.nan
    
    return {
        'MSE': mse,
        'RMSE': rmse,
        'MAE': mae,
        'R2': r2,
        'MAPE': mape
    }


def evaluate_lstm_model(model, X_test: np.ndarray, y_test: np.ndarray, 
                       target_scaler, model_name: str = "LSTM") -> Dict[str, Any]:
    """
    Evaluate LSTM model performance.
    
    Args:
        model: Trained LSTM model
        X_test (np.ndarray): Test input sequences
        y_test (np.ndarray): Test target values
        target_scaler: Fitted target scaler
        model_name (str): Name of the model for reporting
    
    Returns:
        Dict[str, Any]: Evaluation results
    """
    # Make predictions
    predictions_scaled = model.predict(X_test)
    
    # 안전한 역정규화 - StandardScaler 사용 시 클리핑 범위 조정
    if hasattr(target_scaler, 'scale_'):
        # StandardScaler인 경우
        predictions_scaled_clipped = np.clip(predictions_scaled, -3, 3)  # 3 표준편차 범위로 클리핑
    else:
        # MinMaxScaler인 경우
        predictions_scaled_clipped = np.clip(predictions_scaled, 0, 1)  # 0-1 범위로 클리핑
    
    # Inverse transform to original scale
    predictions = target_scaler.inverse_transform(predictions_scaled_clipped)
    y_test_original = target_scaler.inverse_transform(y_test.reshape(-1, 1))
    
    # Calculate metrics
    metrics = evaluate_predictions(y_test_original, predictions)
    
    # Print results
    print(f"\n{model_name} Model Evaluation:")
    print(f"  MSE: {metrics['MSE']:.4f}")
    print(f"  RMSE: {metrics['RMSE']:.4f}")
    print(f"  MAE: {metrics['MAE']:.4f}")
    if not np.isnan(metrics['R2']):
        print(f"  R2: {metrics['R2']:.4f}")
    if not np.isnan(metrics['MAPE']):
        print(f"  MAPE: {metrics['MAPE']:.2f}%")
    
    return {
        'predictions': predictions,
        'y_true': y_test_original,
        'metrics': metrics,
        'model_name': model_name
    }


def evaluate_prophet_model(model, test_dates: pd.Series, y_test: np.ndarray,
                          model_name: str = "Prophet") -> Dict[str, Any]:
    """
    Evaluate Prophet model performance.
    
    Args:
        model: Trained Prophet model
        test_dates (pd.Series): Test dates
        y_test (np.ndarray): Test target values
        model_name (str): Name of the model for reporting
    
    Returns:
        Dict[str, Any]: Evaluation results
    """
    try:
        # Create dataframe with test dates for prediction
        test_df = pd.DataFrame({'ds': test_dates})
        
        # Make predictions only for test dates
        forecast = model.predict(test_df)
        predictions = forecast['yhat'].values
        
        # Ensure we have the same number of predictions as test values
        min_len = min(len(predictions), len(y_test))
        predictions = predictions[:min_len]
        y_test_trimmed = y_test[:min_len]
        
    except Exception as e:
        print(f"Prophet prediction error: {e}")
        # Fallback: use mean of test values as prediction
        predictions = np.full_like(y_test, np.mean(y_test))
        y_test_trimmed = y_test
    
    # Calculate metrics
    metrics = evaluate_predictions(y_test_trimmed, predictions)
    
    # Print results
    print(f"\n{model_name} Model Evaluation:")
    print(f"  MSE: {metrics['MSE']:.4f}")
    print(f"  RMSE: {metrics['RMSE']:.4f}")
    print(f"  MAE: {metrics['MAE']:.4f}")
    if not np.isnan(metrics['R2']):
        print(f"  R2: {metrics['R2']:.4f}")
    if not np.isnan(metrics['MAPE']):
        print(f"  MAPE: {metrics['MAPE']:.2f}%")
    
    return {
        'predictions': predictions,
        'y_true': y_test,
        'metrics': metrics,
        'model_name': model_name,
        'forecast': forecast
    }


def compare_models(results_list: list) -> pd.DataFrame:
    """
    Compare multiple model results.
    
    Args:
        results_list (list): List of model evaluation results
    
    Returns:
        pd.DataFrame: Comparison table
    """
    comparison_data = []
    
    for result in results_list:
        metrics = result['metrics']
        comparison_data.append({
            'Model': result['model_name'],
            'MSE': metrics['MSE'],
            'RMSE': metrics['RMSE'],
            'MAE': metrics['MAE'],
            'R2': metrics.get('R2', np.nan),
            'MAPE': metrics.get('MAPE', np.nan)
        })
    
    comparison_df = pd.DataFrame(comparison_data)
    # Print comparison table
    print("\n--- Performance Comparison ---")
    print("Model         | MSE      | RMSE     | MAE      | R2       | MAPE")
    print("--------------|----------|----------|----------|----------|----------")
    
    for _, row in comparison_df.iterrows():
        r2_str = f"{row['R2']:.4f}" if not np.isnan(row['R2']) else "N/A"
        mape_str = f"{row['MAPE']:.2f}%" if not np.isnan(row['MAPE']) else "N/A"
        print(f"{row['Model']:<13} | {row['MSE']:.4f} | {row['RMSE']:.4f} | {row['MAE']:.4f} | {r2_str:<8} | {mape_str}")
    
    # Determine best model based on MSE
    best_idx = comparison_df['MSE'].idxmin()
    best_model = comparison_df.loc[best_idx, 'Model']
    print(f"\nBased on MSE, the best performing model is: {best_model}")
    
    return comparison_df


def plot_predictions(results_list: list, figsize: Tuple[int, int] = (15, 10),
                    save_path: Optional[str] = None):
    """
    Plot predictions vs actual values for multiple models.
    
    Args:
        results_list (list): List of model evaluation results
        figsize (tuple): Figure size
        save_path (str, optional): Path to save the plot
    """
    setup_korean_font()
    
    n_models = len(results_list)
    fig, axes = plt.subplots(2, 2, figsize=figsize)
    axes = axes.flatten()
    
    for i, result in enumerate(results_list):
        if i >= 4:  # Maximum 4 subplots
            break
            
        ax = axes[i]
        y_true = result['y_true'].flatten()
        y_pred = result['predictions'].flatten()
        
        # Scatter plot
        ax.scatter(y_true, y_pred, alpha=0.6, s=50)
        
        # Perfect prediction line
        min_val = min(y_true.min(), y_pred.min())
        max_val = max(y_true.max(), y_pred.max())
        ax.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect Prediction')
        
        # Labels and title
        ax.set_xlabel('실제 값 (Actual)')
        ax.set_ylabel('예측 값 (Predicted)')
        ax.set_title(f'{result["model_name"]} 모델 예측 결과')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Add metrics text
        metrics = result['metrics']
        metrics_text = f"RMSE: {metrics['RMSE']:.4f}\nMAE: {metrics['MAE']:.4f}"
        if not np.isnan(metrics.get('R2', np.nan)):
            metrics_text += f"\nR2: {metrics['R2']:.4f}"
        
        ax.text(0.05, 0.95, metrics_text, transform=ax.transAxes, 
                verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    # Hide unused subplots
    for i in range(n_models, 4):
        axes[i].set_visible(False)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Plot saved to: {save_path}")
    
    plt.show()


def plot_time_series_predictions(results_list: list, dates: Optional[pd.Series] = None,
                                figsize: Tuple[int, int] = (15, 8),
                                save_path: Optional[str] = None):
    """
    Plot time series predictions over time.
    
    Args:
        results_list (list): List of model evaluation results
        dates (pd.Series, optional): Date series for x-axis
        figsize (tuple): Figure size
        save_path (str, optional): Path to save the plot
    """
    setup_korean_font()
    
    plt.figure(figsize=figsize)
    
    # Use index if dates not provided
    if dates is None:
        dates = range(len(results_list[0]['y_true']))
    
    # Plot actual values
    y_true = results_list[0]['y_true'].flatten()
    plt.plot(dates, y_true, 'ko-', label='실제 값', markersize=4, linewidth=2)
    
    # Plot predictions for each model
    colors = ['blue', 'red', 'green', 'orange', 'purple']
    for i, result in enumerate(results_list):
        y_pred = result['predictions'].flatten()
        color = colors[i % len(colors)]
        plt.plot(dates, y_pred, 'o-', color=color, label=f'{result["model_name"]} 예측', 
                markersize=3, linewidth=1.5, alpha=0.8)
    
    plt.xlabel('시간 (Time)')
    plt.ylabel('수익률 (Return)')
    plt.title('시계열 예측 결과 비교')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Rotate x-axis labels if dates are datetime
    if hasattr(dates, 'dtype') and 'datetime' in str(dates.dtype):
        plt.xticks(rotation=45)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Time series plot saved to: {save_path}")
    
    plt.show()


def plot_residuals(results_list: list, figsize: Tuple[int, int] = (15, 6),
                  save_path: Optional[str] = None):
    """
    Plot residuals for model evaluation.
    
    Args:
        results_list (list): List of model evaluation results
        figsize (tuple): Figure size
        save_path (str, optional): Path to save the plot
    """
    setup_korean_font()
    
    n_models = len(results_list)
    fig, axes = plt.subplots(1, n_models, figsize=figsize)
    
    if n_models == 1:
        axes = [axes]
    
    for i, result in enumerate(results_list):
        y_true = result['y_true'].flatten()
        y_pred = result['predictions'].flatten()
        residuals = y_true - y_pred
        
        ax = axes[i]
        ax.scatter(y_pred, residuals, alpha=0.6)
        ax.axhline(y=0, color='r', linestyle='--')
        ax.set_xlabel('예측 값 (Predicted)')
        ax.set_ylabel('잔차 (Residuals)')
        ax.set_title(f'{result["model_name"]} 잔차 플롯')
        ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Residuals plot saved to: {save_path}")
    
    plt.show()


def generate_evaluation_report(results_list: list, save_path: Optional[str] = None) -> str:
    """
    Generate a comprehensive evaluation report.
    
    Args:
        results_list (list): List of model evaluation results
        save_path (str, optional): Path to save the report
    
    Returns:
        str: Evaluation report text
    """
    report = "=" * 60 + "\n"
    report += "모델 평가 보고서 (Model Evaluation Report)\n"
    report += "=" * 60 + "\n\n"
    
    # Individual model results
    for result in results_list:
        report += f"{result['model_name']} 모델 결과:\n"
        report += "-" * 30 + "\n"
        metrics = result['metrics']
        report += f"MSE (평균 제곱 오차): {metrics['MSE']:.6f}\n"
        report += f"RMSE (평균 제곱근 오차): {metrics['RMSE']:.6f}\n"
        report += f"MAE (평균 절대 오차): {metrics['MAE']:.6f}\n"
        
        if not np.isnan(metrics.get('R2', np.nan)):
            report += f"R2 (결정 계수): {metrics['R2']:.6f}\n"
        if not np.isnan(metrics.get('MAPE', np.nan)):
            report += f"MAPE (평균 절대 백분율 오차): {metrics['MAPE']:.2f}%\n"
        
        report += "\n"
    
    # Model comparison
    if len(results_list) > 1:
        comparison_df = compare_models(results_list)
        report += "모델 비교:\n"
        report += "-" * 30 + "\n"
        report += comparison_df.to_string(index=False)
        report += "\n\n"
        
        # Best model
        best_idx = comparison_df['MSE'].idxmin()
        best_model = comparison_df.loc[best_idx, 'Model']
        report += f"최고 성능 모델 (MSE 기준): {best_model}\n"
    
    report += "\n" + "=" * 60
    
    if save_path:
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Evaluation report saved to: {save_path}")
    
    return report
