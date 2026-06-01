/**
 * theme.js
 * Paleta de colores pasteles para Asistencia COED.
 * Cada sección tiene su propio color pastel distintivo.
 */

// ── Paleta general ───────────────────────────────────────────────────────────
export const LIGHT = {
  bg:           "#f5f0ff",
  bgSecondary:  "#ede9fe",
  card:         "#ffffff",
  cardBorder:   "rgba(167,139,250,0.25)",
  cardShadow:   "0 4px 24px rgba(109,40,217,0.08)",
  text:         "#1e1b2e",
  textMuted:    "#7c6fa0",
  textFaint:    "#b8a8d8",
  accent:       "#7c3aed",
  accentLight:  "#ede9fe",
  accentBorder: "rgba(124,58,237,0.3)",
  input:        "rgba(109,40,217,0.06)",
  inputBorder:  "rgba(124,58,237,0.2)",
  divider:      "rgba(124,58,237,0.1)",
  success:      "#059669",
  successBg:    "#d1fae5",
  successBorder:"rgba(16,185,129,0.4)",
  warning:      "#d97706",
  warningBg:    "#fef3c7",
  error:        "#dc2626",
  errorBg:      "#fee2e2",
  errorBorder:  "rgba(220,38,38,0.4)",
};

export const DARK = {
  bg:           "#0a0814",
  bgSecondary:  "#130e2a",
  card:         "#1a1035",
  cardBorder:   "rgba(139,92,246,0.15)",
  cardShadow:   "0 4px 32px rgba(0,0,0,0.4)",
  text:         "#f0ebff",
  textMuted:    "#9d8cd0",
  textFaint:    "#5c4d8a",
  accent:       "#8b5cf6",
  accentLight:  "rgba(139,92,246,0.15)",
  accentBorder: "rgba(139,92,246,0.4)",
  input:        "rgba(255,255,255,0.06)",
  inputBorder:  "rgba(139,92,246,0.25)",
  divider:      "rgba(139,92,246,0.12)",
  success:      "#10b981",
  successBg:    "rgba(16,185,129,0.12)",
  successBorder:"rgba(16,185,129,0.35)",
  warning:      "#f59e0b",
  warningBg:    "rgba(245,158,11,0.1)",
  error:        "#ef4444",
  errorBg:      "rgba(220,38,38,0.12)",
  errorBorder:  "rgba(220,38,38,0.35)",
};

// ── Color único por sección ──────────────────────────────────────────────────
export const SECTION_COLORS = {
  "1A": {
    name: "Rosa",
    light: { bg: "#fce7f3", border: "#f9a8d4", accent: "#db2777", text: "#831843", pill: "#fce7f3", pillText: "#9d174d" },
    dark:  { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.4)", accent: "#f472b6", text: "#fbcfe8", pill: "rgba(236,72,153,0.25)", pillText: "#f9a8d4" },
  },
  "1B": {
    name: "Azul",
    light: { bg: "#dbeafe", border: "#93c5fd", accent: "#2563eb", text: "#1e40af", pill: "#dbeafe", pillText: "#1d4ed8" },
    dark:  { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)", accent: "#60a5fa", text: "#bfdbfe", pill: "rgba(59,130,246,0.25)", pillText: "#93c5fd" },
  },
  "2A": {
    name: "Menta",
    light: { bg: "#d1fae5", border: "#6ee7b7", accent: "#059669", text: "#065f46", pill: "#d1fae5", pillText: "#047857" },
    dark:  { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.4)", accent: "#34d399", text: "#a7f3d0", pill: "rgba(16,185,129,0.25)", pillText: "#6ee7b7" },
  },
  "2B": {
    name: "Lavanda",
    light: { bg: "#ede9fe", border: "#c4b5fd", accent: "#7c3aed", text: "#4c1d95", pill: "#ede9fe", pillText: "#5b21b6" },
    dark:  { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.4)", accent: "#a78bfa", text: "#ddd6fe", pill: "rgba(139,92,246,0.25)", pillText: "#c4b5fd" },
  },
  "3A": {
    name: "Durazno",
    light: { bg: "#ffedd5", border: "#fdba74", accent: "#ea580c", text: "#7c2d12", pill: "#ffedd5", pillText: "#9a3412" },
    dark:  { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)", accent: "#fb923c", text: "#fed7aa", pill: "rgba(249,115,22,0.25)", pillText: "#fdba74" },
  },
  "3B": {
    name: "Amarillo",
    light: { bg: "#fef9c3", border: "#fde047", accent: "#ca8a04", text: "#713f12", pill: "#fef9c3", pillText: "#854d0e" },
    dark:  { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.4)", accent: "#facc15", text: "#fef08a", pill: "rgba(234,179,8,0.25)", pillText: "#fde047" },
  },
};

/** Retorna los colores de sección correctos según el modo */
export function getSectionColor(salaId, isDark) {
  const s = SECTION_COLORS[salaId] || SECTION_COLORS["2B"];
  return isDark ? s.dark : s.light;
}

/** Retorna la paleta correcta según el modo */
export function getTheme(isDark) {
  return isDark ? DARK : LIGHT;
}
