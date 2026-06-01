/**
 * pages/admin/AdminDashboard.jsx
 * Vista del Administrador — Desktop
 * Ruta: /admin/dashboard
 *
 * Módulos:
 *  - Gestión de QR por grado (qrcode.react)
 *  - Historial filtrado por fecha y grado
 *  - Exportación CSV nativa (URL.createObjectURL)
 */

import React, { useState, useCallback, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import GradeCard from "../../components/admin/GradeCard.jsx";
import FilterBar from "../../components/admin/FilterBar.jsx";
import AttendanceTable from "../../components/admin/AttendanceTable.jsx";
import StatPill from "../../components/admin/StatPill.jsx";
import StudentsPanel from "../../components/admin/StudentsPanel.jsx";
import { getAsistenciasPorFecha } from "../../services/attendanceService.js";
import { exportarAsistenciaOficial } from "../../services/csvService.js";
import { IconPlus, IconDownload } from "../../components/common/Icons.jsx";

// ── Configuración de grados por defecto ─────────────────────────────────────
const DEFAULT_GRADES = [
  { id: "1A", label: "1er Año", section: "Sección A", color: "#6d28d9" },
  { id: "1B", label: "1er Año", section: "Sección B", color: "#4f46e5" },
  { id: "2A", label: "2do Año", section: "Sección A", color: "#7c3aed" },
  { id: "2B", label: "2do Año", section: "Sección B", color: "#5b21b6" },
  { id: "3A", label: "3er Año", section: "Sección A", color: "#4338ca" },
  { id: "3B", label: "3er Año", section: "Sección B", color: "#6366f1" },
];

function loadGrades() {
  try {
    const saved = localStorage.getItem("coed_grades");
    return saved ? JSON.parse(saved) : DEFAULT_GRADES;
  } catch {
    return DEFAULT_GRADES;
  }
}

function saveGrades(grades) {
  localStorage.setItem("coed_grades", JSON.stringify(grades));
}

// ── Modal para nueva sección ─────────────────────────────────────────────────
const COLORS = ["#6d28d9","#4f46e5","#7c3aed","#5b21b6","#4338ca","#6366f1","#0891b2","#059669","#dc2626"];

function NewGradeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ id: "", label: "", section: "", color: "#6d28d9" });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id.trim() || !form.label.trim() || !form.section.trim()) return;
    onAdd({ ...form, id: form.id.trim().toUpperCase() });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "linear-gradient(145deg, #1a1035, #110d2a)", border: "1px solid rgba(139,92,246,0.3)" }}
      >
        <h2 className="text-white font-bold text-lg mb-4">Nueva Sección</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={form.id}
            onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
            placeholder="ID único (ej: 4A)"
            maxLength={4}
            required
            className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.3)" }}
          />
          <input
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            placeholder="Año (ej: 4to Año)"
            required
            className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.3)" }}
          />
          <input
            value={form.section}
            onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
            placeholder="Sección (ej: Sección C)"
            required
            className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.3)" }}
          />
          <div>
            <p className="text-purple-400 text-xs mb-2">Color de la tarjeta</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ background: c, outline: form.color === c ? "2px solid white" : "none", outlineOffset: "2px" }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
            >
              Crear Sección
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-purple-300"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("grados");
  const [grades, setGrades] = useState(loadGrades);
  const [showNewModal, setShowNewModal] = useState(false);

  // ── Gestión de secciones ─────────────────────────────────────────────────
  const handleEditGrade = useCallback((oldId, updated) => {
    setGrades((prev) => {
      const next = prev.map((g) => g.id === oldId ? { ...g, ...updated } : g);
      saveGrades(next);
      return next;
    });
  }, []);

  const handleDeleteGrade = useCallback((id) => {
    setGrades((prev) => {
      const next = prev.filter((g) => g.id !== id);
      saveGrades(next);
      return next;
    });
  }, []);

  const handleAddGrade = useCallback((newGrade) => {
    setGrades((prev) => {
      const next = [...prev, newGrade];
      saveGrades(next);
      return next;
    });
  }, []);

  // Estado del historial
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // ── Fetch de registros ────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const data = await getAsistenciasPorFecha(
        selectedDate,
        selectedGrade === "all" ? null : selectedGrade
      );
      setRecords(data);
    } catch (err) {
      console.error("[AdminDashboard]", err);
      setFetchError(
        "No se pudieron cargar los registros. Verifica tu conexión o los permisos de Firestore."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedGrade]);

  // ── Exportar CSV oficial ──────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportarAsistenciaOficial(selectedDate, selectedGrade === "all" ? null : selectedGrade);
    } finally {
      setExporting(false);
    }
  }, [selectedDate, selectedGrade]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: records.length,
      grados: new Set(records.map((r) => r.sala)).size,
    }),
    [records]
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#05030f",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#ede9fe",
      }}
    >
      {/* Sidebar fijo */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenido principal */}
      <main className="ml-64 min-h-screen p-8">
        {/* ── Header de página ── */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">
            {activeTab === "grados" && "Módulos por Grado"}
            {activeTab === "alumnos" && "Gestión de Alumnos"}
            {activeTab === "historial" && "Historial de Asistencias"}
          </h1>
          <p className="text-purple-400 mt-1 text-sm">
            {activeTab === "grados" && "Genera y comparte el QR único por sección. Cada QR bloquea el marcado a su grado específico."}
            {activeTab === "alumnos" && "Registra, edita y organiza los alumnos por sección."}
            {activeTab === "historial" && "Consulta, filtra y exporta registros. La hora de cada registro proviene del servidor institucional."}
          </p>
        </div>

        {/* ════════════════════════ TAB: GRADOS / QR ════════════════════════ */}
        {activeTab === "grados" && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
              >
                <IconPlus className="w-4 h-4" />
                Nueva Sección
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
              {grades.map((grade) => (
                <GradeCard
                  key={grade.id}
                  grade={grade}
                  onEdit={handleEditGrade}
                  onDelete={handleDeleteGrade}
                />
              ))}
            </div>
            {showNewModal && (
              <NewGradeModal
                onAdd={handleAddGrade}
                onClose={() => setShowNewModal(false)}
              />
            )}
          </>
        )}

        {/* ════════════════════════ TAB: ALUMNOS ══════════════════════════ */}
        {activeTab === "alumnos" && (
          <StudentsPanel grades={grades} />
        )}

        {/* ════════════════════════ TAB: HISTORIAL ════════════════════════ */}
        {activeTab === "historial" && (
          <div className="animate-fade-in">
            {/* Barra de filtros */}
            <FilterBar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
              onSearch={handleSearch}
              hasRecords={records.length > 0}
              loading={loading}
            />

            {/* Botón exportar asistencia oficial */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
              >
                {exporting
                  ? <><span className="animate-spin">⏳</span> Generando…</>
                  : <><IconDownload className="w-4 h-4" /> Exportar Asistencia</>
                }
              </button>
            </div>

            {/* Stats rápidas — solo cuando hay datos */}
            {records.length > 0 && !loading && (
              <div className="flex flex-wrap gap-3 mb-5">
                <StatPill
                  label="Total registros"
                  value={stats.total}
                  color="#6d28d9"
                />
                <StatPill
                  label="Grados distintos"
                  value={stats.grados}
                  color="#4f46e5"
                />
                <StatPill
                  label="Fecha consultada"
                  value={new Date(selectedDate + "T12:00:00").toLocaleDateString(
                    "es-SV",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                  color="#7c3aed"
                />
              </div>
            )}

            {/* Tabla de registros */}
            <AttendanceTable
              records={records}
              loading={loading}
              error={fetchError}
              selectedDate={selectedDate}
            />
          </div>
        )}
      </main>
    </div>
  );
}
