import type { VolunteerListingWithAuthor } from "@/lib/types";
import { CategoryBadge } from "@/components/Badges";
import ContactButtons from "@/components/ContactButtons";
import { tiempoRelativo } from "@/lib/format";

export default function VolunteerCard({ vol }: { vol: VolunteerListingWithAuthor }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          🤝 Ofrece ayuda
        </span>
        <CategoryBadge value={vol.category} />
      </div>

      <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{vol.title}</h3>
      {vol.author?.full_name && (
        <p className="text-xs text-slate-400">por {vol.author.full_name}</p>
      )}

      {vol.description && (
        <p className="mt-1 line-clamp-3 text-sm text-slate-500">{vol.description}</p>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 truncate">
          {vol.location_text ? (
            <>
              <span aria-hidden>📍</span>
              <span className="truncate">{vol.location_text}</span>
            </>
          ) : (
            <span>Sin zona indicada</span>
          )}
        </span>
        <span className="shrink-0">{tiempoRelativo(vol.created_at)}</span>
      </div>

      {vol.contact_phone && (
        <div className="mt-3 border-t border-emerald-100 pt-3">
          <ContactButtons
            phone={vol.contact_phone}
            mensaje={`Hola, vi que ofreces ayuda ("${vol.title}") en Manos Venezuela. Necesito apoyo.`}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
