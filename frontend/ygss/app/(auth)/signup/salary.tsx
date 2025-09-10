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
import { resetSignup, setSalary, setTotalRetirePension, setWorkedAt } from "@/src/store/slices/signupSlice";
import axios from "axios";

const API_URL = process.env.API_URL;

export default function SignupSalary() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();

    const { name, email, password } = useAppSelector((s) => s.signup);

    // 각 raw는 실제 숫자이고, display는 천단위 콤마가 들어간 문자열 
    // 연차
    const [yearsRaw, setYearsRaw] = useState("");
    const [yearsDisplay, setYearsDisplay] = useState("");
    const [yearsError, setYearsError] = useState("");

    // 연봉
    const [salaryRaw, setSalaryRaw] = useState("");
    const [salaryDisplay, setSalaryDisplay] = useState("");
    const [salaryError, setSalaryError] = useState("");

    // 퇴직연금
    const [pensionRaw, setPensionRaw] = useState("");
    const [pensionDisplay, setPensionDisplay] = useState("");

    const [hasPension, setHasPension] = useState(false);
    const [pensionError, setPensionError] = useState("");

    // 숫자 입력 처리 (raw + display 분리)
    const handleNumberChange = (
        val: string,
        setRaw: (v: string) => void,
        setDisplay: (v: string) => void,
        setError: (v: string) => void,
        format: boolean = false
    ) => {
        const onlyNum = val.replace(/,/g, "").replace(/[^0-9]/g, "");

        if (val !== "" && onlyNum === "") {
            setError("숫자로 입력해 주세요.");
        } else {
            setError("");
        }

        setRaw(onlyNum);

        if (format && onlyNum) {
            setDisplay(Number(onlyNum).toLocaleString());
        } else {
            setDisplay(onlyNum);
        }
    };

    // 다음 버튼 활성화 조건
    const canNext =
        salaryRaw.trim().length > 0 &&
        !salaryError &&
        !pensionError;

    type SignupPayload = {
        name: string;
        email: string;
        password: string;
        salary: number;
        workedAt?: number;          // 선택
        totalRetirePension: number; // 항상 number (없으면 0)
    };

    // 회원가입 + 자동 로그인
    const handleSignup = async () => {
        if (!canNext) return; // false면 거부

        console.log("연차", yearsRaw, "연봉", salaryRaw, "퇴직연금", pensionRaw, hasPension);

        if (yearsRaw.trim().length > 0) {
            dispatch(setWorkedAt(Number(yearsRaw)));
        }

        dispatch(setSalary(Number(salaryRaw)));
        dispatch(setTotalRetirePension(hasPension ? Number(pensionRaw) : 0));

        // payload 생성
        const payload: SignupPayload = {
            name,
            email,
            password,
            salary: Number(salaryRaw),
            workedAt: yearsRaw.trim().length > 0 ? Number(yearsRaw) : undefined,
            totalRetirePension: hasPension ? Number(pensionRaw) : 0,
        };

        try {
            const res = await axios.post(`${API_URL}/auth/signup`, payload);
            console.log("회원가입 성공", res.data);

            // 자동 로그인 처리 (토큰 바로 준다고 하면)
            if (res.status === 201) {
                dispatch(signIn(res.data.token));
            } else {
                // 혹시 토큰을 안 준다면, 로그인 API 호출
                const loginRes = await axios.post(`${API_URL}/auth/signin`, { email, password });
                dispatch(signIn(loginRes.data.token));
            }

            dispatch(resetSignup());
            router.replace("/(app)/(tabs)/home");
        } catch (err) {
            console.error("회원가입 실패", err);
            alert("회원가입에 실패했습니다. 다시 시도해주세요.");
        }
    };


    return (
        <View style={{ flex: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.wrap}>
                        {/* 제목 */}
                        <ProgressBar step={4} totalSteps={4} />
                        <Text style={styles.title}>회원가입</Text>

                        {/* 연차 */}
                        <View style={{ flex: 1, gap: 16 }}>
                            <View style={styles.inputBox}>
                                <Text style={styles.label}>연차</Text>
                                <View style={styles.inlineRow}>
                                    <TextInput
                                        value={yearsDisplay}
                                        autoFocus
                                        onChangeText={(val) =>
                                            handleNumberChange(val, setYearsRaw, setYearsDisplay, setYearsError)
                                        }
                                        placeholder="신입: 0년"
                                        placeholderTextColor={"#ccc"}
                                        keyboardType="numeric"
                                        style={[styles.underlineInput, { flex: 1, textAlign: "right" }]}
                                        selection={{ start: yearsDisplay.length, end: yearsDisplay.length }}
                                    />
                                    <Text style={styles.suffix}>년</Text>
                                </View>
                                {yearsError ? <Text style={styles.errorText}>{yearsError}</Text> : null}
                            </View>

                            {/* 연봉 */}
                            <View style={styles.inputBox}>
                                <Text style={styles.label}>연봉</Text>
                                <View style={styles.inlineRow}>
                                    <TextInput
                                        value={salaryDisplay}
                                        onChangeText={(val) =>
                                            handleNumberChange(val, setSalaryRaw, setSalaryDisplay, setSalaryError, true)
                                        }
                                        placeholder="단위를 확인해주세요"
                                        placeholderTextColor={"#ccc"}
                                        keyboardType="numeric"
                                        style={[styles.underlineInput, { flex: 1, textAlign: "right" }]}
                                        selection={{ start: salaryDisplay.length, end: salaryDisplay.length }}
                                    />
                                    <Text style={styles.suffix}>만원</Text>
                                </View>
                                {salaryError ? <Text style={styles.errorText}>{salaryError}</Text> : null}
                            </View>

                            {/* 기존 퇴직 연금 유무 */}
                            <View style={styles.inputBox}>
                                <Text style={styles.label}>기존 퇴직 연금 유무</Text>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>

                                    <Pressable onPress={() => setHasPension(!hasPension)} style={{ marginRight: 8, flex: 0 }}>
                                        <Ionicons
                                            name={hasPension ? "checkbox-outline" : "square-outline"}
                                            size={30}
                                            color="#5865f2"
                                        />
                                    </Pressable>
                                    <View style={[styles.inlineRowBox, { flex: 1 }, !hasPension && { backgroundColor: "#f5f5f5" }]}>
                                        <TextInput
                                            value={pensionDisplay}
                                            onChangeText={(val) =>
                                                handleNumberChange(
                                                    val,
                                                    setPensionRaw,
                                                    setPensionDisplay,
                                                    setPensionError,
                                                    true
                                                )
                                            }
                                            placeholder="기존 연금 잔액 입력"
                                            placeholderTextColor={"#ccc"}
                                            editable={hasPension}
                                            keyboardType="numeric"
                                            style={[styles.fieldInput, { flex: 1, textAlign: "right" }]}
                                            selection={{ start: pensionDisplay.length, end: pensionDisplay.length }}
                                        />
                                        <Text style={styles.suffix}>만원</Text>
                                    </View>
                                </View>
                                {pensionError ? <Text style={styles.errorText}>{pensionError}</Text> : null}
                            </View>
                        </View>
                        {/* 안내 */}
                        <Text style={styles.notice}>* 위 항목은 마이페이지에서 수정 가능합니다.</Text>

                        {/* 가입 버튼 */}
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
    title: {
        fontSize: 30,
        fontFamily: "BasicBold",
        color: "#111",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 50,
    },
    inputBox: { marginBottom: 20 },
    label: { fontSize: 18, fontFamily: "BasicMedium", color: "#5465FF", marginBottom: 10 },
    underlineInput: {
        borderBottomWidth: 1.2,
        borderBottomColor: "#8ea2ff",
        paddingVertical: 10,
        fontFamily: "BasicMedium",
        fontSize: 16,
        color: "#111",
    },
    inlineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    inlineRowBox: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#d7dafc",
        backgroundColor: "#FBFCFD",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
        fontFamily: "BasicMedium",
    },
    fieldInput: { fontFamily: "BasicMedium", fontSize: 16, color: "#111" },
    suffix: { fontFamily: "BasicMedium", fontSize: 16, color: "#555", marginLeft: 4 },
    notice: {
        fontSize: 11,
        fontFamily: "BasicMedium",
        color: "#888",
        marginTop: 10,
        marginBottom: 16,
    },
    nextBtn: {
        backgroundColor: "#5465FF",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        elevation: 6,
    },
    nextTxt: { color: "#fff", fontFamily: "BasicBold", fontSize: 15 },
    errorText: {
        fontFamily: "BasicMedium",
        fontSize: 12,
        color: "red",
        marginTop: 6,
    },
});
