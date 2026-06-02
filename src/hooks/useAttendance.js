/**
 * hooks/useAttendance.js
 * Lógica de marcado de asistencia encapsulada en un hook.
 * Separa la lógica de negocio del componente de UI.
 */

import { useState, useCallback } from "react";
import { hasMarcadoHoy, registrarAsistencia, verificarDispositivo, validarVentanaHoraria, registrarAuditoria } from "../services/attendanceService.js";

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
      // 1. Verificar ventana horaria (si falla, permitir continuar)
      try {
        const { permitido, mensaje } = await validarVentanaHoraria();
        if (!permitido) {
          setSubmitError(mensaje);
          setSubmitStatus("error");
          return;
        }
      } catch (e) {
        console.warn("[ventana horaria]", e.message);
        // Si falla la verificación, permitir continuar
      }

      // 2. Verificar dispositivo vinculado (si falla, permitir continuar)
      try {
        const dispositivoOk = await verificarDispositivo(uid);
        if (!dispositivoOk) {
          setSubmitStatus("device_blocked");
          return;
        }
      } catch (e) {
        console.warn("[dispositivo]", e.message);
        // Si falla la verificación, permitir continuar
      }

      // 3. Anti-duplicado
      try {
        const yaMarcó = await hasMarcadoHoy(uid, sala);
        if (yaMarcó) {
          setSubmitStatus("duplicate");
          return;
        }
      } catch (e) {
        console.warn("[duplicado]", e.message);
      }

      // 4. Registrar asistencia
      await registrarAsistencia({ uid, nombre, email, sala, grado });
      setSubmitStatus("success");

    } catch (err) {
      console.error("[useAttendance] Error al registrar:", err.code, err.message);
      setSubmitError(
        err.code === "permission-denied"
          ? "Sin permisos en Firestore. Contacta al administrador."
          : `Error: ${err.message}`
      );
      setSubmitStatus("error");
    }
  }, [uid, nombre, email, sala, grado]);

  return { submitStatus, submitError, marcarAsistencia };
}
