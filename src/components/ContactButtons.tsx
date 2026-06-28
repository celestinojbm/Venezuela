"use client";

import { enlaceWhatsApp } from "@/lib/format";

/**
 * Botones grandes de contacto directo: WhatsApp y Llamar.
 * Es la acción más importante de la app: conectar en 1 toque.
 */
export default function ContactButtons({
  phone,
  mensaje,
  size = "md",
}: {
  phone: string;
  mensaje?: string;
  size?: "sm" | "md";
}) {
  const tel = phone.replace(/[^\d+]/g, "");
  const alto = size === "md" ? "py-3 text-sm" : "py-2 text-xs";

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={enlaceWhatsApp(phone, mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 font-bold text-white active:scale-[0.98] ${alto}`}
      >
        <span aria-hidden>💬</span> WhatsApp
      </a>
      <a
        href={`tel:${tel}`}
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white font-bold text-emerald-700 active:scale-[0.98] ${alto}`}
      >
        <span aria-hidden>📞</span> Llamar
      </a>
    </div>
  );
}
