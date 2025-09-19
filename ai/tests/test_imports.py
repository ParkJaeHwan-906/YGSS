#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Import test script to check if all modules can be imported correctly.
"""

import os
import sys

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

print("Testing imports...")

try:
    print("1. Testing data_loader...")
    from data_loader import load_data, merge_data
    print("   ✓ data_loader imported successfully")
except Exception as e:
    print(f"   ✗ data_loader import failed: {e}")

try:
    print("2. Testing feature_engineering...")
    from feature_engineering import prepare_lstm_data, prepare_prophet_data
    print("   ✓ feature_engineering imported successfully")
except Exception as e:
    print(f"   ✗ feature_engineering import failed: {e}")

try:
    print("3. Testing model_builder...")
    from model_builder import configure_gpu, build_simple_lstm_model
    print("   ✓ model_builder imported successfully")
except Exception as e:
    print(f"   ✗ model_builder import failed: {e}")

try:
    print("4. Testing model_trainer...")
    from model_trainer import train_lstm_with_split, create_ensemble_predictions
    print("   ✓ model_trainer imported successfully")
except Exception as e:
    print(f"   ✗ model_trainer import failed: {e}")

try:
    print("5. Testing model_evaluator...")
    from model_evaluator import evaluate_predictions, compare_models
    print("   ✓ model_evaluator imported successfully")
except Exception as e:
    print(f"   ✗ model_evaluator import failed: {e}")

try:
    print("6. Testing recommender...")
    from recommender import recommend_etfs, generate_recommendation_report
    print("   ✓ recommender imported successfully")
except Exception as e:
    print(f"   ✗ recommender import failed: {e}")

print("\nAll import tests completed!")
