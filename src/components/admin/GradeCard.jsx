/**
 * components/admin/GradeCard.jsx
 * Tarjeta de grado con QR — soporte tema pastel claro/oscuro.
 */

import React, { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme, getSectionColor } from "../../theme.js";
import { IconQR, IconCopy, IconClipboardCheck, IconDownload, IconEdit, IconTrash } from "../common/Icons.jsx";

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || "https://asistencia-coed.netlify.app";

const COLORS = ["#6d28d9","#4f46e5","#7c3aed","#5b21b6","#4338ca","#6366f1","#0891b2","#059669","#dc2626"];

export default function GradeCard({ grade, onEdit, onDelete }) {
  const { id, label, section, color } = grade;
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const sc = getSectionColor(id, isDark);
  const qrUrl = `${APP_DOMAIN}/marcar?sala=${id}`;

  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ id, label, section, color });
  const canvasRef = useRef(null);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(qrUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* silent */ }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `QR_${id}_${label.replace(/\s/g,"_")}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleSave = () => {
    if (!form.id.trim() || !form.label.trim() || !form.section.trim()) return;
    onEdit(id, { ...form, id: form.id.trim().toUpperCase() });
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la sección "${label} — ${section}"?`)) onDelete(id);
  };

  const inputStyle = {
    borderRadius: "10px", padding: "8px 12px", fontSize: "13px",
    outline: "none", width: "100%", color: t.text,
    background: t.input, border: `1px solid ${t.inputBorder}`,
  };

  return (
    <div style={{
      borderRadius: "20px", overflow: "hidden",
      background: isDark ? "linear-gradient(145deg, #1a1035, #110d2a)" : t.card,
      border: `1.5px solid ${sc.border}`,
      boxShadow: expanded
        ? `0 0 32px ${sc.accent}22`
        : isDark ? "0 4px 20px rgba(0,0,0,0.3)" : `0 4px 20px ${sc.accent}12`,
      transition: "all 0.2s",
    }}>
      {/* Canvas oculto para descarga */}
      <div ref={canvasRef} style={{ display: "none" }}>
        <QRCodeCanvas value={qrUrl} size={512} level="H" fgColor="#1a0a3e" bgColor="#ffffff" />
      </div>

      {/* Cabecera */}
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: sc.bg, borderBottom: `1px solid ${sc.border}`,
      }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: "15px", color: sc.text, margin: 0, lineHeight: 1.3 }}>{label}</p>
          <p style={{ fontSize: "12px", color: sc.text, opacity: 0.7, margin: "2px 0 0" }}>{section}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px",
            background: sc.pill, color: sc.pillText,
          }}>ID: {id}</span>
          <button onClick={() => { setForm({ id, label, section, color }); setEditing(true); }}
            style={{ padding: "6px", borderRadius: "8px", border: "none", cursor: "pointer", color: sc.accent, background: `${sc.accent}18` }}
            title="Editar">
            <IconEdit className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDelete}
            style={{ padding: "6px", borderRadius: "8px", border: "none", cursor: "pointer", color: isDark ? "#f87171" : "#dc2626", background: "rgba(220,38,38,0.1)" }}
            title="Eliminar">
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edición inline */}
      {editing && (
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${sc.border}`, background: sc.bg }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: sc.text, margin: "0 0 10px" }}>Editar sección</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} placeholder="ID (ej: 4A)" maxLength={4} style={inputStyle} />
            <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="Año" style={inputStyle} />
            <input value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} placeholder="Sección" style={inputStyle} />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm((p) => ({ ...p, color: c }))}
                  style={{ width: "24px", height: "24px", borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                    outline: form.color === c ? "2px solid " + t.text : "none", outlineOffset: "2px" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: "8px", borderRadius: "10px", fontSize: "12px", fontWeight: 700,
                color: "#fff", border: "none", cursor: "pointer",
                background: isDark ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : `linear-gradient(135deg, ${sc.accent}, ${sc.accent}cc)`,
              }}>Guardar</button>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: "8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600,
                color: t.textMuted, border: `1px solid ${t.cardBorder}`, cursor: "pointer", background: t.card,
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cuerpo */}
      <div style={{ padding: "20px" }}>
        {/* QR */}
        <div style={{
          borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
          background: "#ffffff", padding: expanded ? "20px" : "16px",
          minHeight: expanded ? 220 : 160, marginBottom: "14px",
          border: `1px solid ${sc.border}`,
        }}>
          <QRCodeSVG value={qrUrl} size={expanded ? 180 : 120} fgColor="#1a0a3e" bgColor="#ffffff" level="H" />
        </div>

        {/* URL */}
        <div style={{
          borderRadius: "10px", padding: "8px 12px", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "8px",
          background: sc.bg, border: `1px solid ${sc.border}`,
        }}>
          <IconQR style={{ width: 14, height: 14, color: sc.accent, flexShrink: 0 }} />
          <p style={{ fontSize: "11px", color: sc.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
            {qrUrl}
          </p>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setExpanded((p) => !p)} style={{
            flex: 1, padding: "10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", border: `1px solid ${sc.border}`, background: sc.bg, color: sc.text,
          }}>{expanded ? "Reducir" : "Ampliar QR"}</button>

          <button onClick={handleDownload} style={{
            flex: 1, padding: "10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", border: `1px solid ${sc.border}`, background: sc.bg, color: sc.text,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            <IconDownload style={{ width: 13, height: 13 }} /> Descargar
          </button>

          <button onClick={handleCopy} style={{
            flex: 1, padding: "10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", border: "none", color: "#fff",
            background: copied ? (isDark ? "rgba(16,185,129,0.7)" : "#059669") : `linear-gradient(135deg, ${sc.accent}, ${sc.accent}cc)`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            boxShadow: `0 4px 12px ${sc.accent}33`,
          }}>
            {copied ? <><IconClipboardCheck />Copiado</> : <><IconCopy />Copiar URL</>}
          </button>
        </div>
      </div>
    </div>
  );
}
