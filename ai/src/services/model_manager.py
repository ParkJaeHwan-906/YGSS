# -*- coding: utf-8 -*-
"""
Model management module for saving and loading trained models.
Handles model persistence and metadata management.
"""

import os
import json
import pickle
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
from utils.data_utils import clean_etf_data, aggregate_monthly_data

class ModelManager:
    """Manages model saving, loading, and versioning."""
    
    def __init__(self, base_path: str = None, asset_type: Optional[str] = None):
        """
        Initialize ModelManager.
        
        Args:
            base_path (str): Base directory for model storage
        """
        if base_path is None:
            # Use the saved_models directory relative to the project root
            current_dir = Path(__file__).parent.parent
            base_root = current_dir / "saved_models"
        else:
            base_root = Path(base_path)

        # If asset_type provided, nest under that subdirectory (e.g., saved_models/etf or saved_models/fund)
        if asset_type:
            base_path = base_root / asset_type.lower()
        else:
            base_path = base_root
            
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        self.lstm_path = self.base_path / "lstm_models"
        self.prophet_path = self.base_path / "prophet_models"
        self.ensemble_path = self.base_path / "ensemble_models"
        self.scalers_path = self.base_path / "scalers"
        self.metadata_path = self.base_path / "metadata"
        
        for path in [self.lstm_path, self.prophet_path, self.ensemble_path, self.scalers_path, self.metadata_path]:
            path.mkdir(exist_ok=True)
    
    def _generate_model_hash(self, data_config: Dict[str, Any]) -> str:
        """Generate hash for model configuration."""
        config_str = json.dumps(data_config, sort_keys=True)
        return hashlib.md5(config_str.encode()).hexdigest()[:8]
    
    def _get_model_paths(self, model_hash: str) -> Dict[str, Path]:
        """Get file paths for a model."""
        return {
            'lstm_model': self.lstm_path / f"lstm_{model_hash}.h5",
            'prophet_model': self.prophet_path / f"prophet_{model_hash}.pkl",
            'ensemble_model': self.ensemble_path / f"ensemble_{model_hash}.pkl",
            'feature_scaler': self.scalers_path / f"feature_scaler_{model_hash}.pkl",
            'target_scaler': self.scalers_path / f"target_scaler_{model_hash}.pkl",
            'metadata': self.metadata_path / f"metadata_{model_hash}.json"
        }
    
    def save_models(self, models: Dict[str, Any], data_config: Dict[str, Any]) -> str:
        """
        Save trained models and associated data.
        """
        model_hash = self._generate_model_hash(data_config)
        paths = self._get_model_paths(model_hash)
    
        metadata_files = {}
    
        try:
            # Save LSTM model
            if 'lstm_model' in models and models['lstm_model'] is not None:
                models['lstm_model'].save(paths['lstm_model'])
                metadata_files['lstm_model'] = {
                    'file_name': paths['lstm_model'].name,
                    'relative_path': 'lstm_models'
                }
    
            # Save Prophet model
            if 'prophet_model' in models and models['prophet_model'] is not None:
                with open(paths['prophet_model'], 'wb') as f:
                    pickle.dump(models['prophet_model'], f)
                metadata_files['prophet_model'] = {
                    'file_name': paths['prophet_model'].name,
                    'relative_path': 'prophet_models'
                }
    
            # Save Ensemble model
            if 'ensemble_model' in models and models['ensemble_model'] is not None:
                with open(paths['ensemble_model'], 'wb') as f:
                    pickle.dump(models['ensemble_model'], f)
                metadata_files['ensemble_model'] = {
                    'file_name': paths['ensemble_model'].name,
                    'relative_path': 'ensemble_models'
                }
    
            # Save scalers
            if 'feature_scaler' in models and models['feature_scaler'] is not None:
                with open(paths['feature_scaler'], 'wb') as f:
                    pickle.dump(models['feature_scaler'], f)
                metadata_files['feature_scaler'] = {
                    'file_name': paths['feature_scaler'].name,
                    'relative_path': 'scalers'
                }
    
            if 'target_scaler' in models and models['target_scaler'] is not None:
                with open(paths['target_scaler'], 'wb') as f:
                    pickle.dump(models['target_scaler'], f)
                metadata_files['target_scaler'] = {
                    'file_name': paths['target_scaler'].name,
                    'relative_path': 'scalers'
                }
    
            # Save metadata
            metadata = {
                'model_hash': model_hash,
                'created_at': datetime.now().isoformat(),
                'data_config': data_config,
                'files': metadata_files,
                'model_info': {
                    'has_lstm': 'lstm_model' in models and models['lstm_model'] is not None,
                    'has_prophet': 'prophet_model' in models and models['prophet_model'] is not None,
                    'has_ensemble': 'ensemble_model' in models and models['ensemble_model'] is not None,
                    'has_feature_scaler': 'feature_scaler' in models and models['feature_scaler'] is not None,
                    'has_target_scaler': 'target_scaler' in models and models['target_scaler'] is not None
                }
            }
    
            with open(paths['metadata'], 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
    
            print(f"모델 저장 완료: {model_hash}")
            return model_hash
    
        except Exception as e:
            print(f"모델 저장 실패: {e}")
            return None


    
    def load_models(self, asset_type: str, model_hash: str, best_model_name: str) -> Optional[Dict[str, Any]]:
        """
        Load trained models and associated data.
        
        Args:
            model_hash (str): Hash of the model to load
        
        Returns:
            dict: Dictionary containing loaded models and scalers
        """
        paths = self._get_model_paths(model_hash)
        
        # Check if metadata exists
        if not paths['metadata'].exists():
            print(f"모델 메타데이터를 찾을 수 없습니다: {model_hash}")
            return None
        
        try:
            # Load metadata
            with open(paths['metadata'], 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            models = {'metadata': metadata}
            
            # Load LSTM model
            if paths['lstm_model'].exists():
                from tensorflow.keras.models import load_model
                models['lstm_model'] = load_model(paths['lstm_model'])
            
            # Load Prophet model
            if paths['prophet_model'].exists():
                with open(paths['prophet_model'], 'rb') as f:
                    models['prophet_model'] = pickle.load(f)

            # Load Ensemble model (may be a config dict or estimator)
            if paths.get('ensemble_model') and paths['ensemble_model'].exists():
                with open(paths['ensemble_model'], 'rb') as f:
                    models['ensemble_model'] = pickle.load(f)
            
            # Load scalers
            if paths['feature_scaler'].exists():
                with open(paths['feature_scaler'], 'rb') as f:
                    models['feature_scaler'] = pickle.load(f)
            
            if paths['target_scaler'].exists():
                with open(paths['target_scaler'], 'rb') as f:
                    models['target_scaler'] = pickle.load(f)
            
            print(f"모델 로딩 완료: {model_hash}")
            return models
            
        except Exception as e:
            print(f"모델 로딩 실패: {e}")
            return None
    
    def model_exists(self, data_config: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Check if a model exists for the given configuration.
        
        Args:
            data_config (dict): Configuration to check
        
        Returns:
            tuple: (exists, model_hash)
        """
        model_hash = self._generate_model_hash(data_config)
        paths = self._get_model_paths(model_hash)
        
        exists = paths['metadata'].exists()
        return exists, model_hash
    
    def list_models(self) -> list:
        """List all available models."""
        models = []
        
        for metadata_file in self.metadata_path.glob("metadata_*.json"):
            try:
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                models.append(metadata)
            except Exception as e:
                print(f"메타데이터 읽기 실패 {metadata_file}: {e}")
        
        return sorted(models, key=lambda x: x['created_at'], reverse=True)
    
    def delete_model(self, model_hash: str) -> bool:
        """Delete a model and all associated files."""
        paths = self._get_model_paths(model_hash)
        
        try:
            for path in paths.values():
                if path.exists():
                    path.unlink()
            
            print(f"모델 삭제 완료: {model_hash}")
            return True
            
        except Exception as e:
            print(f"모델 삭제 실패: {e}")
            return False


def create_data_config(regression_group: list, sequence_length: int, 
                       data_shape: tuple, data_hash: str = None) -> Dict[str, Any]:
    """
    Create a configuration dictionary for model identification.
    
    Args:
        regression_group (list): Feature columns used
        sequence_length (int): LSTM sequence length
        data_shape (tuple): Shape of the training data
        data_hash (str): Hash of the data (optional)
    
    Returns:
        dict: Configuration dictionary
    """
    return {
        'regression_group': sorted(regression_group),
        'sequence_length': sequence_length,
        'data_shape': list(data_shape),
        'data_hash': data_hash or 'unknown'
    }


def get_data_hash(data: pd.DataFrame) -> str:
    """Generate hash for dataset to detect changes."""
    # Use a sample of the data to generate hash (for performance)
    sample_size = min(1000, len(data))
    sample_data = data.head(sample_size)
    
    # Convert to string and hash
    data_str = sample_data.to_string()
    return hashlib.md5(data_str.encode()).hexdigest()[:8]


def save_models_for_fastapi(models: Dict[str, Any], data_config: Dict[str, Any], 
                            base_path: str = None, asset_type: Optional[str] = None) -> str:
    """
    FastAPI upload endpoint와 호환되는 모델 저장 함수.
    
    Args:
        models (dict): Dictionary containing trained models and scalers
        data_config (dict): Configuration used for training
        base_path (str): Base directory for model storage
        asset_type (str): Asset type (ETF, Fund 등)
    
    Returns:
        str: Model hash for future loading
    """
    manager = ModelManager(base_path=base_path, asset_type=asset_type)
    return manager.save_models(models, data_config)


def load_models_from_fastapi(model_hash: str, base_path: str = None, 
                             asset_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    FastAPI에서 저장된 모델을 로딩하는 함수.
    
    Args:
        model_hash (str): Hash of the model to load
        base_path (str): Base directory for model storage
        asset_type (str): Asset type (ETF, Fund 등)
    
    Returns:
        dict: Dictionary containing loaded models and scalers
    """
    manager = ModelManager(base_path=base_path, asset_type=asset_type)
    return manager.load_models(model_hash)


def list_models_from_fastapi(base_path: str = None, asset_type: Optional[str] = None) -> list:
    """
    FastAPI에서 저장된 모델 목록을 조회하는 함수.
    
    Args:
        base_path (str): Base directory for model storage
        asset_type (str): Asset type (ETF, Fund 등)
    
    Returns:
        list: List of model metadata
    """
    manager = ModelManager(base_path=base_path, asset_type=asset_type)
    return manager.list_models()


def delete_model_from_fastapi(model_hash: str, base_path: str = None, 
                              asset_type: Optional[str] = None) -> bool:
    """
    FastAPI에서 저장된 모델을 삭제하는 함수.
    
    Args:
        model_hash (str): Hash of the model to delete
        base_path (str): Base directory for model storage
        asset_type (str): Asset type (ETF, Fund 등)
    
    Returns:
        bool: True if deletion successful
    """
    manager = ModelManager(base_path=base_path, asset_type=asset_type)
    return manager.delete_model(model_hash)