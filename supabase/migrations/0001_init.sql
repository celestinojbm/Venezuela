-- ============================================================================
-- Manos Venezuela — esquema inicial
-- Conecta personas voluntarias con damnificados por la catástrofe.
--
-- Aplica este archivo en tu proyecto Supabase:
--   - Dashboard > SQL Editor > pega y ejecuta, o
--   - supabase db push (CLI), o
--   - la herramienta apply_migration del MCP de Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tablas
-- ----------------------------------------------------------------------------

-- Perfil público de cada usuario (1:1 con auth.users).
-- NOTA: no almacenamos teléfono aquí a propósito. El perfil es legible por
-- cualquier usuario autenticado (para mostrar nombres), así que guardar el
-- teléfono permitiría recolectar contactos masivamente. El teléfono de
-- contacto vive en cada solicitud (lo publica quien pide ayuda, de forma
-- intencional) y los voluntarios coordinan por el chat de la app.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) <= 120),
  role        text not null default 'ambos'
              check (role in ('necesito', 'ayudo', 'ambos')),
  created_at  timestamptz not null default now()
);

-- Solicitudes de ayuda publicadas por damnificados.
create table if not exists public.requests (
  id            uuid primary key default gen_random_uuid(),
  -- Referencia a profiles (no a auth.users) para permitir embeds de PostgREST.
  -- profiles.id es 1:1 con auth.users.id, así que la integridad se mantiene.
  author_id     uuid not null references public.profiles (id) on delete cascade,
  title         text not null check (char_length(title) between 3 and 140),
  description   text check (char_length(description) <= 2000),
  category      text not null
                check (category in ('agua','alimentos','refugio','medicina',
                                    'rescate','ropa','higiene','transporte','otros')),
  urgency       text not null default 'media'
                check (urgency in ('baja','media','alta','critica')),
  status        text not null default 'abierta'
                check (status in ('abierta','en_proceso','resuelta','cerrada')),
  lat           double precision check (lat between -90 and 90),
  lng           double precision check (lng between -180 and 180),
  location_text text check (char_length(location_text) <= 200),
  contact_phone text check (char_length(contact_phone) <= 40),
  people_count  integer check (people_count is null or people_count between 1 and 10000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Ofertas de ayuda de un voluntario sobre una solicitud concreta.
create table if not exists public.offers (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.requests (id) on delete cascade,
  volunteer_id  uuid not null references public.profiles (id) on delete cascade,
  message       text check (char_length(message) <= 1000),
  status        text not null default 'pendiente'
                check (status in ('pendiente','aceptada','rechazada','completada')),
  created_at    timestamptz not null default now(),
  unique (request_id, volunteer_id)
);

-- Mensajes de chat dentro de una oferta (entre damnificado y voluntario).
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  offer_id    uuid not null references public.offers (id) on delete cascade,
  sender_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------
create index if not exists idx_requests_status     on public.requests (status);
create index if not exists idx_requests_category   on public.requests (category);
create index if not exists idx_requests_urgency    on public.requests (urgency);
create index if not exists idx_requests_created_at on public.requests (created_at desc);
create index if not exists idx_requests_author     on public.requests (author_id);
create index if not exists idx_offers_request      on public.offers (request_id);
create index if not exists idx_offers_volunteer    on public.offers (volunteer_id);
create index if not exists idx_messages_offer       on public.messages (offer_id, created_at);

-- ----------------------------------------------------------------------------
-- Funciones auxiliares y triggers
-- ----------------------------------------------------------------------------

-- Crea automáticamente un perfil cuando se registra un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantiene updated_at al día en requests.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_requests_updated_at on public.requests;
create trigger trg_requests_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- Comprueba si el usuario actual participa en una oferta
-- (es el voluntario o el autor de la solicitud asociada).
-- SECURITY INVOKER: el RLS de offers (solo participante) y requests (lectura
-- autenticada) ya restringe la visibilidad; como no consulta la tabla messages,
-- no hay recursión de políticas.
create or replace function public.is_offer_participant(p_offer_id uuid)
returns boolean
language sql
security invoker
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.offers o
    join public.requests r on r.id = o.request_id
    where o.id = p_offer_id
      and (o.volunteer_id = auth.uid() or r.author_id = auth.uid())
  );
$$;

-- Permisos mínimos de ejecución: las funciones SECURITY DEFINER / de trigger no
-- deben ser invocables como RPC. handle_new_user solo corre como trigger;
-- is_offer_participant lo necesita el RLS, así que se concede a authenticated.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_offer_participant(uuid) from public, anon;
grant execute on function public.is_offer_participant(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.offers   enable row level security;
alter table public.messages enable row level security;

-- profiles -------------------------------------------------------------------
-- Cualquier usuario autenticado puede ver perfiles (para mostrar nombres).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- requests -------------------------------------------------------------------
-- Visibles para usuarios autenticados (protege datos de personas vulnerables).
drop policy if exists requests_select on public.requests;
create policy requests_select on public.requests
  for select to authenticated using (true);

drop policy if exists requests_insert_own on public.requests;
create policy requests_insert_own on public.requests
  for insert to authenticated with check (author_id = auth.uid());

drop policy if exists requests_update_own on public.requests;
create policy requests_update_own on public.requests
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists requests_delete_own on public.requests;
create policy requests_delete_own on public.requests
  for delete to authenticated using (author_id = auth.uid());

-- offers ---------------------------------------------------------------------
-- Visible para el voluntario que la hizo y para el autor de la solicitud.
drop policy if exists offers_select on public.offers;
create policy offers_select on public.offers
  for select to authenticated using (
    volunteer_id = auth.uid()
    or exists (select 1 from public.requests r
               where r.id = offers.request_id and r.author_id = auth.uid())
  );

drop policy if exists offers_insert_self on public.offers;
create policy offers_insert_self on public.offers
  for insert to authenticated with check (volunteer_id = auth.uid());

-- Solo el autor de la solicitud puede aceptar / rechazar / completar una oferta.
drop policy if exists offers_update_author on public.offers;
create policy offers_update_author on public.offers
  for update to authenticated
  using (
    exists (select 1 from public.requests r
            where r.id = offers.request_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.requests r
            where r.id = offers.request_id and r.author_id = auth.uid())
  );

-- El voluntario puede retirar su propia oferta.
drop policy if exists offers_delete_self on public.offers;
create policy offers_delete_self on public.offers
  for delete to authenticated using (volunteer_id = auth.uid());

-- messages -------------------------------------------------------------------
-- Solo los dos participantes de la oferta pueden leer/escribir.
drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants on public.messages
  for select to authenticated using (public.is_offer_participant(offer_id));

drop policy if exists messages_insert_participants on public.messages;
create policy messages_insert_participants on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid() and public.is_offer_participant(offer_id)
  );

-- ----------------------------------------------------------------------------
-- Tiempo real (Realtime)
-- ----------------------------------------------------------------------------
-- Habilita notificaciones en vivo para chat y ofertas.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'offers'
  ) then
    alter publication supabase_realtime add table public.offers;
  end if;
end;
$$;
