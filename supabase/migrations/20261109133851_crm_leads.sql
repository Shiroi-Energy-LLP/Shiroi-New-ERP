-- CRM: leads, activity timeline, dashboard summary.

create type public.lead_source as enum (
  'website', 'manual', 'whatsapp', 'referral', 'indiamart', 'facebook', 'google'
);

create type public.lead_stage as enum (
  'new', 'contacted', 'site_visit', 'proposal_sent', 'negotiation', 'won', 'lost'
);

create type public.roof_type as enum (
  'rcc', 'metal_sheet', 'tile', 'asbestos', 'open_land', 'other'
);

create type public.lead_activity_type as enum (
  'created', 'note', 'call', 'whatsapp', 'email', 'site_visit', 'follow_up', 'stage_change'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_number bigint generated always as identity unique,
  division public.business_division not null,
  customer_name text not null check (length(trim(customer_name)) > 0),
  phone text,
  email text,
  address text,
  city text,
  pincode text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  source public.lead_source not null default 'manual',
  stage public.lead_stage not null default 'new',
  load_requirement_kw numeric(10, 2) check (load_requirement_kw >= 0),
  monthly_eb_bill numeric(14, 2) check (monthly_eb_bill >= 0),
  roof_type public.roof_type,
  assigned_to uuid references public.profiles (id) on delete set null,
  next_follow_up_at timestamptz,
  site_visit_at timestamptz,
  lost_reason text,
  notes text,
  stage_changed_at timestamptz not null default now(),
  won_at timestamptz,
  lost_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_division_stage_idx on public.leads (division, stage);
create index leads_division_created_at_idx on public.leads (division, created_at desc);
create index leads_assigned_to_idx on public.leads (assigned_to);
create index leads_created_by_idx on public.leads (created_by);
create index leads_source_idx on public.leads (source);
create index leads_next_follow_up_at_idx on public.leads (next_follow_up_at);
create index leads_site_visit_at_idx on public.leads (site_visit_at);
create index leads_won_at_idx on public.leads (won_at);
create index leads_customer_name_trgm_idx on public.leads using gin (customer_name extensions.gin_trgm_ops);
create index leads_phone_trgm_idx on public.leads using gin (phone extensions.gin_trgm_ops);
create index leads_city_trgm_idx on public.leads using gin (city extensions.gin_trgm_ops);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  type public.lead_activity_type not null,
  body text,
  from_stage public.lead_stage,
  to_stage public.lead_stage,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index lead_activities_lead_id_created_at_idx on public.lead_activities (lead_id, created_at desc);
create index lead_activities_created_by_idx on public.lead_activities (created_by);

-- Stage bookkeeping (before write) and timeline entries (after write).
create function public.set_lead_stage_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.stage is distinct from old.stage then
    new.stage_changed_at = now();
    if new.stage = 'won' then new.won_at = coalesce(new.won_at, now()); end if;
    if new.stage = 'lost' then new.lost_at = coalesce(new.lost_at, now()); end if;
  end if;
  return new;
end;
$$;

create function public.log_lead_activity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_activities (lead_id, type, to_stage, created_by)
    values (new.id, 'created', new.stage, (select auth.uid()));
  elsif new.stage is distinct from old.stage then
    insert into public.lead_activities (lead_id, type, from_stage, to_stage, body, created_by)
    values (
      new.id, 'stage_change', old.stage, new.stage,
      case when new.stage = 'lost' then new.lost_reason end,
      (select auth.uid())
    );
  end if;
  return new;
end;
$$;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create trigger leads_stage_timestamps
  before insert or update of stage on public.leads
  for each row execute function public.set_lead_stage_timestamps();

create trigger leads_log_activity
  after insert or update of stage on public.leads
  for each row execute function public.log_lead_activity();

-- RLS: Super Admin / Director / Sales Manager see all leads; Sales Engineers see leads assigned to or created by them.
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;

create policy leads_select on public.leads
  for select to authenticated
  using (
    (select public.has_any_role(array['super_admin', 'director', 'sales_manager']::public.app_role[]))
    or (
      (select public.has_any_role(array['sales_engineer']::public.app_role[]))
      and (assigned_to = (select auth.uid()) or created_by = (select auth.uid()))
    )
  );

create policy leads_insert on public.leads
  for insert to authenticated
  with check (
    (select public.has_any_role(array['super_admin', 'director', 'sales_manager']::public.app_role[]))
    or (
      (select public.has_any_role(array['sales_engineer']::public.app_role[]))
      and created_by = (select auth.uid())
    )
  );

create policy leads_update on public.leads
  for update to authenticated
  using (
    (select public.has_any_role(array['super_admin', 'director', 'sales_manager']::public.app_role[]))
    or (
      (select public.has_any_role(array['sales_engineer']::public.app_role[]))
      and (assigned_to = (select auth.uid()) or created_by = (select auth.uid()))
    )
  )
  with check (
    (select public.has_any_role(array['super_admin', 'director', 'sales_manager']::public.app_role[]))
    or (
      (select public.has_any_role(array['sales_engineer']::public.app_role[]))
      and (assigned_to = (select auth.uid()) or created_by = (select auth.uid()))
    )
  );

create policy leads_delete on public.leads
  for delete to authenticated
  using ((select public.has_any_role(array['super_admin', 'director']::public.app_role[])));

-- Activities follow the lead: visible / addable if the lead is visible to you.
create policy lead_activities_select on public.lead_activities
  for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id));

create policy lead_activities_insert on public.lead_activities
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from public.leads l where l.id = lead_id)
  );

-- Dashboard counts for one division. SECURITY INVOKER, so each user only counts leads they can see.
-- "Today" and "this month" are measured in IST.
create function public.crm_dashboard_summary(p_division public.business_division)
returns table (
  todays_follow_ups bigint,
  overdue_follow_ups bigint,
  new_leads bigint,
  open_leads bigint,
  upcoming_site_visits bigint,
  proposals_pending bigint,
  won_this_month bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with bounds as (
    select
      (date_trunc('day', now() at time zone 'Asia/Kolkata')) at time zone 'Asia/Kolkata' as day_start,
      (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '1 day') at time zone 'Asia/Kolkata' as day_end,
      (date_trunc('month', now() at time zone 'Asia/Kolkata')) at time zone 'Asia/Kolkata' as month_start
  )
  select
    count(*) filter (where l.stage not in ('won', 'lost') and l.next_follow_up_at >= b.day_start and l.next_follow_up_at < b.day_end),
    count(*) filter (where l.stage not in ('won', 'lost') and l.next_follow_up_at < b.day_start),
    count(*) filter (where l.stage = 'new'),
    count(*) filter (where l.stage not in ('won', 'lost')),
    count(*) filter (where l.stage not in ('won', 'lost') and l.site_visit_at >= b.day_start),
    count(*) filter (where l.stage in ('proposal_sent', 'negotiation')),
    count(*) filter (where l.stage = 'won' and l.won_at >= b.month_start)
  from public.leads l
  cross join bounds b
  where l.division = p_division
$$;

revoke execute on function public.crm_dashboard_summary(public.business_division) from public, anon;
grant execute on function public.crm_dashboard_summary(public.business_division) to authenticated;
revoke execute on function public.set_lead_stage_timestamps() from public, anon, authenticated;
revoke execute on function public.log_lead_activity() from public, anon, authenticated;
