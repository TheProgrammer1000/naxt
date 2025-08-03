import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    TextInput,
    Button,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";

import { colors } from "@/theme";

import {
    createStackNavigator,
    StackNavigationProp,
} from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import {
    initChat,
    listenForMessages,
    sendMessage,
} from "@/lib/firestore/firestore";
import { api } from "@/lib/services/api";
import { useAppSelector } from "@/lib/redux/store";
import { selectUserId, selectUserType } from "@/lib/redux/authSlice";

// Types for navigation
export type ChatStackParamList = {
    ChatList: undefined;
    ChatRoom: { matchID: string };
};

type ChatListNavProp = StackNavigationProp<ChatStackParamList, "ChatList">;
type ChatRoomNavProp = StackNavigationProp<ChatStackParamList, "ChatRoom">;
type ChatRoomRouteProp = RouteProp<ChatStackParamList, "ChatRoom">;

interface Match {
    usernameInvestor: string;
    userInvestorEmail: string;
    userInvestorImage: string | null;
    company_name: string;
    usernameCompany: string;
    userCompanyImage: string | null;
    userIDInvestor: number;
    userIDCompany: number;
    matchingID: number;
}

interface Message {
    id: string;
    senderId: number;
    text: string;
    sentAt: Date | null;
}

// // Screen listing available chats
function ChatListScreen({ navigation }: { navigation: ChatListNavProp }) {
    const isFocused = useIsFocused();
    const userID = useAppSelector(selectUserId);
    const userType = useAppSelector(
        selectUserType as any as () => "company" | "investor"
    );
    const [chatUsers, setChatUsers] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log("userID: ", userID);

    useEffect(() => {
        let isMounted = true;

        async function fetchMatches() {
            try {
                if (!userID) return;
                const endpoint = `/matching/getAllMatches/${userID}/${userType}`;
                const response = await api.get<Match | Match[]>(endpoint);
                const raw = response.data;

                console.log("raw: ", raw);

                // Normalize to array
                const matches: Match[] = Array.isArray(raw) ? raw : [raw];

                console.log("matches: ", matches);

                await Promise.all(
                    matches.map((match) =>
                        initChat(
                            match.matchingID.toString(),
                            match.userIDInvestor,
                            match.userIDCompany
                        )
                    )
                );
                if (isMounted) setChatUsers(matches);
            } catch (error) {
                console.error(error);

                if (isMounted) setError("Det gick inte att hämta matchningar.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        // Re-run fetchMatches() whenever the screen is focused or userID/userType change
        if (isFocused) {
            fetchMatches();
        }

        return () => {
            isMounted = false;
        };
    }, [userID, userType, isFocused]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {userType === "company" ? (
                <Text style={styles.header_text}>Intresserade investerare</Text>
            ) : (
                <Text style={styles.header_text}>
                    Intresserade entreprenörer
                </Text>
            )}

            <FlatList
                data={chatUsers}
                keyExtractor={(item) => item.matchingID.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() =>
                            navigation.navigate("ChatRoom", {
                                matchID: item.matchingID.toString(),
                            })
                        }
                    >
                        {userType === "company" ? (
                            <>
                                <Text style={{ color: "#FFF" }}>
                                    Investeraren: {item.usernameInvestor}
                                </Text>
                                <Text style={{ color: "#FFF" }}>
                                    Intresserad av: {item.company_name}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={{ color: "#FFF" }}>
                                    Kontaktperson: {item.usernameCompany}
                                </Text>

                                <Text style={{ color: "#FFF" }}>
                                    Företagetsnamn: {item.company_name}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

// Screen for a single chat room
function ChatRoomScreen({
    navigation,
    route,
}: {
    navigation: ChatRoomNavProp;
    route: ChatRoomRouteProp;
}) {
    const { matchID } = route.params;
    const currentUserId = useAppSelector(selectUserId)!;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        navigation.setOptions({ title: `Chat ${matchID}` });
        const unsubscribe = listenForMessages(matchID, setMessages);
        return unsubscribe;
    }, [matchID]);

    const handleSend = async () => {
        if (input.trim() === "") return;
        await sendMessage(matchID, currentUserId, input.trim());
        setInput("");
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={80}
        >
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageBubble,
                            item.senderId === currentUserId
                                ? styles.myMessage
                                : styles.theirMessage,
                        ]}
                    >
                        <Text>{item.text}</Text>
                        <Text style={styles.timeText}>
                            {item.sentAt
                                ? item.sentAt.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : ""}
                        </Text>
                    </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                />
                <Button title="Send" onPress={handleSend} />
            </View>
        </KeyboardAvoidingView>
    );
}

// Export just the Stack
const Stack = createStackNavigator<ChatStackParamList>();
export default function ChatStack() {
    return (
        <Stack.Navigator initialRouteName="ChatList">
            <Stack.Screen
                name="ChatList"
                component={ChatListScreen}
                options={{ title: "Your Chats" }}
            />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    errorText: { color: "red" },
    chatItem: {
        padding: 12,
        marginBottom: 8,
        backgroundColor: "#1a439cff",
        borderRadius: 8,
    },
    messageBubble: {
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
        maxWidth: "80%",
    },
    myMessage: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
    theirMessage: { backgroundColor: "#FFFFFF", alignSelf: "flex-start" },
    timeText: { fontSize: 10, color: "#666", marginTop: 4, textAlign: "right" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    input: {
        flex: 1,
        padding: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        marginRight: 8,
    },

    header_text: {
        textAlign: "center",
        fontSize: 26,
        fontWeight: 600,
        color: colors.primary_color.light_blue,
        marginBottom: 20,
    },
});
