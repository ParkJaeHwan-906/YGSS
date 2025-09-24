# portfolio_analyzer.py
import os
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from .predictor import prediction_service
from config.settings import settings
import logging
from requests.exceptions import RequestException

logger = logging.getLogger(__name__)

class PortfolioAnalyzer:
    """포트폴리오 분석 서비스"""
    def __init__(self, prediction_service: Any = None):
        self.prediction_service = prediction_service # 필요하다면 사용
        self.risk_profiles = {
            '1': {'max_risk': 0.15, 'target_return': 0.05},
            '2': {'max_risk': 0.20, 'target_return': 0.08},
            '3': {'max_risk': 0.25, 'target_return': 0.12},
            '4': {'max_risk': 0.30, 'target_return': 0.15},
            '5': {'max_risk': 0.35, 'target_return': 0.18}
        }

    def analyze_portfolio(
        self,
        salary: Optional[float] = None,
        total_retire_pension: Optional[float] = None,
        risk_grade_id: int = 1,
        asset_list: Optional[List[Dict]] = None,
    ) -> Optional[Dict]:
        if not asset_list:
            logger.error("분석용 자산 리스트가 비어있음")
            return None
        
        # Prepare data for optimization
        ids = [a['id'] for a in asset_list]
        predicted_returns = {a['id']: a['predicted_return'] for a in asset_list}
        returns = np.array([predicted_returns[_id] for _id in ids])
        
        # Calculate risk based on risk_grade_id and reserve
        risks = np.array([self._get_asset_risk(a['risk_grade_id'], a.get('reserve')) for a in asset_list])
        
        # Calculate a simplified correlation matrix
        correlation_matrix = self._calculate_correlations(asset_list)

        optimal_weights = self._optimize_portfolio(returns, risks, correlation_matrix, str(risk_grade_id))
        if optimal_weights is None:
            logger.error("최적화 실패")
            return None
            
        weights_by_code = {
            _id: float(w) for _id, w in zip(ids, optimal_weights)
        }

        analysis_result = {
            'asset_allocations': weights_by_code,
            'individual_predictions': predicted_returns,
            'analysis_date': pd.Timestamp.now().isoformat(),
        }
        return analysis_result

    def _get_asset_risk(self, asset_risk_grade: int, reserve: Optional[int] = None) -> float:
        """
        Calculates asset risk based on its risk grade and reserve.
        Lower reserve and higher grade means higher risk.
        """
        base_risk = 0.05 + 0.05 * (asset_risk_grade - 1)
        if reserve is not None and reserve < 10000000:
            reserve_factor = 1.0 + (10000000 - reserve) / 10000000
            return base_risk * reserve_factor
        return base_risk

    def _calculate_correlations(self, asset_list: List[Dict]) -> np.ndarray:
        """
        Calculate a simplified correlation matrix.
        Assumes higher correlation for assets of the same type.
        """
        n_assets = len(asset_list)
        corr_matrix = np.eye(n_assets)
        asset_types = [a['asset_type'] for a in asset_list]

        for i in range(n_assets):
            for j in range(i + 1, n_assets):
                if asset_types[i] == asset_types[j]:
                    corr_matrix[i, j] = corr_matrix[j, i] = 0.7  # Example: 70% correlation for same type
                else:
                    corr_matrix[i, j] = corr_matrix[j, i] = 0.3  # Example: 30% for different types
        return corr_matrix
    
    def _optimize_portfolio(self, returns: np.ndarray, risks: np.ndarray, 
                           correlation_matrix: np.ndarray, risk_profile: str,
                           risk_free_rate: float = 0.02) -> Optional[np.ndarray]:
        try:
            from scipy.optimize import minimize
            
            n_assets = len(returns)
            profile_config = self.risk_profiles.get(risk_profile, self.risk_profiles['3'])
            
            def objective(weights):
                portfolio_return = np.sum(returns * weights)
                portfolio_risk = self._calculate_portfolio_risk(weights, risks, correlation_matrix)
                if portfolio_risk == 0:
                    return -portfolio_return
                sharpe = (portfolio_return - risk_free_rate) / portfolio_risk
                return -sharpe
            
            constraints = [
                {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
                {'type': 'ineq', 'fun': lambda x: profile_config['max_risk'] - self._calculate_portfolio_risk(x, risks, correlation_matrix)}
            ]
            
            bounds = [(0, 0.5) for _ in range(n_assets)]
            initial_weights = np.ones(n_assets) / n_assets
            
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
                logger.warning(f"포트폴리오 최적화 실패: {result.message}. 균등 분배 사용")
                return np.ones(n_assets) / n_assets
                
        except Exception as e:
            logger.error(f"포트폴리오 최적화 실패: {e}")
            return None
    
    def _calculate_portfolio_risk(self, weights: np.ndarray, risks: np.ndarray, 
                                 correlation_matrix: np.ndarray) -> float:
        try:
            cov_matrix = np.outer(risks, risks) * correlation_matrix
            portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
            return np.sqrt(portfolio_variance)
        except Exception as e:
            logger.error(f"포트폴리오 리스크 계산 실패: {e}")
            return 0.2
    
    def get_risk_profile_info(self) -> Dict:
        return self.risk_profiles
    
    def validate_portfolio(self, allocations: Dict[str, float]) -> Dict:
        total_allocation = sum(allocations.values())
        return {
            "is_valid": abs(total_allocation - 1.0) < 0.01,
            "total_allocation": total_allocation,
            "max_single_allocation": max(allocations.values()) if allocations else 0,
            "min_single_allocation": min(allocations.values()) if allocations else 0,
            "num_assets": len(allocations)
        }

portfolio_analyzer = PortfolioAnalyzer(prediction_service=prediction_service)