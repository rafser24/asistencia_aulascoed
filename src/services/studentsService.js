/**
 * services/studentsService.js
 * CRUD de alumnos en Firestore.
 */

import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

const COL = "alumnos";

/** Obtiene todos los alumnos, opcionalmente filtrados por sala */
export async function getAlumnos(sala = null) {
  const constraints = sala ? [where("sala", "==", sala)] : [];
  const q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Crea un alumno nuevo */
export async function crearAlumno({ nombre, email, sala, codigo = "", nie = "", idSeccion = "", falto = "No", justificacion = "", observacion = "" }) {
  const ref = await addDoc(collection(db, COL), {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    sala,
    codigo: codigo.trim(),
    nie: nie.trim(),
    idSeccion: idSeccion.toString().trim(),
    falto,
    justificacion: falto === "Sí" ? justificacion : "",
    observacion: observacion.trim(),
    activo: true,
    creadoEn: serverTimestamp(),
  });
  return ref.id;
}

/** Actualiza datos de un alumno */
export async function actualizarAlumno(id, datos) {
  await updateDoc(doc(db, COL, id), datos);
}

/** Elimina un alumno */
export async function eliminarAlumno(id) {
  await deleteDoc(doc(db, COL, id));
}

/** Importa múltiples alumnos en lote desde CSV */
export async function importarAlumnos(rows) {
  const results = { ok: 0, errores: [] };
  for (const row of rows) {
    try {
      await crearAlumno(row);
      results.ok++;
    } catch (e) {
      results.errores.push({ nie: row.nie, error: e.message });
    }
  }
  return results;
}

/** Parsea texto CSV a array de objetos alumno */
export function parsearCSV(text) {
  // Eliminar BOM (UTF-8 y UTF-16) si existe
  const clean = text.replace(/^﻿/, "").replace(/^￾/, "");
  const lines = clean.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parseo robusto que maneja comas dentro de comillas y caracteres especiales
  const splitLine = (line) => {
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        // Comillas dobles escapadas ("")
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (c === "," && !inQ) {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    cols.push(cur.trim());
    return cols;
  };

  const normalizar = (s) => s.toLowerCase()
    .replace(/[áàä]/g, "a").replace(/[éèë]/g, "e").replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o").replace(/[úùü]/g, "u").replace(/ñ/g, "n")
    .replace("id seccion", "idseccion").replace("id_seccion", "idseccion")
    .replace("seccion", "sala").replace("sección", "sala")
    .replace(/ /g, "").trim();
  const headers = splitLine(lines[0]).map(normalizar);

  const VALID_SALAS = ["1A","1B","2A","2B","3A","3B"];
  const VALID_JUST  = ["No Justificado","Enfermedad","Muerte de un pariente","Otro"];

  return lines.slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = splitLine(line);
      const raw = {};
      headers.forEach((h, i) => { raw[h] = vals[i] || ""; });

      const sala = (raw.sala || raw.seccion || raw["sección"] || "1A").trim().toUpperCase();
      const falto = raw.falto?.trim() === "Sí" || raw.falto?.trim() === "Si" ? "Sí" : "No";
      const just  = VALID_JUST.includes(raw.justificacion?.trim()) ? raw.justificacion.trim() : "No Justificado";

      return {
        codigo:        raw.codigo?.trim() || "",
        nie:           raw.nie?.trim() || "",
        nombre:        raw.nombre?.trim() || "",
        email:         raw.email?.trim().toLowerCase() || "",
        sala:          VALID_SALAS.includes(sala) ? sala : "1A",
        falto,
        justificacion: falto === "Sí" ? just : "",
        observacion:   raw.observacion?.trim() || "",
      };
    })
    .filter((r) => r.nombre && r.email);
}
