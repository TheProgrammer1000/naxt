import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";

import { useAppSelector } from "@/lib/redux/store"; // typed hook
import { selectUserType } from "@/lib/redux/authSlice"; // selector

export default function CompanyTabs() {
    const userType = useAppSelector(selectUserType); // "company" | "investor"
    return (
        <Tabs>
            <Tabs.Screen
                options={{
                    headerTitle: "post",
                    headerShown: false,
                    title: "pitches",
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            size={24}
                            name={focused ? "create" : "create-outline"} // ✏️
                        />
                    ),
                }}
                name="post"
            />

            <Tabs.Screen
                name="profile"
                options={{
                    headerTitle: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            size={24}
                            name={focused ? "person" : "person-outline"}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="matches"
                options={{
                    headerTitle: "matches",
                    headerShown: false,
                    title: "matches",
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            size={24}
                            name={focused ? "pricetags" : "pricetags-outline"}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                options={{
                    title: "chat",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? "chatbox-sharp" : "chatbox-outline"}
                            size={32}
                            color="black"
                        />
                    ),
                }}
                name="chat"
            />
        </Tabs>
    );
}
