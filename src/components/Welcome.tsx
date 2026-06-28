import Link from "next/link";

/** Portada para visitantes sin sesión: explica la app e invita a entrar. */
export default function Welcome() {
  return (
    <div className="px-4 py-8">
      <section className="rounded-3xl bg-gradient-to-br from-marca-600 to-marca-700 p-6 text-white">
        <h1 className="text-2xl font-extrabold leading-tight">
          Ayuda que llega directo a quien la necesita
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-marca-50">
          Conectamos a personas damnificadas por la catástrofe en Venezuela con
          voluntarios dispuestos a ayudar. Sin intermediarios.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/entrar?rol=necesito"
            className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-marca-700"
          >
            🆘 Necesito ayuda
          </Link>
          <Link
            href="/entrar?rol=ayudo"
            className="rounded-xl bg-marca-800/40 px-4 py-3 text-center text-sm font-bold text-white ring-1 ring-white/40"
          >
            🤝 Quiero ayudar
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: "📝", t: "Publica", d: "Di qué necesitas o qué puedes ofrecer." },
          { icon: "🗺️", t: "Encuentra", d: "Busca por cercanía y urgencia." },
          { icon: "💬", t: "Coordina", d: "Hablen directo y resuelvan." },
        ].map((p) => (
          <div key={p.t} className="rounded-2xl border border-slate-100 bg-white p-3">
            <div className="text-2xl">{p.icon}</div>
            <div className="mt-1 text-sm font-bold text-slate-800">{p.t}</div>
            <div className="mt-0.5 text-[11px] leading-tight text-slate-500">{p.d}</div>
          </div>
        ))}
      </section>

      <p className="mt-6 text-center text-xs text-slate-400">
        Una herramienta solidaria, gratuita y sin fines de lucro.
      </p>
    </div>
  );
}
