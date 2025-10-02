// app/(app)/(tabs)/mypage/modify.tsx
import MyInfo from "@/components/molecules/MyInfo";
import DeleteAccountModal from "@/components/organisms/DeleteAccountModal";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { signOut } from "@/src/store/slices/authSlice";
import { Colors } from "@/src/theme/colors";
import { deleteRefreshToken } from "@/src/utils/secureStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Modify() {
    const accessToken = useAppSelector((s) => s.auth.accessToken);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            {/* 내 정보 */}
            <MyInfo />

            {/* 회원탈퇴 버튼 */}
            <Pressable onPress={() => setModalVisible(true)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>회원탈퇴</Text>
            </Pressable>

            {/* 회원탈퇴 확인 모달 */}
            <DeleteAccountModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={async () => {
                    // 탈퇴 성공 → 토큰 삭제 및 로그아웃
                    await deleteRefreshToken();
                    dispatch(signOut());
                    router.replace("/(auth)/login");
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, marginTop: 10 },
    deleteButton: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    deleteText: {
        fontSize: 15,
        fontFamily: "BasicLight",
        color: Colors.black,
        textDecorationLine: "underline",
    },
});
