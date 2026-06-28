// Catálogo de categorías, urgencias y estados usados en toda la aplicación.
// Los `value` coinciden con los CHECK de la base de datos (ver supabase/migrations).

export type CategoriaValue =
  | "agua"
  | "alimentos"
  | "refugio"
  | "medicina"
  | "rescate"
  | "ropa"
  | "higiene"
  | "transporte"
  | "otros";

export interface Categoria {
  value: CategoriaValue;
  label: string;
  emoji: string;
}

export const CATEGORIAS: Categoria[] = [
  { value: "agua", label: "Agua potable", emoji: "💧" },
  { value: "alimentos", label: "Alimentos", emoji: "🍲" },
  { value: "refugio", label: "Refugio / albergue", emoji: "🏠" },
  { value: "medicina", label: "Medicinas / salud", emoji: "💊" },
  { value: "rescate", label: "Rescate / evacuación", emoji: "🚨" },
  { value: "ropa", label: "Ropa / abrigo", emoji: "🧥" },
  { value: "higiene", label: "Higiene", emoji: "🧼" },
  { value: "transporte", label: "Transporte", emoji: "🚚" },
  { value: "otros", label: "Otros", emoji: "🤝" },
];

export const CATEGORIA_MAP: Record<CategoriaValue, Categoria> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.value, c]),
) as Record<CategoriaValue, Categoria>;

export type UrgenciaValue = "baja" | "media" | "alta" | "critica";

export interface Urgencia {
  value: UrgenciaValue;
  label: string;
  // Clases de Tailwind para badge (fondo + texto).
  className: string;
  orden: number;
}

export const URGENCIAS: Urgencia[] = [
  { value: "critica", label: "Crítica", className: "bg-peligro-600 text-white", orden: 0 },
  { value: "alta", label: "Alta", className: "bg-peligro-100 text-peligro-700", orden: 1 },
  { value: "media", label: "Media", className: "bg-amber-100 text-amber-700", orden: 2 },
  { value: "baja", label: "Baja", className: "bg-slate-100 text-slate-600", orden: 3 },
];

export const URGENCIA_MAP: Record<UrgenciaValue, Urgencia> = Object.fromEntries(
  URGENCIAS.map((u) => [u.value, u]),
) as Record<UrgenciaValue, Urgencia>;

export type EstadoValue = "abierta" | "en_proceso" | "resuelta" | "cerrada";

export interface Estado {
  value: EstadoValue;
  label: string;
  className: string;
}

export const ESTADOS: Estado[] = [
  { value: "abierta", label: "Abierta", className: "bg-emerald-100 text-emerald-700" },
  { value: "en_proceso", label: "En proceso", className: "bg-blue-100 text-blue-700" },
  { value: "resuelta", label: "Resuelta", className: "bg-slate-200 text-slate-600" },
  { value: "cerrada", label: "Cerrada", className: "bg-slate-200 text-slate-500" },
];

export const ESTADO_MAP: Record<EstadoValue, Estado> = Object.fromEntries(
  ESTADOS.map((e) => [e.value, e]),
) as Record<EstadoValue, Estado>;

export type RolValue = "necesito" | "ayudo" | "ambos";

export const ROLES: { value: RolValue; label: string; descripcion: string }[] = [
  { value: "necesito", label: "Necesito ayuda", descripcion: "Soy damnificado/a y busco apoyo." },
  { value: "ayudo", label: "Quiero ayudar", descripcion: "Soy voluntario/a y ofrezco apoyo." },
  { value: "ambos", label: "Ambos", descripcion: "Puedo pedir y ofrecer ayuda." },
];

// Centro aproximado de Venezuela para inicializar el mapa.
export const CENTRO_VENEZUELA: [number, number] = [8.0, -66.0];
export const ZOOM_INICIAL = 6;
