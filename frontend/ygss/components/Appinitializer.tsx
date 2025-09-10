// src/components/AppInitializer.tsx
import { useAppDispatch } from "@/src/store/hooks";
import { setUser, signOut, updateAccessToken } from "@/src/store/slices/authSlice";
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
                const res = await axios.post(`${API_URL}/auth/refresh`, null, {
                    headers: { Authorization: `A103 ${refreshToken}` },
                });
                dispatch(updateAccessToken(res.data.accessToken));

                // 🔹 유저 정보 다시 로드 (accessToken으로)
                const detail = await axios.get(`${API_URL}/user/load/detail`, {
                    headers: { Authorization: `A130 ${res.data.accessToken}` },
                });

                dispatch(setUser(detail.data));
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

    if (loading) return null; // 필요하다면 Splash 화면 컴포넌트로 대체
    return null;
}