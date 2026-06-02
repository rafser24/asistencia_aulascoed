/**
 * services/tokenService.js
 * Token QR diario determinista — no requiere Cloud Functions ni Firestore.
 *
 * El token se genera como:  SHA-256(fecha_hoy + ":" + sala + ":" + secret)
 * → Cambia automáticamente a medianoche porque la fecha cambia.
 * → Es único por sala y por día.
 * → No puede predecirse sin conocer VITE_QR_SECRET.
 */

const SECRET = import.meta.env.VITE_QR_SECRET || "COED_fallback_secret";

/**
 * Devuelve la fecha actual en formato YYYY-MM-DD (zona horaria local).
 */
function fechaHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Genera un token de 10 caracteres para la sala y fecha dados.
 * @param {string} sala  - ID de sección (ej: "3A")
 * @param {string} [fecha] - "YYYY-MM-DD", por defecto hoy
 * @returns {Promise<string>}
 */
export async function generarToken(sala, fecha = fechaHoy()) {
  const mensaje = `${fecha}:${sala}:${SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(mensaje);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Convertir a base36 (letras+números) y tomar 10 caracteres
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt("0x" + hex.slice(0, 15)).toString(36).slice(0, 10).toUpperCase();
}

/**
 * Valida si un token recibido coincide con el token esperado para hoy.
 * @param {string} sala
 * @param {string} tokenRecibido
 * @returns {Promise<boolean>}
 */
export async function validarToken(sala, tokenRecibido) {
  if (!tokenRecibido) return false;
  const esperado = await generarToken(sala);
  return tokenRecibido.toUpperCase() === esperado;
}
