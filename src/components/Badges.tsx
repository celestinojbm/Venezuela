import {
  CATEGORIA_MAP,
  ESTADO_MAP,
  URGENCIA_MAP,
  type CategoriaValue,
  type EstadoValue,
  type UrgenciaValue,
} from "@/lib/constants";
import { cx } from "@/lib/format";

export function CategoryBadge({ value }: { value: CategoriaValue }) {
  const cat = CATEGORIA_MAP[value];
  if (!cat) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      <span aria-hidden>{cat.emoji}</span>
      {cat.label}
    </span>
  );
}

export function UrgencyBadge({ value }: { value: UrgenciaValue }) {
  const urg = URGENCIA_MAP[value];
  if (!urg) return null;
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", urg.className)}>
      {urg.value === "critica" && <span className="mr-1 animate-pulse" aria-hidden>●</span>}
      {urg.label}
    </span>
  );
}

export function StatusBadge({ value }: { value: EstadoValue }) {
  const est = ESTADO_MAP[value];
  if (!est) return null;
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", est.className)}>
      {est.label}
    </span>
  );
}
