import React, { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (!offline) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "#1e1b2e", borderBottom: "2px solid #f59e0b",
      padding: "10px 16px", display: "flex", alignItems: "center",
      justifyContent: "center", gap: "8px",
      fontSize: "13px", fontWeight: 600, color: "#fcd34d",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      📡 Sin conexión a internet — algunas funciones no estarán disponibles
    </div>
  );
}
