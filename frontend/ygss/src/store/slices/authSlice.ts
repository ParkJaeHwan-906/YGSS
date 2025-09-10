// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type User = {
    name: string;
    email: string;
    password: string | null;
    salary: number | null;
    workedAt: number | null;
    totalRetirePension: number | null;
};

type AuthState = {
    accessToken: string | null;
    user: User | null;
};

const initialState: AuthState = {
    accessToken: null,
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // 로그인 시 accessToken만 저장
        signIn: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        // 로그아웃
        signOut: (state) => {
            state.accessToken = null;
            state.user = null;
        },
        // accessToken 갱신
        updateAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        // user 정보 세팅 (회원가입 직후 or /me 조회 후)
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        // user 정보 일부 갱신 (프로필 수정 API 응답 반영)
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
});

export const { signIn, signOut, updateAccessToken, setUser, updateUser } =
    authSlice.actions;
export default authSlice.reducer;
