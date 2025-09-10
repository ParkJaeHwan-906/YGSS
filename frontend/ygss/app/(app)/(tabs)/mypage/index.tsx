import MyInfo from "@/components/molecules/MyInfo";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, Text } from "react-native";

export default function Mypage() {
    const router = useRouter();

    const handleLogout = () => {
        // 나중에 로그아웃 api 호출 +토큰 삭제
        router.replace("/(auth)/login");
    };

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>My Page</Text>
            <MyInfo />

            <Pressable
                onPress={handleLogout}
                style={{ marginTop: 20, padding: 10, backgroundColor: "red", borderRadius: 5 }}>
                <Text style={{ color: "white" }}>Logout</Text>
            </Pressable>

        </SafeAreaView>
    );
}
