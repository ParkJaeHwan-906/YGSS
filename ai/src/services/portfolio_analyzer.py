import os
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from .predictor import prediction_service
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class PortfolioAnalyzer:
    """포트폴리오 분석 서비스"""
    
    def __init__(self):
        self.prediction_service = prediction_service
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
    ) -> Optional[Dict]:
        """포트폴리오 분석 및 최적화 (라우터 스키마 호환)

        반환 예시:
        {
          'asset_allocations': {asset_code(int): weight(float)},
          'individual_predictions': {asset_code(int): [float, ...]},
          'analysis_date': str
        }
        """
        try:
            # 1) 위험 등급 -> 내부 리스크 프로필 키('1'~'5')로 사용
            profile_key = str(min(max(risk_grade_id, 1), 5))

            # 2) 자산 우주 동적 수집: MODEL_BASE_PATH/{asset_type}/(lstm_models|prophet_models)
            # asset_type: 'etf', 'fund' 모두 포함하여 합집합으로 구성
            base = settings.MODEL_BASE_PATH

            def extract_prefixes_from_dir(dir_path: str, ext: str) -> set:
                prefixes = set()
                if os.path.isdir(dir_path):
                    for f in os.listdir(dir_path):
                        if not f.endswith(ext):
                            continue
                        base_name = f[:-len(ext)]
                        if '_' in base_name:
                            prefixes.add(base_name.split('_')[0])
                        else:
                            prefixes.add(base_name)
                return prefixes

            all_codes = set()
            for asset_type in ['etf', 'fund']:
                prophet_dir = os.path.join(base, asset_type, 'prophet_models')
                lstm_dir = os.path.join(base, asset_type, 'lstm_models')
                codes_prophet = extract_prefixes_from_dir(prophet_dir, '.pkl')
                codes_lstm = extract_prefixes_from_dir(lstm_dir, '.h5')
                all_codes |= (codes_prophet | codes_lstm)

            # 과도한 자산 수는 최적화 안정성/속도에 영향을 주므로 상한 설정 (예: 8개)
            MAX_ASSETS = 8
            selected_codes = sorted(all_codes)[:MAX_ASSETS]
            if not selected_codes:
                return None

            # asset_code(int) <-> code(str) 매핑 구성 (순차 번호)
            asset_map = {idx + 1: code for idx, code in enumerate(selected_codes)}

            # 3) 예측 수행: etf_code 단위 예측, 결과는 asset_code 키로 매핑
            predictions_by_code: Dict[int, List[float]] = {}
            predictions_for_calc: Dict[str, List[float]] = {}

            for asset_code, etf_code in asset_map.items():
                pred_result = self.prediction_service.ensemble_predict(
                    etf_code=etf_code,
                    input_data=np.random.random((1, 12, 5)),
                    future_periods=12,
                )

                if pred_result and pred_result.get('prediction'):
                    series = pred_result['prediction']
                else:
                    # 모델 미존재/오류 시 간단한 대체 시계열 생성
                    base = 100.0
                    noise = np.cumsum(np.random.normal(0.2, 0.7, size=12))
                    # 높은 위험등급일수록 약간 더 큰 추세
                    trend_scale = 1 + (int(profile_key) - 1) * 0.5
                    trend = np.linspace(0, trend_scale, 12)
                    series = (base + trend + noise).tolist()

                predictions_by_code[asset_code] = series
                predictions_for_calc[etf_code] = series

            if not predictions_for_calc:
                return None

            # 4) 최적화 입력 계산
            returns = self._calculate_expected_returns(predictions_for_calc)
            risks = self._calculate_risks(predictions_for_calc)
            correlation_matrix = self._calculate_correlations(predictions_for_calc)

            # 5) 최적화 수행 (profile_key 사용)
            optimal_weights = self._optimize_portfolio(
                returns, risks, correlation_matrix, profile_key
            )

            # 6) 결과 매핑 (asset_code 순서)
            asset_codes = list(asset_map.keys())
            weights_by_code = {code: float(w) for code, w in zip(asset_codes, optimal_weights.tolist())}

            # 7) 라우터 기대 포맷으로 반환
            return {
                'asset_allocations': weights_by_code,
                'individual_predictions': predictions_by_code,
                'analysis_date': pd.Timestamp.now().isoformat(),
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
            # risk_profile은 '1'~'5' 키를 기대. 기본은 '3'(중간 위험)
            profile_config = self.risk_profiles.get(risk_profile, self.risk_profiles['3'])
            
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
