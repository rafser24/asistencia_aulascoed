/**
 * components/admin/VentanaHoraria.jsx
 * Panel para configurar la ventana horaria de marcado de asistencia.
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme } from "../../theme.js";
import { getVentanaHoraria, setVentanaHoraria } from "../../services/attendanceService.js";
import { IconLoader, IconCheck } from "../common/Icons.jsx";

export default function VentanaHoraria() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const [form, setForm] = useState({ horaInicio: "07:00", horaFin: "08:00", activo: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getVentanaHoraria().then((data) => {
      if (data) setForm(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setVentanaHoraria(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderRadius: "10px", padding: "9px 14px", fontSize: "13px",
    outline: "none", color: t.text,
    background: t.input, border: `1px solid ${t.inputBorder}`,
    colorScheme: isDark ? "dark" : "light",
  };

  return (
    <div style={{
      borderRadius: "20px", padding: "20px 24px", marginBottom: "20px",
      background: t.card, border: `1px solid ${t.cardBorder}`,
      boxShadow: t.cardShadow,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: t.text, margin: 0 }}>
            🕐 Ventana horaria de asistencia
          </h3>
          <p style={{ fontSize: "12px", color: t.textMuted, margin: "3px 0 0" }}>
            Fuera de este rango el QR queda bloqueado aunque sea válido
          </p>
        </div>

        {/* Toggle activo/inactivo */}
        <button
          onClick={() => setForm((p) => ({ ...p, activo: !p.activo }))}
          style={{
            padding: "6px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", border: "none", transition: "all 0.2s",
            background: form.activo
              ? (isDark ? "rgba(16,185,129,0.2)" : "#d1fae5")
              : (isDark ? "rgba(255,255,255,0.07)" : t.bgSecondary),
            color: form.activo
              ? (isDark ? "#34d399" : "#059669")
              : t.textMuted,
          }}
        >
          {form.activo ? "✓ Activo" : "Desactivado"}
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "12px" }}>
          <IconLoader style={{ width: 18, height: 18, color: t.textMuted }} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted }}>Hora de apertura</label>
            <input
              type="time"
              value={form.horaInicio}
              onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <span style={{ color: t.textFaint, fontSize: "18px", paddingBottom: "8px" }}>→</span>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted }}>Hora de cierre</label>
            <input
              type="time"
              value={form.horaFin}
              onChange={(e) => setForm((p) => ({ ...p, horaFin: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "9px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
              color: "#fff", border: "none", cursor: saving ? "not-allowed" : "pointer",
              background: saved
                ? (isDark ? "rgba(16,185,129,0.7)" : "#059669")
                : (isDark ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "linear-gradient(135deg,#a78bfa,#818cf8)"),
              display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 4px 12px rgba(124,58,237,0.25)",
              transition: "background 0.3s",
            }}
          >
            {saving ? <IconLoader style={{ width: 14, height: 14 }} /> : <IconCheck style={{ width: 14, height: 14 }} />}
            {saved ? "Guardado" : "Guardar"}
          </button>
        </div>
      )}

      {/* Preview del estado actual */}
      {!loading && (
        <div style={{
          marginTop: "14px", padding: "10px 14px", borderRadius: "12px", fontSize: "12px",
          background: form.activo
            ? (isDark ? "rgba(234,179,8,0.1)" : "#fef9c3")
            : (isDark ? "rgba(255,255,255,0.04)" : t.bgSecondary),
          border: `1px solid ${form.activo ? (isDark ? "rgba(234,179,8,0.3)" : "rgba(234,179,8,0.5)") : t.cardBorder}`,
          color: form.activo ? (isDark ? "#fde047" : "#92400e") : t.textFaint,
        }}>
          {form.activo
            ? `⚠️ Los alumnos solo pueden marcar entre ${form.horaInicio} y ${form.horaFin}. Fuera de ese horario el QR estará bloqueado.`
            : "ℹ️ Sin restricción horaria activa. Los alumnos pueden marcar a cualquier hora del día."}
        </div>
      )}
    </div>
  );
}
