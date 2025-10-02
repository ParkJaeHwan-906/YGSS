// (tabs)/mypage/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function IrpLayout() {
    return (
        <Stack
            initialRouteName="irp1" // 기본 화면 (irp/irp1.tsx)
            screenOptions={{ headerShown: false }} // 공통 옵션
        />
    );
}
