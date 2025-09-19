import os
import pickle
import joblib
import numpy as np
import pandas as pd
from typing import Any, Dict, Optional, Tuple
import logging
import subprocess
import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

_model_cache: Dict[str, Any] = {}
_cache_lock = Lock()

def _infer_type_from_ext(path: str) -> Optional[str]:
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.pkl', '.pickle'): return 'pickle'
    if ext in ('.joblib',): return 'joblib'
    if ext in ('.h5', '.keras'): return 'tensorflow'
    if ext in ('.pt', '.pth'): return 'torch'
    return None

def save_model(model: Any, file_path: str, model_type: str = "pickle") -> bool:
    """모델을 파일로 저장"""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        if model_type == "pickle":
            with open(file_path, 'wb') as f:
                pickle.dump(model, f)
        elif model_type == "joblib":
            joblib.dump(model, file_path)
        elif model_type == "tensorflow":
            model.save(file_path)
        else:
            raise ValueError(f"지원하지 않는 모델 타입: {model_type}")
        
        logger.info(f"모델 저장 완료: {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"모델 저장 실패: {e}")
        return False

def load_model(path: str, model_type: Optional[str] = None,
               use_cache: bool = True, warm_up: bool = True) -> Optional[Any]:
    """
    파일 또는 디렉토리(모델 번들)를 로드해서 반환.
    - path가 디렉토리면, 그 내부의 알려진 파일명을 찾아 dict 반환.
    - 캐시 사용 권장 (use_cache=True).
    """
    # cache key
    key = f"{path}:{model_type}"
    if use_cache:
        with _cache_lock:
            if key in _model_cache:
                return _model_cache[key]

    # 디렉토리(모델 번들) 처리
    if os.path.isdir(path):
        models = {}
        for fname in os.listdir(path):
            fpath = os.path.join(path, fname)
            guessed = _infer_type_from_ext(fpath)
            try:
                if guessed in ('pickle', 'joblib', 'tensorflow', 'torch') or model_type:
                    loaded = load_model(fpath, model_type=guessed or model_type,
                                        use_cache=use_cache, warm_up=warm_up)
                    models[fname] = loaded
            except Exception as e:
                logger.warning(f"번들 내부 파일 로드 실패 {fpath}: {e}")
        with _cache_lock:
            _model_cache[key] = models
        return models

    # 단일 파일
    if not os.path.exists(path):
        logger.error(f"모델 파일 없음: {path}")
        return None

    inferred = model_type or _infer_type_from_ext(path)
    model = None
    try:
        if inferred == 'pickle':
            with open(path, 'rb') as f:
                model = pickle.load(f)
        elif inferred == 'joblib':
            model = joblib.load(path)
        elif inferred == 'tensorflow':
            import tensorflow as tf
            model = tf.keras.models.load_model(path)
        elif inferred == 'torch':
            import torch
            model = torch.load(path, map_location='cpu')
            try:
                model.eval()
            except:
                pass
        else:
            raise ValueError(f"지원하지 않는 모델 형식: {inferred} ({path})")

        # optional warm-up (간단한 입력으로 예측 시도) — 실패해도 무시
        if warm_up:
            try:
                if hasattr(model, 'predict'):
                    # dummy input: caller should know model input shape; keep safe fallback
                    # 여기서는 예측 호출을 하지 않거나 아주 작은 검증 데이터로 호출
                    pass
            except Exception:
                pass

        with _cache_lock:
            if use_cache:
                _model_cache[key] = model

        logger.info(f"모델 로드 성공: {path}")
        return model

    except Exception as e:
        logger.exception(f"모델 로드 실패: {path} : {e}")
        return None

def validate_model_input(data: np.ndarray, expected_shape: Tuple[int, ...]) -> bool:
    """모델 입력 데이터 유효성 검증"""
    try:
        if not isinstance(data, np.ndarray):
            logger.error("입력 데이터가 numpy 배열이 아닙니다")
            return False
        
        if len(expected_shape) != len(data.shape):
            logger.error(f"입력 데이터 차원 불일치: 예상 {len(expected_shape)}, 실제 {len(data.shape)}")
            return False
        
        for i, (expected, actual) in enumerate(zip(expected_shape, data.shape)):
            if expected != -1 and expected != actual:  # -1은 가변 차원
                logger.error(f"입력 데이터 크기 불일치 (차원 {i}): 예상 {expected}, 실제 {actual}")
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"입력 데이터 검증 실패: {e}")
        return False

def calculate_model_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """모델 성능 지표 계산"""
    try:
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
        
        mse = mean_squared_error(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_true, y_pred)
        
        # MAPE (Mean Absolute Percentage Error)
        mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
        
        return {
            "mse": float(mse),
            "mae": float(mae),
            "rmse": float(rmse),
            "r2": float(r2),
            "mape": float(mape)
        }
        
    except Exception as e:
        logger.error(f"성능 지표 계산 실패: {e}")
        return {}

