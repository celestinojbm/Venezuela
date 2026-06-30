"use client";

import { Phone } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { enlaceWhatsApp } from "@/lib/format";
import { telHref } from "@/lib/contacto";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Botones grandes de contacto directo: WhatsApp y Llamar.
 * Es la acción más importante de la app: conectar en 1 toque.
 * Usa el sistema único de botones para mantener la misma calidad en toda la app.
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
  const btnSize = size === "md" ? "md" : "sm";

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={enlaceWhatsApp(phone, mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={buttonClasses({ variant: "success", size: btnSize, fullWidth: true })}
      >
        <WhatsAppIcon size={size === "md" ? 18 : 16} /> WhatsApp
      </a>
      <a
        href={tel}
        onClick={(e) => e.stopPropagation()}
        className={buttonClasses({ variant: "success-outline", size: btnSize, fullWidth: true })}
      >
        <Phone size={size === "md" ? 17 : 15} /> Llamar
      </a>
    </div>
  );
}
