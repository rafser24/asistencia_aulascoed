/**
 * pages/Login.jsx
 * Página de autenticación con Firebase Email/Password.
 * Redirige según el rol (admin → /admin/dashboard, alumno → /marcar).
 */

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { IconShield, IconEye, IconEyeOff, IconLoader } from "../components/common/Icons.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Si ya está logueado, redirigir según rol (isAdmin viene de Firestore via AuthContext)
  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin/dashboard" : "/marcar", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Verificar si el email está en la lista de admins (config/admins)
      const configDoc = await getDoc(doc(db, "config", "admins"));
      const adminEmails = configDoc.exists() ? (configDoc.data().emails || []) : [];
      const isAdminUser = adminEmails.includes(result.user.email);
      navigate(isAdminUser ? "/admin/dashboard" : "/marcar", { replace: true });
    } catch (err) {
      const messages = {
        "auth/user-not-found": "No existe una cuenta con este correo.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
        "auth/invalid-credential": "Credenciales incorrectas. Verifica tu correo y contraseña.",
      };
      setError(messages[err.code] || "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #05030f 0%, #0f0c29 40%, #1a0a3e 100%)",
      }}
    >
      {/* Orbes decorativos de fondo */}
      <div
        className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Card de login */}
      <div
        className="w-full max-w-md rounded-3xl p-8 animate-fade-in relative z-10"
        style={{
          background: "linear-gradient(145deg, #1a1035 0%, #110d2a 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.05)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
              boxShadow: "0 0 30px rgba(109,40,217,0.4)",
            }}
          >
            <IconShield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Asistencia COED</h1>
          <p className="text-purple-400 text-sm mt-1">Sistema Seguro de Control de Asistencia</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-purple-300 text-xs font-semibold">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
              className="rounded-xl px-4 py-3 text-sm text-white placeholder-purple-700 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(139,92,246,0.25)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(109,40,217,0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.25)")}
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-purple-300 text-xs font-semibold">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-purple-700 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(139,92,246,0.25)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(109,40,217,0.7)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.25)")}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-300 transition-colors"
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-red-300 animate-fade-in"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)" }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-98 disabled:opacity-60 mt-2"
            style={{
              background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
              boxShadow: "0 0 30px rgba(109,40,217,0.35)",
            }}
          >
            {submitting ? (
              <>
                <IconLoader />
                Verificando…
              </>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-purple-600 text-xs mt-6">
          Centro Educativo COED · Sistema de Asistencia v1.0
        </p>
      </div>
    </div>
  );
}
