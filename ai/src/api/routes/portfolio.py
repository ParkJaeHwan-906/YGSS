from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel
from services.portfolio_analyzer import portfolio_analyzer
import json
import logging
import numpy as np

logger = logging.getLogger(__name__)
router = APIRouter()

class PortfolioAnalysisRequest(BaseModel):
    salary: Optional[float] = None
    total_retire_pension: Optional[float] = None
    risk_grade_id: int = 1  # 1: conservative ~ 5: very aggressive
    # asset_list: List[str]

class PortfolioAllocation(BaseModel):
    asset_code: int
    allocation_percentage: float
    expected_return: float
    risk_score: float

class PortfolioAnalysisResponse(BaseModel):
    allocations: List[PortfolioAllocation]
    total_expected_return: float
    total_risk_score: float
    sharpe_ratio: float
    risk_grade_id: int
    analysis_date: str

class SavePortfolioRequest(BaseModel):
    # user_id: str
    portfolio_name: str
    allocations: Dict[str, float]
    risk_grade_id: int


@router.post("/analyze", response_model=PortfolioAnalysisResponse)
async def analyze_portfolio(request: PortfolioAnalysisRequest):
    """포트폴리오 분석 및 최적화 (DB 비의존)"""
    try:
        # 포트폴리오 분석 수행 (내부적으로 예측 서비스 호출)
        analysis_result = portfolio_analyzer.analyze_portfolio(
            salary=request.salary,
            total_retire_pension=request.total_retire_pension,
            risk_grade_id=request.risk_grade_id
            # assest_list=request.asset_list
        )
        if analysis_result is None:
            raise HTTPException(status_code=400, detail="포트폴리오 분석에 실패했습니다")

        # 응답 데이터 구성 (개별 ETF의 예상 수익률/리스크 간단 계산) 
        allocations = []
        asset_scores = {}
        for asset_code, allocation_pct in analysis_result['asset_allocations'].items():
            predictions = analysis_result['individual_predictions'].get(asset_code, [])
            if predictions:
                asset_return = (predictions[-1] - predictions[0]) / predictions[0] if len(predictions) > 1 else 0.05
                # risk_grade_id: 1(안정형) ~ 5(공격형)
                # 기본 위험허용도 = 0.05, 등급당 가중치 = 0.05
                asset_risk = 0.05 + 0.05 * request.risk_grade_id
            else:
                asset_return = 0.05
                asset_risk = 0.2

            if asset_risk > 0:
                rf = 0.03
                returns = [ (predictions[i+1]-predictions[i]) / predictions[i] for i in range(len(predictions)-1) ]
                asset_return = np.mean(returns)
                asset_volatility = np.std(returns) if len(returns) > 1 else 0.1
                sharpe = (asset_return - rf) / asset_volatility
            else:
                sharpe = 0
            asset_scores[asset_code] = sharpe

        # 4. 위험성향에 맞춘 Top-K (예: 3개) 선택
        top_k = sorted(asset_scores.items(), key=lambda x: x[1], reverse=True)[:3]

        total_score = sum(score for _, score in top_k) or 1
        for asset_code, score in top_k:
            pct = score / total_score
            allocations.append(PortfolioAllocation(
                asset_code=asset_code,
                allocation_percentage=round(pct * 100, 2),
                expected_return=asset_scores[asset_code] * 0.1,  # 단순 scaling, 실제로는 리스크 대비 기대수익 계산 필요
                risk_score=1 / (1 + asset_scores[asset_code])
            ))

        # 5. 최종 응답 반환
        return PortfolioAnalysisResponse(
            allocations=allocations,
            total_expected_return=sum(a.expected_return for a in allocations),
            total_risk_score=sum(a.risk_score for a in allocations),
            sharpe_ratio=max(asset_scores.values()) if asset_scores else 0,
            risk_grade_id=request.risk_grade_id,
            analysis_date=analysis_result['analysis_date']
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"포트폴리오 분석 실패: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 분석 중 오류가 발생했습니다")


@router.post("/save")
async def save_portfolio(request: SavePortfolioRequest):
    """포트폴리오 저장"""
    try:
        # 포트폴리오 유효성 검증
        validation_result = portfolio_analyzer.validate_portfolio(request.allocations)
        if not validation_result['is_valid']:
            raise HTTPException(
                status_code=400, 
                detail=f"포트폴리오 배분이 유효하지 않습니다. 총 배분: {validation_result['total_allocation']:.2%}"
            )
        
        # DB 미사용: 저장 없이 요청 내용을 그대로 반환
        return {
            "message": "포트폴리오 유효성 검증 완료 (비저장)",
            "portfolio": {
                "portfolio_name": request.portfolio_name,
                "risk_grade_id": request.risk_grade_id,
                "allocations": request.allocations,
            },
            "validation": validation_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"포트폴리오 저장 실패: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 저장 중 오류가 발생했습니다")

# @router.get("/user/{user_id}")
# async def get_user_portfolios(user_id: str):
#     """사용자 포트폴리오 목록 조회"""
#     try:
#         # DB 미사용: 저장된 포트폴리오 목록 제공 불가 -> 빈 목록 반환
#         return {"user_id": user_id, "portfolios": [], "total_count": 0}
        
#     except Exception as e:
#         logger.error(f"사용자 포트폴리오 조회 실패: {e}")
#         raise HTTPException(status_code=500, detail="포트폴리오 조회 중 오류가 발생했습니다")

# @router.get("/risk-profiles")
# async def get_risk_profiles():
#     """리스크 프로필 정보 조회"""
#     try:
#         risk_profiles = portfolio_analyzer.get_risk_profile_info()
#         return {"risk_profiles": risk_profiles}
#     except Exception as e:
#         logger.error(f"리스크 프로필 조회 실패: {e}")
#         raise HTTPException(status_code=500, detail="리스크 프로필 조회 중 오류가 발생했습니다")

