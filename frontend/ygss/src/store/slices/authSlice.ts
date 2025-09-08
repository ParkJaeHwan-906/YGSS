// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = { token: string | null };
const initialState: AuthState = { token: null };

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        signIn: (s, a: PayloadAction<string>) => { s.token = a.payload; },
        signOut: (s) => { s.token = null; },
    },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
