// lib/services/api.js
import { Platform } from "react-native";
import axios from "axios";

// din laptop’s LAN IPv4 address (behövs bara för fysiska enheter)
const MY_LAN_IP = "192.168.0.48";

const HOST = Platform.select({
    ios: "localhost", // iOS-simulator -> localhost
    android: "10.0.2.2", // Android emulator AVD -> 10.0.2.2
    default: "localhost",
});

// Om du testar på fysisk telefon, ändra till MY_LAN_IP:
// const HOST = Platform.select({ ios: MY_LAN_IP, android: MY_LAN_IP, default: MY_LAN_IP });

const baseURL = `http://${HOST}:3000`;
console.log("API Base URL:", baseURL);

// Skapa och exportera axios-instansen (detta var kommenterat i din första snutt)
export const api = axios.create({
    baseURL,
    timeout: 10000,
});
