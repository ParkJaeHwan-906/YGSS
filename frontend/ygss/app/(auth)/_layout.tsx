import { useAppSelector } from "@/src/store/hooks";
import { Redirect, Stack, usePathname } from "expo-router";

export default function AuthLayout() {
    const token = useAppSelector((s) => s.auth.accessToken);
    const pathname = usePathname();

    // landing 관련 페이지일 때는 redirect 하지 않음
    const isLanding = pathname?.includes("/landing");

    if (token && !isLanding) {
        // 로그인 상태에서 landing 제외한 다른 auth 페이지 접근 시 home으로
        return <Redirect href="/(app)/(tabs)/home" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="landing" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}
