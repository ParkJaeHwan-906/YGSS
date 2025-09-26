import { Colors } from "@/src/theme/colors";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Image, SafeAreaView, StatusBar, StyleSheet, Text, View
} from "react-native";


export default function Landing1() {
  const router = useRouter()

  // landing2로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/landing/landing2")
    }, 3800);
    return () => clearTimeout(timer)
  }, [router])

  const { fromBack } = useLocalSearchParams<{ fromBack?: string }>();

  useEffect(() => {
    // 뒤로가기로 들어온 경우에만 3초 뒤 landing2로
    if (fromBack === "true") {
      const timer = setTimeout(() => {
        router.replace("/(auth)/landing/landing2");
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // 앱 첫 진입일 땐 바로 landing2
      router.replace("/(auth)/landing/landing2");
    }
  }, [fromBack, router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: fromBack === "true" ? "slide_from_left" : "slide_from_right" }} />
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.wrap}>
        <View style={styles.container}>
          {/* 로고/타이포 이미지로 교체 가능 */}
          <Image
            source={require("@/assets/icon/titleLogo.png")}
            style={{ width: 300 }}
            resizeMode="contain"
          />


          {/* 캐릭터/아이콘은 네 에셋로 교체 */}
          <Image
            source={require("@/assets/char/moveAlchi.gif")}
            style={{ width: "100%", height: 360 }}
            resizeMode="contain"
          />
          {fromBack === "true" && (
            <View style={styles.captionBox}>
              <Text style={styles.caption}>돌아온 당신,,,😗{"\n"}알키가 귀여우셨군요 ^_^</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, padding: 24 },
  brand: { fontSize: 42, fontWeight: "900", color: Colors.primary, letterSpacing: 1 },
  hero: { width: "100%", height: 420 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  primaryText: { color: Colors.white, fontSize: 16, fontWeight: "800" },
  caption: {
    fontSize: 14,
    fontFamily: "BasicMedium",
    color: Colors.black,
    textAlign: "center",
    marginTop: 8,
  },
  captionBox: {
    width: "90%",
    backgroundColor: Colors.base,
    alignItems: "center",
    marginBottom: 40,
    borderRadius: 16,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4,
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
});