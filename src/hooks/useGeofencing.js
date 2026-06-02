/**
 * hooks/useGeofencing.js
 * Validación de ubicación con radio adaptativo según precisión del sensor.
 *
 * Lógica de radio:
 *  - GPS / WiFi fino (accuracy ≤ 100m)  → radio estricto: 350m
 *  - WiFi grueso   (100m < accuracy ≤ 300m) → radio ampliado: accuracy × 2
 *  - Antena celular (accuracy > 300m)    → radio = accuracy × 1.5 (zona amplia)
 *    pero se muestra aviso de baja precisión al alumno.
 *
 * El radio nunca supera 1500m para evitar abusos.
 */

import { useState, useEffect, useCallback } from "react";

const SCHOOL     = { lat: 13.3490383, lng: -88.88223185 };
const RADIO_BASE = 350;   // metros — cuando la señal es confiable
const RADIO_MAX  = 1500;  // metros — tope absoluto de seguridad

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Clasifica la calidad de la señal según el valor `accuracy` del navegador.
 * @param {number} accuracy - metros de incertidumbre reportados por el navegador
 * @returns {{ label: string, radio: number, aviso: string|null }}
 */
function calcularRadio(accuracy) {
  if (accuracy <= 100) {
    return { label: "GPS/WiFi preciso", radio: RADIO_BASE, aviso: null };
  }
  if (accuracy <= 300) {
    const radio = Math.min(accuracy * 2, RADIO_MAX);
    return {
      label: "WiFi / señal media",
      radio,
      aviso: `Señal con precisión moderada (±${Math.round(accuracy)}m). Radio ampliado automáticamente.`,
    };
  }
  // Antena celular — precisión muy baja
  const radio = Math.min(accuracy * 1.5, RADIO_MAX);
  return {
    label: "Señal celular (baja precisión)",
    radio,
    aviso: `Señal de antena celular detectada (±${Math.round(accuracy)}m). Se amplió el radio de verificación. Si el error persiste, conéctate al WiFi del centro.`,
  };
}

export function useGeofencing() {
  const [status, setStatus]           = useState("idle");
  const [distance, setDistance]       = useState(null);
  const [accuracy, setAccuracy]       = useState(null);
  const [signalLabel, setSignalLabel] = useState(null);
  const [signalAviso, setSignalAviso] = useState(null);
  const [userCoords, setUserCoords]   = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Tu dispositivo no soporta geolocalización.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = coords;
        setUserCoords({ lat, lng });
        setAccuracy(Math.round(acc));

        const metros = Math.round(haversineDistance(lat, lng, SCHOOL.lat, SCHOOL.lng));
        setDistance(metros);

        const { label, radio, aviso } = calcularRadio(acc);
        setSignalLabel(label);
        setSignalAviso(aviso);

        if (metros <= radio) {
          setStatus("granted");
        } else {
          setStatus("out_of_range");
          setErrorMessage(
            `Debes estar físicamente en las instalaciones. ` +
            `Distancia actual: ${metros}m (radio permitido: ${radio}m). ` +
            (aviso ? aviso : "")
          );
        }
      },
      (err) => {
        const messages = {
          [err.PERMISSION_DENIED]: "Permiso de ubicación denegado. Autoriza el GPS para continuar.",
          [err.POSITION_UNAVAILABLE]: "No se pudo obtener tu ubicación. Verifica que el GPS esté activo.",
          [err.TIMEOUT]: "Tiempo de espera agotado. Intenta de nuevo.",
        };
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setErrorMessage(messages[err.code] || "Error desconocido al acceder al GPS.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  return {
    status,
    distance,
    accuracy,
    signalLabel,
    signalAviso,
    isWithinRange: status === "granted",
    errorMessage,
    userCoords,
    requestLocation,
  };
}
