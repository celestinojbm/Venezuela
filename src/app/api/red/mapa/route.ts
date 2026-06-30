// Puntos geolocalizados de la Red para el mapa: refugios, centros de acopio,
// centros de donación y recursos. Lectura en vivo desde redayuda.eriktaveras.com,
// server-side y cacheado. No se almacena nada.
//
// Los refugios viven dentro del tipo "recurso" en la Red, así que se detectan
// buscando q="refugio" y se etiquetan aparte. Muchos puntos no traen
// coordenadas pero sí ciudad/estado: en ese caso se ubican de forma aproximada.

import { ubicarVE } from "@/lib/geoVenezuela";

export const dynamic = "force-dynamic";

const RED_API = "https://redayuda.eriktaveras.com/api/records/search";

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

function aPunto(rec: Raw, tipoForzado?: string) {
  const id = str(rec.id);
  let lat = numOrNull(rec.latitude ?? rec.lat);
  let lng = numOrNull(rec.longitude ?? rec.lng);
  let aprox = false;
  // Sin coordenadas exactas -> ubicación aproximada por ciudad/estado.
  if (lat == null || lng == null) {
    const g = ubicarVE(str(rec.city), str(rec.state), id ?? str(rec.title) ?? "");
    if (g) {
      [lat, lng] = g;
      aprox = true;
    }
  }
  return {
    id,
    tipo: tipoForzado ?? str(rec.record_type),
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
}

async function buscar(opts: { record_type?: string; q?: string; tipoForzado?: string }) {
  const u = new URL(RED_API);
  if (opts.record_type) u.searchParams.set("record_type", opts.record_type);
  if (opts.q) u.searchParams.set("q", opts.q);
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
      .map((row) => aPunto((row.record ?? {}) as Raw, opts.tipoForzado))
      .filter((p) => p.lat != null && p.lng != null && p.titulo);
  } catch {
    return [];
  }
}

// Opción 2: coordenadas exactas desde la API de Venezuela Solidaria.
// Esa fuente ya llega por la Red, pero a veces sin coordenadas; su API propia sí
// las trae, así que la usamos SOLO para afinar la ubicación de sus puntos.
// Defensivo: si la API no responde, devolvemos un mapa vacío (no se afina nada).
const VS_API = "https://www.venezuelasolidaria.com/api/v1/resources";
const VS_PREFIJO = "venezuela_solidaria:";

async function coordsVenezuelaSolidaria(): Promise<Map<string, [number, number]>> {
  const m = new Map<string, [number, number]>();
  try {
    const u = new URL(VS_API);
    u.searchParams.set("limit", "200");
    const r = await fetch(u, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 ManosVenezuela/1.0 (+https://www.manosvenezuela.com)",
      },
      signal: AbortSignal.timeout(9000),
      next: { revalidate: 300 },
    });
    if (!r.ok) return m;
    const data = (await r.json()) as Raw;
    const items = Array.isArray(data.items) ? (data.items as Raw[]) : [];
    for (const it of items) {
      const id = str(it.id);
      const lat = numOrNull(it.lat);
      const lng = numOrNull(it.lng);
      if (id && lat != null && lng != null) m.set(id, [lat, lng]);
    }
  } catch {
    /* ignore: dejamos las coordenadas como estén */
  }
  return m;
}

export async function GET() {
  try {
    const [refugios, acopio, donacion, recurso, vsCoords] = await Promise.all([
      buscar({ record_type: "recurso", q: "refugio", tipoForzado: "refugio" }),
      buscar({ record_type: "centro_acopio" }),
      buscar({ record_type: "centro_donacion" }),
      buscar({ record_type: "recurso" }),
      coordsVenezuelaSolidaria(),
    ]);

    // Dedupe por id (refugios primero, para que conserven su etiqueta).
    const vistos = new Set<string>();
    const puntos: ReturnType<typeof aPunto>[] = [];
    for (const p of [...refugios, ...acopio, ...donacion, ...recurso]) {
      const k = p.id ?? `${p.titulo}|${p.lat}|${p.lng}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      puntos.push(p);
    }

    // Afinar coordenadas de los puntos de Venezuela Solidaria con su API.
    let afinados = 0;
    if (vsCoords.size > 0) {
      for (const p of puntos) {
        if (p.id && p.id.startsWith(VS_PREFIJO)) {
          const exact = vsCoords.get(p.id.slice(VS_PREFIJO.length));
          if (exact) {
            [p.lat, p.lng] = exact;
            p.aprox = false;
            afinados++;
          }
        }
      }
    }

    return json({ count: puntos.length, afinados, puntos: puntos.slice(0, 600) });
  } catch {
    return json({ count: 0, puntos: [] });
  }
}
