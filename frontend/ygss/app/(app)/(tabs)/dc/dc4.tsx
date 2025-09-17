// app/(app)/(tabs)/dc/dc4.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
  } from "react-native";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";

// 간단한 빈 차트 박스(Placeholders)
function ChartBox() {
  return (
    <View style={styles.chartBox}>
      <Text style={styles.chartPlaceholder}>차트 영역</Text>
    </View>
  );
}

export default function Dc4() {
  const router = useRouter();
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const [year, setYear] = useState<number>(3);

  // 로그인 가드
  useEffect(() => {
    if (!accessToken) {
      Alert.alert("로그인이 필요해요", "로그인 후 이용해 주세요.");
      router.replace("/(auth)/login");
    }
  }, [accessToken, router]);

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


  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: Colors?.back ?? "#F4F6FF" }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors?.back ?? "#F4F6FF"} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
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
                <Picker
                  selectedValue={year}
                  onValueChange={(v) => setYear(v)}
                  dropdownIconColor= "#fff"
                  style={styles.picker}
                >
                  <Picker.Item label="3" value={3} />
                  <Picker.Item label="5" value={5} />
                  <Picker.Item label="7" value={7} />
                  <Picker.Item label="10" value={10} />
                </Picker>
              </View>
              <Text style={styles.headerTitle1}>년 후,</Text>
            </View>
            {/* 2줄: '나의 퇴직연금은?' */}
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
              placeholder="5500"
              placeholderTextColor="#B7B7C2"
            />
            <Text style={styles.inputSuffix}>만원</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>비교하기</Text>
        </TouchableOpacity>

        {/* ↓ 스크롤 힌트 */}
        <Text style={styles.scrollHint}>⌄</Text>

        {/* ===== DC 섹션 ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>DC</Text>
            </View>
            <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
            <Image source={require("@/assets/icon/chart.png")} style={styles.sectionIcon} />
          </View>

          <Text style={styles.bigNumber}>999 만원</Text>
          <Text style={styles.smallCaption}>10년 기준 평균치를 계산한 값이에요</Text>

          <ChartBox />
        </View>

        {/* ===== DB 섹션 ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>DB</Text>
            </View>
            <Text style={styles.sectionTitle}>를 선택했을 때,</Text>
            <Image source={require("@/assets/icon/chart.png")} style={styles.sectionIcon} />
          </View>

          <Text style={styles.bigNumber}>3,456 만원</Text>
          <Text style={styles.smallCaption}>10년 기준 평균치를 계산한 값이에요</Text>

          <ChartBox />
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

            <TouchableOpacity activeOpacity={0.9} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>깨우러 가기</Text>
            </TouchableOpacity>
        </View>

        {/* 탭바 여백 */}
        <View style={{ height: Platform.select({ ios: 28, android: 20 }) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 40 },

  // 헤더
  headerRow: {
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginRight: 8,
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
  },
  headerTitle2: {
    marginTop: 4,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#111",
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 18, fontFamily: "BasicMedium", letterSpacing: 0.2 },

  scrollHint: { alignSelf: "center", marginVertical: 12, fontSize: 18, color: "#8A8AA3" },

  // 섹션 공통
  section: { marginTop: 30, marginBottom: 20, },
  sectionHeader: { width: "100%", flexDirection: "row", alignItems: "center", marginBottom: 10 },
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

  // 차트 박스(placeholder)
  chartBox: {
    height: 180,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E9E9F2",
    alignItems: "center",
    justifyContent: "center",
  },
  chartPlaceholder: { fontSize: 14, color: "#B1B1C7" },

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
