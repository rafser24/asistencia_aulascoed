/**
 * components/admin/StudentsPanel.jsx
 * Gestión de alumnos por sección — con campos: Código, NIE, Faltó, Justificación, Observación.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAlumnos, crearAlumno, actualizarAlumno, eliminarAlumno, importarAlumnos, parsearCSV } from "../../services/studentsService.js";
import { IconPlus, IconEdit, IconTrash, IconLoader, IconCheck, IconDownload } from "../common/Icons.jsx";

// ── Plantilla CSV ────────────────────────────────────────────────────────────
const CSV_TEMPLATE = `Codigo,ID Seccion,NIE,Nombre,Email,Contrasena,Seccion,Falto,Justificacion,Observacion
A,17998,6953846,Juan García López,juan.garcia@clases.edu.sv,clave123,1A,No,,Sin observaciones
B,17999,3486219,María Martínez Perez,maria.martinez@clases.edu.sv,clave123,1A,Sí,Enfermedad,Cita médica
A,18000,7821034,Carlos Hernández Díaz,carlos.hernandez@clases.edu.sv,clave123,1B,No,,
B,18001,5647291,Ana Rodríguez Flores,ana.rodriguez@clases.edu.sv,clave123,2A,Sí,No Justificado,
`;

function descargarPlantilla() {
  const blob = new Blob(["﻿" + CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "plantilla_alumnos_COED.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Modal de previsualización de importación ─────────────────────────────────
function ImportModal({ rows, onConfirm, onClose, importing }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-3xl rounded-2xl flex flex-col max-h-[85vh]"
        style={{ background: "linear-gradient(145deg,#1a1035,#110d2a)", border: "1px solid rgba(139,92,246,0.3)" }}>

        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
          <h2 className="text-white font-bold text-lg">Vista previa de importación</h2>
          <p className="text-purple-400 text-xs mt-0.5">{rows.length} alumno{rows.length !== 1 ? "s" : ""} detectado{rows.length !== 1 ? "s" : ""} en el CSV</p>
        </div>

        <div className="overflow-auto flex-1 px-2 py-3">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(109,40,217,0.14)" }}>
                {["Código","ID Sección","NIE","Nombre","Email","Contraseña","Sección","Faltó","Justificación","Observación"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-purple-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(139,92,246,0.07)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                  <td className="px-3 py-2 text-white font-mono">{r.codigo || "—"}</td>
                  <td className="px-3 py-2 text-purple-200 font-mono">{r.idSeccion || "—"}</td>
                  <td className="px-3 py-2 text-purple-200 font-mono">{r.nie || "—"}</td>
                  <td className="px-3 py-2 text-white">{r.nombre}</td>
                  <td className="px-3 py-2 text-purple-300">{r.email}</td>
                  <td className="px-3 py-2 text-purple-400">{r.password ? "••••••" : <span className="text-red-400">sin contraseña</span>}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(109,40,217,0.25)", color: "#c4b5fd" }}>{r.sala}</span></td>
                  <td className="px-3 py-2"><span className={r.falto === "Sí" ? "text-red-400" : "text-emerald-400"}>{r.falto}</span></td>
                  <td className="px-3 py-2 text-purple-300">{r.falto === "Sí" ? r.justificacion : "—"}</td>
                  <td className="px-3 py-2 text-purple-400">{r.observacion || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
          <button onClick={onConfirm} disabled={importing}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)" }}>
            {importing ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconCheck className="w-4 h-4" />}
            {importing ? "Importando…" : `Confirmar e importar ${rows.length} alumnos`}
          </button>
          <button onClick={onClose} disabled={importing}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-purple-300"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const JUSTIFICACIONES = [
  "No Justificado",
  "Enfermedad",
  "Muerte de un pariente",
  "Otro",
];

const GRADES_DEFAULT = [
  { id: "1A", label: "1er Año — Sección A" },
  { id: "1B", label: "1er Año — Sección B" },
  { id: "2A", label: "2do Año — Sección A" },
  { id: "2B", label: "2do Año — Sección B" },
  { id: "3A", label: "3er Año — Sección A" },
  { id: "3B", label: "3er Año — Sección B" },
];

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(139,92,246,0.25)",
  borderRadius: "10px",
  color: "#fff",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

// ── Formulario de alumno ─────────────────────────────────────────────────────
function AlumnoForm({ initial = {}, onSave, onCancel, grades }) {
  const [form, setForm] = useState({
    nombre:        initial.nombre        || "",
    email:         initial.email         || "",
    password:      "",
    sala:          initial.sala          || grades[0]?.id || "1A",
    codigo:        initial.codigo        || "",
    idSeccion:     initial.idSeccion     || "",
    nie:           initial.nie           || "",
    falto:         initial.falto         || "No",
    justificacion: initial.justificacion || "No Justificado",
    observacion:   initial.observacion   || "",
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.nie.trim()) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Nombre */}
        <div className="col-span-2">
          <label className="text-purple-400 text-xs mb-1 block">Nombre completo *</label>
          <input value={form.nombre} onChange={set("nombre")} placeholder="Nombre completo" required style={inputStyle} />
        </div>

        {/* Email */}
        <div className="col-span-2">
          <label className="text-purple-400 text-xs mb-1 block">Correo electrónico *</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="correo@ejemplo.com" required style={inputStyle} />
        </div>

        {/* Contraseña */}
        <div className="col-span-2">
          <label className="text-purple-400 text-xs mb-1 block">
            Contraseña {initial.id ? <span className="text-purple-600">(dejar vacío para no cambiar)</span> : <span className="text-red-400">*</span>}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Mínimo 6 caracteres"
              minLength={form.password ? 6 : undefined}
              required={!initial.id}
              style={{ ...inputStyle, paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#a78bfa" }}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Código */}
        <div>
          <label className="text-purple-400 text-xs mb-1 block">Código</label>
          <input value={form.codigo} onChange={set("codigo")} placeholder="Ej: A" maxLength={10} style={inputStyle} />
        </div>

        {/* ID Sección */}
        <div>
          <label className="text-purple-400 text-xs mb-1 block">ID Sección</label>
          <input value={form.idSeccion} onChange={set("idSeccion")} placeholder="Ej: 17998" style={inputStyle} />
        </div>

        {/* NIE */}
        <div>
          <label className="text-purple-400 text-xs mb-1 block">NIE *</label>
          <input value={form.nie} onChange={set("nie")} placeholder="Ej: 6953846" required style={inputStyle} />
        </div>

        {/* Sección */}
        <div className="col-span-2">
          <label className="text-purple-400 text-xs mb-1 block">Sección</label>
          <select value={form.sala} onChange={set("sala")} style={{ ...inputStyle, cursor: "pointer" }}>
            {grades.map((g) => (
              <option key={g.id} value={g.id} style={{ background: "#1a1035" }}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Faltó */}
        <div>
          <label className="text-purple-400 text-xs mb-1 block">Faltó</label>
          <select value={form.falto} onChange={set("falto")} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="No" style={{ background: "#1a1035" }}>No</option>
            <option value="Sí" style={{ background: "#1a1035" }}>Sí</option>
          </select>
        </div>

        {/* Justificación — solo si faltó */}
        <div>
          <label className="text-purple-400 text-xs mb-1 block">
            Justificación {form.falto === "No" && <span className="text-purple-600">(N/A)</span>}
          </label>
          <select
            value={form.justificacion}
            onChange={set("justificacion")}
            disabled={form.falto === "No"}
            style={{
              ...inputStyle,
              cursor: form.falto === "No" ? "not-allowed" : "pointer",
              opacity: form.falto === "No" ? 0.4 : 1,
            }}
          >
            {JUSTIFICACIONES.map((j) => (
              <option key={j} value={j} style={{ background: "#1a1035" }}>{j}</option>
            ))}
          </select>
        </div>

        {/* Observación */}
        <div className="col-span-2">
          <label className="text-purple-400 text-xs mb-1 block">Observación</label>
          <input
            value={form.observacion}
            onChange={set("observacion")}
            placeholder="Sin observaciones"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
        >
          {saving ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconCheck className="w-4 h-4" />}
          {initial.id ? "Actualizar Alumno" : "Agregar Alumno"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-purple-300"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────
export default function StudentsPanel({ grades }) {
  const gradeList = grades?.length ? grades : GRADES_DEFAULT;

  const [filterSala, setFilterSala] = useState("all");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [importRows, setImportRows] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Leer como ArrayBuffer para detectar codificación
    const bufReader = new FileReader();
    bufReader.onload = (evt) => {
      const buffer = evt.target.result;
      const bytes  = new Uint8Array(buffer);

      // Detectar BOM UTF-8 (EF BB BF)
      const hasUtf8Bom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;

      // Intentar UTF-8 primero
      const utf8Text = new TextDecoder("utf-8").decode(buffer);
      const hasCorruption = utf8Text.includes("�"); // carácter de reemplazo

      // Si hay corrupción y no tiene BOM, usar Windows-1252 (Latin)
      const encoding = (!hasCorruption || hasUtf8Bom) ? "utf-8" : "windows-1252";
      const text = new TextDecoder(encoding).decode(buffer);

      const rows = parsearCSV(text);
      if (rows.length === 0) {
        alert("No se encontraron datos válidos en el CSV. Verifica el formato.");
      } else {
        setImportRows(rows);
      }
    };
    bufReader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!importRows) return;
    setImporting(true);
    try {
      const result = await importarAlumnos(importRows);
      setImportResult(result);
      setImportRows(null);
      fetchAlumnos();
    } finally {
      setImporting(false);
    }
  };

  const fetchAlumnos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlumnos(filterSala === "all" ? null : filterSala);
      data.sort((a, b) => a.sala.localeCompare(b.sala) || a.nombre.localeCompare(b.nombre));
      setAlumnos(data);
    } catch {
      setError("No se pudieron cargar los alumnos. Verifica los permisos de Firestore.");
    } finally {
      setLoading(false);
    }
  }, [filterSala]);

  useEffect(() => { fetchAlumnos(); }, [fetchAlumnos]);

  const handleAdd = async (form) => {
    await crearAlumno(form);
    setShowAddForm(false);
    fetchAlumnos();
  };

  const handleEdit = async (id, form) => {
    await actualizarAlumno(id, {
      ...form,
      justificacion: form.falto === "Sí" ? form.justificacion : "",
    });
    setEditingId(null);
    fetchAlumnos();
  };

  const handleDelete = async (alumno) => {
    if (!window.confirm(`¿Eliminar a ${alumno.nombre}?`)) return;
    await eliminarAlumno(alumno.id);
    fetchAlumnos();
  };

  return (
    <div className="animate-fade-in">
      {/* ── Barra de filtros ── */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-purple-400 text-sm font-medium">Sección:</label>
          <select
            value={filterSala}
            onChange={(e) => setFilterSala(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.3)", cursor: "pointer" }}
          >
            <option value="all" style={{ background: "#1a1035" }}>Todas las secciones</option>
            {gradeList.map((g) => (
              <option key={g.id} value={g.id} style={{ background: "#1a1035" }}>{g.label}</option>
            ))}
          </select>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(109,40,217,0.2)", color: "#c4b5fd", border: "1px solid rgba(109,40,217,0.3)" }}
          >
            {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Descargar plantilla */}
          <button onClick={descargarPlantilla}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-300 transition-all hover:opacity-80"
            style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.35)" }}
            title="Descargar plantilla CSV">
            <IconDownload className="w-4 h-4" />
            Plantilla CSV
          </button>

          {/* Cargar CSV */}
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-200 transition-all hover:opacity-80"
            style={{ background: "rgba(109,40,217,0.2)", border: "1px solid rgba(109,40,217,0.4)" }}>
            ⬆ Cargar CSV
          </button>

          {/* Agregar manual */}
          <button onClick={() => { setShowAddForm((p) => !p); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}>
            <IconPlus className="w-4 h-4" />
            Agregar Alumno
          </button>
        </div>
      </div>

      {/* ── Formulario agregar ── */}
      {showAddForm && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.3)" }}
        >
          <p className="text-purple-300 text-sm font-semibold mb-4">Nuevo Alumno</p>
          <AlumnoForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} grades={gradeList} />
        </div>
      )}

      {/* ── Resultado de importación ── */}
      {importResult && (
        <div className="rounded-xl p-4 mb-4 flex items-start justify-between gap-3"
          style={{ background: importResult.errores.length ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)",
                   border: `1px solid ${importResult.errores.length ? "rgba(220,38,38,0.3)" : "rgba(16,185,129,0.3)"}` }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: importResult.errores.length ? "#fca5a5" : "#6ee7b7" }}>
              ✓ {importResult.ok} alumno{importResult.ok !== 1 ? "s" : ""} importado{importResult.ok !== 1 ? "s" : ""} correctamente
              {importResult.errores.length > 0 && ` · ${importResult.errores.length} con error`}
            </p>
          </div>
          <button onClick={() => setImportResult(null)} className="text-purple-400 hover:text-white text-lg leading-none">✕</button>
        </div>
      )}

      {/* ── Modal importación CSV ── */}
      {importRows && (
        <ImportModal
          rows={importRows}
          onConfirm={handleImportConfirm}
          onClose={() => setImportRows(null)}
          importing={importing}
        />
      )}

      {/* ── Carga / error / vacío ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <IconLoader className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="text-purple-400 text-sm ml-3">Cargando alumnos…</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl p-4 text-red-300 text-sm mb-4"
          style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)" }}>
          {error}
        </div>
      )}
      {!loading && !error && alumnos.length === 0 && (
        <div className="text-center py-16">
          <p className="text-purple-500 text-sm">No hay alumnos registrados.</p>
          <p className="text-purple-600 text-xs mt-1">Usa "Agregar Alumno" para comenzar.</p>
        </div>
      )}

      {/* ── Tabla ── */}
      {!loading && alumnos.length > 0 && (
        <div className="rounded-2xl overflow-x-auto" style={{ border: "1px solid rgba(139,92,246,0.15)" }}>
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(109,40,217,0.14)", borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
                {["#","Código","ID Sección","NIE","Nombre","Sección","Faltó","Justificación","Observación",""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-purple-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, i) => (
                <React.Fragment key={alumno.id}>
                  {/* Fila normal */}
                  {editingId !== alumno.id && (
                    <tr
                      style={{ borderBottom: "1px solid rgba(139,92,246,0.07)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent")}
                    >
                      <td className="px-4 py-3 text-purple-600 text-xs font-mono">{i + 1}</td>
                      <td className="px-4 py-3 text-white font-mono text-xs">{alumno.codigo || "—"}</td>
                      <td className="px-4 py-3 text-purple-200 font-mono text-xs">{alumno.idSeccion || "—"}</td>
                      <td className="px-4 py-3 text-purple-200 font-mono text-xs">{alumno.nie || "—"}</td>
                      <td className="px-4 py-3 text-white font-medium max-w-[160px] truncate">{alumno.nombre}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(109,40,217,0.25)", color: "#c4b5fd" }}>
                          {alumno.sala}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          alumno.falto === "Sí"
                            ? "text-red-300"
                            : "text-emerald-400"
                        }`}
                          style={{
                            background: alumno.falto === "Sí" ? "rgba(220,38,38,0.15)" : "rgba(16,185,129,0.12)",
                          }}>
                          {alumno.falto || "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-purple-300 text-xs max-w-[140px] truncate">
                        {alumno.falto === "Sí" ? (alumno.justificacion || "—") : "—"}
                      </td>
                      <td className="px-4 py-3 text-purple-400 text-xs max-w-[160px] truncate">
                        {alumno.observacion || "Sin observaciones"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditingId(alumno.id); setShowAddForm(false); }}
                            className="p-1.5 rounded-lg text-purple-400 hover:text-white transition-colors"
                            style={{ background: "rgba(109,40,217,0.15)" }} title="Editar">
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(alumno)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                            style={{ background: "rgba(220,38,38,0.12)" }} title="Eliminar">
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Formulario de edición inline */}
                  {editingId === alumno.id && (
                    <tr>
                      <td colSpan={10} className="px-5 py-5"
                        style={{ background: "rgba(109,40,217,0.08)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
                        <p className="text-purple-300 text-xs font-semibold mb-4">Editando: {alumno.nombre}</p>
                        <AlumnoForm
                          initial={alumno}
                          onSave={(form) => handleEdit(alumno.id, form)}
                          onCancel={() => setEditingId(null)}
                          grades={gradeList}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
