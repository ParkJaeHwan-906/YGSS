# -*- coding: utf-8 -*-
"""
Feature engineering module for time series data preparation.
Handles sequence creation and feature scaling for LSTM models.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from typing import Tuple, Optional


def create_sequences(data: pd.DataFrame, seq_len: int, target_column: str = 'return') -> Tuple[np.ndarray, np.ndarray]:
    """
    Create time series sequences for LSTM input.
    
    Args:
        data (pd.DataFrame): Input data with features and target
        seq_len (int): Length of input sequences
        target_column (str): Name of the target column
    
    Returns:
        Tuple[np.ndarray, np.ndarray]: X sequences and y sequences
    """
    xs, ys = [], []
    
    for i in range(len(data) - seq_len):
        # Get sequence of features (all columns)
        x = data.iloc[i:(i + seq_len)].values
        # Get target value at the next time step
        y = data.iloc[i + seq_len][target_column]
        xs.append(x)
        ys.append(y)
    
    return np.array(xs), np.array(ys)


def create_sequences_for_prediction(data: pd.DataFrame, seq_len: int) -> np.ndarray:
    """
    Create sequences for prediction (no target needed).
    
    Args:
        data (pd.DataFrame): Input data with features
        seq_len (int): Length of input sequences
    
    Returns:
        np.ndarray: Last sequence for prediction
    """
    if len(data) < seq_len:
        raise ValueError(f"Data length ({len(data)}) is less than sequence length ({seq_len})")
    
    # Take the last seq_len rows
    last_sequence = data.iloc[-seq_len:].values
    
    # Reshape for model input (1, seq_len, num_features)
    return last_sequence.reshape(1, seq_len, last_sequence.shape[1])


def scale_features_and_target(features: pd.DataFrame, target: pd.DataFrame, 
                            scaler_type: str = 'minmax') -> Tuple[np.ndarray, np.ndarray, object, object]:
    """
    Scale features and target variables.
    
    Args:
        features (pd.DataFrame): Feature data
        target (pd.DataFrame): Target data
        scaler_type (str): Type of scaler ('minmax' or 'standard')
    
    Returns:
        Tuple: Scaled features, scaled target, feature scaler, target scaler
    """
    # Initialize scalers
    if scaler_type == 'minmax':
        feature_scaler = MinMaxScaler()
        target_scaler = MinMaxScaler()
    elif scaler_type == 'standard':
        feature_scaler = StandardScaler()
        target_scaler = StandardScaler()
    else:
        raise ValueError(f"Unsupported scaler type: {scaler_type}")
    
    # Fit and transform features
    scaled_features = feature_scaler.fit_transform(features)
    
    # Fit and transform target
    scaled_target = target_scaler.fit_transform(target)
    
    return scaled_features, scaled_target, feature_scaler, target_scaler


def prepare_lstm_data(data: pd.DataFrame, feature_columns: list, target_column: str = 'return',
                     seq_len: int = 12, scaler_type: str = 'minmax') -> dict:
    """
    Prepare data for LSTM training with scaling and sequence creation.
    
    Args:
        data (pd.DataFrame): Input data
        feature_columns (list): List of feature column names
        target_column (str): Name of target column
        seq_len (int): Sequence length for LSTM
        scaler_type (str): Type of scaler to use
    
    Returns:
        dict: Dictionary containing prepared data and scalers
    """
    # Separate features and target
    features = data[feature_columns]
    target = data[[target_column]]
    
    # Scale features and target
    scaled_features, scaled_target, feature_scaler, target_scaler = scale_features_and_target(
        features, target, scaler_type
    )
    
    # Combine scaled features and target for sequence creation
    scaled_data = pd.DataFrame(scaled_features, columns=feature_columns)
    scaled_data[target_column] = scaled_target
    
    # Create sequences
    X_sequences, y_sequences = create_sequences(scaled_data, seq_len, target_column)
    
    return {
        'X_sequences': X_sequences,
        'y_sequences': y_sequences,
        'feature_scaler': feature_scaler,
        'target_scaler': target_scaler,
        'scaled_data': scaled_data,
        'feature_columns': feature_columns,
        'target_column': target_column,
        'seq_len': seq_len
    }


def prepare_prophet_data(data: pd.DataFrame, date_column: str = 'date', 
                        target_column: str = 'return') -> pd.DataFrame:
    """
    Prepare data for Prophet model (requires 'ds' and 'y' columns).
    
    Args:
        data (pd.DataFrame): Input data
        date_column (str): Name of date column
        target_column (str): Name of target column
    
    Returns:
        pd.DataFrame: Data formatted for Prophet
    """
    prophet_data = data[[date_column, target_column]].copy()
    prophet_data = prophet_data.rename(columns={date_column: 'ds', target_column: 'y'})
    
    # Ensure date column is datetime
    prophet_data['ds'] = pd.to_datetime(prophet_data['ds'])
    
    # Remove any NaN values
    prophet_data = prophet_data.dropna()
    
    return prophet_data


def create_prediction_input(data: pd.DataFrame, feature_columns: list, target_column: str,
                          feature_scaler: object, target_scaler: object, seq_len: int) -> np.ndarray:
    """
    Create input for model prediction from new data.
    
    Args:
        data (pd.DataFrame): Input data for prediction
        feature_columns (list): List of feature column names
        target_column (str): Name of target column
        feature_scaler (object): Fitted feature scaler
        target_scaler (object): Fitted target scaler
        seq_len (int): Sequence length
    
    Returns:
        np.ndarray: Prepared input for model prediction
    """
    if len(data) < seq_len:
        raise ValueError(f"Data length ({len(data)}) is less than sequence length ({seq_len})")
    
    # Scale features (use DataFrame to maintain feature names)
    scaled_features = feature_scaler.transform(data[feature_columns])
    
    # Scale target (if available)
    if target_column in data.columns:
        scaled_target = target_scaler.transform(data[[target_column]])
        # Combine scaled features and target
        scaled_data_combined = np.hstack((scaled_features, scaled_target))
    else:
        scaled_data_combined = scaled_features
    
    # Take the last seq_len rows
    last_sequence = scaled_data_combined[-seq_len:]
    
    # Reshape for model input
    return last_sequence.reshape(1, seq_len, scaled_data_combined.shape[1])


def validate_sequence_data(X_sequences: np.ndarray, y_sequences: np.ndarray, 
                          min_samples: int = 10) -> bool:
    """
    Validate that sequence data is suitable for training.
    
    Args:
        X_sequences (np.ndarray): Input sequences
        y_sequences (np.ndarray): Target sequences
        min_samples (int): Minimum number of samples required
    
    Returns:
        bool: True if data is valid for training
    """
    if X_sequences.shape[0] == 0 or y_sequences.shape[0] == 0:
        print(f"No sequences created. Check if data length > sequence length.")
        return False
    
    if X_sequences.shape[0] < min_samples:
        print(f"Insufficient samples: {X_sequences.shape[0]} < {min_samples}")
        return False
    
    if X_sequences.shape[0] != y_sequences.shape[0]:
        print(f"Mismatch in sequence counts: X={X_sequences.shape[0]}, y={y_sequences.shape[0]}")
        return False
    
    return True
