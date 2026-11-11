-- Move RLS role helpers out of the API-exposed public schema (Supabase advisor 0029),
-- and stop API roles calling the event-trigger helper rls_auto_enable (advisor 0028).

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.current_app_role() set schema private;
alter function public.has_any_role(public.app_role[]) set schema private;
alter function public.is_active_staff() set schema private;

-- Bodies referenced public.current_app_role(); point them at the new schema.
create or replace function private.has_any_role(roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_app_role() = any (roles), false)
$$;

create or replace function private.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_app_role() is not null
$$;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
