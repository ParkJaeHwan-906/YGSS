import { Colors } from "@/src/theme/colors";
import { saveRefreshToken } from "@/src/utils/secureStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
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
import { setUser, signIn } from "@/src/store/slices/authSlice";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const DOMAINS: string[] = [
    "naver.com",
    "gmail.com",
    "hanmail.net",
    "daum.net",
    "nate.com",
    "yahoo.com",
    "hotmail.com",
];

export default function Login() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const emailRef = useRef<TextInput>(null);
    const pwRef = useRef<TextInput>(null);

    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [showPw, setShowPw] = useState(false);

    // 자동 완성 박스
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => emailRef.current?.focus(), 60);
        return () => clearTimeout(t);
    }, []);

    const canLogin = email.trim().length > 0 && pw.length >= 4;

    // 로그인
    const onLogin = async () => {
        if (!canLogin) return;

        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password: pw,
            });
            const { accessToken, refreshToken } = res.data;

            // accessToken Redux 저장
            dispatch(signIn(accessToken));

            // refreshToken은 SecureStore에 저장
            await saveRefreshToken(refreshToken);

            // 로그인 직후 유저 정보 요청
            const { data: user } = await axios.get(`${API_URL}/user/load/detail`, {
                headers: { Authorization: `A103 ${accessToken}` },
            });
            dispatch(setUser(user));

            router.replace("/(app)/(tabs)/home");

        } catch (err) {
            console.error("로그인 실패", err);
            Alert.alert("로그인 실패", "이메일이나 비밀번호를 확인해주세요.", [
                { text: "확인" },
            ]);
        }
    };

    return (
        <LinearGradient
            colors={["#fff5e6", "#eaeaffff"]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowSuggestions(false) }} accessible={false}>
                        <View style={stylesLogin.wrap}>
                            <View style={{ justifyContent: "center", alignItems: "center" }}>
                                <Image
                                    source={require("../../../assets/icon/titleLogo.png")}
                                    style={{ width: 300, height: 100 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={{ position: "relative", marginBottom: 10 }}>
                                {/* 이메일 입력 박스 */}
                                <View style={stylesLogin.fieldBox}>
                                    <MaterialCommunityIcons
                                        name="email-outline"
                                        size={20}
                                        color="#8c8ca1"
                                        style={{ marginRight: 8 }}
                                    />
                                    <TextInput
                                        ref={emailRef}
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            setShowSuggestions(true);
                                        }}
                                        placeholder="이메일"
                                        placeholderTextColor="#b8b8c9"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={stylesLogin.fieldInput}
                                    />
                                </View>

                                {/* 자동완성 박스 */}
                                {showSuggestions && email.length > 0 && (
                                    <FlatList
                                        style={stylesLogin.suggestionBox}
                                        data={DOMAINS}
                                        keyExtractor={(item) => item}
                                        keyboardDismissMode="on-drag"       // 스크롤 시 키보드 닫힘
                                        keyboardShouldPersistTaps="handled" // 탭 시 키보드 닫힘
                                        renderItem={({ item }) => (
                                            <Pressable
                                                style={stylesLogin.suggestionItem}
                                                onPress={() => {
                                                    setEmail(
                                                        email.includes("@")
                                                            ? `${email.split("@")[0]}@${item}`
                                                            : `${email}@${item}`
                                                    );
                                                    setShowSuggestions(false);
                                                    Keyboard.dismiss();
                                                }}
                                            >
                                                <Text>
                                                    {email.includes("@")
                                                        ? `${email.split("@")[0]}@${item}`
                                                        : `${email}@${item}`}
                                                </Text>
                                            </Pressable>
                                        )}
                                    />
                                )}
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

                            {/* 로그인 없이 이용하기 버튼 */}
                            <Pressable onPress={() => router.replace("/(app)/(tabs)/home")} style={stylesLogin.guestBtn}>
                                <Text style={stylesLogin.linkStrong}>게스트로 이용하기</Text>
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
        gap: 10,
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
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    fieldInput: { flex: 1, fontFamily: "BasicMedium", fontSize: 16, color: Colors.black },
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
    loginTxt: { color: Colors.white, fontFamily: "BasicMedium", fontSize: 16 },
    linkRow: { flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 8 },
    linkMuted: { color: "#6f7285", fontSize: 12, fontFamily: "BasicMedium", textAlign: "right" },
    guestBtn: { marginTop: 10 },
    linkStrong: { color: Colors.primary, fontSize: 12, fontFamily: "BasicMedium", textAlign: "center" },
    suggestionBox: {
        position: "absolute",
        top: 70, // 이메일 필드 높이 + margin 만큼
        left: 0,
        right: 0,
        backgroundColor: "rgba(249, 255, 255, 0.8)",
        borderRadius: 6,
        zIndex: 10,
        maxHeight: 150,
    },
    suggestionItem: {
        padding: 10,
    },
});
