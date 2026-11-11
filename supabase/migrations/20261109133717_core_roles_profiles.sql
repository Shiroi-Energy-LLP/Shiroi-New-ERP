-- Core: business divisions, staff roles, user profiles, shared helpers.

create type public.business_division as enum ('rooftop', 'ground_mount');

create type public.app_role as enum (
  'super_admin',
  'director',
  'sales_manager',
  'sales_engineer',
  'project_manager',
  'project_engineer',
  'purchase',
  'accounts',
  'hr',
  'store_manager',
  'technician'
);

-- Keeps updated_at current on any table that has the column.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One row per login. New sign-ins start inactive with no role until an admin activates them.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  role public.app_role,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_is_active_idx on public.profiles (is_active);
create index profiles_full_name_idx on public.profiles (full_name);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile automatically when an auth user is created.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Role helpers used by RLS policies. SECURITY DEFINER so they can read profiles without recursion.
create function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active
$$;

create function public.has_any_role(roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_app_role() = any (roles), false)
$$;

create function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_app_role() is not null
$$;

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.current_app_role() from public, anon;
revoke execute on function public.has_any_role(public.app_role[]) from public, anon;
revoke execute on function public.is_active_staff() from public, anon;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.has_any_role(public.app_role[]) to authenticated;
grant execute on function public.is_active_staff() to authenticated;

-- Profiles RLS: active staff can see everyone (for assignment lists); anyone can see their own row.
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_active_staff()));

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using ((select public.has_any_role(array['super_admin', 'director']::public.app_role[])))
  with check ((select public.has_any_role(array['super_admin', 'director']::public.app_role[])));
