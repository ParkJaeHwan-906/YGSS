import requests
import json
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional
import os

class BackendClient:
    """백엔드 API와 통신하는 클라이언트"""
    
    def __init__(self, backend_url: str = None):
        self.backend_url = backend_url or os.getenv('BACKEND_URL', 'http://localhost:8080')
        self.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'AI-Prediction-Service/1.0'
        }
    
    def send_etf_predictions(self, predictions_df: pd.DataFrame) -> bool:
        """ETF 예측 결과를 백엔드로 전송"""
        try:
            # DataFrame을 JSON 형태로 변환
            predictions_list = predictions_df.to_dict('records')
            
            payload = {
                'timestamp': datetime.now().isoformat(),
                'predictions': predictions_list,
                'model_version': 'v1.0',
                'source': 'jupyter_gpu_server',
                'total_count': len(predictions_list)
            }
            
            # 백엔드 API 호출
            response = requests.post(
                f"{self.backend_url}/api/ai/etf-predictions",
                json=payload,
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"✅ 백엔드로 {len(predictions_list)}개 ETF 예측 결과 전송 성공")
                return True
            else:
                print(f"❌ 백엔드 전송 실패: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            print("❌ 백엔드 연결 타임아웃")
            return False
        except requests.exceptions.ConnectionError:
            print("❌ 백엔드 서버 연결 실패")
            return False
        except Exception as e:
            print(f"❌ 예측 결과 전송 오류: {e}")
            return False
    
    def send_fund_predictions(self, predictions_df: pd.DataFrame) -> bool:
        """펀드 예측 결과를 백엔드로 전송"""
        try:
            predictions_list = predictions_df.to_dict('records')
            
            payload = {
                'timestamp': datetime.now().isoformat(),
                'predictions': predictions_list,
                'model_version': 'v1.0',
                'source': 'jupyter_gpu_server',
                'total_count': len(predictions_list)
            }
            
            response = requests.post(
                f"{self.backend_url}/api/ai/fund-predictions",
                json=payload,
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"✅ 백엔드로 {len(predictions_list)}개 펀드 예측 결과 전송 성공")
                return True
            else:
                print(f"❌ 백엔드 전송 실패: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ 펀드 예측 결과 전송 오류: {e}")
            return False
    
    def health_check(self) -> bool:
        """백엔드 서버 상태 확인"""
        try:
            response = requests.get(
                f"{self.backend_url}/api/health",
                timeout=10
            )
            return response.status_code == 200
        except:
            return False
    
    def test_connection(self):
        """연결 테스트"""
        print(f"백엔드 서버 연결 테스트: {self.backend_url}")
        if self.health_check():
            print("✅ 백엔드 서버 연결 성공")
        else:
            print("❌ 백엔드 서버 연결 실패")


# 사용 예시
if __name__ == "__main__":
    client = BackendClient("http://your-backend-server:8080")
    client.test_connection()
