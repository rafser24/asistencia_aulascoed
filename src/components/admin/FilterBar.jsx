/**
 * components/admin/FilterBar.jsx
 * Barra de filtros del historial de asistencias.
 * Permite filtrar por fecha y por grado/sección.
 */

import React from "react";
import { IconCalendar, IconSearch, IconDownload, IconChevronDown } from "../common/Icons.jsx";

const GRADES = [
  { id: "1A", label: "1er Año — Sección A" },
  { id: "1B", label: "1er Año — Sección B" },
  { id: "2A", label: "2do Año — Sección A" },
  { id: "2B", label: "2do Año — Sección B" },
  { id: "3A", label: "3er Año — Sección A" },
  { id: "3B", label: "3er Año — Sección B" },
];

export default function FilterBar({
  selectedDate,
  onDateChange,
  selectedGrade,
  onGradeChange,
  onSearch,
  onExport,
  hasRecords,
  loading,
}) {
  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        background: "linear-gradient(145deg, #1a1035 0%, #110d2a 100%)",
        border: "1px solid rgba(139,92,246,0.15)",
      }}
    >
      <div className="flex flex-wrap items-end gap-4">
        {/* Fecha */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
          <label className="text-purple-300 text-xs font-semibold flex items-center gap-1.5">
            <IconCalendar />
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(139,92,246,0.3)",
              colorScheme: "dark",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(109,40,217,0.7)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(139,92,246,0.3)")
            }
          />
        </div>

        {/* Grado */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
          <label className="text-purple-300 text-xs font-semibold flex items-center gap-1.5">
            <IconSearch />
            Grado / Sección
          </label>
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(139,92,246,0.3)",
                colorScheme: "dark",
              }}
            >
              <option value="all">Todos los grados</option>
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
              <IconChevronDown />
            </div>
          </div>
        </div>

        {/* Botón consultar */}
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
        >
          <IconSearch />
          {loading ? "Consultando…" : "Consultar"}
        </button>

        {/* Botón exportar CSV */}
        <button
          onClick={onExport}
          disabled={!hasRecords}
          className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
          style={{
            background: hasRecords
              ? "rgba(16,185,129,0.15)"
              : "rgba(255,255,255,0.04)",
            border: hasRecords
              ? "1px solid rgba(16,185,129,0.4)"
              : "1px solid rgba(255,255,255,0.08)",
            color: hasRecords ? "#34d399" : "#4a4060",
            cursor: hasRecords ? "pointer" : "not-allowed",
          }}
        >
          <IconDownload />
          Exportar CSV
        </button>
      </div>
    </div>
  );
}
