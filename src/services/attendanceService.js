/**
 * services/attendanceService.js
 * Capa de acceso a datos — Asistencias en Firestore.
 * Centraliza todas las operaciones de lectura/escritura.
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

const COLLECTION = "asistencias";

/**
 * Verifica si el alumno ya marcó asistencia hoy para ese grado.
 * @param {string} uid
 * @param {string} sala
 * @returns {Promise<boolean>}
 */
export async function hasMarcadoHoy(uid, sala) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", uid),
    where("sala", "==", sala),
    where("fecha_cliente", ">=", Timestamp.fromDate(todayStart))
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * Registra una nueva asistencia.
 * IMPORTANTE: El timestamp real es asignado por Firebase (serverTimestamp),
 * nunca por el cliente.
 *
 * @param {{ uid, nombre, email, sala, grado }} payload
 * @returns {Promise<string>} ID del documento creado
 */
export async function registrarAsistencia({ uid, nombre, email, sala, grado }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const ref = await addDoc(collection(db, COLLECTION), {
    uid,
    nombre,
    email,
    sala,
    grado,
    estado: "Presente",
    // ✅ BLINDAJE: serverTimestamp() → hora del servidor, no del dispositivo
    timestamp: serverTimestamp(),
    // fecha_cliente solo para queries de "hoy" (Firestore no puede comparar serverTimestamp en queries)
    fecha_cliente: Timestamp.fromDate(todayStart),
  });

  return ref.id;
}

/**
 * Obtiene registros de asistencia por rango de fecha y opcionalmente por sala.
 * @param {string} dateStr — Formato: "YYYY-MM-DD"
 * @param {string|null} sala — null para todos los grados
 * @returns {Promise<Array>}
 */
export async function getAsistenciasPorFecha(dateStr, sala = null) {
  const start = new Date(dateStr + "T00:00:00");
  const end = new Date(dateStr + "T23:59:59");

  const constraints = [
    where("fecha_cliente", ">=", Timestamp.fromDate(start)),
    where("fecha_cliente", "<=", Timestamp.fromDate(end)),
    orderBy("fecha_cliente", "asc"),
  ];

  if (sala) {
    constraints.unshift(where("sala", "==", sala));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
