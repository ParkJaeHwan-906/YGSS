// app/(app)/(tabs)/dc/dc4.tsx

import { ImageListData } from "@/components/organisms/ImageList";
import ItemCarousel from "@/components/organisms/ItemCarousel";
import { Colors } from "@/src/theme/colors";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ===== 타입 (landing4에서 사용한 응답 타입)
type CompareResp = {
  dbCalculate: number;          // 최종 금액(원)
  dbCalculateRate: number;
  dbCalculateGraph: number[];   // [3y,5y,7y,10y] (원)
  dcCalculate: number;
  dcCalculateRate: number;
  dcCalculateGraph: number[];   // [3y,5y,7y,10y] (원)
  recommendProductList: any[] | null;
};

// ===== 숫자 표기/변환 유틸 (만원↔원)
// '000만원'에서 '000'만 추출출
const toManWonLabel = (won: number) => {
  const man = Math.round(won / 10000);
  return man.toLocaleString("ko-KR") + " 만원";
};
// '000'을 원 단위로 변환 0000 + 0000
const toWon = (man?: string) => {
  const n = Number((man ?? "0").replace(/\D/g, ""));
  return n * 10000;
};
// 입력 포맷팅(,추가가)
const toMan = (won: number) => {
  const man = Math.round(won / 10000);
  return man.toLocaleString("ko-KR");
};

// ===== 차트 유틸
const YEAR_LABELS = ["3년", "5년", "7년", "10년"] as const;
const lcomp = (txt: string) => (
  <Text style={{ color: "lightgray", fontSize: 11, fontFamily: "BasicMedium" }}>{txt}</Text>
);
const dPoint = () => (
  <View style={{ width: 12, height: 12, backgroundColor: "#fff", borderWidth: 3, borderRadius: 6, borderColor: Colors.primary }} />
);
const toLineSeries = (arr?: number[]) => {
  const a = Array.isArray(arr) ? arr.slice(0, 4) : [];
  while (a.length < 4) a.push(0);
  return a.map((value, idx) => ({
    value,
    labelComponent: () => lcomp(YEAR_LABELS[idx]),
    customDataPoint: dPoint,
  }));
};
const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const ceilNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return ceilNorm * mag;
};

// 연도별로 금액 넣기
const YEAR_ORDER = [3, 5, 7, 10] as const; // 연차 인덱싱
const getYearIndex = (y: number) => Math.max(0, YEAR_ORDER.indexOf(y as any));
// 연도별 값 계산
const pickByYear = (arr: number[] | undefined, y: number) =>
  Array.isArray(arr) ? (arr[getYearIndex(y)] ?? 0) : 0;

// itemlistdata mapping
const mapRecommendToImageList = (list: any[]): ImageListData[] => {
  return list.map((p) => ({
    id: p.id,
    type: p.productType as "ETF" | "펀드" | "BOND",
    title: p.product,
    subTitle: p.company,
    rate: p.profitPrediction,
    logo: undefined, // 필요 시 로고 매핑
  }));
};

