/**
 * hooks/useAttendance.js
 * Lógica de marcado de asistencia encapsulada en un hook.
 * Separa la lógica de negocio del componente de UI.
 */

import { useState, useCallback } from "react";
import { hasMarcadoHoy, registrarAsistencia } from "../services/attendanceService.js";

/**
 * @typedef {'idle'|'loading'|'success'|'duplicate'|'error'} SubmitStatus
 *
 * @param {{ uid, nombre, email, sala, grado }} userData
 * @returns {{ submitStatus, submitError, marcarAsistencia }}
 */
export function useAttendance({ uid, nombre, email, sala, grado }) {
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const marcarAsistencia = useCallback(async () => {
    if (!uid || !sala) return;

    setSubmitStatus("loading");
    setSubmitError(null);

    try {
      // 1. Anti-duplicado: verificar si ya marcó hoy
      const yaMarcó = await hasMarcadoHoy(uid, sala);
      if (yaMarcó) {
        setSubmitStatus("duplicate");
        return;
      }

      // 2. Registrar con timestamp del servidor
      await registrarAsistencia({ uid, nombre, email, sala, grado });
      setSubmitStatus("success");
    } catch (err) {
      console.error("[useAttendance]", err);
      setSubmitError(
        "No se pudo registrar la asistencia. Verifica tu conexión a internet."
      );
      setSubmitStatus("error");
    }
  }, [uid, nombre, email, sala, grado]);

  return { submitStatus, submitError, marcarAsistencia };
}
