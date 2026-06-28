-- ============================================================================
-- Manos Venezuela — voluntarios (directorio bidireccional) y rol en el registro
-- ============================================================================

-- 1) El perfil toma el rol elegido en el registro (desde los metadatos del usuario).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when new.raw_user_meta_data ->> 'role' in ('necesito','ayudo','ambos')
         then new.raw_user_meta_data ->> 'role' else 'ambos' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- 2) Directorio de voluntarios: cada voluntario publica qué puede ofrecer,
--    para que los damnificados también los encuentren y contacten fácil.
create table if not exists public.volunteer_listings (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles (id) on delete cascade,
  title         text not null check (char_length(title) between 3 and 140),
  description   text check (char_length(description) <= 2000),
  category      text not null
                check (category in ('agua','alimentos','refugio','medicina',
                                    'rescate','ropa','higiene','transporte','otros')),
  location_text text check (char_length(location_text) <= 200),
  lat           double precision check (lat between -90 and 90),
  lng           double precision check (lng between -180 and 180),
  contact_phone text check (char_length(contact_phone) <= 40),
  status        text not null default 'activo' check (status in ('activo','pausado')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_vol_created  on public.volunteer_listings (created_at desc);
create index if not exists idx_vol_category on public.volunteer_listings (category);
create index if not exists idx_vol_author   on public.volunteer_listings (author_id);

drop trigger if exists trg_vol_updated_at on public.volunteer_listings;
create trigger trg_vol_updated_at
  before update on public.volunteer_listings
  for each row execute function public.set_updated_at();

alter table public.volunteer_listings enable row level security;

drop policy if exists vol_select on public.volunteer_listings;
create policy vol_select on public.volunteer_listings
  for select to authenticated using (true);

drop policy if exists vol_insert_own on public.volunteer_listings;
create policy vol_insert_own on public.volunteer_listings
  for insert to authenticated with check (author_id = auth.uid());

drop policy if exists vol_update_own on public.volunteer_listings;
create policy vol_update_own on public.volunteer_listings
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists vol_delete_own on public.volunteer_listings;
create policy vol_delete_own on public.volunteer_listings
  for delete to authenticated using (author_id = auth.uid());
