# -*- coding: utf-8 -*-
"""
Model training module for LSTM and Prophet models.
Handles training processes with validation and monitoring.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from prophet import Prophet
import tensorflow as tf
from typing import Tuple, Optional, Dict, Any

def time_split_by_id(data, feature_cols, target_col, train_ratio=0.8):
    X_train, X_test, y_train, y_test = [], [], [], []
    for cur_id in data['id'].unique():
        df_id = data[data['id'] == cur_id].sort_values('date')
        split_idx = int(len(df_id) * train_ratio)
        X_train.append(df_id.iloc[:split_idx][feature_cols].values)
        y_train.append(df_id.iloc[:split_idx][target_col].values)
        X_test.append(df_id.iloc[split_idx:][feature_cols].values)
        y_test.append(df_id.iloc[split_idx:][target_col].values)
        
    return (
        np.concatenate(X_train),
        np.concatenate(X_test),
        np.concatenate(y_train),
        np.concatenate(y_test)
        )

def train_lstm(model: tf.keras.Model, 
               X_train: np.ndarray, y_train: np.ndarray,
               X_val: np.ndarray, y_val: np.ndarray,
               epochs: int = 50, 
               batch_size: int = 32,
               callbacks: Optional[list] = None,
               verbose: int = 1) -> tf.keras.callbacks.History:
    """
    Train LSTM model with validation data.
    
    Args:
        model (tf.keras.Model): Compiled LSTM model
        X_train (np.ndarray): Training input sequences
        y_train (np.ndarray): Training target values
        X_val (np.ndarray): Validation input sequences
        y_val (np.ndarray): Validation target values
        epochs (int): Number of training epochs
        batch_size (int): Training batch size
        callbacks (list, optional): List of Keras callbacks
        verbose (int): Verbosity level
    
    Returns:
        tf.keras.callbacks.History: Training history
    """
    # Adjust batch size if necessary
    if len(X_train) < batch_size:
        batch_size = max(1, len(X_train) // 2)
        print(f"Adjusted batch size to {batch_size} due to limited training data")
    
    # Train the model
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_data=(X_val, y_val),
        callbacks=callbacks,
        verbose=verbose
    )
    
    return history


# def train_lstm_with_split(model: tf.keras.Model,
#                              data: pd.DataFrame, feature_cols: list, target_col: str,
#                              train_ratio: float = 0.8,
#                              epochs: int = 50,
#                              batch_size: int = 32,
#                              callbacks: Optional[list] = None,
#                              random_state: int = 42) -> Tuple[tf.keras.callbacks.History, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
#     """
#     Train LSTM model with time-based train-test split.
    
#     Args:
#         model (tf.keras.Model): Compiled LSTM model
#         data (pd.DataFrame): Input data with features and target
#         feature_cols (list): List of feature column names
#         target_col (str): Target column name
#         train_ratio (float): Proportion of train data
#         epochs (int): Number of training epochs
#         batch_size (int): Training batch size
#         callbacks (list, optional): List of Keras callbacks
#         random_state (int): Random state for reproducibility
    
#     Returns:
#         Tuple: Training history, X_train, X_test, y_train, y_test
#     """
    
#     # Time-based train-test split by ID
#     X_train, X_test, y_train, y_test = time_split_by_id(data, feature_cols, target_col, train_ratio)

#     # Train model
#     history = train_lstm(
#         model, X_train, y_train, X_test, y_test,
#         epochs=epochs, batch_size=batch_size, callbacks=callbacks
#     )
    
#     return history, X_train, X_test, y_train, y_test


# def train_lstm_with_split(model: tf.keras.Model,
#                              X_sequences: np.ndarray,
#                              y_sequences: np.ndarray,
#                              sequence_ids: np.ndarray,
#                              test_ratio: float = 0.2,
#                              epochs: int = 50,
#                              batch_size: int = 32,
#                              callbacks: Optional[list] = None,
#                              verbose: int = 1) -> Tuple[tf.keras.callbacks.History, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
#     """
#     Train LSTM with ID-aware time-based split for 3D sequences.

