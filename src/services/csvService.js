/**
 * services/csvService.js
 * Exportación CSV para el sistema de asistencia COED.
 */

import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "./firebase.js";

function descargar(contenido, nombre) {
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Exporta asistencia en el formato oficial COED:
 * Código, ID Sección, Fecha, NIE, Faltó, Justificación, Observación
 *
 * Cruza todos los alumnos contra los que marcaron ese día.
 * Si el alumno NO marcó → Faltó: Sí
 * Si el alumno SÍ marcó → Faltó: No
 *
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {string|null} sala - null para todas las secciones
 */
export async function exportarAsistenciaOficial(dateStr, sala = null) {
  // 1. Obtener todos los alumnos (filtrado por sala si aplica)
  const alumnosQuery = sala
    ? query(collection(db, "alumnos"), where("sala", "==", sala))
    : collection(db, "alumnos");
  const alumnosSnap = await getDocs(alumnosQuery);
  const alumnos = alumnosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (alumnos.length === 0) return;

  // 2. Obtener asistencias del día
  const start = new Date(dateStr + "T00:00:00");
  const end   = new Date(dateStr + "T23:59:59");
  const asistConstraints = [
    where("fecha_cliente", ">=", Timestamp.fromDate(start)),
    where("fecha_cliente", "<=", Timestamp.fromDate(end)),
  ];
  if (sala) asistConstraints.push(where("sala", "==", sala));

  const asistSnap = await getDocs(query(collection(db, "asistencias"), ...asistConstraints));

  // UIDs que marcaron hoy (identificados por uid o email como fallback)
  const uidsMarcaron = new Set(asistSnap.docs.map((d) => d.data().uid));
  const emailsMarcaron = new Set(asistSnap.docs.map((d) => d.data().email));

  // 3. Formatear fecha DD/MM/YY
  const [y, m, d] = dateStr.split("-");
  const fechaFmt = `${d}/${m}/${String(y).slice(-2)}`;

  // 4. Construir filas ordenadas por sala y nombre
  const HEADERS = ["Código", "ID Sección", "Fecha", "NIE", "Faltó", "Justificación", "Observación"];

  alumnos.sort(
    (a, b) => (a.sala || "").localeCompare(b.sala || "") || (a.nombre || "").localeCompare(b.nombre || "")
  );

  const rows = alumnos.map((al) => {
    const marcó = uidsMarcaron.has(al.uid) || emailsMarcaron.has(al.email);
    const falto = marcó ? "No" : "Sí";
    return [
      `"${al.codigo || "A"}"`,
      `"${al.idSeccion || ""}"`,
      `"${fechaFmt}"`,
      `"${al.nie || ""}"`,
      `"${falto}"`,
      `"${falto === "Sí" ? (al.justificacion || "") : ""}"`,
      `"${al.observacion || ""}"`,
    ].join(",");
  });

  const contenido = [HEADERS.join(","), ...rows].join("\n");
  const salaTag = sala ? `_${sala}` : "_todas";
  descargar(contenido, `asistencia_coed_${dateStr}${salaTag}.csv`);
}
