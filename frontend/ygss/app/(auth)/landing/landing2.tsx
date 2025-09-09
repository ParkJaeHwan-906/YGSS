// app/(auth)/landing/landing2.tsx

import { useState } from "react";
import { Stack, Link, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Colors } from "@/src/theme/colors";

export default function Landing2() {
  const [salary, setSalary] = useState<string>("");
  const router = useRouter();

  const onSubmit = () => {
    const clean = salary.replace(/[^\d]/g, "");
    if (!clean) {
      Alert.alert("연봉을 입력해주세요");
      return;
    }
    // 다음 화면으로 넘길 때 쿼리로 전달 (원하면 전역 상태/스토어로 교체 가능)
    router.push("/(auth)/landing/landing3");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.wrap}>
        {/* 상단 SKIP */}
        <View style={styles.topBar}>
          <Link href="/(auth)/login" asChild>
            <Pressable hitSlop={10}>
              <Text style={styles.skip}>SKIP &gt;&gt;</Text>
            </Pressable>
          </Link>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            {/* 헤드라인 + 코인 이모지(이미지 있으면 교체) */}
            <View style={styles.headlineBox}>
              <Text style={styles.headline}>퇴직할 때,{"\n"}얼마 받을 수 있을까?</Text>
              <Image
                source={require("@/assets/icon/coins.png")}
                style={styles.coinImg}
                resizeMode="contain"
              />
            </View>

            {/* 입력 */}
            <TextInput
              value={salary}
              onChangeText={(t) => setSalary(t.replace(/[^\d,]/g, ""))}
              keyboardType="number-pad"
              placeholder="연봉 입력"
              placeholderTextColor="#B8B8B8"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              accessibilityLabel="연봉 입력"
            />

            {/* 버튼 */}
            <Pressable style={styles.primaryBtn} onPress={onSubmit} accessibilityRole="button">
              <Text style={styles.primaryText}>금액 확인하기</Text>
            </Pressable>

            {/* 마스코트 */}
            <View style={styles.mascotBox}>
                <Image
                    source={require("@/assets/char/winkAlchi.png")}
                    style={styles.mascotImg}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.caption}>알키와 함께 알아 보러가요!</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
    wrap: { flex: 1, backgroundColor: Colors.white },
    container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 20 },
  
    headlineBox: { marginTop: 8, marginBottom: 8, position: "relative", alignSelf: "stretch" },
    headline: { fontSize: 28, lineHeight: 36, fontWeight: "900", color: Colors.black },
  
    coinImg: { position: "absolute", right: 6, top: -6, width: 70, height: 70 },
  
    input: {
      marginTop: 16,
      backgroundColor: Colors.base,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 18,
      color: Colors.black,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
      alignSelf: "stretch",
    },
  
    primaryBtn: {
      marginTop: 14,
      backgroundColor: Colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "stretch",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    primaryText: { color: Colors.white, fontSize: 18, fontWeight: "800" },
  
    mascotBox: { width: "100%", alignItems: "center", marginTop: 24, overflow: "visible" },
    mascotImg: { width: "60%", height: 200 },
  
    caption: { textAlign: "center", marginTop: 2, fontSize: 14, fontWeight: "900", color: Colors.black },
  });
