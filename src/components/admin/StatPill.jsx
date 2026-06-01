/**
 * components/admin/StatPill.jsx
 * Indicadores de estadísticas rápidas para el dashboard.
 */

import React from "react";

export default function StatPill({ label, value, color = "#6d28d9" }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 rounded-xl animate-fade-in"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <div>
        <p className="text-purple-400 text-xs leading-none">{label}</p>
        <p className="text-white font-bold text-lg leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}
