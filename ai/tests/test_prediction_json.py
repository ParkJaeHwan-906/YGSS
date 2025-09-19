import pandas as pd
import numpy as np
import sys
import os
from pathlib import Path

# 현재 디렉토리를 Python 경로에 추가
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

def run_prediction_and_preview():
    """AI 모델을 실행하여 예측 결과를 생성하고 미리보기"""
    
    print("=" * 60)
    print("AI 모델 예측 결과 생성 및 미리보기")
    print("=" * 60)
    
    try:
        # main.py 모듈 임포트
        from main import main
        
        # 1. 데이터 로드
        print("1. 데이터 로드...")
        etf_data_path = r"C:\Users\SSAFY\Desktop\ssafy\new\S13P21A103\ai\data\etf_data.pkl"
        market_data_path = r"C:\Users\SSAFY\Desktop\ssafy\new\S13P21A103\ai\data\market_data.csv"
        
        etf_data = pd.read_pickle(etf_data_path)
        etf_data = pd.DataFrame(etf_data)
        etf_data.columns = ['date', 'open', 'close', 'return', 'id']
        etf_data['return'] = pd.to_numeric(etf_data['return'], errors='coerce')
        etf_data['date'] = pd.to_datetime(etf_data['date'], errors='coerce')
        
        print(f"   - ETF 데이터 로드 완료: {etf_data.shape}")
        
        # 2. AI 모델 실행
        print("\n2. AI 모델 실행 중...")
        print("   (모델 학습 및 예측 생성 - 시간이 소요될 수 있습니다)")
        
        results = main(
            etf_data=etf_data,
            regression_group=['kospi', 'oil_price', 'price_index', 'cny_krw'],
            market_data_path=market_data_path,
            sequence_length=12,
            force_retrain=False,
            # send_to_backend=False  # 백엔드 전송 비활성화
        )
        
        # 3. 예측 결과 추출
        predicted_returns_df = results['predictions']['predicted_returns_df']
        predicted_returns_df.to_json("predicted_returns.json", orient='records')
        
        if predicted_returns_df is None or predicted_returns_df.empty:
            print("❌ 예측 결과가 없습니다.")
            return None
        
        # 4. 예측 결과 미리보기
        print("\n" + "=" * 60)
        print("🎯 AI 모델 예측 결과 미리보기")
        print("=" * 60)
        
        print(f"\n📊 예측 결과 기본 정보:")
        print(f"   - 총 예측 ETF 개수: {len(predicted_returns_df)}")
        print(f"   - 데이터 컬럼: {list(predicted_returns_df.columns)}")
        print(f"   - 데이터 타입:\n{predicted_returns_df.dtypes}")
        
        # 5. 예측 수익률 통계
        print(f"\n📈 예측 수익률 통계:")
        print(f"   - 평균 예측 수익률: {predicted_returns_df['predicted_return'].mean():.4f}")
        print(f"   - 최고 예측 수익률: {predicted_returns_df['predicted_return'].max():.4f}")
        print(f"   - 최저 예측 수익률: {predicted_returns_df['predicted_return'].min():.4f}")
        print(f"   - 표준편차: {predicted_returns_df['predicted_return'].std():.4f}")
        
        # 6. 상위 예측 수익률 ETF
        print(f"\n🏆 상위 10개 예측 수익률 ETF:")
        print("-" * 40)
        top_predictions = predicted_returns_df.head(10)
        for idx, row in top_predictions.iterrows():
            print(f"   {idx+1:2d}. {row['id']}: {row['predicted_return']:8.4f}")
        
        # 7. 하위 예측 수익률 ETF
        print(f"\n📉 하위 5개 예측 수익률 ETF:")
        print("-" * 40)
        bottom_predictions = predicted_returns_df.tail(5)
        for idx, row in bottom_predictions.iterrows():
            rank = len(predicted_returns_df) - len(bottom_predictions) + (idx - bottom_predictions.index[0]) + 1
            print(f"   {rank:2d}. {row['id']}: {row['predicted_return']:8.4f}")
        
        # 8. 전체 데이터 테이블 미리보기
        print(f"\n📋 전체 예측 결과 테이블:")
        print("-" * 50)
        print(predicted_returns_df.to_string(index=False))
        
        # 9. 수익률 분포
        print(f"\n📊 예측 수익률 분포:")
        print("-" * 30)
        positive_count = len(predicted_returns_df[predicted_returns_df['predicted_return'] > 0])
        negative_count = len(predicted_returns_df[predicted_returns_df['predicted_return'] < 0])
        zero_count = len(predicted_returns_df[predicted_returns_df['predicted_return'] == 0])
        
        print(f"   양수 예측: {positive_count}개 ({positive_count/len(predicted_returns_df)*100:.1f}%)")
        print(f"   음수 예측: {negative_count}개 ({negative_count/len(predicted_returns_df)*100:.1f}%)")
        print(f"   제로 예측: {zero_count}개 ({zero_count/len(predicted_returns_df)*100:.1f}%)")
        
        return predicted_returns_df
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return None

def load_saved_predictions():
    """저장된 예측 결과가 있다면 로드"""
    print("\n" + "=" * 60)
    print("저장된 예측 결과 확인")
    print("=" * 60)
    
    # 저장된 모델 결과 파일들 확인
    saved_models_path = Path("../../saved_models")
    if saved_models_path.exists():
        print(f"저장된 모델 디렉토리: {saved_models_path.absolute()}")
        
        # 메타데이터 파일들 확인
        metadata_path = saved_models_path / "metadata"
        if metadata_path.exists():
            metadata_files = list(metadata_path.glob("*.json"))
            print(f"메타데이터 파일 개수: {len(metadata_files)}")
            
            for file in metadata_files[:3]:  # 최대 3개만 표시
                print(f"   - {file.name}")
        else:
            print("메타데이터 디렉토리가 없습니다.")
    else:
        print("저장된 모델 디렉토리가 없습니다.")

if __name__ == "__main__":
    # 저장된 예측 결과 확인
    load_saved_predictions()
    
    # AI 모델 실행하여 새로운 예측 결과 생성
    print("\n" + "🚀 새로운 예측 실행을 시작합니다...")
    predicted_df = run_prediction_and_preview()
    
    if predicted_df is not None:
        print("\n" + "=" * 60)
        print("✅ 예측 결과 미리보기 완료!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ 예측 실행 실패")
        print("=" * 60)