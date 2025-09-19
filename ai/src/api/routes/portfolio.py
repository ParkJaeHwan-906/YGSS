from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel
from config.database import get_db
from services.portfolio_analyzer import portfolio_analyzer
from database.model_storage import UserPortfolio
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class PortfolioAnalysisRequest(BaseModel):
    user_id: str
    etf_list: List[str]
    risk_profile: str = "moderate"  # conservative, moderate, aggressive
    investment_amount: Optional[float] = None

class PortfolioAllocation(BaseModel):
    etf_code: str
    allocation_percentage: float
    expected_return: float
    risk_score: float

class PortfolioAnalysisResponse(BaseModel):
    user_id: str
    portfolio_id: Optional[int] = None
    allocations: List[PortfolioAllocation]
    total_expected_return: float
    total_risk_score: float
    sharpe_ratio: float
    risk_profile: str
    analysis_date: str

class SavePortfolioRequest(BaseModel):
    user_id: str
    portfolio_name: str
    allocations: Dict[str, float]
    risk_profile: str

@router.post("/analyze", response_model=PortfolioAnalysisResponse)
async def analyze_portfolio(request: PortfolioAnalysisRequest, db: Session = Depends(get_db)):
    """포트폴리오 분석 및 최적화"""
    try:
        # 포트폴리오 분석 수행
        analysis_result = portfolio_analyzer.analyze_portfolio(
            user_id=request.user_id,
            etf_list=request.etf_list,
            risk_profile=request.risk_profile
        )
        
        if analysis_result is None:
            raise HTTPException(status_code=400, detail="포트폴리오 분석에 실패했습니다")
        
        # 응답 데이터 구성
        allocations = []
        for etf_code, allocation_pct in analysis_result['etf_allocations'].items():
            # 개별 ETF의 예상 수익률과 리스크 계산 (간단한 버전)
            predictions = analysis_result['individual_predictions'].get(etf_code, [])
            if predictions:
                etf_return = (predictions[-1] - predictions[0]) / predictions[0] if len(predictions) > 1 else 0.05
                etf_risk = 0.2  # 기본값, 실제로는 더 정교한 계산 필요
            else:
                etf_return = 0.05
                etf_risk = 0.2
            
            allocations.append(PortfolioAllocation(
                etf_code=etf_code,
                allocation_percentage=allocation_pct * 100,  # 백분율로 변환
                expected_return=etf_return,
                risk_score=etf_risk
            ))
        
        return PortfolioAnalysisResponse(
            user_id=request.user_id,
            allocations=allocations,
            total_expected_return=analysis_result['expected_return'],
            total_risk_score=analysis_result['risk_score'],
            sharpe_ratio=analysis_result['sharpe_ratio'],
            risk_profile=request.risk_profile,
            analysis_date=analysis_result['analysis_date']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"포트폴리오 분석 실패: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 분석 중 오류가 발생했습니다")

@router.post("/save")
async def save_portfolio(request: SavePortfolioRequest, db: Session = Depends(get_db)):
    """포트폴리오 저장"""
    try:
        # 포트폴리오 유효성 검증
        validation_result = portfolio_analyzer.validate_portfolio(request.allocations)
        if not validation_result['is_valid']:
            raise HTTPException(
                status_code=400, 
                detail=f"포트폴리오 배분이 유효하지 않습니다. 총 배분: {validation_result['total_allocation']:.2%}"
            )
        
        # 포트폴리오 저장
        portfolio = UserPortfolio(
            user_id=request.user_id,
            portfolio_name=request.portfolio_name,
            risk_profile=request.risk_profile,
            allocation_json=json.dumps(request.allocations),
            expected_return=0.0,  # 실제로는 계산된 값 사용
            risk_score=0.0  # 실제로는 계산된 값 사용
        )
        
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        
        return {
            "message": "포트폴리오가 성공적으로 저장되었습니다",
            "portfolio_id": portfolio.id,
            "validation": validation_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"포트폴리오 저장 실패: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 저장 중 오류가 발생했습니다")

@router.get("/user/{user_id}")
async def get_user_portfolios(user_id: str, db: Session = Depends(get_db)):
    """사용자 포트폴리오 목록 조회"""
    try:
        portfolios = db.query(UserPortfolio)\
                      .filter(UserPortfolio.user_id == user_id)\
                      .order_by(UserPortfolio.created_at.desc())\
                      .all()
        
        result = []
        for portfolio in portfolios:
            allocations = json.loads(portfolio.allocation_json)
            result.append({
                "portfolio_id": portfolio.id,
                "portfolio_name": portfolio.portfolio_name,
                "risk_profile": portfolio.risk_profile,
                "allocations": allocations,
                "expected_return": portfolio.expected_return,
                "risk_score": portfolio.risk_score,
                "created_at": portfolio.created_at.isoformat(),
                "updated_at": portfolio.updated_at.isoformat() if portfolio.updated_at else None
            })
        
        return {
            "user_id": user_id,
            "portfolios": result,
            "total_count": len(result)
        }
        
    except Exception as e:
        logger.error(f"사용자 포트폴리오 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 조회 중 오류가 발생했습니다")

@router.get("/risk-profiles")
async def get_risk_profiles():
    """리스크 프로필 정보 조회"""
    try:
        risk_profiles = portfolio_analyzer.get_risk_profile_info()
        return {"risk_profiles": risk_profiles}
    except Exception as e:
        logger.error(f"리스크 프로필 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="리스크 프로필 조회 중 오류가 발생했습니다")

@router.delete("/{portfolio_id}")
async def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """포트폴리오 삭제"""
    try:
        portfolio = db.query(UserPortfolio).filter(UserPortfolio.id == portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="포트폴리오를 찾을 수 없습니다")
        
        db.delete(portfolio)
        db.commit()
        
        return {"message": "포트폴리오가 성공적으로 삭제되었습니다"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"포트폴리오 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 삭제 중 오류가 발생했습니다")

@router.put("/{portfolio_id}")
async def update_portfolio(portfolio_id: int, request: SavePortfolioRequest, db: Session = Depends(get_db)):
    """포트폴리오 업데이트"""
    try:
        portfolio = db.query(UserPortfolio).filter(UserPortfolio.id == portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="포트폴리오를 찾을 수 없습니다")
        
        # 포트폴리오 유효성 검증
        validation_result = portfolio_analyzer.validate_portfolio(request.allocations)
        if not validation_result['is_valid']:
            raise HTTPException(
                status_code=400, 
                detail=f"포트폴리오 배분이 유효하지 않습니다. 총 배분: {validation_result['total_allocation']:.2%}"
            )
        
        # 포트폴리오 업데이트
        portfolio.portfolio_name = request.portfolio_name
        portfolio.risk_profile = request.risk_profile
        portfolio.allocation_json = json.dumps(request.allocations)
        
        db.commit()
        db.refresh(portfolio)
        
        return {
            "message": "포트폴리오가 성공적으로 업데이트되었습니다",
            "portfolio_id": portfolio.id,
            "validation": validation_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"포트폴리오 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail="포트폴리오 업데이트 중 오류가 발생했습니다")
