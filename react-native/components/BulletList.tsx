import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { StyleSheet } from "react-native";

export default function BulletList() {
    const [textList, setTextList] = useState<string[]>([
        "bla bla bladwadwadwad",
        "bla bla blaawdawdawad",
        "bla bla blaawdadwadawad",
    ]);

    return textList.map((text, i) => (
        <Text key={i} style={styles.bullet}>
            {"\u2022 "}
            {text}
        </Text>
    ));
}

const styles = StyleSheet.create({
    bullet: {
        color: "white",
        fontSize: 16,
        lineHeight: 22,
    },
});
