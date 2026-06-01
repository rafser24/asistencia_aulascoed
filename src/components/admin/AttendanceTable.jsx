import React from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme, getSectionColor } from "../../theme.js";
import { IconLoader } from "../common/Icons.jsx";

function EmptyState({ date, t }) {
  const formatted = new Date(date + "T12:00:00").toLocaleDateString("es-SV", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
      <p style={{ fontSize: "15px", fontWeight: 700, color: t.text, margin: "0 0 6px" }}>Sin registros para esta fecha</p>
      <p style={{ fontSize: "13px", color: t.textMuted, textTransform: "capitalize", margin: 0 }}>{formatted}</p>
      <p style={{ fontSize: "12px", color: t.textFaint, marginTop: "8px" }}>
        Prueba seleccionando otro día o ajusta el filtro de grado.
      </p>
    </div>
  );
}

export default function AttendanceTable({ records, loading, error, selectedDate }) {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const HEADERS = ["Nombre", "Grado", "Fecha", "Hora Entrada", "Estado"];

  const wrap = (children) => (
    <div style={{
      borderRadius: "20px", overflow: "hidden",
      background: t.card, border: `1px solid ${t.cardBorder}`,
      boxShadow: t.cardShadow,
    }}>
      {children}
    </div>
  );

  if (error) return wrap(
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <p style={{ fontSize: "13px", color: isDark ? "#f87171" : "#dc2626" }}>{error}</p>
    </div>
  );

  const headerRow = (
    <thead>
      <tr style={{ borderBottom: `1px solid ${t.cardBorder}`, background: isDark ? "rgba(109,40,217,0.1)" : t.bgSecondary }}>
        {HEADERS.map((h) => (
          <th key={h} style={{
            padding: "14px 20px", textAlign: "left",
            fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em", color: t.textMuted,
          }}>{h}</th>
        ))}
      </tr>
    </thead>
  );

  if (loading) return wrap(
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {headerRow}
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              {[40, 20, 16, 16, 12].map((w, j) => (
                <td key={j} style={{ padding: "16px 20px" }}>
                  <div style={{
                    height: "14px", borderRadius: "6px", width: `${w}%`, minWidth: "60px",
                    background: isDark ? "rgba(139,92,246,0.1)" : "rgba(124,58,237,0.08)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!records.length) return wrap(<EmptyState date={selectedDate} t={t} />);

  return wrap(
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {headerRow}
        <tbody>
          {records.map((row, i) => {
            const ts = row.timestamp?.toDate ? row.timestamp.toDate() : new Date();
            const sc = getSectionColor(row.sala, isDark);
            return (
              <tr key={row.id} style={{
                borderBottom: `1px solid ${t.cardBorder}`,
                background: i % 2 === 0 ? "transparent" : (isDark ? "rgba(109,40,217,0.03)" : "rgba(124,58,237,0.02)"),
                transition: "background 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(109,40,217,0.08)" : "rgba(124,58,237,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : (isDark ? "rgba(109,40,217,0.03)" : "rgba(124,58,237,0.02)"))}
              >
                <td style={{ padding: "13px 20px", fontSize: "13px", fontWeight: 600, color: t.text }}>
                  {row.nombre || row.email || "—"}
                </td>
                <td style={{ padding: "13px 20px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
                    background: sc.pill, color: sc.pillText,
                  }}>{row.grado || row.sala}</span>
                </td>
                <td style={{ padding: "13px 20px", fontSize: "12px", color: t.textMuted, fontFamily: "monospace" }}>
                  {ts.toLocaleDateString("es-SV")}
                </td>
                <td style={{ padding: "13px 20px", fontSize: "12px", color: t.text, fontFamily: "monospace", fontWeight: 600 }}>
                  {ts.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </td>
                <td style={{ padding: "13px 20px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
                    background: isDark ? "rgba(16,185,129,0.15)" : "#d1fae5",
                    color: isDark ? "#34d399" : "#059669",
                    border: `1px solid ${isDark ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.4)"}`,
                  }}>{row.estado || "Presente"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
