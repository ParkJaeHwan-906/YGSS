import { saveRefreshToken } from "@/src/utils/secureStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from "react-native";

// store관련
import { useAppDispatch } from "@/src/store/hooks";
import { signIn } from "@/src/store/slices/authSlice";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Login() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const emailRef = useRef<TextInput>(null);
    const pwRef = useRef<TextInput>(null);

    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [showPw, setShowPw] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => emailRef.current?.focus(), 60);
        return () => clearTimeout(t);
    }, []);

    const canLogin = email.trim().length > 0 && pw.length >= 4;

    // 로그인
    const onLogin = async () => {
        console.log("onLogin 호출됨");
        if (!canLogin) return;

        try {
            console.log("API_URL", API_URL);
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password: pw,
            });
            console.log("로그인 응답:", res.status, res.data);

            const refreshToken = res.data.refreshToken;
            // accessToken Redux 저장
            dispatch(signIn(res.data.accessToken));

            // refreshToken은 SecureStore에 저장
            await saveRefreshToken(refreshToken);

            router.replace("/(app)/(tabs)/home");

        } catch (err) {
            console.error("로그인 실패", err);
            Alert.alert("로그인 실패", "이메일이나 비밀번호를 확인해주세요.", [
                { text: "확인", onPress: () => console.log("확인 눌림") },
            ]);
        }
    };

    return (
        <LinearGradient
            colors={["#fff5e6", "#f0f0ff"]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={stylesLogin.wrap}>
                            <View style={{ justifyContent: "center", alignItems: "center" }}>
                                <Image
                                    source={require("../../../assets/icon/titleLogo.png")}
                                    style={{ width: 300, height: 100 }}
                                    resizeMode="contain"
                                />
                            </View>
                            {/* 이메일 필드 */}
                            <View style={stylesLogin.fieldBox}>
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={20}
                                    color="#8c8ca1"
                                    style={{ marginRight: 8 }}
                                />
                                <TextInput
                                    ref={emailRef}
                                    autoFocus
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="이메일"
                                    placeholderTextColor="#b8b8c9"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    onSubmitEditing={() => pwRef.current?.focus()}
                                    style={stylesLogin.fieldInput}
                                />
                            </View>

                            {/* 비밀번호 필드 */}
                            <View style={stylesLogin.fieldBox}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#8c8ca1"
                                    style={{ marginRight: 8 }}
                                />
                                <TextInput
                                    ref={pwRef}
                                    value={pw}
                                    onChangeText={setPw}
                                    placeholder="비밀번호"
                                    placeholderTextColor="#b8b8c9"
                                    secureTextEntry={!showPw}
                                    returnKeyType="done"
                                    onSubmitEditing={onLogin}
                                    style={stylesLogin.fieldInput}
                                />
                                <Pressable onPress={() => setShowPw((s) => !s)}>
                                    <Ionicons
                                        name={showPw ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#8c8ca1"
                                    />
                                </Pressable>
                            </View>

                            {/* 로그인 버튼 */}
                            <Pressable
                                onPress={onLogin}
                                disabled={!canLogin}
                                style={({ pressed }) => [
                                    stylesLogin.loginBtn,
                                    !canLogin && { opacity: 0.4 },
                                    pressed && { transform: [{ scale: 0.98 }] },
                                ]}
                            >
                                <Text style={stylesLogin.loginTxt}>로그인</Text>
                            </Pressable>

                            {/* 링크 영역 */}
                            <View style={stylesLogin.linkRow}>
                                <Text style={stylesLogin.linkMuted}>계정이 없으신가요?</Text>
                                <Link href="/(auth)/signup/name" style={stylesLogin.linkStrong}>
                                    회원가입
                                </Link>
                            </View>

                            {/* 임시로 home으로 이동하는 라우터 replace */}
                            <Pressable onPress={() => router.replace("/(app)/(tabs)/home")}>
                                <Text style={stylesLogin.linkStrong}>홈으로</Text>
                            </Pressable>
                            {/* <Text style={stylesLogin.linkMuted}>비밀번호를 잊어버리셨나요?</Text> */}
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const stylesLogin = StyleSheet.create({
    wrap: {
        flex: 1,
        paddingHorizontal: 20,
        gap: 14,
        justifyContent: "center",
    },
    brand: {
        fontSize: 42,
        fontFamily: "BasicBold",
        color: "#6b7bff",
        alignSelf: "center",
        marginBottom: 16,
    },
    fieldBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    fieldInput: { flex: 1, fontFamily: "BasicMedium", fontSize: 16, color: "#111" },
    loginBtn: {
        backgroundColor: "#5865f2",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#5865f2",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },
    loginTxt: { color: "#fff", fontFamily: "BasicMedium", fontSize: 16 },
    linkRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 8 },
    linkMuted: { color: "#6f7285", fontSize: 12, fontFamily: "BasicMedium", textAlign: "right" },
    linkStrong: { color: "#5865f2", fontSize: 12, fontFamily: "BasicMedium" },
});
