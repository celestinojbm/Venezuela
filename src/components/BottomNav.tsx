"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Plus, Globe, LifeBuoy, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/format";

type Item = {
  href: string;
  label: string;
  Icon: LucideIcon;
  match: (p: string) => boolean;
  destacado?: boolean;
};

const ITEMS: Item[] = [
  { href: "/", label: "Inicio", Icon: Home, match: (p) => p === "/" },
  { href: "/mapa", label: "Mapas", Icon: Map, match: (p) => p.startsWith("/mapa") },
  {
    href: "/publicar",
    label: "Publicar",
    Icon: Plus,
    match: (p) =>
      p.startsWith("/publicar") ||
      p.startsWith("/solicitudes/nueva") ||
      p.startsWith("/voluntarios/nuevo"),
    destacado: true,
  },
  { href: "/red", label: "Red", Icon: Globe, match: (p) => p.startsWith("/red") },
  { href: "/guia", label: "Guía", Icon: LifeBuoy, match: (p) => p.startsWith("/guia") },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 border-t border-slate-200/70 bg-white/90 px-2 pt-1 backdrop-blur-md">
      <ul className="flex items-stretch justify-between">
        {ITEMS.map((item) => {
          const activo = item.match(pathname);
          const { Icon } = item;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cx(
                  "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-colors",
                  item.destacado || activo ? "text-marca-600" : "text-slate-400 hover:text-slate-600",
                )}
              >
                <span
                  className={cx(
                    "grid place-items-center",
                    item.destacado
                      ? "h-11 w-11 -translate-y-2 rounded-2xl bg-marca-600 text-white shadow-lg shadow-marca-600/30"
                      : "h-7 w-7",
                  )}
                >
                  <Icon size={item.destacado ? 24 : 22} strokeWidth={activo || item.destacado ? 2.4 : 2} />
                </span>
                <span className={cx(item.destacado && "-mt-1")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
