import type { HTMLAttributes } from "react";
import { cx } from "@/lib/format";

// Fila de chips deslizable horizontalmente, con tratamiento único en toda la app:
// - full-bleed (`-mx-4 px-4`) para que se deslice de borde a borde de la pantalla.
// - `overflow-x-auto` SIN ocultar la barra: deja ver el indicador para arrastrar
//   a los lados (igual que el buscador de la Red).
// Se usa en el buscador de la Red y en los filtros de Necesito/Ayudar para que
// se vean y se comporten idénticos.
export default function ChipRow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("-mx-4 flex gap-2 overflow-x-auto px-4 pb-1", className)} {...props}>
      {children}
    </div>
  );
}
