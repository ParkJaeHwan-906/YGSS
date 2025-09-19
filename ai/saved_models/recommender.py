#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
하이브리드 ETF 추천 시스템
Prophet + LSTM + 협업필터링 + 포트폴리오 최적화를 통합한 시스템
"""

import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import warnings
import pickle
import joblib
import os
warnings.filterwarnings('ignore')

# GPU 설정 (TESLA GPU 사용)
import os

os.environ['CUDA_DEVICE_ORDER'] = "PCI_BUS_ID"
os.environ['CUDA_VISIBLE_DEVICES'] = '1'  # GPU 1 (할당된 번호) 사용
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # TensorFlow 로그 레벨 조정

# GPU 메모리 증가 설정
try:
    # GPU 디바이스 확인
    gpus = tf.config.list_physical_devices('GPU')
    print(f"발견된 GPU 디바이스: {gpus}")
    
    if gpus:
        # GPU 메모리 증가 설정
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"GPU 설정 완료: {len(gpus)}개 GPU 사용 가능")
        
        # GPU 사용 확인
        with tf.device('/GPU:0'):
            test_tensor = tf.constant([1.0, 2.0, 3.0])
            print(f"GPU 테스트 성공: {test_tensor.device}")
    else:
        print("GPU를 찾을 수 없습니다. CPU를 사용합니다.")
        # CPU 최적화 설정
        tf.config.threading.set_inter_op_parallelism_threads(0)  # 모든 CPU 코어 사용
        tf.config.threading.set_intra_op_parallelism_threads(0)  # 모든 CPU 코어 사용
        print("CPU 최적화 설정 완료")
except Exception as e:
    print(f"GPU 설정 중 오류: {e}")
    print("CPU를 사용합니다.")
    # CPU 최적화 설정
    tf.config.threading.set_inter_op_parallelism_threads(0)
    tf.config.threading.set_intra_op_parallelism_threads(0)
    print("CPU 최적화 설정 완료")

# Prophet
from prophet import Prophet

# TensorFlow/Keras
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping

# Scikit-learn
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error

# 최적화
from scipy.optimize import minimize

# 시각화
import seaborn as sns
plt.style.use('seaborn-v0_8')

# 한글 폰트 설정
import matplotlib.font_manager as fm

# Windows에서 한글 폰트 찾기
def get_korean_font():
    """한글 폰트 찾기"""
    # Windows 기본 한글 폰트들
    korean_fonts = [
        'Malgun Gothic',  # 맑은 고딕
        'NanumGothic',    # 나눔고딕
        'Batang',         # 바탕
        'Dotum',          # 돋움
        'Gulim'           # 굴림
    ]
    
    for font in korean_fonts:
        try:
            fm.findfont(font)
            return font
        except:
            continue
    
    # 한글 폰트를 찾지 못한 경우 기본 폰트 사용
    return 'DejaVu Sans'

# 한글 폰트 설정
korean_font = get_korean_font()
plt.rcParams['font.family'] = korean_font
plt.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지

print(f"사용 중인 폰트: {korean_font}")

class HybridRecommenderSystem:
    def __init__(self, config=None):
        """
        하이브리드 추천 시스템 초기화
        
        Args:
            config (dict): 설정 파라미터
        """
        self.config = config or self._get_default_config()
        self.profile_model = None
        self.lstm_model = None
        self.prophet_models = {}
        self.lstm_models = {}  # ETF별 LSTM 모델 저장
        self.scaler = MinMaxScaler()
        self.lstm_scaler = MinMaxScaler()
        self.model_save_path = 'saved_models'  # 모델 저장 경로
        
    def _get_default_config(self):
        """기본 설정 반환"""
        return {
            'lstm_timesteps': 12,  # 60 → 30 -> 12으로 줄임
            'lstm_features': 5,
            'lstm_units': [64, 32],
            'lstm_dropout': 0.2,
            'prophet_changepoint_prior_scale': 0.15,
            'prophet_changepoint_range': 0.8,
            'ensemble_alpha': 0.7,
            'risk_profiles': ['conservative', 'moderate', 'aggressive'],
            'max_risk_limits': [0.3, 0.6, 0.8]
        }
    
    def prepare_etf_data(self, etf_data_path, market_data_path=None):
        """
        ETF 데이터 전처리
        
        Args:
            etf_data_path (str): ETF 데이터 파일 경로
            market_data_path (str): 시장 데이터 파일 경로 (선택사항)
            
        Returns:
            pd.DataFrame: 전처리된 ETF 데이터
        """
        print("ETF 데이터 전처리 중...")
        
        # ETF 데이터 로드
        if etf_data_path.endswith('.csv'):
            etf_data = pd.read_csv(etf_data_path, header=None, encoding='utf-8')
        else:
            etf_data = pd.read_excel(etf_data_path, header=None)
        
        print(f"원본 데이터: {etf_data.shape}")
        print(f"원본 데이터 샘플:\n{etf_data.head()}")
        print(f"원본 데이터 타입:\n{etf_data.dtypes}")
        
        # 실제 데이터 구조에 맞게 정확한 컬럼명 설정
        etf_data.columns = ['id', 'company', 'name', 'date', 'open', 'close', 'return', 'volume']
        
        print(f"정확한 컬럼명으로 설정 후:\n{etf_data.head()}")
        
        # date 컬럼에서 연도와 월 추출
        print(f"date 컬럼 샘플: {etf_data['date'].head()}")
        print(f"date 컬럼 타입: {etf_data['date'].dtype}")
        
        # date 컬럼의 첫 번째 행이 헤더인 경우 제거
        if etf_data['date'].iloc[0] == 'date':
            print("첫 번째 행이 헤더입니다. 제거합니다.")
            etf_data = etf_data.iloc[1:].reset_index(drop=True)
            print(f"헤더 제거 후 데이터: {etf_data.shape}")
            print(f"date 컬럼 샘플: {etf_data['date'].head()}")
        
        # date 컬럼을 datetime으로 변환하여 ds 컬럼 생성
        try:
            etf_data['ds'] = pd.to_datetime(etf_data['date'])
            print(f"datetime 변환 후 샘플: {etf_data['ds'].head()}")
        except Exception as e:
            print(f"datetime 변환 실패: {e}")
            # date 컬럼의 형식을 확인
            print(f"date 컬럼 고유값 샘플: {etf_data['date'].unique()[:5]}")
            return None
        
        print(f"컬럼명 변경 후:\n{etf_data.head()}")
        print(f"최종 컬럼: {etf_data.columns.tolist()}")
        
        # 숫자 컬럼들을 문자열에서 숫자로 변환
        numeric_columns = ['open', 'close', 'return', 'volume']
        for col in numeric_columns:
            if col in etf_data.columns:
                etf_data[col] = pd.to_numeric(etf_data[col], errors='coerce')
                print(f"{col} 컬럼을 숫자로 변환 완료")
        
        # NaN 값이 있는 행 제거
        etf_data = etf_data.dropna(subset=numeric_columns)
        print(f"숫자 변환 후 데이터: {etf_data.shape}")
        
        # 기술적 지표 추가
        etf_data['sma_20'] = etf_data['close'].rolling(window=20).mean()
        etf_data['sma_50'] = etf_data['close'].rolling(window=50).mean()
        etf_data['volatility'] = etf_data['return'].rolling(window=20).std()
        
        # 시장 데이터 병합 (KOSPI + 환율, 개선된 버전)
        if market_data_path:
            try:
                market_data = pd.read_csv(market_data_path, encoding='UTF-8')
                print(f"시장 데이터 원본: {market_data.shape}")
                print(f"시장 데이터 샘플:\n{market_data.head()}")
                print(f"시장 데이터 컬럼: {market_data.columns.tolist()}")
                
                # 시장 데이터 전처리
                # 날짜 컬럼 처리 (market_data.csv 전용)
                if 'date' in market_data.columns:
                    market_data['ds'] = pd.to_datetime(market_data['date'])
                    print("날짜 컬럼 처리 완료 (market_data.csv)")
                else:
                    print(f"날짜 컬럼을 찾을 수 없습니다. 사용 가능한 컬럼: {market_data.columns.tolist()}")
                    return etf_data
                
                # 천단위 콤마 제거 (문자열 → 숫자 변환 전)
                numeric_like_cols = [
                    col for col in ['kospi', 'usd_krw', 'cny_krw', 'jpy_krw', 'oil_price', 'interest_rate', 'price_index']
                    if col in market_data.columns
                ]
                for col in numeric_like_cols:
                    market_data[col] = (
                        market_data[col]
                        .astype(str)
                        .str.replace(',', '', regex=False)
                        .replace({'': None})
                    )
                
                # KOSPI 데이터 처리 (market_data.csv 전용)
                if 'kospi' in market_data.columns:
                    market_data['kospi_close'] = pd.to_numeric(market_data['kospi'], errors='coerce')
                    market_data['kospi_return'] = market_data['kospi_close'].pct_change()
                    market_data['kospi_volatility'] = market_data['kospi_return'].rolling(window=20, min_periods=1).std()
                    market_data['kospi_sma_20'] = market_data['kospi_close'].rolling(window=20, min_periods=1).mean()
                    print("KOSPI 데이터 처리 완료 (market_data.csv)")
                else:
                    print("경고: KOSPI 데이터가 없습니다.")
                
                # 달러 환율 데이터 처리
                if 'usd_krw' in market_data.columns:
                    market_data['usd_krw'] = pd.to_numeric(market_data['usd_krw'], errors='coerce')
                    market_data['usd_krw_return'] = market_data['usd_krw'].pct_change()
                    market_data['usd_krw_volatility'] = market_data['usd_krw_return'].rolling(window=20, min_periods=1).std()
                    market_data['usd_krw_sma_20'] = market_data['usd_krw'].rolling(window=20, min_periods=1).mean()
                    print("USD/KRW 환율 데이터 처리 완료")
                else:
                    print("USD/KRW 환율 데이터가 없습니다.")
                
                # 중국 위안 환율 데이터 처리
                if 'cny_krw' in market_data.columns:
                    market_data['cny_krw'] = pd.to_numeric(market_data['cny_krw'], errors='coerce')
                    market_data['cny_krw_return'] = market_data['cny_krw'].pct_change()
                    market_data['cny_krw_volatility'] = market_data['cny_krw_return'].rolling(window=20, min_periods=1).std()
                    market_data['cny_krw_sma_20'] = market_data['cny_krw'].rolling(window=20, min_periods=1).mean()
                    print("CNY/KRW 환율 데이터 처리 완료")
                else:
                    print("CNY/KRW 환율 데이터가 없습니다.")
                
                # 일본 엔 환율 데이터 처리
                if 'jpy_krw' in market_data.columns:
                    market_data['jpy_krw'] = pd.to_numeric(market_data['jpy_krw'], errors='coerce')
                    market_data['jpy_krw_return'] = market_data['jpy_krw'].pct_change()
                    market_data['jpy_krw_volatility'] = market_data['jpy_krw_return'].rolling(window=20, min_periods=1).std()
                    market_data['jpy_krw_sma_20'] = market_data['jpy_krw'].rolling(window=20, min_periods=1).mean()
                    print("JPY/KRW 환율 데이터 처리 완료")
                else:
                    print("JPY/KRW 환율 데이터가 없습니다.")
                
                # 유가 데이터 처리
                if 'oil_price' in market_data.columns:
                    market_data['oil_price'] = pd.to_numeric(market_data['oil_price'], errors='coerce')
                    market_data['oil_price_return'] = market_data['oil_price'].pct_change()
                    market_data['oil_price_volatility'] = market_data['oil_price_return'].rolling(window=20, min_periods=1).std()
                    market_data['oil_price_sma_20'] = market_data['oil_price'].rolling(window=20, min_periods=1).mean()
                    print("유가 데이터 처리 완료")
                else:
                    print("유가 데이터가 없습니다.")
                
                # 금리 데이터 처리
                if 'interest_rate' in market_data.columns:
                    market_data['interest_rate'] = pd.to_numeric(market_data['interest_rate'], errors='coerce')
                    market_data['interest_rate_change'] = market_data['interest_rate'].diff()
                    market_data['interest_rate_sma_20'] = market_data['interest_rate'].rolling(window=20, min_periods=1).mean()
                    print("금리 데이터 처리 완료")
                else:
                    print("금리 데이터가 없습니다.")
                
                # 물가지수 데이터 처리
                if 'price_index' in market_data.columns:
                    market_data['price_index'] = pd.to_numeric(market_data['price_index'], errors='coerce')
                    market_data['price_index_return'] = market_data['price_index'].pct_change()
                    market_data['price_index_volatility'] = market_data['price_index_return'].rolling(window=20, min_periods=1).std()
                    market_data['price_index_sma_20'] = market_data['price_index'].rolling(window=20, min_periods=1).mean()
                    print("물가지수 데이터 처리 완료")
                else:
                    print("물가지수 데이터가 없습니다.")
                
                # 중복 제거 및 정렬
                market_data = market_data.drop_duplicates(subset=['ds']).sort_values('ds')

                # 월 기준 병합을 위한 period 컬럼 생성
                etf_data['ds'] = pd.to_datetime(etf_data['ds'])
                etf_data['year_month'] = etf_data['ds'].dt.to_period('M')
                market_data['year_month'] = market_data['ds'].dt.to_period('M')

                # 시장 데이터는 월별 마지막 관측값으로 축약
                market_monthly = market_data.sort_values('ds').drop_duplicates(subset=['year_month'], keep='last')

                # 월 기준 병합
                etf_merged = pd.merge(
                    etf_data,
                    market_monthly.drop(columns=['ds']),
                    on='year_month',
                    how='left'
                )
                
                # 시장 지표 결측 보간 (ETF별 그룹 내에서만 전후방 보간)
                market_cols = [
                    col for col in etf_merged.columns
                    if any(ind in col for ind in ['kospi', 'usd_krw', 'cny_krw', 'jpy_krw', 'oil_price', 'interest_rate', 'price_index'])
                ]
                if market_cols:
                    etf_merged[market_cols] = (
                        etf_merged.groupby('name')[market_cols]
                        .apply(lambda g: g.ffill().bfill())
                        .reset_index(level=0, drop=True)
                    )
                
                # 상관관계 분석을 위한 추가 지표 계산
                if 'kospi_close' in etf_merged.columns:
                    etf_merged['kospi_momentum'] = etf_merged['kospi_close'] / etf_merged['kospi_sma_20'] - 1
                    etf_merged['kospi_relative_strength'] = etf_merged['close'] / etf_merged['kospi_close']
                
                if 'usd_krw' in etf_merged.columns:
                    etf_merged['usd_krw_momentum'] = etf_merged['usd_krw'] / etf_merged['usd_krw_sma_20'] - 1
                    etf_merged['usd_krw_relative_strength'] = etf_merged['close'] / etf_merged['usd_krw']
                
                if 'cny_krw' in etf_merged.columns:
                    etf_merged['cny_krw_momentum'] = etf_merged['cny_krw'] / etf_merged['cny_krw_sma_20'] - 1
                    etf_merged['cny_krw_relative_strength'] = etf_merged['close'] / etf_merged['cny_krw']
                
                if 'jpy_krw' in etf_merged.columns:
                    etf_merged['jpy_krw_momentum'] = etf_merged['jpy_krw'] / etf_merged['jpy_krw_sma_20'] - 1
                    etf_merged['jpy_krw_relative_strength'] = etf_merged['close'] / etf_merged['jpy_krw']
                
                if 'oil_price' in etf_merged.columns:
                    etf_merged['oil_price_momentum'] = etf_merged['oil_price'] / etf_merged['oil_price_sma_20'] - 1
                    etf_merged['oil_price_relative_strength'] = etf_merged['close'] / etf_merged['oil_price']
                
                if 'interest_rate' in etf_merged.columns:
                    etf_merged['interest_rate_momentum'] = etf_merged['interest_rate'] / etf_merged['interest_rate_sma_20'] - 1
                    etf_merged['interest_rate_relative_strength'] = etf_merged['close'] / etf_merged['interest_rate']
                
                if 'price_index' in etf_merged.columns:
                    etf_merged['price_index_momentum'] = etf_merged['price_index'] / etf_merged['price_index_sma_20'] - 1
                    etf_merged['price_index_relative_strength'] = etf_merged['close'] / etf_merged['price_index']
                
                # 월별 데이터로 집계 (Prophet 모델용)
                etf_merged['year_month'] = etf_merged['ds'].dt.to_period('M')
                
                # 사용 가능한 컬럼만 선택하여 집계
                agg_dict = {
                    'close': 'last',
                    'open': 'first', 
                    'volume': 'mean',
                    'return': 'mean',
                    'volatility': 'mean',
                    'ds': 'last'
                }
                
                # KOSPI 관련 컬럼 추가
                if 'kospi_close' in etf_merged.columns:
                    agg_dict.update({
                        'kospi_close': 'last',
                        'kospi_return': 'mean',
                        'kospi_volatility': 'mean',
                        'kospi_momentum': 'last',
                        'kospi_relative_strength': 'last'
                    })
                
                # USD/KRW 관련 컬럼 추가 (있는 경우만)
                if 'usd_krw' in etf_merged.columns:
                    agg_dict.update({
                        'usd_krw': 'last',
                        'usd_krw_return': 'mean',
                        'usd_krw_volatility': 'mean',
                        'usd_krw_momentum': 'last',
                        'usd_krw_relative_strength': 'last'
                    })
                
                # CNY/KRW 관련 컬럼 추가 (있는 경우만)
                if 'cny_krw' in etf_merged.columns:
                    agg_dict.update({
                        'cny_krw': 'last',
                        'cny_krw_return': 'mean',
                        'cny_krw_volatility': 'mean',
                        'cny_krw_momentum': 'last',
                        'cny_krw_relative_strength': 'last'
                    })
                
                # JPY/KRW 관련 컬럼 추가 (있는 경우만)
                if 'jpy_krw' in etf_merged.columns:
                    agg_dict.update({
                        'jpy_krw': 'last',
                        'jpy_krw_return': 'mean',
                        'jpy_krw_volatility': 'mean',
                        'jpy_krw_momentum': 'last',
                        'jpy_krw_relative_strength': 'last'
                    })
                
                # 유가 관련 컬럼 추가 (있는 경우만)
                if 'oil_price' in etf_merged.columns:
                    agg_dict.update({
                        'oil_price': 'last',
                        'oil_price_return': 'mean',
                        'oil_price_volatility': 'mean',
                        'oil_price_momentum': 'last',
                        'oil_price_relative_strength': 'last'
                    })
                
                # 금리 관련 컬럼 추가 (있는 경우만)
                if 'interest_rate' in etf_merged.columns:
                    agg_dict.update({
                        'interest_rate': 'last',
                        'interest_rate_change': 'mean',
                        'interest_rate_momentum': 'last',
                        'interest_rate_relative_strength': 'last'
                    })
                
                # 물가지수 관련 컬럼 추가 (있는 경우만)
                if 'price_index' in etf_merged.columns:
                    agg_dict.update({
                        'price_index': 'last',
                        'price_index_return': 'mean',
                        'price_index_volatility': 'mean',
                        'price_index_momentum': 'last',
                        'price_index_relative_strength': 'last'
                    })
                
                etf_monthly = etf_merged.groupby(['name', 'year_month']).agg(agg_dict).reset_index()
                
                # 집계 결과에서 숫자 컬럼 결측/무한대 정리 (ETF별 그룹 내 보간 및 대체)
                numeric_cols = etf_monthly.select_dtypes(include=['number']).columns.tolist()
                if numeric_cols:
                    # Inf 처리 → NaN
                    etf_monthly[numeric_cols] = etf_monthly[numeric_cols].replace([np.inf, -np.inf], np.nan)
                    # 그룹 내 보간
                    etf_monthly[numeric_cols] = (
                        etf_monthly.groupby('name')[numeric_cols]
                        .apply(lambda g: g.ffill().bfill())
                        .reset_index(level=0, drop=True)
                    )
                    # 남은 NaN을 그룹 중앙값으로 대체 (여전히 남으면 0)
                    grp_median = etf_monthly.groupby('name')[numeric_cols].transform('median')
                    etf_monthly[numeric_cols] = etf_monthly[numeric_cols].fillna(grp_median)
                    etf_monthly[numeric_cols] = etf_monthly[numeric_cols].fillna(0)

                print("시장 데이터 병합 완료")
                print(f"병합 후 데이터: {etf_monthly.shape}")
                market_indicators = [col for col in etf_monthly.columns if any(indicator in col for indicator in ['kospi', 'usd_krw', 'cny_krw', 'jpy_krw', 'oil_price', 'interest_rate', 'price_index'])]
                print(f"사용 가능한 시장 지표: {market_indicators}")
                
                # 샘플 출력을 위한 컬럼 선택 (존재하는 컬럼만)
                sample_cols = ['name', 'close']
                if 'kospi_close' in etf_monthly.columns:
                    sample_cols.append('kospi_close')
                if 'usd_krw' in etf_monthly.columns:
                    sample_cols.append('usd_krw')
                if 'oil_price' in etf_monthly.columns:
                    sample_cols.append('oil_price')
                if 'interest_rate' in etf_monthly.columns:
                    sample_cols.append('interest_rate')
                
                print(f"시장 데이터 샘플:\n{etf_monthly[sample_cols].head()}")
                
                return etf_monthly
                
            except Exception as e:
                print(f"시장 데이터 병합 실패: {e}")
                import traceback
                traceback.print_exc()
        
        # NaN 값 제거
        etf_data = etf_data.dropna()
        
        print(f"전처리 완료: {len(etf_data)} 행, {len(etf_data.columns)} 컬럼")
        return etf_data
    
    def create_lstm_sequences(self, data, target_col='close', timesteps=None):
        """
        LSTM용 시퀀스 데이터 생성
        
        Args:
            data (pd.DataFrame): 원본 데이터
            target_col (str): 예측 대상 컬럼
            timesteps (int): 시퀀스 길이
            
        Returns:
            tuple: (X, y) 시퀀스 데이터
        """
        timesteps = timesteps or self.config['lstm_timesteps']
        
        # 특성 선택
        feature_cols = ['close', 'volume', 'return', 'volatility']
        if 'kospi_close' in data.columns:
            feature_cols.extend(['kospi_close', 'kospi_return'])
        
        # 사용 가능한 특성만 선택
        available_features = [col for col in feature_cols if col in data.columns]

        # 스케일링 전 결측/무한대 정리 및 보간
        features_df = data[available_features].copy()
        features_df = features_df.replace([np.inf, -np.inf], np.nan)
        features_df = features_df.ffill().bfill()
        medians = features_df.median(numeric_only=True)
        features_df = features_df.fillna(medians)
        features_df = features_df.fillna(0)

        # 데이터 정규화
        scaled_data = self.lstm_scaler.fit_transform(features_df)
        
        X, y = [], []
        for i in range(timesteps, len(scaled_data)):
            X.append(scaled_data[i-timesteps:i])
            y.append(scaled_data[i, available_features.index(target_col)])
        
        return np.array(X), np.array(y)
    
    def build_lstm_model(self, input_shape):
        """
        LSTM 모델 구축
        
        Args:
            input_shape (tuple): 입력 데이터 형태
            
        Returns:
            tf.keras.Model: LSTM 모델
        """
        model = Sequential([
            LSTM(self.config['lstm_units'][0], return_sequences=True, 
                 input_shape=input_shape),
            Dropout(self.config['lstm_dropout']),
            LSTM(self.config['lstm_units'][1], return_sequences=False),
            Dropout(self.config['lstm_dropout']),
            Dense(16, activation='relu'),
            Dense(1, activation='linear')
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train_lstm_model(self, etf_data, etf_code, epochs=100):
        """
        특정 ETF에 대한 LSTM 모델 학습
        
        Args:
            etf_data (pd.DataFrame): ETF 데이터
            etf_code (str): ETF 코드
            epochs (int): 학습 에포크
            
        Returns:
            dict: 학습 결과
        """
        print(f"ETF {etf_code} LSTM 모델 학습 중...")
        
        # 특정 ETF 데이터 필터링
        etf_specific = etf_data[etf_data['name'] == etf_code].copy()
        
        if len(etf_specific) < self.config['lstm_timesteps'] + 5:  # 10 → 5로 완화
            print(f"ETF {etf_code} 데이터 부족: {len(etf_specific)} 행 (최소 {self.config['lstm_timesteps'] + 5} 필요)")
            return None
        
        # 시퀀스 데이터 생성
        X, y = self.create_lstm_sequences(etf_specific)
        
        if len(X) < 5:  # 10 → 5로 완화
            print(f"ETF {etf_code} 시퀀스 데이터 부족: {len(X)} 시퀀스 (최소 5 필요)")
            return None
        
        # 학습/검증 분할
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # 모델 구축
        model = self.build_lstm_model((X.shape[1], X.shape[2]))
        
        # Early stopping
        early_stopping = EarlyStopping(
            monitor='val_loss', patience=20, restore_best_weights=True
        )
        
        # 모델 학습
        history = model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            callbacks=[early_stopping],
            verbose=0
        )
        
        # 예측
        train_pred = model.predict(X_train)
        val_pred = model.predict(X_val)
        
        # 역정규화
        train_pred_denorm = self.lstm_scaler.inverse_transform(
            np.concatenate([np.zeros((len(train_pred), X.shape[2]-1)), train_pred], axis=1)
        )[:, -1]
        y_train_denorm = self.lstm_scaler.inverse_transform(
            np.concatenate([np.zeros((len(y_train), X.shape[2]-1)), y_train.reshape(-1, 1)], axis=1)
        )[:, -1]
        
        # 성능 평가
        train_rmse = np.sqrt(mean_squared_error(y_train_denorm, train_pred_denorm))
        val_rmse = np.sqrt(mean_squared_error(y_val, val_pred))
        
        print(f"ETF {etf_code} LSTM 학습 완료 - Train RMSE: {train_rmse:.4f}, Val RMSE: {val_rmse:.4f}")
        
        return {
            'model': model,
            'scaler': self.lstm_scaler,
            'history': history,
            'train_rmse': train_rmse,
            'val_rmse': val_rmse,
            'input_shape': X.shape[1:]
        }
    
    def train_prophet_model(self, etf_data, etf_code, regressor_cols=None):
        """
        특정 ETF에 대한 Prophet 모델 학습 (KOSPI 회귀 변수 개선)
        
        Args:
            etf_data (pd.DataFrame): ETF 데이터
            etf_code (str): ETF 코드
            regressor_cols (list): 추가 회귀 변수 컬럼명
            
        Returns:
            Prophet: 학습된 Prophet 모델
        """
        print(f"ETF {etf_code} Prophet 모델 학습 중...")
        
        # 특정 ETF 데이터 필터링
        etf_specific = etf_data[etf_data['name'] == etf_code].copy()
        
        if len(etf_specific) < 10:
            print(f"ETF {etf_code} 데이터 부족: {len(etf_specific)} 행")
            return None
        
        # Prophet용 데이터 준비
        prophet_data = etf_specific[['ds', 'close']].copy()
        prophet_data.columns = ['ds', 'y']
        
        # Prophet 모델 초기화 (하이퍼파라미터 튜닝)
        model = Prophet(
            changepoint_prior_scale=0.25,  # 더 민감한 변화점 감지
            changepoint_range=0.8,
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode='multiplicative',  # 계절성을 곱셈 모드로
            interval_width=0.8  # 예측 구간 폭
        )
        
        # 월별 계절성 추가 (더 복잡한 패턴 감지)
        model.add_seasonality(name='monthly', period=30.5, fourier_order=10)
        
        # 시장 데이터 회귀 변수 추가 (KOSPI + 환율, 개선된 버전)
        market_regressors = [
            # KOSPI 관련 변수
            'kospi_close', 'kospi_return', 'kospi_volatility', 
            'kospi_momentum', 'kospi_relative_strength',
            # 환율 관련 변수
            'usd_krw', 'usd_krw_return', 'usd_krw_volatility',
            'usd_krw_momentum', 'usd_krw_relative_strength'
        ]
        
        available_market_regressors = [col for col in market_regressors if col in etf_specific.columns]
        
        if available_market_regressors:
            print(f"사용 가능한 시장 회귀 변수: {available_market_regressors}")
            
            for col in available_market_regressors:
                # 각 회귀 변수에 대해 최적의 모드 선택
                if col in ['kospi_close', 'kospi_relative_strength', 'usd_krw', 'usd_krw_relative_strength']:
                    mode = 'multiplicative'  # 가격 관련은 곱셈 모드
                else:
                    mode = 'additive'  # 수익률, 변동성은 덧셈 모드
                
                model.add_regressor(col, mode=mode)
                prophet_data[col] = etf_specific[col]
                # print(f"회귀 변수 추가: {col} (모드: {mode})")
        
        # 추가 회귀 변수 (사용자 지정)
        if regressor_cols:
            for col in regressor_cols:
                if col in etf_specific.columns and col not in available_market_regressors:
                    model.add_regressor(col, mode='additive')
                    prophet_data[col] = etf_specific[col]
        
        # 모델 학습
        try:
            model.fit(prophet_data)
            total_regressors = len(available_market_regressors) + (len(regressor_cols) if regressor_cols else 0)
            print(f"ETF {etf_code} Prophet 학습 완료 (회귀 변수: {total_regressors}개)")
            return model
        except Exception as e:
            print(f"ETF {etf_code} Prophet 학습 실패: {e}")
            return None
    
    def predict_returns(self, etf_data, etf_code, periods=12):
        """
        특정 ETF의 수익률 예측
        
        Args:
            etf_data (pd.DataFrame): ETF 데이터
            etf_code (str): ETF 코드
            periods (int): 예측 기간
            
        Returns:
            dict: 예측 결과
        """
        print(f"ETF {etf_code} 수익률 예측 중...")
        
        # LSTM 예측
        lstm_result = self.train_lstm_model(etf_data, etf_code)
        if lstm_result is None:
            return None
        
        # Prophet 예측
        regressor_cols = ['kospi_close'] if 'kospi_close' in etf_data.columns else None
        prophet_model = self.train_prophet_model(etf_data, etf_code, regressor_cols)
        if prophet_model is None:
            return None
        
        # 미래 데이터프레임 생성
        future = prophet_model.make_future_dataframe(periods=periods, freq='M')
        
        # 시장 데이터 회귀 변수 미래 값 예측 (KOSPI + 환율, 개선된 버전)
        market_regressors = [
            # KOSPI 관련 변수
            'kospi_close', 'kospi_return', 'kospi_volatility', 
            'kospi_momentum', 'kospi_relative_strength',
            # 환율 관련 변수
            'usd_krw', 'usd_krw_return', 'usd_krw_volatility',
            'usd_krw_momentum', 'usd_krw_relative_strength'
        ]
        
        available_market_regressors = [col for col in market_regressors if col in etf_data.columns]
        
        if available_market_regressors:
            print(f"시장 회귀 변수 미래 값 예측 중...")
            
            for col in available_market_regressors:
                etf_specific = etf_data[etf_data['name'] == etf_code]
                last_values = etf_specific[col].tail(12)  # 최근 12개월 데이터 사용
                
                if len(last_values) > 3:
                    if col in ['kospi_close', 'usd_krw']:
                        # 가격 지표는 선형 추세 + 계절성 고려
                        trend = np.polyfit(range(len(last_values)), last_values, 1)[0]
                        seasonal_factor = self._calculate_seasonal_factor(last_values)
                        future_values = []
                        for i in range(len(future)):
                            base_value = last_values.iloc[-1] + trend * (i + 1)
                            seasonal_adj = seasonal_factor[i % 12] if len(seasonal_factor) > 0 else 1.0
                            future_values.append(base_value * seasonal_adj)
                        future[col] = future_values
                        
                    elif col in ['kospi_return', 'usd_krw_return']:
                        # 수익률은 평균값 사용 (평균 회귀 특성)
                        mean_return = last_values.mean()
                        std_return = last_values.std()
                        future[col] = np.random.normal(mean_return, std_return * 0.5, len(future))
                        
                    elif col in ['kospi_volatility', 'usd_krw_volatility']:
                        # 변동성은 최근 평균값 사용
                        mean_vol = last_values.mean()
                        future[col] = [mean_vol] * len(future)
                        
                    elif col in ['kospi_momentum', 'usd_krw_momentum']:
                        # 모멘텀은 점진적 감소 (평균 회귀)
                        last_momentum = last_values.iloc[-1]
                        future[col] = [last_momentum * (0.9 ** i) for i in range(len(future))]
                        
                    elif col in ['kospi_relative_strength', 'usd_krw_relative_strength']:
                        # 상대강도는 최근 평균값 사용
                        mean_rs = last_values.mean()
                        future[col] = [mean_rs] * len(future)
                        
                    print(f"{col} 미래 값 예측 완료")
                else:
                    # 데이터가 부족한 경우 최근 값으로 채움
                    future[col] = [last_values.iloc[-1]] * len(future) if len(last_values) > 0 else [0] * len(future)
        
        # 추가 회귀 변수 (사용자 지정)
        if regressor_cols:
            for col in regressor_cols:
                if col in etf_data.columns and col not in available_market_regressors:
                    # 간단한 선형 추세로 미래 값 예측
                    last_values = etf_data[etf_data['name'] == etf_code][col].tail(5)
                    if len(last_values) > 0:
                        trend = np.polyfit(range(len(last_values)), last_values, 1)[0]
                        future[col] = [last_values.iloc[-1] + trend * i for i in range(len(future))]
        
        # 현재 가격 미리 계산
        etf_specific = etf_data[etf_data['name'] == etf_code].copy()
        current_price = etf_specific['close'].iloc[-1]
        
        # Prophet 예측
        try:
            prophet_forecast = prophet_model.predict(future)
            prophet_pred = prophet_forecast['yhat'].tail(periods).values
            
            # NaN 값 확인 및 처리
            if np.any(np.isnan(prophet_pred)):
                print(f"Prophet 예측에 NaN 값이 있습니다. 최근 가격으로 대체합니다.")
                prophet_pred = np.full(periods, current_price)
        except Exception as e:
            print(f"Prophet 예측 실패: {e}")
            prophet_pred = np.full(periods, current_price)
        
        # LSTM으로 미래 예측 (간단한 방식)
        
        try:
            X_future, _ = self.create_lstm_sequences(etf_specific)
            
            if len(X_future) > 0:
                lstm_future_pred = lstm_result['model'].predict(X_future[-1:])
                lstm_pred = self.lstm_scaler.inverse_transform(
                    np.concatenate([np.zeros((1, X_future.shape[2]-1)), lstm_future_pred], axis=1)
                )[:, -1]
                
                # NaN 값 확인 및 처리
                if np.any(np.isnan(lstm_pred)):
                    print(f"LSTM 예측에 NaN 값이 있습니다. 최근 가격으로 대체합니다.")
                    current_price = etf_specific['close'].iloc[-1]
                    lstm_pred = np.array([current_price])
            else:
                current_price = etf_specific['close'].iloc[-1]
                lstm_pred = np.array([current_price])
        except Exception as e:
            print(f"LSTM 예측 실패: {e}")
            current_price = etf_specific['close'].iloc[-1]
            lstm_pred = np.array([current_price])
        
        # 앙상블 예측
        alpha = self.config['ensemble_alpha']
        
        # 길이 맞추기
        min_len = min(len(lstm_pred), len(prophet_pred))
        if min_len > 0:
            ensemble_pred = alpha * lstm_pred[:min_len] + (1 - alpha) * prophet_pred[:min_len]
        else:
            ensemble_pred = np.array([current_price])
        
        # NaN 값 최종 확인
        if np.any(np.isnan(ensemble_pred)):
            print(f"앙상블 예측에 NaN 값이 있습니다. 최근 가격으로 대체합니다.")
            ensemble_pred = np.full(len(ensemble_pred), current_price)
        
        # 수익률로 변환
        predicted_returns = (ensemble_pred - current_price) / current_price
        
        # 수익률 NaN 확인
        if np.any(np.isnan(predicted_returns)):
            print(f"예측 수익률에 NaN 값이 있습니다. 0으로 대체합니다.")
            predicted_returns = np.zeros_like(predicted_returns)
        
        print(f"ETF {etf_code} 예측 완료")
        
        return {
            'etf_code': etf_code,
            'current_price': current_price,
            'predicted_prices': ensemble_pred,
            'predicted_returns': predicted_returns,
            'lstm_pred': lstm_pred,
            'prophet_pred': prophet_pred,
            'ensemble_pred': ensemble_pred,
            'lstm_model': lstm_result['model'] if lstm_result else None,
            'prophet_model': prophet_model
        }
    
    def predict_with_trained_models(self, etf_data, etf_code, periods=12):
        """
        이미 학습된 모델을 사용하여 예측 (재학습 없음)
        
        Args:
            etf_data (pd.DataFrame): ETF 데이터
            etf_code (str): ETF 코드
            periods (int): 예측 기간
            
        Returns:
            dict: 예측 결과
        """
        print(f"ETF {etf_code} 학습된 모델로 예측 중...")
        
        # 특정 ETF 데이터 필터링
        etf_specific = etf_data[etf_data['name'] == etf_code].copy()
        current_price = etf_specific['close'].iloc[-1]
        
        # Prophet 예측 (이미 학습된 모델 사용)
        if hasattr(self, 'prophet_models') and etf_code in self.prophet_models:
            prophet_model = self.prophet_models[etf_code]
            
            # 미래 데이터프레임 생성
            future = prophet_model.make_future_dataframe(periods=periods, freq='M')
            
            # Prophet 예측
            try:
                prophet_forecast = prophet_model.predict(future)
                prophet_pred = prophet_forecast['yhat'].tail(periods).values
                
                # NaN 값 확인 및 처리
                if np.any(np.isnan(prophet_pred)):
                    print(f"Prophet 예측에 NaN 값이 있습니다. 최근 가격으로 대체합니다.")
                    prophet_pred = np.full(periods, current_price)
            except Exception as e:
                print(f"Prophet 예측 실패: {e}")
                prophet_pred = np.full(periods, current_price)
        else:
            print("Prophet 모델을 찾을 수 없습니다. 최근 가격으로 대체합니다.")
            prophet_pred = np.full(periods, current_price)
        
        # LSTM 예측 (이미 학습된 모델 사용)
        if hasattr(self, 'lstm_models') and etf_code in self.lstm_models:
            lstm_model = self.lstm_models[etf_code]
            
            try:
                X_future, _ = self.create_lstm_sequences(etf_specific)
                
                if len(X_future) > 0:
                    lstm_future_pred = lstm_model.predict(X_future[-1:])
                    lstm_pred = self.lstm_scaler.inverse_transform(
                        np.concatenate([np.zeros((1, X_future.shape[2]-1)), lstm_future_pred], axis=1)
                    )[:, -1]
                    
                    # NaN 값 확인 및 처리
                    if np.any(np.isnan(lstm_pred)):
                        print(f"LSTM 예측에 NaN 값이 있습니다. 최근 가격으로 대체합니다.")
                        lstm_pred = np.array([current_price])
                else:
                    lstm_pred = np.array([current_price])
            except Exception as e:
                print(f"LSTM 예측 실패: {e}")
                lstm_pred = np.array([current_price])
        else:
            print("LSTM 모델을 찾을 수 없습니다. 최근 가격으로 대체합니다.")
            lstm_pred = np.array([current_price])
        
        # 앙상블 예측
        alpha = self.config['ensemble_alpha']
        
        # 길이 맞추기
        min_len = min(len(lstm_pred), len(prophet_pred))
        if min_len > 0:
            ensemble_pred = alpha * lstm_pred[:min_len] + (1 - alpha) * prophet_pred[:min_len]
        else:
            ensemble_pred = np.array([current_price])
        
        # NaN 값 최종 확인
        if np.any(np.isnan(ensemble_pred)):
            print(f"앙상블 예측에 NaN 값이 있습니다. 최근 가격으로 대체합니다.")
            ensemble_pred = np.full(len(ensemble_pred), current_price)
        
        # 수익률로 변환
        predicted_returns = (ensemble_pred - current_price) / current_price
        
        # 수익률 NaN 확인
        if np.any(np.isnan(predicted_returns)):
            print(f"예측 수익률에 NaN 값이 있습니다. 0으로 대체합니다.")
            predicted_returns = np.zeros_like(predicted_returns)
        
        print(f"ETF {etf_code} 학습된 모델로 예측 완료")
        
        return {
            'etf_code': etf_code,
            'current_price': current_price,
            'predicted_prices': ensemble_pred,
            'predicted_returns': predicted_returns,
            'lstm_pred': lstm_pred,
            'prophet_pred': prophet_pred,
            'ensemble_pred': ensemble_pred
        }
    
    def train_profile_model(self, user_data):
        """
        사용자 프로필 모델 학습
        
        Args:
            user_data (pd.DataFrame): 사용자 데이터
        """
        print("사용자 프로필 모델 학습 중...")
        
        # 사용자 특성 선택 (실제 데이터 구조에 맞게 조정 필요)
        feature_cols = ['age', 'income', 'investment_experience', 'risk_tolerance']
        available_features = [col for col in feature_cols if col in user_data.columns]
        
        if len(available_features) < 2:
            print("사용자 특성 부족")
            return
        
        X = user_data[available_features]
        y = user_data['risk_type'] if 'risk_type' in user_data.columns else None
        
        if y is None:
            # 위험도 자동 계산
            y = self._calculate_risk_profile(user_data)
        
        # Random Forest 모델 학습
        self.profile_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.profile_model.fit(X, y)
        
        print("사용자 프로필 모델 학습 완료")
    
    def _calculate_risk_profile(self, user_data):
        """사용자 위험도 프로필 자동 계산"""
        # 간단한 규칙 기반 위험도 계산
        risk_scores = []
        
        for _, user in user_data.iterrows():
            score = 0
            
            # 나이 기반
            if user.get('age', 30) < 30:
                score += 2  # 공격적
            elif user.get('age', 30) < 50:
                score += 1  # 중간
            else:
                score += 0  # 보수적
            
            # 소득 기반
            if user.get('income', 5000) > 8000:
                score += 1
            elif user.get('income', 5000) > 5000:
                score += 0
            else:
                score -= 1
            
            # 투자 경험 기반
            if user.get('investment_experience', 0) > 5:
                score += 1
            elif user.get('investment_experience', 0) > 2:
                score += 0
            else:
                score -= 1
            
            # 위험도 분류
            if score >= 2:
                risk_scores.append('aggressive')
            elif score >= 0:
                risk_scores.append('moderate')
            else:
                risk_scores.append('conservative')
        
        return np.array(risk_scores)
    
    def _calculate_seasonal_factor(self, data):
        """
        계절성 팩터 계산 (월별 패턴)
        
        Args:
            data (pd.Series): 시계열 데이터
            
        Returns:
            list: 월별 계절성 팩터
        """
        if len(data) < 12:
            return []
        
        # 월별 평균 계산
        monthly_means = []
        for month in range(12):
            month_data = data[data.index % 12 == month]
            if len(month_data) > 0:
                monthly_means.append(month_data.mean())
            else:
                monthly_means.append(data.mean())
        
        # 전체 평균 대비 비율 계산
        overall_mean = np.mean(monthly_means)
        seasonal_factors = [mean / overall_mean for mean in monthly_means]
        
        return seasonal_factors
    
    def optimize_portfolio(self, expected_returns, cov_matrix, risk_profile, risk_limit):
        """
        포트폴리오 최적화 (마코위츠) - 개선된 버전
        
        Args:
            expected_returns (np.array): 예상 수익률
            cov_matrix (np.array): 공분산 행렬
            risk_profile (str): 위험도 프로필
            risk_limit (float): 위험 한도
            
        Returns:
            np.array: 최적 가중치
        """
        n = len(expected_returns)
        print(f"포트폴리오 최적화 시작: {n}개 자산, 위험도 프로필: {risk_profile}")
        
        # 1. 입력 데이터 검증 및 정규화
        expected_returns = np.array(expected_returns)
        
        # 예상 수익률 정규화 (극값 제거)
        if np.std(expected_returns) > 0:
            expected_returns = np.clip(expected_returns, 
                                     np.percentile(expected_returns, 5), 
                                     np.percentile(expected_returns, 95))
        
        # 2. 공분산 행렬 안정성 확인 및 수정
        if np.any(np.isnan(cov_matrix)) or np.any(np.isinf(cov_matrix)):
            print("공분산 행렬에 NaN/Inf 값이 있습니다. 단위 행렬로 대체합니다.")
            cov_matrix = np.eye(n) * 0.01
        
        # 공분산 행렬이 양의 정부호인지 확인
        try:
            np.linalg.cholesky(cov_matrix)
        except np.linalg.LinAlgError:
            print("공분산 행렬이 양의 정부호가 아닙니다. 정규화합니다.")
            # 대각선 요소에 작은 값 추가
            cov_matrix = cov_matrix + np.eye(n) * 1e-4
        
        # 3. 목적 함수 정의 (개선된 버전)
        def objective(weights):
            try:
                port_return = np.dot(weights, expected_returns)
                port_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
                risk_aversion = {'conservative': 1.5, 'moderate': 1.0, 'aggressive': 0.5}[risk_profile]
                return -(port_return - risk_aversion * port_risk)
            except:
                return 1e6  # 오류 시 큰 값 반환
        
        # 4. 제약 조건 단순화 (더 관대하게)
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}  # 가중치 합 = 1
        ]
        
        # 5. 경계 조건 완화 (더 유연하게)
        bounds = tuple((0.001, 0.95) for _ in range(n))  # 더 넓은 범위
        
        # 6. 여러 최적화 방법 시도
        methods = ['SLSQP', 'L-BFGS-B', 'TNC']
        best_result = None
        best_value = float('inf')
        
        for method in methods:
            for attempt in range(3):
                try:
                    # 초기값 생성
                    if attempt == 0:
                        initial_weights = np.repeat(1/n, n)
                    else:
                        np.random.seed(42 + attempt)
                        initial_weights = np.random.dirichlet(np.ones(n))
                    
                    # 최적화 시도
                    if method == 'SLSQP':
                        result = minimize(
                            objective, initial_weights,
                            method=method,
                            bounds=bounds,
                            constraints=constraints,
                            options={
                                'maxiter': 1000,
                                'ftol': 1e-6,
                                'eps': 1e-6
                            }
                        )
                    else:
                        # 제약 조건이 없는 방법들
                        result = minimize(
                            objective, initial_weights,
                            method=method,
                            bounds=bounds,
                            options={
                                'maxiter': 1000,
                                'ftol': 1e-6
                            }
                        )
                        # 제약 조건 수동 검증
                        if abs(np.sum(result.x) - 1) > 0.01:
                            result.x = result.x / np.sum(result.x)
                    
                    if result.success and result.fun < best_value:
                        best_result = result
                        best_value = result.fun
                        print(f"최적화 성공 ({method}, 시도 {attempt + 1}): 목적함수 값 = {result.fun:.6f}")
                        break
                        
                except Exception as e:
                    print(f"최적화 실패 ({method}, 시도 {attempt + 1}): {e}")
                    continue
        
        # 7. 결과 반환
        if best_result is not None:
            weights = best_result.x
            # 가중치 정규화
            weights = np.maximum(weights, 0)  # 음수 제거
            weights = weights / np.sum(weights)  # 정규화
            print(f"포트폴리오 최적화 성공: 최종 목적함수 값 = {best_value:.6f}")
            return weights
        else:
            print("모든 최적화 시도가 실패했습니다. 균등 가중치를 사용합니다.")
            return np.repeat(1/n, n)
    
    def recommend_portfolio(self, user_profile, etf_data, top_k=5):
        """
        사용자별 포트폴리오 추천
        
        Args:
            user_profile (dict): 사용자 프로필
            etf_data (pd.DataFrame): ETF 데이터
            top_k (int): 추천 상품 수
            
        Returns:
            dict: 추천 결과
        """
        print("포트폴리오 추천 생성 중...")
        
        # 위험도 프로필 예측
        if self.profile_model:
            risk_profile = self.profile_model.predict([list(user_profile.values())])[0]
        else:
            risk_profile = 'moderate'  # 기본값
        
        # 고유 ETF 이름 목록
        unique_etfs = etf_data['name'].unique()
        
        # 각 ETF의 수익률 예측
        predictions = {}
        for etf_code in unique_etfs:
            pred = self.predict_returns(etf_data, etf_code)
            if pred:
                predictions[etf_code] = pred
                # 학습된 모델 저장 (성능 평가용)
                if not hasattr(self, 'lstm_models'):
                    self.lstm_models = {}
                if not hasattr(self, 'prophet_models'):
                    self.prophet_models = {}
                
                # LSTM 모델 저장
                if 'lstm_model' in pred:
                    self.lstm_models[etf_code] = pred['lstm_model']
                
                # Prophet 모델 저장
                if 'prophet_model' in pred:
                    self.prophet_models[etf_code] = pred['prophet_model']
        
        if not predictions:
            print("예측 결과가 없습니다.")
            return None
        
        # 예상 수익률 및 공분산 행렬 생성
        etf_codes = list(predictions.keys())
        expected_returns = np.array([predictions[code]['predicted_returns'].mean() 
                                   for code in etf_codes])
        
        # 공분산 행렬 생성 (개선된 방식)
        returns_data = []
        for code in etf_codes:
            etf_specific = etf_data[etf_data['name'] == code]
            if len(etf_specific) > 0:
                returns = etf_specific['return'].values
                # NaN 값 제거 및 극값 클리핑
                returns = returns[~np.isnan(returns)]
                if len(returns) > 0:
                    returns = np.clip(returns, np.percentile(returns, 1), np.percentile(returns, 99))
                    returns_data.append(returns)
        
        if len(returns_data) > 1:
            # 길이 맞추기 (최소 10개 데이터 필요)
            min_length = max(10, min(len(ret) for ret in returns_data))
            returns_array = np.array([ret[:min_length] for ret in returns_data])
            
            # 공분산 행렬 계산
            try:
                cov_matrix = np.cov(returns_array)
                # 공분산 행렬 안정성 확인
                if np.any(np.isnan(cov_matrix)) or np.any(np.isinf(cov_matrix)):
                    print("공분산 행렬 계산 실패. 대체 행렬 사용.")
                    cov_matrix = np.eye(len(etf_codes)) * 0.01
            except:
                print("공분산 행렬 계산 오류. 대체 행렬 사용.")
                cov_matrix = np.eye(len(etf_codes)) * 0.01
        else:
            # 단순 공분산 행렬
            n = len(etf_codes)
            cov_matrix = np.eye(n) * 0.01
            print("수익률 데이터 부족. 단위 행렬 사용.")
        
        # 위험도별 한도 설정
        risk_limits = {'conservative': 0.3, 'moderate': 0.6, 'aggressive': 0.8}
        risk_limit = risk_limits.get(risk_profile, 0.6)
        
        # 포트폴리오 최적화
        optimal_weights = self.optimize_portfolio(
            expected_returns, cov_matrix, risk_profile, risk_limit
        )
        
        # Top-K 추천
        sorted_indices = np.argsort(optimal_weights)[::-1][:top_k]
        recommended_etfs = []
        
        for idx in sorted_indices:
            etf_code = etf_codes[idx]
            etf_info = etf_data[etf_data['name'] == etf_code].iloc[-1]
            
            recommended_etfs.append({
                'etf_code': etf_code,
                'etf_name': etf_info.get('name', f'ETF_{etf_code}'),
                'current_price': etf_info['close'],
                'expected_return': expected_returns[idx],
                'weight': optimal_weights[idx],
                'risk_score': np.sqrt(cov_matrix[idx, idx])
            })
        
        # 포트폴리오 요약
        portfolio_summary = {
            'user_risk_profile': risk_profile,
            'total_expected_return': np.sum(optimal_weights * expected_returns),
            'portfolio_risk': np.sqrt(np.dot(optimal_weights.T, np.dot(cov_matrix, optimal_weights))),
            'diversification_score': 1 - np.sum(optimal_weights ** 2),  # Herfindahl 지수
            'recommended_etfs': recommended_etfs
        }
        
        print("포트폴리오 추천 완료")
        return portfolio_summary
    
    def run_automated_recommendation(self, etf_data_path, market_data_path=None, 
                                   user_profiles=None, output_path='recommendations.json'):
        """
        자동화된 추천 시스템 실행
        
        Args:
            etf_data_path (str): ETF 데이터 파일 경로
            market_data_path (str): KOSPI 데이터 파일 경로
            user_profiles (list): 사용자 프로필 리스트
            output_path (str): 결과 저장 경로
        """
        print("=== 하이브리드 추천 시스템 시작 ===")
        
        # 1. 데이터 전처리
        etf_data = self.prepare_etf_data(etf_data_path, market_data_path)
        
        # 2. 사용자 프로필 모델 학습 (데이터가 있는 경우)
        if user_profiles:
            user_df = pd.DataFrame(user_profiles)
            self.train_profile_model(user_df)
        
        # 3. 샘플 사용자 프로필 생성 (데이터가 없는 경우)
        if not user_profiles:
            sample_users = [
                {'age': 25, 'income': 4000, 'investment_experience': 1, 'risk_tolerance': 3},
                {'age': 35, 'income': 6000, 'investment_experience': 3, 'risk_tolerance': 2},
                {'age': 45, 'income': 8000, 'investment_experience': 5, 'risk_tolerance': 1}
            ]
            user_profiles = sample_users
        
        # 4. 각 사용자별 포트폴리오 추천
        all_recommendations = {}
        
        for i, user_profile in enumerate(user_profiles):
            print(f"\n사용자 {i+1} 포트폴리오 추천 중...")
            
            recommendation = self.recommend_portfolio(user_profile, etf_data)
            if recommendation:
                all_recommendations[f'user_{i+1}'] = {
                    'profile': user_profile,
                    'recommendation': recommendation
                }
        
        # 학습된 모델들을 저장 (성능 평가용)
        self.trained_models = {}
        for user_key, user_data in all_recommendations.items():
            if user_data['recommendation'] and 'recommended_etfs' in user_data['recommendation']:
                for etf in user_data['recommendation']['recommended_etfs']:
                    etf_name = etf['etf_name']
                    if etf_name not in self.trained_models:
                        # 이미 학습된 모델이 있다면 재사용
                        if hasattr(self, 'lstm_models') and etf_name in self.lstm_models:
                            self.trained_models[etf_name] = {
                                'lstm_model': self.lstm_models[etf_name],
                                'prophet_model': self.prophet_models.get(etf_name)
                            }
        
        # 5. 결과 저장
        import json
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_recommendations, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"\n=== 추천 시스템 완료 ===")
        print(f"결과가 {output_path}에 저장되었습니다.")
        
        return all_recommendations
    
    def visualize_recommendations(self, recommendations, save_path=None):
        """
        추천 결과 시각화
        
        Args:
            recommendations (dict): 추천 결과
            save_path (str): 저장 경로
        """
        n_users = len(recommendations)
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('하이브리드 추천 시스템 결과', fontsize=16)
        
        # 1. 위험도 프로필 분포
        risk_profiles = [rec['recommendation']['user_risk_profile'] 
                        for rec in recommendations.values()]
        risk_counts = pd.Series(risk_profiles).value_counts()
        
        axes[0, 0].pie(risk_counts.values, labels=risk_counts.index, autopct='%1.1f%%')
        axes[0, 0].set_title('사용자 위험도 프로필 분포')
        
        # 2. 예상 수익률 vs 위험도
        returns = [rec['recommendation']['total_expected_return'] 
                  for rec in recommendations.values()]
        risks = [rec['recommendation']['portfolio_risk'] 
                for rec in recommendations.values()]
        
        axes[0, 1].scatter(risks, returns, alpha=0.7)
        axes[0, 1].set_xlabel('포트폴리오 위험도')
        axes[0, 1].set_ylabel('예상 수익률')
        axes[0, 1].set_title('수익률 vs 위험도')
        
        # 3. ETF 추천 빈도
        all_etfs = []
        for rec in recommendations.values():
            for etf in rec['recommendation']['recommended_etfs']:
                all_etfs.append(etf['etf_code'])
        
        etf_counts = pd.Series(all_etfs).value_counts().head(10)
        axes[1, 0].bar(range(len(etf_counts)), etf_counts.values)
        axes[1, 0].set_xticks(range(len(etf_counts)))
        axes[1, 0].set_xticklabels(etf_counts.index, rotation=45)
        axes[1, 0].set_title('Top 10 추천 ETF')
        axes[1, 0].set_ylabel('추천 횟수')
        
        # 4. 포트폴리오 다양성 점수
        diversity_scores = [rec['recommendation']['diversification_score'] 
                           for rec in recommendations.values()]
        
        axes[1, 1].hist(diversity_scores, bins=10, alpha=0.7, edgecolor='black')
        axes[1, 1].set_xlabel('다양성 점수')
        axes[1, 1].set_ylabel('사용자 수')
        axes[1, 1].set_title('포트폴리오 다양성 분포')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"시각화 결과가 {save_path}에 저장되었습니다.")
        
        plt.show()

    def build_eval_frame(self, etf_specific: pd.DataFrame, predicted_prices: np.ndarray, price_col: str = 'close') -> pd.DataFrame:
        """예측 가격 배열을 실제 시계열과 길이를 맞춰 평가용 프레임으로 구성합니다.
        최근 len(predicted_prices) 구간의 실제 가격과 매칭합니다.
        """
        if len(etf_specific) == 0 or predicted_prices is None or len(predicted_prices) == 0:
            raise ValueError('평가용 데이터가 부족합니다.')
        etf_specific = etf_specific.sort_values('ds').copy()
        tail_len = min(len(etf_specific), len(predicted_prices))
        eval_df = etf_specific.tail(tail_len).copy()
        eval_df['predicted_prices'] = np.array(predicted_prices)[-tail_len:]
        return eval_df

    def evaluate_predictions(self, df: pd.DataFrame, price_col: str = 'close', pred_col: str = 'predicted_prices') -> dict:
        """예측 성능을 정량 평가합니다.
        반환: MAE, RMSE, 방향정확도, 스피어만 IC, 표본수
        """
        df = df.sort_values('ds').copy()
        # 수치형 변환 안전장치
        df[price_col] = pd.to_numeric(df[price_col], errors='coerce')
        df[pred_col] = pd.to_numeric(df[pred_col], errors='coerce')
        df = df.dropna(subset=[price_col, pred_col])
        if len(df) < 1:
            return {'MAE': np.nan, 'RMSE': np.nan, 'Direction_Accuracy': np.nan, 'IC_spearman': np.nan, 'N': len(df)}
        
        # 데이터가 부족한 경우 기본값 사용
        if len(df) < 3:
            print(f"평가 데이터 부족 ({len(df)}개). 기본값으로 평가합니다.")
            mae = float(np.mean(np.abs(df[pred_col].values - df[price_col].values))) if len(df) > 0 else 0.0
            rmse = float(np.sqrt(np.mean((df[pred_col].values - df[price_col].values) ** 2))) if len(df) > 0 else 0.0
            direction_acc = 0.5  # 기본값 (랜덤)
            ic = 0.0  # 기본값
            return {'MAE': mae, 'RMSE': rmse, 'Direction_Accuracy': direction_acc, 'IC_spearman': ic, 'N': len(df)}
        # 오차 지표 (가격 기준)
        mae = float(np.mean(np.abs(df[pred_col].values - df[price_col].values)))
        rmse = float(np.sqrt(np.mean((df[pred_col].values - df[price_col].values) ** 2)))
        # 수익률 기반 지표
        df['ret_actual'] = df[price_col].pct_change()
        df['ret_pred'] = df[pred_col].pct_change()
        valid = df[['ret_actual', 'ret_pred']].dropna()
        if len(valid) == 0:
            direction_acc = np.nan
            ic = np.nan
        else:
            direction_acc = float(np.mean(np.sign(valid['ret_actual']) == np.sign(valid['ret_pred'])))
            ic = float(valid['ret_actual'].corr(valid['ret_pred'], method='spearman'))
        return {
            'MAE': mae,
            'RMSE': rmse,
            'Direction_Accuracy': direction_acc,
            'IC_spearman': ic,
            'N': int(len(valid))
        }
    
    def validate_80_20(self, etf_data: pd.DataFrame, etf_code: str, min_required: int = None) -> dict:
        """시계열 80:20 검증을 수행합니다 (시간 순서 유지).
        - 앞 80%로 학습, 뒤 20%로 테스트
        - 표본이 충분할 때만 실행
        반환: LSTM/Prophet/Ensemble의 MAE, RMSE, 방향정확도, 표본수
        """
        print(f"ETF {etf_code} 80:20 검증 시작...")
        etf_specific = etf_data[etf_data['name'] == etf_code].copy()
        etf_specific = etf_specific.sort_values('ds')
        n = len(etf_specific)
        timesteps = self.config['lstm_timesteps']
        if min_required is None:
            min_required = timesteps + 20
        if n < min_required:
            print(f"데이터 부족으로 검증 생략: {n}행 (최소 {min_required} 필요)")
            return None

        # 80:20 시점 분할 (인덱스 기준이 아닌 시간 순서)
        split_idx = int(n * 0.8)
        train_df = etf_specific.iloc[:split_idx].copy()
        test_df = etf_specific.iloc[split_idx:].copy()
        if len(test_df) < 5 or len(train_df) < timesteps + 5:
            print("학습/검증 구간의 표본이 너무 적어 검증 생략")
            return None

        # 공통 피처 준비 (train 기준으로 스케일 학습)
        feature_cols = ['close', 'volume', 'return', 'volatility']
        if 'kospi_close' in etf_specific.columns:
            feature_cols.extend(['kospi_close', 'kospi_return'])
        available_features = [c for c in feature_cols if c in etf_specific.columns]

        def _clean(df):
            tmp = df[available_features].copy()
            tmp = tmp.replace([np.inf, -np.inf], np.nan)
            tmp = tmp.ffill().bfill()
            med = tmp.median(numeric_only=True)
            tmp = tmp.fillna(med)
            return tmp.fillna(0)

        from sklearn.preprocessing import MinMaxScaler as _MinMaxScaler
        scaler_local = _MinMaxScaler()
        train_feats = _clean(train_df)
        full_feats = _clean(etf_specific)
        scaler_local.fit(train_feats.values)
        scaled_full = scaler_local.transform(full_feats.values)

        # 시퀀스 구성: target은 'close'의 스케일된 열 위치
        target_idx = available_features.index('close') if 'close' in available_features else 0
        X_full, y_full, tgt_pos = [], [], []
        for i in range(timesteps, n):
            X_full.append(scaled_full[i - timesteps:i, :])
            y_full.append(scaled_full[i, target_idx])
            tgt_pos.append(i)  # 타깃의 원본 위치
        X_full = np.array(X_full)
        y_full = np.array(y_full)

        # 학습/검증 분리 (타깃 인덱스 기준)
        train_mask = np.array(tgt_pos) < split_idx
        test_mask = np.array(tgt_pos) >= split_idx
        if train_mask.sum() < 5 or test_mask.sum() < 5:
            print("시퀀스 표본이 부족하여 검증 생략")
            return None
        X_train, y_train = X_full[train_mask], y_full[train_mask]
        X_test, y_test = X_full[test_mask], y_full[test_mask]

        # LSTM 학습
        lstm_model = self.build_lstm_model((X_train.shape[1], X_train.shape[2]))
        early_stopping = EarlyStopping(monitor='val_loss', patience=20, restore_best_weights=True)
        lstm_model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=200,
            batch_size=32,
            callbacks=[early_stopping],
            verbose=0
        )
        lstm_pred_scaled = lstm_model.predict(X_test, verbose=0)

        # LSTM 역정규화 (가격 복원)
        def _inverse_last(scaled_vals):
            zeros = np.zeros((len(scaled_vals), scaled_full.shape[1]))
            zeros[:, target_idx] = scaled_vals.reshape(-1)
            return scaler_local.inverse_transform(zeros)[:, target_idx]
        lstm_pred = _inverse_last(lstm_pred_scaled)
        y_test_denorm = _inverse_last(y_test)

        # Prophet 학습 (train_df)
        prophet_data = train_df[['ds', 'close']].copy()
        prophet_data.columns = ['ds', 'y']
        model_p = Prophet(
            changepoint_prior_scale=0.25,
            changepoint_range=0.8,
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            interval_width=0.8
        )
        model_p.add_seasonality(name='monthly', period=30.5, fourier_order=10)
        market_regressors = [
            'kospi_close', 'kospi_return', 'kospi_volatility', 'kospi_momentum', 'kospi_relative_strength',
            'usd_krw', 'usd_krw_return', 'usd_krw_volatility', 'usd_krw_momentum', 'usd_krw_relative_strength'
        ]
        avail_regs = [c for c in market_regressors if c in etf_specific.columns]
        for col in avail_regs:
            mode = 'multiplicative' if col in ['kospi_close', 'kospi_relative_strength', 'usd_krw', 'usd_krw_relative_strength'] else 'additive'
            model_p.add_regressor(col, mode=mode)
            prophet_data[col] = train_df[col].values
        model_p.fit(prophet_data)

        test_len = len(test_df)
        future = model_p.make_future_dataframe(periods=test_len, freq='M')
        # 검증 구간 회귀변수는 실제 값을 사용하여 예측(진짜 미래 예측이 아니라 성능 검증 목적)
        for col in avail_regs:
            vals = test_df[col].values if col in test_df.columns else None
            if vals is not None and len(vals) >= test_len:
                future[col] = list(train_df[col].values) + list(vals[:test_len])
            else:
                last_val = train_df[col].iloc[-1] if col in train_df.columns else 0
                future[col] = list(train_df[col].values) + [last_val] * test_len
        forecast = model_p.predict(future)
        prophet_pred = forecast['yhat'].tail(test_len).values

        # Ensemble
        alpha = self.config['ensemble_alpha']
        min_len = min(len(lstm_pred), len(prophet_pred))
        ens = alpha * lstm_pred[:min_len] + (1 - alpha) * prophet_pred[:min_len]
        actual_test = test_df['close'].values[:min_len]

        # 메트릭 산출
        def _metric(y_true, y_hat):
            mae = float(np.mean(np.abs(y_hat - y_true)))
            rmse = float(np.sqrt(np.mean((y_hat - y_true) ** 2)))
            ret_a = pd.Series(y_true).pct_change()
            ret_p = pd.Series(y_hat).pct_change()
            valid = pd.concat([ret_a, ret_p], axis=1).dropna()
            if len(valid) == 0:
                da = np.nan
                ic = np.nan
            else:
                da = float(np.mean(np.sign(valid.iloc[:, 0]) == np.sign(valid.iloc[:, 1])))
                ic = float(valid.iloc[:, 0].corr(valid.iloc[:, 1], method='spearman'))
            return {'MAE': mae, 'RMSE': rmse, 'Direction_Accuracy': da, 'IC_spearman': ic, 'N': int(len(valid))}

        metrics_lstm = _metric(actual_test, lstm_pred[:min_len])
        metrics_prophet = _metric(actual_test, prophet_pred[:min_len])
        metrics_ens = _metric(actual_test, ens)

        print(f"ETF {etf_code} 80:20 검증 완료 | Test N={metrics_ens['N']} | Ensemble RMSE={metrics_ens['RMSE']:.4f}")
        return {
            'etf_code': etf_code,
            'n_total': int(n),
            'n_train': int(len(train_df)),
            'n_test': int(len(test_df)),
            'lstm': metrics_lstm,
            'prophet': metrics_prophet,
            'ensemble': metrics_ens
        }


    def backtest_topk(self, df: pd.DataFrame, k: int = 5) -> dict:
        """간단 월별 상위 K 롱 전략 백테스트.
        df는 최소 컬럼 ['ds','name','ret_actual','ret_pred'] 필요.
        반환: 월평균 수익률, 누적수익률, 평가월 수
        """
        if not {'ds', 'name', 'ret_actual', 'ret_pred'}.issubset(df.columns):
            raise ValueError("df에는 ['ds','name','ret_actual','ret_pred'] 컬럼이 필요합니다.")
        tmp = df.copy()
        tmp['ds'] = pd.to_datetime(tmp['ds'])
        tmp['month'] = tmp['ds'].dt.to_period('M')
        monthly_returns = []
        for _, g in tmp.groupby('month'):
            g = g.sort_values('ret_pred', ascending=False)
            top = g.head(k)
            if len(top) > 0:
                monthly_returns.append(float(top['ret_actual'].mean()))
        if len(monthly_returns) == 0:
            return {'monthly_avg': np.nan, 'cumulative_return': np.nan, 'months': 0}
        monthly_avg = float(np.mean(monthly_returns))
        cumulative_return = float((np.array(monthly_returns) + 1.0).prod() - 1.0)
        return {'monthly_avg': monthly_avg, 'cumulative_return': cumulative_return, 'months': int(len(monthly_returns))}

    def compare_market_regressor_performance(self, etf_data, etf_code, periods=12):
        """
        시장 데이터 회귀 변수 추가 전후 성능 비교 (KOSPI + 환율)
        
        Args:
            etf_data (pd.DataFrame): ETF 데이터
            etf_code (str): ETF 코드
            periods (int): 예측 기간
            
        Returns:
            dict: 성능 비교 결과
        """
        print(f"ETF {etf_code} 시장 데이터 회귀 변수 성능 비교 중...")
        
        # 1. 시장 데이터 회귀 변수 없이 예측
        print("1. 시장 데이터 회귀 변수 없이 예측...")
        etf_specific = etf_data[etf_data['name'] == etf_code].copy()
        
        if len(etf_specific) < 20:
            print(f"데이터 부족: {len(etf_specific)} 행")
            return None
        
        # Prophet 모델 (시장 데이터 회귀 변수 없음)
        prophet_data_basic = etf_specific[['ds', 'close']].copy()
        prophet_data_basic.columns = ['ds', 'y']
        
        model_basic = Prophet(
            changepoint_prior_scale=0.25,
            changepoint_range=0.8,
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False
        )
        model_basic.add_seasonality(name='monthly', period=30.5, fourier_order=10)
        model_basic.fit(prophet_data_basic)
        
        # 미래 예측
        future_basic = model_basic.make_future_dataframe(periods=periods, freq='M')
        forecast_basic = model_basic.predict(future_basic)
        pred_basic = forecast_basic['yhat'].tail(periods).values
        
        # 2. 시장 데이터 회귀 변수와 함께 예측
        print("2. 시장 데이터 회귀 변수와 함께 예측...")
        pred_with_market = self.predict_returns(etf_data, etf_code, periods)
        
        if pred_with_market is None:
            print("시장 데이터 회귀 변수 예측 실패")
            return None
        
        # 3. 성능 비교 (실제 데이터와 비교)
        actual_prices = etf_specific['close'].tail(periods).values
        
        if len(actual_prices) >= periods:
            # MAE, RMSE 계산
            mae_basic = np.mean(np.abs(pred_basic - actual_prices))
            rmse_basic = np.sqrt(np.mean((pred_basic - actual_prices) ** 2))
            
            mae_market = np.mean(np.abs(pred_with_market['ensemble_pred'] - actual_prices))
            rmse_market = np.sqrt(np.mean((pred_with_market['ensemble_pred'] - actual_prices) ** 2))
            
            # 방향 정확도 계산
            actual_returns = np.diff(actual_prices) / actual_prices[:-1]
            pred_returns_basic = np.diff(pred_basic) / pred_basic[:-1]
            pred_returns_market = np.diff(pred_with_market['ensemble_pred']) / pred_with_market['ensemble_pred'][:-1]
            
            direction_acc_basic = np.mean(np.sign(actual_returns) == np.sign(pred_returns_basic))
            direction_acc_market = np.mean(np.sign(actual_returns) == np.sign(pred_returns_market))
            
            comparison_result = {
                'etf_code': etf_code,
                'periods': periods,
                'basic_model': {
                    'mae': mae_basic,
                    'rmse': rmse_basic,
                    'direction_accuracy': direction_acc_basic
                },
                'market_model': {
                    'mae': mae_market,
                    'rmse': rmse_market,
                    'direction_accuracy': direction_acc_market
                },
                'improvement': {
                    'mae_improvement': (mae_basic - mae_market) / mae_basic * 100,
                    'rmse_improvement': (rmse_basic - rmse_market) / rmse_basic * 100,
                    'direction_improvement': (direction_acc_market - direction_acc_basic) * 100
                }
            }
            
            print(f"성능 비교 결과:")
            print(f"  MAE 개선: {comparison_result['improvement']['mae_improvement']:.2f}%")
            print(f"  RMSE 개선: {comparison_result['improvement']['rmse_improvement']:.2f}%")
            print(f"  방향 정확도 개선: {comparison_result['improvement']['direction_improvement']:.2f}%")
            
            return comparison_result
        else:
            print("실제 데이터 부족으로 성능 비교 불가")
            return None

    def save_models(self, save_path=None):
        """
        학습된 모든 모델을 저장
        
        Args:
            save_path (str): 저장 경로 (기본값: self.model_save_path)
        """
        if save_path is None:
            save_path = self.model_save_path
        
        # 저장 디렉토리 생성
        os.makedirs(save_path, exist_ok=True)
        
        print(f"모델 저장 중... (경로: {save_path})")
        
        # 1. LSTM 모델들 저장 (H5 형식)
        if hasattr(self, 'lstm_models') and self.lstm_models:
            lstm_dir = os.path.join(save_path, 'lstm_models')
            os.makedirs(lstm_dir, exist_ok=True)
            
            for etf_code, model in self.lstm_models.items():
                model_path = os.path.join(lstm_dir, f'{etf_code}_lstm.h5')
                model.save(model_path)
                print(f"LSTM 모델 저장: {model_path}")
        
        # 2. Prophet 모델들 저장 (pickle 형식)
        if hasattr(self, 'prophet_models') and self.prophet_models:
            prophet_dir = os.path.join(save_path, 'prophet_models')
            os.makedirs(prophet_dir, exist_ok=True)
            
            for etf_code, model in self.prophet_models.items():
                model_path = os.path.join(prophet_dir, f'{etf_code}_prophet.pkl')
                with open(model_path, 'wb') as f:
                    pickle.dump(model, f)
                print(f"Prophet 모델 저장: {model_path}")
        
        # 3. 스케일러 저장 (joblib 형식)
        if hasattr(self, 'lstm_scaler') and self.lstm_scaler:
            scaler_path = os.path.join(save_path, 'lstm_scaler.pkl')
            joblib.dump(self.lstm_scaler, scaler_path)
            print(f"LSTM 스케일러 저장: {scaler_path}")
        
        if hasattr(self, 'scaler') and self.scaler:
            scaler_path = os.path.join(save_path, 'scaler.pkl')
            joblib.dump(self.scaler, scaler_path)
            print(f"스케일러 저장: {scaler_path}")
        
        # 4. 프로필 모델 저장
        if hasattr(self, 'profile_model') and self.profile_model:
            profile_path = os.path.join(save_path, 'profile_model.pkl')
            joblib.dump(self.profile_model, profile_path)
            print(f"프로필 모델 저장: {profile_path}")
        
        # 5. 설정 저장
        config_path = os.path.join(save_path, 'config.pkl')
        with open(config_path, 'wb') as f:
            pickle.dump(self.config, f)
        print(f"설정 저장: {config_path}")
        
        # 6. 모델 메타데이터 저장
        metadata = {
            'lstm_models': list(self.lstm_models.keys()) if hasattr(self, 'lstm_models') else [],
            'prophet_models': list(self.prophet_models.keys()) if hasattr(self, 'prophet_models') else [],
            'save_timestamp': datetime.now().isoformat(),
            'config': self.config
        }
        
        metadata_path = os.path.join(save_path, 'metadata.json')
        import json
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        print(f"메타데이터 저장: {metadata_path}")
        
        print(f"모든 모델 저장 완료: {save_path}")
    
    def load_models(self, load_path=None):
        """
        저장된 모델들을 로드
        
        Args:
            load_path (str): 로드 경로 (기본값: self.model_save_path)
        """
        if load_path is None:
            load_path = self.model_save_path
        
        if not os.path.exists(load_path):
            print(f"저장 경로가 존재하지 않습니다: {load_path}")
            return False
        
        print(f"모델 로드 중... (경로: {load_path})")
        
        try:
            # 1. 설정 로드
            config_path = os.path.join(load_path, 'config.pkl')
            if os.path.exists(config_path):
                with open(config_path, 'rb') as f:
                    self.config = pickle.load(f)
                print(f"설정 로드: {config_path}")
            
            # 2. 메타데이터 로드
            metadata_path = os.path.join(load_path, 'metadata.json')
            if os.path.exists(metadata_path):
                import json
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                print(f"메타데이터 로드: {metadata_path}")
                
                # 3. LSTM 모델들 로드
                lstm_dir = os.path.join(load_path, 'lstm_models')
                if os.path.exists(lstm_dir):
                    self.lstm_models = {}
                    for etf_code in metadata.get('lstm_models', []):
                        model_path = os.path.join(lstm_dir, f'{etf_code}_lstm.h5')
                        if os.path.exists(model_path):
                            self.lstm_models[etf_code] = tf.keras.models.load_model(model_path)
                            print(f"LSTM 모델 로드: {model_path}")
                
                # 4. Prophet 모델들 로드
                prophet_dir = os.path.join(load_path, 'prophet_models')
                if os.path.exists(prophet_dir):
                    self.prophet_models = {}
                    for etf_code in metadata.get('prophet_models', []):
                        model_path = os.path.join(prophet_dir, f'{etf_code}_prophet.pkl')
                        if os.path.exists(model_path):
                            with open(model_path, 'rb') as f:
                                self.prophet_models[etf_code] = pickle.load(f)
                            print(f"Prophet 모델 로드: {model_path}")
            
            # 5. 스케일러 로드
            lstm_scaler_path = os.path.join(load_path, 'lstm_scaler.pkl')
            if os.path.exists(lstm_scaler_path):
                self.lstm_scaler = joblib.load(lstm_scaler_path)
                print(f"LSTM 스케일러 로드: {lstm_scaler_path}")
            
            scaler_path = os.path.join(load_path, 'scaler.pkl')
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                print(f"스케일러 로드: {scaler_path}")
            
            # 6. 프로필 모델 로드
            profile_path = os.path.join(load_path, 'profile_model.pkl')
            if os.path.exists(profile_path):
                self.profile_model = joblib.load(profile_path)
                print(f"프로필 모델 로드: {profile_path}")
            
            print(f"모든 모델 로드 완료: {load_path}")
            return True
            
        except Exception as e:
            print(f"모델 로드 중 오류 발생: {e}")
            return False
    
    def save_single_lstm_model(self, etf_code, model, save_path=None):
        """
        단일 LSTM 모델을 H5 파일로 저장
        
        Args:
            etf_code (str): ETF 코드
            model: LSTM 모델
            save_path (str): 저장 경로
        """
        if save_path is None:
            save_path = self.model_save_path
        
        os.makedirs(save_path, exist_ok=True)
        
        model_path = os.path.join(save_path, f'{etf_code}_lstm.h5')
        model.save(model_path)
        print(f"LSTM 모델 저장: {model_path}")
        
        return model_path
    
    def load_single_lstm_model(self, etf_code, load_path=None):
        """
        단일 LSTM 모델을 H5 파일에서 로드
        
        Args:
            etf_code (str): ETF 코드
            load_path (str): 로드 경로
            
        Returns:
            tf.keras.Model: 로드된 LSTM 모델
        """
        if load_path is None:
            load_path = self.model_save_path
        
        model_path = os.path.join(load_path, f'{etf_code}_lstm.h5')
        
        if not os.path.exists(model_path):
            print(f"모델 파일이 존재하지 않습니다: {model_path}")
            return None
        
        try:
            model = tf.keras.models.load_model(model_path)
            print(f"LSTM 모델 로드: {model_path}")
            return model
        except Exception as e:
            print(f"LSTM 모델 로드 실패: {e}")
            return None
    
    def save_single_prophet_model(self, etf_code, model, save_path=None):
        """
        단일 Prophet 모델을 pickle 파일로 저장
        
        Args:
            etf_code (str): ETF 코드
            model: Prophet 모델
            save_path (str): 저장 경로
        """
        if save_path is None:
            save_path = self.model_save_path
        
        os.makedirs(save_path, exist_ok=True)
        
        model_path = os.path.join(save_path, f'{etf_code}_prophet.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        print(f"Prophet 모델 저장: {model_path}")
        
        return model_path
    
    def load_single_prophet_model(self, etf_code, load_path=None):
        """
        단일 Prophet 모델을 pickle 파일에서 로드
        
        Args:
            etf_code (str): ETF 코드
            load_path (str): 로드 경로
            
        Returns:
            Prophet: 로드된 Prophet 모델
        """
        if load_path is None:
            load_path = self.model_save_path
        
        model_path = os.path.join(load_path, f'{etf_code}_prophet.pkl')
        
        if not os.path.exists(model_path):
            print(f"모델 파일이 존재하지 않습니다: {model_path}")
            return None
        
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print(f"Prophet 모델 로드: {model_path}")
            return model
        except Exception as e:
            print(f"Prophet 모델 로드 실패: {e}")
            return None


def main():
    """메인 실행 함수"""
    print("하이브리드 ETF 추천 시스템")
    
    # 시스템 초기화
    recommender = HybridRecommenderSystem()
    
    # 샘플 사용자 프로필
    sample_users = [
        {'age': 25, 'income': 4000, 'investment_experience': 1, 'risk_tolerance': 3},
        {'age': 35, 'income': 6000, 'investment_experience': 3, 'risk_tolerance': 2},
        {'age': 45, 'income': 8000, 'investment_experience': 5, 'risk_tolerance': 1}
    ]
    
    try:
        # 자동화된 추천 실행
        recommendations = recommender.run_automated_recommendation(
            etf_data_path='/home/j-j13a103/ygss/data/ETF_Monthly_price.csv',
            market_data_path='/home/j-j13a103/ygss/data/market_data.csv',
            user_profiles=sample_users,
            output_path='etf_recommendations.json'
        )
        
        # 결과 시각화
        recommender.visualize_recommendations(
            recommendations, 
            save_path='recommendation_visualization.png'
        )
        
        # 모델 저장
        print("\n학습된 모델들을 저장 중...")
        recommender.save_models('saved_models')
        
        print("\n추천 시스템이 성공적으로 실행되었습니다!")
        
        # === 예측 성능 평가 및 백테스트 추가 ===
        print("\n" + "="*50)
        print("예측 성능 평가 및 백테스트 시작")
        print("="*50)
        
        # ETF 데이터 다시 로드 (평가용)
        etf_data = recommender.prepare_etf_data(
            '/home/j-j13a103/ygss/data/ETF_Monthly_price.csv', 
            '/home/j-j13a103/ygss/data/market_data.csv'
        )
        
        if etf_data is not None:
            # 성공적으로 예측된 ETF들 찾기
            successful_etfs = []
            for user_key, user_data in recommendations.items():
                if user_data['recommendation'] and 'recommended_etfs' in user_data['recommendation']:
                    for etf in user_data['recommendation']['recommended_etfs']:
                        etf_name = etf['etf_name']
                        if etf_name not in successful_etfs:
                            successful_etfs.append(etf_name)
            
            print(f"평가 대상 ETF: {successful_etfs}")
            
            # 각 ETF별 예측 성능 평가
            all_eval_results = []
            all_backtest_data = []
            
            for etf_name in successful_etfs[:5]:  # 상위 5개만 평가 (시간 절약)
                try:
                    print(f"\n--- {etf_name} 예측 성능 평가 ---")
                    
                    # 이미 학습된 모델이 있는지 확인
                    if hasattr(recommender, 'lstm_models') and etf_name in recommender.lstm_models:
                        print(f"이미 학습된 모델을 사용하여 {etf_name} 예측 중...")
                        # 학습된 모델을 사용하여 예측 (재학습 없음)
                        pred_result = recommender.predict_with_trained_models(etf_data, etf_name, periods=12)
                    else:
                        print(f"새로운 모델을 학습하여 {etf_name} 예측 중...")
                        # 예측 수행 (학습 포함)
                        pred_result = recommender.predict_returns(etf_data, etf_name, periods=12)
                    
                    if pred_result:
                        # 평가용 데이터프레임 생성
                        etf_specific = etf_data[etf_data['name'] == etf_name].copy()
                        eval_df = recommender.build_eval_frame(
                            etf_specific, 
                            pred_result['ensemble_pred'], 
                            price_col='close'
                        )
                        
                        # 예측 성능 평가
                        metrics = recommender.evaluate_predictions(eval_df)
                        metrics['etf_name'] = etf_name
                        all_eval_results.append(metrics)
                        
                        print(f"MAE: {metrics['MAE']:.4f}")
                        print(f"RMSE: {metrics['RMSE']:.4f}")
                        print(f"방향 정확도: {metrics['Direction_Accuracy']:.2%}")
                        print(f"정보계수(IC): {metrics['IC_spearman']:.4f}")
                        print(f"평가 데이터 수: {metrics['N']}")
                        
                        # 백테스트용 데이터 준비
                        eval_df['name'] = etf_name
                        eval_df['ret_actual'] = eval_df['close'].pct_change()
                        eval_df['ret_pred'] = eval_df['predicted_prices'].pct_change()
                        all_backtest_data.append(eval_df[['ds', 'name', 'ret_actual', 'ret_pred']])
                        
                    else:
                        print(f"{etf_name}: 예측 실패")
                        
                except Exception as e:
                    print(f"{etf_name} 평가 중 오류: {e}")
                    continue
            
            # 전체 예측 성능 요약
            if all_eval_results:
                print("\n" + "="*50)
                print("전체 예측 성능 요약")
                print("="*50)
                
                eval_df_summary = pd.DataFrame(all_eval_results)
                print(f"평가된 ETF 수: {len(eval_df_summary)}")
                print(f"평균 MAE: {eval_df_summary['MAE'].mean():.4f}")
                print(f"평균 RMSE: {eval_df_summary['RMSE'].mean():.4f}")
                print(f"평균 방향 정확도: {eval_df_summary['Direction_Accuracy'].mean():.2%}")
                print(f"평균 정보계수: {eval_df_summary['IC_spearman'].mean():.4f}")
                
                # 백테스트 실행
                if all_backtest_data:
                    print("\n" + "="*50)
                    print("포트폴리오 백테스트 결과")
                    print("="*50)
                    
                    combined_df = pd.concat(all_backtest_data, ignore_index=True)
                    
                    # 상위 K개 전략 백테스트
                    for k in [3, 5]:
                        bt_result = recommender.backtest_topk(combined_df, k=k)
                        print(f"상위 {k}개 ETF 롱 전략:")
                        print(f"  월평균 수익률: {bt_result['monthly_avg']:.2%}")
                        print(f"  누적 수익률: {bt_result['cumulative_return']:.2%}")
                        print(f"  평가 기간: {bt_result['months']}개월")
                
                # 결과를 파일로 저장
                eval_df_summary.to_csv('prediction_evaluation_results.csv', index=False, encoding='utf-8-sig')
                print(f"\n평가 결과가 'prediction_evaluation_results.csv'에 저장되었습니다.")
                
                # === 시장 데이터 회귀 변수 성능 비교 추가 ===
                print("\n" + "="*50)
                print("시장 데이터 회귀 변수 성능 비교 (KOSPI + 환율)")
                print("="*50)
                
                comparison_results = []
                for etf_name in successful_etfs[:3]:  # 상위 3개만 비교 (시간 절약)
                    try:
                        print(f"\n--- {etf_name} 시장 데이터 회귀 변수 성능 비교 ---")
                        comparison = recommender.compare_market_regressor_performance(etf_data, etf_name, periods=6)
                        if comparison:
                            comparison_results.append(comparison)
                    except Exception as e:
                        print(f"{etf_name} 성능 비교 중 오류: {e}")
                        continue
                
                if comparison_results:
                    print("\n" + "="*50)
                    print("전체 시장 데이터 회귀 변수 성능 비교 요약")
                    print("="*50)
                    
                    avg_mae_improvement = np.mean([r['improvement']['mae_improvement'] for r in comparison_results])
                    avg_rmse_improvement = np.mean([r['improvement']['rmse_improvement'] for r in comparison_results])
                    avg_direction_improvement = np.mean([r['improvement']['direction_improvement'] for r in comparison_results])
                    
                    print(f"평균 MAE 개선: {avg_mae_improvement:.2f}%")
                    print(f"평균 RMSE 개선: {avg_rmse_improvement:.2f}%")
                    print(f"평균 방향 정확도 개선: {avg_direction_improvement:.2f}%")
                    
                    # 상세 결과를 파일로 저장
                    comparison_df = pd.DataFrame([
                        {
                            'etf_code': r['etf_code'],
                            'mae_improvement': r['improvement']['mae_improvement'],
                            'rmse_improvement': r['improvement']['rmse_improvement'],
                            'direction_improvement': r['improvement']['direction_improvement']
                        }
                        for r in comparison_results
                    ])
                    comparison_df.to_csv('market_regressor_comparison.csv', index=False, encoding='utf-8-sig')
                    print(f"\n시장 데이터 회귀 변수 비교 결과가 'market_regressor_comparison.csv'에 저장되었습니다.")
            
        else:
            print("ETF 데이터 로드 실패로 평가를 건너뜁니다.")
        
    except Exception as e:
        print(f"오류 발생: {e}")
        print("데이터 파일 경로를 확인해주세요.")


if __name__ == "__main__":
    main()
