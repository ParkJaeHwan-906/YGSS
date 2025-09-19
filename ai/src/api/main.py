import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

# 선택적 import (패키지가 없어도 기본 기능은 작동)
try:
    from sqlalchemy.orm import Session
    from config.settings import settings
    from config.database import get_db, init_db
    HAS_DATABASE = True
except ImportError:
    HAS_DATABASE = False
    settings = type('Settings', (), {
        'APP_NAME': 'Portfolio Analysis API',
        'VERSION': '1.0.0',
        'DEBUG': False,
        'HOST': '0.0.0.0',
        'PORT': 8000,
        'LOG_LEVEL': 'INFO'
    })()

try:
    from routes import health, prediction, portfolio
    HAS_ROUTES = True
except ImportError:
    HAS_ROUTES = False

# 로깅 설정
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="GPU에서 학습된 모델을 사용한 포트폴리오 분석 API"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록 (조건부)
try:
    from api.routes.health import router as health_router
    app.include_router(health_router, prefix="/health", tags=["health"])
except ImportError as e:
    logger.warning(f"Health router import failed: {e}")
    
try:
    from api.routes.prediction import router as prediction_router
    app.include_router(prediction_router, prefix="/prediction", tags=["prediction"])
except ImportError as e:
    logger.warning(f"Prediction router import failed: {e}")
    
try:
    from api.routes.portfolio import router as portfolio_router
    app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])
except ImportError as e:
    logger.warning(f"Portfolio router import failed: {e}")
    
try:
    from api.routes.model_upload import router as model_upload_router
    app.include_router(model_upload_router, prefix="/models", tags=["models"])
except ImportError as e:
    logger.warning(f"Model upload router import failed: {e}")

try:
    from api.routes.server import router as server_router
    app.include_router(server_router, prefix="/server", tags=["server"])
except ImportError as e:
    logger.warning(f"Server router import failed: {e}")

@app.on_event("startup")
async def startup_event():
    """앱 시작 시 초기화"""
    logger.info("포트폴리오 분석 API 서버 시작")
    if HAS_DATABASE:
        init_db()
        logger.info("데이터베이스 초기화 완료")
    else:
        logger.info("데이터베이스 없이 실행")

@app.on_event("shutdown")
async def shutdown_event():
    """앱 종료 시 정리"""
    logger.info("포트폴리오 분석 API 서버 종료")

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Portfolio Analysis API",
        "version": settings.VERSION,
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
