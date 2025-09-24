from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel
from services.portfolio_analyzer import portfolio_analyzer
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class AssetList(BaseModel):
    id: int
    asset_type: str
    risk_grade_id: int
    reserve: int
    predicted_return: float

class PortfolioAnalysisRequest(BaseModel):
    salary: Optional[int] = None
    total_retire_pension: Optional[int] = None
    risk_grade_id: int = 1  # 1: conservative ~ 5: very aggressive
    asset_list: List[AssetList]

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
    try:
        logger.info("analyze_portfolio 호출 시작")
        if not request.asset_list:
            raise HTTPException(status_code=400, detail="분석할 상품 리스트가 없습니다.")

        # Pass the full asset_list to the analyzer
        assets_for_analysis = [a.model_dump() for a in request.asset_list]

        analysis_result = portfolio_analyzer.analyze_portfolio(
            salary=request.salary,
            total_retire_pension=request.total_retire_pension,
            risk_grade_id=request.risk_grade_id,
            asset_list=assets_for_analysis,
        )
        if analysis_result is None:
            raise HTTPException(status_code=400, detail="포트폴리오 분석에 실패했습니다")

        allocations = []
        for asset_code, allocation_pct in analysis_result['asset_allocations'].items():
            # 할당 비율이 0보다 큰 경우에만 리스트에 추가
            if allocation_pct > 0.0:
                predicted_return = analysis_result['individual_predictions'].get(asset_code, 0.05)
                asset_risk = portfolio_analyzer._get_asset_risk(
                    next(a.risk_grade_id for a in request.asset_list if a.id == asset_code),
                    next(a.reserve for a in request.asset_list if a.id == asset_code)
                )
                
                allocations.append(PortfolioAllocation(
                    asset_code=asset_code,
                    allocation_percentage=round(allocation_pct * 100, 2),
                    expected_return=predicted_return,
                    risk_score=asset_risk
                ))
            
        # 할당 비율이 높은 순으로 정렬
        allocations.sort(key=lambda x: x.allocation_percentage, reverse=True)
        
        return PortfolioAnalysisResponse(
            allocations=allocations,
            total_expected_return=sum(a.expected_return * a.allocation_percentage / 100 for a in allocations),
            total_risk_score=sum(a.risk_score * a.allocation_percentage / 100 for a in allocations),
            sharpe_ratio=0, # Placeholder, as it's complex to re-calculate here
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

