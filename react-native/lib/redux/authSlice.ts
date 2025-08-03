// lib/redux/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** Possible user roles; adjust as needed */
export type UserType = "company" | "investor";

/** Shape of the auth slice */
export interface AuthState {
    isLoggedIn: boolean;
    userId?: number;
    userType?: UserType;
}

const initialState: AuthState = {
    isLoggedIn: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        /** Save the logged‑in user’s id + type */
        loginSuccess(
            state,
            action: PayloadAction<{
                userId: number;
                userType: UserType;
            }>
        ) {
            state.isLoggedIn = true;
            state.userId = action.payload.userId;
            state.userType = action.payload.userType;
        },
        logout(state) {
            state.isLoggedIn = false;
            delete state.userId;
            delete state.userType;
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

/* ------------ optional selectors ------------ */
import type { RootState } from "./store";

export const selectIsLoggedIn = (s: RootState) => s.auth.isLoggedIn;
export const selectUserId = (s: RootState) => s.auth.userId;
export const selectUserType = (s: RootState) => s.auth.userType;
