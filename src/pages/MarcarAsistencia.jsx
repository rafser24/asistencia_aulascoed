/**
 * pages/MarcarAsistencia.jsx
 * Vista del Alumno — Mobile First
 * Ruta: /marcar?sala=[id_grado]
 *
 * Seguridad:
 *  - Geofencing obligatorio via useGeofencing (Haversine ≤50m)
 *  - Timestamp EXCLUSIVAMENTE del servidor Firebase (serverTimestamp)
 *  - Anti-duplicado: consulta previa por uid + sala + fecha
 *  - Sesión validada por ProtectedRoute en App.jsx
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useGeofencing } from "../hooks/useGeofencing.js";
import { useAttendance } from "../hooks/useAttendance.js";
import GeofenceStatus from "../components/student/GeofenceStatus.jsx";
import {
  SuccessPanel,
  DuplicatePanel,
  DeviceBlockedPanel,
} from "../components/student/AttendanceResult.jsx";
import { IconShield, IconCheck, IconLoader, IconAlert } from "../components/common/Icons.jsx";

// ── Mapa de ID de grado → nombre legible ────────────────────────────────────
const GRADE_LABELS = {
  "1A": "1er Año — Sección A",
  "1B": "1er Año — Sección B",
  "2A": "2do Año — Sección A",
  "2B": "2do Año — Sección B",
  "3A": "3er Año — Sección A",
  "3B": "3er Año — Sección B",
};

// ── Obtiene secciones únicas con conteo desde Firestore ──────────────────────
async function fetchSectionsWithCounts() {
  // Alumnos por sección
  const alumnosSnap = await getDocs(collection(db, "alumnos"));
  const totalPorSala = {};
  alumnosSnap.forEach((d) => {
    const sala = d.data().sala;
    if (sala) totalPorSala[sala] = (totalPorSala[sala] || 0) + 1;
  });

  // Asistencias de hoy
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const asistSnap = await getDocs(
    query(
      collection(db, "asistencias"),
      where("fecha_cliente", ">=", Timestamp.fromDate(todayStart))
    )
  );
  const presentesPorSala = {};
  asistSnap.forEach((d) => {
    const sala = d.data().sala;
    if (sala) presentesPorSala[sala] = (presentesPorSala[sala] || 0) + 1;
  });

  return Object.keys(totalPorSala)
    .sort()
    .map((id) => ({
      id,
      label: GRADE_LABELS[id] || id,
      total: totalPorSala[id] || 0,
      presentes: presentesPorSala[id] || 0,
    }));
}

// ── Card de sección ──────────────────────────────────────────────────────────
function SectionCard({ section, onSelect }) {
  const pct = section.total > 0 ? Math.round((section.presentes / section.total) * 100) : 0;
  return (
    <button
      onClick={() => onSelect(section.id)}
      className="w-full text-left transition-all duration-200 active:scale-95"
      style={{ background: "none", border: "none", padding: 0 }}
    >
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(109,40,217,0.18) 0%, rgba(79,70,229,0.12) 100%)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(109,40,217,0.08)",
          backdropFilter: "blur(12px)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.border = "1px solid rgba(139,92,246,0.6)")}
        onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)")}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg mb-2 inline-block"
              style={{ background: "rgba(109,40,217,0.4)", color: "#c4b5fd" }}
            >
              {section.id}
            </span>
            <p className="text-white font-bold text-base leading-tight">{section.label}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white tabular-nums">
              {section.presentes}
              <span className="text-purple-400 text-base font-medium">/{section.total}</span>
            </p>
            <p className="text-purple-400 text-xs mt-0.5">presentes hoy</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct >= 80
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : pct >= 50
                ? "linear-gradient(90deg, #6d28d9, #8b5cf6)"
                : "linear-gradient(90deg, #4f46e5, #6d28d9)",
            }}
          />
        </div>
        <p className="text-purple-500 text-xs mt-1.5 text-right">{pct}% de asistencia</p>
      </div>
    </button>
  );
}

// ── Pantalla de selección de grado ──────────────────────────────────────────
function GradeSelector({ onSelect }) {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    fetchSectionsWithCounts()
      .then(setSections)
      .finally(() => setLoadingSections(false));
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(155deg, #05030f 0%, #0f0c29 35%, #1a0640 65%, #24243e 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div
        className="fixed top-[-15%] right-[-15%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)" }}
      />
      <header className="px-5 pt-10 pb-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
          >
            <IconShield className="w-5 h-5" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Asistencia COED</span>
        </div>
        <p className="text-purple-300 text-xs font-medium">Selecciona tu grado y sección</p>
      </header>

      <div className="flex-1 flex flex-col px-5 pb-10 gap-3 relative z-10 justify-center">
        {loadingSections ? (
          <div className="flex items-center justify-center py-10 gap-2">
            <IconLoader className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-purple-400 text-sm">Cargando secciones…</span>
          </div>
        ) : sections.length === 0 ? (
          <p className="text-purple-500 text-sm text-center py-10">
            No hay secciones registradas. Contacta al administrador.
          </p>
        ) : (
          sections.map((s) => (
            <SectionCard key={s.id} section={s} onSelect={onSelect} />
          ))
        )}

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-purple-400 text-sm font-medium mt-2 transition-all duration-200"
          style={{ border: "1px solid rgba(139,92,246,0.2)" }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function MarcarAsistencia() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [salaManual, setSalaManual] = useState(null);
  const sala = searchParams.get("sala") || salaManual;

  // Si es admin, redirigir automáticamente al dashboard
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  const { status, distance, isWithinRange, errorMessage, requestLocation, userCoords } =
    useGeofencing();

  // Los admins omiten la validación de geofencing
  const efectivelyWithinRange = isAdmin ? true : isWithinRange;

  const gradeLabel = GRADE_LABELS[sala] || `Grado: ${sala}`;

  const { submitStatus, submitError, marcarAsistencia } = useAttendance({
    uid: user?.uid,
    nombre: user?.displayName || user?.email,
    email: user?.email,
    sala,
    grado: gradeLabel,
  });

  // Reloj decorativo en vivo (NO se usa para el registro)
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Si no hay sala, mostrar selector de grado
  if (!sala) {
    return <GradeSelector onSelect={(id) => setSalaManual(id)} />;
  }

  const canSubmit =
    efectivelyWithinRange && submitStatus === "idle" && submitStatus !== "loading";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(155deg, #05030f 0%, #0f0c29 35%, #1a0640 65%, #24243e 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Orbe decorativo ── */}
      <div
        className="fixed top-[-15%] right-[-15%] w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)",
        }}
      />

      {/* ── Header ── */}
      <header className="px-5 pt-10 pb-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
          >
            <IconShield className="w-5 h-5" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Asistencia COED
          </span>
        </div>
        <p className="text-purple-300 text-xs font-medium">{gradeLabel}</p>
      </header>

      <div className="flex-1 flex flex-col px-5 pb-10 gap-4 relative z-10">
        {/* ── Reloj decorativo ── */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="text-5xl font-bold text-white tracking-widest tabular-nums"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {clock.toLocaleTimeString("es-SV", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="text-purple-300 text-xs mt-2 capitalize">
            {clock.toLocaleDateString("es-SV", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-purple-500 text-xs">
            <IconShield className="w-3.5 h-3.5" />
            <span>Hora oficial verificada por servidor seguro</span>
          </div>
        </div>

        {/* ── Estado de Geofencing ── */}
        {isAdmin ? (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.35)" }}
          >
            <IconShield className="w-5 h-5 text-purple-300 flex-shrink-0" />
            <div>
              <p className="text-purple-200 text-sm font-semibold">Modo Administrador</p>
              <p className="text-purple-400 text-xs mt-0.5">Verificación de ubicación omitida para admin.</p>
            </div>
          </div>
        ) : (
          <GeofenceStatus
            status={status}
            distance={distance}
            errorMessage={errorMessage}
            onRetry={requestLocation}
            userCoords={userCoords}
          />
        )}

        {/* ── Panel de acción o resultado ── */}
        {submitStatus === "success" ? (
          <SuccessPanel gradeLabel={gradeLabel} />
        ) : submitStatus === "duplicate" ? (
          <DuplicatePanel gradeLabel={gradeLabel} />
        ) : submitStatus === "device_blocked" ? (
          <DeviceBlockedPanel />
        ) : (
          <div className="flex flex-col gap-3 flex-1 justify-end">
            {/* Error de envío */}
            {submitStatus === "error" && submitError && (
              <div
                className="rounded-xl p-4 flex items-start gap-3 text-sm text-red-200 animate-fade-in"
                style={{
                  background: "rgba(220,38,38,0.12)",
                  border: "1px solid rgba(220,38,38,0.3)",
                }}
              >
                <IconAlert className="flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={marcarAsistencia}
              disabled={!canSubmit}
              className="w-full py-5 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-3 transition-all duration-300 active:scale-95"
              style={{
                background:
                  canSubmit
                    ? "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)"
                    : "rgba(255,255,255,0.06)",
                boxShadow: canSubmit
                  ? "0 0 40px rgba(109,40,217,0.5)"
                  : "none",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {submitStatus === "loading" ? (
                <>
                  <IconLoader />
                  Registrando…
                </>
              ) : (
                <>
                  <IconCheck className="w-7 h-7" />
                  Registrar Asistencia
                </>
              )}
            </button>

            <p className="text-center text-purple-600 text-xs px-4 leading-relaxed">
              Al presionar, tu asistencia queda registrada con la hora exacta
              del servidor institucional. No es posible modificar este registro.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63)" }}
    >
      <div className="text-center max-w-xs">
        <div className="text-red-400 flex justify-center mb-4">
          <IconAlert className="w-10 h-10" />
        </div>
        <p className="text-white font-semibold text-base">{message}</p>
        <p className="text-purple-400 text-xs mt-3">
          Escanea el código QR correcto o contacta al administrador.
        </p>
      </div>
    </div>
  );
}
