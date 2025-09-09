import ProgressBar from "@/components/login/ProgressBar";
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

export default function SignupEmail() {
    const router = useRouter();
    const ref = useRef<TextInput>(null);
    const [email, setEmail] = useState("");
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const t = setTimeout(() => ref.current?.focus(), 60);
        return () => clearTimeout(t);
    }, []);

    // 이메일 유효성 검사용
    const canNext = /\S+@\S+\.\S+/.test(email.trim());

    return (
        <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.wrap}>
                        <ProgressBar step={2} totalSteps={4} />
                        <Text style={styles.title}>회원가입</Text>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>이메일</Text>
                            <TextInput
                                ref={ref}
                                autoFocus
                                value={email}
                                onChangeText={setEmail}
                                placeholder=" "
                                placeholderTextColor="#b8b8c9"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={styles.underlineInput}
                                returnKeyType="next"
                                onSubmitEditing={() => canNext && router.push("/(auth)/signup/password")}
                            />

                            {/* 이메일 형식이 올바르지 않다면 안내문구 */}
                            {!canNext && email.length > 0 && (
                                <Text style={{ color: "#FF5656", marginTop: 8, fontSize: 12 }}>
                                    올바른 이메일 형식이 아닙니다.
                                </Text>
                            )}
                            {/* 이메일 형식이 올바르다면 사용 가능한 이메일인지 실시간으로 db에 요청보내서 확인 */}


                        </View>

                        <Pressable
                            onPress={() => router.push("/(auth)/signup/password")}
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
    title: { fontSize: 30, fontWeight: "800", color: "#111", textAlign: "center", marginTop: 8, marginBottom: 50 },
    label: { fontSize: 20, fontWeight: "800", color: "#5465FF", marginBottom: 10, marginTop: 8 },
    underlineInput: {
        borderBottomWidth: 1.2,
        borderBottomColor: "#8ea2ff",
        paddingVertical: 10,
        fontSize: 16,
        color: "#111",
    },
    nextBtn: {
        backgroundColor: "#5465FF",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        elevation: 6,
    },
    nextTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
