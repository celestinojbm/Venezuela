"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { StatusBadge, UrgencyBadge } from "@/components/Badges";
import { ROLES, type RolValue } from "@/lib/constants";
import { cx, tiempoRelativo } from "@/lib/format";
import type { HelpRequest } from "@/lib/types";

export default function PerfilPage() {
  return (
    <AuthGate>
      <PerfilInner />
    </AuthGate>
  );
}

function PerfilInner() {
  const { supabase, user, profile, refreshProfile, signOut } = useSupabase();
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<RolValue>("ambos");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [misSolicitudes, setMisSolicitudes] = useState<HelpRequest[]>([]);
  const telefono = (user?.user_metadata?.phone as string | undefined) ?? null;

  useEffect(() => {
    if (profile) {
      setNombre(profile.full_name ?? "");
      setRol(profile.role ?? "ambos");
    }
  }, [profile]);

  useEffect(() => {
    if (!supabase || !user) return;
    let activo = true;
    supabase
      .from("requests")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (activo) setMisSolicitudes((data as HelpRequest[]) ?? []);
      });
    return () => {
      activo = false;
    };
  }, [supabase, user]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    setGuardando(true);
    setGuardado(false);
    await supabase
      .from("profiles")
      .update({ full_name: nombre.trim() || null, role: rol })
      .eq("id", user.id);
    await refreshProfile();
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-marca-100 text-2xl">
          🙂
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{nombre || "Tu perfil"}</h1>
          <p className="text-xs text-slate-400">
            {telefono ? `📱 ${telefono}` : "Sesión iniciada"}
          </p>
        </div>
      </div>

      <form onSubmit={guardar} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="campo-perfil"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">¿Cómo participas?</span>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRol(r.value)}
                className={cx(
                  "block w-full rounded-xl border px-3 py-2.5 text-left text-sm",
                  rol === r.value ? "border-marca-600 bg-marca-50" : "border-slate-200 bg-white",
                )}
              >
                <span className="font-semibold text-slate-800">{r.label}</span>
                <span className="block text-xs text-slate-500">{r.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded-xl bg-marca-600 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {guardando ? "Guardando…" : guardado ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-bold text-slate-800">
          Mis solicitudes ({misSolicitudes.length})
        </h2>
        {misSolicitudes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
            No has publicado solicitudes.
          </p>
        ) : (
          <ul className="space-y-2">
            {misSolicitudes.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/solicitudes/${r.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{r.title}</p>
                    <p className="text-[11px] text-slate-400">{tiempoRelativo(r.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <UrgencyBadge value={r.urgency} />
                    <StatusBadge value={r.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => signOut()}
        className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-peligro-600"
      >
        Cerrar sesión
      </button>

      <style jsx global>{`
        .campo-perfil {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .campo-perfil:focus {
          border-color: #f97316;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
