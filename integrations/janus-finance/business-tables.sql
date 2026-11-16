-- SWAYMARK Business module for the EXISTING Janus Personal Finance Supabase project.
-- Project: janus-personal-finance (glopetsbjaoxutjghgdo).
-- ADDITIVE ONLY: do not drop, rename, or alter any existing personal finance tables.
-- Stop and inspect the schema first. Never run if public.swaymark_items already exists.
-- Apply only after the finance database is reachable and a recovery point exists.

begin;

create table public.swaymark_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('enquiries','clients','quotes','bookings','projects','tasks','finance')),
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 30000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index swaymark_items_owner_kind_idx
  on public.swaymark_items (owner_id,kind,created_at desc);

alter table public.swaymark_items enable row level security;

revoke all on table public.swaymark_items from public, anon, authenticated;
grant select, insert, update, delete on table public.swaymark_items to authenticated;
grant all on table public.swaymark_items to service_role;

-- Restrict signed-in users to their own business records.
-- Anonymous Auth users also get authenticated DB role; do not allow those users.
create policy swaymark_select_own
  on public.swaymark_items
  for select to authenticated
  using (
    (select auth.uid()) is not null
    and owner_id = (select auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean,false) = false
  );

create policy swaymark_insert_own
  on public.swaymark_items
  for insert to authenticated
  with check (
    (select auth.uid()) is not null
    and owner_id = (select auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean,false) = false
  );

create policy swaymark_update_own
  on public.swaymark_items
  for update to authenticated
  using (
    (select auth.uid()) is not null
    and owner_id = (select auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean,false) = false
  )
  with check (
    (select auth.uid()) is not null
    and owner_id = (select auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean,false) = false
  );

create policy swaymark_delete_own
  on public.swaymark_items
  for delete to authenticated
  using (
    (select auth.uid()) is not null
    and owner_id = (select auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean,false) = false
  );

commit;

-- Verify separately:
-- 1. Only public.swaymark_items was added; finance schemas/data unchanged.
-- 2. relrowsecurity=true and four policies have expected owner predicates.
-- 3. Anonymous users (anon and anonymous Auth) cannot select, insert, update or delete.
-- 4. A signed-in user can CRUD only their own rows.
-- 5. New tables may require explicit Data API exposure in Integrations > Data API.
-- 6. Check Security Advisor and test in a second account before real customer data.
