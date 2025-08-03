// lib/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// 1️⃣ Build the store
export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    // middleware & devTools use Toolkit defaults; no extra config needed
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 3️⃣ Pre‑typed hooks so components don’t have to import the types
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
