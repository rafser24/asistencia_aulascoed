/**
 * components/student/AttendanceResult.jsx
 * Paneles de resultado del marcado de asistencia:
 *   - SuccessPanel: registro exitoso
 *   - DuplicatePanel: ya marcó hoy
 */

import React from "react";
import { IconCheck, IconAlert, IconShield } from "../common/Icons.jsx";

export function SuccessPanel({ gradeLabel }) {
  return (
    <div
      className="rounded-2xl p-8 text-center animate-slide-up"
      style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(16,185,129,0.35)" }}
    >
      {/* Ícono animado */}
      <div
        className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-emerald-400"
        style={{
          background: "rgba(16,185,129,0.18)",
          boxShadow: "0 0 40px rgba(16,185,129,0.25)",
        }}
      >
        <IconCheck className="w-12 h-12" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">¡Asistencia Registrada!</h2>
      <p className="text-emerald-300 text-sm font-medium">{gradeLabel}</p>

      <div
        className="mt-5 mx-auto max-w-xs rounded-xl p-3"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
      >
        <p className="text-purple-300 text-xs leading-relaxed">
          Tu asistencia fue confirmada con la hora oficial del servidor institucional.
          No es posible falsificar o alterar este registro.
        </p>
      </div>
    </div>
  );
}

export function DeviceBlockedPanel() {
  return (
    <div
      className="rounded-2xl p-8 text-center animate-slide-up"
      style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.35)" }}
    >
      <div
        className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-red-400"
        style={{ background: "rgba(220,38,38,0.15)", boxShadow: "0 0 40px rgba(220,38,38,0.2)" }}
      >
        <IconShield className="w-12 h-12" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Dispositivo no autorizado</h2>
      <p className="text-red-300 text-sm font-medium">Esta cuenta ya fue vinculada a otro dispositivo</p>
      <p className="text-purple-400 text-xs mt-3 max-w-xs mx-auto leading-relaxed">
        Por seguridad, cada cuenta solo puede marcar asistencia desde el dispositivo registrado. Contacta al administrador para restablecer tu acceso.
      </p>
    </div>
  );
}

export function DuplicatePanel({ gradeLabel }) {
  return (
    <div
      className="rounded-2xl p-8 text-center animate-slide-up"
      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
    >
      <div
        className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-amber-400"
        style={{ background: "rgba(245,158,11,0.15)" }}
      >
        <IconAlert className="w-12 h-12" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Asistencia ya registrada</h2>
      <p className="text-amber-300 text-sm font-medium">{gradeLabel}</p>
      <p className="text-purple-400 text-xs mt-3 max-w-xs mx-auto">
        Solo se permite un registro de asistencia por alumno por día. Ya marcaste anteriormente hoy.
      </p>
    </div>
  );
}
