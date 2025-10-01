# -*- coding: utf-8 -*-
"""
Recommendation system for ETF/Fund portfolio optimization.
Handles portfolio analysis and product recommendations based on predicted returns.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict, Any, Optional, Tuple
from scipy.optimize import minimize


def recommend(user_portfolio: List[str], predicted_returns: pd.DataFrame,
              num_recommendations: int = 5, exclude_portfolio: bool = True) -> pd.DataFrame:
    """
    Recommend ETFs/Funds based on predicted returns and user portfolio.
    
    Args:
        user_portfolio (List[str]): List of ETF/Fund IDs in user's current portfolio
        predicted_returns (pd.DataFrame): DataFrame with predicted returns
        num_recommendations (int): Number of recommendations to return
        exclude_portfolio (bool): Whether to exclude current portfolio items
    
    Returns:
        pd.DataFrame: Recommended products with predicted returns
    """
    if exclude_portfolio:
        # Filter out products already in portfolio
        available_products = predicted_returns[
            ~predicted_returns['id'].isin(user_portfolio)
        ].copy()
    else:
        available_products = predicted_returns.copy()
    
    # Sort by predicted return (descending)
    recommendations = available_products.sort_values(
        by='predicted_return', ascending=False
    ).head(num_recommendations)
    
    return recommendations


def recommend_etfs(user_portfolio: List[str], predicted_returns_df: pd.DataFrame,
                   num_recommendations: int = 5) -> pd.DataFrame:
    """
    Recommend ETFs based on predicted returns (compatible with original code).
    
    Args:
        user_portfolio (List[str]): List of ETF IDs in user's current portfolio
        predicted_returns_df (pd.DataFrame): DataFrame with 'id' and 'predicted_return'
        num_recommendations (int): Number of top ETFs to recommend
    
    Returns:
        pd.DataFrame: Recommended ETFs and their predicted returns
    """
    return recommend(user_portfolio, predicted_returns_df, num_recommendations)


def calculate_portfolio_metrics(returns: np.ndarray, weights: np.ndarray) -> Dict[str, float]:
    """
    Calculate portfolio performance metrics.
    
    Args:
        returns (np.ndarray): Historical returns matrix (time x assets)
        weights (np.ndarray): Portfolio weights
    
    Returns:
        Dict[str, float]: Portfolio metrics
    """
    # Portfolio returns
    portfolio_returns = np.dot(returns, weights)
    
    # Calculate metrics
    expected_return = np.mean(portfolio_returns)
    volatility = np.std(portfolio_returns)
    sharpe_ratio = expected_return / volatility if volatility > 0 else 0
    
    return {
        'expected_return': expected_return,
        'volatility': volatility,
        'sharpe_ratio': sharpe_ratio
    }


def optimize_portfolio_weights(expected_returns: np.ndarray, 
                             cov_matrix: np.ndarray,
                             risk_tolerance: float = 0.5) -> np.ndarray:
    """
    Optimize portfolio weights using mean-variance optimization.
    
    Args:
        expected_returns (np.ndarray): Expected returns for each asset
        cov_matrix (np.ndarray): Covariance matrix of returns
        risk_tolerance (float): Risk tolerance (0=risk-averse, 1=risk-seeking)
    
    Returns:
        np.ndarray: Optimal portfolio weights
    """
    n_assets = len(expected_returns)
    
    # Objective function: maximize return - risk_penalty * risk
    def objective(weights):
        portfolio_return = np.dot(weights, expected_returns)
        portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        return -(portfolio_return - (1 - risk_tolerance) * portfolio_risk)
    
    # Constraints: weights sum to 1
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    
    # Bounds: weights between 0 and 1 (long-only portfolio)
    bounds = tuple((0, 1) for _ in range(n_assets))
    
    # Initial guess: equal weights
    initial_guess = np.array([1/n_assets] * n_assets)
    
    # Optimize
    result = minimize(objective, initial_guess, method='SLSQP',
                     bounds=bounds, constraints=constraints)
    
    return result.x if result.success else initial_guess


def recommend_portfolio_allocation(predicted_returns_df: pd.DataFrame,
                                 historical_returns: Optional[pd.DataFrame] = None,
                                 risk_tolerance: float = 0.5,
                                 max_assets: int = 10) -> Dict[str, Any]:
    """
    Recommend optimal portfolio allocation based on predicted returns.
    
    Args:
        predicted_returns_df (pd.DataFrame): Predicted returns for assets
        historical_returns (pd.DataFrame, optional): Historical returns data
        risk_tolerance (float): Risk tolerance level (0-1)
        max_assets (int): Maximum number of assets in portfolio
    
    Returns:
        Dict[str, Any]: Portfolio allocation recommendations
    """
    # Select top assets by predicted return
    top_assets = predicted_returns_df.nlargest(max_assets, 'predicted_return')
    
    if historical_returns is not None:
        # Use historical data for covariance calculation
        asset_ids = top_assets['id'].tolist()
        hist_data = historical_returns[historical_returns['id'].isin(asset_ids)]
        
        # Pivot to get returns matrix
        returns_matrix = hist_data.pivot(index='date', columns='id', values='return')
        returns_matrix = returns_matrix.fillna(0)
        
        # Calculate covariance matrix
        cov_matrix = returns_matrix.cov().values
        expected_returns = top_assets['predicted_return'].values
        
        # Optimize weights
        optimal_weights = optimize_portfolio_weights(expected_returns, cov_matrix, risk_tolerance)
    else:
        # Equal weights if no historical data
        optimal_weights = np.array([1/len(top_assets)] * len(top_assets))
    
    # Create allocation DataFrame
    allocation_df = pd.DataFrame({
        'id': top_assets['id'].values,
        'name': top_assets.get('name', top_assets['id']).values,
        'predicted_return': top_assets['predicted_return'].values,
        'weight': optimal_weights,
        'allocation_pct': optimal_weights * 100
    })
    
    # Sort by allocation percentage
    allocation_df = allocation_df.sort_values('allocation_pct', ascending=False)
    
    return {
        'allocation': allocation_df,
        'portfolio_expected_return': np.dot(optimal_weights, top_assets['predicted_return'].values),
        'risk_tolerance': risk_tolerance
    }


def analyze_portfolio_diversification(allocation_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze portfolio diversification metrics.
    
    Args:
        allocation_df (pd.DataFrame): Portfolio allocation data
    
    Returns:
        Dict[str, Any]: Diversification analysis
    """
    weights = allocation_df['weight'].values
    
    # Herfindahl-Hirschman Index (concentration measure)
    hhi = np.sum(weights ** 2)
    
    # Effective number of assets
    effective_assets = 1 / hhi
    
    # Diversification ratio
    diversification_ratio = len(weights) / effective_assets
    
    # Concentration in top holdings
    top_3_concentration = allocation_df.head(3)['weight'].sum()
    top_5_concentration = allocation_df.head(5)['weight'].sum()
    
    return {
        'hhi': hhi,
        'effective_assets': effective_assets,
        'diversification_ratio': diversification_ratio,
        'top_3_concentration': top_3_concentration,
        'top_5_concentration': top_5_concentration,
        'total_assets': len(weights)
    }


