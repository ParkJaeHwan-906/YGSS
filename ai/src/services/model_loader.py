import os
import pickle
import joblib
from typing import Dict, Any, Optional
from config.settings import settings
import logging

# TensorFlow를 선택적으로 import
try:
    import tensorflow as tf
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False
    tf = None

logger = logging.getLogger(__name__)

class ModelLoader:
    """모델 로딩 및 관리 클래스"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_base_path = settings.MODEL_BASE_PATH
        
    def _resolve_latest_file(self, directory: str, prefix: str, extension: str, version: str) -> Optional[str]:
        """버전이 명시되지 않았거나(=latest) 정확한 파일이 없을 때, 접두사와 확장자로 최신 파일을 찾는다.
        지원 패턴:
        - 정확 버전: prefix_version.ext
        - 무버전: prefix.ext
        - 타임스탬프/기타 버전: prefix_*.ext
        """
        try:
            if not os.path.isdir(directory):
                return None
            # 정확한 버전 파일 우선
            if version and version != "latest":
                exact = os.path.join(directory, f"{prefix}_{version}{extension}")
                if os.path.exists(exact):
                    return exact
            # 최신 파일 탐색 (timestamp 유/무 모두 허용)
            candidates = []
            for f in os.listdir(directory):
                if not f.endswith(extension):
                    continue
                if f == f"{prefix}{extension}" or f.startswith(f"{prefix}_"):
                    candidates.append(os.path.join(directory, f))
            if not candidates:
                return None
            latest = max(candidates, key=lambda p: os.path.getmtime(p))
            return latest
        except Exception as e:
            logger.error(f"최신 파일 해석 실패: {e}")
            return None
        
    def load_lstm_model(self, model_name: str, version: str = "latest") -> Optional[Any]:
        """LSTM 모델 로드"""
        try:
            lstm_dir = os.path.join(self.model_base_path, "lstm_models")
            model_path = self._resolve_latest_file(lstm_dir, model_name, ".h5", version)
            if model_path is None:
                logger.error(f"LSTM 모델 파일을 찾을 수 없습니다: 디렉토리={lstm_dir}, prefix={model_name}, version={version}")
                return None
                
            # 모델 로드
            if not HAS_TENSORFLOW:
                logger.error("TensorFlow가 설치되지 않아 LSTM 모델을 로드할 수 없습니다")
                return None
            
            model = tf.keras.models.load_model(model_path)
            # 캐시 키는 실제 로드된 파일명 기준으로 보정
            loaded_version = os.path.splitext(os.path.basename(model_path))[0].replace(f"{model_name}_", "")
            self.models[f"lstm_{model_name}_{loaded_version}"] = model
            
            # 스케일러 로드
            # 스케일러는 별도 디렉토리 또는 동일 디렉토리에서 접두사 일치로 탐색
            scaler_dir_candidates = [
                os.path.join(self.model_base_path, "lstm_models"),
                os.path.join(self.model_base_path, "scalers"),
                os.path.join(self.model_base_path, "scalers_models"),
            ]
            scaler = None
            for sdir in scaler_dir_candidates:
                scaler_path = self._resolve_latest_file(sdir, f"scaler_{model_name}", ".pkl", version)
                if scaler_path and os.path.exists(scaler_path):
                    with open(scaler_path, 'rb') as f:
                        scaler = pickle.load(f)
                    self.scalers[f"lstm_{model_name}_{loaded_version}"] = scaler
                    break
            
            logger.info(f"LSTM 모델 로드 완료: {model_name}_{loaded_version}")
            return model
            
        except Exception as e:
            logger.error(f"LSTM 모델 로드 실패: {e}")
            return None
    
    def load_prophet_model(self, etf_code: str, version: str = "latest") -> Optional[Any]:
        """Prophet 모델 로드"""
        try:
            prophet_dir = os.path.join(self.model_base_path, "prophet_models")
            model_path = self._resolve_latest_file(prophet_dir, etf_code, ".pkl", version)
            if model_path is None:
                logger.error(f"Prophet 모델 파일을 찾을 수 없습니다: 디렉토리={prophet_dir}, prefix={etf_code}, version={version}")
                return None
                
            # 모델 로드
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            
            loaded_version = os.path.splitext(os.path.basename(model_path))[0].replace(f"{etf_code}_", "")
            self.models[f"prophet_{etf_code}_{loaded_version}"] = model
            logger.info(f"Prophet 모델 로드 완료: {etf_code}_{loaded_version}")
            return model
            
        except Exception as e:
            logger.error(f"Prophet 모델 로드 실패: {e}")
            return None
    
    def load_ensemble_config(self, version: str = "latest") -> Optional[Dict]:
        """앙상블 설정 로드"""
        try:
            ensemble_dir = os.path.join(self.model_base_path, "ensemble")
            config_path = os.path.join(ensemble_dir, f"config_{version}.json")
            weights_path = os.path.join(ensemble_dir, f"weights_{version}.json")
            
            if not os.path.exists(config_path):
                logger.error(f"앙상블 설정 파일을 찾을 수 없습니다: {config_path}")
                return None
            
            import json
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            if os.path.exists(weights_path):
                with open(weights_path, 'r') as f:
                    weights = json.load(f)
                config['weights'] = weights
            
            logger.info(f"앙상블 설정 로드 완료: {version}")
            return config
            
        except Exception as e:
            logger.error(f"앙상블 설정 로드 실패: {e}")
            return None
    
    def get_model(self, model_key: str) -> Optional[Any]:
        """로드된 모델 반환"""
        return self.models.get(model_key)
    
    def get_scaler(self, scaler_key: str) -> Optional[Any]:
        """로드된 스케일러 반환"""
        return self.scalers.get(scaler_key)
    
    def list_available_models(self) -> Dict[str, list]:
        """사용 가능한 모델 목록 반환"""
        available_models = {
            "lstm": [],
            "prophet": [],
            "ensemble": []
        }
        
        try:
            # LSTM 모델 목록
            lstm_path = os.path.join(self.model_base_path, "lstm_models")
            if os.path.exists(lstm_path):
                lstm_files = [f for f in os.listdir(lstm_path) if f.endswith('.h5')]
                available_models["lstm"] = lstm_files
            
            # Prophet 모델 목록
            prophet_path = os.path.join(self.model_base_path, "prophet_models")
            if os.path.exists(prophet_path):
                prophet_files = [f for f in os.listdir(prophet_path) if f.endswith('.pkl')]
                available_models["prophet"] = prophet_files
            
            # 앙상블 설정 목록
            ensemble_path = os.path.join(self.model_base_path, "ensemble")
            if os.path.exists(ensemble_path):
                ensemble_files = [f for f in os.listdir(ensemble_path) if f.endswith('.json')]
                available_models["ensemble"] = ensemble_files
                
        except Exception as e:
            logger.error(f"모델 목록 조회 실패: {e}")
        
        return available_models

# 전역 모델 로더 인스턴스
model_loader = ModelLoader()
