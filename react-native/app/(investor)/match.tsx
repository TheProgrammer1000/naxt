import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Animated,
    Image,
    ImageBackground,
    Alert,
    Button,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/theme";
import BulletList from "@/components/BulletList";
import { api } from "@/lib/services/api";
import { CompanyPost } from "@/lib/types/company";
import { useAppSelector } from "@/lib/redux/store";
import { selectUserId } from "@/lib/redux/authSlice";
import { baseURLDev } from "@/lib/services/api";
import { useDispatch } from "react-redux";

const CIRCLE_SIZE = scale(70);

export default function MatchScreen() {
    const userIDInvestor = useAppSelector(selectUserId);
    const dispatch = useDispatch();

    const [showCard, setShowCard] = useState(true);
    const [flipped, setFlipped] = useState(false);
    const flipAnim = useRef(new Animated.Value(0)).current;

    const [posts, setPosts] = useState<CompanyPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPostIndex, setcurrentPostIndex] = useState(0);

    const getImageSource = (uri?: string) => {
        if (!uri) return undefined;
        if (uri.startsWith("http") || uri.startsWith("file://")) {
            return { uri };
        }
        return { uri: `${baseURLDev}${uri}` };
    };

    // Shared fetch function
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<CompanyPost[]>("/company_post");
            setPosts(res.data);
            setcurrentPostIndex(0);
            setShowCard(true);
        } catch (err: any) {
            console.error("fetchPosts error response:", err.response);
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const goNext = () => {
        if (currentPostIndex < posts.length - 1) {
            setcurrentPostIndex(currentPostIndex + 1);
            if (flipped) flipCard();
        } else {
            setShowCard(false);
        }
    };

    const saveCompany = async (companyID: number) => {
        try {
            await api.post("matching/saved", {
                userIDInvestor,
                companyID,
                saved: 1,
            });
            Alert.alert("Saved!", "Du har sparat företaget.");
        } catch (err: any) {
            console.error("saveCompany error:", err.response);
            const message =
                err.response?.data?.message || "Något gick fel. Försök igen.";
            Alert.alert("Fel", message);
        }
    };

    const likeCompany = async (companyID: number) => {
        try {
            await api.post("matching/likes", {
                userIDInvestor,
                companyID,
                likes: 1,
            });
            Alert.alert("Liked!", "Du har gillat företaget.");
        } catch (err: any) {
            console.error("likeCompany error:", err.response);
            const message =
                err.response?.data?.message || "Något gick fel. Försök igen.";
            Alert.alert("Fel", message);
        }
    };

    const flipCard = () => {
        setFlipped(!flipped);
        Animated.timing(flipAnim, {
            toValue: flipped ? 0 : 180,
            duration: 600,
            useNativeDriver: true,
        }).start();
    };

    const frontRotate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ["0deg", "180deg"],
    });
    const backRotate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ["180deg", "360deg"],
    });

    if (loading)
        return (
            <View style={styles.container}>
                <Text>Loading…</Text>
            </View>
        );
    if (error)
        return (
            <View style={styles.container}>
                <Text>Oops—något gick fel: {error}</Text>
            </View>
        );

    // No posts or end of deck
    if (posts.length === 0 || currentPostIndex >= posts.length)
        return (
            <View style={styles.container}>
                <Text style={{ color: "#FFF", fontSize: 26 }}>
                    Slut på företag att visa!
                </Text>
                <Button
                    title="Hämta igen"
                    onPress={fetchPosts}
                    disabled={loading}
                />
            </View>
        );

    const post = posts[currentPostIndex];

    return (
        <View style={styles.container}>
            {showCard && (
                <>
                    <Pressable onPress={flipCard} key={post.companyID}>
                        {/* Front side */}
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    transform: [
                                        { perspective: 1000 },
                                        { rotateY: frontRotate },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.rectangle_container}>
                                <View style={styles.circle_container}>
                                    {post.imageCompanyUrl ? (
                                        <Image
                                            source={getImageSource(
                                                post.imageCompanyUrl
                                            )}
                                            style={styles.image}
                                            onError={(e) =>
                                                console.warn(
                                                    "Image load failed",
                                                    e.nativeEvent
                                                )
                                            }
                                        />
                                    ) : (
                                        <Text>No image</Text>
                                    )}
                                </View>
                            </View>
                            <Text style={styles.header_text}>
                                {post.company_name}
                            </Text>
                            <Text style={styles.paragraph_text}>
                                {post.description}
                            </Text>
                            <Text style={styles.employee_text}>
                                {post.company_employees} employees ·{" "}
                                {post.company_city}
                            </Text>
                            <Text style={styles.cardFlipBackText}>
                                Tap to flip ↺
                            </Text>
                        </Animated.View>
                        {/* Back side */}
                        <Animated.View
                            style={[
                                styles.card,
                                styles.cardBack,
                                {
                                    position: "absolute",
                                    top: 0,
                                    transform: [
                                        { perspective: 1000 },
                                        { rotateY: backRotate },
                                    ],
                                },
                            ]}
                        >
                            <View style={{ width: "100%" }}>
                                <ImageBackground
                                    source={
                                        post.imageUserUrl
                                            ? {
                                                  uri: `${baseURLDev}${post.imageUserUrl}`,
                                              }
                                            : require("../../assets/images/ceo.jpg")
                                    }
                                    style={styles.cardImage}
                                    imageStyle={styles.cardImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.captionBar}>
                                    <Text style={styles.captionTextHeader}>
                                        {post.name}
                                    </Text>
                                    <Text
                                        style={{ fontSize: 24, color: "#FFF" }}
                                    >
                                        ceo
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardContent}>
                                <View style={{ marginBottom: 20 }}>
                                    <Text
                                        style={{ color: "white", fontSize: 24 }}
                                    >
                                        {post.company_industry}
                                    </Text>
                                    <Text
                                        style={{ color: "white", fontSize: 16 }}
                                    >
                                        {post.company_name}
                                    </Text>
                                </View>
                                <BulletList />
                                <Text style={styles.cardFlipBackText}>
                                    Tap to flip ↺
                                </Text>
                            </View>
                        </Animated.View>
                    </Pressable>

                    <View style={styles.icon_container}>
                        <Pressable onPress={goNext}>
                            <View style={styles.circle_container}>
                                <FontAwesome
                                    name="close"
                                    size={35}
                                    color={colors.primary_color.dark_blue}
                                />
                            </View>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                saveCompany(post.companyID);
                                goNext();
                            }}
                        >
                            <View style={styles.circle_container}>
                                <FontAwesome5
                                    name="bookmark"
                                    size={35}
                                    color={colors.primary_color.dark_blue}
                                />
                            </View>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                likeCompany(post.companyID);
                                goNext();
                            }}
                        >
                            <View style={styles.circle_container}>
                                <FontAwesome
                                    name="heart"
                                    size={35}
                                    color={colors.primary_color.dark_blue}
                                />
                            </View>
                        </Pressable>
                    </View>
                </>
            )}
            {/* Refresh button */}
            <View style={styles.refreshContainer}>
                <Button
                    title="Refresh Posts"
                    onPress={fetchPosts}
                    disabled={loading}
                />
            </View>
        </View>
    );
}

