// src/store/slices/signupSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** 회원가입 상태 타입 */
export type SignupState = {
    name: string;
    email: string;
    password: string;

    /** 신입 여부: 신입(true) / 경력(false) */
    newEmp: boolean;

    /** 급여(원 단위) */
    salary: number | null;

    /** 보유 퇴직연금(원 단위, 경력일 때만 사용) */
    totalRetirePension: number | null;
};

// 초기 상태값 (회원가입 시작 시 기본값)
const initialState: SignupState = {
    name: "",
    email: "",
    password: "",
    newEmp: true,               // 기본값: 신입
    salary: null,
    totalRetirePension: null,
};

// slice 생성
const signupSlice = createSlice({
    name: "signup",
    initialState,
    reducers: {
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setPassword: (state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        setNewEmp: (state, action: PayloadAction<boolean>) => {
            state.newEmp = action.payload;
            // 신입으로 바꾸면 경력 값은 비워둠
            if (action.payload === true) state.totalRetirePension = null;
        },
        setSalary: (state, action: PayloadAction<number | null>) => {
            state.salary = action.payload;
        },
        setTotalRetirePension: (state, action: PayloadAction<number | null>) => {
            state.totalRetirePension = action.payload;
        },
        resetSignup: () => initialState,
    },
});

// 액션 함수들 export (컴포넌트에서 dispatch 할 때 사용)
export const {
    setName,
    setEmail,
    setPassword,
    setNewEmp,
    setSalary,
    setTotalRetirePension,
    resetSignup,
} = signupSlice.actions;

// 리듀서 export (store/index.ts에서 등록할 때 사용)
export default signupSlice.reducer;
