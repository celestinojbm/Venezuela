import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/format";

// Sistema único de botones. Mantiene los colores semánticos del proyecto:
// primary = azul de marca · success = verde (ayudar) · danger = rojo (emergencia).
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "success-outline"
  | "danger"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-marca-600 text-white shadow-sm shadow-marca-600/20 hover:bg-marca-700 focus-visible:ring-marca-500",
  success:
    "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 focus-visible:ring-emerald-500",
  "success-outline":
    "border border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:ring-emerald-500",
  danger:
    "bg-peligro-600 text-white shadow-sm shadow-peligro-600/25 hover:bg-peligro-700 focus-visible:ring-peligro-500",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400",
  ghost:
    "text-marca-700 hover:bg-marca-50 focus-visible:ring-marca-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-sm",
};

// Devuelve las clases del botón. Útil para aplicarlas a un <Link> o <a>.
export function buttonClasses(
  opts: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
  } = {},
): string {
  const { variant = "primary", size = "md", fullWidth = false, className } = opts;
  return cx(base, variantStyles[variant], sizeStyles[size], fullWidth && "w-full", className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export default function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...props} />
  );
}
