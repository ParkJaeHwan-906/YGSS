// app/(auth)/landing/landing4.tsx
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState, useRef } from "react";
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
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import axios from "axios";
import { Colors } from "@/src/theme/colors";
import { LineChart } from "react-native-gifted-charts";
import { Dimensions } from "react-native";
import { BlurView } from "expo-blur";

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

// DC용 가짜 차트
const DC_BASE_MAN = [35, 42, 58, 76];

// 주기적으로 값에 미세 파동을 넣어주는 훅
function useWobble(base: number[], amp = 3, fps = 12) {
  const [series, setSeries] = useState(base);
  const tRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) return;
    const interval = 1000 / fps;
    timerRef.current = setInterval(() => {
      tRef.current += 1;
      const t = tRef.current;
      setSeries(base.map((v, i) => v + Math.sin((t + i * 0.8) * 0.9) * amp));
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [base, amp, fps]);

  return series;
}

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

// 블러 배경
// Jelly 형태로 꿀렁거리는 배경
const JellyBlob = () => {
  return (
    <MotiView
      from={{ scale: 0.95, rotate: "0deg" }}
      animate={{ scale: 1.05, rotate: "3deg" }}
      transition={{ type: "timing", duration: 1200, loop: true, repeatReverse: true }}
      style={{
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: "#F5A9B8",
        opacity: 0.35,
      }}
    />
  );
};

