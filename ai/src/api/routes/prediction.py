from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
import numpy as np
from services.predictor import prediction_service
from database.model_storage import PredictionHistory
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class PredictionRequest(BaseModel):
    etf_code: str
    model_type: str = "ensemble"  # lstm, prophet, ensemble
    model_version: str = "latest"
    input_data: Optional[List[List[float]]] = None
    future_periods: int = 30

class PredictionResponse(BaseModel):
    etf_code: str
    prediction: List[float]
    model_type: str
    model_version: str
    confidence: Optional[float] = None
    upper_bound: Optional[List[float]] = None
    lower_bound: Optional[List[float]] = None
    dates: Optional[List[str]] = None

@router.post("/predict", response_model=PredictionResponse)
async def predict_etf(request: PredictionRequest):
    """ETF 가격 예측"""
    try:
        if request.model_type == "lstm":
            if request.input_data is None:
                raise HTTPException(status_code=400, detail="LSTM 모델은 input_data가 필요합니다")
            
            input_array = np.array(request.input_data)
            result = prediction_service.predict_lstm(
                etf_code=request.etf_code,
                input_data=input_array,
                model_version=request.model_version
            )
            
        elif request.model_type == "prophet":
            result = prediction_service.predict_prophet(
                etf_code=request.etf_code,
                future_periods=request.future_periods,
                model_version=request.model_version
            )
            
        elif request.model_type == "ensemble":
            if request.input_data is None:
                # 기본 더미 데이터 사용 (실제로는 최근 데이터를 가져와야 함)
                input_array = np.random.random((1, 12, 5))
            else:
                input_array = np.array(request.input_data)
                
            result = prediction_service.ensemble_predict(
                etf_code=request.etf_code,
                input_data=input_array,
                future_periods=request.future_periods
            )
        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 모델 타입입니다")
        
        if result is None:
            raise HTTPException(status_code=404, detail="모델을 찾을 수 없거나 예측에 실패했습니다")
        
        # 예측 이력 저장
        prediction_history = PredictionHistory(
            user_id="system",  # 실제로는 인증된 사용자 ID 사용
            etf_code=request.etf_code,
            prediction_value=result['prediction'][0] if result['prediction'] else 0.0,
            confidence_score=result.get('confidence', 0.5),
            model_version=request.model_version
        )
        
        return PredictionResponse(
            etf_code=request.etf_code,
            prediction=result['prediction'],
            model_type=result['model_type'],
            model_version=result['model_version'],
            confidence=result.get('confidence'),
            upper_bound=result.get('upper_bound'),
            lower_bound=result.get('lower_bound'),
            dates=result.get('dates')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"예측 실패: {e}")
        raise HTTPException(status_code=500, detail="예측 처리 중 오류가 발생했습니다")

@router.get("/models")
async def list_available_models():
    """사용 가능한 모델 목록 조회"""
    try:
        models = prediction_service.model_loader.list_available_models()
        return {"available_models": models}
    except Exception as e:
        logger.error(f"모델 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="모델 목록 조회 중 오류가 발생했습니다")
