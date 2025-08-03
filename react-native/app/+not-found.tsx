import { StyleSheet, Text, View } from "react-native";

import { Stack } from "expo-router";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops! Not Found" }} />
            <View style={styles.container}>
                <Text style={styles.text}>EROOOR PAGE</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
        alignItems: "center",
        justifyContent: "center",
    },

    text: {
        color: "#fff",
    },
});
