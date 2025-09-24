// components/CustomAlert.tsx
import { Colors } from "@/src/theme/colors";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    visible: boolean;
    title: string;
    message?: string;
    onClose: () => void;
    confirmText?: string;
};

export default function CustomAlert({
    visible,
    title,
    message,
    onClose,
    confirmText = "확인",
}: Props) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{title}</Text>
                    {message && <Text style={styles.message}>{message}</Text>}

                    <Pressable style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{confirmText}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.36)",
        justifyContent: "center",
        alignItems: "center",
    },
    alertBox: {
        width: "75%",
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 16,
        fontFamily: "BasicBold",
        color: Colors.black,
        marginBottom: 10,
    },
    message: {
        fontSize: 12,
        fontFamily: "BasicMedium",
        color: Colors.gray,
        marginBottom: 10,
        textAlign: "center",
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 6,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 14,
        fontFamily: "BasicMedium",
        color: Colors.white,
    },
});