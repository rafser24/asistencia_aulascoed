/**
 * components/admin/AdminSidebar.jsx
 * Sidebar de navegación del panel administrativo.
 */

import React from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  IconShield,
  IconQR,
  IconUsers,
  IconLogout,
  IconCalendar,
} from "../common/Icons.jsx";

const NAV_ITEMS = [
  { id: "grados",    icon: <IconQR />,       label: "Gestión de QR" },
  { id: "alumnos",   icon: <IconUsers />,    label: "Alumnos" },
  { id: "historial", icon: <IconCalendar />, label: "Historial" },
];

export default function AdminSidebar({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20"
      style={{
        background: "linear-gradient(180deg, #150d3b 0%, #0a0818 100%)",
        borderRight: "1px solid rgba(139,92,246,0.12)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="p-6"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
          >
            <IconShield />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Asistencia</p>
            <p className="text-purple-400 text-xs">COED — Admin Panel</p>
          </div>
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
              style={{
                background: active ? "rgba(109,40,217,0.28)" : "transparent",
                color: active ? "#c4b5fd" : "#6b5fa0",
                border: active
                  ? "1px solid rgba(109,40,217,0.4)"
                  : "1px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Perfil + logout ── */}
      <div
        className="p-4"
        style={{ borderTop: "1px solid rgba(139,92,246,0.12)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
          >
            {user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold leading-tight truncate">
              Administrador
            </p>
            <p className="text-purple-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 transition-colors"
          style={{ background: "rgba(220,38,38,0.07)" }}
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
