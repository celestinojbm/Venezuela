"use client";

import Link from "next/link";

export default function Header() {
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

      <Link
        href="/guia"
        className="rounded-full bg-peligro-600 px-3 py-1.5 text-xs font-bold text-white"
      >
        🆘 Emergencias
      </Link>
    </header>
  );
}
