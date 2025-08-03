import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux/store";
import { selectUserId } from "@/lib/redux/authSlice";
import { api } from "@/lib/services/api";
import { verticalScale, scale } from "react-native-size-matters";
import { colors } from "@/theme";
import CustomModalPopup from "@/components/CustomModalPopup";
import { useIsFocused } from "@react-navigation/native";

export interface CompanyMatch {
    matchingID: number;
    company_name: string;
    companyID: number;
    name: string;
    email: string;
}

export default function ProfileScreen() {
    const userID = useAppSelector(selectUserId);
    const isFocused = useIsFocused();

    const [companyMatches, setCompanyMatches] = useState<CompanyMatch[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);

    async function fetchCompanyMatches() {
        try {
            const response = await api.get(
                `/matching/getCompanyMatches/${userID}`
            );
            setCompanyMatches(response.data);
        } catch (error) {
            console.error("API Error:", error);
        }
    }

    useEffect(() => {
        if (userID && isFocused) {
            fetchCompanyMatches();
        }
    }, [userID, isFocused]);

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            {/* Sticky header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Skapa dealavtal</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll_container}
                keyboardShouldPersistTaps="handled"
            >
                {companyMatches.map((match) => (
                    <TouchableOpacity
                        key={match.matchingID}
                        onPress={() => {
                            setSelectedMatch(match);
                            setModalVisible(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={styles.card}>
                            <Text style={styles.cardEmail}>{match.email}</Text>
                            <Text style={styles.cardCompany}>
                                {match.company_name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {selectedMatch && (
                <CustomModalPopup
                    buttonText="Skapa dealen"
                    showModal={() => setModalVisible(false)}
                    modalVisible={modalVisible}
                    match={selectedMatch}
                />
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: colors.primary_color.light_blue,
    },
    header: {
        paddingTop: Platform.OS === "ios" ? scale(50) : scale(20),
        paddingBottom: verticalScale(10),
        backgroundColor: colors.primary_color.light_blue,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.primary_color.dark_blue,
    },
    headerText: {
        fontSize: scale(20),
        fontWeight: "700",
        color: "#fff",
    },
    scroll_container: {
        padding: scale(10),
    },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: scale(8),
        padding: scale(12),
        marginBottom: verticalScale(10),
        // light shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // elevation (Android)
        elevation: 2,
    },
    cardEmail: {
        flex: 2,
        fontSize: scale(14),
    },
    cardId: {
        flex: 1,
        fontSize: scale(14),
        textAlign: "center",
    },
    cardCompany: {
        flex: 2,
        fontSize: scale(14),
        textAlign: "right",
    },
});
