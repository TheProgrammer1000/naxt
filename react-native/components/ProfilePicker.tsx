import { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Image } from "react-native";

// import ImagePicker from "react-native-image-crop-picker";
import { Ionicons } from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";

type Props = {
    onImagePicked: (uri: string) => void;
};

export default function ProfilePicker({ onImagePicked }: Props) {
    const [image, setImage] = useState("");

    const choosePhotoFromLibrary = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImageUri = result.assets[0].uri;
            console.log(result.assets[0].uri);
            setImage(selectedImageUri);
            onImagePicked(selectedImageUri);
        }

        //     console.warn("choose photo from gallery");

        //     ImagePicker.openPicker({
        //         width: 300,
        //         height: 400,
        //         cropping: false,
        //     }).then((image) => {
        //         console.log(image);
        //         setImage(image.path);
        //         onImagePicked(image.path);
        //     });
    };

    return (
        <TouchableOpacity onPress={choosePhotoFromLibrary}>
            {image ? (
                <Image
                    source={{ uri: image }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                    }}
                />
            ) : (
                <View
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: "rgba(0,0,0,0.2)", // same as image background
                        justifyContent: "center",
                        alignItems: "center",
                        borderColor: "rgba(0,0,0,0.1)",
                        borderWidth: 1,
                    }}
                >
                    <Ionicons
                        name="person"
                        size={40}
                        color="rgba(0,0,0,0.75)"
                    />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({});
