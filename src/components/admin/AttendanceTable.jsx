/**
 * components/admin/AttendanceTable.jsx
 * Tabla de registros de asistencia con estados:
 *   loading → skeleton | empty → empty state | data → tabla
 */

import React from "react";
import { IconLoader } from "../common/Icons.jsx";

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.07)" }}>
      {[40, 28, 20, 20, 16].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="skeleton rounded-lg h-4"
            style={{ width: `${w}%`, minWidth: 60 }}
          />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ date }) {
  const formatted = new Date(date + "T12:00:00").toLocaleDateString("es-SV", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-20 text-center px-6">
      <div className="text-5xl mb-5">📋</div>
      <p className="text-white font-semibold text-base mb-1">
        Sin registros para esta fecha
      </p>
      <p className="text-purple-400 text-sm capitalize">{formatted}</p>
      <p className="text-purple-600 text-xs mt-2">
        Prueba seleccionando otro día o ajusta el filtro de grado.
      </p>
    </div>
  );
}

export default function AttendanceTable({ records, loading, error, selectedDate }) {
  const HEADERS = ["Nombre", "Grado", "Fecha", "Hora Entrada", "Estado"];

  const tableWrap = (children) => (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #1a1035 0%, #110d2a 100%)",
        border: "1px solid rgba(139,92,246,0.15)",
      }}
    >
      {children}
    </div>
  );

  if (error) {
    return tableWrap(
      <div className="py-16 text-center px-6">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return tableWrap(
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#6b5fa0" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!records.length) {
    return tableWrap(<EmptyState date={selectedDate} />);
  }

  return tableWrap(
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#6b5fa0" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row, i) => {
            const ts = row.timestamp?.toDate ? row.timestamp.toDate() : new Date();
            return (
              <tr
                key={row.id}
                className="transition-colors hover:bg-purple-900/10"
                style={{
                  borderBottom: "1px solid rgba(139,92,246,0.07)",
                  background: i % 2 === 0 ? "transparent" : "rgba(109,40,217,0.03)",
                }}
              >
                <td className="px-5 py-3.5 text-white font-medium">
                  {row.nombre || row.email || "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(109,40,217,0.18)", color: "#c4b5fd" }}
                  >
                    {row.grado || row.sala}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-purple-300 font-mono text-xs">
                  {ts.toLocaleDateString("es-SV")}
                </td>
                <td className="px-5 py-3.5 text-purple-200 font-mono text-xs font-semibold">
                  {ts.toLocaleTimeString("es-SV", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      color: "#34d399",
                      border: "1px solid rgba(16,185,129,0.25)",
                    }}
                  >
                    {row.estado || "Presente"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
