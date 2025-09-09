// app/(auth)/landing/landing4.tsx

import { Stack, useRouter } from "expo-router";
import {
    SafeAreaView,
    StatusBar,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { MotiView } from "moti";
import { Colors } from "@/src/theme/colors";

export default function Landing4() {
  const router = useRouter();

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
            {/* 알키 이미지: 위아래 둥둥 */}
            <MotiView
                from={{ translateY: 0 }}
                animate={{ translateY: -18 }}
                transition={{ type: "timing", duration: 600, loop: true, repeatReverse: true }}
            >
                <Image
                // ⬇️ 프로젝트에 맞게 경로만 수정하세요
                source={require("@/assets/char/pointAlchi.png")}
                style={styles.alki}
                resizeMode="contain"
                />
            </MotiView>

            <View>
                <Text style={styles.caption}>어떤 상품을 선택하면 좋은지 {"\n"} 알키가 더 자세히 알려드릴게요!</Text>
            </View>
            {/* CTA 버튼 */}
            <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.8} onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.ctaText}>더 많은 정보 확인하기</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>연금술사</Text>
                <Text style={styles.footerText}>
                    연금술사에서 제공하는 투자 정보는 고객의 투자 판단을 위한 {"\n"}
                    단순 참고용일뿐, 투자 제안 및 권유, 종목 추천을 위해 작성된 {"\n"}
                    것이 아닙니다.
                </Text>
            </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.white },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 28,
  },
  caption: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    textAlign: "center",
  },
  alki: {
    width: 260,
    height: 260,
  },
  ctaBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.primary, // 버튼 색상 (원하면 Colors로 교체)
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ctaText: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  footer: {
    position: "absolute",
    bottom: 20,        // 하단에서 띄우고 싶은 거리
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
    textAlign: "left",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#999999", // 연한 회색
    lineHeight: 18,
    textAlign: "left",
  },  
});
