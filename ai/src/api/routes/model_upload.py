from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
import json
import pickle
import hashlib

from config.settings import settings

router = APIRouter()

def _generate_model_hash(data_config: Dict[str, Any]) -> str:
    """Generate hash for model configuration."""
    config_str = json.dumps(data_config, sort_keys=True)
    return hashlib.md5(config_str.encode()).hexdigest()[:8]

def _get_model_paths(base_path: Path, model_hash: str) -> Dict[str, Path]:
    """Get file paths for a model."""
    return {
        'lstm_model': base_path / "lstm_models" / f"lstm_{model_hash}.h5",
        'prophet_model': base_path / "prophet_models" / f"prophet_{model_hash}.pkl",
        'ensemble_model': base_path / "ensemble_models" / f"ensemble_{model_hash}.pkl",
        'feature_scaler': base_path / "scalers" / f"feature_scaler_{model_hash}.pkl",
        'target_scaler': base_path / "scalers" / f"target_scaler_{model_hash}.pkl",
        'metadata': base_path / "metadata" / f"metadata_{model_hash}.json"
    }

@router.post("/upload")
async def upload_model(
    model_file: UploadFile = File(...),
    asset_type: str = Form(...),  # ETF, Fund 등
    model_type: str = Form(...),  # lstm, prophet, feature_scaler, target_scaler, ensemble, metadata
    model_hash: Optional[str] = Form(default=None),  
    data_config: Optional[str] = Form(default=None),  
    version: str = Form(default="latest"),
    description: Optional[str] = Form(default=None),
    force_overwrite: bool = Form(default=False),
):
    """
    학습된 모델 업로드 (model_manager 구조와 일치)
    저장 구조: saved_models/{asset_type}/(lstm_models|prophet_models|ensemble_models|scalers|metadata)/
    """
    try:
        # 기본 경로
        base_path = Path(settings.MODEL_BASE_PATH) / asset_type.lower()
        base_path.mkdir(parents=True, exist_ok=True)

        # 서브 디렉토리 정의
        subdirs = {
            "lstm": "lstm_models",
            "prophet": "prophet_models",
            "ensemble": "ensemble_models",
            "feature_scaler": "scalers",
            "target_scaler": "scalers",
            "metadata": "metadata",
        }

        # model_type 유효성 확인
        if model_type not in subdirs:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 model_type: {model_type}")

        # 모델 해시 결정
        final_hash = None

        if model_hash:
            # Form 파라미터 우선
            final_hash = model_hash

        elif data_config:
            try:
                config_dict = json.loads(data_config)

                # data_config 안에 model_hash 있으면 우선 확인
                if "model_hash" in config_dict and config_dict["model_hash"] not in [None, "", "unknown"]:
                    final_hash = config_dict["model_hash"]
                else:
                    # 없는 경우 or unknown → hash 생성
                    final_hash = _generate_model_hash(config_dict)

            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="data_config는 유효한 JSON이어야 합니다")

        # 마지막 fallback (파일명 기반 or 랜덤 생성)
        if not final_hash:
            file_stem = Path(model_file.filename).stem
            if "_" in file_stem and len(file_stem.split("_")[-1]) == 8:
                final_hash = file_stem.split("_")[-1]
            else:
                final_hash = hashlib.md5(
                    f"{datetime.now().isoformat()}{model_file.filename}".encode()
                ).hexdigest()[:8]


        # 파일명 규칙
        filename_map = {
            "lstm": f"lstm_{final_hash}.h5",
            "prophet": f"prophet_{final_hash}.pkl",
            "ensemble": f"ensemble_{final_hash}.pkl",
            "feature_scaler": f"feature_scaler_{final_hash}.pkl",
            "target_scaler": f"target_scaler_{final_hash}.pkl",
            "metadata": f"metadata_{final_hash}.json",
        }

        # 최종 경로
        model_dir = base_path / subdirs[model_type]
        model_dir.mkdir(parents=True, exist_ok=True)
        model_path = model_dir / filename_map[model_type]

        # 덮어쓰기 방지
        if model_path.exists() and not force_overwrite:
            raise HTTPException(status_code=400, detail=f"이미 존재하는 모델: {model_path.name}")

        # 파일 저장
        with open(model_path, "wb") as f:
            f.write(await model_file.read())

        file_size = model_path.stat().st_size

        return {
            "message": "모델 업로드 성공",
            "asset_type": asset_type,
            "model_type": model_type,
            "model_hash": final_hash,
            "file_name": model_path.name,
            "file_path": str(model_path),
            "file_size": file_size,
            "description": description,
            "version": version,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 업로드 실패: {str(e)}")


@router.get("/list/{asset_type}")
async def list_models_by_asset(asset_type: str):
    """특정 asset_type의 모든 모델 목록 조회"""
    try:
        base_path = Path(settings.MODEL_BASE_PATH) / asset_type.lower()
        if not base_path.exists():
            return {"models": [], "asset_type": asset_type}
        
        models = []
        # 메타데이터 파일들에서 모델 정보 수집
        metadata_dir = base_path / "metadata"
        if metadata_dir.exists():
            for metadata_file in metadata_dir.glob("metadata_*.json"):
                try:
                    with open(metadata_file, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)
                    
                    model_hash = metadata.get('model_hash', 'unknown')
                    models.append({
                        "model_hash": model_hash,
                        "created_at": metadata.get('created_at'),
                        "data_config": metadata.get('data_config'),
                        "model_info": metadata.get('model_info'),
                        "upload_info": metadata.get('upload_info'),
                        "files": []
                    })
                    
                    # 각 모델의 실제 파일들 확인
                    paths = _get_model_paths(base_path, model_hash)
                    for file_type, file_path in paths.items():
                        if file_path.exists():
                            models[-1]["files"].append({
                                "type": file_type,
                                "file_name": file_path.name,
                                "file_path": str(file_path),
                                "file_size": file_path.stat().st_size,
                                "modified_time": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                            })
                except Exception as e:
                    print(f"메타데이터 읽기 실패 {metadata_file}: {e}")
        
        return {
            "asset_type": asset_type,
            "models": sorted(models, key=lambda x: x.get('created_at', ''), reverse=True)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 목록 조회 실패: {str(e)}")

@router.get("/list/{asset_type}/{model_type}")
async def list_models_by_type(asset_type: str, model_type: str):
    """특정 asset_type의 특정 model_type 목록 조회"""
    try:
        model_dir = Path(settings.MODEL_BASE_PATH) / asset_type.lower() / f"{model_type}_models"
        if not model_dir.exists():
            return {"models": [], "asset_type": asset_type, "model_type": model_type}
        
        files = [f for f in model_dir.iterdir() if f.is_file()]
        return {
            "asset_type": asset_type,
            "model_type": model_type,
            "models": [
                {
                    "file_name": f.name,
                    "file_path": str(f),
                    "file_size": f.stat().st_size,
                    "modified_time": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                }
                for f in files
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 목록 조회 실패: {str(e)}")

@router.delete("/{asset_type}/{model_hash}")
async def delete_model_by_hash(asset_type: str, model_hash: str):
    """모델 해시로 모델 삭제 (model_manager 구조와 호환)"""
    try:
        base_path = Path(settings.MODEL_BASE_PATH) / asset_type.lower()
        paths = _get_model_paths(base_path, model_hash)
        
        deleted_files = []
        for file_type, file_path in paths.items():
            if file_path.exists():
                file_path.unlink()
                deleted_files.append({
                    "type": file_type,
                    "file_name": file_path.name,
                    "file_path": str(file_path)
                })
        
        if not deleted_files:
            raise HTTPException(status_code=404, detail=f"모델을 찾을 수 없습니다: {asset_type}/{model_hash}")
        
        return {
            "message": "모델 삭제 완료",
            "asset_type": asset_type,
            "model_hash": model_hash,
            "deleted_files": deleted_files
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 삭제 실패: {str(e)}")

@router.delete("/{asset_type}/{model_type}/{file_name}")
async def delete_model_file(asset_type: str, model_type: str, file_name: str):
    """특정 모델 파일 삭제"""
    try:
        model_dir = Path(settings.MODEL_BASE_PATH) / asset_type.lower() / f"{model_type}_models"
        target_path = model_dir / file_name
        if not target_path.exists():
            raise HTTPException(status_code=404, detail="모델 파일을 찾을 수 없습니다")
        
        file_size = target_path.stat().st_size
        target_path.unlink()
        
        return {
            "message": "모델 파일 삭제 완료",
            "asset_type": asset_type,
            "model_type": model_type,
            "file_name": file_name,
            "file_size": file_size
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 삭제 실패: {str(e)}")

@router.get("/load/{asset_type}/{model_hash}")
async def load_model(asset_type: str, model_hash: str):
    """모델 로딩 (model_manager 구조와 호환)"""
    try:
        base_path = Path(settings.MODEL_BASE_PATH) / asset_type.lower()
        metadata_path = base_path / "metadata" / f"metadata_{model_hash}.json"
        
        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail=f"모델 메타데이터를 찾을 수 없습니다: {asset_type}/{model_hash}")
        
        # 메타데이터 로딩
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        # 모델 파일들 확인
        paths = _get_model_paths(base_path, model_hash)
        available_files = {}
        for file_type, file_path in paths.items():
            if file_path.exists():
                available_files[file_type] = {
                    "file_name": file_path.name,
                    "file_path": str(file_path),
                    "file_size": file_path.stat().st_size,
                    "modified_time": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                }
        
        return {
            "message": "모델 로딩 정보",
            "asset_type": asset_type,
            "model_hash": model_hash,
            "metadata": metadata,
            "available_files": available_files
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 로딩 실패: {str(e)}")
