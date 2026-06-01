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
import { auth } from "../services/firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useGeofencing } from "../hooks/useGeofencing.js";
import { useAttendance } from "../hooks/useAttendance.js";
import GeofenceStatus from "../components/student/GeofenceStatus.jsx";
import {
  SuccessPanel,
  DuplicatePanel,
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

const GRADES_LIST = [
  { id: "1A", label: "1er Año", section: "Sección A" },
  { id: "1B", label: "1er Año", section: "Sección B" },
  { id: "2A", label: "2do Año", section: "Sección A" },
  { id: "2B", label: "2do Año", section: "Sección B" },
  { id: "3A", label: "3er Año", section: "Sección A" },
  { id: "3B", label: "3er Año", section: "Sección B" },
];

// ── Pantalla de selección de grado ──────────────────────────────────────────
function GradeSelector({ onSelect }) {
  const navigate = useNavigate();

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
        <p className="text-purple-400 text-xs text-center mb-2">
          No se detectó un QR. Elige tu sección manualmente:
        </p>
        {GRADES_LIST.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className="w-full py-4 rounded-2xl text-white font-semibold flex items-center justify-between px-5 transition-all duration-200 active:scale-95"
            style={{
              background: "rgba(109,40,217,0.15)",
              border: "1px solid rgba(109,40,217,0.35)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.15)")}
          >
            <span>{g.label} — {g.section}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{ background: "rgba(109,40,217,0.4)" }}
            >
              {g.id}
            </span>
          </button>
        ))}

        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-purple-400 text-sm font-medium mt-4 transition-all duration-200"
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
