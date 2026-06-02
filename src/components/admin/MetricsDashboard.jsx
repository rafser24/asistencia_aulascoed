/**
 * components/admin/MetricsDashboard.jsx
 * Dashboard de métricas: asistencia semanal, porcentaje por sección, alertas.
 */

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme, getSectionColor } from "../../theme.js";
import { IconLoader } from "../common/Icons.jsx";

function StatCard({ label, value, sub, color, t }) {
  return (
    <div style={{
      borderRadius: "16px", padding: "18px 20px",
      background: t.card, border: `1px solid ${t.cardBorder}`,
      boxShadow: t.cardShadow,
    }}>
      <p style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontSize: "28px", fontWeight: 800, color: color || t.text, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "12px", color: t.textMuted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

// Gráfica de barras horizontal simple (sin librería)
function BarChart({ data, isDark, t }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map((item) => {
        const sc = getSectionColor(item.sala, isDark);
        const pct = Math.round((item.value / max) * 100);
        return (
          <div key={item.sala}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px",
                  background: sc.pill, color: sc.pillText,
                }}>{item.sala}</span>
                <span style={{ fontSize: "12px", color: t.textMuted }}>{item.label}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: sc.accent }}>{item.pctAsist}%</span>
            </div>
            <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: isDark ? "rgba(255,255,255,0.06)" : t.bgSecondary, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "999px", width: `${pct}%`,
                background: sc.accent, transition: "width 0.6s ease",
              }} />
            </div>
            <p style={{ fontSize: "11px", color: t.textFaint, margin: "3px 0 0", textAlign: "right" }}>
              {item.value} presentes hoy · {item.total} alumnos
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Gráfica de línea semanal (últimos 7 días) — SVG puro
function LineChart({ data, isDark, t }) {
  if (!data.length) return null;
  const W = 100, H = 60;
  const max = Math.max(...data.map((d) => d.count), 1);
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.count / max) * (H - 8),
    ...d,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fill = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + ` L ${pts[pts.length-1].x} ${H} L 0 ${H} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "80px", overflow: "visible" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="#a78bfa" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: "10px", color: t.textFaint, textAlign: "center" }}>
            {new Date(d.fecha + "T12:00:00").toLocaleDateString("es-SV", { weekday: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MetricsDashboard() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const [loading, setLoading]       = useState(true);
  const [secciones, setSecciones]   = useState([]);
  const [semana, setSemana]         = useState([]);
  const [alertas, setAlertas]       = useState([]);
  const [totales, setTotales]       = useState({ hoy: 0, alumnos: 0, secciones: 0 });

  useEffect(() => {
    cargarMetricas();
  }, []);

  async function cargarMetricas() {
    setLoading(true);
    try {
      // Alumnos totales por sección
      const alumnosSnap = await getDocs(collection(db, "alumnos"));
      const alumnosPorSala = {};
      const alumnosList = [];
      alumnosSnap.forEach((d) => {
        const a = { id: d.id, ...d.data() };
        alumnosList.push(a);
        alumnosPorSala[a.sala] = (alumnosPorSala[a.sala] || 0) + 1;
      });

      // Asistencias últimos 7 días
      const hace7 = new Date(); hace7.setDate(hace7.getDate() - 6); hace7.setHours(0, 0, 0, 0);
      const asistSnap = await getDocs(query(
        collection(db, "asistencias"),
        where("fecha_cliente", ">=", Timestamp.fromDate(hace7))
      ));
      const asistencias = asistSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Hoy
      const hoyStr = new Date().toISOString().split("T")[0];
      const asistHoy = asistencias.filter((a) => {
        const f = a.fecha_cliente?.toDate ? a.fecha_cliente.toDate() : null;
        return f && f.toISOString().split("T")[0] === hoyStr;
      });
      const presentesPorSala = {};
      asistHoy.forEach((a) => { presentesPorSala[a.sala] = (presentesPorSala[a.sala] || 0) + 1; });

      // Métricas por sección
      const seccionesData = Object.keys(alumnosPorSala).sort().map((sala) => ({
        sala,
        label: sala,
        total: alumnosPorSala[sala],
        value: presentesPorSala[sala] || 0,
        pctAsist: alumnosPorSala[sala] > 0 ? Math.round(((presentesPorSala[sala] || 0) / alumnosPorSala[sala]) * 100) : 0,
      }));
      setSecciones(seccionesData);

      // Semana — agrupar por día
      const porDia = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        porDia[key] = 0;
      }
      asistencias.forEach((a) => {
        const f = a.fecha_cliente?.toDate ? a.fecha_cliente.toDate() : null;
        if (!f) return;
        const key = f.toISOString().split("T")[0];
        if (key in porDia) porDia[key]++;
      });
      setSemana(Object.entries(porDia).map(([fecha, count]) => ({ fecha, count })));

      // Alertas: alumnos con 3+ días consecutivos sin marcar (últimos 5 días hábiles)
      const uidsAsistieron = new Set(asistencias.map((a) => a.uid));
      const ausentes = alumnosList.filter((al) => !uidsAsistieron.has(al.uid) && al.uid);
      setAlertas(ausentes.slice(0, 10));

      setTotales({
        hoy: asistHoy.length,
        alumnos: alumnosList.length,
        secciones: Object.keys(alumnosPorSala).length,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
      <IconLoader style={{ width: 28, height: 28, color: t.textMuted }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stats rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        <StatCard label="Presentes hoy" value={totales.hoy} sub={`de ${totales.alumnos} alumnos`} color={isDark ? "#34d399" : "#059669"} t={t} />
        <StatCard label="Total alumnos" value={totales.alumnos} sub={`en ${totales.secciones} secciones`} t={t} />
        <StatCard label="Asistencia hoy" value={totales.alumnos > 0 ? `${Math.round((totales.hoy / totales.alumnos) * 100)}%` : "—"} t={t} color={isDark ? "#a78bfa" : "#7c3aed"} />
      </div>

      {/* Gráfica semanal */}
      <div style={{ borderRadius: "20px", padding: "20px 24px", background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: t.text, margin: "0 0 16px" }}>📈 Asistencia — últimos 7 días</h3>
        <LineChart data={semana} isDark={isDark} t={t} />
      </div>

      {/* Barras por sección */}
      <div style={{ borderRadius: "20px", padding: "20px 24px", background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: t.text, margin: "0 0 16px" }}>📊 Asistencia por sección (hoy)</h3>
        {secciones.length === 0
          ? <p style={{ fontSize: "13px", color: t.textFaint }}>Sin datos de asistencia para hoy.</p>
          : <BarChart data={secciones} isDark={isDark} t={t} />
        }
      </div>

      {/* Alertas de inasistencia */}
      {alertas.length > 0 && (
        <div style={{ borderRadius: "20px", padding: "20px 24px", background: t.card, border: `1.5px solid ${isDark ? "rgba(245,158,11,0.3)" : "rgba(234,179,8,0.4)"}`, boxShadow: t.cardShadow }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: isDark ? "#fbbf24" : "#92400e", margin: "0 0 4px" }}>
            ⚠️ Sin asistencia esta semana
          </h3>
          <p style={{ fontSize: "12px", color: t.textMuted, margin: "0 0 14px" }}>
            {alertas.length} alumno{alertas.length !== 1 ? "s" : ""} no han marcado en los últimos 7 días
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {alertas.map((al) => {
              const sc = getSectionColor(al.sala, isDark);
              return (
                <div key={al.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: "10px",
                  background: isDark ? "rgba(245,158,11,0.08)" : "#fef9c3",
                  border: `1px solid ${isDark ? "rgba(245,158,11,0.2)" : "rgba(234,179,8,0.3)"}`,
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{al.nombre}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px",
                    background: sc.pill, color: sc.pillText,
                  }}>{al.sala}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
