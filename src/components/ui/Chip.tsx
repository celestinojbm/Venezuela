import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/format";

// Chip/píldora consistente para filtros y selecciones (rounded-full).
// `tone` define el color del estado activo (azul de marca por defecto, rojo para urgencia).
type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  tone?: "marca" | "peligro" | "success";
};

const activeTone: Record<NonNullable<ChipProps["tone"]>, string> = {
  marca: "border-marca-600 bg-marca-600 text-white",
  peligro: "border-peligro-600 bg-peligro-600 text-white",
  success: "border-emerald-600 bg-emerald-600 text-white",
};

export default function Chip({
  active = false,
  tone = "marca",
  className,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 focus-visible:ring-offset-1 disabled:opacity-60",
        active
          ? activeTone[tone]
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}
