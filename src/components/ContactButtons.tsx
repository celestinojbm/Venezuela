"use client";

import { Phone } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { enlaceWhatsApp } from "@/lib/format";
import { telHref } from "@/lib/contacto";

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
  const tel = telHref(phone) ?? `tel:${phone.replace(/[^\d+]/g, "")}`;
  const alto = size === "md" ? "py-3 text-sm" : "py-2.5 text-xs";

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={enlaceWhatsApp(phone, mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white shadow-sm shadow-emerald-600/20 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] ${alto}`}
      >
        <WhatsAppIcon size={size === "md" ? 18 : 16} /> WhatsApp
      </a>
      <a
        href={tel}
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white font-semibold text-emerald-700 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] ${alto}`}
      >
        <Phone size={size === "md" ? 17 : 15} /> Llamar
      </a>
    </div>
  );
}
