import { Phone, MapPin, HeartHandshake } from "lucide-react";
import type { VolunteerListing } from "@/lib/types";
import { CategoryBadge } from "@/components/Badges";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { enlaceWhatsApp, tiempoRelativo } from "@/lib/format";
import { telHref } from "@/lib/contacto";

export default function VolunteerCard({ vol }: { vol: VolunteerListing }) {
  const tel = telHref(vol.contact_phone) ?? `tel:${vol.contact_phone?.replace(/[^\d+]/g, "")}`;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <HeartHandshake size={13} /> Ofrece ayuda
        </span>
        <CategoryBadge value={vol.category} />
      </div>

      <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{vol.title}</h3>
      {vol.author_name && <p className="text-xs text-slate-400">por {vol.author_name}</p>}

      {vol.description && (
        <p className="mt-1 line-clamp-3 text-sm text-slate-500">{vol.description}</p>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 truncate">
          {vol.location_text ? (
            <>
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{vol.location_text}</span>
            </>
          ) : (
            <span>Sin zona indicada</span>
          )}
        </span>
        <span className="shrink-0">{tiempoRelativo(vol.created_at)}</span>
      </div>

      {vol.contact_phone && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <a
            href={enlaceWhatsApp(
              vol.contact_phone,
              `Hola, vi que ofreces ayuda ("${vol.title}") en Manos Venezuela. Quiero coordinar contigo.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <WhatsAppIcon size={18} /> Contactar
          </a>
          <a
            href={tel}
            aria-label="Llamar"
            className="grid h-11 w-12 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-transform active:scale-[0.98]"
          >
            <Phone size={18} />
          </a>
        </div>
      )}
    </div>
  );
}
