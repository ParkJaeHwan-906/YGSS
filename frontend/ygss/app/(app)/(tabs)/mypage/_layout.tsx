// (tabs)/mypage/_layout.tsx
import CustomAlert from "@/components/organisms/CustomAlert";
import { useAppSelector } from "@/src/store/hooks";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function MyPageLayout() {
    const user = useAppSelector((s) => s.auth.user);
    const router = useRouter();
    const [alertVisible, setAlertVisible] = useState(false);

    useEffect(() => {
        if (!user) {
            setAlertVisible(true);
            router.replace("/(auth)/login");
        }
    }, [user]);

    if (!user) return null;
    return (
        <>
            <Stack
                initialRouteName="index" // 기본 화면 (mypage/index.tsx)
                screenOptions={{ headerShown: false }} // 공통 옵션
            />
            <CustomAlert
                visible={alertVisible}
                title="로그인이 필요합니다"
                message="로그인 후 이용해주세요"
                onClose={() => setAlertVisible(false)}
            />
        </>
    );
}
