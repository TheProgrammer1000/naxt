// firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// Copy these from your Firebase console (Project settings → SDK setup):
const firebaseConfig = {
    apiKey: "AIzaSyDkBQEmb_yOQgYi5WPBC2vUNx-yXpCfxQg",
    authDomain: "naxt-4879a.firebaseapp.com",
    projectId: "naxt-4879a",
    storageBucket: "naxt-4879a.appspot.com", // <- make sure this is “.appspot.com”
    messagingSenderId: "666445075168",
    appId: "1:666445075168:web:567ac57bfd7df898b1b685",
    measurementId: "G-FZX83RG05B",
};

// Initialize (or retrieve) the default App only once
const app: FirebaseApp = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();

// Now initialize the services you need
export const db: Firestore = getFirestore(app);
