"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { CATEGORIAS, type CategoriaValue } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-xl bg-slate-100" />,
});

function mensajeError(code?: string): string {
  switch (code) {
    case "limite":
      return "Publicaste varias veces seguidas. Espera unos minutos e intenta de nuevo.";
    case "enlaces":
      return "Quita los enlaces del texto e intenta de nuevo.";
    case "titulo":
      return "El título debe tener entre 3 y 140 caracteres.";
    case "telefono":
      return "Pon un teléfono de contacto.";
    default:
      return "No se pudo publicar. Revisa los datos e intenta de nuevo.";
  }
}

export default function NuevoVoluntarioPage() {
  return (
    <AuthGate>
      <Formulario />
    </AuthGate>
  );
}

function Formulario() {
  const { supabase } = useSupabase();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoriaValue>("otros");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [punto, setPunto] = useState<[number, number] | null>(null);
  const [honeypot, setHoneypot] = useState(""); // anti-spam (oculto)
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (title.trim().length < 3) {
      setError("Cuéntanos en qué puedes ayudar (mínimo 3 caracteres).");
      return;
    }
    if (!contactPhone.trim()) {
      setError("Pon un teléfono para que puedan contactarte.");
      return;
    }
    setError(null);
    setCargando(true);

    const { data, error } = await supabase.functions.invoke("publicar", {
      body: {
        tipo: "voluntario",
        honeypot,
        payload: {
          author_name: nombre.trim() || null,
          title: title.trim(),
          category,
          description: description.trim() || null,
          location_text: locationText.trim() || null,
          contact_phone: contactPhone.trim(),
          lat: punto ? punto[0] : null,
          lng: punto ? punto[1] : null,
        },
      },
    });

    setCargando(false);
    if (error || !data?.ok) {
      setError(mensajeError(data?.error));
      return;
    }
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 px-4 py-4">
      {/* Campo trampa (honeypot) anti-spam: invisible para humanos. */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="website"
        className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
      />

      <div>
        <h1 className="text-xl font-bold text-slate-900">Ofrecer mi ayuda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cuéntale a la comunidad cómo puedes ayudar. Así te encuentran y te contactan.
          No necesitas cuenta.
        </p>
      </div>

      <Campo label="Tu nombre (opcional)">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={120}
          placeholder="Ej. José"
          className="entrada"
        />
      </Campo>

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
            <Chip
              key={c.value}
              tone="success"
              active={category === c.value}
              onClick={() => setCategory(c.value)}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </Chip>
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

      <Button type="submit" variant="success" size="lg" fullWidth disabled={cargando}>
        {cargando ? "Publicando…" : "Publicar mi ayuda"}
      </Button>

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
