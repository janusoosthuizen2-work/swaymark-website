-- SWAYMARK Business Hub: execute in a NEW SEPARATE Supabase project.
-- Never run in Clean Carpets & Pest Control Perth's project.
begin;
create table if not exists public.swaymark_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('enquiries','clients','quotes','bookings','projects','tasks','finance')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists swaymark_items_owner_created_idx on public.swaymark_items(owner_id, created_at desc);
create index if not exists swaymark_items_owner_kind_idx on public.swaymark_items(owner_id, kind);
alter table public.swaymark_items enable row level security;
revoke all on table public.swaymark_items from public, anon;
grant select, insert, update, delete on table public.swaymark_items to authenticated;
grant all on table public.swaymark_items to service_role;
drop policy if exists "swaymark_select_own" on public.swaymark_items;
drop policy if exists "swaymark_insert_own" on public.swaymark_items;
drop policy if exists "swaymark_update_own" on public.swaymark_items;
drop policy if exists "swaymark_delete_own" on public.swaymark_items;
create policy "swaymark_select_own" on public.swaymark_items for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);
create policy "swaymark_insert_own" on public.swaymark_items for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);
create policy "swaymark_update_own" on public.swaymark_items for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);
create policy "swaymark_delete_own" on public.swaymark_items for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);
commit;
-- Data API access is NOT automatically enabled for new tables in 2026.
-- Confirm public.swaymark_items is exposed to the Data API for authenticated users,
-- with RLS enabled and NO anon grants. Disable public signups/anonymous Auth.
