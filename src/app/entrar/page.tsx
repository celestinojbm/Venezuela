"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import SetupNotice from "@/components/SetupNotice";
import { ROLES, type RolValue } from "@/lib/constants";
import { cx } from "@/lib/format";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setMensaje(null);
    setCargando(true);

    try {
      if (modo === "crear") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: nombre.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          // Confirmación por correo activada en el proyecto.
          setMensaje(
            "Te enviamos un correo para confirmar tu cuenta. Revísalo y luego inicia sesión.",
          );
          setModo("entrar");
          return;
        }
        await guardarPerfil();
        router.push("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (err) {
      setError(traducirError(err));
    } finally {
      setCargando(false);
    }
  }

  async function entrarAnonimo() {
    if (!supabase) return;
    setError(null);
    setCargando(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (nombre.trim() || rol) await guardarPerfil();
      router.push("/");
    } catch (err) {
      setError(traducirError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-bold text-slate-900">
          {modo === "crear" ? "Crear cuenta" : "Iniciar sesión"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {modo === "crear"
            ? "Regístrate para publicar y responder solicitudes."
            : "Entra para continuar."}
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

          <Campo label="Correo electrónico">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              className="campo"
            />
          </Campo>

          <Campo label="Contraseña">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete={modo === "crear" ? "new-password" : "current-password"}
              className="campo"
            />
          </Campo>

          {error && (
            <p className="rounded-lg bg-peligro-50 px-3 py-2 text-sm text-peligro-700">{error}</p>
          )}
          {mensaje && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{mensaje}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-marca-600 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {cargando ? "Procesando…" : modo === "crear" ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />o<span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          onClick={entrarAnonimo}
          disabled={cargando}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
        >
          Entrar rápido sin cuenta
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Podrás añadir tus datos de contacto después, en tu perfil.
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

function traducirError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/Invalid login credentials/i.test(msg)) return "Correo o contraseña incorrectos.";
  if (/User already registered/i.test(msg)) return "Ese correo ya está registrado. Inicia sesión.";
  if (/Password should be/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/Anonymous sign-ins are disabled/i.test(msg))
    return "El acceso sin cuenta está desactivado en el proyecto. Crea una cuenta con correo.";
  if (/Email not confirmed/i.test(msg)) return "Confirma tu correo antes de entrar.";
  return "Ocurrió un error. Verifica tus datos e intenta de nuevo.";
}
