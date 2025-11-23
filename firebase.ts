import { initializeApp } from "firebase/app";
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
    initializeAuth,
    //@ts-ignore
    getReactNativePersistence,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
    apiKey              : "AIzaSyD4Ba1J5dMrVYkOx9k5MarkTb3NWJkEC5Y",
    authDomain          : "chatapp-7f98a.firebaseapp.com",
    projectId           : "chatapp-7f98a",
    storageBucket       : "chatapp-7f98a.firebasestorage.app",
    messagingSenderId   : "658266741364",
    appId               : "1:658266741364:android:a9cbe6f11377918a398f21"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;

export {
    auth,
    db,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
};