def generate_recommendation_report(user_portfolio: List[str],
                                 recommendations: pd.DataFrame,
                                 allocation: Optional[Dict[str, Any]] = None) -> str:
    """
    Generate a comprehensive recommendation report.
    
    Args:
        user_portfolio (List[str]): Current user portfolio
        recommendations (pd.DataFrame): Recommended products
        allocation (Dict[str, Any], optional): Portfolio allocation data
    
    Returns:
        str: Recommendation report
    """
    report = "=" * 60 + "\n"
    report += "투자 추천 보고서 (Investment Recommendation Report)\n"
    report += "=" * 60 + "\n\n"
    
    # Current portfolio
    report += f"현재 포트폴리오: {', '.join(user_portfolio)}\n\n"
    
    # Recommendations
    report += "추천 상품:\n"
    report += "-" * 30 + "\n"
    for idx, row in recommendations.iterrows():
        report += f"{idx+1}. {row.get('name', row['id'])} (ID: {row['id']})\n"
        report += f"   예상 수익률: {row['predicted_return']:.4f}\n"
        if 'company' in row:
            report += f"   운용사: {row['company']}\n"
        report += "\n"
    
    # Portfolio allocation
    if allocation:
        report += "포트폴리오 배분 추천:\n"
        report += "-" * 30 + "\n"
        allocation_df = allocation['allocation']
        
        for idx, row in allocation_df.iterrows():
            report += f"{row['id']}: {row['allocation_pct']:.1f}%\n"
        
        report += f"\n포트폴리오 예상 수익률: {allocation['portfolio_expected_return']:.4f}\n"
        report += f"위험 허용도: {allocation['risk_tolerance']:.2f}\n\n"
        
        # Diversification analysis
        div_analysis = analyze_portfolio_diversification(allocation_df)
        report += "다각화 분석:\n"
        report += f"- 유효 자산 수: {div_analysis['effective_assets']:.2f}\n"
        report += f"- 상위 3개 집중도: {div_analysis['top_3_concentration']:.1%}\n"
        report += f"- 상위 5개 집중도: {div_analysis['top_5_concentration']:.1%}\n"
    
    report += "\n" + "=" * 60
    
    return report


