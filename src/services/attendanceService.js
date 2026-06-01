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
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";

// ── Vinculación de dispositivo ───────────────────────────────────────────────

/** Genera o recupera el ID único de este dispositivo desde localStorage */
function getLocalDeviceId() {
  let id = localStorage.getItem("coed_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("coed_device_id", id);
  }
  return id;
}

/**
 * Verifica si el dispositivo actual está autorizado para este UID.
 * - Si no hay registro previo: vincula este dispositivo y retorna true.
 * - Si hay registro y coincide: retorna true.
 * - Si hay registro y NO coincide: retorna false.
 *
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
export async function verificarDispositivo(uid) {
  const deviceId = getLocalDeviceId();
  const ref = doc(db, "dispositivos", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Primera vez: vincular
    await setDoc(ref, { deviceId, vinculadoEn: serverTimestamp() });
    return true;
  }

  return snap.data().deviceId === deviceId;
}

/**
 * Restablece la vinculación de dispositivo de un alumno (uso exclusivo del admin).
 * @param {string} uid
 */
export async function resetearDispositivo(uid) {
  await setDoc(doc(db, "dispositivos", uid), { deviceId: null, vinculadoEn: null });
}

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

  // Solo filtramos por fecha en Firestore (no requiere índice compuesto).
  // El filtro por sala se aplica en cliente para evitar índices adicionales.
  const q = query(
    collection(db, COLLECTION),
    where("fecha_cliente", ">=", Timestamp.fromDate(start)),
    where("fecha_cliente", "<=", Timestamp.fromDate(end)),
    orderBy("fecha_cliente", "asc")
  );

  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return sala ? all.filter((r) => r.sala === sala) : all;
}
