// app/(app)/invest/index.tsx

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/src/theme/colors";

export default function InvestTestStart() {
  const router = useRouter();

  // 👻 둥둥 애니메이션
  const floatY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -10,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatY]);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[styles.safe, { backgroundColor: Colors?.back ?? "#EEF2FF" }]}
      >
        <View style={styles.container}>
          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <Image
              source={require("@/assets/char/winkAlchi.png")}
              style={styles.hero}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={styles.title}>투자 성향 테스트</Text>

          <View style={styles.captionWrap}>
            <Text style={styles.caption}>🔮 퇴직연금의 마법, 어떻게 써야 할까?</Text>
            <Text style={styles.caption}>
              ✨ 아는 것이 힘! 먼저 내 투자 성향을 알아야 주문이 제대로 걸려요!
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/invest/test")}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={styles.ctaText}>나는 어떤 투자 성향일까?</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    // paddingTop: 8,  // ✅ 필요 없으면 제거
    alignItems: "center",
    justifyContent: "center", // ✅ 핵심: 중앙 정렬
    gap: 12,
  },
  hero: {
    width: 240,
    height: 240,
    // marginTop: 8,   // ✅ gap으로 간격 관리
  },
  title: {
    // marginTop: 12,  // ✅ gap으로 대체
    fontSize: 30,
    lineHeight: 38,
    fontFamily: "BasicBold",
    color: Colors?.black ?? "#121212",
    textAlign: "center",
  },
  captionWrap: {
    marginTop: 12,
    marginBottom: 12,
    gap: 10,
    paddingHorizontal: 8,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "BasicMedium",
    color: Colors?.gray ?? "#8A8AA3",
    textAlign: "center",
  },
  cta: {
    marginTop: 8, // 살짝만
    width: "80%",
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors?.primary ?? "#4666FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors?.primary ?? "#4666FF",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  ctaText: {
    fontFamily: "BasicBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});