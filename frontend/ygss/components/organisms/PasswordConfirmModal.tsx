import { useAppSelector } from "@/src/store/hooks";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../molecules/Button";
import Toast from "../molecules/Toast";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PasswordConfirmModal({
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
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const res = await axios.post(
                `${API_URL}/user/validation/password`,
                { password },
                { headers: { Authorization: `A103 ${accessToken}` } }
            );

            if (res.status === 200) {
                setPassword("");
                onClose();
                onSuccess(); // 성공 시 페이지 이동
            }
        } catch (err: any) {
            setToastVisible(true); // 실패 → toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>비밀번호 확인</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="비밀번호 입력"
                            placeholderTextColor={Colors.gray}
                            secureTextEntry={!show}

                        />
                        {/* 아이콘 추가 */}
                        <Pressable onPress={() => setShow((s) => !s)} style={{ padding: 4, position: "absolute", right: 2 }}>
                            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={18} color="#8c8ca1" />
                        </Pressable>
                    </View>

                    <View style={{ flexDirection: "row", marginTop: 20 }}>
                        <Button
                            label="취소"
                            onPress={() => {
                                setPassword("");
                                onClose();
                            }}
                            style={{ flex: 1, marginRight: 8, backgroundColor: Colors.gray, height: 36, paddingVertical: 4 }}
                            textStyle={{ fontSize: 14 }}
                        />
                        <Button
                            label="확인"
                            onPress={handleConfirm}
                            loading={loading}
                            style={{ flex: 1, backgroundColor: Colors.primary, height: 36, paddingVertical: 4 }}
                            textStyle={{ fontSize: 14 }}
                        />
                    </View>
                </View>
            </View>
            {toastVisible && (
                <Toast
                    message="비밀번호가 틀렸습니다."
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
        fontSize: 16,
        fontFamily: "BasicBold",
        marginBottom: 12,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
        textAlign: "center",
        fontSize: 13,
        fontFamily: "BasicMedium",
        color: Colors.black,
        paddingVertical: 6,
        paddingRight: 35
    },
    inputWrapper: {
        position: "relative",
    }
});
