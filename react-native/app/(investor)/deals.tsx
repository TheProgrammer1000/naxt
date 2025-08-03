import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    Pressable,
    Alert,
} from "react-native";
import { api } from "@/lib/services/api";
import { useAppSelector } from "@/lib/redux/store";
import { selectUserId } from "@/lib/redux/authSlice";
import { useIsFocused } from "@react-navigation/native";

interface Deal {
    deals_postID: number;
    matcheID: number;
    company_name: string;
    deal_price: number;
    deal_procentage: number;
    email: string;
}

const DealsScreen: React.FC = () => {
    const isFocused = useIsFocused();
    const userID = useAppSelector(selectUserId);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

    const fetchDeals = async () => {
        try {
            const result = await api.get<Deal[]>(
                `/deals_post/getInvestorPostDealsOnly/${userID}`
            );
            setDeals(result.data);

            console.log("result.data: ", result.data);
        } catch (err) {
            console.error("Error fetching deals: ", err);
        }
    };

    useEffect(() => {
        if (userID && isFocused) {
            fetchDeals();
        }
    }, [userID, isFocused]);

    const openModal = (deal: Deal) => {
        setSelectedDeal(deal);
        setModalVisible(true);
    };

    const signDeal = async () => {
        if (!selectedDeal) return;
        try {
            const deals_postID = selectedDeal.deals_postID;

            const result = await api.post(`/deals_post/sign`, {
                userID: userID,
                deals_postID: deals_postID,
            });

            console.log(result);

            Alert.alert(
                "Deal signerad!",
                `Du har signerat deal med ${selectedDeal.company_name}.`
            );

            fetchDeals();

            /* Example API call; replace with your endpoint */
        } catch (err) {
            console.error("Error signing deal: ", err);
            Alert.alert("Error", "Could not sign the deal. Please try again.");
        } finally {
            setModalVisible(false);
            setSelectedDeal(null);
        }
    };

    const renderDeal = ({ item }: { item: Deal }) => (
        <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
            <Text style={styles.companyName}>{item.company_name}</Text>
            <Text style={styles.investment}>
                {item.deal_price.toLocaleString("sv-SE")} kr för{" "}
                {item.deal_procentage}% av bolaget
            </Text>
            <Text style={styles.email}>{item.email}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={deals}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderDeal}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>Ingen erbjudanden än.</Text>
                )}
            />

            {selectedDeal && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>
                                Signera Erbjudande
                            </Text>
                            <Text style={styles.modalText}>
                                {selectedDeal.company_name}
                            </Text>
                            <Text style={styles.modalText}>
                                {selectedDeal.deal_price.toLocaleString(
                                    "sv-SE"
                                )}{" "}
                                kr för {selectedDeal.deal_procentage}% av
                                bolaget
                            </Text>
                            <View style={styles.modalButtons}>
                                <Pressable
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>
                                        Avbryt
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.button, styles.buttonSign]}
                                    onPress={signDeal}
                                >
                                    <Text style={styles.buttonText}>
                                        Signera
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default DealsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    list: { padding: 16, marginTop: 35 },
    card: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    companyName: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
    investment: {
        fontSize: 16,
        fontWeight: "500",
        color: "#2a9d5eff",
        marginBottom: 4,
    },
    email: { fontSize: 14, color: "#888" },
    emptyText: {
        flex: 1,
        textAlign: "center",
        textAlignVertical: "center",
        color: "#666",
        marginTop: 35,
        fontSize: 26,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 8,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
    modalText: { fontSize: 16, marginBottom: 8, textAlign: "center" },
    modalButtons: { flexDirection: "row", marginTop: 16 },
    button: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 8,
    },
    buttonClose: { backgroundColor: "#ccc" },
    buttonSign: { backgroundColor: "#2a9d8f" },
    buttonText: { color: "white", fontWeight: "600" },
});
