/**
 * components/admin/AdminSidebar.jsx
 * Sidebar del panel admin con soporte de tema pastel claro/oscuro.
 */

import React from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme } from "../../theme.js";
import { IconShield, IconQR, IconUsers, IconLogout, IconCalendar } from "../common/Icons.jsx";

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function IconSettings() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}

const NAV_ITEMS = [
  { id: "metricas",      icon: <span>📈</span>,    label: "Métricas" },
  { id: "grados",        icon: <IconQR />,        label: "Gestión de QR" },
  { id: "alumnos",       icon: <IconUsers />,     label: "Alumnos" },
  { id: "historial",     icon: <IconCalendar />,  label: "Historial" },
  { id: "configuracion", icon: <IconSettings />,  label: "Configuración" },
];

export default function AdminSidebar({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const t = getTheme(isDark);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, height: "100vh", width: "256px",
      display: "flex", flexDirection: "column", zIndex: 20,
      background: isDark
        ? "linear-gradient(180deg, #150d3b 0%, #0a0818 100%)"
        : "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
      borderRight: `1px solid ${t.divider}`,
      transition: "background 0.3s",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px", borderBottom: `1px solid ${t.divider}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            background: isDark ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "linear-gradient(135deg, #a78bfa, #818cf8)",
            boxShadow: "0 4px 12px rgba(124,58,237,0.25)",
          }}>
            <IconShield style={{ color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, color: t.text, fontSize: "13px", margin: 0, lineHeight: 1.3 }}>Asistencia</p>
            <p style={{ color: t.textMuted, fontSize: "11px", margin: 0 }}>COED — Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 16px", borderRadius: "12px",
                fontSize: "13px", fontWeight: active ? 700 : 500,
                cursor: "pointer", border: "none", textAlign: "left",
                background: active
                  ? (isDark ? "rgba(124,58,237,0.22)" : "rgba(167,139,250,0.18)")
                  : "transparent",
                color: active ? (isDark ? "#c4b5fd" : "#7c3aed") : t.textMuted,
                borderLeft: active ? `3px solid ${isDark ? "#8b5cf6" : "#a78bfa"}` : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px", borderTop: `1px solid ${t.divider}` }}>
        {/* Toggle modo oscuro */}
        <button
          onClick={toggle}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 14px", borderRadius: "10px", marginBottom: "8px",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(109,40,217,0.06)",
            border: `1px solid ${t.divider}`,
            color: t.textMuted,
          }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          {isDark ? "Modo claro" : "Modo oscuro"}
        </button>

        {/* Perfil */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 800, color: "#fff", flexShrink: 0,
            background: isDark ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "linear-gradient(135deg, #a78bfa, #818cf8)",
          }}>
            {user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: t.text, margin: 0, lineHeight: 1.3 }}>Administrador</p>
            <p style={{ fontSize: "11px", color: t.textMuted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 12px", borderRadius: "10px",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
            background: isDark ? "rgba(220,38,38,0.08)" : "rgba(220,38,38,0.06)",
            border: "none",
            color: isDark ? "#f87171" : "#dc2626",
          }}
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
