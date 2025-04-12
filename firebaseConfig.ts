// firebaseConfig.js
// import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyBRR3W1FTf0u8DJA2pfGEchWT9Aty5lTAo",
//   authDomain: "group-chat-209ae.firebaseapp.com",
//   projectId: "group-chat-209ae",
//   storageBucket: "group-chat-209ae.firebasestorage.app",
//   messagingSenderId: "1091363075836",
//   appId: "1:1091363075836:web:df90e886f4500a4da5c979"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// export { auth, db };
// Import the functions you need from the SDKs you need
import { initializeApp , getApps, getApp } from "firebase/app";
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRR3W1FTf0u8DJA2pfGEchWT9Aty5lTAo",
  authDomain: "group-chat-209ae.firebaseapp.com",
  projectId: "group-chat-209ae",
  storageBucket: "group-chat-209ae.firebasestorage.app",
  messagingSenderId: "1091363075836",
  appId: "1:1091363075836:web:df90e886f4500a4da5c979"
};

// Initialize Firebase
// Only initialize once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// const auth = getAuth(app);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db };