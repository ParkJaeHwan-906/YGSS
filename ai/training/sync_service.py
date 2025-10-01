import json
from typing import Optional, Sequence

import pandas as pd
import requests
import os
from dotenv import load_dotenv
load_dotenv()

token = os.getenv("AI_TOKEN")
headers = {
    "Authorization": f"A103 {token}",
    "Content-Type" : "application/json"
}
base_api_path = os.getenv("BASE_API_PATH", "")

def build_payload(predicted_returns_df: pd.DataFrame) -> Sequence[dict]:
    """
    Convert predicted_returns_df to the backend payload format.
    Expected columns: ['id', 'predicted_return']
    Output: [{"id": str, "profit": float}, ...]
    """
    if predicted_returns_df is None or predicted_returns_df.empty:
        return []

    payload = [
        {"id": str(row["id"]), "profit": float(row["predicted_return"])}
        for _, row in predicted_returns_df.iterrows()
    ]
    return payload


session_default_headers = {"Content-Type": "application/json"}


def post_predictions(
    predicted_returns_df: pd.DataFrame,
    url: Optional[str] = None,
    timeout: int = 20,
    session: Optional[requests.sessions.Session] = None,
) -> dict:
    """
    Post predictions to backend as raw JSON array.

    Returns a dict with keys: {"status_code", "ok", "text"}
    """

    target_url = url or f"{base_api_path}/pension/update-profit"
    payload = build_payload(predicted_returns_df)

    if not payload:
        return {"status_code": None, "ok": False, "text": "Empty payload"}
    sess = session or requests
    json_data = json.dumps(payload)
    resp = sess.put(target_url, data=json_data, headers=headers, timeout=timeout)
    return {"status_code": getattr(resp, "status_code", None), "ok": getattr(resp, "ok", False), "text": getattr(resp, "text", "")}
