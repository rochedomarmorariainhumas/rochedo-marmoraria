
// Fix: Re-importing modular Firebase functions to resolve 'no exported member' errors
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy-ROCHEDO-MARMORARIA-DEMO-KEY",
  authDomain: "rochedo-marmoraria.firebaseapp.com",
  projectId: "rochedo-marmoraria",
  storageBucket: "rochedo-marmoraria.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Fix: Correctly initialize Firebase app checking for existing instances to avoid 'duplicate app' errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
