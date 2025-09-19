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

# Add the services directory to the path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import specific functions from modules
try:
    from data_loader import load_and_prepare_data
    from feature_engineering import prepare_lstm_data, prepare_prophet_data, validate_sequence_data
    from model_builder import configure_gpu, build_simple_lstm_model, build_conservative_prophet_model, get_model_callbacks
    from model_trainer import train_lstm_with_split, train_prophet_with_validation, create_ensemble_predictions
    from model_evaluator import evaluate_lstm_model, evaluate_prophet_model, evaluate_predictions, compare_models, generate_evaluation_report
    from recommender import recommend_etfs, generate_recommendation_report
    from model_manager import ModelManager, create_data_config, get_data_hash
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback to module imports
    import data_loader
    import feature_engineering
    import model_builder
    import model_trainer
    import model_evaluator
    import recommender
    import model_manager


def main(etf_data: pd.DataFrame, regression_group: List[str], 
         market_data_path: str = "/home/j-j13a103/ai/data/market_data.csv",
         sequence_length: int = 12, user_portfolio: List[str] = None,
         force_retrain: bool = False) -> Dict[str, Any]:
    """
    Main pipeline function that orchestrates the entire workflow.
    
    Args:
        etf_data (pd.DataFrame): ETF/Fund data
        regression_group (List[str]): List of feature columns to use
        market_data_path (str): Path to market data file
        sequence_length (int): Sequence length for LSTM
        user_portfolio (List[str], optional): User's current portfolio
        force_retrain (bool): Force retraining even if models exist
    
    Returns:
        Dict[str, Any]: Complete results including models, predictions, and recommendations
    """
    print("=" * 60)
    print("ETF/Fund 예측 및 추천 시스템 시작")
    print("=" * 60)
    
    # Configure GPU
    configure_gpu()
    
    # Initialize model manager
    model_manager = ModelManager()
    
    # Step 1: Data Loading and Preparation
    print("\n1. 데이터 로딩 및 전처리...")
    try:
        # Load market data
        market_data = pd.read_csv(market_data_path, encoding='utf-8')
        market_data.columns = ['date', 'kospi', 'oil_price', 'interest_rate', 'price_index', 'cny_krw', 'usd_krw', 'jpy_krw']
        market_data['date'] = pd.to_datetime(market_data['date'], errors='coerce')
        
        # Merge ETF and market data
        etf_data['date'] = pd.to_datetime(etf_data['date'], errors='coerce')
        merged_data = pd.merge(etf_data, market_data, on='date', how='inner')
        
        # Select relevant columns
        base_columns = ['date', 'return']
        if 'id' in etf_data.columns:
            base_columns.append('id')
        
        model_data = merged_data[base_columns + regression_group].dropna()
        
        print(f"   - 병합된 데이터 크기: {model_data.shape}")
        print(f"   - 사용 특성: {regression_group}")
        
    except Exception as e:
        print(f"데이터 로딩 오류: {e}")
        return {'error': f'Data loading failed: {e}'}
    
    # Step 2: Feature Engineering
    print("\n2. 특성 엔지니어링...")
    try:
        # Prepare LSTM data
        lstm_data = prepare_lstm_data(
            data=model_data,
            feature_columns=regression_group,
            target_column='return',
            seq_len=sequence_length
        )
        
        # Validate sequence data
        if not validate_sequence_data(lstm_data['X_sequences'], lstm_data['y_sequences']):
            # Try with reduced sequence length
            sequence_length = max(3, len(model_data) // 4)
            print(f"   - 시퀀스 길이를 {sequence_length}로 조정")
            
            lstm_data = prepare_lstm_data(
                data=model_data,
                feature_columns=regression_group,
                target_column='return',
                seq_len=sequence_length
            )
        
        # Prepare Prophet data
        prophet_data = prepare_prophet_data(model_data, 'date', 'return')
        
        print(f"   - LSTM 시퀀스 형태: {lstm_data['X_sequences'].shape}")
        print(f"   - Prophet 데이터 크기: {prophet_data.shape}")
        
    except Exception as e:
        print(f"특성 엔지니어링 오류: {e}")
        return {'error': f'Feature engineering failed: {e}'}
    
    # Step 3: Model Training or Loading
    print("\n3. 모델 확인 및 학습...")
    try:
        # Create data configuration for model identification
        data_hash = get_data_hash(model_data)
        data_config = create_data_config(
            regression_group=regression_group,
            sequence_length=sequence_length,
            data_shape=lstm_data['X_sequences'].shape,
            data_hash=data_hash
        )
        
        # Check if model already exists
        model_exists, model_hash = model_manager.model_exists(data_config)
        
        if model_exists and not force_retrain:
            print(f"   - 기존 학습된 모델 발견: {model_hash}")
            print("   - 저장된 모델을 로딩합니다...")
            
            # Load existing models
            loaded_models = model_manager.load_models(model_hash)
            
            if loaded_models:
                # Use loaded models
                lstm_model = loaded_models.get('lstm_model')
                prophet_model = loaded_models.get('prophet_model')
                feature_scaler = loaded_models.get('feature_scaler', lstm_data['feature_scaler'])
                target_scaler = loaded_models.get('target_scaler', lstm_data['target_scaler'])
                
                # Create test split for evaluation
                from sklearn.model_selection import train_test_split
                X_train, X_test, y_train, y_test = train_test_split(
                    lstm_data['X_sequences'], lstm_data['y_sequences'],
                    test_size=0.2, random_state=42
                )
                
                training_results = {
                    'lstm_model': lstm_model,
                    'prophet_model': prophet_model,
                    'X_train': X_train,
                    'X_test': X_test,
                    'y_train': y_train,
                    'y_test': y_test,
                    'feature_scaler': feature_scaler,
                    'target_scaler': target_scaler,
                    'model_hash': model_hash,
                    'loaded_from_cache': True
                }
                
                print("   - 모델 로딩 완료!")
            else:
                print("   - 모델 로딩 실패, 새로 학습합니다...")
                force_retrain = True
        
        if not model_exists or force_retrain:
            if force_retrain:
                print("   - 강제 재학습 모드")
            else:
                print("   - 새로운 데이터 구성, 모델을 새로 학습합니다...")
            
            # Build and train LSTM model
            input_shape = (lstm_data['X_sequences'].shape[1], lstm_data['X_sequences'].shape[2])
            lstm_model = build_simple_lstm_model(input_shape)
            
            callbacks = get_model_callbacks()
            
            lstm_history, X_train, X_test, y_train, y_test = train_lstm_with_split(
                lstm_model, lstm_data['X_sequences'], lstm_data['y_sequences'],
                test_size=0.2, epochs=50, batch_size=32, callbacks=callbacks
            )
            
            # Build and train Prophet model
            prophet_model = build_conservative_prophet_model()
            trained_prophet, train_df, val_df = train_prophet_with_validation(
                prophet_model, prophet_data
            )
            
            training_results = {
                'lstm_model': lstm_model,
                'lstm_history': lstm_history,
                'X_train': X_train,
                'X_test': X_test,
                'y_train': y_train,
                'y_test': y_test,
                'prophet_model': trained_prophet,
                'prophet_train_data': train_df,
                'prophet_val_data': val_df,
                'feature_scaler': lstm_data['feature_scaler'],
                'target_scaler': lstm_data['target_scaler'],
                'loaded_from_cache': False
            }
            
            # Save the trained models
            models_to_save = {
                'lstm_model': lstm_model,
                'prophet_model': trained_prophet,
                'feature_scaler': lstm_data['feature_scaler'],
                'target_scaler': lstm_data['target_scaler']
            }
            
            saved_hash = model_manager.save_models(models_to_save, data_config)
            training_results['model_hash'] = saved_hash
            
            print("   - LSTM 모델 학습 완료")
            print("   - Prophet 모델 학습 완료")
            print(f"   - 모델 저장 완료: {saved_hash}")
        
        if not training_results:
            return {'error': 'Model training/loading failed'}
        
    except Exception as e:
        print(f"모델 학습/로딩 오류: {e}")
        return {'error': f'Model training/loading failed: {e}'}
    
    # Step 4: Model Evaluation
    print("\n4. 모델 평가...")
    try:
        # Evaluate LSTM
        lstm_results = evaluate_lstm_model(
            model=training_results['lstm_model'],
            X_test=training_results['X_test'],
            y_test=training_results['y_test'],
            target_scaler=training_results['target_scaler'],
            model_name="LSTM"
        )
        
        # Evaluate Prophet
        test_dates = model_data.iloc[len(model_data) - len(training_results['y_test']) - sequence_length:].iloc[sequence_length:]['date']
        
        prophet_results = evaluate_prophet_model(
            model=training_results['prophet_model'],
            test_dates=test_dates,
            y_test=training_results['y_test'].flatten(),
            model_name="Prophet"
        )
        
        # Create ensemble predictions
        ensemble_predictions = create_ensemble_predictions(
            lstm_results['predictions'],
            prophet_results['predictions'].reshape(-1, 1)
        )
        
        # Evaluate ensemble
        ensemble_metrics = evaluate_predictions(
            training_results['y_test'].flatten(),
            ensemble_predictions.flatten()
        )
        
        ensemble_results = {
            'predictions': ensemble_predictions,
            'y_true': training_results['y_test'],
            'metrics': ensemble_metrics,
            'model_name': 'Ensemble'
        }
        
        # Compare all models
        all_results = [lstm_results, prophet_results, ensemble_results]
        comparison_df = compare_models(all_results)
        
        # Generate evaluation report
        evaluation_report = generate_evaluation_report(all_results)
        
    except Exception as e:
        print(f"모델 평가 오류: {e}")
        lstm_results = prophet_results = ensemble_results = None
        comparison_df = evaluation_report = None
    
    # Step 5: Generate Predictions for All ETFs
    print("\n5. 전체 ETF 예측 생성...")
    try:
        predicted_returns = []
        
        # Group by ETF ID prefix
        if 'etf_id_prefix' not in merged_data.columns:
            merged_data['etf_id_prefix'] = merged_data['id'].apply(
                lambda x: str(x).split('_')[0] if '_' in str(x) else str(x)
            )
        
        grouped_etf_data = merged_data.groupby('etf_id_prefix')
        
        for etf_id_prefix, etf_specific_data in grouped_etf_data:
            etf_specific_data = etf_specific_data.sort_values(by='date').dropna().copy()
            
            if len(etf_specific_data) < sequence_length:
                continue
            
            # Scale features for prediction (use DataFrame to maintain feature names)
            scaled_features = lstm_data['feature_scaler'].transform(
                etf_specific_data[regression_group]
            )
            scaled_target = lstm_data['target_scaler'].transform(
                etf_specific_data[['return']]
            )
            
            # Combine and create sequence
            scaled_combined = np.hstack((scaled_features, scaled_target))
            last_sequence = scaled_combined[-sequence_length:].reshape(
                1, sequence_length, scaled_combined.shape[1]
            )
            
            # Predict
            predicted_scaled = training_results['lstm_model'].predict(last_sequence, verbose=0)
            predicted_return = lstm_data['target_scaler'].inverse_transform(predicted_scaled)[0][0]
            
            # Store result
            etf_info = {'id': etf_id_prefix}
            
            predicted_returns.append({
                'id': etf_id_prefix,
                'predicted_return': predicted_return
            })
        
        predicted_returns_df = pd.DataFrame(predicted_returns)
        if not predicted_returns_df.empty:
            predicted_returns_df = predicted_returns_df.sort_values('predicted_return', ascending=False)
            print(f"   - {len(predicted_returns_df)}개 ETF 예측 완료")
        else:
            print("   - 예측 가능한 ETF가 없습니다")
        
    except Exception as e:
        print(f"ETF 예측 오류: {e}")
        predicted_returns_df = pd.DataFrame()
    
    # Step 6: Generate Recommendations
    print("\n6. 추천 생성...")
    try:
        if user_portfolio is None:
            user_portfolio = ['001', '005', '010']  # Default portfolio
        
        if not predicted_returns_df.empty:
            recommendations = recommend_etfs(
                user_portfolio=user_portfolio,
                predicted_returns_df=predicted_returns_df,
                num_recommendations=5
            )
            
            # Generate recommendation report
            recommendation_report = generate_recommendation_report(
                user_portfolio=user_portfolio,
                recommendations=recommendations
            )
            
            print(f"   - {len(recommendations)}개 상품 추천 완료")
        else:
            recommendations = pd.DataFrame()
            recommendation_report = "추천할 상품이 없습니다."
        
    except Exception as e:
        print(f"추천 생성 오류: {e}")
        recommendations = pd.DataFrame()
        recommendation_report = f"추천 생성 실패: {e}"
    
    # Step 7: Compile Results
    print("\n7. 결과 정리...")
    results = {
        'data': {
            'merged_data': merged_data,
            'model_data': model_data,
            'lstm_data': lstm_data,
            'prophet_data': prophet_data
        },
        'models': {
            'lstm_model': training_results.get('lstm_model'),
            'prophet_model': training_results.get('prophet_model'),
            'training_results': training_results
        },
        'evaluation': {
            'lstm_results': lstm_results,
            'prophet_results': prophet_results,
            'ensemble_results': ensemble_results,
            'comparison_df': comparison_df,
            'evaluation_report': evaluation_report
        },
        'predictions': {
            'predicted_returns_df': predicted_returns_df,
            'recommendations': recommendations,
            'recommendation_report': recommendation_report
        },
        'config': {
            'regression_group': regression_group,
            'sequence_length': sequence_length,
            'user_portfolio': user_portfolio
        }
    }
    
    print("\n" + "=" * 60)
    print("파이프라인 실행 완료!")
    print("=" * 60)
    
    # Print summary
    if not predicted_returns_df.empty:
        print(f"\n상위 5개 예측 수익률:")
        for idx, row in predicted_returns_df.head().iterrows():
            print(f"  {row['id']}: {row['predicted_return']:.4f}")
    
    if not recommendations.empty:
        print(f"\n추천 상품:")
        for idx, row in recommendations.iterrows():
            print(f"  {row['id']}: {row['predicted_return']:.4f}")
    
    return results


def run_etf_pipeline(etf_data_path: str, market_data_path: str, 
                    regression_group: List[str], **kwargs) -> Dict[str, Any]:
    """
    Run the complete ETF prediction pipeline from file paths.
    
    Args:
        etf_data_path (str): Path to ETF data file
        market_data_path (str): Path to market data file
        regression_group (List[str]): Feature columns to use
        **kwargs: Additional parameters for main function
    
    Returns:
        Dict[str, Any]: Pipeline results
    """
    # Load ETF data
    if etf_data_path.endswith('.pkl'):
        etf_data = pd.read_pickle(etf_data_path)
        etf_data = pd.DataFrame(etf_data)
        etf_data.columns = ['date', 'open', 'close', 'return', 'id']
    else:
        etf_data = pd.read_csv(etf_data_path, encoding='utf-8')
    
    # Convert data types
    etf_data['return'] = pd.to_numeric(etf_data['return'], errors='coerce')
    etf_data['date'] = pd.to_datetime(etf_data['date'], errors='coerce')
    
    return main(etf_data, regression_group, market_data_path, **kwargs)


if __name__ == "__main__":
    # Default paths (adjust as needed)
    market_data_path = r"C:\Users\SSAFY\Desktop\ssafy\new\S13P21A103\ai\data\market_data.csv"
    etf_data_path = r"C:\Users\SSAFY\Desktop\ssafy\new\S13P21A103\ai\data\etf_data.pkl"
    fund_data_path = r"C:\Users\SSAFY\Desktop\ssafy\new\S13P21A103\ai\data\fund_data.pkl"
    
    # Load data
    print("ETF 데이터 로딩...")
    etf_data = pd.read_pickle(etf_data_path)
    etf_data = pd.DataFrame(etf_data)
    etf_data.columns = ['date', 'open', 'close', 'return', 'id']
    etf_data['return'] = pd.to_numeric(etf_data['return'], errors='coerce')
    etf_data['date'] = pd.to_datetime(etf_data['date'], errors='coerce')
    
    print("Fund 데이터 로딩...")
    fund_data = pd.read_pickle(fund_data_path)
    fund_data = pd.DataFrame(fund_data)
    fund_data.columns = ['date', 'open', 'close', 'return', 'id']
    fund_data['return'] = pd.to_numeric(fund_data['return'], errors='coerce')
    fund_data['date'] = pd.to_datetime(fund_data['date'], errors='coerce')
    
    # Run pipelines
    print("\n" + "="*60)
    print("ETF 파이프라인 실행")
    print("="*60)
    etf_results = main(etf_data, ['kospi', 'oil_price', 'price_index', 'cny_krw'], market_data_path)
    
    print("\n" + "="*60)
    print("Fund 파이프라인 실행")
    print("="*60)
    fund_results = main(fund_data, ['kospi', 'oil_price', 'price_index'], market_data_path)
    
    print("\n모든 파이프라인 실행 완료!")
