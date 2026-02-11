
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSy-ROCHEDO-MARMORARIA-DEMO-KEY",
  authDomain: "rochedo-marmoraria.firebaseapp.com",
  projectId: "rochedo-marmoraria",
  storageBucket: "rochedo-marmoraria.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inicializa o app apenas se ainda não houver um
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// O getAuth deve ser chamado após a inicialização do app
export const auth = getAuth(app);