def preprocess_time_series(data: pd.DataFrame, target_col: str, 
                          feature_cols: list, window_size: int = 12) -> Tuple[np.ndarray, np.ndarray]:
    """시계열 데이터 전처리"""
    try:
        # 결측값 처리
        data = data.fillna(method='ffill').fillna(method='bfill')
        
        # 특성과 타겟 분리
        features = data[feature_cols].values
        target = data[target_col].values
        
        # 시퀀스 데이터 생성
        X, y = [], []
        for i in range(window_size, len(data)):
            X.append(features[i-window_size:i])
            y.append(target[i])
        
        return np.array(X), np.array(y)
        
    except Exception as e:
        logger.error(f"시계열 데이터 전처리 실패: {e}")
        return np.array([]), np.array([])

def normalize_data(data: np.ndarray, scaler=None, fit_scaler: bool = True):
    """데이터 정규화"""
    try:
        from sklearn.preprocessing import MinMaxScaler
        
        if scaler is None:
            scaler = MinMaxScaler()
        
        if fit_scaler:
            normalized_data = scaler.fit_transform(data)
        else:
            normalized_data = scaler.transform(data)
        
        return normalized_data, scaler
        
    except Exception as e:
        logger.error(f"데이터 정규화 실패: {e}")
        return data, scaler

def clear_model_cache():
    with _cache_lock:
        _model_cache.clear()

def create_jupyter_deployment_script(output_path: str = "jupyter_model_deployer.py") -> bool:
    """주피터 허브용 모델 배포 자동화 스크립트 생성"""
    script_content = "#!/usr/bin/env python3\n\n"
    """
    주피터 허브에서 학습된 모델을 Git 리포지토리에 자동 배포하는 스크립트

    사용법:
    1. 모델 학습 완료 후 이 스크립트를 실행
    2. 모델과 메타데이터가 자동으로 Git에 커밋됨

    예제:
        python jupyter_model_deployer.py --model-path ./my_model --model-name "lstm_stock_predictor"
    """

    import argparse
    import sys
    import os
    from pathlib import Path

    # 현재 스크립트의 디렉토리를 기준으로 utils 모듈 import
    current_dir = Path(__file__).parent
    utils_dir = current_dir / "utils"
    if utils_dir.exists():
        sys.path.insert(0, str(current_dir))
        from utils.model_utils import save_model_and_commit, load_model
    else:
        print("Error: utils 디렉토리를 찾을 수 없습니다.")
        sys.exit(1)

    def main():
        parser = argparse.ArgumentParser(description="주피터 허브 모델 자동 배포")
        parser.add_argument("--model-path", required=True, help="학습된 모델 파일 경로")
        parser.add_argument("--model-name", required=True, help="모델 이름")
        parser.add_argument("--model-type", default="tensorflow", 
                        choices=["tensorflow", "pickle", "joblib"],
                        help="모델 타입")
        parser.add_argument("--repo-url", 
                        default="https://lab.ssafy.com/s13-bigdata-recom-sub1/S13P21A103.git",
                        help="Git 리포지토리 URL")
        parser.add_argument("--branch", default="ai/rinkoko/update-models", help="Git 브랜치")
        parser.add_argument("--metrics-file", help="모델 성능 지표 JSON 파일 경로")
        
        args = parser.parse_args()
        
        # 모델 로드
        print(f"모델 로드 중: {args.model_path}")
        model = load_model(args.model_path, args.model_type)
        if model is None:
            print("Error: 모델을 로드할 수 없습니다.")
            sys.exit(1)
        
        # 메타데이터 준비
        metadata = {
            "model_name": args.model_name,
            "model_type": args.model_type,
            "original_path": args.model_path,
            "deployment_source": "jupyter_hub"
        }
        
        # 성능 지표 파일이 있으면 추가
        if args.metrics_file and os.path.exists(args.metrics_file):
            import json
            with open(args.metrics_file, 'r') as f:
                metrics = json.load(f)
            metadata["metrics"] = metrics
        
        # 모델 저장 및 Git 커밋
        print(f"모델 배포 시작: {args.model_name}")
        success = save_model_and_commit(
            model=model,
            model_name=args.model_name,
            model_type=args.model_type,
            repo_url=args.repo_url,
            branch=args.branch,
            model_metadata=metadata
        )
        
        if success:
            print(f"✅ 모델 {args.model_name}이 성공적으로 배포되었습니다!")
            print(f"   리포지토리: {args.repo_url}")
            print(f"   브랜치: {args.branch}")
            print(f"   경로: /ai/saved_models/")
        else:
            print("❌ 모델 배포에 실패했습니다.")
            sys.exit(1)

        if __name__ == "__main__":
            main()
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        # 실행 권한 부여 (Unix 계열 시스템에서)
        try:
            os.chmod(output_path, 0o755)
        except:
            pass  # Windows에서는 무시
        
        logger.info(f"주피터 배포 스크립트 생성 완료: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"스크립트 생성 실패: {e}")
        return False