const JellyBlob2 = () => {
  return (
    <MotiView
      from={{ scale: 1.05, rotate: "-2deg" }}
      animate={{ scale: 0.95, rotate: "1deg" }}
      transition={{ type: "timing", duration: 1400, loop: true, repeatReverse: true }}
      style={{
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "#C8D6FA",
        opacity: 0.35,
      }}
    />
  );
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

  // const fetchPublicCompare = async () => {
  //   const params = {
  //     investorPersonalityId,
  //     salary: yearlySalary * 10000,
  //   };
  
  //   // 환경 진단 로그
  //   console.log("[L4] ENV", {
  //     API_URL,
  //     Platform: Platform.OS,
  //     // appOwnership: Constants?.appOwnership, // 'expo'|'standalone'|'guest' (선택)
  //     isWeb: Platform.OS === "web",
  //     params,
  //   });
  
  //   // 이전 요청 취소 로직은 잠깐 비활성화 (abort 오작동 배제)
  //   // controllerRef.current?.abort();
  //   // controllerRef.current = new AbortController();
  
  //   setLoading(true);
  //   setErrMsg(null);
  
  //   // 1) 기본 시도 (validateStatus로 4xx/5xx도 log에 보이게)
  //   try {
  //     console.log("[L4] >>> REQUEST(try#1)", {
  //       url: `${API_URL}/recommend/public/compare/dc`,
  //       params,
  //       headers: { Accept: "application/json" },
  //     });
  
  //     const resp = await axios.get<CompareResp>(
  //       `${API_URL}/recommend/public/compare/dc`,
  //       {
  //         params,
  //         timeout: 8000,
  //         validateStatus: () => true,
  //         headers: {
  //           Accept: "application/json",
  //           // UA 이슈 의심 시 명시적으로 제거/무력화
  //           "User-Agent": undefined as any,
  //           "user-agent": undefined as any,
  //         },
  //         // signal: controllerRef.current?.signal, // 일단 주석
  //       }
  //     );
  
  //     console.log("[L4] <<< RESPONSE(try#1)", {
  //       status: resp.status,
  //       headers: resp.headers,
  //       data: resp.data,
  //     });
  
  //     if (resp.status >= 400) {
  //       const body: any = resp.data;
  //       setErrMsg(`[${resp.status}] ${body?.message || body?.error || "요청 실패"}`);
  //       return;
  //     }
  
  //     setData(resp.data);
  //     return;
  //   } catch (e: any) {
  //     console.log("[L4] !!! AXIOS ERROR(try#1)", {
  //       code: e?.code,
  //       message: e?.message,
  //       status: e?.response?.status,
  //       data: e?.response?.data,
  //     });
  //   }
  
  //   // 2) 재시도: abort/timeout 완전 제거 + fetch로 CORS 여부 구분 (특히 웹일 때)
  //   try {
  //     console.log("[L4] >>> RETRY as fetch(try#2)");
  //     const u = new URL(`${API_URL}/recommend/public/compare/dc`);
  //     u.searchParams.set("investorPersonalityId", String(params.investorPersonalityId));
  //     u.searchParams.set("salary", String(params.salary));
  
  //     const res = await fetch(u.toString(), {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //       },
  //       // 웹에서만 의미 있음. 네이티브는 CORS 안탐
  //       // mode: "cors",
  //     });
  
  //     console.log("[L4] <<< FETCH RESPONSE(try#2)", {
  //       ok: res.ok,
  //       status: res.status,
  //       headers: Array.from(res.headers.entries()),
  //     });
  
  //     const body = await res.json().catch(() => null);
  //     console.log("[L4] <<< FETCH BODY(try#2)", body);
  
  //     if (!res.ok) {
  //       setErrMsg(`[${res.status}] ${(body as any)?.message || (body as any)?.error || "요청 실패"}`);
  //       return;
  //     }
  
  //     setData(body as CompareResp);
  //   } catch (e: any) {
  //     console.log("[L4] !!! FETCH ERROR(try#2)", {
  //       name: e?.name,
  //       message: e?.message,
  //     });
  
  //     // 플랫폼별 가이드 메시지
  //     if (Platform.OS === "web") {
  //       setErrMsg("웹 환경에서 CORS로 차단된 것 같아요. 네이티브 앱/에뮬레이터에서 시도하거나, 서버 CORS 허용이 필요합니다.");
  //     } else {
  //       setErrMsg("네트워크 오류가 발생했어요. 연결 상태 또는 SSL 설정을 확인해 주세요.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchDbCompare = async () => {
    const params = {
      salary: yearlySalary * 10000,
    };

    console.log("[L4] ENV", { API_URL, Platform: Platform.OS, isWeb: Platform.OS === "web", params });

    setLoading(true);
    setErrMsg(null);

    try {
      console.log("[L4] >>> REQUEST(DB)", {
        url: `${API_URL}/recommend/public/compare/db`,
        params,
        headers: { Accept: "application/json" },
      });

      const resp = await axios.get<CompareResp>(
        `${API_URL}/recommend/public/compare/db`,
        {
          params,
          timeout: 8000,
          validateStatus: () => true,
          headers: {
            Accept: "application/json",
            // (이슈 있었으니) UA 제거 유지
            "User-Agent": undefined as any,
            "user-agent": undefined as any,
          },
        }
      );

      console.log("[L4] <<< RESPONSE(DB)", {
        status: resp.status,
        headers: resp.headers,
        data: resp.data,
      });

      if (resp.status >= 400) {
        const body: any = resp.data;
        setErrMsg(`[${resp.status}] ${body?.message || body?.error || "요청 실패"}`);
        return;
      }

      setData(resp.data);
    } catch (e: any) {
      console.log("[L4] !!! AXIOS ERROR(DB)", {
        code: e?.code,
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });

      setErrMsg("네트워크 오류가 발생했어요. 연결 상태 또는 SSL 설정을 확인해 주세요.");
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
    fetchDbCompare();
    return () => controllerRef.current?.abort();
  }, [investorPersonalityId, yearlySalary]);

  // 원 → 만원으로 변환해서 차트/축에 사용
  const dbGraphMan = (data?.dbCalculateGraph ?? []).map(v => Math.round(v / 10000));
  const dbFinal = pickByYear(data?.dbCalculateGraph, 10);
  const dbChartData = toLineSeries(dbGraphMan);
  const dbMaxVal = Math.max(1, niceMax(Math.max(...dbGraphMan, 0) * 1.1));

  // dc용 가짜 라인
  const dcWobbleMan = useWobble(DC_BASE_MAN, 1.8, 8);
  const dcChartData = useMemo(() => toLineSeries(dcWobbleMan), [dcWobbleMan]);
  const dcMaxVal = useMemo(() => niceMax(Math.max(...DC_BASE_MAN) * 1.2), []);

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

          {/* ===== DC 섹션 ===== */}
          <View style={[styles.section, styles.dcSection, bleedStyle]}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.pill}><Text style={styles.pillText}>DC</Text></View>
                <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
              </View>
              <Image source={require("@/assets/icon/chart2.png")} style={styles.sectionIcon} resizeMode="contain" />
            </View>

            {/* 숫자는 감춤(스샷처럼 ?? 느낌을 원하면 '—' 또는 '??만원') */}
            <Text style={[styles.bigNumber, { color: "#B1B1C7" }]}>????만원</Text>
            <Text style={[styles.smallCaption, { color: "#B1B1C7" }]}>근속년수 '10년' 기준 퇴직연금 입니다.</Text>

            <View style={[styles.chartBox, { overflow: "hidden" }]}>
              <LineChart
                isAnimated
                animateOnDataChange
                animationDuration={500}
                onDataChangeAnimationDuration={500}
                curved
                areaChart
                color={Colors.red}
                startFillColor={Colors.red}
                endFillColor={Colors.red}
                startOpacity={0.35}
                endOpacity={0.06}
                thickness={2}
                data={dcChartData}       // ← wobble 값 주입
                maxValue={dcMaxVal}
                noOfSections={4}
                hideDataPoints
                spacing={80}
                initialSpacing={40}
                endSpacing={40}
                width={300}
                yAxisTextStyle={{ color: Colors.gray, fontSize: 10, fontFamily: "BasicMedium" }}
                yAxisColor={Colors.gray}
                xAxisColor={Colors.gray}
                rulesColor={Colors.gray}
                rulesType="solid"
                backgroundColor={Colors.white}
              />

              {/* 살짝 흐림 처리 (그래프는 보이되 디테일은 가림) */}
              <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFillObject} pointerEvents="none" />

              {/* 중앙 배지: 로그인 유도 (스샷 느낌) */}
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
                style={({ pressed }) => [
                  styles.loginChip,
                  { transform: [{ scale: pressed ? 0.96 : 1 }] },  // ✅ 눌릴 때 scale 다운
                ]}
              >
                <Image
                  source={require("@/assets/char/pointAlchi.png")}
                  style={styles.alki}
                  resizeMode="contain"
                />
                <Text style={styles.loginChipText}>DC 예상 금액이 궁금하다면? </Text>
                <Text style={[styles.loginChipText, { color: Colors.primary, fontFamily: "BasicBold" }]}>로그인</Text>
              </Pressable>
 
            </View>
          </View>

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
alki: {
  width: 50,
  height: 50,
  resizeMode: "contain",
  marginBottom: 10,
},

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
  lockBadge: {
    position: "absolute",
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  lockText: {
    fontSize: 12,
    fontFamily: "BasicMedium",
    color: "#6B7280",
  },
  loginChip: {
    position: "absolute",
    alignSelf: "center",
    top: "30%",
    transform: [{ translateY: -12 }],
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    width: 240,
    height: 120,
  },
  loginChipText: {
    fontSize: 12,
    fontFamily: "BasicMedium",
    color: "#6B7280",
    marginBottom: 3,
  },  
});
