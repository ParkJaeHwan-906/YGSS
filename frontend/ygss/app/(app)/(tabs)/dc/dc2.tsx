// app/(app)/(tabs)/dc/dc2.tsx

import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Dc2() {
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

  // 미리 호출해놓기
  useEffect(() => {
    const fetchAndGo = async () => {
      try {
        const res = await axios.get(`${API_URL}/product/personal`, {
          headers: { Authorization: `A103 ${accessToken}` },
        });
        console.log("accessToken", accessToken)
        console.log(res.data)
        const productList = res.data.productList ?? [];
        const top3 = res.data.top3 ?? [];

        setTimeout(() => {
          router.replace({
            pathname: "/(app)/(tabs)/dc/dc3",
            params: {
              data: JSON.stringify({ productList, top3 })
            },
          });
        }, 2500);
      } catch (err) {
        console.error("추천상품 미리 불러오기 실패:", err);
      }
    };

    fetchAndGo();
  }, []);

  useEffect(() => {
    // 2.5초 후 다음 화면으로 자동 이동
    const timer = setTimeout(() => {
      router.replace("/(app)/(tabs)/dc/dc3");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  // ==== caption 애니메이션 ====
  const fullText = "알키가 당신에게 딱 맞는 \n 상품을 고르는 중이에요 ... !";
  const letters = fullText.split("");   // 문자열을 배열로 쪼갬
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i <= fullText.length) {
        setDisplayText(fullText.substring(0, i));
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.wrap}>
          <View style={styles.container}>
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
              <Image
                source={require("@/assets/char/winkAlchi.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </MotiView>
            <Text style={styles.caption}>{displayText}</Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.back },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  image: {
    width: 240,
    height: 240,
  },
  caption: {
    fontFamily: "BasicBold",
    fontSize: 14,
    color: Colors.black,
    textAlign: "center",
    lineHeight: 20,
  },
});
