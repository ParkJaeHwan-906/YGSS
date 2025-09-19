# -*- coding: utf-8 -*-
"""
Data loading and preprocessing module for ETF/Fund prediction system.
Handles CSV and PKL file loading with integrated preprocessing.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Optional


def load_data(file_path: str, data_type: str = 'auto') -> pd.DataFrame:
    """
    Load data from CSV or PKL files and perform integrated preprocessing.
    
    Args:
        file_path (str): Path to the data file
        data_type (str): Type of data ('etf', 'fund', 'market', or 'auto' for auto-detection)
    
    Returns:
        pd.DataFrame: Preprocessed DataFrame
    """
    file_path = Path(file_path)
    
    # Load data based on file extension
    if file_path.suffix.lower() == '.csv':
        df = pd.read_csv(file_path, encoding='utf-8')
    elif file_path.suffix.lower() == '.pkl':
        df = pd.read_pickle(file_path)
        df = pd.DataFrame(df)
    else:
        raise ValueError(f"Unsupported file format: {file_path.suffix}")
    
    # Auto-detect data type if not specified
    if data_type == 'auto':
        if 'kospi' in df.columns or 'oil_price' in df.columns:
            data_type = 'market'
        elif 'open' in df.columns and 'close' in df.columns:
            data_type = 'etf'  # or fund, they have similar structure
        else:
            data_type = 'unknown'
    
    # Apply preprocessing based on data type
    if data_type == 'market':
        df = _preprocess_market_data(df)
    elif data_type in ['etf', 'fund']:
        df = _preprocess_financial_data(df)
    
    return df


def _preprocess_market_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess market data (KOSPI, oil price, etc.).
    
    Args:
        df (pd.DataFrame): Raw market data
    
    Returns:
        pd.DataFrame: Preprocessed market data
    """
    # Standardize column names
    expected_columns = ['date', 'kospi', 'oil_price', 'interest_rate', 'price_index', 'cny_krw', 'usd_krw', 'jpy_krw']
    if len(df.columns) == len(expected_columns):
        df.columns = expected_columns
    
    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    
    # Convert numeric columns
    numeric_columns = [col for col in df.columns if col != 'date']
    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Remove rows with invalid dates
    df = df.dropna(subset=['date'])
    
    return df


def _preprocess_financial_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess ETF/Fund data.
    
    Args:
        df (pd.DataFrame): Raw ETF/Fund data
    
    Returns:
        pd.DataFrame: Preprocessed ETF/Fund data
    """
    # Standardize column names
    expected_columns = ['date', 'open', 'close', 'return', 'id']
    if len(df.columns) == len(expected_columns):
        df.columns = expected_columns
    
    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    
    # Convert numeric columns
    numeric_columns = ['open', 'close', 'return']
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Remove rows with invalid dates
    df = df.dropna(subset=['date'])
    
    # Add ETF ID prefix for grouping
    if 'id' in df.columns and 'etf_id_prefix' not in df.columns:
        df['etf_id_prefix'] = df['id'].apply(lambda x: x.split('_')[0] if isinstance(x, str) else x)
    
    return df


def merge_data(etf_data: pd.DataFrame, market_data: pd.DataFrame, 
               feature_columns: list) -> pd.DataFrame:
    """
    Merge ETF/Fund data with market data and select relevant features.
    
    Args:
        etf_data (pd.DataFrame): ETF/Fund data
        market_data (pd.DataFrame): Market indicator data
        feature_columns (list): List of feature columns to include
    
    Returns:
        pd.DataFrame: Merged and filtered data
    """
    # Merge on date column
    merged_data = pd.merge(etf_data, market_data, on='date', how='inner')
    
    # Select relevant columns
    base_columns = ['date', 'return']
    if 'id' in etf_data.columns:
        base_columns.append('id')
    if 'etf_id_prefix' in etf_data.columns:
        base_columns.append('etf_id_prefix')
    if 'company' in etf_data.columns:
        base_columns.extend(['company', 'name'])
    
    selected_columns = base_columns + feature_columns
    available_columns = [col for col in selected_columns if col in merged_data.columns]
    
    model_data = merged_data[available_columns].dropna()
    
    return model_data


def load_and_prepare_data(etf_path: str, market_path: str, 
                         feature_columns: list) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Load and prepare all data for modeling.
    
    Args:
        etf_path (str): Path to ETF/Fund data file
        market_path (str): Path to market data file
        feature_columns (list): List of feature columns to use
    
    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]: ETF data, market data, merged data
    """
    # Load individual datasets
    etf_data = load_data(etf_path, 'etf')
    market_data = load_data(market_path, 'market')
    
    # Merge data
    merged_data = merge_data(etf_data, market_data, feature_columns)
    
    return etf_data, market_data, merged_data
