import { createClient } from "jsr:@supabase/supabase-js@2";

// Endpoint público de registro por teléfono + clave. Crea la cuenta ya
// confirmada (email_confirm: true) con la service role, para que el registro
// funcione sin depender del ajuste "Confirm email" del proyecto.
// Devuelve siempre 200 con { ok, error } para que el cliente lo maneje fácil.
//
// Desplegar con: supabase functions deploy registro --no-verify-jwt
// (debe ser invocable sin sesión, ya que el usuario aún no existe).

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "metodo_no_permitido" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "json_invalido" });
  }

  const telefono = String(body.telefono ?? "").trim();
  const clave = String(body.clave ?? "");
  const nombre = String(body.nombre ?? "").trim();
  const rol = String(body.rol ?? "ambos");

  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length < 7) return json({ ok: false, error: "telefono_invalido" });
  if (clave.length < 6) return json({ ok: false, error: "clave_corta" });

  const email = `${digitos}@telefono.manosvenezuela.app`;

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await admin.auth.admin.createUser({
      email,
      password: clave,
      email_confirm: true,
      user_metadata: { full_name: nombre, phone: telefono, role: rol },
    });
    if (error) {
      const yaExiste = /already|registered|exists|duplicate/i.test(error.message);
      return json({ ok: false, error: yaExiste ? "ya_existe" : "error", message: error.message });
    }
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: "error", message: String(e) }, 500);
  }
});
