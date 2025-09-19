from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional

from config.settings import settings

router = APIRouter()

@router.post("/upload")
async def upload_model(
    model_file: UploadFile = File(...),
    model_type: str = Form(...),  # lstm, prophet, scalers 등
    version: str = Form(default="latest"),
    description: Optional[str] = Form(default=None),
    force_overwrite: bool = Form(default=False),  # 강제 덮어쓰기 옵션
):
    """
    주피터 허브에서 학습된 모델(폴더별 유형 구분) 업로드
    """
    try:
        # 모델 저장 경로 생성 ex) /home/j-j13a103/ai/models/lstm_models/
        model_dir = Path(settings.MODEL_BASE_PATH) / f"{model_type}_models"
        model_dir.mkdir(parents=True, exist_ok=True)
        # 파일명: 업로드된 원본 이름 유지 (timestamp 미부여)
        file_extension = Path(model_file.filename).suffix
        file_stem = Path(model_file.filename).stem
        model_filename = f"{file_stem}{file_extension}"
        model_path = model_dir / model_filename

        # 기존 파일 존재 여부 확인 (덮어쓰기 방지)
        if model_path.exists() and not force_overwrite:
            raise HTTPException(
                status_code=409,
                detail=(
                    "동일 이름의 모델 파일이 이미 존재합니다. "
                    "force_overwrite=true로 덮어쓰기를 허용하거나 파일명을 변경하세요."
                )
            )

        # 파일 저장 (force_overwrite가 True면 덮어쓰기 허용)
        with open(model_path, "wb") as buffer:
            shutil.copyfileobj(model_file.file, buffer)
        # 파일시스템 기반 응답 반환
        return {
            "message": "모델 업로드 성공",
            "model_type": model_type,
            "file_name": model_filename,
            "file_path": str(model_path),
            "file_size": os.path.getsize(model_path),
            "description": description,
            "version": version,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 업로드 실패: {str(e)}")

@router.get("/list/{model_type}")
async def list_models(model_type: str):
    """업로드된 모델 목록 조회"""
    try:
        model_dir = Path(settings.MODEL_BASE_PATH) / f"{model_type}_models"
        if not model_dir.exists():
            return {"models": []}
        files = [f for f in model_dir.iterdir() if f.is_file()]
        return {
            "models": [
                {
                    "file_name": f.name,
                    "file_path": str(f),
                    "file_size": f.stat().st_size,
                    "modified_time": datetime.fromtimestamp(f.stat().st_mtime),
                }
                for f in files
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 목록 조회 실패: {str(e)}")

@router.delete("/{model_type}/{file_name}")
async def delete_model(model_type: str, file_name: str):
    """모델 파일 삭제 (파일시스템 기반)"""
    try:
        model_dir = Path(settings.MODEL_BASE_PATH) / f"{model_type}_models"
        target_path = model_dir / file_name
        if not target_path.exists():
            raise HTTPException(status_code=404, detail="모델 파일을 찾을 수 없습니다")
        os.remove(target_path)
        return {"message": "모델 삭제 완료", "file_name": file_name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 삭제 실패: {str(e)}")
