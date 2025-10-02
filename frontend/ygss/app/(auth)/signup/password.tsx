import ProgressBar from "@/components/login/ProgressBar";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setPassword } from "@/src/store/slices/signupSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView, Platform,
  Pressable, StyleSheet,
  Text, TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignupPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pwRef = useRef<TextInput>(null);
  const pw2Ref = useRef<TextInput>(null);

  // 비밀번호 재입력 (로컬에서 확인용)
  const [pw2, setPw2] = useState("");

  // 비밀번호 보기/숨기기 토글
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  // 리덕스 저장/불러오기
  const dispatch = useAppDispatch();
  const password = useAppSelector((s) => s.signup.password);

  // 화면 로드 후 약간의 딜레이를 두고 포커스
  useEffect(() => {
    const t = setTimeout(() => pwRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // 비밀번호 유효성 검사
  const strongPwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;

  const okPw = strongPwRegex.test(password);
  const okMatch = password.length > 0 && password === pw2;
  const canNext = okPw && okMatch;

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom, backgroundColor: "#FBFCFD" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.wrap}>
            <ProgressBar step={3} totalSteps={4} />
            <Text style={styles.title}>회원가입</Text>

            <View style={{ flex: 1, gap: 16 }}>
              {/* 비밀번호 */}
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.boxInput}>
                <TextInput
                  ref={pwRef}
                  autoFocus
                  value={password}
                  onChangeText={(text) => dispatch(setPassword(text))} // 리덕스에 즉시 저장
                  placeholder=" "
                  secureTextEntry={!show1}
                  returnKeyType="next"
                  onSubmitEditing={() => pw2Ref.current?.focus()}
                  style={styles.boxField}
                />
                <Pressable onPress={() => setShow1((s) => !s)} style={styles.iconBtn}>
                  <Ionicons name={show1 ? "eye-off-outline" : "eye-outline"} size={18} color="#8c8ca1" />
                </Pressable>
              </View>

              {/* 비밀번호 재입력 */}
              <Text style={styles.label}>비밀번호 재입력</Text>
              <View style={styles.boxInput}>
                <TextInput
                  ref={pw2Ref}
                  value={pw2}
                  onChangeText={setPw2}
                  placeholder=" "
                  secureTextEntry={!show2}
                  returnKeyType="done"
                  onSubmitEditing={() => canNext && router.push("/(auth)/signup/salary")}
                  style={styles.boxField}
                />
                <Pressable onPress={() => setShow2((s) => !s)} style={styles.iconBtn}>
                  <Ionicons name={show2 ? "eye-off-outline" : "eye-outline"} size={18} color="#8c8ca1" />
                </Pressable>
              </View>

              {/* 조건부 에러 메시지 */}
              {password.length > 0 && !okPw && (
                <View>
                  <Text style={{ color: "#c84b4b", fontSize: 12 }}>
                    비밀번호는 8자 이상이며,
                  </Text>
                  <Text style={{ color: "#c84b4b", fontSize: 12 }}>대문자/소문자/숫자/특수문자를 모두 포함해야 합니다.</Text>
                </View>

              )}

              {pw2.length > 0 && !okMatch && (
                <Text style={{ color: "#c84b4b", fontSize: 12 }}>
                  비밀번호가 일치해야 합니다.
                </Text>
              )}
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/signup/salary")}
              disabled={!canNext}
              style={({ pressed }) => [
                styles.nextBtn,
                !canNext && { opacity: 0.4 },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.nextTxt}>다음</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 30, fontFamily: "BasicBold", color: "#111", textAlign: "center", marginTop: 8, marginBottom: 50 },
  label: { fontSize: 20, fontFamily: "BasicMedium", color: "#5465FF", marginBottom: 8, marginTop: 8 },
  // 언더라인 대신 박스형 인풋 (스크린샷 3 기준)
  boxInput: {
    borderWidth: 1,
    borderColor: "#d7dafc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  boxField: { flex: 1, fontSize: 16, fontFamily: "BasicLight", color: "#111", paddingVertical: 4 },
  iconBtn: { padding: 4, marginLeft: 6 },
  nextBtn: {
    backgroundColor: "#5465FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 6,
  },
  nextTxt: { color: "#fff", fontFamily: "BasicBold", fontSize: 15 },
});
