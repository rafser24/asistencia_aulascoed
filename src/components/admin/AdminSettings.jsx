/**
 * components/admin/AdminSettings.jsx
 * Panel de configuración: gestión de admins + logs de auditoría.
 */

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getTheme } from "../../theme.js";
import { IconLoader, IconCheck, IconTrash, IconPlus } from "../common/Icons.jsx";

// ── Gestión de admins ────────────────────────────────────────────────────────
function AdminsPanel({ t, isDark }) {
  const [emails, setEmails]   = useState([]);
  const [nuevo, setNuevo]     = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getDoc(doc(db, "config", "admins")).then((snap) => {
      if (snap.exists()) setEmails(snap.data().emails || []);
    }).finally(() => setLoading(false));
  }, []);

  const guardar = async (lista) => {
    setSaving(true);
    try { await setDoc(doc(db, "config", "admins"), { emails: lista }); }
    finally { setSaving(false); }
  };

  const agregar = async () => {
    const e = nuevo.trim().toLowerCase();
    if (!e || emails.includes(e)) return;
    const nueva = [...emails, e];
    setEmails(nueva); setNuevo("");
    await guardar(nueva);
  };

  const eliminar = async (email) => {
    const nueva = emails.filter((e) => e !== email);
    setEmails(nueva);
    await guardar(nueva);
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: 800, color: t.text, margin: "0 0 4px" }}>👤 Administradores</h3>
      <p style={{ fontSize: "12px", color: t.textMuted, margin: "0 0 14px" }}>
        Estos correos tienen acceso al panel admin
      </p>

      {loading ? <IconLoader style={{ width: 18, height: 18, color: t.textMuted }} /> : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
            {emails.map((e) => (
              <div key={e} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: "10px",
                background: t.input, border: `1px solid ${t.inputBorder}`,
              }}>
                <span style={{ fontSize: "13px", color: t.text, fontFamily: "monospace" }}>{e}</span>
                <button onClick={() => eliminar(e)} style={{
                  background: "none", border: "none", cursor: "pointer", color: isDark ? "#f87171" : "#dc2626", padding: "2px",
                }}>
                  <IconTrash style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregar()}
              placeholder="nuevo@correo.com"
              style={{
                flex: 1, borderRadius: "10px", padding: "9px 12px", fontSize: "13px",
                color: t.text, background: t.input, border: `1px solid ${t.inputBorder}`, outline: "none",
              }}
            />
            <button onClick={agregar} disabled={saving} style={{
              padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
              color: "#fff", border: "none", cursor: "pointer",
              background: isDark ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "linear-gradient(135deg,#a78bfa,#818cf8)",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              {saving ? <IconLoader style={{ width: 14, height: 14 }} /> : <IconPlus style={{ width: 14, height: 14 }} />}
              Agregar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Logs de auditoría ────────────────────────────────────────────────────────
const EVENTO_LABELS = {
  dispositivo_bloqueado: { label: "Dispositivo bloqueado", color: "#f87171", bg: "rgba(220,38,38,0.1)" },
  fuera_de_horario:      { label: "Fuera de horario",      color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
  token_invalido:        { label: "Token inválido",        color: "#f87171", bg: "rgba(220,38,38,0.1)" },
};

function AuditPanel({ t, isDark }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, "auditoria"), orderBy("timestamp", "desc"), limit(50)))
      .then((snap) => setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3 style={{ fontSize: "14px", fontWeight: 800, color: t.text, margin: "0 0 4px" }}>🔍 Logs de auditoría</h3>
      <p style={{ fontSize: "12px", color: t.textMuted, margin: "0 0 14px" }}>
        Últimos 50 eventos de seguridad registrados
      </p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
          <IconLoader style={{ width: 20, height: 20, color: t.textMuted }} />
        </div>
      ) : logs.length === 0 ? (
        <p style={{ fontSize: "13px", color: t.textFaint, textAlign: "center", padding: "20px 0" }}>
          Sin eventos registrados
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
          {logs.map((log) => {
            const ev = EVENTO_LABELS[log.evento] || { label: log.evento, color: t.textMuted, bg: t.input };
            const ts = log.timestamp?.toDate ? log.timestamp.toDate() : null;
            return (
              <div key={log.id} style={{
                padding: "10px 14px", borderRadius: "12px",
                background: isDark ? ev.bg : t.input,
                border: `1px solid ${t.cardBorder}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: ev.color }}>{ev.label}</span>
                  {ts && <span style={{ fontSize: "11px", color: t.textFaint, fontFamily: "monospace" }}>
                    {ts.toLocaleDateString("es-SV")} {ts.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" })}
                  </span>}
                </div>
                <p style={{ fontSize: "11px", color: t.textMuted, margin: 0 }}>
                  {log.email || log.uid || "—"} {log.detalle ? `· ${log.detalle}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Panel principal ──────────────────────────────────────────────────────────
export default function AdminSettings() {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      <div style={{
        borderRadius: "20px", padding: "24px",
        background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
        marginBottom: "16px",
      }}>
        <AdminsPanel t={t} isDark={isDark} />
      </div>
      <div style={{
        borderRadius: "20px", padding: "24px",
        background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow,
      }}>
        <AuditPanel t={t} isDark={isDark} />
      </div>
    </div>
  );
}
