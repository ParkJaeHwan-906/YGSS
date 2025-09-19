"""
투자 포트폴리오 분석을 위한 간단한 데이터 로더들
- ETFDataLoader: ETF 데이터 로드 및 분석
- FundDataLoader: 펀드 데이터 로드 및 분석
"""
import pandas as pd
import numpy as np
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta

# API 모듈 import
try:
    from load_data_api import load_data
    API_AVAILABLE = True
except ImportError:
    API_AVAILABLE = False
    logging.warning("load_data_api 모듈을 찾을 수 없습니다. 샘플 데이터를 사용합니다.")

logger = logging.getLogger(__name__)

class BaseDataLoader:
    """데이터 로더 기본 클래스"""
    
    def __init__(self, product_type: str):
        self.product_type = product_type
        self._cache = None
        self._cache_time = None
        self.cache_duration_hours = 1  # 1시간 캐시
    
    def get_data(self, force_refresh: bool = False) -> pd.DataFrame:
        """데이터 조회 (메모리 캐시 사용)"""
        # 캐시가 유효하면 사용
        if not force_refresh and self._is_cache_valid():
            logger.info(f"{self.product_type.upper()}: 캐시된 데이터 사용")
            return self._cache.copy()
        
        # 새로 로드
        logger.info(f"{self.product_type.upper()}: 새 데이터 로드")
        data = self._load_data()
        
        # 캐시에 저장
        if not data.empty:
            self._cache = data.copy()
            self._cache_time = datetime.now()
        
        return data
    
    def _is_cache_valid(self) -> bool:
        """캐시가 유효한지 확인"""
        if self._cache is None or self._cache_time is None:
            return False
        
        cache_age = datetime.now() - self._cache_time
        return cache_age.total_seconds() / 3600 < self.cache_duration_hours
    
    def _load_data(self) -> pd.DataFrame:
        """실제 데이터 로드"""
        try:
            if API_AVAILABLE:
                raw_data = load_data(self.product_type)
            else:
                raw_data = self._generate_sample_data()
            
            return self._process_data(raw_data)
            
        except Exception as e:
            logger.error(f"{self.product_type} 데이터 로드 실패: {e}")
            return pd.DataFrame()
    
    def _process_data(self, raw_data: Dict) -> pd.DataFrame:
        """API 데이터를 DataFrame으로 변환"""
        processed_rows = []
        
        for product_id, time_series in raw_data.items():
            if not time_series:
                continue
            
            for data_point in time_series:
                row = {
                    'product_id': product_id,
                    'date': pd.to_datetime(data_point.get('date')),
                    'nav': float(data_point.get('nav', 0)),
                    'product_type': self.product_type
                }
                
                # 상품별 추가 필드
                self._add_extra_fields(row, data_point)
                processed_rows.append(row)
        
        if not processed_rows:
            return pd.DataFrame()
        
        df = pd.DataFrame(processed_rows)
        df = df.sort_values(['product_id', 'date'])
        
        # 수익률 계산
        df['daily_return'] = df.groupby('product_id')['nav'].pct_change()
        df['cumulative_return'] = df.groupby('product_id')['daily_return'].apply(
            lambda x: (1 + x).cumprod() - 1
        ).reset_index(level=0, drop=True)
        
        return df
    
    def _add_extra_fields(self, row: dict, data_point: dict):
        """서브클래스에서 오버라이드할 추가 필드"""
        pass
    
    def _generate_sample_data(self) -> Dict:
        """서브클래스에서 구현할 샘플 데이터 생성"""
        raise NotImplementedError


class ETFDataLoader(BaseDataLoader):
    """ETF 데이터 로더"""
    
    def __init__(self):
        super().__init__("etf")
    
    def _add_extra_fields(self, row: dict, data_point: dict):
        """ETF 추가 필드"""
        row['volume'] = float(data_point.get('volume', 0))
    
    def _generate_sample_data(self) -> Dict:
        """샘플 ETF 데이터 생성"""
        np.random.seed(42)
        sample_data = {}
        
        etf_products = ['ETF_001', 'ETF_002', 'ETF_003']
        dates = pd.date_range(start=datetime.now() - timedelta(days=90), end=datetime.now(), freq='D')
        
        for product_id in etf_products:
            time_series = []
            nav = 10000
            
            for date in dates:
                daily_return = np.random.normal(0, 0.015)
                nav = nav * (1 + daily_return)
                
                time_series.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'nav': round(nav, 2),
                    'volume': np.random.randint(100000, 1000000)
                })
            
            sample_data[product_id] = time_series
        
        return sample_data
    
    def get_summary(self) -> pd.DataFrame:
        """ETF 상품별 요약"""
        data = self.get_data()
        if data.empty:
            return pd.DataFrame()
        
        summary = []
        for product_id in data['product_id'].unique():
            product_data = data[data['product_id'] == product_id]
            
            latest_nav = product_data['nav'].iloc[-1]
            initial_nav = product_data['nav'].iloc[0]
            total_return = (latest_nav / initial_nav - 1) * 100
            
            daily_returns = product_data['daily_return'].dropna()
            volatility = daily_returns.std() * np.sqrt(252) * 100 if len(daily_returns) > 1 else 0
            
            summary.append({
                'product_id': product_id,
                'latest_nav': latest_nav,
                'total_return_pct': round(total_return, 2),
                'volatility_pct': round(volatility, 2),
                'avg_volume': round(product_data['volume'].mean(), 0) if 'volume' in product_data.columns else 0
            })
        
        return pd.DataFrame(summary)


