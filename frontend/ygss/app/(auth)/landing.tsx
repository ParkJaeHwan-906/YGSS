import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function LandingPage() {
    const router = useRouter();

    return (
        <View>
            <Text>랜딩페이지 👋</Text>
            <Button title="로그인 하기" onPress={() => router.push("/(auth)/login")} />
        </View>
    );
}
