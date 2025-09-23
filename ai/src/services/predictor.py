import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from .model_loader import model_loader
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    """예측 서비스 클래스"""
    
    def __init__(self):
        self.model_loader = model_loader
    
    def predict_lstm(self, etf_code: str, input_data: np.ndarray, model_version: str = "latest") -> Optional[Dict]:
        """LSTM 모델을 사용한 예측"""
        try:
            model_key = f"lstm_{etf_code}_{model_version}"
            scaler_key = f"lstm_{etf_code}_{model_version}"
            
            # 모델 로드 (캐시된 모델이 없으면 로드)
            model = self.model_loader.get_model(model_key)
            if model is None:
                model = self.model_loader.load_lstm_model(etf_code, model_version)
                if model is None:
                    return None
            
            # 스케일러 로드
            scaler = self.model_loader.get_scaler(scaler_key)
            
            # 데이터 전처리
            if scaler:
                input_scaled = scaler.transform(input_data)
            else:
                input_scaled = input_data
            
            # 예측 수행
            prediction = model.predict(input_scaled)
            
            # 역정규화
            if scaler:
                # 스케일러의 feature 수에 맞춰 패딩
                n_features = scaler.n_features_in_
                padded_pred = np.zeros((prediction.shape[0], n_features))
                padded_pred[:, 0] = prediction.flatten()  # 첫 번째 feature가 target이라고 가정
                prediction_denorm = scaler.inverse_transform(padded_pred)[:, 0]
            else:
                prediction_denorm = prediction.flatten()
            
            return {
                "prediction": prediction_denorm.tolist(),
                "model_type": "lstm",
                "model_version": model_version,
                "confidence": self._calculate_confidence(prediction)
            }
            
        except Exception as e:
            logger.error(f"LSTM 예측 실패: {e}")
            return None
    
    def predict_prophet(self, etf_code: str, future_periods: int = 30, model_version: str = "latest") -> Optional[Dict]:
        """Prophet 모델을 사용한 예측"""
        try:
            model_key = f"prophet_{etf_code}_{model_version}"
            
            # 모델 로드
            model = self.model_loader.get_model(model_key)
            if model is None:
                model = self.model_loader.load_prophet_model(etf_code, model_version)
                if model is None:
                    return None
            
            # 미래 데이터프레임 생성
            future = model.make_future_dataframe(periods=future_periods, freq='M')
            
            # 예측 수행
            forecast = model.predict(future)
            
            # 결과 추출 (마지막 future_periods 개만)
            future_forecast = forecast.tail(future_periods)
            
            return {
                "prediction": future_forecast['yhat'].tolist(),
                "upper_bound": future_forecast['yhat_upper'].tolist(),
                "lower_bound": future_forecast['yhat_lower'].tolist(),
                "dates": future_forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
                "model_type": "prophet",
                "model_version": model_version
            }
            
        except Exception as e:
            logger.error(f"Prophet 예측 실패: {e}")
            return None
    
    def predict_ensemble(self, etf_code: str, input_data: np.ndarray, future_periods: int = 30, 
                        ensemble_version: str = "latest") -> Optional[Dict]:
        """앙상블 예측"""
        try:
            # 앙상블 설정 로드
            ensemble_config = self.model_loader.load_ensemble_config(ensemble_version)
            if ensemble_config is None:
                return None
            
            predictions = {}
            weights = ensemble_config.get('weights', {'lstm': 0.6, 'prophet': 0.4})
            
            # LSTM 예측
            lstm_pred = self.predict_lstm(etf_code, input_data)
            if lstm_pred:
                predictions['lstm'] = lstm_pred['prediction']
            
            # Prophet 예측
            prophet_pred = self.predict_prophet(etf_code, future_periods)
            if prophet_pred:
                predictions['prophet'] = prophet_pred['prediction']
            
            # 앙상블 결합
            if len(predictions) == 0:
                return None
            
            # 가중 평균 계산
            ensemble_result = self._weighted_ensemble(predictions, weights)
            
            return {
                "prediction": ensemble_result,
                "individual_predictions": predictions,
                "weights": weights,
                "model_type": "ensemble",
                "model_version": ensemble_version
            }
            
        except Exception as e:
            logger.error(f"앙상블 예측 실패: {e}")
            return None
    
    def _weighted_ensemble(self, predictions: Dict, weights: Dict) -> List[float]:
        """가중 앙상블 계산"""
        try:
            # 모든 예측의 길이를 맞춤
            min_length = min(len(pred) for pred in predictions.values())
            
            ensemble_pred = np.zeros(min_length)
            total_weight = 0
            
            for model_type, pred in predictions.items():
                weight = weights.get(model_type, 1.0)
                ensemble_pred += np.array(pred[:min_length]) * weight
                total_weight += weight
            
            if total_weight > 0:
                ensemble_pred /= total_weight
            
            return ensemble_pred.tolist()
            
        except Exception as e:
            logger.error(f"앙상블 계산 실패: {e}")
            return []
            
    def predict_best(etf_code: str, input_data: np.ndarray, future_periods: int, meta: dict) -> Optional[Dict]:
        model_name = meta['model_info']['best_model_name']

        input_data=np.array([[1, 2, 3, 4, 5]] * 12),
        future_periods=12,

        if model_name == "lstm":
            return prediction_service.predict_lstm(etf_code, input_data=input_data)
        elif model_name == "prophet":
            return prediction_service.predict_prophet(etf_code, future_periods)
        elif model_name == "ensemble":
            return prediction_service.predict_ensemble(etf_code, input_data=input_data, future_periods=future_periods)
        else:
            return None  # 정의되지 않은 경우

    def _calculate_confidence(self, prediction: np.ndarray) -> float:
        """예측 신뢰도 계산 (간단한 버전)"""
        try:
            # 예측값의 분산을 기반으로 신뢰도 계산
            variance = np.var(prediction)
            confidence = max(0.0, min(1.0, 1.0 - variance / 100.0))
            return float(confidence)
        except:
            return 0.5  # 기본값

# 전역 예측 서비스 인스턴스
prediction_service = PredictionService()
