"use client";

import Link from "next/link";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import SetupNotice from "@/components/SetupNotice";

/**
 * Envuelve contenido que requiere sesión iniciada.
 * Muestra configuración, carga o invitación a entrar según corresponda.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { configured, user, loading } = useSupabase();

  if (!configured) return <SetupNotice />;

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-marca-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="text-4xl">🔒</div>
        <h2 className="mt-3 text-lg font-bold text-slate-800">Inicia sesión para continuar</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
          Necesitas una cuenta (o acceso rápido) para usar esta sección.
        </p>
        <Link
          href="/entrar"
          className="mt-5 inline-block rounded-xl bg-marca-600 px-6 py-3 text-sm font-bold text-white"
        >
          Entrar
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
