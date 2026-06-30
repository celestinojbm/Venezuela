"use client";

import Link from "next/link";
import { HandHeart, Siren } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-marca-700 text-white">
          <HandHeart size={20} strokeWidth={2.25} />
        </span>
        <span className="text-base font-bold leading-tight text-tinta">
          Manos
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-marca-700">
            Venezuela
          </span>
        </span>
      </Link>

      <Link
        href="/guia"
        className="flex items-center gap-1.5 rounded-full bg-peligro-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-peligro-600/25"
      >
        <Siren size={14} strokeWidth={2.5} /> Emergencias
      </Link>
    </header>
  );
}
