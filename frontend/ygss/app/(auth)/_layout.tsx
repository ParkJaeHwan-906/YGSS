import { Stack, Redirect } from "expo-router";
import { useAppSelector } from "@/src/store/hooks";

export default function AuthLayout() {
    const token = useAppSelector((s) => s.auth.token);

    if (token) {
        // 이미 로그인 상태면 home으로
        return <Redirect href="/(app)/(tabs)/home" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="landing" />
            <Stack.Screen name="login" />
        </Stack>
    );
}
