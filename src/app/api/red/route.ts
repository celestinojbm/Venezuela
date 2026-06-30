// Proxy de lectura a la "Red Humanitaria de Datos" (redayuda.eriktaveras.com).
// Manos Venezuela NO copia ni almacena estos datos: los consulta en vivo y los
// muestra atribuidos a su fuente. Este route corre en el servidor (sin CORS),
// normaliza la respuesta y cachea unos segundos para no saturar el nodo.

export const dynamic = "force-dynamic";

const RED_API = "https://redayuda.eriktaveras.com/api/records/search";

type Raw = Record<string, unknown>;

function clampInt(raw: string | null, def: number, min: number, max: number): number {
  const n = raw == null ? NaN : parseInt(raw, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

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

// Aplana un resultado de la red a lo mínimo que mostramos (sin campos crudos
// específicos de cada fuente, para no re-exponer datos de más).
function normalizar(row: Raw) {
  const rec = (row.record ?? {}) as Raw;
  return {
    id: str(rec.id),
    tipo: str(rec.record_type),
    titulo: str(rec.title),
    resumen: str(rec.summary),
    persona: str(rec.person_name),
    lugar: str(rec.location_name) ?? str(rec.city),
    ciudad: str(rec.city),
    estado: str(rec.status) ?? str(rec.estado),
    contacto: str(rec.contact) ?? str(rec.reporta_contacto) ?? str(rec.pv_contacto),
    lat: numOrNull(rec.latitude ?? rec.ultima_lat ?? rec.lat),
    lng: numOrNull(rec.longitude ?? rec.ultima_lng ?? rec.lng),
    fuente: str(rec.source_name) ?? str(rec.origin_source),
    fuente_id: str(rec.source_id) ?? str(rec.origin_source),
    url: str(rec.url) ?? str(rec.source_url),
    imagen: str(rec.image_url) ?? str(rec.photo_url),
    tambien_en: typeof row.also_in_count === "number" ? row.also_in_count : 0,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").slice(0, 180);
  const tipo = (searchParams.get("tipo") ?? "").slice(0, 80);
  const limit = clampInt(searchParams.get("limit"), 24, 1, 60);
  const offset = clampInt(searchParams.get("offset"), 0, 0, 100_000);

  const upstream = new URL(RED_API);
  if (q) upstream.searchParams.set("q", q);
  upstream.searchParams.set("limit", String(limit));
  upstream.searchParams.set("offset", String(offset));
  if (tipo) upstream.searchParams.set("record_type", tipo);

  try {
    const r = await fetch(upstream, {
      headers: {
        accept: "application/json",
        "user-agent": "manos-venezuela/1.0 (+https://www.manosvenezuela.com)",
      },
      signal: AbortSignal.timeout(9000),
      // Caché breve a nivel de fetch: alivia el nodo si varios buscan lo mismo.
      next: { revalidate: 45 },
    });

    if (!r.ok) {
      return json({ error: "red_no_disponible", items: [], total: 0 }, 200);
    }

    const data = (await r.json()) as Raw;
    const results = Array.isArray(data.results) ? (data.results as Raw[]) : [];
    const items = results.map(normalizar).filter((it) => it.titulo);

    return json(
      {
        query: str(data.query) ?? q,
        total: typeof data.total_matches === "number" ? data.total_matches : items.length,
        count: items.length,
        offset,
        limit,
        next_offset: offset + items.length,
        tipos: Array.isArray(data.record_types) ? data.record_types : [],
        fuentes: typeof data.source_count === "number" ? data.source_count : null,
        items,
      },
      200,
    );
  } catch {
    return json({ error: "fetch", items: [], total: 0 }, 200);
  }
}
