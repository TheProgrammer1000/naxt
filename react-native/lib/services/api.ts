import { Platform } from "react-native";
import axios from "axios";

// your laptop’s LAN IPv4 address:
const MY_LAN_IP = "192.168.0.48";

const HOST = Platform.select({
    ios: MY_LAN_IP, // physical iPhone → use your LAN IP
    android: "10.0.2.2", // Android emulator
    default: MY_LAN_IP, // Android device or any other platform
});

const baseURL = `http://${HOST}:3000`;
console.log("API Base URL:", baseURL);

export const api = axios.create({
    baseURL: "https://d2f6a279802b.ngrok-free.app",
});
