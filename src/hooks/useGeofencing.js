/**
 * hooks/useGeofencing.js
 * Validación de ubicación GPS con fórmula de Haversine.
 * Compara la posición del alumno contra las coordenadas fijas del COED.
 */

import { useState, useEffect, useCallback } from "react";

// ── Coordenadas fijas del Centro Educativo ──────────────────────────────────
// Complejo Educativo Cantón Guadalupe La Zorra, San Luis La Herradura, La Paz, El Salvador
const SCHOOL = { lat: 13.3490383, lng: -88.88223185 };
const MAX_METROS = 100;

/**
 * Fórmula de Haversine — distancia en metros entre dos puntos GPS.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Radio de la Tierra en metros
  const rad = (d) => (d * Math.PI) / 180;

  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @typedef {'idle'|'loading'|'granted'|'out_of_range'|'denied'|'error'} GeoStatus
 *
 * @returns {{
 *   status: GeoStatus,
 *   distance: number|null,
 *   isWithinRange: boolean,
 *   errorMessage: string|null,
 *   userCoords: {lat:number,lng:number}|null,
 *   requestLocation: () => void
 * }}
 */
export function useGeofencing() {
  const [status, setStatus] = useState("idle");
  const [distance, setDistance] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Tu dispositivo no soporta geolocalización. Usa un navegador moderno.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setUserCoords({ lat, lng });

        const metros = Math.round(haversineDistance(lat, lng, SCHOOL.lat, SCHOOL.lng));
        setDistance(metros);

        if (metros <= MAX_METROS) {
          setStatus("granted");
        } else {
          setStatus("out_of_range");
          setErrorMessage(
            `Error de Ubicación: Debes estar físicamente en las instalaciones para marcar asistencia. ` +
            `Distancia actual: ${metros}m (máximo permitido: ${MAX_METROS}m).`
          );
        }
      },
      (err) => {
        const messages = {
          [err.PERMISSION_DENIED]:
            "Permiso de ubicación denegado. Autoriza el GPS para marcar asistencia.",
          [err.POSITION_UNAVAILABLE]:
            "No se pudo obtener tu ubicación. Verifica que el GPS esté activo.",
          [err.TIMEOUT]:
            "Tiempo de espera agotado al obtener la ubicación. Intenta de nuevo.",
        };
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setErrorMessage(messages[err.code] || "Error desconocido al acceder al GPS.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Sin caché: siempre posición fresca
      }
    );
  }, []);

  // Solicitar automáticamente al montar el componente
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    status,
    distance,
    isWithinRange: status === "granted",
    errorMessage,
    userCoords,
    requestLocation,
  };
}
