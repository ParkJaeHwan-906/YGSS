// (tabs)/mypage/_layout.tsx
import { Stack } from "expo-router";

export default function MyPageLayout() {
    return (
        <Stack
            initialRouteName="index" // 기본 화면 (mypage/index.tsx)
            screenOptions={{ headerShown: false }} // 공통 옵션
        />
    );
}
