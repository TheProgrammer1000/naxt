import {
    StyleSheet,
    Text,
    View,
    Pressable,
    ImageBackground,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { api } from "@/lib/services/api";

import { Ionicons } from "@expo/vector-icons";

import { SavedCompany } from "@/lib/types/savedCompany";
import { FontAwesome } from "@expo/vector-icons";

import { useAppSelector } from "@/lib/redux/store"; // typed hook
import { selectUserId } from "@/lib/redux/authSlice"; // selector
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

const height = 75;
const width = 75;

export default function bookmarkScreen() {
    const [savedList, setSavedList] = useState<SavedCompany[]>([]);

    const userID = useAppSelector(selectUserId);

    // ✅ Refetch when screen is focused
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchSaved = async () => {
                try {
                    const result = await api.get(
                        `/matching/getSaved/${userID}`
                    );
                    if (isActive) {
                        const dataList = result.data;
                        setSavedList(dataList);
                    }
                } catch (err) {
                    console.error("Error fetching saved companies: ", err);
                }
            };

            fetchSaved();

            return () => {
                isActive = false; // cleanup
            };
        }, [userID])
    );
    const onDelete = async (companyID: number) => {
        try {
            await api.delete(`/matching/deleteSaved/${companyID}`);

            // Update the local state
            setSavedList((prevList) =>
                prevList.filter((item) => item.companyID !== companyID)
            );
        } catch (err) {
            console.error(err);
            Alert.alert("Error on Delete", "Unsuccessfully deleted!");
        }
    };

    return (
        <View style={styles.container}>
            {savedList.length > 0 ? (
                savedList.map((saved, index) => {
                    return (
                        <View
                            key={index}
                            style={styles.saved_company_container}
                        >
                            <View style={styles.circle_container}>
                                <Image
                                    source={require("../../assets/images/ceo.jpg")}
                                    style={styles.image}
                                />
                            </View>
                            <View style={styles.saved_company_text_container}>
                                <Text style={styles.saved_company_header_text}>
                                    {saved.company_name}
                                </Text>
                                <Text>
                                    ({saved.company_industry}) anställda{" "}
                                    {saved.company_employees}
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <Ionicons
                                    size={24}
                                    name={"close"}
                                    color={"red"}
                                    style={{
                                        marginRight: 20,
                                        // borderWidth: 2,
                                        borderColor: "red",
                                    }}
                                    onPress={() => onDelete(saved.companyID)}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saved_company_arrow_container}
                            >
                                <Ionicons size={24} name={"arrow-forward"} />
                            </TouchableOpacity>
                        </View>
                    );
                })
            ) : (
                <Text style={{ fontSize: 30 }}>Här var det tomt</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    saved_company_container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 15,
        padding: 10,
    },

    saved_company_text_container: {
        paddingLeft: 15,
        gap: 10,
        flex: 1,
    },

    saved_company_header_text: {
        fontSize: 26,
    },

    saved_company_arrow_container: {
        paddingRight: 20,
    },
    circle_container: {
        justifyContent: "center",
        alignItems: "center",
        width: width,
        height: height,
        borderRadius: width + height / 2,
    },

    image: {
        width: width,
        height: height,
        borderRadius: width + height / 2,
    },
});
