/**
 * components/student/AttendanceResult.jsx
 * Paneles de resultado con soporte de tema pastel.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme } from "../../theme.js";
import { IconCheck, IconAlert, IconShield } from "../common/Icons.jsx";

export function SuccessPanel({ gradeLabel }) {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  return (
    <div style={{
      borderRadius: "24px", padding: "36px 24px", textAlign: "center",
      background: isDark ? "rgba(5,150,105,0.12)" : "#d1fae5",
      border: `1.5px solid ${isDark ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.5)"}`,
      boxShadow: isDark ? "none" : "0 8px 24px rgba(16,185,129,0.12)",
    }}>
      <div style={{
        width: "88px", height: "88px", borderRadius: "50%", margin: "0 auto 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.15)",
        boxShadow: "0 0 32px rgba(16,185,129,0.2)",
      }}>
        <IconCheck style={{ width: 44, height: 44, color: isDark ? "#34d399" : "#059669" }} />
      </div>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>¡Asistencia Registrada!</h2>
      <p style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#34d399" : "#059669", margin: 0 }}>{gradeLabel}</p>
      <div style={{
        marginTop: "18px", borderRadius: "14px", padding: "12px 16px",
        background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.1)",
        border: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.3)"}`,
      }}>
        <p style={{ fontSize: "12px", color: t.textMuted, lineHeight: 1.6, margin: 0 }}>
          Tu asistencia fue confirmada con la hora oficial del servidor institucional.
          No es posible falsificar o alterar este registro.
        </p>
      </div>
      <button onClick={() => navigate("/mis-asistencias")} style={{
        marginTop: "14px", width: "100%", padding: "11px", borderRadius: "14px",
        fontSize: "13px", fontWeight: 600, cursor: "pointer",
        color: isDark ? "#34d399" : "#059669",
        background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.08)",
        border: `1px solid ${isDark ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.3)"}`,
      }}>
        📋 Ver mis asistencias del mes
      </button>
    </div>
  );
}

export function DuplicatePanel({ gradeLabel }) {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  return (
    <div style={{
      borderRadius: "24px", padding: "36px 24px", textAlign: "center",
      background: isDark ? "rgba(245,158,11,0.1)" : "#fef9c3",
      border: `1.5px solid ${isDark ? "rgba(245,158,11,0.3)" : "rgba(234,179,8,0.5)"}`,
    }}>
      <div style={{
        width: "88px", height: "88px", borderRadius: "50%", margin: "0 auto 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isDark ? "rgba(245,158,11,0.15)" : "rgba(234,179,8,0.15)",
      }}>
        <IconAlert style={{ width: 44, height: 44, color: isDark ? "#fbbf24" : "#ca8a04" }} />
      </div>
      <h2 style={{ fontSize: "20px", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Asistencia ya registrada</h2>
      <p style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#fbbf24" : "#ca8a04", margin: 0 }}>{gradeLabel}</p>
      <p style={{ fontSize: "12px", color: t.textMuted, margin: "12px auto 0", maxWidth: "260px", lineHeight: 1.6 }}>
        Solo se permite un registro por alumno por día. Ya marcaste anteriormente hoy.
      </p>
    </div>
  );
}

export function DeviceBlockedPanel() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  return (
    <div style={{
      borderRadius: "24px", padding: "36px 24px", textAlign: "center",
      background: isDark ? "rgba(220,38,38,0.1)" : "#fee2e2",
      border: `1.5px solid ${isDark ? "rgba(220,38,38,0.35)" : "rgba(220,38,38,0.4)"}`,
    }}>
      <div style={{
        width: "88px", height: "88px", borderRadius: "50%", margin: "0 auto 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isDark ? "rgba(220,38,38,0.15)" : "rgba(220,38,38,0.1)",
        boxShadow: "0 0 32px rgba(220,38,38,0.15)",
      }}>
        <IconShield style={{ width: 44, height: 44, color: isDark ? "#f87171" : "#dc2626" }} />
      </div>
      <h2 style={{ fontSize: "20px", fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Dispositivo no autorizado</h2>
      <p style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#f87171" : "#dc2626", margin: 0 }}>
        Esta cuenta ya fue vinculada a otro dispositivo
      </p>
      <p style={{ fontSize: "12px", color: t.textMuted, margin: "12px auto 0", maxWidth: "260px", lineHeight: 1.6 }}>
        Por seguridad, cada cuenta solo puede marcar desde el dispositivo registrado.
        Contacta al administrador para restablecer tu acceso.
      </p>
    </div>
  );
}
