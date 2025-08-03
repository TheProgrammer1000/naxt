import { Ionicons } from "@expo/vector-icons";
import { Button, Text } from "@react-navigation/elements";
import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import ProfileCircle from "./ProfileCircle";
import { UserCompanyMatch } from "@/lib/types/userCompanyMatch";
import { colors } from "@/theme";
import { api } from "@/lib/services/api";
import { useAppSelector } from "@/lib/redux/store";
import { selectUserId } from "@/lib/redux/authSlice";

type Props = {
    showModal: () => void;
    modalVisible: boolean;
    item: UserCompanyMatch;
    fetchLikedCompanies: () => void;
};

export default function ModalPopup({
    showModal,
    modalVisible,
    item,
    fetchLikedCompanies,
}: Props) {
    const submitMatche = async (companyID: number, userIDInvestor: number) => {
        const result = await api.post(`/matching/addMatch`, {
            companyID: companyID,
            userIDInvestor: userIDInvestor,
        });

        console.log("result: ", result);

        fetchLikedCompanies();
        showModal(); // ensure modal closes
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                showModal();
            }}
        >
            <View style={styles.centered_modal}>
                <View style={styles.modalView}>
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {item.imageUserUrl ? (
                            <ProfileCircle
                                img_url={item.imageUserUrl}
                                size={225}
                            />
                        ) : (
                            <ProfileCircle
                                img_url={require("../assets/images/ceo.jpg")}
                                size={225}
                            />
                        )}
                    </View>

                    <Ionicons
                        onPress={showModal}
                        name="close"
                        size={55}
                        color="red"
                        style={styles.button_modal_close}
                    />

                    {item.description ? (
                        <Text>{item.description}</Text>
                    ) : (
                        <Text>Ingen description</Text>
                    )}

                    <Text
                        style={{
                            fontSize: 18,
                            color: "#000",
                        }}
                    >
                        Redo ta nästa steg?
                    </Text>
                    <TouchableOpacity
                        style={styles.button_modal_submit}
                        onPress={() =>
                            submitMatche(item.companyID, item.userIDInvestor)
                        }
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                fontSize: 28,
                                color: "#FFF",
                            }}
                        >
                            Börja chatta
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalView: {
        position: "relative",
        // margin: 20,
        backgroundColor: "white",
        // justifyContent: "center",
        width: "90%",

        borderRadius: 15,
        padding: 35,
        // alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,

        marginTop: 100,

        gap: 30,
    },

    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },

    button_modal_close: {
        position: "absolute",
        padding: 5,
        top: 5,
        right: 10,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 50,
        cursor: "pointer",
    },

    button_modal_submit: {
        backgroundColor: "rgba(34, 147, 0, 1)",
        borderRadius: 30,
        padding: 10,
    },

    centered_modal: {
        alignItems: "center",
    },

    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
});
