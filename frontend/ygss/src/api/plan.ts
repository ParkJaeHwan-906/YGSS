// src/api/plan.ts

import axios from "axios";
import { ImageListData } from "@/components/organisms/ImageList";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchPlanDc(accessToken: string): Promise<ImageListData[]> {
    const { data } = await axios.get(`${API_URL}/plan/dc`, {
      headers: { Authorization: `A103 ${accessToken}` },
    });
  
    return (data ?? []).map((row: any): ImageListData => {
        let logo;
        switch (row.systype) {
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
          logo,
          title: row.companyName,
          subTitle: row.systype,
          rate:
            typeof row.earnRate === "number"
              ? row.earnRate
              : Number(row.earnRate ?? 0),
        };
      });
}