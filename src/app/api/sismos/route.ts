// Proxy a la alimentación pública del USGS (sin API key) para mostrar la
// actividad sísmica reciente cerca de Venezuela. Se filtra a la zona en el
// servidor y se devuelve un payload pequeño (amable con redes móviles malas).

export const dynamic = "force-dynamic";

// Feed oficial USGS: todos los sismos M2.5+ de la última semana.
const USGS = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Recuadro aproximado de Venezuela (un poco holgado).
const LAT_MIN = 0;
const LAT_MAX = 13.5;
const LON_MIN = -74;
const LON_MAX = -59;

type Feature = {
  properties?: { mag?: number; place?: string; time?: number; url?: string };
  geometry?: { coordinates?: number[] };
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function GET() {
  try {
    const r = await fetch(USGS, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(9000),
      next: { revalidate: 300 }, // USGS actualiza cada pocos minutos
    });
    if (!r.ok) return json({ ultimo: null, count: 0 });

    const data = (await r.json()) as { features?: Feature[] };
    const feats = Array.isArray(data.features) ? data.features : [];

    const enZona = feats
      .map((f) => {
        const c = f.geometry?.coordinates ?? [];
        const lng = typeof c[0] === "number" ? c[0] : null;
        const lat = typeof c[1] === "number" ? c[1] : null;
        return {
          mag: typeof f.properties?.mag === "number" ? f.properties.mag : null,
          lugar: f.properties?.place ?? null,
          tiempo: typeof f.properties?.time === "number" ? f.properties.time : null,
          url: f.properties?.url ?? null,
          lat,
          lng,
        };
      })
      .filter(
        (s) =>
          s.lat != null &&
          s.lng != null &&
          s.lat >= LAT_MIN &&
          s.lat <= LAT_MAX &&
          s.lng >= LON_MIN &&
          s.lng <= LON_MAX,
      )
      .sort((a, b) => (b.tiempo ?? 0) - (a.tiempo ?? 0));

    const maxMag = enZona.reduce((m, s) => (s.mag != null && s.mag > m ? s.mag : m), 0);

    return json({
      ultimo: enZona[0] ?? null,
      count: enZona.length,
      max_mag: maxMag || null,
      recientes: enZona.slice(0, 5),
    });
  } catch {
    return json({ ultimo: null, count: 0 });
  }
}
