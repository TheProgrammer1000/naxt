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
import { CompanyMatch } from "@/app/(company)/profile";
import { colors } from "@/theme";
import { api } from "@/lib/services/api";
import InputText from "./InputText";
import { TextInput } from "react-native-gesture-handler";

type Props = {
    showModal: () => void;
    modalVisible: boolean;
    match: CompanyMatch;
    buttonText: string;
};

export default function CustomModalPopup({
    showModal,
    modalVisible,
    match,
    buttonText,
}: Props) {
    const [dealPrice, setDealPrice] = useState("");
    const [dealProcent, setDealProcent] = useState("");

    console.log("match: ", match);

    const submitDeal = async () => {
        // Ensure both fields are filled
        if (!dealPrice.trim() || !dealProcent.trim()) {
            Alert.alert(
                "Fel",
                "Vänligen fyll i både pris och procent för dealen."
            );
            return;
        }

        // Parse to numbers
        const price = parseFloat(dealPrice);
        const percent = parseFloat(dealProcent);

        if (isNaN(price) || isNaN(percent)) {
            Alert.alert(
                "Fel",
                "Vänligen ange giltiga nummer för pris och procent."
            );
            return;
        }

        try {
            const result = await api.get(`/deals_post/${match.matchingID}`);

            const response = await api.post(`/deals_post/insert`, {
                matchingID: match.matchingID,
                deal_price: price,
                deal_procentage: percent,
            });
            console.log("response: ", response);
        } catch (err) {
            console.error(err);
        }

        showModal();
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
                        {/* <TextInput /> */}
                        <InputText
                            headerText={"Priset på dealen"}
                            placeholderText={"Priset på dealen"}
                            headerTextColor={"#000"}
                            keyboardTypeInput="numeric"
                            value={dealPrice}
                            setValue={setDealPrice}
                        />

                        <InputText
                            headerText={"Säljs procent på dealen"}
                            placeholderText={"Procent på dealen"}
                            headerTextColor={"#000"}
                            keyboardTypeInput="number-pad"
                            value={dealProcent}
                            setValue={setDealProcent}
                        />
                        {/* {item.img_url ? (
                            <ProfileCircle img_url={item.img_url} size={225} />
                        ) : (
                            <ProfileCircle
                                img_url={require("../assets/images/ceo.jpg")}
                                size={225}
                            />
                        )} */}
                    </View>

                    <Ionicons
                        onPress={showModal}
                        name="close"
                        size={55}
                        color="red"
                        style={styles.button_modal_close}
                    />

                    <TouchableOpacity
                        style={styles.button_modal_submit}
                        onPress={submitDeal}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                fontSize: 28,
                                color: "#FFF",
                            }}
                        >
                            {buttonText}
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
        width: "100%",

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
        backgroundColor: "rgba(11, 20, 157, 1)",
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
