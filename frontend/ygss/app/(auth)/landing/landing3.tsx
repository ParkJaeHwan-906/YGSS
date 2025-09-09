// app/(auth)/landing/landing3.tsx

import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, Image, SafeAreaView, StatusBar } from "react-native";
import { Colors } from "@/src/theme/colors";

export default function Landing3() {
  const router = useRouter();

  useEffect(() => {
    // 2.5초 후 다음 화면으로 자동 이동
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.wrap}>
        <View style={styles.container}>
          <Image
            source={require("@/assets/icon/coinPocket.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.caption}>알키가 열심히 계산 중이에요 ...</Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.white },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  image: {
    width: 180,
    height: 180,
  },
  caption: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.black,
    textAlign: "center",
  },
});
