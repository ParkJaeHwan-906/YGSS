import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import axios from "axios";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Button from "../molecules/Button";
import Toast from "../molecules/Toast";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function DeleteAccountModal({
    visible,
    onClose,
    onSuccess,
}: {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const accessToken = useAppSelector((s) => s.auth.accessToken);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);

            // // 비밀번호 검증
            // const checkRes = await axios.post(
            //     `${API_URL}/user/validation/password`,
            //     { password },
            //     { headers: { Authorization: `A103 ${accessToken}` } }
            // );
            // if (checkRes.status !== 200) {
            //     console.log("비밀번호 검증 실패:", checkRes.status, checkRes.data);
            //     setToastVisible(true);
            //     return;
            // }

            // 탈퇴 요청
            const res = await axios.delete(`${API_URL}/auth/login`, {
                headers: { Authorization: `A103 ${accessToken}` },
            });
            console.log("회원탈퇴 응답:", res.status, res.data);


            if (res.status === 200) {
                setPassword("");
                onClose();
                onSuccess(); // 성공 시 로그아웃 처리
            }
        } catch (err) {
            console.error("회원탈퇴 실패", err);
            setToastVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>정말 탈퇴하시겠습니까?</Text>
                    <Text style={styles.desc}>
                        탈퇴하면 모든 데이터가 삭제됩니다
                    </Text>

                    {/* <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="비밀번호 입력"
                        placeholderTextColor={Colors.gray}
                        secureTextEntry
                    /> */}

                    <View style={styles.row}>
                        <Button
                            label="취소"
                            onPress={() => {
                                setPassword("");
                                onClose();
                            }}
                            style={{ flex: 1, marginRight: 8, backgroundColor: Colors.gray }}
                        />
                        <Button
                            label="탈퇴"
                            onPress={handleDelete}
                            loading={loading}
                            style={{ flex: 1, backgroundColor: "#c84b4b" }}
                        // disabled={!password}
                        />
                    </View>
                </View>
            </View>
            {toastVisible && (
                <Toast
                    message="비밀번호가 틀렸거나 탈퇴에 실패했습니다."
                    onHide={() => setToastVisible(false)}
                />
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: "75%",
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontFamily: "BasicBold",
        marginBottom: 12,
        textAlign: "center",
    },
    desc: {
        fontSize: 14,
        fontFamily: "BasicMedium",
        color: Colors.gray,
        marginBottom: 15,
        textAlign: "center",
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
        fontSize: 14,
        fontFamily: "BasicLight",
        color: Colors.black,
        paddingVertical: 6,
        marginBottom: 20,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
    },
});
