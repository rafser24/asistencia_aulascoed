/**
 * context/AuthContext.jsx
 * Gestión global del estado de autenticación Firebase.
 * Expone: user, loading, isAdmin
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase.js";

const AuthContext = createContext(null);

// ── Emails con acceso de administrador ──────────────────────────────────────
const ADMIN_EMAILS = [
  "rafael.francisco.serrano@clases.edu.sv",
];

export function AuthProvider({ children }) {
  // undefined = todavía cargando | null = no logueado | objeto = logueado
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // 1. Verificar primero contra la lista local (funciona sin Firestore)
        if (ADMIN_EMAILS.includes(firebaseUser.email)) {
          setIsAdmin(true);
        } else {
          // 2. Fallback: verificar en Firestore config/admins
          try {
            const configDoc = await getDoc(doc(db, "config", "admins"));
            const adminEmails = configDoc.exists() ? (configDoc.data().emails || []) : [];
            setIsAdmin(adminEmails.includes(firebaseUser.email));
          } catch {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { user, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook para consumir el contexto de autenticación */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
