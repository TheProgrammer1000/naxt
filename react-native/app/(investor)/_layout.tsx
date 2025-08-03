import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";

import { useAppSelector } from "@/lib/redux/store"; // typed hook
import { selectUserType } from "@/lib/redux/authSlice"; // selector
import { FontAwesome } from "@expo/vector-icons";

export default function InvestorTabs() {
    const userType = useAppSelector(selectUserType); // "company" | "investor"
    return (
        <Tabs>
            <Tabs.Screen
                options={{
                    title: "match",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            size={24}
                            name={focused ? "link-sharp" : "link-outline"}
                        />
                    ),
                }}
                name="match"
            />

            <Tabs.Screen
                options={{
                    title: "bookmark",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? "bookmark" : "bookmark-outline"}
                            size={32}
                            color="black"
                        />
                    ),
                }}
                name="bookmark"
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

            <Tabs.Screen
                options={{
                    title: "deals",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={
                                focused
                                    ? "pricetags-sharp"
                                    : "pricetags-outline"
                            }
                            size={32}
                            color="black"
                        />
                    ),
                }}
                name="deals"
            />
        </Tabs>
    );
}
