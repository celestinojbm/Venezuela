-- ============================================================================
-- Anti-spam: las publicaciones pasan por la Edge Function 'publicar'
-- (honeypot + límite por dispositivo + reglas de contenido).
-- Se quita el INSERT directo público; la función inserta con la service role.
-- ============================================================================

-- Tabla interna para limitar publicaciones por dispositivo (IP hasheada).
-- Sin políticas RLS => solo la service role (la función) puede usarla.
create table if not exists public.post_throttle (
  id         uuid primary key default gen_random_uuid(),
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_throttle_ip_time on public.post_throttle (ip_hash, created_at desc);
alter table public.post_throttle enable row level security;

-- Quitar el insert directo público (ahora todo pasa por la función validada).
drop policy if exists requests_insert_public on public.requests;
drop policy if exists vol_insert_public on public.volunteer_listings;
