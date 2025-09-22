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
import { LineChart } from "react-native-gifted-charts";
import { Dimensions } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const screenW = Dimensions.get("window").width;

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
// 숫자 → "3,456 만원"처럼 표시
const toManWon = (won: number) => {
  const man = Math.round(won / 10000);
  return man.toLocaleString("ko-KR") + " 만원";
};

// 연도별로 금액 넣기
const YEAR_ORDER = [3, 5, 7, 10] as const;
const getYearIndex = (y: number) => Math.max(0, YEAR_ORDER.indexOf(y as any));
const pickByYear = (arr: number[] | undefined, y: number) =>
  Array.isArray(arr) ? (arr[getYearIndex(y)] ?? 0) : 0;

// 3·5·7·10년 레이블
const YEAR_LABELS = ["3년", "5년", "7년", "10년"] as const;

// 라인 차트
const lcomp = (txt: string) => (
  <Text style={{ color: "lightgray", fontSize: 11, fontFamily: "BasicMedium" }}>{txt}</Text>
);

// 데이터 포인트(원)
const dPoint = () => (
  <View
    style={{
      width: 12,
      height: 12,
      backgroundColor: "#fff",
      borderWidth: 3,
      borderRadius: 6,
      borderColor: Colors.primary, // 테마 색 사용
    }}
  />
);

// 보기 좋은 max 값으로 올림
const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const ceilNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return ceilNorm * mag;
};

// (추가) gifted-charts용 데이터 변환기
const toLineSeries = (arr?: number[]) => {
  const a = Array.isArray(arr) ? arr.slice(0, 4) : [];
  while (a.length < 4) a.push(0);
  return a.map((value, idx) => ({
    value,
    labelComponent: () => lcomp(YEAR_LABELS[idx]),
    customDataPoint: dPoint,
  }));
};


