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

export default function SignupName() {
    const router = useRouter();
    const ref = useRef<TextInput>(null);
    const [name, setName] = useState("");
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const t = setTimeout(() => ref.current?.focus(), 60);
        return () => clearTimeout(t);
    }, []);

    // 이름 유효성 검사용 (한글, 2자 이상 10자 이하)
    const nameRegex = /^[가-힣]{2,10}$/;
    const isValid = nameRegex.test(name);

    return (
        <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.wrap}>
                        <ProgressBar step={1} totalSteps={4} />
                        <Text style={styles.title}>회원가입</Text>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>이름</Text>
                            <TextInput
                                ref={ref}
                                autoFocus
                                value={name}
                                onChangeText={setName}
                                placeholder=" "
                                style={styles.underlineInput}
                                returnKeyType="next"
                                onSubmitEditing={() => isValid && router.push("/(auth)/signup-email")}
                            />

                            {/* 이름이 두글자 이상이 아니거나 한글이 아니면 경고 */}
                            {name.length > 0 && !isValid && (
                                <Text style={{ color: "#FF5656", marginTop: 8, fontFamily: "BasicMedium", fontSize: 12 }}>
                                    이름은 한글, 2~10자로 입력해주세요.
                                </Text>
                            )}
                        </View>

                        <Pressable
                            onPress={() => router.push("/(auth)/signup-email")}
                            // 에러메시지 출력시 비활성화
                            disabled={!isValid}
                            style={({ pressed }) => [
                                styles.nextBtn,
                                !isValid && { opacity: 0.4 },
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
    label: { fontSize: 20, fontFamily: "BasicMedium", color: "#5465FF", marginBottom: 10, marginTop: 8 },
    underlineInput: {
        borderBottomWidth: 1.2,
        borderBottomColor: "#8ea2ff",
        paddingVertical: 10,
        fontFamily: "BasicMedium",
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
    nextTxt: { color: "#fff", fontFamily: "BasicMedium", fontSize: 15 },
});
