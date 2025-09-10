// src/store/slices/signupSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 회원가입 과정에서 필요한 상태(변수)들의 타입 정의
type SignupState = {
    name: string;                // 사용자 이름
    email: string;               // 이메일
    password: string;            // 비밀번호
    salary: number | null;       // 연봉 (없으면 null)
    workedAt: number | null;     // 근속 연수 (없으면 null)
    totalRetirePension: number | null; // 현재 보유 중인 퇴직연금 (없으면 null)
};

// 초기 상태값 (회원가입 시작 시 기본값)
const initialState: SignupState = {
    name: "",
    email: "",
    password: "",
    salary: null,
    workedAt: null,
    totalRetirePension: null,
};

// slice 생성
const signupSlice = createSlice({
    // slice의 이름 (액션 type prefix로 사용됨)
    name: "signup",

    // 위에서 정의한 초기 상태
    initialState,

    // 상태를 업데이트할 수 있는 함수들
    reducers: {
        // 이름 저장
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        // 이메일 저장
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        // 비밀번호 저장
        setPassword: (state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        // 연봉 저장
        setSalary: (state, action: PayloadAction<number>) => {
            state.salary = action.payload;
        },
        // 근속 연수 저장
        setWorkedAt: (state, action: PayloadAction<number>) => {
            state.workedAt = action.payload;
        },
        // 총 퇴직연금 저장
        setTotalRetirePension: (state, action: PayloadAction<number>) => {
            state.totalRetirePension = action.payload;
        },
        // 회원가입 과정 초기화 (로그아웃 시 or 회원가입 완료 시)
        resetSignup: () => initialState,
    },
});

// 액션 함수들 export (컴포넌트에서 dispatch 할 때 사용)
export const {
    setName,
    setEmail,
    setPassword,
    setSalary,
    setWorkedAt,
    setTotalRetirePension,
    resetSignup,
} = signupSlice.actions;

// 리듀서 export (store/index.ts에서 등록할 때 사용)
export default signupSlice.reducer;
