import { createClient } from "@supabase/supabase-js";

// Endpoint conector para la red federada "Red Humanitaria de Datos"
// (redayuda.eriktaveras.com). Modelo "pull": el nodo registra esta URL y la
// sincroniza periódicamente.
//
// Contrato del conector (GET público, sin auth, CORS abierto):
//   - Respuesta paginada: { items: [...], total: <n> } con ?limit= y ?offset=
//   - Cada item ya viene con los NOMBRES del esquema común de la red, así que
//     el mapeo al registrarla es identidad (title->title, etc.).
//   - Campo obligatorio del esquema: title.
//
// Solo datos PROPIOS y ya públicos (los mismos que se ven en la app).

export const dynamic = "force-dynamic";

const SITE = "https://www.manosvenezuela.com";
const SOURCE_ID = "manos_venezuela";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Content-Type": "application/json; charset=utf-8",
};

type Row = Record<string, unknown>;

function clampInt(raw: string | null, def: number, min: number, max: number): number {
  const n = raw == null ? NaN : parseInt(raw, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

// Una solicitud de ayuda de un damnificado -> registro del esquema común.
function itemSolicitud(r: Row) {
  return {
    id: `${SOURCE_ID}:solicitud:${r.id}`,
    record_type: "recurso",
    title: r.title,
    summary: r.description ?? null,
    person_name: r.author_name ?? null,
    organization: null,
    location_name: r.location_text ?? null,
    city: r.location_text ?? null,
    state: null,
    country: "Venezuela",
    latitude: r.lat ?? null,
    longitude: r.lng ?? null,
    contact: r.contact_phone ?? null,
    status: r.urgency ? `solicitud · urgencia ${r.urgency}` : "solicitud",
    verified: false,
    observed_at: r.created_at ?? null,
    updated_at: r.updated_at ?? r.created_at ?? null,
    source_record_id: String(r.id),
    tags: ["solicitud", "necesidad", String(r.category ?? ""), String(r.urgency ?? "")].filter(Boolean),
    image_url: null,
    url: `${SITE}/solicitudes/${r.id}`,
    source_id: SOURCE_ID,
    source_name: "Manos Venezuela",
  };
}

// Un ofrecimiento de voluntario -> registro del esquema común.
function itemVoluntario(r: Row) {
  return {
    id: `${SOURCE_ID}:voluntario:${r.id}`,
    record_type: "recurso",
    title: r.title,
    summary: r.description ?? null,
    person_name: r.author_name ?? null,
    organization: null,
    location_name: r.location_text ?? null,
    city: r.location_text ?? null,
    state: null,
    country: "Venezuela",
    latitude: r.lat ?? null,
    longitude: r.lng ?? null,
    contact: r.contact_phone ?? null,
    status: "voluntario disponible",
    verified: false,
    observed_at: r.created_at ?? null,
    updated_at: r.updated_at ?? r.created_at ?? null,
    source_record_id: String(r.id),
    tags: ["voluntario", "ofrecimiento", String(r.category ?? "")].filter(Boolean),
    image_url: null,
    url: SITE,
    source_id: SOURCE_ID,
    source_name: "Manos Venezuela",
  };
}

export function OPTIONS() {
  return new Response(null, { headers: cors });
}

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return new Response(JSON.stringify({ error: "Supabase no configurado", items: [], total: 0 }), {
      status: 503,
      headers: cors,
    });
  }

  const { searchParams } = new URL(req.url);
  const limit = clampInt(searchParams.get("limit"), 100, 1, 500);
  const offset = clampInt(searchParams.get("offset"), 0, 0, 1_000_000);

  const sb = createClient(url, key);
  const [solicitudes, voluntarios] = await Promise.all([
    sb.from("requests").select("*").eq("status", "abierta").order("created_at", { ascending: false }).limit(5000),
    sb.from("volunteer_listings").select("*").eq("status", "activo").order("created_at", { ascending: false }).limit(5000),
  ]);

  // Lista unificada y ordenada; la paginación se aplica sobre el conjunto.
  const all = [
    ...((solicitudes.data as Row[]) ?? []).map(itemSolicitud),
    ...((voluntarios.data as Row[]) ?? []).map(itemVoluntario),
  ];
  const total = all.length;
  const items = all.slice(offset, offset + limit);

  const body = {
    source: {
      id: SOURCE_ID,
      name: "Manos Venezuela",
      kind: "recurso",
      description:
        "Solicitudes de ayuda de damnificados y ofrecimientos de voluntarios publicados en manosvenezuela.com.",
      url: SITE,
    },
    generated_at: new Date().toISOString(),
    total,
    count: items.length,
    limit,
    offset,
    items,
  };

  return new Response(JSON.stringify(body), { headers: cors });
}
