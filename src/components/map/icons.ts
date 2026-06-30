import L from "leaflet";
import { CATEGORIA_MAP, type CategoriaValue, type UrgenciaValue } from "@/lib/constants";

const COLOR_URGENCIA: Record<UrgenciaValue, string> = {
  critica: "#dc2626",
  alta: "#ea580c",
  media: "#f59e0b",
  baja: "#64748b",
};

/** Marcador circular con emoji de categoría y borde según urgencia. */
export function iconoSolicitud(category: CategoriaValue, urgency: UrgenciaValue): L.DivIcon {
  const emoji = CATEGORIA_MAP[category]?.emoji ?? "📍";
  const color = COLOR_URGENCIA[urgency] ?? "#64748b";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:34px;height:34px;border-radius:50%;
      background:#fff;border:3px solid ${color};
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,.25)">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

// Estilo de los marcadores de la Red por tipo de registro.
const RED_ESTILO: Record<string, { emoji: string; color: string }> = {
  refugio: { emoji: "🏠", color: "#2563eb" },
  centro_acopio: { emoji: "📦", color: "#d97706" },
  centro_donacion: { emoji: "💸", color: "#7c3aed" },
  recurso: { emoji: "🤝", color: "#0d9488" },
};

/** Marcador relleno (color por tipo) para los puntos de la Red. */
export function iconoRed(tipo: string): L.DivIcon {
  const e = RED_ESTILO[tipo] ?? { emoji: "📍", color: "#2563eb" };
  return L.divIcon({
    className: "",
    html: `<div style="
      width:30px;height:30px;border-radius:50%;
      background:${e.color};border:2px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.3)">${e.emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

/** Marcador para el punto que el usuario está seleccionando. */
export function iconoSeleccion(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:#ea580c;border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
  });
}
