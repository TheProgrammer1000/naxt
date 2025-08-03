import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    TextInput,
    Button,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import ChatStack from "@/components/ChatStack";

export default function CompanyChat() {
    return <ChatStack />;
}
