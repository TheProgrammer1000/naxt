import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { KeyboardTypeOptions, StyleSheet, View } from "react-native";
import { colors } from "@/theme";

import { scale, verticalScale } from "react-native-size-matters";

type Props = {
    headerTextColor: string;
    headerText: string;
    placeholderText: string;
    keyboardTypeInput: KeyboardTypeOptions | null;
    value: string;
    setValue: (text: string) => void;
};

export default function InputText({
    headerText,
    headerTextColor,
    placeholderText,
    keyboardTypeInput,
    value,
    setValue,
}: Props) {
    return (
        <>
            <View style={styles.input_container}>
                <Text style={[styles.input_text, { color: headerTextColor }]}>
                    {headerText}
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder={placeholderText}
                    placeholderTextColor={"#000"}
                    value={value}
                    onChangeText={setValue}
                    // value={companyEmployees}
                    // onChangeText={setEmployees}

                    keyboardType={
                        keyboardTypeInput ? keyboardTypeInput : "default"
                    }
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        // borderColor: "rgba(255,255,255,0.4)",
        borderRadius: 5,
        // backgroundColor: "#0F253F",
        width: "100%",
        height: 48,
        paddingLeft: scale(10),
        color: "#000",
    },

    input_text: {
        fontSize: scale(18),
        marginBottom: verticalScale(5),
    },
    input_container: {
        marginTop: verticalScale(5),
        marginBottom: verticalScale(5),
        width: scale(320),
    },
});