#     - Preserves per-ID chronological order
#     - Splits each ID's sequences into train/validation by test_ratio

#     Args:
#         model (tf.keras.Model): Compiled LSTM model
#         X_sequences (np.ndarray): Shape (N, seq_len, n_features)
#         y_sequences (np.ndarray): Shape (N,) or (N,1)
#         sequence_ids (np.ndarray): Shape (N,) indicating ID per sequence
#         test_ratio (float): Proportion of validation sequences per ID
#         epochs (int): Training epochs
#         batch_size (int): Batch size
#         callbacks (list, optional): Keras callbacks
#         verbose (int): Verbosity

#     Returns:
#         Tuple: (history, X_train, X_val, y_train, y_val)
#     """
#     assert X_sequences.ndim == 3, "X_sequences must be 3D (N, T, F)"
#     assert len(X_sequences) == len(y_sequences) == len(sequence_ids), "Lengths of X, y, and sequence_ids must match"

#     unique_ids = pd.unique(sequence_ids)

#     X_tr_list, X_val_list = [], []
#     y_tr_list, y_val_list = [], []

#     for uid in unique_ids:
#         idx = np.where(sequence_ids == uid)[0]
#         # sequences are assumed already in chronological order; if not, sort idx
#         # idx = np.sort(idx)
#         n_uid = len(idx)
#         if n_uid == 0:
#             continue
#         split_idx = max(1, int(n_uid * (1 - test_ratio)))

#         X_tr_list.append(X_sequences[idx[:split_idx]])
#         y_tr_list.append(y_sequences[idx[:split_idx]])
#         if split_idx < n_uid:
#             X_val_list.append(X_sequences[idx[split_idx:]])
#             y_val_list.append(y_sequences[idx[split_idx:]])

#     if not X_tr_list or not y_tr_list or not X_val_list or not y_val_list:
#         raise ValueError("Insufficient data after ID-wise split. Check sequence_ids distribution and test_ratio.")

#     X_train = np.concatenate(X_tr_list, axis=0)
#     y_train = np.concatenate(y_tr_list, axis=0)
#     X_val = np.concatenate(X_val_list, axis=0)
#     y_val = np.concatenate(y_val_list, axis=0)

#     history = train_lstm(
#         model, X_train, y_train, X_val, y_val,
#         epochs=epochs, batch_size=batch_size, callbacks=callbacks, verbose=verbose
#     )

#     return history, X_train, X_val, y_train, y_val

