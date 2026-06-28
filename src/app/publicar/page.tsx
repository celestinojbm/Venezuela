"use client";

import Link from "next/link";
import AuthGate from "@/components/AuthGate";

export default function PublicarPage() {
  return (
    <AuthGate>
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-slate-900">¿Qué quieres hacer?</h1>
        <p className="mt-1 text-sm text-slate-500">Elige una opción para publicar.</p>

        <div className="mt-5 space-y-3">
          <Link
            href="/solicitudes/nueva"
            className="block rounded-2xl border border-marca-200 bg-marca-50 p-5"
          >
            <div className="text-2xl">🆘</div>
            <div className="mt-1 text-base font-bold text-slate-900">Necesito ayuda</div>
            <p className="text-sm text-slate-500">
              Publica qué necesitas (agua, comida, refugio, medicinas…) y tu contacto.
            </p>
          </Link>

          <Link
            href="/voluntarios/nuevo"
            className="block rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
          >
            <div className="text-2xl">🤝</div>
            <div className="mt-1 text-base font-bold text-slate-900">Quiero ayudar</div>
            <p className="text-sm text-slate-500">
              Ofrece tu apoyo para que los damnificados te encuentren y te contacten.
            </p>
          </Link>
        </div>
      </div>
    </AuthGate>
  );
}
