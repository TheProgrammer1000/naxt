import React, { useState, useMemo } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { colors } from "@/theme";
import { scale, verticalScale } from "react-native-size-matters";
import { api } from "@/lib/services/api";

import ProfilePicker from "@/components/ProfilePicker";

import { useAppSelector } from "@/lib/redux/store"; // typed hook
import { selectUserId } from "@/lib/redux/authSlice"; // selector

export default function PostScreen() {
    const userID = useAppSelector(selectUserId);
    const [selectedImage, setSelectedImage] = useState("");

    const [companyName, setCompanyName] = useState("");
    const [companyCity, setCity] = useState("");
    const [companyEmployees, setEmployees] = useState("");
    const [companyIndustry, setIndustry] = useState("");
    const [companyDescription, setDescription] = useState("");

    const clearForm = () => {
        setCompanyName("");
        setCity("");
        setEmployees("");
        setIndustry("");
        setDescription("");
        setSelectedImage("");
    };

    const onImagePicked = (uri: string) => {
        console.log("uri: ", uri);
        setSelectedImage(uri);
    };

    // 1) Rename your upload helper to target companies
    const uploadCompanyImage = async (
        companyID: number,
        fileUri: string
    ): Promise<string> => {
        const formData = new FormData();
        formData.append("image", {
            uri: fileUri,
            name: `company_${companyID}.jpg`,
            type: "image/jpeg",
        } as any);

        // NOTE: make sure it’s ASCII hyphens here:
        const res = await api.post(`/company/img_url/${companyID}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data.img_url; // "/uploads/company_<id>.jpg"
    };
    /**
     * A form is considered valid when every field has a non‑empty value.
     * useMemo prevents recalculating on every render unless one of the
     * dependencies changes.
     */
    const isFormValid = useMemo(
        () =>
            [
                companyName,
                companyCity,
                companyEmployees,
                companyIndustry,
                companyDescription,
            ].every((v) => v.trim().length > 0),
        [
            companyName,
            companyCity,
            companyEmployees,
            companyIndustry,
            companyDescription,
        ]
    );

    const handleSubmit = async () => {
        if (!isFormValid) {
            return Alert.alert("Obligatoriska fält saknas", "...");
        }

        let companyID: number;
        try {
            const { data } = await api.post("/company_post", {
                userIDCompany: userID,
                company_name: companyName,
                company_city: companyCity,
                company_employees: Number(companyEmployees),
                company_industry: companyIndustry,
                description: companyDescription,
            });
            companyID = data.result.insertId;
        } catch (e) {
            return Alert.alert(
                "Fel vid skapande",
                "Kunde inte skapa din pitch."
            );
        }

        if (selectedImage) {
            const formData = new FormData();
            formData.append("image", {
                uri: selectedImage,
                name: `company_${companyID}.jpg`,
                type: "image/jpeg",
            } as any);

            try {
                await api.post(`/company_post/img_url/${companyID}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } catch (e) {
                console.warn("Bild kunde inte laddas upp:", e);
                // you can optionally inform the user, but do NOT abort here
            }
        }

        clearForm();
        Alert.alert("Inskickat", "Ditt inlägg har skickats!");
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            // Adjust this offset if you have a header / tab bar
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scroll_container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.post_container}>
                    <Text style={styles.header_text}>Skapa din pitch</Text>

                    <View style={styles.image_picked_container}>
                        <ProfilePicker onImagePicked={onImagePicked} />
                    </View>
                    {/* Företagsnamn */}
                    <View style={styles.input_container}>
                        <Text style={styles.input_text}>Företag namn</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Företag namn"
                            placeholderTextColor="#888"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>

                    {/* Stad */}
                    <View style={styles.input_container}>
                        <Text style={styles.input_text}>Företagets stad</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Företag stad"
                            placeholderTextColor="#888"
                            value={companyCity}
                            onChangeText={setCity}
                        />
                    </View>

                    {/* Anställda */}
                    <View style={styles.input_container}>
                        <Text style={styles.input_text}>Antal anställda</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Antal anställda"
                            placeholderTextColor="#888"
                            value={companyEmployees}
                            onChangeText={setEmployees}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Industri */}
                    <View style={styles.input_container}>
                        <Text style={styles.input_text}>Industry</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Industry"
                            placeholderTextColor="#888"
                            value={companyIndustry}
                            onChangeText={setIndustry}
                        />
                    </View>

                    {/* Beskrivning */}
                    <View style={styles.input_container}>
                        <Text style={styles.input_text}>Din pitch</Text>
                        <TextInput
                            style={[styles.input, styles.textarea]}
                            multiline
                            placeholder="Beskrivning..."
                            placeholderTextColor="#888"
                            value={companyDescription}
                            onChangeText={setDescription}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                    >
                        <Text>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: colors.primary_color.light_blue,
        padding: 5,
    },

    scroll_container: {
        paddingVertical: verticalScale(20),
        alignItems: "center", // centers card horizontally
        flexGrow: 1, // allows ScrollView to take full height and scroll when needed
    },

    post_container: {
        gap: 15,
        width: scale(320),
        padding: 30,
    },

    header_text: {
        fontSize: scale(32), // slightly smaller so it won't push the form too far down
        textAlign: "center",
        marginBottom: verticalScale(10),
        color: colors.primary_color.light_golden,
    },

    image_picked_container: {
        justifyContent: "center",
        alignItems: "center",
    },

    input_container: {
        marginBottom: verticalScale(5),
    },

    input: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
        borderRadius: 5,
        backgroundColor: "#0F253F",
        width: "100%",
        height: 48,
        paddingLeft: scale(10),
        color: "#FFF",
    },

    textarea: {
        height: verticalScale(100),
        textAlignVertical: "top",
    },

    input_text: {
        fontSize: scale(18),
        color: colors.primary_color.light_golden,
        marginBottom: verticalScale(5),
    },

    button: {
        borderRadius: 5,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#C6B8A2",
    },
});
