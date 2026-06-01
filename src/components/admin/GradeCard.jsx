/**
 * components/admin/GradeCard.jsx
 * Tarjeta de grado con QR único para el panel de administración.
 * Soporta: ampliar QR, copiar URL, descargar PNG, editar info, eliminar.
 */

import React, { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  IconQR, IconCopy, IconClipboardCheck,
  IconDownload, IconEdit, IconTrash,
} from "../common/Icons.jsx";

const APP_DOMAIN =
  import.meta.env.VITE_APP_DOMAIN || "https://asistencia-coed.netlify.app";

const COLORS = [
  "#6d28d9", "#4f46e5", "#7c3aed",
  "#5b21b6", "#4338ca", "#6366f1",
  "#0891b2", "#059669", "#dc2626",
];

export default function GradeCard({ grade, onEdit, onDelete }) {
  const { id, label, section, color } = grade;
  const qrUrl = `${APP_DOMAIN}/marcar?sala=${id}`;

  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ id, label, section, color });
  const canvasRef = useRef(null);

  // ── Copiar URL ──────────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback silencioso */ }
  };

  // ── Descargar QR como PNG ───────────────────────────────────────────────
  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${id}_${label.replace(/\s/g, "_")}_${section.replace(/\s/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Guardar edición ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.id.trim() || !form.label.trim() || !form.section.trim()) return;
    onEdit(id, { ...form, id: form.id.trim().toUpperCase() });
    setEditing(false);
  };

  // ── Eliminar ────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la sección "${label} — ${section}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: "linear-gradient(145deg, #1a1035 0%, #110d2a 100%)",
        border: `1px solid ${color}33`,
        boxShadow: expanded ? `0 0 40px ${color}22` : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Canvas oculto para descarga PNG */}
      <div ref={canvasRef} style={{ display: "none" }}>
        <QRCodeCanvas value={qrUrl} size={512} level="H" fgColor="#1a0a3e" bgColor="#ffffff" />
      </div>

      {/* ── Cabecera ── */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: `${color}15`, borderBottom: `1px solid ${color}22` }}
      >
        <div>
          <p className="text-white font-bold text-base leading-tight">{label}</p>
          <p className="text-purple-300 text-xs mt-0.5">{section}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-xs font-bold px-3 py-1 rounded-full font-mono"
            style={{ background: `${color}25`, color: "#c4b5fd", border: `1px solid ${color}45` }}
          >
            ID: {id}
          </div>
          {/* Editar */}
          <button
            onClick={() => { setForm({ id, label, section, color }); setEditing(true); }}
            className="p-1.5 rounded-lg text-purple-400 hover:text-white transition-colors"
            style={{ background: `${color}20` }}
            title="Editar sección"
          >
            <IconEdit className="w-3.5 h-3.5" />
          </button>
          {/* Eliminar */}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors"
            style={{ background: "rgba(220,38,38,0.12)" }}
            title="Eliminar sección"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Modal de edición ── */}
      {editing && (
        <div className="px-5 py-4 border-b" style={{ borderColor: `${color}22`, background: `${color}08` }}>
          <p className="text-purple-300 text-xs font-semibold mb-3">Editar sección</p>
          <div className="flex flex-col gap-2">
            <input
              value={form.id}
              onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
              placeholder="ID (ej: 4A)"
              maxLength={4}
              className="rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.3)" }}
            />
            <input
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="Año (ej: 4to Año)"
              className="rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.3)" }}
            />
            <input
              value={form.section}
              onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
              placeholder="Sección (ej: Sección C)"
              className="rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(139,92,246,0.3)" }}
            />
            {/* Selector de color */}
            <div className="flex gap-2 flex-wrap mt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: form.color === c ? `2px solid white` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-purple-300"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cuerpo ── */}
      <div className="p-5">
        {/* QR Code */}
        <div
          className="rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
          style={{
            background: "#ffffff",
            padding: expanded ? "20px" : "16px",
            minHeight: expanded ? 220 : 160,
          }}
        >
          <QRCodeSVG
            value={qrUrl}
            size={expanded ? 180 : 120}
            fgColor="#1a0a3e"
            bgColor="#ffffff"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* URL del QR */}
        <div
          className="rounded-lg px-3 py-2 mb-4 flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <IconQR className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <p className="text-purple-300 text-xs truncate flex-1 font-mono">{qrUrl}</p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: `${color}18`, color: "#c4b5fd", border: `1px solid ${color}35` }}
          >
            {expanded ? "Reducir" : "Ampliar QR"}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
            style={{ background: "rgba(109,40,217,0.2)", color: "#c4b5fd", border: "1px solid rgba(109,40,217,0.4)" }}
          >
            <IconDownload className="w-3.5 h-3.5" />
            Descargar
          </button>

          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
            style={{
              background: copied ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #6d28d9, #4f46e5)",
              color: copied ? "#34d399" : "#fff",
              border: copied ? "1px solid rgba(16,185,129,0.4)" : "none",
            }}
          >
            {copied ? <><IconClipboardCheck />Copiado</> : <><IconCopy />Copiar URL</>}
          </button>
        </div>
      </div>
    </div>
  );
}
