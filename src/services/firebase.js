/**
 * services/firebase.js
 * Inicialización única de Firebase para toda la aplicación.
 * Las credenciales vienen de variables de entorno Vite (.env).
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// App secundaria para crear usuarios sin cerrar sesión del admin
import { getApp as _getApp } from "firebase/app";
let _secondaryAuth = null;
export function getSecondaryAuth() {
  if (_secondaryAuth) return _secondaryAuth;
  try {
    _secondaryAuth = getAuth(_getApp("secondary"));
  } catch {
    const secondaryApp = initializeApp(firebaseConfig, "secondary");
    _secondaryAuth = getAuth(secondaryApp);
  }
  return _secondaryAuth;
}

export default app;
