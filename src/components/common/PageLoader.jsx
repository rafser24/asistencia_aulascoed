/**
 * components/common/PageLoader.jsx
 * Pantalla de carga global mientras se resuelve la sesión o el lazy import.
 */

import React from "react";
import { IconShield } from "./Icons.jsx";

export default function PageLoader({ message = "Cargando…" }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
    >
      {/* Logo animado */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white"
          style={{
            background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
            boxShadow: "0 0 40px rgba(109,40,217,0.5)",
            animation: "glow-pulse 2s ease-in-out infinite",
          }}
        >
          <IconShield className="w-10 h-10" />
        </div>
        {/* Spinner de anillo */}
        <div
          className="absolute -inset-2 rounded-3xl border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#6d28d9", borderRightColor: "#4f46e5" }}
        />
      </div>

      <div className="text-center">
        <p className="text-white font-bold text-lg tracking-tight">Asistencia COED</p>
        <p className="text-purple-400 text-sm mt-1">{message}</p>
      </div>

      {/* Barra de progreso animada */}
      <div
        className="w-48 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(109,40,217,0.2)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #6d28d9, #4f46e5, #6d28d9)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      </div>
    </div>
  );
}