export default function Dc4() {
  const router = useRouter();
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const user = useSelector((state: any) => state.auth.user);
  const salary = useSelector((state: any) => state.auth.user?.salary);
  const [inputSalaryMan, setInputSalaryMan] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(3); // 피커에서 보여줄 값
  const lastQueryRef = useRef<{ risk: number; salary: number; mode: "public" | "auth" } | null>(null);
  const inFlightRef = useRef(false);
  const [isInputDirty, setIsInputDirty] = useState(true); // 입력을 건드리면 true, 비교 성공/반영 시 false

  // ===== 상태 추가 (Dc4 컴포넌트 내부)
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [cmp, setCmp] = useState<CompareResp | null>(null); // API 응답 전체 보관

  // 비교하기 버튼 클릭 스크롤
  const scrollRef = React.useRef<ScrollView>(null);
  const [dcY, setDcY] = useState(0);

  // 투자성향 ID가 리덕스에 있다면 사용
  const riskGradeId = useSelector((state: any) => state.auth.user?.riskGradeId);
  const profileSalary = useSelector((state: any) => state.auth.user?.salary) ?? 0;

  // 비교하기 버튼 클릭 시, 동작
  const handleCompare = async () => {
    // (A) 먼저 키보드 닫고 즉시 스크롤
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      if (scrollRef.current && dcY > 0) {
        scrollRef.current.scrollTo({ y: dcY, animated: true });
      }
    });

    try {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      setLoading(true);
      setErrMsg(null);

      if (!riskGradeId) {
        Alert.alert("투자성향 필요", "서비스 이용을 위해 투자성향을 먼저 검사한 후에 이용해 주세요 :)", [
          { text: "취소", style: "cancel" },
          { text: "검사하러 가기", onPress: () => router.push("/(app)/invest") },
        ]);
        return;
      }

      const inputSalary = toWon(inputSalaryMan);
      const profileSalaryWon = Number(profileSalary) || 0;
      const isWhatIf = inputSalary > 0 && inputSalary !== profileSalaryWon;

      const url = isWhatIf
        ? `${API_URL}/recommend/public/compare/dc`
        : `${API_URL}/recommend/compare/dc`;

      const salaryWon = Number(isWhatIf ? inputSalary : profileSalaryWon);
      const mode: "public" | "auth" = isWhatIf ? "public" : "auth";

      // 이전 성공 요청과 동일하면 재호출 금지 (연도 변경은 로컬 인덱싱으로 이미 반영됨)
      const prev = lastQueryRef.current;
      if (prev && prev.risk === Number(riskGradeId) && prev.salary === salaryWon && prev.mode === mode && cmp) {
        console.log("[DC4] skip fetch: same query; use cached cmp & selectedYear");
        setIsInputDirty(false); // 입력 그대로면 버튼 비활성화 유지
        return;
      }

      const headers: any = mode === "auth" ? { Authorization: `A103 ${accessToken}` } : undefined;
      const params = { investorPersonalityId: Number(riskGradeId), salary: salaryWon };

      console.log("[DC4] >>> REQUEST", { url, params, headers });

      const resp = await axios.get<CompareResp>(url, {
        headers,
        params,
        validateStatus: () => true,
      });

      console.log("[DC4] <<< RESPONSE", { status: resp.status, data: resp.data });

      if (resp.status >= 400) {
        setErrMsg(
          `[${resp.status}] ${(resp.data as any)?.message || (resp.data as any)?.error || "요청 실패"}`
        );
        return;
      }

      // 성공: 결과 저장 + 쿼리 스냅샷 갱신 + 버튼 비활성화
      setCmp(resp.data);
      lastQueryRef.current = { risk: Number(riskGradeId), salary: salaryWon, mode };
      setIsInputDirty(false);
    } catch (e: any) {
      console.log("[DC4] !!! AXIOS ERROR", {
        message: e?.message,
        code: e?.code,
        status: e?.response?.status,
        data: e?.response?.data,
      });
      setErrMsg("예상 수익 데이터를 불러오지 못했어요.");
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  // 연도별 금액
  const dcValue = React.useMemo(
    () => pickByYear(cmp?.dcCalculateGraph, selectedYear),
    [cmp?.dcCalculateGraph, selectedYear]
  );
  const dbValue = React.useMemo(
    () => pickByYear(cmp?.dbCalculateGraph, selectedYear),
    [cmp?.dbCalculateGraph, selectedYear]
  );


  // 로그인 가드
  useEffect(() => {
    if (!accessToken) {
      Alert.alert("로그인이 필요해요", "로그인 후 이용해 주세요.");
      router.replace("/(auth)/login");
    }
  }, [accessToken, router]);

  useEffect(() => {
    console.log("[dc4] redux snapshot", {
      riskGradeId,
      typeofRiskGradeId: typeof riskGradeId,
      user,
    });
  }, [riskGradeId]);

  // 리다이렉트 직전 표시
  if (!accessToken) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={[styles.safeArea, { backgroundColor: Colors?.back ?? "#F4F6FF", alignItems: "center", justifyContent: "center" }]}
      >
        <StatusBar barStyle="dark-content" backgroundColor={Colors?.back ?? "#F4F6FF"} />
        <Text style={{ fontSize: 16, color: "#666" }}>로그인 페이지로 이동 중…</Text>
      </SafeAreaView>
    );
  }

  // 마운트 시, redux 값으로 초기화
  useEffect(() => {
    if (salary) {
      setInputSalaryMan(toMan(salary));
    }
  }, [salary]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: Colors?.back ?? "#F4F6FF" }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors?.back ?? "#F4F6FF"} />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* ===== 헤더 영역 ===== */}
        <View style={styles.headerRow}>
          {/* 로고: 컨테이너 좌우 패딩(20)을 상쇄해 왼쪽에 딱 붙임 */}
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/icon/titleLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* 타이틀 */}
          <View style={styles.titleBlock}>
            {/* 1줄: 배지 + '년 후,' */}
            <View style={styles.inlineRow}>
              <View style={styles.badgeWrap}>
                {Platform.OS === "android" ? (
                  <>
                    {/* 보이는 큰 숫자 */}
                    <Text style={styles.displayedYear}>{selectedYear}</Text>

                    {/* 터치/선택은 이 투명 Picker가 담당 */}
                    <Picker
                      selectedValue={selectedYear}
                      onValueChange={(v) => setSelectedYear(v)}
                      mode="dropdown"
                      dropdownIconColor="transparent"
                      style={styles.androidPickerOverlay}
                    >
                      <Picker.Item label="3" value={3} />
                      <Picker.Item label="5" value={5} />
                      <Picker.Item label="7" value={7} />
                      <Picker.Item label="10" value={10} />
                    </Picker>
                  </>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      ActionSheetIOS.showActionSheetWithOptions(
                        {
                          options: ["취소", "3", "5", "7", "10"],
                          cancelButtonIndex: 0,
                          userInterfaceStyle: "light",
                        },
                        (i) => {
                          const map = [null, 3, 5, 7, 10] as const;
                          if (i > 0) setSelectedYear(map[i]!);
                        }
                      )
                    }
                  >
                    <Text style={styles.displayedYear}>{selectedYear}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.headerTitle1}>년 후,</Text>
            </View>
            {/* 2줄: '나의 퇴직연금은?' */}
            <Text style={[styles.headerTitle2, { color: Colors.primary }]}>"{user?.riskGrade}"</Text>
            <Text style={styles.headerTitle2}>나의 퇴직연금은?</Text>
          </View>

          {/* 마스코트 */}
          <Image
            source={require("@/assets/char/basicAlchi.png")}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        {/* ===== 금액 입력 + 비교하기 버튼 ===== */}
        <View style={styles.moneyRow}>
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -15 }}
            transition={{
              type: "timing",
              duration: 800,
              loop: true,
              repeatReverse: true,
            }}
          >
            <Image source={require("@/assets/icon/bills.png")} style={styles.moneyImg} resizeMode="contain" />
          </MotiView>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={inputSalaryMan}
              onChangeText={(v) => {
                const onlyDigits = v.replace(/\D/g, "");
                setInputSalaryMan(onlyDigits.replace(/^0+(?=\d)/, ""));
                setIsInputDirty(true);
              }}
            />
            <Text style={styles.inputSuffix}>만원</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.primaryBtn, (loading || (!isInputDirty && !!cmp)) && { opacity: 0.7 }]}
          onPress={handleCompare}
          disabled={loading || (!isInputDirty && !!cmp)} // ← 비교 완료 상태에선 비활성화, 입력 변경 시 활성화
        >
          <Text style={styles.primaryBtnText}>
            비교하기
          </Text>
        </TouchableOpacity>

        {/* ↓ 스크롤 힌트 */}
        <Text style={styles.scrollHint}>⌄</Text>

        {/* ===== DC 섹션 ===== */}
        <View style={[styles.section]} onLayout={(e) => setDcY(e.nativeEvent.layout.y)}>
          <View style={styles.sectionHeader}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>DC</Text>
            </View>
            <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
            <Image source={require("@/assets/icon/chart2.png")} style={styles.sectionIcon} resizeMode="contain" />
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : errMsg ? (
            <>
              <Text style={{ color: "#CC3B3B", fontFamily: "BasicMedium" }}>{errMsg}</Text>
              <TouchableOpacity onPress={handleCompare} style={{ paddingVertical: 6 }}>
                <Text style={{ color: Colors.primary, fontFamily: "BasicMedium" }}>다시 시도</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.bigNumber}>{toManWonLabel(dcValue)}</Text>
              <Text style={styles.smallCaption}>근속년수 '{selectedYear}년' 기준 퇴직연금이에요.</Text>

              <View style={[styles.chartBox, { overflow: "hidden", alignSelf: "center" }]}>
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
                  data={toLineSeries(cmp?.dcCalculateGraph)}
                  maxValue={niceMax(Math.max(...(cmp?.dcCalculateGraph ?? [0])) * 1.1)}
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
              </View>
            </>
          )}
        </View>

        {/* ===== DB 섹션 ===== */}
        <View style={[styles.section]}>
          <View style={styles.sectionHeader}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>DB</Text>
            </View>
            <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
            <Image source={require("@/assets/icon/chart2.png")} style={styles.sectionIcon} resizeMode="contain" />
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : errMsg ? (
            <>
              <Text style={{ color: "#CC3B3B", fontFamily: "BasicMedium" }}>{errMsg}</Text>
              <TouchableOpacity onPress={handleCompare} style={{ paddingVertical: 6 }}>
                <Text style={{ color: Colors.primary, fontFamily: "BasicMedium" }}>다시 시도</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.bigNumber}>{toManWonLabel(dbValue)}</Text>
              <Text style={styles.smallCaption}>근속년수 '{selectedYear}년' 기준 퇴직연금이에요.</Text>

              <View style={[styles.chartBox, { overflow: "hidden", alignSelf: "center" }]}>
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
                  data={toLineSeries(cmp?.dbCalculateGraph)}
                  maxValue={niceMax(Math.max(...(cmp?.dbCalculateGraph ?? [0])) * 1.1)}
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
              </View>
            </>
          )}
        </View>

        {/* ===== IRP 깨우기 CTA ===== */}
        <View style={styles.irpCard}>
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -15 }}
            transition={{
              type: "timing",
              duration: 800,
              loop: true,
              repeatReverse: true,
            }}
          >
            <Image source={require("@/assets/char/dreamAlchi.png")} style={styles.irpImg} resizeMode="contain" />
          </MotiView>
          <Text style={styles.irpTextLine1}>잠 자고 있는 IRP 계좌도</Text>
          <Text style={styles.irpTextLine2}>깨우러 가볼까요?</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.secondaryBtn}
            onPress={() => router.push("/irp/irp1")}
          >
            <Text style={styles.secondaryBtnText}>깨우러 가기</Text>
          </TouchableOpacity>
        </View>

        {/* ===== 추천 상품 캐러셀 ===== */}

        {/* 탭바 여백 */}
        {cmp?.recommendProductList && cmp.recommendProductList.length > 0 && (
          <View style={{ backgroundColor: Colors.white, paddingVertical: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "BasicBold",
                marginTop: 10,
                marginLeft: 20,
                color: "#2E2E3A",
              }}
            >
              이런 상품은 어떠세요?
            </Text>
            <ItemCarousel items={mapRecommendToImageList(cmp.recommendProductList)} />
          </View>
        )}
        <View style={{ height: Platform.select({ ios: 28, android: 20 }) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: 40 },

  // 헤더
  headerRow: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 50,
    position: "relative",
  },

  // 로고는 화면 좌측에 딱 붙도록 패딩 상쇄
  logoWrap: {
    marginLeft: -60,
    marginBottom: 6,
  },
  logo: {
    height: 60,
    aspectRatio: 4,
  },

  // 타이틀 블록
  titleBlock: {
    alignSelf: "flex-start",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  badgeWrap: {
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    marginRight: 8,
    height: 44,
    minWidth: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  displayedYear: {
    fontSize: 22,
    lineHeight: 26,         // 안드로이드에서 베이스라인 잘림 방지
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#111",
    textAlign: "center",
  },
  androidPickerOverlay: {
    ...StyleSheet.absoluteFillObject, // 전체 덮어서 터치 잡기
    opacity: 0,                        // 보이지 않게
  },
  picker: {
    width: 80,
    height: 40,
    color: Colors?.black ?? "#111",
    fontSize: 18,
    fontFamily: "BasicBold",
    textAlign: "center",
  },
  headerTitle1: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#111",
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  headerTitle2: {
    marginTop: 4,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#111",
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },

  mascot: {
    position: "absolute",
    right: -16,
    top: -8,
    width: 180,
    height: 180,
  },

  // 금액 영역
  moneyRow: { marginTop: 8, alignItems: "center" },
  moneyImg: { width: 150, height: 150 },

  inputRow: {
    marginTop: 40,
    marginBottom: 10,
    width: 300,
    alignSelf: "center",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  input: { flex: 1, fontSize: 18, fontFamily: "BasicMedium", color: "#2E2E3A" },
  inputSuffix: { marginLeft: 8, fontSize: 16, fontFamily: "BasicBold", color: "#73738C" },

  primaryBtn: {
    width: 300,
    alignSelf: "center",
    marginTop: 6,
    backgroundColor: Colors?.primary ?? "#4D6BFE",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 18, fontFamily: "BasicMedium", letterSpacing: 0.2 },

  scrollHint: { alignSelf: "center", marginVertical: 12, fontSize: 18, color: "#8A8AA3" },

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
    // justifyContent: "flex-start",
    // position: "relative",
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
    // position: "absolute",
    // right: 60,
    // top: "50%",
    // transform: [{ translateY: -12 }],
    marginLeft: "auto",
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

  // IRP 카드
  irpCard: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  irpImg: { width: 240, height: 240, marginBottom: 8 },
  irpTextLine1: { fontSize: 14, fontFamily: "BasicMedium", color: "#4A4A5C" },
  irpTextLine2: { marginTop: 2, fontSize: 16, fontFamily: "BasicBold", color: "#2E2E3A", marginBottom: 10 },
  secondaryBtn: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: Colors?.primary ?? "#4D6BFE",
  },
  secondaryBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "BasicMedium" },
});
