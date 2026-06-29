"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

const ITEMS = [
  { href: "/", label: "Inicio", icon: "🏠", match: (p: string) => p === "/" },
  { href: "/mapa", label: "Mapa", icon: "🗺️", match: (p: string) => p.startsWith("/mapa") },
  {
    href: "/publicar",
    label: "Publicar",
    icon: "➕",
    match: (p: string) =>
      p.startsWith("/publicar") ||
      p.startsWith("/solicitudes/nueva") ||
      p.startsWith("/voluntarios/nuevo"),
    destacado: true,
  },
  { href: "/guia", label: "Guía", icon: "🆘", match: (p: string) => p.startsWith("/guia") },
  { href: "/recursos", label: "Recursos", icon: "📚", match: (p: string) => p.startsWith("/recursos") },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 border-t border-slate-100 bg-white/95 px-2 pt-1 backdrop-blur">
      <ul className="flex items-stretch justify-between">
        {ITEMS.map((item) => {
          const activo = item.match(pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cx(
                  "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                  item.destacado
                    ? "text-marca-600"
                    : activo
                      ? "text-marca-600"
                      : "text-slate-400 hover:text-slate-600",
                )}
              >
                <span
                  className={cx(
                    "grid place-items-center text-lg",
                    item.destacado &&
                      "h-9 w-9 -translate-y-1 rounded-full bg-marca-600 text-white shadow-md",
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
