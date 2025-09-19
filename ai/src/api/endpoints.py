from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


# router = APIRouter(prefix="/v1", tags=["v1"])
router = APIRouter()


class HealthResponse(BaseModel):
    status: str


class PredictRequest(BaseModel):
    features: list[float]


class PredictResponse(BaseModel):
    prediction: float


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    if not request.features:
        raise HTTPException(status_code=400, detail="features must not be empty")

    # 예시: 매우 단순한 더미 예측 로직 (합계)
    prediction_value = float(sum(request.features))
    return PredictResponse(prediction=prediction_value)

# @router.post("upload", response_model=UploadResponse)
# def upload(request: UploadRequest) -> UploadResponse:
#     if not request.file:
#         raise HTTPException(status_code=400, detail="file must not be empty")
    
#     return UploadResponse(status="ok")



