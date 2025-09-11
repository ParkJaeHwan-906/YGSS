// app/index.tsx

import { useAppSelector } from "@/src/store/hooks";
import { Redirect } from "expo-router";

export default function Index() {
    // 로그인 토큰이 있으면 홈으로, 없으면 랜딩으로 리다이렉트
    const token = useAppSelector((s) => s.auth.accessToken);
    return token
        ? <Redirect href="/(app)/(tabs)/home" />
        : <Redirect href="/(auth)/landing" />;
}
