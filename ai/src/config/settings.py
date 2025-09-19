import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # 앱 설정
    APP_NAME = "Portfolio Analysis API"
    VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # 서버 설정
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    
    # 모델 경로
    MODEL_BASE_PATH = os.getenv("MODEL_BASE_PATH", "./saved_models")
    
    # 데이터베이스 설정 (SQLite 기본값 - 파일 기반 DB)
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./portfolio.db")
    # DATABASE_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DATABASE')}"

    # Redis 캐시 (선택사항)
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # 로깅
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
