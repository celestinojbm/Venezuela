"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";

// Sección "Red": buscador en vivo sobre la Red Humanitaria de Datos
// (redayuda.eriktaveras.com), un índice común de 22 plataformas de ayuda.
// No copiamos nada: cada resultado se muestra atribuido y enlaza a su fuente.

type RedItem = {
  id: string | null;
  tipo: string | null;
  titulo: string | null;
  resumen: string | null;
  persona: string | null;
  lugar: string | null;
  ciudad: string | null;
  estado: string | null;
  lat: number | null;
  lng: number | null;
  fuente: string | null;
  fuente_id: string | null;
  url: string | null;
  imagen: string | null;
  tambien_en: number;
};

type Tipo = { value: string; label: string; emoji: string; badge: string };

const TIPOS: Tipo[] = [
  { value: "", label: "Todos", emoji: "🔎", badge: "bg-slate-100 text-slate-600" },
  { value: "persona_desaparecida", label: "Desaparecidos", emoji: "🔍", badge: "bg-peligro-100 text-peligro-700" },
  { value: "persona_localizada", label: "Localizados", emoji: "✅", badge: "bg-emerald-100 text-emerald-700" },
  { value: "persona_hospitalizada", label: "Hospitalizados", emoji: "🏥", badge: "bg-blue-100 text-blue-700" },
  { value: "centro_acopio", label: "Acopio", emoji: "📦", badge: "bg-amber-100 text-amber-700" },
  { value: "centro_donacion", label: "Donación", emoji: "💸", badge: "bg-violet-100 text-violet-700" },
  { value: "recurso", label: "Recursos", emoji: "🤝", badge: "bg-teal-100 text-teal-700" },
];

const TIPO_MAP: Record<string, Tipo> = Object.fromEntries(TIPOS.map((t) => [t.value, t]));

const RED_HOME = "https://redayuda.eriktaveras.com";
const PAGINA = 24;

function mapsUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export default function RedPage() {
  const [q, setQ] = useState("");
  const [qDeb, setQDeb] = useState("");
  const [tipo, setTipo] = useState("");
  const [items, setItems] = useState<RedItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [fuentes, setFuentes] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState(false);
  const reqId = useRef(0);

  // Anti-rebote del texto: esperamos a que el usuario deje de escribir.
  useEffect(() => {
    const t = setTimeout(() => setQDeb(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const traer = useCallback(
    async (offset: number, reset: boolean) => {
      const id = ++reqId.current;
      if (reset) {
        setCargando(true);
        setError(false);
      } else {
        setCargandoMas(true);
      }
      try {
        const params = new URLSearchParams({ limit: String(PAGINA), offset: String(offset) });
        if (qDeb) params.set("q", qDeb);
        if (tipo) params.set("tipo", tipo);
        const r = await fetch(`/api/red?${params.toString()}`);
        const data = await r.json();
        if (id !== reqId.current) return; // llegó una respuesta vieja: la ignoramos
        if (data.error) {
          setError(true);
          if (reset) setItems([]);
          return;
        }
        setTotal(typeof data.total === "number" ? data.total : null);
        setFuentes(typeof data.fuentes === "number" ? data.fuentes : null);
        setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      } catch {
        if (id === reqId.current) {
          setError(true);
          if (reset) setItems([]);
        }
      } finally {
        if (id === reqId.current) {
          setCargando(false);
          setCargandoMas(false);
        }
      }
    },
    [qDeb, tipo],
  );

  // Nueva búsqueda al cambiar texto (con anti-rebote) o tipo.
  useEffect(() => {
    traer(0, true);
  }, [traer]);

  const hayMas = items.length > 0 && total !== null && items.length < total;

  return (
    <div className="space-y-4 px-4 py-4">
      <Link href="/" className="text-sm font-medium text-slate-400">
        ← Volver
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">🌐 Buscar en la Red</h1>
        <p className="mt-1 text-sm text-slate-500">
          Un solo buscador sobre <strong>{fuentes ?? 22} plataformas</strong> de ayuda: personas
          desaparecidas, localizadas, hospitalizadas, centros de acopio, donación y recursos. Los
          datos son de la <strong>Red Humanitaria de Datos</strong>; cada resultado enlaza a su
          fuente original.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, lugar, necesidad…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-marca-500 focus:bg-white"
          maxLength={180}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔎
        </span>
      </div>

      {/* Filtros por tipo */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {TIPOS.map((t) => (
          <button
            key={t.value || "todos"}
            type="button"
            onClick={() => setTipo(t.value)}
            className={cx(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              tipo === t.value
                ? "border-marca-600 bg-marca-600 text-white"
                : "border-slate-200 bg-white text-slate-600",
            )}
          >
            <span aria-hidden>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Contador */}
      {!cargando && !error && (
        <p className="text-xs text-slate-400">
          {total !== null ? total.toLocaleString("es-VE") : items.length} resultado
          {total === 1 ? "" : "s"}
          {qDeb ? ` para “${qDeb}”` : ""}
          {tipo ? ` · ${TIPO_MAP[tipo]?.label}` : ""}
        </p>
      )}

      {/* Estados */}
      {cargando ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No pudimos conectar con la Red en este momento. Probá de nuevo en un momento.
          <button
            onClick={() => traer(0, true)}
            className="mt-2 block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Sin resultados. Probá con otro nombre, lugar o quitá el filtro.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((it, i) => (
            <Tarjeta key={`${it.id ?? "x"}-${i}`} it={it} />
          ))}

          {hayMas && (
            <button
              onClick={() => traer(items.length, false)}
              disabled={cargandoMas}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-marca-600 disabled:opacity-60"
            >
              {cargandoMas ? "Cargando…" : "Cargar más"}
            </button>
          )}
        </div>
      )}

      {/* Atribución + otros directorios */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <a
          href={RED_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs font-semibold text-marca-600"
        >
          Abrir la Red Humanitaria de Datos ↗
        </a>
        <Link href="/recursos" className="block text-center text-xs font-medium text-slate-500">
          Más directorios y recursos →
        </Link>
        <p className="text-center text-[11px] text-slate-400">
          Manos Venezuela no almacena estos datos: los consulta en vivo y enlaza a cada fuente.
        </p>
      </div>
    </div>
  );
}

function Tarjeta({ it }: { it: RedItem }) {
  const t = TIPO_MAP[it.tipo ?? ""] ?? TIPO_MAP[""];
  const nombre = it.persona || it.titulo || "Sin título";
  const enlace = it.url || RED_HOME;
  const enlaceLabel = it.url ? "Ver en la fuente ↗" : "Ver en la Red ↗";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-semibold", t.badge)}>
          <span aria-hidden>{t.emoji}</span> {t.label}
        </span>
        {it.tambien_en > 0 && (
          <span className="text-[11px] text-slate-400">también en {it.tambien_en + 1} fuentes</span>
        )}
      </div>

      <h3 className="mt-2 font-semibold text-slate-900">{nombre}</h3>
      {it.resumen && (
        <p className="mt-0.5 line-clamp-3 text-sm text-slate-500">{it.resumen}</p>
      )}
      {it.lugar && (
        <p className="mt-1 text-xs text-slate-500">
          <span aria-hidden>📍</span> {it.lugar}
          {it.ciudad && it.ciudad !== it.lugar ? `, ${it.ciudad}` : ""}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-slate-400">
          Fuente: {it.fuente ?? "Red Humanitaria"}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          {it.lat != null && it.lng != null && (
            <a
              href={mapsUrl(it.lat, it.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500"
            >
              Mapa
            </a>
          )}
          <a
            href={enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-marca-600"
          >
            {enlaceLabel}
          </a>
        </div>
      </div>
    </article>
  );
}
