/**
 * pages/MarcarAsistencia.jsx
 * Vista del Alumno — Mobile First con tema pastel y modo oscuro.
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getTheme, getSectionColor, SECTION_COLORS } from "../theme.js";
import { useGeofencing } from "../hooks/useGeofencing.js";
import { useAttendance } from "../hooks/useAttendance.js";
import GeofenceStatus from "../components/student/GeofenceStatus.jsx";
import {
  SuccessPanel,
  DuplicatePanel,
  DeviceBlockedPanel,
} from "../components/student/AttendanceResult.jsx";
import { IconShield, IconCheck, IconLoader, IconAlert } from "../components/common/Icons.jsx";

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

const GRADE_LABELS = {
  "1A": "1er Año — Sección A",
  "1B": "1er Año — Sección B",
  "2A": "2do Año — Sección A",
  "2B": "2do Año — Sección B",
  "3A": "3er Año — Sección A",
  "3B": "3er Año — Sección B",
};

async function fetchSectionsWithCounts() {
  const alumnosSnap = await getDocs(collection(db, "alumnos"));
  const totalPorSala = {};
  alumnosSnap.forEach((d) => {
    const sala = d.data().sala;
    if (sala) totalPorSala[sala] = (totalPorSala[sala] || 0) + 1;
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const asistSnap = await getDocs(
    query(collection(db, "asistencias"), where("fecha_cliente", ">=", Timestamp.fromDate(todayStart)))
  );
  const presentesPorSala = {};
  asistSnap.forEach((d) => {
    const sala = d.data().sala;
    if (sala) presentesPorSala[sala] = (presentesPorSala[sala] || 0) + 1;
  });

  return Object.keys(totalPorSala).sort().map((id) => ({
    id,
    label: GRADE_LABELS[id] || id,
    total: totalPorSala[id] || 0,
    presentes: presentesPorSala[id] || 0,
  }));
}

// ── Card de sección ──────────────────────────────────────────────────────────
function SectionCard({ section, onSelect, isDark }) {
  const t = getTheme(isDark);
  const sc = getSectionColor(section.id, isDark);
  const pct = section.total > 0 ? Math.round((section.presentes / section.total) * 100) : 0;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(section.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", textAlign: "left", border: "none",
        background: "none", padding: 0, cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "transform 0.2s",
      }}
    >
      <div style={{
        borderRadius: "20px",
        padding: "18px 20px",
        background: sc.bg,
        border: `1.5px solid ${hovered ? sc.accent : sc.border}`,
        boxShadow: hovered
          ? `0 8px 28px rgba(0,0,0,${isDark ? "0.35" : "0.12"})`
          : `0 2px 12px rgba(0,0,0,${isDark ? "0.2" : "0.06"})`,
        transition: "all 0.2s",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <span style={{
              fontSize: "11px", fontWeight: 700, padding: "3px 10px",
              borderRadius: "8px", display: "inline-block", marginBottom: "6px",
              background: sc.pill, color: sc.pillText,
            }}>
              {section.id}
            </span>
            <p style={{ fontSize: "15px", fontWeight: 700, color: sc.text, margin: 0, lineHeight: 1.3 }}>
              {section.label}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
            <p style={{ margin: 0, lineHeight: 1 }}>
              <span style={{ fontSize: "26px", fontWeight: 800, color: sc.accent }}>{section.presentes}</span>
              <span style={{ fontSize: "15px", fontWeight: 600, color: sc.text, opacity: 0.5 }}>/{section.total}</span>
            </p>
            <p style={{ fontSize: "11px", color: sc.text, opacity: 0.6, margin: "2px 0 0" }}>presentes hoy</p>
          </div>
        </div>

        {/* Barra progreso */}
        <div style={{ width: "100%", height: "5px", borderRadius: "999px", background: `${sc.border}50`, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "999px",
            width: `${pct}%`, background: sc.accent,
            transition: "width 0.5s",
          }} />
        </div>
        <p style={{ fontSize: "11px", color: sc.text, opacity: 0.5, marginTop: "5px", textAlign: "right" }}>
          {pct}% de asistencia
        </p>
      </div>
    </button>
  );
}

