import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setUser } from "@/src/store/slices/authSlice";
import { Colors } from "@/src/theme/colors";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Button from "./Button";
import Toast from "./Toast";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function MyInfo() {
    const user = useAppSelector((s) => s.auth.user);
    const accessToken = useAppSelector((s) => s.auth.accessToken);
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false); // 비밀번호 유효성 검증

    // 상태값
    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [newEmp, setNewEmp] = useState(user?.newEmp ?? true);
    const [salary, setSalary] = useState(
        user?.salary ? String(user.salary / 10000) : "" // 만원 단위
    );
    const [password, setPassword] = useState("");
    const [totalRetirePension, setTotalRetirePension] = useState(
        user?.totalRetirePension ? String(user.totalRetirePension / 10000) : "" // 만원 단위
    );

    // user가 갱신되면 로컬 상태도 업데이트
    useEffect(() => {
        if (user) {
            setName(user.name ?? "");
            setEmail(user.email ?? "");
            setNewEmp(user.newEmp ?? true);
            setSalary(user.salary ? String(user.salary / 10000) : "");
            setTotalRetirePension(
                user.totalRetirePension ? String(user.totalRetirePension / 10000) : ""
            );
        }
    }, [user]);

    const onSave = async () => {
        try {
            if (changePassword) {
                try {
                    await axios.post(`${API_URL}/auth/check/password`, { password });
                    setPasswordError(false);
                } catch (err: any) {
                    if (err.response?.status === 400) {
                        setPasswordError(true);
                    }
                    return;
                }
            }

            const body = {
                name,
                email,
                password,
                newEmp,
                salary: Number(salary) * 10000 || 0, // 만원 → 원 단위
                totalRetirePension: newEmp ? 0 : Number(totalRetirePension) * 10000 || 0,
            };

            const res = await axios.put(`${API_URL}/user/update/detail`, body, {
                headers: { Authorization: `A103 ${accessToken}` },
            });

            if (res.status === 200) {
                const { data: freshUser } = await axios.get(`${API_URL}/user/load/detail`, {
                    headers: { Authorization: `A103 ${accessToken}` },
                });
                dispatch(setUser(freshUser));
                setIsEditing(false);
                setToastVisible(true);
            }
        } catch (err) {
            console.error("유저 정보 수정 실패", err);
            setToastVisible(true);
        }
    };

    // 버튼 활성화 조건
    const canSave = isEditing
        ? (
            // 경력자 → 퇴직연금 필수
            (!newEmp ? !!totalRetirePension && Number(totalRetirePension) > 0 : true)
            &&
            // 비밀번호 변경 체크 시 → 값 필수
            (changePassword ? password.length > 0 : true)
        )
        : true;

    return (
        <View>
            <View style={styles.card}>
                <Text style={styles.title}>기본 정보</Text>

                {/* 이름 (수정 불가) */}
                <Row label="이름">
                    <Text style={styles.value}>{name}</Text>
                </Row>

                {/* 이메일 (수정 불가) */}
                <Row label="이메일">
                    <Text style={styles.value}>{email}</Text>
                </Row>
                {/* 경력 */}
                <Row label="경력">
                    {isEditing ? (
                        <Text
                            style={[styles.value, { color: Colors.primary }]}
                            onPress={() => {
                                setNewEmp((prev) => {
                                    const next = !prev;
                                    if (next) {
                                        // 신입으로 변경되면 퇴직연금 자동 0 처리
                                        setTotalRetirePension("0");
                                    }
                                    return next;
                                });
                            }}
                        >
                            {newEmp ? "신입" : "경력"}
                        </Text>
                    ) : (
                        <Text style={styles.value}>{newEmp ? "신입" : "경력"}</Text>
                    )}
                </Row>

                {/* 연봉 */}
                <Row label="연봉">
                    {isEditing ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TextInput
                                style={[styles.input, { flex: 0 }]}
                                value={salary ? Number(salary).toLocaleString("ko-KR") : ""}
                                onChangeText={(text) => {
                                    const numeric = text.replace(/[^0-9]/g, "");
                                    setSalary(numeric);
                                }}
                                keyboardType="numeric"
                                placeholder="연봉을 입력해주세요"
                                placeholderTextColor={Colors.gray}
                            />
                            <Text style={{ marginLeft: 4, fontFamily: "BasicLight", color: Colors.black }}>만원</Text>
                        </View>
                    ) : (
                        <Text style={styles.value}>
                            {user?.salary ? (user.salary / 10000).toLocaleString("ko-KR") : 0} 만원
                        </Text>
                    )}
                </Row>

                {/* 퇴직연금 */}
                <Row label="보유 퇴직연금">
                    {isEditing ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TextInput
                                style={[
                                    styles.input,
                                    // 신입이면 회색 border
                                    newEmp
                                        ? { borderBottomColor: Colors.gray }
                                        : !totalRetirePension || Number(totalRetirePension) === 0
                                            ? { borderBottomColor: "red" } // 경력인데 미입력 → 빨강
                                            : {},
                                    { flex: 0 },
                                ]}
                                value={
                                    totalRetirePension
                                        ? Number(totalRetirePension).toLocaleString("ko-KR")
                                        : ""
                                }
                                onChangeText={(text) => {
                                    const numeric = text.replace(/[^0-9]/g, "");
                                    setTotalRetirePension(numeric);
                                }}
                                keyboardType="numeric"
                                placeholder={newEmp ? "미보유" : "필수 입력"}
                                placeholderTextColor={Colors.gray}
                                editable={!newEmp} // 신입이면 입력 불가
                            />
                            <Text
                                style={{
                                    marginLeft: 4,
                                    fontFamily: "BasicLight",
                                    color: Colors.black,
                                }}
                            >
                                만원
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.value}>
                            {user?.totalRetirePension
                                ? (user.totalRetirePension / 10000).toLocaleString("ko-KR")
                                : 0}{" "}
                            만원
                        </Text>
                    )}
                </Row>

                {/* 비밀번호 */}
                <Row label="비밀번호">
                    {isEditing ? (
                        changePassword ? (
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="새 비밀번호 입력"
                                    placeholderTextColor={Colors.gray}
                                />
                                <Text
                                    style={[styles.value, { color: Colors.primary, marginLeft: 8 }]}
                                    onPress={() => {
                                        setChangePassword(false);
                                        setPassword("");
                                        setPasswordError(false);
                                    }}
                                >
                                    변경 안 함
                                </Text>
                            </View>
                        ) : (
                            <Text
                                style={[styles.value, { color: Colors.primary }]}
                                onPress={() => setChangePassword(true)}
                            >
                                비밀번호 변경
                            </Text>
                        )
                    ) : (
                        <Text style={styles.value}>********</Text>
                    )}
                </Row>

                {isEditing && changePassword && passwordError && (
                    <View style={{ width: "100%", alignItems: "flex-end", marginTop: -8, marginBottom: 10 }}>
                        <Text style={styles.errorText}> 비밀번호는 8자 이상이며,</Text>
                        <Text style={styles.errorText}>대문자/소문자/숫자/특수문자를 모두 포함해야 합니다.</Text>
                    </View>
                )}
            </View>

            {isEditing ? (
                <Button label="적용하기" onPress={onSave} disabled={!canSave} />
            ) : (
                <Button label="수정하기" onPress={() => setIsEditing(true)} />
            )}
            {toastVisible && (
                <Toast message="정보가 수정되었습니다." onHide={() => setToastVisible(false)} />
            )}
        </View>
    );
}

/* Row */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: Colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 24,
    },
    title: { fontSize: 22, fontFamily: "BasicBold", marginBottom: 25, color: Colors.black },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 30,
        marginBottom: 15,
    },
    label: { fontSize: 16, color: Colors.gray, fontFamily: "BasicMedium" },
    value: {
        fontSize: 15,
        fontFamily: "BasicLight",
        color: Colors.black,
        lineHeight: 20,
    },
    input: {
        minWidth: 160,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary,
        fontSize: 14,
        fontFamily: "BasicLight",
        color: Colors.black,
        lineHeight: 20,
        paddingVertical: 0,
        textAlign: "right",
    },
    errorText: {
        color: "#c84b4b",
        fontSize: 10,
        fontFamily: "BasicMedium",
        lineHeight: 18,
        textAlign: "right",
    },
});
