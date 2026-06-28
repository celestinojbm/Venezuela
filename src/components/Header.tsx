"use client";

import Link from "next/link";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function Header() {
  const { user, profile, signOut, configured } = useSupabase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-marca-600 text-lg">
          🤝
        </span>
        <span className="text-base font-bold leading-tight text-slate-900">
          Manos
          <span className="block text-[11px] font-medium uppercase tracking-wide text-marca-600">
            Venezuela
          </span>
        </span>
      </Link>

      {configured && (
        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/perfil"
                className="max-w-[8rem] truncate rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700"
              >
                {profile?.full_name?.trim() || "Mi perfil"}
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full px-3 py-1.5 font-medium text-slate-500 hover:text-peligro-600"
                aria-label="Cerrar sesión"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/entrar"
              className="rounded-full bg-marca-600 px-4 py-1.5 font-semibold text-white"
            >
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
