import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, Image, Pressable, SafeAreaView, StatusBar } from "react-native";
import { Colors } from "@/src/theme/colors"

import TitleLogo from "@/assets/icon/titleLogo.svg"

export default function Landing1() {
  const router = useRouter()

  // landing2로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/landing/landing2")
    }, 3800);
    return () => clearTimeout(timer)
  }, [router])

    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
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
});