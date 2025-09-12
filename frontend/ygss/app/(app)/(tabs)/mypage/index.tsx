// app/(app)/(tabs)/mypage/index.tsx
import PasswordConfirmModal from "@/components/organisms/PasswordConfirmModal";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { signOut } from "@/src/store/slices/authSlice";
import { deleteRefreshToken } from "@/src/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "react-native/Libraries/NewAppScreen";
import InvestBias from "@/components/molecules/InvestBias";

export default function Mypage() {
    const router = useRouter();
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user);
    const [modalVisible, setModalVisible] = useState(false);

    const handleLogout = async () => {
        await deleteRefreshToken();     // SecureStore 비우기
        dispatch(signOut());            // 전역 상태 초기화
        router.replace("/(auth)/login"); // 뒤로가기 못하게 교체 이동
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 상단 프로필 이동 버튼 */}
            <Pressable
                onPress={() => setModalVisible(true)}
                style={styles.profileButton}
            >
                <Text style={styles.profileName}>{user?.name}  </Text>
                <Ionicons name="chevron-forward-outline" size={22} color="#333" />
            </Pressable>

            {/* 비밀번호 확인 모달 */}
            <PasswordConfirmModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => router.push("/mypage/modify")}
            />

            {/* 로그아웃 버튼 */}
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>로그아웃</Text>
            </Pressable>

            {/* 투자 성향 테스트 */}
            <InvestBias />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: Colors.back
    },
    profileButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        alignSelf: "flex-start"
    },
    profileName: {
        fontSize: 22,
        fontFamily: "BasicBold"
    },
    profileArrow: {
        fontSize: 18,
        marginLeft: 4,
    },
    logoutButton: {
        marginTop: 30,
        alignSelf: "center", // 가운데 정렬
    },
    logoutText: {
        fontSize: 16,
        fontFamily: "BasicLight",
        color: Colors.black,
        textDecorationLine: "underline", // 밑줄
    },
});