// ── Pantalla de selección de grado ──────────────────────────────────────────
function GradeSelector({ onSelect }) {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const t = getTheme(isDark);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    fetchSectionsWithCounts().then(setSections).finally(() => setLoadingSections(false));
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: isDark
        ? "linear-gradient(155deg, #0a0814 0%, #130e2a 50%, #0d0b1f 100%)"
        : "linear-gradient(155deg, #f5f0ff 0%, #ede9fe 50%, #fce7f3 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: "background 0.3s",
    }}>
      {/* Botón modo oscuro */}
      <button onClick={toggle} style={{
        position: "fixed", top: "16px", right: "16px", zIndex: 100,
        padding: "8px", borderRadius: "10px", cursor: "pointer",
        background: t.card, border: `1px solid ${t.cardBorder}`,
        color: t.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: t.cardShadow,
      }}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <header style={{ padding: "40px 20px 16px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isDark ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "linear-gradient(135deg, #a78bfa, #818cf8)",
            boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
          }}>
            <IconShield style={{ color: "#fff", width: 20, height: 20 }} />
          </div>
          <span style={{ color: t.text, fontWeight: 800, fontSize: "18px" }}>Asistencia COED</span>
        </div>
        <p style={{ color: t.textMuted, fontSize: "12px", margin: 0 }}>Selecciona tu grado y sección</p>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 16px 32px", gap: "12px", justifyContent: "center" }}>
        {loadingSections ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "40px 0" }}>
            <IconLoader style={{ color: t.textMuted, width: 20, height: 20 }} />
            <span style={{ color: t.textMuted, fontSize: "14px" }}>Cargando secciones…</span>
          </div>
        ) : sections.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: "14px", textAlign: "center", padding: "40px 0" }}>
            No hay secciones registradas. Contacta al administrador.
          </p>
        ) : (
          sections.map((s) => <SectionCard key={s.id} section={s} onSelect={onSelect} isDark={isDark} />)
        )}

        <button
          onClick={async () => { await signOut(auth); navigate("/login", { replace: true }); }}
          style={{
            width: "100%", padding: "12px", borderRadius: "14px",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
            color: t.textMuted, background: "transparent",
            border: `1px solid ${t.cardBorder}`, marginTop: "4px",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ── Vista principal de marcado ───────────────────────────────────────────────
export default function MarcarAsistencia() {
  const { user, isAdmin, loading } = useAuth();
  const { isDark, toggle } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [salaManual, setSalaManual] = useState(null);
  const sala = searchParams.get("sala") || salaManual;

  useEffect(() => {
    if (!loading && isAdmin) navigate("/admin/dashboard", { replace: true });
  }, [isAdmin, loading, navigate]);

  const { status, distance, isWithinRange, errorMessage, requestLocation, userCoords } = useGeofencing();
  const efectivelyWithinRange = isAdmin ? true : isWithinRange;
  const gradeLabel = GRADE_LABELS[sala] || `Grado: ${sala}`;
  const sc = getSectionColor(sala, isDark);

  const { submitStatus, submitError, marcarAsistencia } = useAttendance({
    uid: user?.uid,
    nombre: user?.displayName || user?.email,
    email: user?.email,
    sala,
    grado: gradeLabel,
  });

  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!sala) return <GradeSelector onSelect={(id) => setSalaManual(id)} />;

  const canSubmit = efectivelyWithinRange && submitStatus === "idle";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: isDark
        ? "linear-gradient(155deg, #0a0814 0%, #130e2a 50%, #0d0b1f 100%)"
        : `linear-gradient(155deg, ${sc.bg} 0%, #f5f0ff 60%, #ede9fe 100%)`,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: "background 0.3s",
    }}>
      {/* Botón modo oscuro */}
      <button onClick={toggle} style={{
        position: "fixed", top: "16px", right: "16px", zIndex: 100,
        padding: "8px", borderRadius: "10px", cursor: "pointer",
        background: t.card, border: `1px solid ${t.cardBorder}`,
        color: t.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Header */}
      <header style={{ padding: "36px 20px 16px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isDark ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : `linear-gradient(135deg, ${sc.accent}, ${sc.border})`,
          }}>
            <IconShield style={{ color: "#fff", width: 20, height: 20 }} />
          </div>
          <span style={{ color: t.text, fontWeight: 800, fontSize: "18px" }}>Asistencia COED</span>
        </div>
        <span style={{
          fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px",
          background: sc.pill, color: sc.pillText,
        }}>{gradeLabel}</span>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 16px 32px", gap: "12px" }}>
        {/* Reloj */}
        <div style={{
          borderRadius: "20px", padding: "20px", textAlign: "center",
          background: t.card, border: `1px solid ${t.cardBorder}`,
          boxShadow: t.cardShadow,
        }}>
          <div style={{
            fontSize: "44px", fontWeight: 800, color: t.text,
            letterSpacing: "3px", fontFamily: "'JetBrains Mono', monospace",
          }}>
            {clock.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "6px", textTransform: "capitalize" }}>
            {clock.toLocaleDateString("es-SV", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <IconShield style={{ width: 13, height: 13, color: t.textFaint }} />
            <span style={{ fontSize: "11px", color: t.textFaint }}>Hora oficial verificada por servidor seguro</span>
          </div>
        </div>

        {/* Geofencing o modo admin */}
        {isAdmin ? (
          <div style={{
            borderRadius: "16px", padding: "14px 16px",
            background: t.accentLight, border: `1px solid ${t.accentBorder}`,
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <IconShield style={{ width: 18, height: 18, color: t.accent, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: t.text, margin: 0 }}>Modo Administrador</p>
              <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0" }}>Verificación de ubicación omitida.</p>
            </div>
          </div>
        ) : (
          <GeofenceStatus status={status} distance={distance} errorMessage={errorMessage} onRetry={requestLocation} userCoords={userCoords} />
        )}

        {/* Resultado o botón */}
        {submitStatus === "success" ? (
          <SuccessPanel gradeLabel={gradeLabel} />
        ) : submitStatus === "duplicate" ? (
          <DuplicatePanel gradeLabel={gradeLabel} />
        ) : submitStatus === "device_blocked" ? (
          <DeviceBlockedPanel />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "flex-end" }}>
            {submitStatus === "error" && submitError && (
              <div style={{
                borderRadius: "14px", padding: "14px 16px",
                background: t.errorBg, border: `1px solid ${t.errorBorder}`,
                display: "flex", alignItems: "flex-start", gap: "10px",
                fontSize: "13px", color: isDark ? "#fca5a5" : "#991b1b",
              }}>
                <IconAlert style={{ flexShrink: 0, marginTop: "1px", width: 16, height: 16 }} />
                <span>{submitError}</span>
              </div>
            )}

            <button
              onClick={marcarAsistencia}
              disabled={!canSubmit}
              style={{
                width: "100%", padding: "20px",
                borderRadius: "20px", fontSize: "16px", fontWeight: 800,
                color: canSubmit ? "#fff" : t.textFaint,
                border: `1.5px solid ${canSubmit ? sc.accent : t.cardBorder}`,
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                background: canSubmit
                  ? (isDark ? `linear-gradient(135deg, ${sc.accent}, ${sc.border})` : `linear-gradient(135deg, ${sc.accent}dd, ${sc.accent})`)
                  : t.card,
                boxShadow: canSubmit ? `0 8px 24px ${sc.accent}40` : "none",
                transition: "all 0.3s",
              }}
            >
              {submitStatus === "loading" ? (
                <><IconLoader style={{ width: 22, height: 22 }} /> Registrando…</>
              ) : (
                <><IconCheck style={{ width: 26, height: 26 }} /> Registrar Asistencia</>
              )}
            </button>

            <p style={{ textAlign: "center", fontSize: "11px", color: t.textFaint, lineHeight: 1.5, padding: "0 16px" }}>
              Al presionar, tu asistencia queda registrada con la hora exacta del servidor institucional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
