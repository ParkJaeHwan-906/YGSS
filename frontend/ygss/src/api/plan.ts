// src/api/plan.ts

import { ImageListData } from "@/components/organisms/ImageList";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchPlanDc(accessToken: string): Promise<ImageListData[]> {
  const { data } = await axios.get(`${API_URL}/pension/best`, {
    headers: { Authorization: `A103 ${accessToken}` },
  });

  return (data ?? []).map((row: any): ImageListData => {
    let logo;
    switch (row.productType) {
      case "ETF":
        logo = require("@/assets/icon/etf.png");
        break;
      case "펀드":
      case "FUND":
        logo = require("@/assets/icon/fund.png");
        break;
      case "채권":
      case "BOND":
        logo = require("@/assets/icon/bond.png");
        break;
      default:
        logo = require("@/assets/icon/etf.png"); // fallback
    }

    return {
      id: row.id,
      type: row.productType === "BOND" ? "BOND" : "ETF_FUND",
      logo,
      title: row.product,        // 상품명
      subTitle: row.company,     // 운용사
      rate:
        typeof row.profitPredictionRate === "number"
          ? row.profitPredictionRate
          : Number(row.profitPredictionRate ?? 0),
    };
  });
}