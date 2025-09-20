import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setUser } from "@/src/store/slices/authSlice";
import { Colors } from "@/src/theme/colors";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// 캐릭터 매핑 (파일명 확인: "nuetralAlchi.png" 철자 실제 자산명과 일치해야 함)
const ALCHI_BY_GRADE: Record<string, any> = {
  "공격투자형": require("@/assets/char/verydangerAlchi.png"),
  "적극투자형": require("@/assets/char/dangerAlchi.png"),
  "위험중립형": require("@/assets/char/nuetralAlchi.png"),
  "안정추구형": require("@/assets/char/verysafeAlchi.png"),
  "안정형": require("@/assets/char/safeAlchi.png"),
};

function pickAlchiByGrade(grade?: string | null) {
  if (!grade) return require("@/assets/char/winkAlchi.png");
  const key = grade.trim();
  return ALCHI_BY_GRADE[key] ?? require("@/assets/char/winkAlchi.png");
}

export default function InvestResult() {
  const router = useRouter();
  const { grade } = useLocalSearchParams<{ grade?: string }>();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  // 🔹 페이지 진입 시 유저 정보 다시 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/load/detail`, {
          headers: { Authorization: `A103 ${accessToken}` },
        });
        dispatch(setUser(data));
      } catch (err) {
        console.error("유저 정보 갱신 실패", err);
      }
    };

    if (accessToken) {
      fetchUser();
    }
  }, [accessToken, dispatch]);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[styles.safe, { backgroundColor: Colors?.back ?? "#FFFFFF" }]}
      >
        {/* 상단 로고 */}
        <Image
          source={require("@/assets/icon/titleLogo.png")}
          style={styles.titleLogo}
          resizeMode="contain"
        />

        <View style={styles.container}>
          {/* 캐릭터 애니메이션 */}
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -15 }}
            transition={{ type: "timing", duration: 800, loop: true, repeatReverse: true }}
          >
            <Image
              source={pickAlchiByGrade(grade)}
              style={styles.hero}
              resizeMode="contain"
            />
          </MotiView>

          {/* 결과 헤드라인 */}
          <Text style={styles.headline}>투자 성향 분석 결과</Text>

          {/* 결과 배지 */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{grade ?? "분석 실패"}</Text>
          </View>

          {/* 서브 카피 */}
          <Text style={styles.subcopy}>
            당신의 투자 성향을 바탕으로 {"\n"} 맞춤 전략을 추천해 드릴게요.
          </Text>

          {/* 액션 */}
          <View style={{ gap: 10, marginTop: 12 }}>
            <Pressable
              onPress={() => router.push("/(app)/(tabs)/dc/dc3")}
              style={({ pressed }) => [styles.btnGhost, pressed ? { opacity: 0.9 } : null]}
            >
              <Text style={styles.btnGhostText}>나에게 꼭 맞는 투자 전략은?</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/(app)/invest")}
              style={({ pressed }) => [styles.btnPrimary, pressed ? { opacity: 0.9 } : null]}
            >
              <Text style={styles.btnPrimaryText}>다시 테스트하기</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  titleLogo: {
    width: 140,
    height: 60,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  hero: { width: 200, height: 200, marginBottom: 8 },
  headline: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#121212",
    textAlign: "center",
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors?.primary ?? "#4666FF",
    shadowColor: Colors?.primary ?? "#4666FF",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: "BasicBold",
    fontSize: 16,
  },
  subcopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "BasicMedium",
    color: Colors?.gray ?? "#8A8AA3",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  btnPrimary: {
    marginTop: 8,
    width: 300,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors?.white ?? "#4666FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors?.primary ?? "#4666FF",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  btnPrimaryText: {
    color: Colors?.black ?? "#121212",
    fontFamily: "BasicBold",
    fontSize: 16,
  },
  btnGhost: {
    marginTop: 4,
    width: 300,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors?.primary ?? "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors?.primary ?? "#4666FF",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  btnGhostText: {
    color: Colors?.white ?? "#4666FF",
    fontFamily: "BasicBold",
    fontSize: 15,
  },
});
