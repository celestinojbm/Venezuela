import { createClient } from "npm:@supabase/supabase-js@2";

// Registro público por teléfono + clave. Crea la cuenta ya confirmada con la
// service role, sin depender del ajuste "Confirm email". Devuelve 200 con
// { ok, error, message } para manejo simple en el cliente.
//
// Desplegar: supabase functions deploy registro --no-verify-jwt

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
  if (req.method !== "POST") return json({ ok: false, error: "metodo_no_permitido" });

  try {
    const body = await req.json().catch(() => ({}));
    const telefono = String(body.telefono ?? "").trim();
    const clave = String(body.clave ?? "");
    const nombre = String(body.nombre ?? "").trim();
    const rol = String(body.rol ?? "ambos");

    const digitos = telefono.replace(/\D/g, "");
    if (digitos.length < 7) return json({ ok: false, error: "telefono_invalido" });
    if (clave.length < 6) return json({ ok: false, error: "clave_corta" });

    const email = `${digitos}@telefono.manosvenezuela.app`;
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    console.log("registro: invocada", { email, tieneUrl: !!url, tieneKey: !!serviceKey });

    if (!url || !serviceKey) {
      return json({ ok: false, error: "config", message: "Faltan variables del entorno" });
    }

    const admin = createClient(url, serviceKey);
    const { error } = await admin.auth.admin.createUser({
      email,
      password: clave,
      email_confirm: true,
      user_metadata: { full_name: nombre, phone: telefono, role: rol },
    });

    if (error) {
      console.error("registro: createUser error", error.message);
      const yaExiste = /already|registered|exists|duplicate/i.test(error.message);
      return json({ ok: false, error: yaExiste ? "ya_existe" : "error", message: error.message });
    }
    return json({ ok: true });
  } catch (e) {
    console.error("registro: excepcion", String(e));
    return json({ ok: false, error: "error", message: String(e) }, 200);
  }
});
