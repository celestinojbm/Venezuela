import { createClient } from "@supabase/supabase-js";

// Endpoint conector para la red federada "Red Humanitaria de Datos"
// (github.com/eriktaveras/redayuda). Expone las solicitudes y voluntarios de
// Manos Venezuela en el formato { source, records } que acepta /api/ingest.
//
// Solo datos PROPIOS y ya públicos (los mismos que se ven en la app).
// Un nodo de la red puede leer este endpoint y registrarlo como fuente.

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

function recordSolicitud(r: Row) {
  return {
    id: `${SOURCE_ID}:solicitud:${r.id}`,
    record_type: "solicitud_ayuda",
    title: r.title,
    summary: r.description ?? null,
    category: r.category,
    urgency: r.urgency,
    city: r.location_text ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    contact_phone: r.contact_phone ?? null,
    person_name: r.author_name ?? null,
    url: `${SITE}/solicitudes/${r.id}`,
    source_id: SOURCE_ID,
    source_name: "Manos Venezuela",
    updated_at: r.updated_at ?? r.created_at ?? null,
    tags: ["necesidad", "solicitud", String(r.category ?? ""), String(r.urgency ?? "")].filter(Boolean),
  };
}

function recordVoluntario(r: Row) {
  return {
    id: `${SOURCE_ID}:voluntario:${r.id}`,
    record_type: "ofrecimiento_ayuda",
    title: r.title,
    summary: r.description ?? null,
    category: r.category,
    city: r.location_text ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    contact_phone: r.contact_phone ?? null,
    person_name: r.author_name ?? null,
    url: SITE,
    source_id: SOURCE_ID,
    source_name: "Manos Venezuela",
    updated_at: r.updated_at ?? r.created_at ?? null,
    tags: ["voluntario", "ofrecimiento", String(r.category ?? "")].filter(Boolean),
  };
}

export function OPTIONS() {
  return new Response(null, { headers: cors });
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return new Response(JSON.stringify({ error: "Supabase no configurado" }), {
      status: 503,
      headers: cors,
    });
  }

  const sb = createClient(url, key);
  const [solicitudes, voluntarios] = await Promise.all([
    sb.from("requests").select("*").eq("status", "abierta").order("created_at", { ascending: false }).limit(2000),
    sb.from("volunteer_listings").select("*").eq("status", "activo").order("created_at", { ascending: false }).limit(2000),
  ]);

  const records = [
    ...((solicitudes.data as Row[]) ?? []).map(recordSolicitud),
    ...((voluntarios.data as Row[]) ?? []).map(recordVoluntario),
  ];

  const body = {
    source: {
      id: SOURCE_ID,
      name: "Manos Venezuela",
      kind: "solicitudes_voluntarios",
      description: "Solicitudes de ayuda y voluntarios publicados en manosvenezuela.com",
      url: SITE,
    },
    generated_at: new Date().toISOString(),
    count: records.length,
    records,
  };

  return new Response(JSON.stringify(body), { headers: cors });
}
