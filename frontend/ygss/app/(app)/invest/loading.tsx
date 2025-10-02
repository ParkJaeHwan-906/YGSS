import { useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/theme/colors";
import { MotiView } from "moti";
import { useSelector } from "react-redux";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ResultResp = {
  success: boolean;
  investorRiskGrade: string;
};

export default function InvestLoading() {
  const router = useRouter();
  const { score } = useLocalSearchParams<{ score?: string }>();
  const accessToken = useSelector((s: any) => s?.auth?.accessToken);

  useEffect(() => {
    (async () => {
      if (!score) {
        router.replace("/(app)/invest/test");
        return;
      }
      if (!accessToken) {
        Alert.alert("로그인이 필요해요", "다시 로그인 후 시도해 주세요.");
        router.replace("/(auth)/login");
        return;
      }

      try {
        const parsed = Number(score);
        if (!Number.isFinite(parsed)) {
          Alert.alert("점수 오류", "유효하지 않은 점수입니다.");
          router.back();
          return;
        }

        // 🔁 API 호출 (PATCH)
        const { data } = await axios.patch<ResultResp>(
          `${API_URL}/investor/personality/result`,
          { score: parsed },
          { headers: { Authorization: `A103 ${accessToken}` } }
        );

        if (!data?.success) throw new Error("분석 실패");

        // ✅ grade만 넘겨서 결과 페이지가 렌더만 하도록
        setTimeout(() => {
          router.replace({
            pathname: "/(app)/invest/result",
            params: { grade: data.investorRiskGrade },
          });
        }, 3000);
      } catch (e) {
        console.error(e);
        Alert.alert("오류", "결과를 불러오지 못했어요.");
        router.back();
      }
    })();
  }, [router, score, accessToken]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={[styles.wrap, { backgroundColor: Colors?.back ?? "#F4F6FF" }]}>
          <View style={styles.container}>
            <MotiView
              from={{ translateY: 0 }}
              animate={{ translateY: -15 }}
              transition={{ type: "timing", duration: 800, loop: true, repeatReverse: true }}
            >
              <Image
                source={require("@/assets/char/winkAlchi.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </MotiView>
            <Text style={styles.caption}>알키가 당신의 투자 성향을 분석 중이에요!</Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  image: { width: 240, height: 240 },
  caption: {
    fontFamily: "BasicBold",
    fontSize: 12,
    color: Colors?.black ?? "#141416",
    textAlign: "center",
  },
});