def split_sequences_by_id(X_sequences: np.ndarray, y_sequences: np.ndarray,
                          sequence_ids: np.ndarray, test_ratio: float = 0.2) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    ID-aware time-based split for 3D sequences without training.
    개선된 시계열 분할: 각 ID별로 시간 순서를 보장하며 분할
    """
    assert X_sequences.ndim == 3, "X_sequences must be 3D (N, T, F)"
    assert len(X_sequences) == len(y_sequences) == len(sequence_ids), "Lengths of X, y, and sequence_ids must match"

    unique_ids = pd.unique(sequence_ids)
    print(f"   - 총 {len(unique_ids)}개 ID에서 시계열 분할 수행")

    X_tr_list, X_val_list = [], []
    y_tr_list, y_val_list = [], []

    for uid in unique_ids:
        idx = np.where(sequence_ids == uid)[0]
        n_uid = len(idx)
        if n_uid == 0:
            continue
            
        # 최소 3개 시퀀스는 필요 (학습 2개, 검증 1개)
        if n_uid < 3:
            print(f"   - ID {uid}: 데이터 부족 ({n_uid}개), 건너뜀")
            continue
            
        # 시간 순서를 보장하기 위해 인덱스 정렬
        idx = np.sort(idx)
        
        # 더 보수적인 분할: 최소 2개는 학습용으로 보장
        split_idx = max(2, int(n_uid * (1 - test_ratio)))
        
        # 검증 데이터가 최소 1개는 되도록 조정
        if split_idx >= n_uid:
            split_idx = n_uid - 1

        X_tr_list.append(X_sequences[idx[:split_idx]])
        y_tr_list.append(y_sequences[idx[:split_idx]])
        X_val_list.append(X_sequences[idx[split_idx:]])
        y_val_list.append(y_sequences[idx[split_idx:]])

    if not X_tr_list or not y_tr_list or not X_val_list or not y_val_list:
        raise ValueError("Insufficient data after ID-wise split. Check sequence_ids distribution and test_ratio.")

    X_train = np.concatenate(X_tr_list, axis=0)
    y_train = np.concatenate(y_tr_list, axis=0)
    X_val = np.concatenate(X_val_list, axis=0)
    y_val = np.concatenate(y_val_list, axis=0)

    print(f"   - 학습 데이터: {X_train.shape[0]}개 시퀀스")
    print(f"   - 검증 데이터: {X_val.shape[0]}개 시퀀스")
    print(f"   - 학습/검증 비율: {X_train.shape[0]/(X_train.shape[0]+X_val.shape[0]):.2f}")

    return X_train, X_val, y_train, y_val

def train_prophet(model: Prophet, df: pd.DataFrame) -> Prophet:
    """
    Train Prophet model on time series data.
    
    Args:
        model (Prophet): Initialized Prophet model
        df (pd.DataFrame): Data with 'ds' (date) and 'y' (target) columns
    
    Returns:
        Prophet: Trained Prophet model
    """
    # Validate input data
    required_columns = ['ds', 'y']
    if not all(col in df.columns for col in required_columns):
        raise ValueError(f"DataFrame must contain columns: {required_columns}")
    
    # Remove any NaN values
    df_clean = df.dropna()
    
    if len(df_clean) == 0:
        raise ValueError("No valid data points after removing NaN values")
    
    # Fit the model
    model.fit(df_clean)
    
    return model


def train_prophet_with_validation(model: Prophet, df: pd.DataFrame,
                                 validation_periods: int = 12) -> Tuple[Prophet, pd.DataFrame, pd.DataFrame]:
    """
    Train Prophet model with validation split.
    
    Args:
        model (Prophet): Initialized Prophet model
        df (pd.DataFrame): Data with 'ds' and 'y' columns
        validation_periods (int): Number of periods for validation
    
    Returns:
        Tuple: Trained model, training data, validation data
    """
    # Sort by date
    df_sorted = df.sort_values('ds').reset_index(drop=True)
    
    # Split data
    if len(df_sorted) <= validation_periods:
        print(f"Warning: Dataset too small for validation split. Using all data for training.")
        train_df = df_sorted
        val_df = pd.DataFrame()
    else:
        train_df = df_sorted[:-validation_periods]
        val_df = df_sorted[-validation_periods:]
    
    # Train model
    trained_model = train_prophet(model, train_df)
    
    return trained_model, train_df, val_df


def create_ensemble_predictions(lstm_predictions: np.ndarray, 
                              prophet_predictions: np.ndarray,
                              lstm_weight: float = 0.7,
                              prophet_weight: float = 0.3) -> np.ndarray:
    """
    Create ensemble predictions from LSTM and Prophet models.
    
    Args:
        lstm_predictions (np.ndarray): LSTM model predictions
        prophet_predictions (np.ndarray): Prophet model predictions
        lstm_weight (float): Weight for LSTM predictions
        prophet_weight (float): Weight for Prophet predictions
    
    Returns:
        np.ndarray: Ensemble predictions
    """
    # Ensure weights sum to 1
    total_weight = lstm_weight + prophet_weight
    lstm_weight = lstm_weight / total_weight
    prophet_weight = prophet_weight / total_weight
    
    # Ensure predictions have compatible shapes
    if lstm_predictions.shape != prophet_predictions.shape:
        # Reshape if necessary
        if len(prophet_predictions.shape) == 1:
            prophet_predictions = prophet_predictions.reshape(-1, 1)
        if len(lstm_predictions.shape) == 1:
            lstm_predictions = lstm_predictions.reshape(-1, 1)
    
    # Create ensemble
    ensemble_predictions = (lstm_weight * lstm_predictions) + (prophet_weight * prophet_predictions)
    
    return ensemble_predictions


def adaptive_ensemble_weights(lstm_mae: float, prophet_mae: float) -> Tuple[float, float]:
    """
    Calculate adaptive ensemble weights based on model performance.
    
    Args:
        lstm_mae (float): LSTM model MAE
        prophet_mae (float): Prophet model MAE
    
    Returns:
        Tuple[float, float]: LSTM weight, Prophet weight
    """
    # Inverse of error as weight (better model gets higher weight)
    lstm_inv_error = 1 / (lstm_mae + 1e-8)  # Add small epsilon to avoid division by zero
    prophet_inv_error = 1 / (prophet_mae + 1e-8)
    
    total_inv_error = lstm_inv_error + prophet_inv_error
    
    lstm_weight = lstm_inv_error / total_inv_error
    prophet_weight = prophet_inv_error / total_inv_error
    
    return lstm_weight, prophet_weight


def train_models_pipeline(prepared_data: Dict[str, Any], 
                         prophet_data: pd.DataFrame,
                         model_configs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Complete training pipeline for both LSTM and Prophet models.
    
    Args:
        prepared_data (dict): Prepared LSTM data from feature engineering
        prophet_data (pd.DataFrame): Prepared Prophet data
        model_configs (dict, optional): Model configuration parameters
    
    Returns:
        dict: Dictionary containing trained models and results
    """
    # Import functions directly to avoid relative import issues
    import os
    import sys
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    from model_builder import build_simple_lstm_model, build_conservative_prophet_model, get_model_callbacks
    
    # Default configurations
    default_configs = {
        'epochs': 50,
        'batch_size': 64,
        'test_size': 0.2,
        'use_callbacks': True,
        'lstm_weight': 0.7,
        'prophet_weight': 0.3
    }
    
    if model_configs:
        default_configs.update(model_configs)
    
    results = {}
    
    # Extract prepared data
    X_sequences = prepared_data['X_sequences']
    y_sequences = prepared_data['y_sequences']
    
    # Check if we have enough data for training
    if X_sequences.shape[0] < 2:
        print("Insufficient data for model training")
        return results
    
    # Build and train LSTM model
    print("Training LSTM model...")
    input_shape = (X_sequences.shape[1], X_sequences.shape[2])
    lstm_model = build_simple_lstm_model(input_shape)
    
    callbacks = get_model_callbacks() if default_configs['use_callbacks'] else None
    
    lstm_history, X_train, X_test, y_train, y_test = train_lstm_with_split(
        lstm_model, X_sequences, y_sequences,
        test_size=default_configs['test_size'],
        epochs=default_configs['epochs'],
        batch_size=default_configs['batch_size'],
        callbacks=callbacks
    )
    
    results['lstm_model'] = lstm_model
    results['lstm_history'] = lstm_history
    results['X_train'] = X_train
    results['X_test'] = X_test
    results['y_train'] = y_train
    results['y_test'] = y_test
    
    # Build and train Prophet model
    print("Training Prophet model...")
    prophet_model = build_conservative_prophet_model()
    
    trained_prophet, train_df, val_df = train_prophet_with_validation(
        prophet_model, prophet_data
    )
    
    results['prophet_model'] = trained_prophet
    results['prophet_train_data'] = train_df
    results['prophet_val_data'] = val_df
    
    print("Model training completed successfully!")
    
    return results