def visualize_recommendations(recommendations: pd.DataFrame, 
                            allocation: Optional[Dict[str, Any]] = None,
                            figsize: Tuple[int, int] = (15, 10),
                            save_path: Optional[str] = None):
    """
    Visualize recommendation results.
    
    Args:
        recommendations (pd.DataFrame): Recommended products
        allocation (Dict[str, Any], optional): Portfolio allocation data
        figsize (tuple): Figure size
        save_path (str, optional): Path to save the plot
    """
    # Setup Korean font
    from .model_evaluator import setup_korean_font
    setup_korean_font()
    
    if allocation:
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=figsize)
        
        # Recommendations bar chart
        ax1.barh(range(len(recommendations)), recommendations['predicted_return'])
        ax1.set_yticks(range(len(recommendations)))
        ax1.set_yticklabels([f"{row['id']}" for _, row in recommendations.iterrows()])
        ax1.set_xlabel('예상 수익률')
        ax1.set_title('추천 상품별 예상 수익률')
        ax1.grid(True, alpha=0.3)
        
        # Portfolio allocation pie chart
        allocation_df = allocation['allocation']
        ax2.pie(allocation_df['allocation_pct'], 
               labels=[f"{row['id']}\n({row['allocation_pct']:.1f}%)" 
                      for _, row in allocation_df.iterrows()],
               autopct='', startangle=90)
        ax2.set_title('포트폴리오 배분 추천')
        
    else:
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Recommendations bar chart
        ax.barh(range(len(recommendations)), recommendations['predicted_return'])
        ax.set_yticks(range(len(recommendations)))
        ax.set_yticklabels([f"{row['id']}" for _, row in recommendations.iterrows()])
        ax.set_xlabel('예상 수익률')
        ax.set_title('추천 상품별 예상 수익률')
        ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Recommendation plot saved to: {save_path}")
    
    plt.show()


def backtest_recommendations(recommendations: pd.DataFrame,
                           historical_data: pd.DataFrame,
                           start_date: str, end_date: str) -> Dict[str, Any]:
    """
    Backtest recommendation performance using historical data.
    
    Args:
        recommendations (pd.DataFrame): Recommended products
        historical_data (pd.DataFrame): Historical returns data
        start_date (str): Backtest start date
        end_date (str): Backtest end date
    
    Returns:
        Dict[str, Any]: Backtest results
    """
    # Filter historical data for backtest period
    hist_data = historical_data[
        (historical_data['date'] >= start_date) & 
        (historical_data['date'] <= end_date)
    ].copy()
    
    # Get recommended asset IDs
    recommended_ids = recommendations['id'].tolist()
    
    # Filter for recommended assets
    backtest_data = hist_data[hist_data['id'].isin(recommended_ids)]
    
    if len(backtest_data) == 0:
        return {'error': 'No historical data available for recommended assets'}
    
    # Calculate performance metrics
    performance_by_asset = {}
    for asset_id in recommended_ids:
        asset_data = backtest_data[backtest_data['id'] == asset_id]
        if len(asset_data) > 0:
            returns = asset_data['return'].values
            performance_by_asset[asset_id] = {
                'total_return': np.prod(1 + returns) - 1,
                'avg_return': np.mean(returns),
                'volatility': np.std(returns),
                'sharpe_ratio': np.mean(returns) / np.std(returns) if np.std(returns) > 0 else 0
            }
    
    return {
        'performance_by_asset': performance_by_asset,
        'backtest_period': f"{start_date} to {end_date}",
        'num_assets': len(performance_by_asset)
    }
