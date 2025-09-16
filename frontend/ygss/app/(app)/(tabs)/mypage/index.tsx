// app/(app)/(tabs)/mypage/index.tsx
import InvestBias from "@/components/molecules/InvestBias";
import InvestChar from "@/components/molecules/InvestChar";
import MyMoney from "@/components/molecules/MyMoney";
import PasswordConfirmModal from "@/components/organisms/PasswordConfirmModal";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { signOut } from "@/src/store/slices/authSlice";
import { Colors } from "@/src/theme/colors";
import { deleteRefreshToken } from "@/src/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Mypage() {
    const router = useRouter();
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user);
    console.log(user)
    const [modalVisible, setModalVisible] = useState(false);

    const insets = useSafeAreaInsets();

    const handleLogout = async () => {
        await deleteRefreshToken();     // SecureStore 비우기
        dispatch(signOut());            // 전역 상태 초기화
        router.replace("/(auth)/login"); // 뒤로가기 못하게 교체 이동
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}>
                {/* 상단 프로필 이동 버튼 */}
                <Pressable
                    onPress={() => setModalVisible(true)}
                    style={styles.profileButton}
                >
                    <Text style={styles.profileName}>{user?.name}  </Text>
                    <Ionicons name="chevron-forward-outline" size={22} color="#333" />
                </Pressable>

                <View style={{ marginBottom: 10 }}>
                    {/* 내 자산 현황 */}
                    {user?.totalRetirePension !== null && user?.totalRetirePension !== undefined && (
                        <MyMoney
                            amount={user.totalRetirePension}
                            rate={0} // TODO: 실제 수익률 값으로 교체 필요
                        />
                    )}
                </View>
                {/* 비밀번호 확인 모달 */}
                <PasswordConfirmModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSuccess={() => router.push("/mypage/modify")}
                />
                {/* <MyMoney /> */}
                <View style={{ marginBottom: 10 }}>
                    <InvestChar />
                </View>
                <View style={{ marginBottom: 10 }}>
                    {/* 투자 성향 테스트 */}
                    <InvestBias />
                </View>

                {/* 로그아웃 버튼 */}
                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>로그아웃</Text>
                </Pressable>
            </ScrollView >
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: Colors.back,
    },
    profileButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
        alignSelf: "flex-start",
        paddingLeft: 8,
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
