import { createClient } from "npm:@supabase/supabase-js@2";

// Publicación pública con anti-spam (sin login, cero fricción para humanos):
// 1) Honeypot: si un campo oculto viene lleno, es bot -> se ignora.
// 2) Límite por dispositivo: máx. 3 publicaciones cada 10 min por IP (hash).
// 3) Reglas de contenido: largo y número de enlaces.
// Inserta con la service role (bypassa RLS) solo tras validar.
//
// Desplegar: supabase functions deploy publicar --no-verify-jwt

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("manosve:" + ip));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function urls(s: string): number {
  return (s.match(/https?:\/\/|www\./gi) || []).length;
}
const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const n = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "metodo" });

  try {
    const body = await req.json().catch(() => ({}));
    const tipo = body.tipo === "voluntario" ? "voluntario" : "solicitud";
    const honeypot = String(body.honeypot ?? "");
    const p = body.payload ?? {};

    // 1) Honeypot: bots llenan el campo oculto. Fingimos éxito y no insertamos.
    if (honeypot.trim() !== "") return json({ ok: true, ignored: true });

    // 3) Reglas de contenido
    const title = String(p.title ?? "").trim();
    const description = String(p.description ?? "").trim();
    const contact_phone = String(p.contact_phone ?? "").trim();
    if (title.length < 3 || title.length > 140) return json({ ok: false, error: "titulo" });
    if (description.length > 2000) return json({ ok: false, error: "descripcion" });
    if (!contact_phone) return json({ ok: false, error: "telefono" });
    if (urls(title + " " + description) > 2) return json({ ok: false, error: "enlaces" });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 2) Límite por dispositivo (IP hasheada)
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "desconocido";
    const ipHash = await hashIp(ip);
    const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("post_throttle")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", desde);
    if ((count ?? 0) >= 3) return json({ ok: false, error: "limite" });

    let res;
    if (tipo === "voluntario") {
      res = await admin.from("volunteer_listings").insert({
        author_name: s(p.author_name), title, description: s(description), category: p.category,
        location_text: s(p.location_text), contact_phone, lat: n(p.lat), lng: n(p.lng),
      }).select("id").single();
    } else {
      res = await admin.from("requests").insert({
        author_name: s(p.author_name), title, description: s(description), category: p.category,
        urgency: p.urgency, location_text: s(p.location_text), contact_phone,
        people_count: n(p.people_count), lat: n(p.lat), lng: n(p.lng),
      }).select("id").single();
    }
    if (res.error) return json({ ok: false, error: "db", message: res.error.message });

    await admin.from("post_throttle").insert({ ip_hash: ipHash });
    return json({ ok: true, id: res.data.id });
  } catch (e) {
    return json({ ok: false, error: "error", message: String(e) }, 200);
  }
});
