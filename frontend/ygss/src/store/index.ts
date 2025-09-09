// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import signupReducer from "./slices/signupSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        signup: signupReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
