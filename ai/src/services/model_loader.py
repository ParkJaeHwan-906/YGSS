import os
import pickle
import joblib
from typing import Dict, Any, Optional
from config.settings import settings
import logging
import json
from pathlib import Path
import httpx

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
        
    def load_lstm_model(self, asset_type: str, model_hash: str) -> Optional[Any]:
        """asset_type와 model_hash로 정확한 LSTM 모델 파일을 로드합니다.

        기대 경로: <MODEL_BASE_PATH>/<asset_type>/lstm_models/lstm_<model_hash>.h5
        """
        try:
            base_dir = os.path.join(self.model_base_path, asset_type.lower())
            lstm_dir = os.path.join(base_dir, "lstm_models")
            model_path = os.path.join(lstm_dir, f"lstm_{model_hash}.h5")
            if not os.path.exists(model_path):
                logger.error(f"LSTM 모델 파일을 찾을 수 없습니다: {model_path}")
                return None

            if not HAS_TENSORFLOW:
                logger.error("TensorFlow가 설치되지 않아 LSTM 모델을 로드할 수 없습니다")
                return None

            model = tf.keras.models.load_model(model_path)
            self.models[f"lstm_{asset_type}_{model_hash}"] = model

            logger.info(f"LSTM 모델 로드 완료: {model_path}")
            return model

        except Exception as e:
            logger.error(f"LSTM 모델 로드 실패: {e}")
            return None
    
    def load_prophet_model(self, asset_type: str, model_hash: str) -> Optional[Any]:
        """asset_type와 model_hash로 정확한 Prophet 모델 파일을 로드합니다.

        기대 경로: <MODEL_BASE_PATH>/<asset_type>/prophet_models/prophet_<model_hash>.pkl
        """
        try:
            base_dir = os.path.join(self.model_base_path, asset_type.lower())
            prophet_dir = os.path.join(base_dir, "prophet_models")
            model_path = os.path.join(prophet_dir, f"prophet_{model_hash}.pkl")
            if not os.path.exists(model_path):
                logger.error(f"Prophet 모델 파일을 찾을 수 없습니다: {model_path}")
                return None

            with open(model_path, 'rb') as f:
                model = pickle.load(f)

            self.models[f"prophet_{asset_type}_{model_hash}"] = model
            logger.info(f"Prophet 모델 로드 완료: {model_path}")
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
    
    def get_latest_model_hash(self, asset_type: str) -> Optional[str]:
        """주어진 asset_type의 최신 모델 해시값을 찾아 반환"""
        try:
            base_path = Path(self.model_base_path) / asset_type.lower()
            metadata_dir = base_path / "metadata"
            if not metadata_dir.exists():
                logger.error(f"메타데이터 디렉토리가 존재하지 않습니다: {metadata_dir}")
                return None
            
            # glob 결과를 리스트로 변환하여 비어있는지 확인
            metadata_files = list(metadata_dir.glob("metadata_*.json"))
            if not metadata_files:
                logger.error(f"메타데이터 파일이 존재하지 않습니다: {metadata_dir}")
                return None

            latest_file = max(metadata_files, key=os.path.getmtime)
            return latest_file.stem.split('_')[-1]
        except Exception as e:
            logger.error(f"최신 모델 해시값 찾기 실패: {e}")
            return None

    def get_metadata(self, asset_type: str, model_hash: Optional[str] = None):
        """
        asset_code에 대한 메타데이터를 가져옵니다.
        model_hash가 주어지지 않으면 최신 모델의 메타데이터를 가져옵니다.
        """
        if asset_type is None:
            logger.error("asset_type cannot be None")
            return None
            
        if model_hash is None:
            model_hash = self.get_latest_model_hash(asset_type)
            if model_hash is None:
                raise FileNotFoundError(f"{asset_type}에 대한 최신 모델 메타데이터를 찾을 수 없습니다.")

        base_path = Path(self.model_base_path) / asset_type.lower()
        metadata_path = base_path / "metadata" / f"metadata_{model_hash}.json"
        
        if not metadata_path.exists():
            raise FileNotFoundError(f"메타데이터 파일을 찾을 수 없습니다: {metadata_path}")
        
        with open(metadata_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    import httpx # 비동기 HTTP 클라이언트 라이브러리

    # API 호출을 위한 기본 URL

    async def get_asset_profit_rate(asset_code: str) -> Optional[float]:
        """
        주어진 자산 코드에 대한 내년 예상 수익률을 API 호출로 가져옵니다.
        """
        url = f"https://j13a103.p.ssafy.io/api/pension/product/{asset_code}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)  # 타임아웃 5초 설정
                response.raise_for_status()  # 4xx, 5xx 에러 발생 시 예외 처리
                data = response.json()
                
                # API 응답 구조에 맞게 수익률 필드 추출
                profit_rate = data.get('product', {}).get('nextYearProfitRate')
                
                if profit_rate is None:
                    logger.warning(f"API 응답에 'nextYearProfitRate'가 없습니다: {url}")
                    return 0.0
                return float(profit_rate)
        except Exception as exc:
            logger.error(f"API 호출 중 예외 발생: {exc}")
            return 0.0

# 전역 모델 로더 인스턴스
model_loader = ModelLoader()
