from typing import List, Tuple
import pandas as pd


def load_market_data(market_data_path: str) -> pd.DataFrame:
    """Load market data from pickle(.pkl/.pickle) or CSV and normalize columns."""
    if str(market_data_path).lower().endswith((".pkl", ".pickle")):
        market_data = pd.read_pickle(market_data_path)
    else:
        market_data = pd.read_csv(market_data_path, encoding="utf-8")

    # Expected column order
    market_data.columns = [
        "date",
        "kospi",
        "oil_price",
        "interest_rate",
        "price_index",
        "cny_krw",
        "usd_krw",
        "jpy_krw",
    ]
    market_data["date"] = pd.to_datetime(market_data["date"], errors="coerce")
    return market_data


def normalize_asset_df(asset_df: pd.DataFrame) -> pd.DataFrame:
    """Ensure required columns exist and have proper dtypes for the asset dataframe."""
    df = asset_df.copy()
    if set(df.columns) != {"date", "open", "close", "return", "id"}:
        # If columns are not normalized yet, try to coerce
        expected = ["date", "open", "close", "return", "id"]
        if len(df.columns) == 5:
            df.columns = expected
        else:
            # best-effort: keep required ones if present
            for col in expected:
                if col not in df.columns:
                    df[col] = None
            df = df[expected]
    df["return"] = pd.to_numeric(df["return"], errors="coerce")
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    return df


def merge_asset_and_market(
    asset_df: pd.DataFrame,
    market_df: pd.DataFrame,
    regression_group: List[str],
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Merge asset and market data, select base + regression columns, drop NA.

    Returns (merged_data, model_data)
    """
    merged = pd.merge(asset_df, market_df, on="date", how="inner")

    base_columns = ["date", "return"]
    if "id" in asset_df.columns:
        base_columns.append("id")
    if "company" in asset_df.columns:
        base_columns.extend(["company", "name"])

    model_data = merged[base_columns + regression_group].dropna()
    return merged, model_data