export default function Landing4() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 정보 받기
  const { salary: qsSalary, pid } = useLocalSearchParams<{ salary?: string; pid?: string }>();
  
  // 연봉 파싱
  const parsedSalary = (qsSalary ?? "").toString().replace(/\D/g, "");
  const yearlySalary = useMemo(() => Number(parsedSalary), [parsedSalary]);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [data, setData] = useState<CompareResp | null>(null);

  const parsedPid = (pid ?? "").toString().replace(/\D/g, "");
  const investorPersonalityId = useMemo(() => {
    const n = Number(parsedPid);
    // 비로그인 랜딩의 기본값을 2(안정추구형)로 가정
    return Number.isFinite(n) && n > 0 ? n : 2;
  }, [parsedPid]);

  // 릴리스 행잉 회피(preview 버전)
  const controllerRef = React.useRef<AbortController | null>(null);

  // ====== API 호출 (비회원 전용) ======
  const fetchPublicCompare = async () => {
    // ── 1) 쿼리 파라미터 (만원 → 원 보정)
    const params = {
      investorPersonalityId,
      salary: yearlySalary * 10000, // ★ 중요: 단위 보정
    };
 
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setLoading(true);
    setErrMsg(null);
    console.time("[L4] fetchPublicCompare");

    const hardTimeout = new Promise<never>((_, rej) =>
      setTimeout(() => {
        controllerRef.current?.abort();
        rej(new Error("HARD_TIMEOUT"));
      }, 10000)
    );
  
    try {
      const axiosPromise = axios.get<CompareResp>(
        `${API_URL}/recommend/public/compare/dc`,
        {
          params,
          timeout: 8000,
          validateStatus: s => s >= 200 && s < 300,
          headers: {
            Accept: "application/json",
            "User-Agent": "ygss-app/preview",
          },
        }
      );
      const { data, status } = await Promise.race([
        axiosPromise,
        hardTimeout,
      ]);
  
      setData(data);
    } catch (e: any) {
      console.timeEnd("[L4] fetchPublicCompare");
  
      // ── 3) 에러 상세 로그
      if (axios.isAxiosError(e)) {
        console.log("[L4] AXIOS ERROR", {
          code: e.code,
          message: e.message,
          status: e.response?.status,
          data: e.response?.data,
        });
        if (e.code === "ECONNABORTED") {
          setErrMsg("서버 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.");
        } else {
          setErrMsg("예상 수익 데이터를 불러오지 못했어요.");
        }
      } else {
        console.log("[L4] UNKNOWN ERROR", e);
        setErrMsg("네트워크 오류가 발생했어요.");
      }
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
      setErrMsg("연봉 정보가 필요해요, 이전 단계에서 입력을 확인해주세요.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(investorPersonalityId)) {
      setErrMsg("투자성향 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }
    fetchPublicCompare();
    return () => controllerRef.current?.abort();
  }, [investorPersonalityId, yearlySalary]);

  // 원 → 만원으로 변환해서 차트/축에 사용
  const dcGraphMan = (data?.dcCalculateGraph ?? []).map(v => Math.round(v / 10000));
  const dbGraphMan = (data?.dbCalculateGraph ?? []).map(v => Math.round(v / 10000));
  const dcFinal = pickByYear(data?.dcCalculateGraph, 10);
  const dbFinal = pickByYear(data?.dbCalculateGraph, 10);
  const dcChartData = toLineSeries(dcGraphMan);
  const dbChartData = toLineSeries(dbGraphMan);
  const dcMaxVal = Math.max(1, niceMax(Math.max(...dcGraphMan, 0) * 1.1));
  const dbMaxVal = Math.max(1, niceMax(Math.max(...dbGraphMan, 0) * 1.1));

  // 컴포넌트 내부 (return 위)
  const horizontalPad = 24;
  const bleedStyle = {
    marginLeft: -(horizontalPad + insets.left),
    width: screenW + horizontalPad * 2 + insets.left + insets.right,
  };


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
          <View style={[styles.section, styles.dcSection, bleedStyle]}>
            <View style={styles.sectionHeader}>
              {/* 왼쪽 배치 */}
              <View style={styles.headerLeft}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>DC</Text>
                </View>
                <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
              </View>

              {/* 오른쪽 아이콘 */}
              <Image
                source={require("@/assets/icon/chart2.png")}
                style={styles.sectionIcon}
                resizeMode="contain"
              />
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
                <Text style={styles.smallCaption}>근속년수 '10년' 기준 퇴직연금 입니다.</Text>
                <View style={[styles.chartBox, { overflow: "hidden" }]}>
                  <LineChart
                    isAnimated
                    animateOnDataChange
                    animationDuration={800}
                    onDataChangeAnimationDuration={600}
                    color={Colors.red}
                    thickness={2}
                    areaChart
                    startFillColor={Colors.red}
                    endFillColor={Colors.red}
                    startOpacity={0.4}
                    endOpacity={0.05}
                    data={dcChartData}
                    maxValue={dcMaxVal}
                    noOfSections={4}
                    hideDataPoints // 기본 점 숨기고 customDataPoint만 노출
                    spacing={80}
                    initialSpacing={40}
                    endSpacing={40}
                    width={300}
                    yAxisTextStyle={{
                      color: Colors.gray,
                      fontSize: 10,
                      fontFamily: "BasicMedium",
                    }}
                    yAxisColor={Colors.gray}
                    xAxisColor={Colors.gray}
                    rulesColor={Colors.gray}
                    rulesType="solid"
                    backgroundColor={Colors.white} // 차트 캔버스 배경
                  />
                </View>
              </>
            )}
          </View>

          {/* ===== DB 섹션 ===== */}
          <View style={[styles.section, styles.dbSection, bleedStyle]}>
            <View style={styles.sectionHeader}>
              {/* 왼쪽 배치 */}
              <View style={styles.headerLeft}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>DB</Text>
                </View>
                <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
              </View>
              {/* 오른쪽 배치 */}
              <Image
                source={require("@/assets/icon/chart2.png")}
                style={styles.sectionIcon}
                resizeMode="contain"
              />
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
                <Text style={styles.smallCaption}>근속년수 '10년' 기준 퇴직연금 입니다.</Text>
                <View style={[styles.chartBox, { overflow: "hidden" }]}>
                  <LineChart
                    isAnimated
                    animateOnDataChange
                    animationDuration={800}
                    onDataChangeAnimationDuration={600}
                    color={Colors.red}
                    thickness={2}
                    areaChart
                    startFillColor={Colors.red}
                    endFillColor={Colors.red}
                    startOpacity={0.4}
                    endOpacity={0.05}
                    data={dbChartData}
                    maxValue={dbMaxVal}
                    noOfSections={4}
                    hideDataPoints // 기본 점 숨기고 customDataPoint만 노출
                    spacing={80}
                    initialSpacing={40}
                    endSpacing={40}
                    width={300}
                    yAxisTextStyle={{
                      color: Colors.gray,
                      fontSize: 10,
                      fontFamily: "BasicMedium",
                    }}
                    yAxisColor={Colors.gray}
                    xAxisColor={Colors.gray}
                    rulesColor={Colors.gray}
                    rulesType="solid"
                    backgroundColor={Colors.white} // 차트 캔버스 배경
                  />
                </View>
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
  marginTop: 10,
  paddingHorizontal: 24,
  paddingTop: 32,        // 시작 여백
  alignItems: "stretch",
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
  alignSelf: "center",
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      shadowColor: Colors.primary,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 10,
    },
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
  marginTop: 30,
  backgroundColor: Colors.white,
  paddingVertical: 20,
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
  width: 360,
  height: 280,
  borderRadius: 12,
  backgroundColor: Colors.white,
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "stretch",
  shadowColor: Colors.primary,
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 10,
},
chartPlaceholder: { fontSize: 14, color: "#B1B1C7" },

  // 섹션 공통
  section: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  dcSection: {
    backgroundColor: Colors.back,
  },
  dbSection: {
    backgroundColor: Colors.base,
  },

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    marginBottom: 10,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
    paddingRight: 44,
  },

  iconWrap: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -14 }],
  },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginRight: 8,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  pillText: { fontSize: 16, fontFamily: "BasicBold", color: "#2E2E3A" },
  sectionTitle: { fontSize: 18, fontFamily: "BasicBold", color: "#2E2E3A", flexShrink: 1 },
  sectionIcon: {
    position: "absolute",
    right: 60,
    top: "50%",
    transform: [{ translateY: -12 }],
    width: 60,
    height: 60,
    overflow: "visible",
  },
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
