import { Link, useRouter } from "expo-router";
import {
    LogBox,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Button,
    Alert,
    Image,
} from "react-native";

import ProfilePicker from "@/components/ProfilePicker";

import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { colors } from "@/theme";
import { useState } from "react";
import { api } from "@/lib/services/api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/lib/redux/authSlice";
import { UserType } from "@/lib/redux/authSlice";

LogBox.ignoreAllLogs(true);

export default function Register() {
    const [showPassword, setShowPassword] = useState(true);
    const [showForCompany, setShowForCompany] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    const dispatch = useDispatch();

    const [userType, setUserType] = useState<UserType>("investor");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const onImagePicked = (uri: string) => {
        console.log("uri: ", uri);
        setSelectedImage(uri);
    };

    const uploadUserImage = async (userID: number, fileUri: string) => {
        const formData = new FormData();
        formData.append("image", {
            uri: fileUri,
            name: `user_${userID}.jpg`, // adjust extension as needed
            type: "image/jpeg",
        } as any);

        const res = await api.post(`/users/img_url/${userID}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data.img_url; // The URL you can use to display the image
    };

    const onRegister = async () => {
        try {
            const res = await api.post("/users/register", {
                email,
                password,
                type: userType,
                name,
            });

            const userId = res.data.userId;

            // Upload the image only if selectedImage exists
            if (selectedImage) {
                const uploadedImgUrl = await uploadUserImage(
                    userId,
                    selectedImage
                );
                console.log("Uploaded image URL:", uploadedImgUrl);
                // Optionally, you can save this URL to Redux or state if needed
            }

            dispatch(
                loginSuccess({
                    userId: userId,
                    userType: userType,
                })
            ); // ⭐️

            if (userType == "investor") {
                router.replace("/(investor)/match");
            } else if (userType == "company") {
                router.replace("/(company)/post");
            }
        } catch (err: any) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "Något gick fel. Kontrollera dina uppgifter och försök igen.";
            Alert.alert("Fel vid inloggning", message);
        } finally {
        }
    };

    return (
        <View style={styles.full_container}>
            {showForCompany ? (
                <View style={styles.login_container}>
                    <TouchableOpacity
                        style={styles.header_company_container}
                        onPress={() => {
                            setShowForCompany(!showForCompany);
                            setUserType("investor");
                        }}
                    >
                        <Text style={styles.header_company_text}>
                            För entreprenör
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.header_text}>
                        Registrera för företag
                    </Text>

                    <View style={styles.profile_picker_container}>
                        <ProfilePicker onImagePicked={onImagePicked} />
                    </View>

                    <View style={styles.input_container}>
                        <TextInput
                            style={styles.input}
                            placeholder="Namn"
                            inputMode={"text"}
                            placeholderTextColor="#888"
                            onChange={(e) => setName(e.nativeEvent.text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="E-post"
                            inputMode={"email"}
                            placeholderTextColor="#888"
                            onChange={(e) => setEmail(e.nativeEvent.text)}
                        />

                        <View style={styles.password_container}>
                            <TextInput
                                style={styles.input}
                                placeholder="Lösenord"
                                inputMode={"text"}
                                secureTextEntry={showPassword}
                                placeholderTextColor="#888"
                                onChange={(e) =>
                                    setPassword(e.nativeEvent.text)
                                }
                            />
                            <TouchableOpacity
                                style={styles.toggle}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text style={styles.toggleText}>Visa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity>
                        <Text style={styles.footer_text}>
                            Problem att logga in?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.7}
                        onPress={onRegister}
                    >
                        <Text style={styles.button_text}>Registera</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.login_container}>
                    <TouchableOpacity
                        style={styles.header_company_container}
                        onPress={() => {
                            setShowForCompany(!showForCompany);
                            setUserType("company");
                        }}
                    >
                        <Text style={styles.header_company_text}>
                            För företag
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.header_text}>
                        Registrera som entreprenör
                    </Text>

                    <View style={styles.profile_picker_container}>
                        <ProfilePicker onImagePicked={onImagePicked} />
                    </View>

                    <View style={styles.input_container}>
                        <TextInput
                            style={styles.input}
                            placeholder="Namn"
                            inputMode={"text"}
                            placeholderTextColor="#888"
                            onChange={(e) => setName(e.nativeEvent.text)}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="E-post"
                            inputMode={"email"}
                            placeholderTextColor="#888"
                            onChange={(e) => setEmail(e.nativeEvent.text)}
                        />

                        <View style={styles.password_container}>
                            <TextInput
                                style={styles.input}
                                placeholder="Lösenord"
                                inputMode={"text"}
                                secureTextEntry={showPassword}
                                placeholderTextColor="#888"
                                onChange={(e) =>
                                    setPassword(e.nativeEvent.text)
                                }
                            />
                            <TouchableOpacity
                                style={styles.toggle}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text style={styles.toggleText}>Visa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity>
                        <Text style={styles.footer_text}>
                            Problem att logga in?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.7}
                        onPress={onRegister}
                    >
                        <Text style={styles.button_text}>Registera</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity onPress={() => router.push("/")}>
                <Text>Har du redan konto? Logga in</Text>
            </TouchableOpacity>
        </View>
    );
}

const CIRCLE_SIZE = 60;

const styles = StyleSheet.create({
    full_container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    login_container: {
        gap: 25,
        position: "relative",
        width: scale(320),
        padding: 15,
        // borderWidth: 1,
        // borderColor: "#000",
    },

    header_text: {
        fontSize: 50,
        textAlign: "center",
    },

    header_company_container: {
        borderColor: "#FFF",
        borderWidth: 2,
        padding: 10,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30,
        backgroundColor: colors.primary_color.dark_blue,
    },

    header_company_text: {
        color: "#FFF",
        fontSize: 25,
    },

    profile_picker_container: {
        justifyContent: "center",
        alignItems: "center",
    },

    circle_container: {
        justifyContent: "center",
        alignItems: "center",
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderRadius: CIRCLE_SIZE / 2,
    },

    input_container: {
        gap: 30,
    },

    input: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.2)",
        borderRadius: 5,
        width: "100%",
        height: 48,
        paddingLeft: scale(10),
    },

    password_container: {
        position: "relative",
        justifyContent: "center",
        alignItems: "flex-end",
    },

    toggle: {
        position: "absolute",
        right: scale(10),
    },

    toggleText: {
        fontSize: 16,
    },

    footer_text: {
        textAlign: "center",
        fontSize: 20,
    },

    button: {
        backgroundColor: "#000",
        height: verticalScale(50),
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    button_text: {
        color: "#FFF",
    },
});
