/** Pantalla amigable cuando Supabase todavía no está configurado. */
export default function SetupNotice() {
  return (
    <div className="px-4 py-10">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-bold">⚙️ Falta conectar la base de datos</h2>
        <p className="mt-2 text-sm leading-relaxed">
          La aplicación está lista, pero todavía no está conectada a Supabase. Para
          activarla:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            En tu proyecto Supabase, ejecuta el archivo{" "}
            <code className="rounded bg-amber-100 px-1">supabase/migrations/0001_init.sql</code>{" "}
            (SQL Editor).
          </li>
          <li>
            Copia <code className="rounded bg-amber-100 px-1">.env.example</code> a{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> y rellena{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </li>
          <li>
            Reinicia el servidor (<code className="rounded bg-amber-100 px-1">npm run dev</code>).
          </li>
        </ol>
        <p className="mt-4 text-xs text-amber-700">
          Encuentras esos valores en Supabase &gt; Project Settings &gt; API.
        </p>
      </div>
    </div>
  );
}
