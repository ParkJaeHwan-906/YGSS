// app/(auth)/signup/salary.tsx
import ProgressBar from "@/components/login/ProgressBar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { signIn } from "@/src/store/slices/authSlice";
import {
    resetSignup,
    setNewEmp,
    setSalary,
    setTotalRetirePension,
} from "@/src/store/slices/signupSlice";
import { Colors } from "@/src/theme/colors";
import { saveRefreshToken } from "@/src/utils/secureStore";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

// 만원 → 원
const toWon = (man: string | number) => Number(man || 0) * 10_000;

/** 숫자 입력 공통 핸들러 */
function handleNumberChange(
    val: string,
    setRaw: (v: string) => void,
    setDisplay: (v: string) => void,
    setError: (v: string) => void,
    format = false
) {
    const onlyNum = val.replace(/,/g, "").replace(/[^0-9]/g, "");
    if (val !== "" && onlyNum === "") setError("숫자로 입력해 주세요.");
    else setError("");

    setRaw(onlyNum);
    if (format && onlyNum) setDisplay(Number(onlyNum).toLocaleString("ko-KR"));
    else setDisplay(onlyNum);
}

/** 요청 페이로드 타입 */
type PayloadNewEmp = {
    name: string;
    email: string;
    password: string;
    salary: number; // 원
};
type PayloadExperienced = {
    name: string;
    email: string;
    password: string;
    newEmp: false;
    salary: number; // 원
    totalRetirePension: number; // 원
};