const width = 80;
const height = 80;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.screen,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        justifyContent: "center",
        alignItems: "center",
        width: scale(275),
        height: scale(450),
        backgroundColor: colors.background.cardFrontPage,
        borderRadius: 18,
        backfaceVisibility: "hidden",
    },
    cardImage: {
        overflow: "hidden",
        width: "100%",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        height: verticalScale(220),
    },
    cardBack: { backgroundColor: colors.background.cardFrontPage ?? "#123" },
    cardContent: { flex: 1, justifyContent: "center" },
    image: { width: width, height: height, borderRadius: (width + height) / 2 },
    captionBar: {
        backgroundColor: "rgba(0,0,0,0.1)",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 6,
        paddingLeft: 15,
    },
    captionTextHeader: { color: "#fff", fontSize: 34, fontWeight: "600" },
    cardFlipBackText: { color: "white", textAlign: "center", marginTop: 20 },
    header_text: {
        textAlign: "center",
        color: colors.text.golden,
        marginBottom: verticalScale(20),
        fontSize: 32,
    },
    paragraph_text: {
        textAlign: "center",
        color: colors.text.golden,
        fontSize: 16,
        marginBottom: verticalScale(20),
    },
    employee_text: {
        textAlign: "center",
        fontSize: 16,
        color: colors.text.golden,
    },
    icon_container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: scale(20),
    },
    circle_container: {
        justifyContent: "center",
        alignItems: "center",
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        backgroundColor: colors.primary_color.golden,
        borderRadius: CIRCLE_SIZE / 2,
    },
    rectangle_container: {
        justifyContent: "center",
        alignItems: "center",
        width: scale(60),
        height: scale(60),
        padding: 5,
        backgroundColor: colors.primary_color.dark_blue,
        borderRadius: CIRCLE_SIZE / 4,
        marginBottom: scale(20),
    },
    refreshContainer: { marginTop: scale(15) },
});
