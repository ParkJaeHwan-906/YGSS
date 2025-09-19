import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from .predictor import prediction_service
import logging

logger = logging.getLogger(__name__)

class PortfolioAnalyzer:
    """포트폴리오 분석 서비스"""
    
    def __init__(self):
        self.prediction_service = prediction_service
        self.risk_profiles = {
            'conservative': {'max_risk': 0.15, 'target_return': 0.05},
            'moderate': {'max_risk': 0.25, 'target_return': 0.08},
            'aggressive': {'max_risk': 0.35, 'target_return': 0.12}
        }
    
    def analyze_portfolio(self, user_id: str, etf_list: List[str], 
                         risk_profile: str = 'moderate') -> Optional[Dict]:
        """포트폴리오 분석 및 최적화"""
        try:
            # ETF별 예측 수행
            predictions = {}
            for etf_code in etf_list:
                pred_result = self.prediction_service.ensemble_predict(
                    etf_code=etf_code,
                    input_data=np.random.random((1, 12, 5)),  # 실제로는 최근 데이터 사용
                    future_periods=12
                )
                if pred_result:
                    predictions[etf_code] = pred_result['prediction']
            
            if not predictions:
                return None
            
            # 수익률 및 리스크 계산
            returns = self._calculate_expected_returns(predictions)
            risks = self._calculate_risks(predictions)
            correlation_matrix = self._calculate_correlations(predictions)
            
            # 포트폴리오 최적화
            optimal_weights = self._optimize_portfolio(
                returns, risks, correlation_matrix, risk_profile
            )
            
            # 포트폴리오 성과 지표 계산
            portfolio_return = np.sum(returns * optimal_weights)
            portfolio_risk = self._calculate_portfolio_risk(optimal_weights, risks, correlation_matrix)
            sharpe_ratio = portfolio_return / portfolio_risk if portfolio_risk > 0 else 0
            
            return {
                "user_id": user_id,
                "etf_allocations": dict(zip(etf_list, optimal_weights.tolist())),
                "expected_return": float(portfolio_return),
                "risk_score": float(portfolio_risk),
                "sharpe_ratio": float(sharpe_ratio),
                "risk_profile": risk_profile,
                "individual_predictions": predictions,
                "analysis_date": pd.Timestamp.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"포트폴리오 분석 실패: {e}")
            return None
    
    def _calculate_expected_returns(self, predictions: Dict[str, List[float]]) -> np.ndarray:
        """예상 수익률 계산"""
        returns = []
        for etf_code, pred_values in predictions.items():
            if len(pred_values) > 1:
                # 첫 번째와 마지막 값으로 수익률 계산
                return_rate = (pred_values[-1] - pred_values[0]) / pred_values[0]
                returns.append(return_rate)
            else:
                returns.append(0.05)  # 기본 수익률
        
        return np.array(returns)
    
    def _calculate_risks(self, predictions: Dict[str, List[float]]) -> np.ndarray:
        """리스크 (변동성) 계산"""
        risks = []
        for etf_code, pred_values in predictions.items():
            if len(pred_values) > 1:
                volatility = np.std(pred_values) / np.mean(pred_values)
                risks.append(volatility)
            else:
                risks.append(0.2)  # 기본 변동성
        
        return np.array(risks)
    
    def _calculate_correlations(self, predictions: Dict[str, List[float]]) -> np.ndarray:
        """상관관계 매트릭스 계산"""
        try:
            # 예측값들을 DataFrame으로 변환
            df = pd.DataFrame(predictions)
            correlation_matrix = df.corr().values
            
            # NaN 값 처리
            correlation_matrix = np.nan_to_num(correlation_matrix, nan=0.0)
            
            # 대각선을 1로 설정
            np.fill_diagonal(correlation_matrix, 1.0)
            
            return correlation_matrix
            
        except Exception as e:
            logger.error(f"상관관계 계산 실패: {e}")
            # 기본 상관관계 매트릭스 (단위 행렬)
            n = len(predictions)
            return np.eye(n)
    
    def _optimize_portfolio(self, returns: np.ndarray, risks: np.ndarray, 
                          correlation_matrix: np.ndarray, risk_profile: str,
                          risk_free_rate: float = 0.02) -> np.ndarray:
        """포트폴리오 최적화 (샤프비율 극대화)"""
        try:
            from scipy.optimize import minimize
            
            n_assets = len(returns)
            profile_config = self.risk_profiles.get(risk_profile, self.risk_profiles['moderate'])
            
            # 목적 함수: 샤프 비율 최대화
            def objective(weights):
                portfolio_return = np.sum(returns * weights)
                portfolio_risk = self._calculate_portfolio_risk(weights, risks, correlation_matrix)
                if portfolio_risk == 0:
                    return -portfolio_return
                sharpe = (portfolio_return - risk_free_rate) / portfolio_risk
                return -sharpe  # 최소화 문제이므로 음수
            
            # 제약 조건
            constraints = [
                {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # 가중치 합 = 1
            ]
            
            # 리스크 제약 (사용자 성향별 최대 리스크 제한)
            def risk_constraint(weights):
                portfolio_risk = self._calculate_portfolio_risk(weights, risks, correlation_matrix)
                return profile_config['max_risk'] - portfolio_risk
            
            constraints.append({'type': 'ineq', 'fun': risk_constraint})
            
            # 경계 조건 (각 자산 0~50%)
            bounds = [(0, 0.5) for _ in range(n_assets)]
            
            # 초기 가중치 (균등 분배)
            initial_weights = np.ones(n_assets) / n_assets
            
            # 최적화 수행
            result = minimize(
                objective, 
                initial_weights, 
                method='SLSQP',
                bounds=bounds,
                constraints=constraints
            )
            
            if result.success:
                return result.x
            else:
                logger.warning("포트폴리오 최적화 실패, 균등 분배 사용")
                return initial_weights
                
        except Exception as e:
            logger.error(f"포트폴리오 최적화 실패: {e}")
            # 균등 분배로 폴백
            return np.ones(len(returns)) / len(returns)
    
    def _calculate_portfolio_risk(self, weights: np.ndarray, risks: np.ndarray, 
                                correlation_matrix: np.ndarray) -> float:
        """포트폴리오 리스크 계산"""
        try:
            # 공분산 매트릭스 계산
            cov_matrix = np.outer(risks, risks) * correlation_matrix
            
            # 포트폴리오 분산 계산
            portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
            
            # 표준편차 (리스크) 반환
            return np.sqrt(portfolio_variance)
            
        except Exception as e:
            logger.error(f"포트폴리오 리스크 계산 실패: {e}")
            return 0.2  # 기본값
    
    def get_risk_profile_info(self) -> Dict:
        """리스크 프로필 정보 반환"""
        return self.risk_profiles
    
    def validate_portfolio(self, allocations: Dict[str, float]) -> Dict:
        """포트폴리오 유효성 검증"""
        total_allocation = sum(allocations.values())
        
        return {
            "is_valid": abs(total_allocation - 1.0) < 0.01,
            "total_allocation": total_allocation,
            "max_single_allocation": max(allocations.values()) if allocations else 0,
            "min_single_allocation": min(allocations.values()) if allocations else 0,
            "num_assets": len(allocations)
        }

# 전역 포트폴리오 분석기 인스턴스
portfolio_analyzer = PortfolioAnalyzer()