export default function SignupSalary() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();

    const { name, email, password, newEmp } = useAppSelector((s) => s.signup);

    // 연봉
    const [salaryRaw, setSalaryRaw] = useState("");
    const [salaryDisplay, setSalaryDisplay] = useState("");
    const [salaryError, setSalaryError] = useState("");

    // (경력일 때만) 보유 퇴직 연금
    const [pensionRaw, setPensionRaw] = useState("");
    const [pensionDisplay, setPensionDisplay] = useState("");
    const [pensionError, setPensionError] = useState("");

    // 버튼 활성화: 연봉만 필수(경력의 연금은 입력 없으면 0으로 전송)
    const canNext = salaryRaw.trim().length > 0 && !salaryError && !pensionError && (!newEmp ? pensionRaw.trim().length > 0 : true);

    /** 로그인 + 유저 로드 공통 처리 */
    const loginAfterSignup = async (email: string, password: string) => {
        const { data: login } = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        const { accessToken, refreshToken } = login;

        dispatch(signIn(accessToken));
        await saveRefreshToken(refreshToken);
    };

    const handleSignup = async () => {
        if (!canNext) return;

        const salaryWon = toWon(salaryRaw);
        const pensionWon = !newEmp ? (pensionRaw ? toWon(pensionRaw) : 0) : 0;

        // 스토어 업데이트(원 단위)
        dispatch(setSalary(salaryWon));
        dispatch(setTotalRetirePension(!newEmp ? pensionWon : null));

        // payload 분기
        const payload: PayloadNewEmp | PayloadExperienced = newEmp
            ? { name, email, password, salary: salaryWon }
            : { name, email, password, newEmp: false, salary: salaryWon, totalRetirePension: pensionWon };

        try {
            const res = await axios.post(`${API_URL}/auth/signup`, payload);

            if (res.status === 201) {
                setTimeout(async () => {
                    await loginAfterSignup(email, password)
                }, 500)
                dispatch(resetSignup());
                console.log("회원가입 성공")
                router.replace("/(app)/(tabs)/home");
            } else {
                alert("회원가입에 실패했습니다");
            }
        } catch (err) {
            console.error("회원가입 실패", err);
            alert("회원가입에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.wrap}>
                        <ProgressBar step={4} totalSteps={4} />
                        <Text style={styles.title}>회원가입</Text>

                        <View style={{ flex: 1, gap: 18 }}>
                            {/* 연봉 */}
                            <View style={styles.inputBox}>
                                <Text style={styles.label}>연봉</Text>
                                <View style={styles.inlineRow}>
                                    <TextInput
                                        value={salaryDisplay}
                                        onChangeText={(v) => handleNumberChange(v, setSalaryRaw, setSalaryDisplay, setSalaryError, true)}
                                        placeholder="연봉 입력"
                                        placeholderTextColor="#ccc"
                                        keyboardType="numeric"
                                        style={[styles.underlineInput, { flex: 1, textAlign: "right" }]}
                                        selection={{ start: salaryDisplay.length, end: salaryDisplay.length }}
                                    />
                                    <Text style={styles.suffix}>만원</Text>
                                </View>
                                {!!salaryError && <Text style={styles.errorText}>{salaryError}</Text>}
                            </View>

                            {/* 경력 여부 */}
                            <View style={styles.inputBox}>
                                <Text style={styles.label}>경력여부</Text>
                                <View style={styles.empRow}>
                                    {/* 신입 */}
                                    <Pressable style={styles.empOption} onPress={() => dispatch(setNewEmp(true))}>
                                        <Ionicons name={newEmp ? "checkbox-outline" : "square-outline"} size={26} color="#5865f2" />
                                        <Text style={[styles.empText, newEmp && styles.empTextActive]}>신입</Text>
                                    </Pressable>

                                    {/* 경력 */}
                                    <Pressable style={[styles.empOption, { marginLeft: 28 }]} onPress={() => dispatch(setNewEmp(false))}>
                                        <Ionicons name={!newEmp ? "checkbox-outline" : "square-outline"} size={26} color="#5865f2" />
                                        <Text style={[styles.empText, !newEmp && styles.empTextActive]}>경력</Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* (경력 선택 시) 보유 퇴직 연금 */}
                            {!newEmp && (
                                <View style={styles.inputBox}>
                                    <Text style={styles.label}>보유 퇴직 연금</Text>
                                    <View style={styles.inlineRow}>
                                        <TextInput
                                            value={pensionDisplay}
                                            onChangeText={(v) => handleNumberChange(v, setPensionRaw, setPensionDisplay, setPensionError, true)}
                                            placeholder="기존 연금 잔액 입력"
                                            placeholderTextColor="#ccc"
                                            keyboardType="numeric"
                                            style={[styles.underlineInput, { flex: 1, textAlign: "right" }]}
                                            selection={{ start: pensionDisplay.length, end: pensionDisplay.length }}
                                        />
                                        <Text style={styles.suffix}>만원</Text>
                                    </View>
                                    {!!pensionError && <Text style={styles.errorText}>{pensionError}</Text>}
                                </View>
                            )}
                        </View>

                        <Text style={styles.notice}>* 위 항목은 마이페이지에서 수정 가능합니다.</Text>

                        <Pressable
                            onPress={handleSignup}
                            disabled={!canNext}
                            style={({ pressed }) => [
                                styles.nextBtn,
                                !canNext && { opacity: 0.4 },
                                pressed && { transform: [{ scale: 0.98 }] },
                            ]}
                        >
                            <Text style={styles.nextTxt}>회원 가입</Text>
                        </Pressable>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
    title: { fontSize: 30, fontFamily: "BasicBold", color: Colors.black, textAlign: "center", marginTop: 8, marginBottom: 50 },
    inputBox: { marginBottom: 16 },
    label: { fontSize: 20, fontFamily: "BasicMedium", color: Colors.primary, marginBottom: 10 },
    underlineInput: {
        borderBottomWidth: 1.2,
        borderBottomColor: "#8ea2ff",
        paddingVertical: 10,
        fontFamily: "BasicMedium",
        fontSize: 16,
        color: "#111",
    },
    inlineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    suffix: { fontFamily: "BasicMedium", fontSize: 16, color: "#555", marginLeft: 4 },
    errorText: { fontFamily: "BasicMedium", fontSize: 12, color: "red", marginTop: 6 },

    // 경력여부 섹션
    empRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
    empOption: { flexDirection: "row", alignItems: "center" },
    empText: { marginLeft: 8, fontSize: 16, color: "#111", fontFamily: "BasicMedium" },
    empTextActive: { color: "#111" },

    notice: { fontSize: 11, fontFamily: "BasicMedium", color: Colors.gray, marginTop: 10, marginBottom: 16 },
    nextBtn: { backgroundColor: "#5465FF", borderRadius: 12, paddingVertical: 14, alignItems: "center", elevation: 6 },
    nextTxt: { color: "#FBFCFD", fontFamily: "BasicBold", fontSize: 15 },
});
