"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/format";

// Barra compacta con la actividad sísmica reciente cerca de Venezuela (USGS).
// Idea tomada de Info Ayuda Venezuela. Si no hay sismos recientes en la zona,
// no muestra nada (cero ruido). Los datos vienen de /api/sismos.

type Sismo = {
  mag: number | null;
  lugar: string | null;
  tiempo: number | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
};

function haceCuanto(ms: number | null): string {
  if (!ms) return "";
  const seg = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (seg < 3600) return `hace ${Math.max(1, Math.floor(seg / 60))} min`;
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
  return `hace ${Math.floor(seg / 86400)} d`;
}

// Color e ícono según magnitud.
function estilo(mag: number | null): { clase: string; icono: string } {
  const m = mag ?? 0;
  if (m >= 5) return { clase: "border-peligro-200 bg-peligro-50 text-peligro-800", icono: "🔴" };
  if (m >= 4) return { clase: "border-amber-200 bg-amber-50 text-amber-800", icono: "🟠" };
  return { clase: "border-slate-200 bg-slate-50 text-slate-700", icono: "🟡" };
}

export default function AlertaSismica() {
  const [sismo, setSismo] = useState<Sismo | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let vivo = true;
    fetch("/api/sismos")
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        setSismo(d?.ultimo ?? null);
        setCount(typeof d?.count === "number" ? d.count : 0);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  if (!sismo) return null;

  const { clase, icono } = estilo(sismo.mag);
  const mag = sismo.mag != null ? sismo.mag.toFixed(1) : "—";
  const cuando = haceCuanto(sismo.tiempo);

  const contenido = (
    <div className={cx("flex items-center gap-3 rounded-2xl border px-4 py-2.5", clase)}>
      <span className="text-base" aria-hidden>
        {icono}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">
          Sismo reciente · M{mag}
          {cuando ? ` · ${cuando}` : ""}
        </p>
        {sismo.lugar && <p className="truncate text-xs opacity-80">{sismo.lugar}</p>}
      </div>
      {count > 1 && (
        <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold">
          {count} en 7 días
        </span>
      )}
    </div>
  );

  if (sismo.url) {
    return (
      <a href={sismo.url} target="_blank" rel="noopener noreferrer" className="block">
        {contenido}
      </a>
    );
  }
  return contenido;
}
