import React from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme } from "../../theme.js";
import { IconCalendar, IconSearch, IconChevronDown } from "../common/Icons.jsx";

const GRADES = [
  { id: "1A", label: "1er Año — Sección A" },
  { id: "1B", label: "1er Año — Sección B" },
  { id: "2A", label: "2do Año — Sección A" },
  { id: "2B", label: "2do Año — Sección B" },
  { id: "3A", label: "3er Año — Sección A" },
  { id: "3B", label: "3er Año — Sección B" },
];

export default function FilterBar({ selectedDate, onDateChange, selectedGrade, onGradeChange, onSearch, hasRecords, loading }) {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const inputStyle = {
    borderRadius: "12px", padding: "10px 16px", fontSize: "13px",
    outline: "none", width: "100%", color: t.text,
    background: t.input, border: `1px solid ${t.inputBorder}`,
    colorScheme: isDark ? "dark" : "light",
  };

  return (
    <div style={{
      borderRadius: "20px", padding: "20px", marginBottom: "20px",
      background: t.card, border: `1px solid ${t.cardBorder}`,
      boxShadow: t.cardShadow,
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px" }}>
        {/* Fecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "180px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted, display: "flex", alignItems: "center", gap: "6px" }}>
            <IconCalendar /> Fecha
          </label>
          <input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = t.accent)}
            onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
          />
        </div>

        {/* Grado */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "180px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted, display: "flex", alignItems: "center", gap: "6px" }}>
            <IconSearch /> Grado / Sección
          </label>
          <div style={{ position: "relative" }}>
            <select value={selectedGrade} onChange={(e) => onGradeChange(e.target.value)}
              style={{ ...inputStyle, appearance: "none", paddingRight: "36px", cursor: "pointer" }}>
              <option value="all">Todos los grados</option>
              {GRADES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }}>
              <IconChevronDown />
            </div>
          </div>
        </div>

        {/* Consultar */}
        <button onClick={onSearch} disabled={loading} style={{
          padding: "10px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
          color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          background: isDark ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "linear-gradient(135deg, #a78bfa, #818cf8)",
          boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <IconSearch />
          {loading ? "Consultando…" : "Consultar"}
        </button>
      </div>
    </div>
  );
}
