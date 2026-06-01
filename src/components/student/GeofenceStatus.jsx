/**
 * components/student/GeofenceStatus.jsx
 * Panel de estado de geolocalización del alumno.
 * Muestra: cargando, aprobado, fuera de rango, denegado, error.
 */

import React from "react";
import { IconMapPin, IconAlert, IconLoader } from "../common/Icons.jsx";

export default function GeofenceStatus({ status, distance, errorMessage, onRetry, userCoords }) {
  if (status === "idle") return null;

  // ── Cargando ──
  if (status === "loading") {
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3 animate-fade-in"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="text-purple-300">
          <IconLoader />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Verificando ubicación GPS…</p>
          <p className="text-purple-400 text-xs mt-0.5">
            Asegúrate de tener el GPS activado y los permisos otorgados.
          </p>
        </div>
      </div>
    );
  }

  // ── Aprobado ──
  if (status === "granted") {
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3 animate-fade-in"
        style={{ background: "rgba(5,150,105,0.15)", border: "1px solid rgba(16,185,129,0.35)" }}
      >
        <div className="text-emerald-400">
          <IconMapPin />
        </div>
        <div>
          <p className="text-emerald-300 text-sm font-bold">✓ Ubicación Verificada</p>
          <p className="text-emerald-500 text-xs mt-0.5">
            Estás dentro del rango autorizado
            {distance !== null ? ` (${distance}m del centro)` : ""}.
          </p>
        </div>
      </div>
    );
  }

  // ── Fuera de rango, denegado o error ──
  return (
    <div
      className="rounded-2xl p-4 animate-fade-in"
      style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.45)" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-red-400 mt-0.5 flex-shrink-0">
          <IconAlert />
        </div>
        <p className="text-red-200 text-sm font-semibold leading-snug">{errorMessage}</p>
      </div>
      {/* Debug: coordenadas detectadas vs. coordenadas del centro */}
      {userCoords && (
        <div className="mb-3 text-xs text-red-300 font-mono space-y-1 px-1">
          <p>📍 Tu GPS: {userCoords.lat.toFixed(7)}, {userCoords.lng.toFixed(7)}</p>
          <p>🏫 Centro:  13.3490383, -88.88223185</p>
          <p>📏 Distancia calculada: {distance}m</p>
        </div>
      )}
      <button
        onClick={onRetry}
        className="w-full py-2 rounded-xl text-sm font-semibold text-red-200 transition-opacity hover:opacity-80 active:scale-98"
        style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.35)" }}
      >
        Reintentar verificación GPS
      </button>
    </div>
  );
}
