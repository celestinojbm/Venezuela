"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { Message } from "@/lib/types";
import { cx, horaCorta } from "@/lib/format";

export default function ChatThread({
  offerId,
  otroNombre,
}: {
  offerId: string;
  otroNombre?: string | null;
}) {
  const { supabase, user } = useSupabase();
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  // Carga inicial + suscripción en tiempo real.
  useEffect(() => {
    if (!supabase) return;
    let activo = true;

    supabase
      .from("messages")
      .select("*")
      .eq("offer_id", offerId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (activo && data) setMensajes(data as Message[]);
      });

    const canal = supabase
      .channel(`mensajes-${offerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `offer_id=eq.${offerId}` },
        (payload) => {
          setMensajes((prev) => {
            const nuevo = payload.new as Message;
            if (prev.some((m) => m.id === nuevo.id)) return prev;
            return [...prev, nuevo];
          });
        },
      )
      .subscribe();

    return () => {
      activo = false;
      void supabase.removeChannel(canal);
    };
  }, [supabase, offerId]);

  // Auto-scroll al final cuando llegan mensajes.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const cuerpo = texto.trim();
    if (!cuerpo || !supabase || !user) return;
    setEnviando(true);
    const { error } = await supabase
      .from("messages")
      .insert({ offer_id: offerId, sender_id: user.id, body: cuerpo });
    setEnviando(false);
    if (!error) setTexto("");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">
        💬 Chat {otroNombre ? `con ${otroNombre}` : ""}
      </div>

      <div className="flex max-h-80 min-h-[8rem] flex-col gap-2 overflow-y-auto p-3">
        {mensajes.length === 0 ? (
          <p className="my-auto text-center text-xs text-slate-400">
            Aún no hay mensajes. Escribe para coordinar la ayuda.
          </p>
        ) : (
          mensajes.map((m) => {
            const mio = m.sender_id === user?.id;
            return (
              <div key={m.id} className={cx("flex", mio ? "justify-end" : "justify-start")}>
                <div
                  className={cx(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    mio
                      ? "rounded-br-sm bg-marca-600 text-white"
                      : "rounded-bl-sm bg-slate-100 text-slate-800",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <span className={cx("mt-0.5 block text-[10px]", mio ? "text-marca-100" : "text-slate-400")}>
                    {horaCorta(m.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={finRef} />
      </div>

      <form onSubmit={enviar} className="flex items-center gap-2 border-t border-slate-100 p-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={2000}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-marca-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-marca-600 text-white disabled:opacity-50"
          aria-label="Enviar"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
