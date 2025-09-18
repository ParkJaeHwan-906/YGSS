// src/api/dc.ts

import axios from "axios"

const API_URL = process.env.EXPO_PUBLIC_API_URL;
export type SortOrder = "desc" | "asc";
const sortNum = (s: SortOrder) => (s === "desc" ? 0 : 1);

// 응답 타입
export type DcItem = {
    id: number;
    product: string;           // 상품명
    company: string;           // 운용사
    productType: "ETF" | "펀드";
    profitPrediction: number;  // 예측 수익률
    riskGradeId: number;       // 위험등급
  };
  
export type BondItem = {
id: number;
productName: string;   // 채권 이름
publisher: string;     // 발행처
publisherGrade: string;// 발행처 신용등급
couponRate: number;    // 표면 금리
maturityYears: number; // 만기까지 남은 연수 (문서 오타 matrurityYears -> maturityYears로 가정)
};

export type ListRow = {
    kind: "ALL" | "ETF" | "FUND" | "BOND";
    id: number | string;
    title: string;
    subTitle: string;
    rate: number;
    risk?: string; // ListItem 내부에서 안전하게 정규화됨
};

// 위험등급 id → 라벨 (가정: 1~5)
const RISK_BY_ID: Record<number, string> = {
    1: "낮음",
    2: "보통",
    3: "다소높음",
    4: "높음",
    5: "매우높음",
  };
  const riskFromId = (id?: number) => (id && RISK_BY_ID[id]) || "보통";
  
// 신용등급 → 라벨 (예: AAA/AA/A/BBB/BB/B/CCC…)
const riskFromCredit = (grade?: string) => {
    const g = (grade ?? "").toUpperCase();
    if (/^AAA|^AA/.test(g)) return "낮음";
    if (/^A(?!A)/.test(g)) return "보통";
    if (/^BBB/.test(g)) return "다소높음";
    if (/^BB|^B(?!B)/.test(g)) return "높음";
    if (/CCC|^CC|^C|^D/.test(g)) return "매우높음";
    return "보통";
};

// API 함수
// 전체: ETF + 펀드
export async function fetchDcAll(sort: SortOrder) {
const res = await axios.get<DcItem[]>(`${API_URL}/product/dc`, {
    params: {
    sort: sortNum(sort),
    },
});
return res.data;
}

// ETF
export async function fetchDcEtfs(sort: SortOrder) {
const res = await axios.get<DcItem[]>(`${API_URL}/product/dc/etf`, {
    params: {
    sort: sortNum(sort),
    },
});
return res.data;
}

// 펀드
export async function fetchPensionFunds(sort: SortOrder) {
const res = await axios.get<DcItem[]>(`${API_URL}/product/dc/pension`, {
    params: { sort: sortNum(sort) },
});
return res.data;
}

// 채권
export async function fetchBond(sort: SortOrder) {
const res = await axios.get<BondItem[]>(`${API_URL}/product/dc/bond`, {
    params: { sort: sortNum(sort) },
});
return res.data;
}

// 화면 표시용 정규화
export function normalizeDcToList(rows: DcItem[], kind: "ALL" | "ETF" | "FUND"): ListRow[] {
    return rows.map((r) => ({
      kind,
      id: r.id,
      title: r.product,
      subTitle: r.company,
      rate: r.profitPrediction ?? 0,
      risk: riskFromId(r.riskGradeId),
    }));
  }
  
export function normalizeBondToList(rows: BondItem[]): ListRow[] {
    return rows.map((r) => ({
      kind: "BOND",
      id: r.id,
      title: r.productName,
      subTitle: r.publisherGrade ? `${r.publisher} • ${r.publisherGrade}` : r.publisher,
      rate: r.couponRate ?? 0,
      risk: riskFromCredit(r.publisherGrade),
    }));
  }