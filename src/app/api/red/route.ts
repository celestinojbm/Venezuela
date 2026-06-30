// Proxy de lectura a la "Red Humanitaria de Datos" (redayuda.eriktaveras.com).
// Manos Venezuela NO copia ni almacena estos datos: los consulta en vivo y los
// muestra atribuidos a su fuente. Este route corre en el servidor (sin CORS),
// normaliza la respuesta y cachea unos segundos para no saturar el nodo.

import { telVE } from "@/lib/contacto";

export const dynamic = "force-dynamic";

const RED_API = "https://redayuda.eriktaveras.com/api/records/search";
const VENTANA = 240; // máx. de resultados que reordenamos (contactables primero)

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

// Trae una página del upstream (máx. 100). Devuelve results + metadatos, o null.
async function traerPagina(q: string, tipo: string, offset: number) {
  const upstream = new URL(RED_API);
  if (q) upstream.searchParams.set("q", q);
  upstream.searchParams.set("limit", "100");
  upstream.searchParams.set("offset", String(offset));
  if (tipo) upstream.searchParams.set("record_type", tipo);

  const r = await fetch(upstream, {
    headers: {
      accept: "application/json",
      "user-agent": "manos-venezuela/1.0 (+https://www.manosvenezuela.com)",
    },
    signal: AbortSignal.timeout(9000),
    next: { revalidate: 45 }, // cacheado: la ventana se reconstruye solo cada 45s
  });
  if (!r.ok) return null;
  const data = (await r.json()) as Raw;
  return {
    results: Array.isArray(data.results) ? (data.results as Raw[]) : [],
    total: typeof data.total_matches === "number" ? data.total_matches : 0,
    tipos: Array.isArray(data.record_types) ? (data.record_types as string[]) : [],
    fuentes: typeof data.source_count === "number" ? data.source_count : null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").slice(0, 180);
  const tipo = (searchParams.get("tipo") ?? "").slice(0, 80);
  const limit = clampInt(searchParams.get("limit"), 24, 1, 60);
  const offset = clampInt(searchParams.get("offset"), 0, 0, 100_000);

  try {
    // 1) Trae una ventana de hasta VENTANA resultados (paginando el upstream).
    const ventana: ReturnType<typeof normalizar>[] = [];
    let total = 0;
    let tipos: string[] = [];
    let fuentes: number | null = null;
    for (let off = 0; off < VENTANA; off += 100) {
      const pagina = await traerPagina(q, tipo, off);
      if (!pagina) {
        if (off === 0) {
          return json({ error: "red_no_disponible", items: [], total: 0, has_more: false }, 200);
        }
        break;
      }
      if (off === 0) {
        total = pagina.total;
        tipos = pagina.tipos;
        fuentes = pagina.fuentes;
      }
      ventana.push(...pagina.results.map(normalizar).filter((it) => it.titulo));
      if (pagina.results.length < 100) break; // ya no hay más resultados
    }

    // 2) Reordena estable: los que tienen WhatsApp primero (global, no por página).
    const con = ventana.filter((it) => telVE(it.contacto));
    const sin = ventana.filter((it) => !telVE(it.contacto));
    const ordenados = [...con, ...sin];

    // 3) Pagina sobre la lista YA ordenada: estable entre cargas (no se reacomoda).
    const slice = ordenados.slice(offset, offset + limit);
    const has_more = offset + limit < ordenados.length;

    return json({
      query: q,
      total: total || ordenados.length,
      ventana: ordenados.length,
      count: slice.length,
      offset,
      limit,
      has_more,
      tipos,
      fuentes,
      items: slice,
    });
  } catch {
    return json({ error: "fetch", items: [], total: 0, has_more: false }, 200);
  }
}
