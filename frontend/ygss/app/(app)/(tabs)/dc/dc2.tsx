// app/(app)/(tabs)/dc/dc2.tsx

import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "@/src/theme/colors";
import { MotiView } from "moti";

export default function Dc2() {
  const router = useRouter();

  useEffect(() => {
    // 2.5초 후 다음 화면으로 자동 이동
    const timer = setTimeout(() => {
      router.replace("/(app)/(tabs)/dc/dc3");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

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
            <Text style={styles.caption}>알키가 당신에게 딱 맞는 상품을 고르는 중이에요 ...</Text>
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
    fontSize: 16,
    fontWeight: "900",
    color: Colors.black,
    textAlign: "center",
  },
});
