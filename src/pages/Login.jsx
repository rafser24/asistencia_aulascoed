/**
 * pages/Login.jsx
 * Página de autenticación con soporte de tema pastel claro/oscuro.
 */

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getTheme } from "../theme.js";
import { IconShield, IconEye, IconEyeOff, IconLoader } from "../components/common/Icons.jsx";

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { isDark, toggle } = useTheme();
  const t = getTheme(isDark);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const inputStyle = {
    background: t.input,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: "12px",
    color: t.text,
    padding: "12px 16px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: isDark
          ? "linear-gradient(135deg, #0a0814 0%, #130e2a 50%, #0d0b1f 100%)"
          : "linear-gradient(135deg, #f5f0ff 0%, #ede9fe 50%, #fce7f3 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        transition: "background 0.3s",
      }}
    >
      {/* Botón modo oscuro — esquina superior derecha */}
      <button
        onClick={toggle}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px",
          borderRadius: "12px",
          border: `1px solid ${t.cardBorder}`,
          background: t.card,
          color: t.textMuted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: t.cardShadow,
          transition: "all 0.2s",
          zIndex: 100,
        }}
        title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Orbes decorativos */}
      <div style={{
        position: "fixed", top: "-10%", left: "-10%", width: "400px", height: "400px",
        borderRadius: "50%", pointerEvents: "none",
        background: isDark
          ? "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(196,165,253,0.3) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "fixed", bottom: "-15%", right: "-10%", width: "500px", height: "500px",
        borderRadius: "50%", pointerEvents: "none",
        background: isDark
          ? "radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(251,207,232,0.5) 0%, transparent 70%)",
      }} />

      {/* Card de login */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "28px",
          padding: "36px 32px",
          background: t.card,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: isDark
            ? "0 24px 60px rgba(0,0,0,0.5)"
            : "0 24px 60px rgba(109,40,217,0.1), 0 4px 16px rgba(0,0,0,0.06)",
          position: "relative",
          zIndex: 10,
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isDark
              ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
              : "linear-gradient(135deg, #a78bfa, #818cf8)",
            boxShadow: isDark
              ? "0 0 30px rgba(124,58,237,0.4)"
              : "0 8px 24px rgba(124,58,237,0.25)",
            margin: "0 auto 16px",
          }}>
            <IconShield className="w-8 h-8" style={{ color: "#fff", width: 32, height: 32 }} />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: t.text, margin: "0 0 4px" }}>
            Asistencia COED
          </h1>
          <p style={{ fontSize: "13px", color: t.textMuted, margin: 0 }}>
            Sistema Seguro de Control de Asistencia
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: t.textMuted, marginBottom: "6px" }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: t.textMuted, marginBottom: "6px" }}>
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: "44px" }}
                onFocus={(e) => (e.target.style.borderColor = t.accent)}
                onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: t.textMuted,
                  display: "flex", alignItems: "center",
                }}
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              borderRadius: "12px", padding: "12px 16px", fontSize: "13px",
              color: isDark ? "#fca5a5" : "#991b1b",
              background: t.errorBg, border: `1px solid ${t.errorBorder}`,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              fontSize: "14px", fontWeight: 700, color: "#fff",
              border: "none", cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              background: isDark
                ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                : "linear-gradient(135deg, #a78bfa, #818cf8)",
              boxShadow: isDark
                ? "0 0 24px rgba(124,58,237,0.35)"
                : "0 6px 20px rgba(124,58,237,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "4px", transition: "opacity 0.2s",
            }}
          >
            {submitting ? <><IconLoader /> Verificando…</> : "Ingresar al Sistema"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "11px", color: t.textFaint, marginTop: "24px" }}>
          Centro Educativo COED · Sistema de Asistencia v1.0
        </p>
      </div>
    </div>
  );
}
