// src/components/AppInitializer.tsx
import { useAppDispatch } from "@/src/store/hooks";
import { signIn, signOut } from "@/src/store/slices/authSlice";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const API_URL = process.env.API_URL;

export default function AppInitializer() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const refreshToken = await SecureStore.getItemAsync("refreshToken");
            if (!refreshToken) {
                setLoading(false);
                return;
            }

            try {
                // refreshToken으로 accessToken 재발급
                const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

                dispatch(
                    signIn({
                        accessToken: res.data.accessToken,
                        user: res.data.user, // refresh API가 내려줄 경우
                    })
                );
            } catch (err) {
                // refresh 실패 → 강제 로그아웃
                dispatch(signOut());
                await SecureStore.deleteItemAsync("refreshToken");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    if (loading) return null; // 필요하다면 스플래시 컴포넌트로 대체

    return null;
}
