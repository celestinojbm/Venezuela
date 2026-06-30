"use client";

import { useState } from "react";

// Mapa 3D de daños estructurales tras los sismos (escena de ArcGIS). Es pesado,
// así que se carga solo cuando la persona lo pide (mejor en redes móviles).

const URL_DANOS =
  "https://www.arcgis.com/home/webscene/viewer.html?webscene=c01ef4b6b74b4d25a39f7a1e4865be58";

export default function MapaDanos() {
  const [cargar, setCargar] = useState(false);

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold text-slate-900">🏚️ Mapa de daños (3D)</h2>
      <p className="mt-1 text-sm text-slate-500">
        Vista 3D de los daños estructurales tras los sismos (ArcGIS). Puede tardar en cargar y
        consume datos.
      </p>

      {cargar ? (
        <div
          className="mt-3 overflow-hidden rounded-2xl border border-slate-200"
          style={{ height: "70vh" }}
        >
          <iframe
            src={URL_DANOS}
            title="Mapa de daños 3D"
            className="h-full w-full"
            loading="lazy"
            allow="fullscreen; geolocation"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          onClick={() => setCargar(true)}
          className="mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 text-slate-600"
        >
          <span className="text-2xl" aria-hidden>
            ▶️
          </span>
          <span className="text-sm font-bold">Ver mapa de daños 3D</span>
          <span className="text-xs text-slate-400">Toca para cargar</span>
        </button>
      )}

      <a
        href={URL_DANOS}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center text-xs font-semibold text-marca-600"
      >
        Abrir en ArcGIS (pantalla completa) ↗
      </a>
    </section>
  );
}
