// app/(app)/(tabs)/mypage/index.tsx
import MyInfo from "@/components/molecules/MyInfo";
import { useAppDispatch } from "@/src/store/hooks";
import { signOut } from "@/src/store/slices/authSlice";
import { deleteRefreshToken } from "@/src/utils/secureStore";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Mypage() {
    const router = useRouter();
    const dispatch = useAppDispatch()

    const handleLogout = async () => {
        await deleteRefreshToken();     // 1) SecureStore 비우기
        dispatch(signOut());            // 2) 전역 상태 초기화
        router.replace("/(auth)/login"); // 3) 뒤로가기 못하게 교체 이동
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 상단 프로필 이동 버튼 */}
            <Pressable
                onPress={() => router.push("/mypage/modify")}
                style={styles.profileButton}
            >
                <Text style={styles.profileName}>김알키  </Text>
                <Text style={styles.profileArrow}>{">"}</Text>
            </Pressable>

            {/* 내 정보 */}
            <MyInfo />

            {/* 로그아웃 버튼 */}
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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
        marginTop: 20,
        padding: 10,
        backgroundColor: "red",
        borderRadius: 5,
    },
    logoutText: {
        color: "white",
        textAlign: "center",
        fontFamily: "BasicLight",
    },
});
