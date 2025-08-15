import { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Image,
} from "react-native";
import { api } from "@/lib/services/api";
import { UserCompanyMatch } from "@/lib/types/userCompanyMatch";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/lib/redux/store";
import { selectUserId } from "@/lib/redux/authSlice";
import ModalPopup from "@/components/ModalPopup";
// import { baseURL } from "@/lib/services/api";

import { useIsFocused } from "@react-navigation/native";

export default function MatchesScreen() {
    const isFocused = useIsFocused();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<UserCompanyMatch | null>(
        null
    );
    const [likedCompanyList, setLikedCompanyList] = useState<
        UserCompanyMatch[]
    >([]);

    const userID = useAppSelector(selectUserId);

    const fetchLikedCompanies = async () => {
        try {
            const result = await api.get<UserCompanyMatch[]>(
                `/matching/likes/${userID}`
            );

            console.log("result.data: ", result.data);
            const sanitized = result.data.map((d) => ({
                ...d,
                // unify into img_url (fallback to CEO placeholder)
                imageUserUrl: d.imageUserUrl ?? "/uploads/ceo.jpg",
            }));

            console.log("sanitized: ", sanitized);

            setLikedCompanyList(sanitized);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (userID && isFocused) {
            fetchLikedCompanies();
        }
    }, [userID, isFocused]);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Mina matchningar</Text>

            <FlatList
                data={likedCompanyList}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.scrollContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.saved_company_arrow_container}
                        onPress={() => {
                            setSelectedMatch(item);
                            setModalVisible(true);
                        }}
                    >
                        <View style={styles.saved_company_container}>
                            <View style={styles.circle_container}>
                                {/* ← Use img_url here! */}
                                <Image
                                    source={{
                                        uri: `${api.defaults.baseURL}${item.imageUserUrl}`,
                                    }}
                                    style={styles.image}
                                    onError={(e) =>
                                        console.warn(
                                            "Image load error",
                                            e.nativeEvent
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.saved_company_text_container}>
                                <Text style={styles.saved_company_header_text}>
                                    {item.name} är intresserad
                                </Text>
                                <Text>
                                    i din pitch för ({item.company_name})
                                </Text>
                            </View>
                            <Ionicons size={24} name="arrow-forward" />
                        </View>
                    </TouchableOpacity>
                )}
            />

            {selectedMatch && (
                <ModalPopup
                    showModal={() => setModalVisible(false)}
                    modalVisible={modalVisible}
                    item={selectedMatch}
                    fetchLikedCompanies={fetchLikedCompanies}
                />
            )}
        </View>
    );
}

const width = 60;
const height = 60;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    text: {
        color: "#000",
        fontSize: 36,
        marginBottom: 20,
        marginTop: 30,
        textAlign: "center",
    },
    saved_company_container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 15,
        padding: 10,
    },
    scrollContainer: {
        padding: 10,
        paddingBottom: 40,
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
        paddingRight: 10,
    },
    circle_container: {
        justifyContent: "center",
        alignItems: "center",
        width: width,
        height: height,
        borderRadius: (width + height) / 2,
    },
    image: {
        width: width,
        height: height,
        borderRadius: (width + height) / 2,
    },
});
