/**
 * services/csvService.js
 * Utilidad de exportación CSV usando URL.createObjectURL nativo del navegador.
 * Sin librerías de terceros.
 */

/**
 * Formatea un timestamp de Firestore a fecha y hora locales.
 * @param {import("firebase/firestore").Timestamp} ts
 * @returns {{ fecha: string, hora: string }}
 */
function formatTimestamp(ts) {
  const date = ts?.toDate ? ts.toDate() : new Date();
  return {
    fecha: date.toLocaleDateString("es-SV", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    hora: date.toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

/**
 * Genera y descarga automáticamente un archivo .csv
 * a partir del arreglo de registros de asistencia filtrados.
 *
 * Columnas: Nombre, Grado, Fecha, Hora Entrada, Estado
 *
 * @param {Array<Object>} data — Registros de asistencia
 * @param {string} dateStr — Fecha del reporte (para el nombre del archivo)
 */
export function exportarCSV(data, dateStr) {
  if (!data || data.length === 0) return;

  const HEADERS = ["Nombre", "Grado", "Fecha", "Hora Entrada", "Estado"];

  const rows = data.map((row) => {
    const { fecha, hora } = formatTimestamp(row.timestamp);
    return [
      `"${row.nombre || row.email || "Sin nombre"}"`,
      `"${row.grado || row.sala || "—"}"`,
      `"${fecha}"`,
      `"${hora}"`,
      `"${row.estado || "Presente"}"`,
    ].join(",");
  });

  // BOM \uFEFF garantiza que Excel abra el CSV en UTF-8 correctamente
  const csvContent = "\uFEFF" + [HEADERS.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `asistencia_coed_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar memoria del objeto URL
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
