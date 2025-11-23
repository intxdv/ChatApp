import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    CollectionReference,
    DocumentData,
} from "firebase/firestore";

import {
    getAuth,
    // signInAnonymously,
    initializeAuth,
    //@ts-ignore
    getReactNativePersistence,
    signInWithEmailAndPassword, //buat login
    createUserWithEmailAndPassword, //buat register
    onAuthStateChanged,
    applyActionCode,
} from "firebase/auth";

const firebaseConfig = {
    apiKey              : "AIzaSyD4Ba1J5dMrVYkOx9k5MarkTb3NWJkEC5Y",
    authDomain          : "com.chatapp",
    projectId           : "chatapp-7f98a",
    storageBucket       : "chatapp-7f98a.firebasestorage.app",
    messagingSenderId   : "“658266741364",
    appID               : "1:658266741364:android:a9cbe6f11377918a398f21"
};
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;

export {
    auth,
    db,
    storage,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    // signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
};