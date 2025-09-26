// app/(auth)/landing/landing2.tsx

import SkipImageButton from "@/components/molecules/skipButton";
import { Colors } from "@/src/theme/colors";
import { Link, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Landing2() {
  const [salary, setSalary] = useState<string>("");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onSubmit = () => {
    const clean = salary.replace(/[^\d]/g, "");
    if (!clean) {
      Alert.alert("연봉을 입력해주세요");
      return;
    }
    // 다음 화면으로 넘길 때 쿼리로 전달 (원하면 전역 상태/스토어로 교체 가능)
    router.push({
      pathname: "/(auth)/landing/landing3",
      params: { salary: clean, pid: "1" }, // pid 기본 1이면 생략 가능
    });
  };

  useEffect(() => {
    const backAction = () => {
      // 하드웨어 뒤로가기 눌렀을 때 Landing1로 이동
      router.push({
        pathname: "/(auth)/landing/landing1",
        params: { fromBack: "true" },
      });
      return true; // 기본 동작(앱 종료 등) 막음
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={[styles.wrap, { paddingTop: insets.top }]}>
        {/* 상단 SKIP */}
        <View style={[styles.topBar, { paddingTop: 8, paddingRight: 16 }]}>
          <Link href="/(auth)/login" asChild>
            <SkipImageButton />
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
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <TextInput
                  value={salary}
                  onChangeText={(t) => setSalary(t.replace(/[^\d]/g, ""))}
                  keyboardType="number-pad"
                  placeholder="연봉 입력"
                  placeholderTextColor="#B8B8B8"
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                  accessibilityLabel="연봉 입력"
                />
                <Text style={styles.inputSuffix}>만원</Text>
              </View>
            </View>

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
  topBar: {
    width: "100%",
    alignItems: "flex-end",
  },
  skip: {
    fontSize: 16,
    fontFamily: "BasicMedium",
    color: Colors.primary,
    marginRight: 16,
  },
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 20 },

  headlineBox: { marginTop: 8, marginBottom: 8, position: "relative", alignSelf: "stretch" },
  headline: { fontSize: 28, lineHeight: 36, fontFamily: "BasicBold", color: Colors.black },

  coinImg: { position: "absolute", right: 6, top: -6, width: 70, height: 70 },

  inputRow: {
    alignSelf: "stretch",
    marginTop: 16,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.base,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  input: {
    flex: 1, // ✅ 입력창이 왼쪽에서 최대 채우기
    fontFamily: "BasicMedium",
    fontSize: 18,
    color: Colors.black,
    padding: 0, // iOS 기본 padding 제거
  },
  inputSuffix: {
    marginLeft: 6,
    fontSize: 16,
    fontFamily: "BasicMedium",
    color: Colors.black,
  },

  primaryBtn: {
    marginTop: 4,
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
  primaryText: { color: Colors.white, fontSize: 18, fontFamily: "BasicMedium" },

  mascotBox: { width: "100%", alignItems: "center", marginTop: 24, overflow: "visible" },
  mascotImg: { width: "60%", height: 200 },

  caption: { textAlign: "center", marginTop: 2, fontSize: 14, fontFamily: "BasicMedium", color: Colors.black },
});
