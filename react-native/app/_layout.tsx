// app/_layout.tsx
import React, { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { Provider } from "react-redux";
import { store, useAppSelector } from "../lib/redux/store";
import { selectUserId, selectUserType } from "@/lib/redux/authSlice";
import { api } from "@/lib/services/api";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AuthRedirector() {
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
    const userType = useAppSelector(selectUserType);

    const router = useRouter();

    // const user = api.get(`/users/${userID}`).then((response) => {
    //     const result = response.json();
    // });

    useEffect(() => {
        if (isLoggedIn) {
            if (userType === "investor") {
                router.replace("/(investor)/match");
            } else if (userType === "company") {
                router.replace("/(company)/post");
            }
        } else {
        }
    }, [isLoggedIn, userType]);

    // don’t render anything yourself—Slot will handle it
    return null;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <Provider store={store}>
                    <AuthRedirector />
                    <Slot />
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
