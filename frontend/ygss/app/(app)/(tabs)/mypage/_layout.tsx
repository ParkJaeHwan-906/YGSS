// (tabs)/mypage/_layout.tsx
import { useAppSelector } from "@/src/store/hooks";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function MyPageLayout() {
    const user = useAppSelector((s) => s.auth.user);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            alert("로그인 후 이용해주세요.");
            router.replace("/(auth)/login");
        }
    }, [user]);

    if (!user) return null;
    return (
        <Stack
            initialRouteName="index" // 기본 화면 (mypage/index.tsx)
            screenOptions={{ headerShown: false }} // 공통 옵션
        />
    );
}
