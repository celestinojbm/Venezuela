"use client";

import { useEffect, useState } from "react";

// Aviso global cuando el dispositivo está sin conexión. La app sigue usable
// con lo último guardado (service worker); este banner solo lo deja claro.

export default function IndicadorOffline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const actualizar = () => setOnline(navigator.onLine);
    actualizar(); // estado real al montar (en SSR asumimos online para no parpadear)
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-40 bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-white"
    >
      ⚠️ Sin conexión — mostrando lo último guardado
    </div>
  );
}
