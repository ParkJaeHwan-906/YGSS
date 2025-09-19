import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging

logger = logging.getLogger(__name__)

def load_pickle_data(file_path: str, encoding: str = 'utf-8') -> Optional[pd.DataFrame]:
    """ETF 데이터 로드"""
    try:
        if file_path.endswith('.pkl'):
            data = pd.read_pickle(file_path)
        elif file_path.endswith('.csv') or file_path.endswith('.xls'):
            data = pd.read_csv(file_path, encoding=encoding)
        else:
            raise ValueError("지원하지 않는 파일 형식입니다")
        
        logger.info(f"데이터 로드 완료: {data.shape}")
        return data
        
    except Exception as e:
        logger.error(f"데이터 로드 실패: {e}")
        return None

def clean_etf_data(data: pd.DataFrame) -> pd.DataFrame:
    """ETF 데이터 정리"""
    try:
        # 복사본 생성
        cleaned_data = data.copy()
        
        # 날짜 컬럼 처리
        if 'date' in cleaned_data.columns:
            cleaned_data['date'] = pd.to_datetime(cleaned_data['date'], errors='coerce')
        
        # 숫자 컬럼 처리
        numeric_columns = ['open', 'close', 'high', 'low', 'volume', 'return']
        for col in numeric_columns:
            if col in cleaned_data.columns:
                cleaned_data[col] = pd.to_numeric(cleaned_data[col], errors='coerce')
        
        # 결측값 제거
        cleaned_data = cleaned_data.dropna()
        
        # 중복 제거
        cleaned_data = cleaned_data.drop_duplicates()
        
        logger.info(f"데이터 정리 완료: {cleaned_data.shape}")
        return cleaned_data
        
    except Exception as e:
        logger.error(f"데이터 정리 실패: {e}")
        return data

def calculate_technical_indicators(data: pd.DataFrame) -> pd.DataFrame:
    """기술적 지표 계산"""
    try:
        result = data.copy()
        
        if 'close' in result.columns:
            # 이동평균
            result['sma_5'] = result['close'].rolling(window=5).mean()
            result['sma_20'] = result['close'].rolling(window=20).mean()
            result['sma_50'] = result['close'].rolling(window=50).mean()
            
            # 볼린저 밴드
            result['bb_upper'] = result['sma_20'] + (result['close'].rolling(window=20).std() * 2)
            result['bb_lower'] = result['sma_20'] - (result['close'].rolling(window=20).std() * 2)
            
            # RSI
            delta = result['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            result['rsi'] = 100 - (100 / (1 + rs))
        
        if 'return' in result.columns:
            # 변동성
            result['volatility'] = result['return'].rolling(window=20).std()
        
        logger.info("기술적 지표 계산 완료")
        return result
        
    except Exception as e:
        logger.error(f"기술적 지표 계산 실패: {e}")
        return data

def prepare_model_input(data: pd.DataFrame, etf_code: str, 
                       feature_columns: List[str], window_size: int = 12) -> Tuple[np.ndarray, np.ndarray]:
    """모델 입력 데이터 준비"""
    try:
        # 특정 ETF 데이터 필터링
        if 'id' in data.columns:
            etf_data = data[data['id'] == etf_code].copy()
        else:
            etf_data = data.copy()
        
        if len(etf_data) < window_size:
            logger.warning(f"데이터 부족: {len(etf_data)} < {window_size}")
            return np.array([]), np.array([])
        
        # 날짜순 정렬
        if 'date' in etf_data.columns:
            etf_data = etf_data.sort_values('date')
        
        # 특성 데이터 추출
        features = etf_data[feature_columns].values
        
        # 시퀀스 데이터 생성
        X, y = [], []
        for i in range(window_size, len(features)):
            X.append(features[i-window_size:i])
            y.append(features[i, 0])  # 첫 번째 특성을 타겟으로 가정
        
        return np.array(X), np.array(y)
        
    except Exception as e:
        logger.error(f"모델 입력 데이터 준비 실패: {e}")
        return np.array([]), np.array([])

def validate_data_quality(data: pd.DataFrame) -> Dict[str, Any]:
    """데이터 품질 검증"""
    try:
        quality_report = {
            "total_rows": len(data),
            "total_columns": len(data.columns),
            "missing_values": data.isnull().sum().to_dict(),
            "duplicate_rows": data.duplicated().sum(),
            "data_types": data.dtypes.to_dict(),
            "numeric_columns": data.select_dtypes(include=[np.number]).columns.tolist(),
            "date_columns": data.select_dtypes(include=['datetime64']).columns.tolist()
        }
        
        # 이상치 검출 (숫자 컬럼만)
        numeric_data = data.select_dtypes(include=[np.number])
        outliers = {}
        for col in numeric_data.columns:
            Q1 = numeric_data[col].quantile(0.25)
            Q3 = numeric_data[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers[col] = ((numeric_data[col] < lower_bound) | (numeric_data[col] > upper_bound)).sum()
        
        quality_report["outliers"] = outliers
        
        return quality_report
        
    except Exception as e:
        logger.error(f"데이터 품질 검증 실패: {e}")
        return {}

def split_time_series_data(data: pd.DataFrame, test_size: float = 0.2, 
                          validation_size: float = 0.1) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """시계열 데이터 분할"""
    try:
        total_size = len(data)
        
        # 시간순으로 분할
        train_size = int(total_size * (1 - test_size - validation_size))
        val_size = int(total_size * validation_size)
        
        train_data = data.iloc[:train_size]
        val_data = data.iloc[train_size:train_size + val_size]
        test_data = data.iloc[train_size + val_size:]
        
        logger.info(f"데이터 분할 완료 - Train: {len(train_data)}, Val: {len(val_data)}, Test: {len(test_data)}")
        
        return train_data, val_data, test_data
        
    except Exception as e:
        logger.error(f"데이터 분할 실패: {e}")
        return data, pd.DataFrame(), pd.DataFrame()

def aggregate_monthly_data(data: pd.DataFrame) -> pd.DataFrame:
    """월별 데이터 집계"""
    try:
        if 'date' not in data.columns:
            logger.error("날짜 컬럼이 없습니다")
            return data
        
        # 월별 그룹화
        data['year_month'] = data['date'].dt.to_period('M')
        
        # 집계 규칙
        agg_rules = {
            'open': 'first',
            'close': 'last',
            'high': 'max',
            'low': 'min',
            'volume': 'mean',
            'return': 'mean'
        }
        
        # 존재하는 컬럼만 집계
        available_agg_rules = {k: v for k, v in agg_rules.items() if k in data.columns}
        
        monthly_data = data.groupby(['name', 'year_month']).agg(available_agg_rules).reset_index()
        monthly_data['date'] = monthly_data['year_month'].dt.to_timestamp()
        
        logger.info(f"월별 집계 완료: {len(monthly_data)} 행")
        return monthly_data
        
    except Exception as e:
        logger.error(f"월별 집계 실패: {e}")
        return data

