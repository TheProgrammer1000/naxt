import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { StyleSheet, View, Image } from "react-native";

import { baseURLDev } from "@/lib/services/api";

type Props = {
    img_url: string;
    size: number;
};

export default function ProfileCircle({ img_url, size }: Props) {
    return (
        <View
            style={[
                styles.circle_container,
                { width: size, height: size, borderRadius: size + size / 2 },
            ]}
        >
            {img_url ? (
                <Image
                    source={{
                        uri: `${baseURLDev}${img_url}`,
                    }}
                    style={[
                        {
                            width: size,
                            height: size,
                            borderRadius: size + size / 2,
                        },
                    ]}
                    onError={(e) =>
                        console.warn("Image load error", e.nativeEvent)
                    }
                />
            ) : (
                <Text>No image!</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    circle_container: {
        justifyContent: "center",
        alignItems: "center",
    },
});
