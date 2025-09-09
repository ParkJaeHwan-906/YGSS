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

export default function SignupSalary() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
        yearsRaw.trim().length > 0 &&
        salaryRaw.trim().length > 0 &&
        !yearsError &&
        !salaryError &&
        !pensionError;

    const goNext = () => {
        if (!canNext) return;
        // TODO: 회원가입 API 호출 후 성공 → 자동 로그인 처리
        console.log({
            years: yearsRaw,
            salary: salaryRaw,
            pension: hasPension ? pensionRaw : "0",
        });
        router.replace("/(app)/(tabs)/home");
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
                                        placeholder="신입 0년"
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
                            onPress={goNext}
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
        fontWeight: "800",
        color: "#111",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 50,
    },
    inputBox: { marginBottom: 20 },
    label: { fontSize: 18, fontWeight: "800", color: "#5465FF", marginBottom: 10 },
    underlineInput: {
        borderBottomWidth: 1.2,
        borderBottomColor: "#8ea2ff",
        paddingVertical: 10,
        fontSize: 16,
        color: "#111",
    },
    inlineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    inlineRowBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    fieldInput: { fontSize: 16, color: "#111" },
    suffix: { fontSize: 16, color: "#555", marginLeft: 4 },
    notice: {
        fontSize: 11,
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
    nextTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    errorText: {
        fontSize: 12,
        color: "red",
        marginTop: 6,
    },
});
