// app/(app)/(tabs)/irp/irp2.tsx

import { Colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Text, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Stack } from "expo-router";

export default function IrpLoading() {
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            router.push("/irp/irp3");
        }, 2500);
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
                source={require("@/assets/char/nuetralAlchi.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </MotiView>
            <Text style={styles.caption}>알키가 당신에게 딱 맞는 상품을{"\n"}고르는 중이에요 ...</Text>
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
    fontSize: 12,
    color: Colors.black,
    textAlign: "center",
  },
});