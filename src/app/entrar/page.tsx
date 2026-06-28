"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import SetupNotice from "@/components/SetupNotice";
import { ROLES, type RolValue } from "@/lib/constants";
import { cx } from "@/lib/format";

// Convierte un teléfono en un correo interno (sintético) para usar la
// autenticación de Supabase sin enviar correos ni SMS. El usuario nunca lo ve:
// solo escribe su número y una clave. Ej: "+58 412-1234567" -> "584121234567@telefono.manosvenezuela.app"
function telefonoAEmail(telefono: string): string {
  const digitos = telefono.replace(/\D/g, "");
  return `${digitos}@telefono.manosvenezuela.app`;
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-center text-slate-400">Cargando…</div>}>
      <EntrarInner />
    </Suspense>
  );
}

function EntrarInner() {
  const { configured, supabase, refreshProfile } = useSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const rolInicial = (params.get("rol") as RolValue) || "ambos";

  const [modo, setModo] = useState<"crear" | "entrar">("crear");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<RolValue>(
    ROLES.some((r) => r.value === rolInicial) ? rolInicial : "ambos",
  );
  const [telefono, setTelefono] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return <SetupNotice />;

  async function guardarPerfil() {
    if (!supabase) return;
    const { data: sesion } = await supabase.auth.getUser();
    const uid = sesion.user?.id;
    if (!uid) return;
    await supabase
      .from("profiles")
      .update({ full_name: nombre.trim() || null, role: rol })
      .eq("id", uid);
    await refreshProfile();
  }

  function validar(): string | null {
    const digitos = telefono.replace(/\D/g, "");
    if (digitos.length < 7) return "Escribe un número de teléfono válido.";
    if (clave.length < 6) return "La clave debe tener al menos 6 caracteres.";
    if (modo === "crear" && nombre.trim().length < 2) return "Escribe tu nombre.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    setError(null);
    setCargando(true);

    const email = telefonoAEmail(telefono);

    try {
      if (modo === "crear") {
        // El registro lo crea una función del servidor (cuenta ya confirmada),
        // así no depende de ajustes de correo en Supabase.
        const { data, error } = await supabase.functions.invoke("registro", {
          body: { telefono: telefono.trim(), clave, nombre: nombre.trim(), rol },
        });
        if (error) throw error;
        if (!data?.ok) {
          if (data?.error === "ya_existe") {
            setError("Ese teléfono ya tiene cuenta. Cambia a “Ya tengo cuenta”.");
            return;
          }
          if (data?.error === "clave_corta") {
            setError("La clave debe tener al menos 6 caracteres.");
            return;
          }
          if (data?.error === "telefono_invalido") {
            setError("Escribe un número de teléfono válido.");
            return;
          }
          setError(`No se pudo crear la cuenta: ${data?.message ?? data?.error ?? "error desconocido"}`);
          return;
        }
        // Cuenta creada y confirmada: iniciamos sesión.
        const { error: errLogin } = await supabase.auth.signInWithPassword({
          email,
          password: clave,
        });
        if (errLogin) throw errLogin;
        await guardarPerfil();
        router.push("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
        if (error) throw error;
        router.push("/");
      }
    } catch (err) {
      setError(traducirError(err, modo));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-bold text-slate-900">
          {modo === "crear" ? "Crear cuenta" : "Entrar"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {modo === "crear"
            ? "Solo tu teléfono y una clave. Rápido y sin correo."
            : "Entra con tu teléfono y tu clave."}
        </p>

        <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
          <button
            onClick={() => setModo("crear")}
            className={cx("flex-1 rounded-lg py-2", modo === "crear" ? "bg-white shadow-sm" : "text-slate-500")}
          >
            Crear cuenta
          </button>
          <button
            onClick={() => setModo("entrar")}
            className={cx("flex-1 rounded-lg py-2", modo === "entrar" ? "bg-white shadow-sm" : "text-slate-500")}
          >
            Ya tengo cuenta
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {modo === "crear" && (
            <>
              <Campo label="Tu nombre">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. María Pérez"
                  autoComplete="name"
                  className="campo"
                />
              </Campo>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  ¿Cómo participas?
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRol(r.value)}
                      className={cx(
                        "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                        rol === r.value
                          ? "border-marca-600 bg-marca-50"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      <span className="font-semibold text-slate-800">{r.label}</span>
                      <span className="block text-xs text-slate-500">{r.descripcion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Campo label="Número de teléfono">
            <input
              type="tel"
              inputMode="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 0412 1234567"
              autoComplete="tel"
              className="campo"
            />
          </Campo>

          <Campo label="Clave (mínimo 6 caracteres)">
            <input
              type="password"
              required
              minLength={6}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Una clave que recuerdes"
              autoComplete={modo === "crear" ? "new-password" : "current-password"}
              className="campo"
            />
          </Campo>

          {error && (
            <p className="rounded-lg bg-peligro-50 px-3 py-2 text-sm text-peligro-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-marca-600 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {cargando ? "Procesando…" : modo === "crear" ? "Crear cuenta y entrar" : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Usa siempre el mismo número (con o sin el código de país) para volver a entrar.
        </p>
      </div>

      <style jsx global>{`
        .campo {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .campo:focus {
          border-color: #f97316;
          background: #fff;
        }
      `}</style>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function traducirError(err: unknown, modo: "crear" | "entrar"): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/Invalid login credentials/i.test(msg))
    return "Teléfono o clave incorrectos. ¿Ya tienes cuenta?";
  if (/User already registered/i.test(msg))
    return "Ese teléfono ya tiene cuenta. Cambia a “Ya tengo cuenta”.";
  if (/Password should be/i.test(msg)) return "La clave debe tener al menos 6 caracteres.";
  if (/Signups not allowed|signup is disabled/i.test(msg))
    return "El registro está desactivado en el servidor.";
  if (/Email not confirmed/i.test(msg))
    return "Falta desactivar la confirmación de correo en el servidor.";
  return modo === "crear"
    ? `No se pudo crear la cuenta. Detalle: ${msg}`
    : "No se pudo entrar. Verifica tus datos.";
}