class FundDataLoader(BaseDataLoader):
    """펀드 데이터 로더"""
    
    def __init__(self):
        super().__init__("fund")
    
    def _add_extra_fields(self, row: dict, data_point: dict):
        """펀드 추가 필드"""
        row['aum'] = float(data_point.get('aum', 0))
    
    def _generate_sample_data(self) -> Dict:
        """샘플 펀드 데이터 생성"""
        np.random.seed(43)
        sample_data = {}
        
        fund_products = ['FUND_001', 'FUND_002', 'FUND_003']
        dates = pd.date_range(start=datetime.now() - timedelta(days=90), end=datetime.now(), freq='D')
        
        for product_id in fund_products:
            time_series = []
            nav = 10000
            
            for date in dates:
                daily_return = np.random.normal(0, 0.01)
                nav = nav * (1 + daily_return)
                
                time_series.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'nav': round(nav, 2),
                    'aum': round(np.random.uniform(500, 5000), 1)
                })
            
            sample_data[product_id] = time_series
        
        return sample_data
    
    def get_performance(self) -> pd.DataFrame:
        """펀드 성과 분석"""
        data = self.get_data()
        if data.empty:
            return pd.DataFrame()
        
        performance = []
        for product_id in data['product_id'].unique():
            product_data = data[data['product_id'] == product_id]
            
            latest_nav = product_data['nav'].iloc[-1]
            initial_nav = product_data['nav'].iloc[0]
            total_return = (latest_nav / initial_nav - 1) * 100
            
            daily_returns = product_data['daily_return'].dropna()
            volatility = daily_returns.std() * np.sqrt(252) * 100 if len(daily_returns) > 1 else 0
            sharpe = daily_returns.mean() / daily_returns.std() * np.sqrt(252) if daily_returns.std() > 0 else 0
            
            performance.append({
                'product_id': product_id,
                'total_return_pct': round(total_return, 2),
                'volatility_pct': round(volatility, 2),
                'sharpe_ratio': round(sharpe, 2),
                'latest_aum': round(product_data['aum'].iloc[-1], 1) if 'aum' in product_data.columns else 0
            })
        
        return pd.DataFrame(performance)


# 사용 예시 - 기존 코드와 동일한 패턴
if __name__ == "__main__":
    # import pickle
    
    # logging.basicConfig(level=logging.INFO)
    
    # # ETF 데이터 API 호출
    # etf_loader = ETFDataLoader()
    # etf_data = etf_loader.get_data()
    
    # with open('etf_data.pkl', 'wb') as f:
    #     pickle.dump(etf_data, f)
    # with open('etf_data.pkl', 'rb') as f:
    #     etf_data = pickle.load(f)
    
    # # 펀드 데이터 API 호출
    # fund_loader = FundDataLoader()
    # fund_data = fund_loader.get_data()
    
    # with open('fund_data.pkl', 'wb') as f:
    #     pickle.dump(fund_data, f)
    # with open('fund_data.pkl', 'rb') as f:
    #     fund_data = pickle.load(f)
    
    # # 분석 결과
    # if not etf_data.empty:
    #     print("ETF 요약:")
    #     print(etf_loader.get_summary())
    
    # if not fund_data.empty:
    #     print("\n펀드 성과:")
    #     print(fund_loader.get_performance())
    etf_data = load_data("etf")
    
    import pickle
    with open('etf_data.pkl', 'wb') as f:
        pickle.dump(etf_data, f)
    # 나중에 불러오기
    with open('etf_data.pkl', 'rb') as f:
        etf_data = pickle.load(f)

    fund_data = load_data("pension")

    with open('fund_data.pkl', 'wb') as f:
        pickle.dump(fund_data, f)
    # 나중에 불러오기
    with open('fund_data.pkl', 'rb') as f:
        fund_data = pickle.load(f)