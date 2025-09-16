// app/(auth)/landing/landing4.tsx

import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import axios from "axios";
import { Colors } from "@/src/theme/colors";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ====== 타입 ======
type CompareResp = {
  dbCalculate: number;          // 최종 금액
  dbCalculateRate: number;      // 수익률 (미사용시 0)
  dbCalculateGraph: number[];   // [3y,5y,7y,10y]
  dcCalculate: number;
  dcCalculateRate: number;
  dcCalculateGraph: number[];   // [3y,5y,7y,10y]
  recommendProductList: any[] | null;
};

// ====== 유틸 ======
// 1) 숫자 → "3,456 만원"처럼 표시
const toManWon = (won: number) => {
  const man = Math.round(won / 10000);
  return man.toLocaleString("ko-KR") + " 만원";
};
// 2) 3·5·7·10년 레이블
const YEAR_LABELS = ["3년", "5년", "7년", "10년"] as const;

// 간단 차트 박스(미니 막대)
function ChartBox({ series = [] as number[] }) {
  const max = Math.max(...series, 1);
  return (
    <View style={styles.chartBox}>
      <View style={styles.barWrap}>
        {series.map((v, idx) => {
          const h = Math.max(8, (v / max) * 140); // 최소 8, 최대 140
          return (
            <View key={idx} style={styles.barCol}>
              <View style={[styles.bar, { height: h }]} />
              <Text style={styles.barLabel}>{YEAR_LABELS[idx]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function Landing4() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  
  const { salary: qsSalary, pid } = useLocalSearchParams<{ salary?: string; pid?: string }>();
  console.log("[L4] params:", { qsSalary, pid });
  
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [data, setData] = useState<CompareResp | null>(null);

  // 기본 투자성향 ID(없으면 1)
  const investorPersonalityId = useMemo(() => Number(pid ?? 1), [pid]);
  const yearlySalary = useMemo(() => Number(qsSalary ?? NaN), [qsSalary]);

  // ====== API 호출 (비회원 전용) ======
  const fetchPublicCompare = async () => {
    try {
      setLoading(true);
      setErrMsg(null);
      const { data } = await axios.get<CompareResp>(`${API_URL}/recommend/public/compare`, {
        params: {
          investorPersonalityId,
          salary: yearlySalary,
        },
        // 비회원: Authorization 절대 넣지 않음
      });
      setData(data);
    } catch (e: any) {
      console.error("[landing4] public compare error:", e?.message || e);
      setErrMsg("예상 수익 데이터를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!API_URL) {
      setErrMsg("API_URL(.env)이 설정되어 있지 않습니다.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(yearlySalary) || yearlySalary <= 0) {
      // 연봉이 없으면 이전 단계로 유도
      Alert.alert("연봉 정보가 필요해요", "이전 단계에서 연봉을 입력해 주세요.", [
        { text: "확인", onPress: () => router.replace("/(auth)/landing/landing2") },
      ]);
      setLoading(false);
      return;
    }
    if (!Number.isFinite(investorPersonalityId)) {
      setErrMsg("투자성향 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }
    fetchPublicCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorPersonalityId, yearlySalary]);

  const dcSeries = data?.dcCalculateGraph ?? [0, 0, 0, 0];
  const dbSeries = data?.dbCalculateGraph ?? [0, 0, 0, 0];
  const dcFinal = data?.dcCalculate ?? 0;
  const dbFinal = data?.dbCalculate ?? 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" translucent={false} />

      <SafeAreaView style={styles.wrap} edges={["top", "bottom"]}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 60 },
          ]}
        >
          {/* ===== DC 섹션 ===== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.pill}><Text style={styles.pillText}>DC</Text></View>
              <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
              <Image source={require("@/assets/icon/chart.png")} style={styles.sectionIcon} />
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : errMsg ? (
              <>
                <Text style={{ color: "#CC3B3B", fontFamily: "BasicMedium" }}>{errMsg}</Text>
                <TouchableOpacity onPress={fetchPublicCompare} style={{ paddingVertical: 6 }}>
                  <Text style={{ color: Colors.primary, fontFamily: "BasicMedium" }}>다시 시도</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.bigNumber}>{toManWon(dcFinal)}</Text>
                <Text style={styles.smallCaption}>3·5·7·10년 평균치 기반 간략 차트</Text>
                <ChartBox series={dcSeries} />
              </>
            )}
          </View>

          {/* ===== DB 섹션 ===== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.pill}><Text style={styles.pillText}>DB</Text></View>
              <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
              <Image source={require("@/assets/icon/chart.png")} style={styles.sectionIcon} />
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : errMsg ? (
              <>
                <Text style={{ color: "#CC3B3B", fontFamily: "BasicMedium" }}>{errMsg}</Text>
                <TouchableOpacity onPress={fetchPublicCompare} style={{ paddingVertical: 6 }}>
                  <Text style={{ color: Colors.primary, fontFamily: "BasicMedium" }}>다시 시도</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.bigNumber}>{toManWon(dbFinal)}</Text>
                <Text style={styles.smallCaption}>3·5·7·10년 평균치 기반 간략 차트</Text>
                <ChartBox series={dbSeries} />
              </>
            )}
          </View>

          {/* 알키 이미지: 위아래 둥둥 */}
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -18 }}
            transition={{ type: "timing", duration: 600, loop: true, repeatReverse: true }}
            style={styles.alkiWrap}
          >
            <Image
              source={require("@/assets/char/pointAlchi.png")}
              style={styles.alki}
              resizeMode="contain"
            />
          </MotiView>

          <Text style={styles.caption}>
            어떤 상품을 선택하면 좋은지 {"\n"} 알키가 더 자세히 알려드릴게요!
          </Text>

          {/* CTA 버튼 */}
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.8}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.ctaText}>더 많은 정보 확인하기</Text>
          </TouchableOpacity>

          {/* ✅ footer를 스크롤 영역 마지막에 배치 */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>연금술사</Text>
            <Text style={styles.footerText}>
              연금술사에서 제공하는 투자 정보는 고객의 투자 판단을 위한 {"\n"}
              단순 참고용일뿐, 투자 제안 및 권유, 종목 추천을 위해 작성된 {"\n"}
              것이 아닙니다.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.white },

  // 스크롤 컨텐츠
  scrollContent: {
    marginTop: 40,
    paddingHorizontal: 24,
    paddingTop: 32,        // 시작 여백
    alignItems: "center",
    rowGap: 24,
  },

  caption: {
    fontSize: 16,
    fontFamily: "BasicMedium",
    color: Colors.black,
    textAlign: "center",
  },

  alkiWrap: { 
    marginTop: 30,
    alignSelf: "center" },
  alki: { width: 260, height: 260 },

  ctaBtn: {
    width: 300,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },
  ctaText: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 16,
    fontFamily: "BasicMedium",
  },

  // footer (스크롤 내부)
  footer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerTitle: {
    fontSize: 14,
    fontFamily: "BasicMedium",
    color: "#999999",
    textAlign: "left",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11,
    fontFamily: "BasicLight",
    color: "#999999",
    lineHeight: 18,
    textAlign: "left",
  },

  // 차트 박스(placeholder)
  chartBox: {
    height: 180,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E9E9F2",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  chartPlaceholder: { fontSize: 14, color: "#B1B1C7" },

    // 섹션 공통
    section: { width: "100%" },
    sectionHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "#FFF7D6",
      borderRadius: 10,
      marginRight: 8,
    },
    pillText: { fontSize: 16, fontFamily: "BasicBold", color: "#2E2E3A" },
    sectionTitle: { fontSize: 18, fontFamily: "BasicBold", color: "#2E2E3A" },
    sectionIcon: { width: 28, height: 28, marginLeft: 8 },
    bigNumber: { marginTop: 6, fontSize: 36, fontFamily: "BasicBold", color: "#141416" },
    smallCaption: { marginTop: 6, marginBottom: 10, fontFamily: "BasicMedium", fontSize: 12, color: "#8A8AA3" },
  
    // 에러/리트라이
    errorBox: {
      alignSelf: "stretch",
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#F1C2C2",
      backgroundColor: "#FFF5F5",
      padding: 12,
      gap: 10,
    },
    errorText: { color: "#CC3B3B", fontFamily: "BasicMedium", fontSize: 13 },
    retryBtn: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: "#FFE1E1",
    },
    retryText: { fontSize: 12, color: "#B22B2B", fontFamily: "BasicMedium" },
  });
