import L from "leaflet";
import type { CategoriaValue, UrgenciaValue } from "@/lib/constants";

const COLOR_URGENCIA: Record<UrgenciaValue, string> = {
  critica: "#dc2626",
  alta: "#ea580c",
  media: "#f59e0b",
  baja: "#64748b",
};

// Pin tipo "gota" en SVG, con punto blanco al centro. Limpio y profesional.
function pin(color: string, size = 30): L.DivIcon {
  const w = size;
  const h = Math.round(size * 1.32);
  const html = `
    <div style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));line-height:0">
      <svg width="${w}" height="${h}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 7.7 12 20 12 20s12-12.3 12-20C24 5.373 18.627 0 12 0Z" fill="${color}"/>
        <circle cx="12" cy="12" r="4.4" fill="#fff"/>
      </svg>
    </div>`;
  return L.divIcon({
    className: "",
    html,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 4],
  });
}

/** Pin de una solicitud propia: color según urgencia. */
export function iconoSolicitud(_category: CategoriaValue, urgency: UrgenciaValue): L.DivIcon {
  return pin(COLOR_URGENCIA[urgency] ?? "#64748b", 32);
}

// Color de los marcadores de la Red por tipo de registro.
const RED_COLOR: Record<string, string> = {
  refugio: "#2563eb",
  centro_acopio: "#d97706",
  centro_donacion: "#7c3aed",
  recurso: "#0d9488",
};

/** Pin de un punto de la Red: color según tipo. */
export function iconoRed(tipo: string): L.DivIcon {
  return pin(RED_COLOR[tipo] ?? "#2563eb", 28);
}

/** Marcador para el punto que el usuario está seleccionando (azul de marca). */
export function iconoSeleccion(): L.DivIcon {
  return pin("#1A56DB", 32);
}
