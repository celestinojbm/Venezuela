// Utilidades de formato.

import { telVE } from "@/lib/contacto";

/** Tiempo relativo en español: "hace 5 min", "hace 2 h", "hace 3 d". */
export function tiempoRelativo(iso: string): string {
  const fecha = new Date(iso);
  const ahora = Date.now();
  const seg = Math.max(0, Math.floor((ahora - fecha.getTime()) / 1000));

  if (seg < 60) return "hace un momento";
  const min = Math.floor(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} d`;

  return fecha.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Hora corta para mensajes de chat: "14:32". */
export function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Construye un enlace de WhatsApp a partir de un teléfono libre. */
export function enlaceWhatsApp(telefono: string, mensaje?: string): string {
  // Normaliza a formato internacional (ej. 0414xxxxxxx -> 58414xxxxxxx).
  const numero = telVE(telefono) ?? telefono.replace(/[^\d]/g, "");
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${numero}${texto}`;
}

/** Distancia aproximada en km entre dos coordenadas (fórmula de Haversine). */
export function distanciaKm(
  a: [number, number],
  b: [number, number],
): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Une clases condicionales ignorando valores vacíos. */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}
