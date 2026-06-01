/**
 * components/student/GeofenceStatus.jsx
 * Panel de estado de geolocalización con tema pastel.
 */

import React from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme } from "../../theme.js";
import { IconMapPin, IconAlert, IconLoader } from "../common/Icons.jsx";

export default function GeofenceStatus({ status, distance, errorMessage, onRetry, userCoords }) {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div style={{
        borderRadius: "16px", padding: "14px 16px",
        background: t.card, border: `1px solid ${t.cardBorder}`,
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <IconLoader style={{ color: t.accent, width: 18, height: 18, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: t.text, margin: 0 }}>Verificando ubicación GPS…</p>
          <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0" }}>
            Asegúrate de tener el GPS activado y los permisos otorgados.
          </p>
        </div>
      </div>
    );
  }

  if (status === "granted") {
    return (
      <div style={{
        borderRadius: "16px", padding: "14px 16px",
        background: isDark ? "rgba(5,150,105,0.15)" : "#d1fae5",
        border: `1px solid ${isDark ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.4)"}`,
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <IconMapPin style={{ color: isDark ? "#34d399" : "#059669", width: 18, height: 18, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#34d399" : "#065f46", margin: 0 }}>
            ✓ Ubicación Verificada
          </p>
          <p style={{ fontSize: "11px", color: isDark ? "#6ee7b7" : "#047857", margin: "2px 0 0" }}>
            Estás dentro del rango autorizado{distance !== null ? ` (${distance}m del centro)` : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: "16px", padding: "14px 16px",
      background: isDark ? "rgba(220,38,38,0.15)" : "#fee2e2",
      border: `1px solid ${isDark ? "rgba(220,38,38,0.45)" : "rgba(220,38,38,0.4)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
        <IconAlert style={{ color: isDark ? "#f87171" : "#dc2626", marginTop: "1px", flexShrink: 0, width: 16, height: 16 }} />
        <p style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#fca5a5" : "#991b1b", margin: 0, lineHeight: 1.5 }}>
          {errorMessage}
        </p>
      </div>
      {userCoords && (
        <div style={{ marginBottom: "10px", fontSize: "11px", color: isDark ? "#fca5a5" : "#b91c1c", fontFamily: "monospace", lineHeight: 1.8 }}>
          <p style={{ margin: 0 }}>📍 Tu GPS: {userCoords.lat.toFixed(7)}, {userCoords.lng.toFixed(7)}</p>
          <p style={{ margin: 0 }}>🏫 Centro: 13.3490383, -88.88223185</p>
          <p style={{ margin: 0 }}>📏 Distancia: {distance}m</p>
        </div>
      )}
      <button
        onClick={onRetry}
        style={{
          width: "100%", padding: "9px", borderRadius: "10px",
          fontSize: "12px", fontWeight: 600, cursor: "pointer",
          background: isDark ? "rgba(220,38,38,0.2)" : "rgba(220,38,38,0.1)",
          border: `1px solid ${isDark ? "rgba(220,38,38,0.35)" : "rgba(220,38,38,0.3)"}`,
          color: isDark ? "#fca5a5" : "#dc2626",
        }}
      >
        Reintentar verificación GPS
      </button>
    </div>
  );
}
