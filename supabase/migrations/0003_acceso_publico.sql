-- ============================================================================
-- Acceso público sin login: cualquiera ve y publica (sin cuenta).
-- El autor deja de ser un usuario autenticado; se guarda solo el nombre opcional.
-- El contacto se hace por WhatsApp / llamada (no hay chat interno).
-- ============================================================================

alter table public.requests alter column author_id drop not null;
alter table public.requests add column if not exists author_name text
  check (author_name is null or char_length(author_name) <= 120);

alter table public.volunteer_listings alter column author_id drop not null;
alter table public.volunteer_listings add column if not exists author_name text
  check (author_name is null or char_length(author_name) <= 120);

-- requests: lectura e inserción públicas (sin update/delete público)
drop policy if exists requests_select on public.requests;
drop policy if exists requests_insert_own on public.requests;
drop policy if exists requests_update_own on public.requests;
drop policy if exists requests_delete_own on public.requests;
create policy requests_select_public on public.requests
  for select to anon, authenticated using (true);
create policy requests_insert_public on public.requests
  for insert to anon, authenticated with check (true);

-- volunteer_listings: lectura e inserción públicas
drop policy if exists vol_select on public.volunteer_listings;
drop policy if exists vol_insert_own on public.volunteer_listings;
drop policy if exists vol_update_own on public.volunteer_listings;
drop policy if exists vol_delete_own on public.volunteer_listings;
create policy vol_select_public on public.volunteer_listings
  for select to anon, authenticated using (true);
create policy vol_insert_public on public.volunteer_listings
  for insert to anon, authenticated with check (true);
