# -*- coding: utf-8 -*-
"""
Model building module for LSTM and Prophet models.
Contains functions to create and compile models with various architectures.
"""

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from prophet import Prophet
from typing import Tuple, Optional, Dict, Any


def build_lstm_model(input_shape: Tuple[int, int], 
                    lstm_units: list = [50, 50],
                    dropout_rate: float = 0.2,
                    dense_units: list = [25],
                    learning_rate: float = 0.001,
                    use_batch_norm: bool = False) -> tf.keras.Model:
    """
    Build and compile LSTM model for time series prediction.
    
    Args:
        input_shape (Tuple[int, int]): Shape of input (sequence_length, num_features)
        lstm_units (list): List of LSTM layer units
        dropout_rate (float): Dropout rate for regularization
        dense_units (list): List of dense layer units
        learning_rate (float): Learning rate for optimizer
        use_batch_norm (bool): Whether to use batch normalization
    
    Returns:
        tf.keras.Model: Compiled LSTM model
    """
    model = Sequential()
    
    # Add LSTM layers
    for i, units in enumerate(lstm_units):
        return_sequences = i < len(lstm_units) - 1  # Return sequences for all but last LSTM layer
        
        if i == 0:
            # First LSTM layer with input shape
            model.add(LSTM(units=units, 
                          return_sequences=return_sequences, 
                          input_shape=input_shape))
        else:
            # Subsequent LSTM layers
            model.add(LSTM(units=units, return_sequences=return_sequences))
        
        # Add dropout for regularization
        model.add(Dropout(dropout_rate))
        
        # Add batch normalization if specified
        if use_batch_norm:
            model.add(BatchNormalization())
    
    # Add dense layers
    for units in dense_units:
        model.add(Dense(units=units, activation='relu'))
        model.add(Dropout(dropout_rate))
    
    # Output layer for regression
    model.add(Dense(units=1, activation='linear'))
    
    # Compile model
    optimizer = Adam(learning_rate=learning_rate)
    model.compile(optimizer=optimizer, 
                 loss='mean_squared_error',
                 metrics=['mae'])
    
    return model


def build_simple_lstm_model(input_shape: Tuple[int, int]) -> tf.keras.Model:
    """
    Build a simple LSTM model (compatible with original code).
    
    Args:
        input_shape (Tuple[int, int]): Shape of input (sequence_length, num_features)
    
    Returns:
        tf.keras.Model: Compiled simple LSTM model
    """
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=input_shape))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50, return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(units=25))
    model.add(Dense(units=1))
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    
    return model


def build_advanced_lstm_model(input_shape: Tuple[int, int],
                            complexity: str = 'medium') -> tf.keras.Model:
    """
    Build advanced LSTM model with different complexity levels.
    
    Args:
        input_shape (Tuple[int, int]): Shape of input
        complexity (str): Model complexity ('simple', 'medium', 'complex')
    
    Returns:
        tf.keras.Model: Compiled advanced LSTM model
    """
    if complexity == 'simple':
        lstm_units = [32]
        dense_units = [16]
        dropout_rate = 0.1
    elif complexity == 'medium':
        lstm_units = [64, 32]
        dense_units = [32, 16]
        dropout_rate = 0.2
    elif complexity == 'complex':
        lstm_units = [128, 64, 32]
        dense_units = [64, 32, 16]
        dropout_rate = 0.3
    else:
        raise ValueError(f"Unknown complexity level: {complexity}")
    
    return build_lstm_model(
        input_shape=input_shape,
        lstm_units=lstm_units,
        dense_units=dense_units,
        dropout_rate=dropout_rate,
        use_batch_norm=True
    )


def build_prophet_model(seasonality_config: Optional[Dict[str, Any]] = None,
                       changepoint_config: Optional[Dict[str, Any]] = None) -> Prophet:
    """
    Build and initialize Prophet model for time series forecasting.
    
    Args:
        seasonality_config (dict, optional): Seasonality configuration
        changepoint_config (dict, optional): Changepoint configuration
    
    Returns:
        Prophet: Initialized Prophet model
    """
    # Default configurations
    default_seasonality = {
        'yearly_seasonality': True,
        'weekly_seasonality': False,
        'daily_seasonality': False
    }
    
    default_changepoint = {
        'changepoint_prior_scale': 0.02,
        'seasonality_prior_scale': 10.0,
        'holidays_prior_scale': 10.0,
        'seasonality_mode': 'additive'
    }
    
    # Update with provided configurations
    if seasonality_config:
        default_seasonality.update(seasonality_config)
    if changepoint_config:
        default_changepoint.update(changepoint_config)
    
    # Combine all configurations
    prophet_config = {**default_seasonality, **default_changepoint}
    
    # Initialize Prophet model
    model = Prophet(**prophet_config)
    
    return model


def build_conservative_prophet_model() -> Prophet:
    """
    Build a conservative Prophet model (compatible with original code).
    
    Returns:
        Prophet: Conservative Prophet model
    """
    return Prophet(
        yearly_seasonality=True,
        changepoint_prior_scale=0.02
    )


def build_flexible_prophet_model() -> Prophet:
    """
    Build a more flexible Prophet model for volatile financial data.
    
    Returns:
        Prophet: Flexible Prophet model
    """
    return Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        changepoint_prior_scale=0.05,  # More flexible changepoints
        seasonality_prior_scale=15.0,   # More flexible seasonality
        seasonality_mode='multiplicative'  # Better for financial data
    )


def get_model_callbacks(patience: int = 10, 
                       min_delta: float = 0.001,
                       reduce_lr_patience: int = 5) -> list:
    """
    Get standard callbacks for model training.
    
    Args:
        patience (int): Patience for early stopping
        min_delta (float): Minimum change for early stopping
        reduce_lr_patience (int): Patience for learning rate reduction
    
    Returns:
        list: List of Keras callbacks
    """
    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=patience,
            min_delta=min_delta,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=reduce_lr_patience,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    return callbacks


def configure_gpu():
    """
    Configure GPU settings for TensorFlow (from original code).
    """
    import os
    
    # GPU 설정 (TESLA GPU 사용)
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
            tf.config.threading.set_inter_op_parallelism_threads(0)
            tf.config.threading.set_intra_op_parallelism_threads(0)
            print("CPU 최적화 설정 완료")
    except Exception as e:
        print(f"GPU 설정 중 오류: {e}")
        print("CPU를 사용합니다.")
        # CPU 최적화 설정
        tf.config.threading.set_inter_op_parallelism_threads(0)
        tf.config.threading.set_intra_op_parallelism_threads(0)
        print("CPU 최적화 설정 완료")
