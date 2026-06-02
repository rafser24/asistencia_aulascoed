/**
 * pages/MisAsistencias.jsx
 * Historial personal del alumno — muestra sus registros del mes actual.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getTheme, getSectionColor } from "../theme.js";
import { IconShield, IconLoader, IconCalendar } from "../components/common/Icons.jsx";

function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}
function SunIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}

export default function MisAsistencias() {
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [mes, setMes]             = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const [y, m] = mes.split("-").map(Number);
    const inicio = new Date(y, m - 1, 1);
    const fin    = new Date(y, m, 0, 23, 59, 59);

    getDocs(query(
      collection(db, "asistencias"),
      where("uid", "==", user.uid),
      where("fecha_cliente", ">=", Timestamp.fromDate(inicio)),
      where("fecha_cliente", "<=", Timestamp.fromDate(fin)),
      orderBy("fecha_cliente", "desc")
    )).then((snap) => {
      setRegistros(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, [user, mes]);

  // Calcular días hábiles del mes (lun–vie)
  const diasHabiles = (() => {
    const [y, m] = mes.split("-").map(Number);
    let count = 0;
    const diasEnMes = new Date(y, m, 0).getDate();
    for (let d = 1; d <= diasEnMes; d++) {
      const dia = new Date(y, m - 1, d).getDay();
      if (dia !== 0 && dia !== 6) count++;
    }
    return count;
  })();

  const pct = diasHabiles > 0 ? Math.round((registros.length / diasHabiles) * 100) : 0;
  const pctColor = pct >= 80 ? (isDark ? "#34d399" : "#059669") : pct >= 60 ? (isDark ? "#fbbf24" : "#d97706") : (isDark ? "#f87171" : "#dc2626");

  return (
    <div style={{
      minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif",
      background: isDark ? "linear-gradient(155deg,#0a0814,#130e2a,#0d0b1f)" : "linear-gradient(155deg,#f5f0ff,#ede9fe,#fce7f3)",
      transition: "background 0.3s",
    }}>
      {/* Botón modo oscuro */}
      <button onClick={toggle} style={{
        position: "fixed", top: 16, right: 16, zIndex: 100, padding: "8px", borderRadius: "10px",
        background: t.card, border: `1px solid ${t.cardBorder}`, color: t.textMuted, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => navigate("/marcar")} style={{
            background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: "10px",
            padding: "8px 12px", fontSize: "13px", color: t.textMuted, cursor: "pointer",
          }}>← Volver</button>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: t.text, margin: 0 }}>Mis Asistencias</h1>
            <p style={{ fontSize: "12px", color: t.textMuted, margin: 0 }}>{user?.displayName || user?.email}</p>
          </div>
        </div>

        {/* Selector de mes */}
        <div style={{ marginBottom: "16px" }}>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
            style={{
              borderRadius: "12px", padding: "10px 14px", fontSize: "13px",
              color: t.text, background: t.input, border: `1px solid ${t.inputBorder}`,
              outline: "none", colorScheme: isDark ? "dark" : "light", width: "100%",
            }}
          />
        </div>

        {/* Resumen */}
        <div style={{
          borderRadius: "20px", padding: "20px", marginBottom: "16px",
          background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: t.textMuted, margin: 0 }}>Asistencia del mes</p>
            <span style={{ fontSize: "28px", fontWeight: 800, color: pctColor }}>{pct}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", borderRadius: "999px", background: t.bgSecondary, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "999px", width: `${pct}%`, background: pctColor, transition: "width 0.6s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontSize: "12px", color: t.textMuted }}>{registros.length} días asistidos</span>
            <span style={{ fontSize: "12px", color: t.textMuted }}>{diasHabiles} días hábiles</span>
          </div>
        </div>

        {/* Lista de registros */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <IconLoader style={{ width: 24, height: 24, color: t.textMuted }} />
          </div>
        ) : registros.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <p style={{ color: t.textMuted, fontSize: "14px" }}>Sin registros este mes</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {registros.map((r) => {
              const ts = r.timestamp?.toDate ? r.timestamp.toDate() : new Date();
              const sc = getSectionColor(r.sala, isDark);
              return (
                <div key={r.id} style={{
                  borderRadius: "16px", padding: "14px 16px",
                  background: t.card, border: `1px solid ${t.cardBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: sc.bg, flexShrink: 0,
                    }}>
                      <IconCalendar style={{ width: 16, height: 16, color: sc.accent }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: t.text, margin: 0 }}>
                        {ts.toLocaleDateString("es-SV", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                      <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0" }}>
                        {r.grado || r.sala}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: sc.accent, margin: 0, fontFamily: "monospace" }}>
                      {ts.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
                      background: isDark ? "rgba(16,185,129,0.15)" : "#d1fae5",
                      color: isDark ? "#34d399" : "#059669",
                    }}>Presente</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cerrar sesión */}
        <button onClick={async () => { await signOut(auth); navigate("/login"); }} style={{
          width: "100%", padding: "12px", borderRadius: "14px", marginTop: "24px",
          fontSize: "13px", fontWeight: 600, cursor: "pointer",
          color: t.textMuted, background: "transparent", border: `1px solid ${t.cardBorder}`,
        }}>Cerrar sesión</button>
      </div>
    </div>
  );
}
