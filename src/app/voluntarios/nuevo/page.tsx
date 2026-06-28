"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { CATEGORIAS, type CategoriaValue } from "@/lib/constants";
import { cx } from "@/lib/format";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-xl bg-slate-100" />,
});

export default function NuevoVoluntarioPage() {
  return (
    <AuthGate>
      <Formulario />
    </AuthGate>
  );
}

function Formulario() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoriaValue>("otros");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [punto, setPunto] = useState<[number, number] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tel = (user?.user_metadata?.phone as string | undefined)?.trim();
    if (tel) setContactPhone((actual) => actual || tel);
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    if (title.trim().length < 3) {
      setError("Cuéntanos en qué puedes ayudar (mínimo 3 caracteres).");
      return;
    }
    setError(null);
    setCargando(true);

    const { data, error } = await supabase
      .from("volunteer_listings")
      .insert({
        author_id: user.id,
        title: title.trim(),
        category,
        description: description.trim() || null,
        location_text: locationText.trim() || null,
        contact_phone: contactPhone.trim() || null,
        lat: punto ? punto[0] : null,
        lng: punto ? punto[1] : null,
      })
      .select("id")
      .single();

    setCargando(false);
    if (error || !data) {
      setError("No se pudo publicar. Revisa los datos e intenta de nuevo.");
      return;
    }
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 px-4 py-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Ofrecer mi ayuda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cuéntale a la comunidad cómo puedes ayudar. Así te encuentran y te contactan.
        </p>
      </div>

      <Campo label="¿Cómo puedes ayudar?" requerido>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          placeholder="Ej. Llevo agua y comida en mi camioneta"
          className="entrada"
          required
        />
      </Campo>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de ayuda</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                category === c.value
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600",
              )}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <Campo label="Detalles (opcional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Horarios disponibles, qué cantidad puedes cubrir, condiciones…"
          className="entrada resize-none"
        />
      </Campo>

      <Campo label="Zona donde puedes ayudar">
        <input
          type="text"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          maxLength={200}
          placeholder="Ej. Caracas y alrededores"
          className="entrada"
        />
      </Campo>

      <Campo label="Teléfono / WhatsApp de contacto" requerido>
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          maxLength={40}
          placeholder="Ej. +58 412 1234567"
          className="entrada"
        />
      </Campo>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Ubicación en el mapa (opcional)
        </span>
        <MapPicker value={punto} onChange={setPunto} />
      </div>

      {error && (
        <p className="rounded-lg bg-peligro-50 px-3 py-2 text-sm text-peligro-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {cargando ? "Publicando…" : "Publicar mi ayuda"}
      </button>

      <style jsx global>{`
        .entrada {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .entrada:focus {
          border-color: #10b981;
          background: #fff;
        }
      `}</style>
    </form>
  );
}

function Campo({
  label,
  requerido,
  children,
}: {
  label: string;
  requerido?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {requerido && <span className="text-peligro-600">*</span>}
      </span>
      {children}
    </label>
  );
}
