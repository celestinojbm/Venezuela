// Puntos geolocalizados de la Red para el mapa: centros de acopio, centros de
// donación y recursos (los que traen coordenadas). Lectura en vivo desde
// redayuda.eriktaveras.com, server-side, cacheado. No se almacena nada.

import { ubicarVE } from "@/lib/geoVenezuela";

export const dynamic = "force-dynamic";

const RED_API = "https://redayuda.eriktaveras.com/api/records/search";
const TIPOS = ["centro_acopio", "centro_donacion", "recurso"];

type Raw = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function traerTipo(tipo: string) {
  const u = new URL(RED_API);
  u.searchParams.set("record_type", tipo);
  u.searchParams.set("limit", "100");
  u.searchParams.set("offset", "0");
  try {
    const r = await fetch(u, {
      headers: {
        accept: "application/json",
        "user-agent": "manos-venezuela/1.0 (+https://www.manosvenezuela.com)",
      },
      signal: AbortSignal.timeout(9000),
      next: { revalidate: 300 },
    });
    if (!r.ok) return [];
    const data = (await r.json()) as Raw;
    const results = Array.isArray(data.results) ? (data.results as Raw[]) : [];
    return results
      .map((row) => {
        const rec = (row.record ?? {}) as Raw;
        const id = str(rec.id);
        let lat = numOrNull(rec.latitude ?? rec.lat);
        let lng = numOrNull(rec.longitude ?? rec.lng);
        let aprox = false;
        // Si no hay coordenadas, ubicamos por ciudad/estado (aproximado).
        if (lat == null || lng == null) {
          const g = ubicarVE(str(rec.city), str(rec.state), id ?? str(rec.title) ?? "");
          if (g) {
            [lat, lng] = g;
            aprox = true;
          }
        }
        return {
          id,
          tipo: str(rec.record_type) ?? tipo,
          titulo: str(rec.title),
          resumen: str(rec.summary),
          lugar: str(rec.location_name) ?? str(rec.city),
          contacto: str(rec.contact),
          lat,
          lng,
          aprox,
          fuente: str(rec.source_name) ?? str(rec.origin_source),
          url: str(rec.url) ?? str(rec.source_url),
        };
      })
      .filter((p) => p.lat != null && p.lng != null && p.titulo);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const listas = await Promise.all(TIPOS.map(traerTipo));
    const puntos = listas.flat().slice(0, 500);
    return json({ count: puntos.length, puntos });
  } catch {
    return json({ count: 0, puntos: [] });
  }
}
