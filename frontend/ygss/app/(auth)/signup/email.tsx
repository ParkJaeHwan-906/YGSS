import ProgressBar from "@/components/login/ProgressBar";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setEmail } from "@/src/store/slices/signupSlice";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView, Platform,
    Pressable, StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DOMAINS: string[] = ["naver.com", "gmail.com", "hanmail.net", "daum.net", "nate.com", "yahoo.com", "hotmail.com"];
const API_URL = process.env.API_URL; // 환경변수에서 API_URL 가져오기

export default function SignupEmail() {
    const router = useRouter();
    const ref = useRef<TextInput>(null);
    const insets = useSafeAreaInsets();

    const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");

    // 리덕스에 이메일 저장
    const dispatch = useAppDispatch();
    // 리덕스에 이메일 꺼내기
    const email = useAppSelector((state) => state.signup.email);

    useEffect(() => {
        const t = setTimeout(() => ref.current?.focus(), 60);
        return () => clearTimeout(t);
    }, []);

    // 이메일 유효성 검사용
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validFormat = emailRegex.test(email.trim());

    // DB에 이메일 중복 확인 요청 보내기
    // DB 중복 확인 (디바운스)
    useEffect(() => {
        if (!validFormat) {
            setMessage("");
            return;
        }

        const delay = setTimeout(() => {
            checkEmail(email);
        }, 400);

        return () => clearTimeout(delay);
    }, [email]);

    // 이메일 중복 확인 api 요청
    const checkEmail = async (email: string) => {
        try {
            const res = await axios.post(`${API_URL}/auth/check/email`, { email });
            console.log("res", res);
            console.log("res.data", res.data);
            if (res.status === 200 && res.data === true) {
                setMessage("사용 가능한 이메일입니다.");
            }
        } catch (err: any) {
            if (err.response?.status === 400) {
                setMessage(err.response.data); // 서버에서 주는 메시지
                console.log("err.response.data", err.response.data);
            } else {
                setMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            }
        }
    };

    // 다음 버튼 활성화 여부
    const canNext = validFormat && message === "사용 가능한 이메일입니다.";

    //추천 도메인 필터링
    const filteredDomains: string[] = DOMAINS.filter((domain) =>
        domain.toLowerCase().startsWith(email.toLowerCase()) ||
        email.includes("@") // 이미 @ 입력했으면 그대로 둠
    );

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
                                onChangeText={(text) => dispatch(setEmail(text))}  // 리덕스에 즉시 저장
                                placeholder="이메일 주소를 입력하세요"
                                placeholderTextColor="#b8b8c9"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={styles.underlineInput}
                                returnKeyType="next"
                                onSubmitEditing={() => canNext && router.push("/(auth)/signup/password")}
                            />

                            {/* 이메일 형식이 올바르지 않다면 안내문구 */}
                            {!validFormat && email.length > 0 && (
                                <Text style={{ color: "#FF5656", marginTop: 8, fontSize: 12 }}>
                                    올바른 이메일 형식이 아닙니다.
                                </Text>
                            )}
                            {/* 이메일 형식이 올바르다면 사용 가능한 이메일인지 실시간으로 db에 요청보내서 확인 */}
                            {message.length > 0 && (
                                <Text
                                    style={{
                                        marginTop: 8,
                                        fontSize: 12,
                                        color: message === "사용 가능한 이메일입니다." ? "green" : "red",
                                    }}
                                >
                                    {message}
                                </Text>
                            )}

                            {/* 추천 이메일 도메인 */}
                            {email.length > 0 && filteredDomains.length > 0 && (
                                <FlatList<string>
                                    style={styles.suggestionBox}
                                    data={filteredDomains}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.suggestionItem}
                                            onPress={() =>
                                                setEmail(
                                                    email.includes("@")
                                                        ? `${email.split("@")[0]}@${item}`
                                                        : `${email}@${item}`
                                                )
                                            }
                                        >
                                            <Text>
                                                {email.includes("@")
                                                    ? `${email.split("@")[0]}@${item}`
                                                    : `${email}@${item}`}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                            )}

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
    suggestionBox: {
        marginTop: 10,
        borderRadius: 6,
        backgroundColor: "#f5faffff",
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 10,
    },
});
