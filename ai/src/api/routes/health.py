from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from services.model_loader import model_loader
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def health_check():
    """기본 헬스체크"""
    return {"status": "healthy", "message": "API is running"}

@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """상세 헬스체크 (DB 연결 및 모델 상태 확인)"""
    try:
        # DB 연결 확인
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        logger.error(f"DB 연결 실패: {e}")
        db_status = "disconnected"
    
    # 사용 가능한 모델 확인
    available_models = model_loader.list_available_models()
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "available_models": available_models,
        "loaded_models": len(model_loader.models),
        "loaded_scalers": len(model_loader.scalers)
    }
