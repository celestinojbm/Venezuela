"use client";

import { CATEGORIAS, URGENCIAS, type CategoriaValue, type UrgenciaValue } from "@/lib/constants";
import UiChip from "@/components/ui/Chip";

export interface FiltrosState {
  busqueda: string;
  categoria: CategoriaValue | "todas";
  urgencia: UrgenciaValue | "todas";
  soloAbiertas: boolean;
}

export const FILTROS_INICIALES: FiltrosState = {
  busqueda: "",
  categoria: "todas",
  urgencia: "todas",
  soloAbiertas: true,
};

export default function Filters({
  value,
  onChange,
  ocultarUrgencia = false,
}: {
  value: FiltrosState;
  onChange: (next: FiltrosState) => void;
  ocultarUrgencia?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
          🔎
        </span>
        <input
          type="search"
          inputMode="search"
          value={value.busqueda}
          onChange={(e) => onChange({ ...value, busqueda: e.target.value })}
          placeholder="Buscar (ej. agua, San Cristóbal...)"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-marca-500 focus:bg-white"
          aria-label="Buscar solicitudes"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Chip
          activo={value.categoria === "todas"}
          onClick={() => onChange({ ...value, categoria: "todas" })}
        >
          Todas
        </Chip>
        {CATEGORIAS.map((c) => (
          <Chip
            key={c.value}
            activo={value.categoria === c.value}
            onClick={() => onChange({ ...value, categoria: c.value })}
          >
            <span aria-hidden>{c.emoji}</span> {c.label}
          </Chip>
        ))}
      </div>

      {!ocultarUrgencia && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Chip
            activo={value.urgencia === "todas"}
            onClick={() => onChange({ ...value, urgencia: "todas" })}
          >
            Cualquier urgencia
          </Chip>
          {URGENCIAS.map((u) => (
            <Chip
              key={u.value}
              activo={value.urgencia === u.value}
              onClick={() => onChange({ ...value, urgencia: u.value })}
            >
              {u.label}
            </Chip>
          ))}

          <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={value.soloAbiertas}
              onChange={(e) => onChange({ ...value, soloAbiertas: e.target.checked })}
              className="h-4 w-4 accent-marca-600"
            />
            Solo abiertas
          </label>
        </div>
      )}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <UiChip active={activo} onClick={onClick} className="shrink-0 whitespace-nowrap">
      {children}
    </UiChip>
  );
}
