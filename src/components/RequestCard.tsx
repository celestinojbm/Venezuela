import Link from "next/link";
import type { HelpRequestWithAuthor } from "@/lib/types";
import { CategoryBadge, StatusBadge, UrgencyBadge } from "@/components/Badges";
import ContactButtons from "@/components/ContactButtons";
import { tiempoRelativo } from "@/lib/format";

export default function RequestCard({ req }: { req: HelpRequestWithAuthor }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/solicitudes/${req.id}`} className="block">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <UrgencyBadge value={req.urgency} />
          <CategoryBadge value={req.category} />
          {req.status !== "abierta" && <StatusBadge value={req.status} />}
        </div>

        <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{req.title}</h3>

        {req.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{req.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 truncate">
            {req.location_text ? (
              <>
                <span aria-hidden>📍</span>
                <span className="truncate">{req.location_text}</span>
              </>
            ) : (
              <span>Ubicación no indicada</span>
            )}
          </span>
          <span className="shrink-0">{tiempoRelativo(req.created_at)}</span>
        </div>
      </Link>

      {req.contact_phone && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <ContactButtons
            phone={req.contact_phone}
            mensaje={`Hola, vi tu solicitud "${req.title}" en Manos Venezuela y quiero ayudarte.`}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
