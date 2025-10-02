// app/(auth)/landing/landing3.tsx

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
import { useLocalSearchParams } from "expo-router";

export default function Landing3() {
  const router = useRouter();
  const { salary, pid } = useLocalSearchParams<{ salary?: string; pid?: string }>();

  useEffect(() => {
    if (!salary || isNaN(parseInt(String(salary), 10))) {
      router.replace("/(auth)/landing/landing2");
      return;
    }

    const t = setTimeout(() => {
      // ✅ 파라미터 *그대로* 전달
      router.replace({
        pathname: "/(auth)/landing/landing4",
        params: { salary: String(salary), pid: String(pid ?? "1") },
      });
    }, 800); // 스피너 살짝 보이게

    return () => clearTimeout(t);
  }, [router, salary, pid]);

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
              source={require("@/assets/icon/coinPocket.png")}
              style={styles.image}
              resizeMode="contain"
            />
            </MotiView>
            <Text style={styles.caption}>알키가 열심히 계산 중이에요 ...</Text>
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
    gap: 16,
  },
  image: {
    width: 180,
    height: 180,
  },
  caption: {
    fontSize: 16,
    fontFamily: "BasicMedium",
    color: Colors.black,
    textAlign: "center",
  },
});
