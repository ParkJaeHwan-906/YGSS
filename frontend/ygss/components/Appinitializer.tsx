// src/components/AppInitializer.tsx
import { useAppDispatch } from "@/src/store/hooks";
import { setUser, signOut, updateAccessToken } from "@/src/store/slices/authSlice";
import { deleteRefreshToken, getRefreshToken, saveRefreshToken } from "@/src/utils/secureStore";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
// // landing 페이지 노출을 위한 3초
// const MIN = 3000;
// const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));

export default function AppInitializer() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const refreshToken = await getRefreshToken();
            console.log("refreshToken from SecureStore:", refreshToken);


            if (!refreshToken) {
                setLoading(false);
                return;
            }

            try {
                // 리프레시 토큰으로 accessToken 재발급
                const res = await axios.put(`${API_URL}/auth/refresh`, null, {
                    headers: { Authorization: `A103 ${refreshToken}` },
                    timeout: 5000,
                    validateStatus: (s) => s < 500,
                });
                console.log("refresh API response:", res.data);

                // (2) 잘못된/만료 리프레시 즉시 중단
                if (res.status === 400 || res.status === 401) {
                    throw new Error(`REFRESH_REJECTED_${res.status}`);
                }

                const { accessToken, refreshToken: newRefreshToken } = res.data ?? {};

                // (3) 필수값 검증
                if (!accessToken) {
                    throw new Error("NO_ACCESS_TOKEN_IN_REFRESH_RESPONSE");
                }

                dispatch(updateAccessToken(accessToken));

                if (newRefreshToken) {
                    await saveRefreshToken(newRefreshToken);
                    console.log("newRefreshToken saved to SecureStore:", newRefreshToken);
                }

                // 유저 정보 로드
                const { data: user } = await axios.get(`${API_URL}/user/load/detail`, {
                    headers: { Authorization: `A103 ${accessToken}` },
                });
                dispatch(setUser(user));
                // setTimeout(() => {
                //     router.replace("/(app)/(tabs)/home");
                // }, 3000);

            } catch (err: any) {
                console.error("앱종료시 로그인자동화 실패", err);
                // 실패 → 강제 로그아웃
                dispatch(signOut());
                await deleteRefreshToken();
                setLoading(false);
                router.replace("/(auth)/login");
            }
        };

        init();
    }, []);

    if (loading) {
        return (
            <View style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.white
            }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return null;
}
