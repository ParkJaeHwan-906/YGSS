from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from config.database import Base

class ModelMetadata(Base):
    """모델 메타데이터 테이블"""
    __tablename__ = "model_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # lstm, prophet, ensemble
    version = Column(String(20), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer)
    performance_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    metadata_json = Column(Text)  # 추가 메타데이터 JSON

class UserPortfolio(Base):
    """사용자 포트폴리오 테이블"""
    __tablename__ = "user_portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False)
    portfolio_name = Column(String(100), nullable=False)
    risk_profile = Column(String(20), nullable=False)  # conservative, moderate, aggressive
    allocation_json = Column(Text, nullable=False)  # ETF 배분 JSON
    expected_return = Column(Float)
    risk_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class PredictionHistory(Base):
    """예측 이력 테이블"""
    __tablename__ = "prediction_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False)
    etf_code = Column(String(20), nullable=False)
    prediction_value = Column(Float, nullable=False)
    confidence_score = Column(Float)
    model_version = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
