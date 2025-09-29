import requests
import pandas as pd
import os
from dotenv import load_dotenv
load_dotenv()

token = os.getenv("AI_TOKEN")
headers = {
    "Authorization": f"A103 {token}"
}
base_api_path = os.getenv("BASE_API_PATH", "")
product_base_api_path = f"{base_api_path}/product/dc"
# TIME_SERIES_BASE_API_PATH = f"{BASE_API_PATH}/pension/product/time-line"

def get_market_data():
    url = f"{base_api_path}/market"
    print(f"get market data {url}")
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    print("market data done")

    return [
        {
            'date': item['date'],
            # 'open_price' : item['initPrice'],
            # 'close_price' : item['finalPrice'],
            'kospi': item['kospi'],
            'oil_price': item['oilPrice'],
            'interest_pate': item['interestRate'],
            'price_index': item['priceIndex'],
            'cny_krw': item['cnyRate'],
            'usd_krw': item['usdRate'],
            'jpy_krw': item['jpyRate'],
        }
        for item in data
    ]


def get_product_list(product_type):
    url = f"{product_base_api_path}/{product_type}"
    print(f"{product_type} get list {url}")
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    print(f"{product_type} done")

    return [
        {
            'id': item['id'],
            'product': item['product'],
            'company': item['company'],
            'product_type': item['productType'],
            'profit_prediction': item['profitPrediction'],
            'risk_grade_id': item['riskGradeId']
        }
        for item in data
    ]


def get_time_series(product_id):
    url = f"{product_base_api_path}/{product_id}/timeline"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def load_data(product_type):
    product_list = get_product_list(product_type)
    print("get series")

    # 여러 상품 시계열 데이터 개별 DataFrame 생성 후 리스트에 저장
    df_list = []
    for item in product_list:
        product_id = item['id']
        series_data = get_time_series(product_id)

        # 시계열 데이터가 리스트(dict들)라고 가정, DataFrame으로 변환
        series_df = pd.DataFrame(series_data)
        series_df['product_id'] = product_id  # 상품 id 컬럼 추가

        df_list.append(series_df)

    # 개별 DataFrame을 하나로 합치기 (길이 달라도 문제 없음)
    full_df = pd.concat(df_list, ignore_index=True)
    print("done series")

    return full_df


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="상품 타입에 따라 상품 리스트와 시계열 데이터를 불러옵니다.")
    parser.add_argument(
        "--product_type",
        type=str,
        required=True,
        choices=["etf", "fund"],
        help="상품 타입을 입력하세요: 'etf' 또는 'fund'"
    )
    args = parser.parse_args()

    data_df = load_data(args.product_type)

    # csv 혹은 pickle로 저장
    # data_df.to_csv(f'{args.product_type}_time_series.csv', index=False, encoding='utf-8')
    data_df.to_pickle(f'{args.product_type}_time_series.pkl')

    print("모든 데이터를 성공적으로 불러와 저장했습니다.")