-- Verisight live hardening patch
-- Uitvoeren in Supabase SQL Editor
-- Doel:
-- 1. organization_secrets toevoegen
-- 2. bestaande api_key migreren uit organizations
-- 3. delivery_mode toevoegen aan campaigns
-- 4. launch-control velden toevoegen aan campaign_delivery_records
-- 5. org creation beperken tot Verisight-admins
-- 6. nieuwe organisaties automatisch secret + owner-membership geven

create table if not exists public.organization_secrets (
  org_id      uuid primary key references public.organizations(id) on delete cascade,
  api_key     uuid unique default gen_random_uuid(),
  created_at  timestamptz default now()
);

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'campaigns' and column_name = 'delivery_mode'
  ) then
    alter table public.campaigns add column delivery_mode text;
  end if;
exception when duplicate_column then null;
end $$;

do $$ begin
  alter table public.campaigns
    drop constraint if exists campaigns_delivery_mode_check;
  alter table public.campaigns
    add constraint campaigns_delivery_mode_check
    check (delivery_mode in ('baseline', 'live'));
exception when duplicate_object then null;
end $$;

do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'campaign_delivery_records'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_name = 'campaign_delivery_records' and column_name = 'launch_date'
    ) then
      alter table public.campaign_delivery_records add column launch_date date;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_name = 'campaign_delivery_records' and column_name = 'launch_confirmed_at'
    ) then
      alter table public.campaign_delivery_records add column launch_confirmed_at timestamptz;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_name = 'campaign_delivery_records' and column_name = 'participant_comms_config'
    ) then
      alter table public.campaign_delivery_records
        add column participant_comms_config jsonb not null default '{}'::jsonb;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_name = 'campaign_delivery_records' and column_name = 'reminder_config'
    ) then
      alter table public.campaign_delivery_records
        add column reminder_config jsonb not null default '{}'::jsonb;
    end if;
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'organizations' and column_name = 'api_key'
  ) then
    insert into public.organization_secrets (org_id, api_key)
    select id, api_key
    from public.organizations
    where api_key is not null
    on conflict (org_id) do nothing;

    alter table public.organizations drop column if exists api_key;
  end if;
end $$;

create or replace function public.is_verisight_admin_user()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_verisight_admin = true
  );
$$;

create or replace function public.ensure_organization_secret()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.organization_secrets (org_id)
  values (new.id)
  on conflict (org_id) do nothing;

  if auth.uid() is not null then
    insert into public.org_members (org_id, user_id, role)
    values (new.id, auth.uid(), 'owner')
    on conflict (org_id, user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists organizations_create_secret on public.organizations;
create trigger organizations_create_secret
after insert on public.organizations
for each row execute function public.ensure_organization_secret();

alter table public.organization_secrets enable row level security;

drop policy if exists "verisight_admins_can_insert_org" on public.organizations;
drop policy if exists "authenticated_can_insert_org" on public.organizations;
create policy "verisight_admins_can_insert_org"
  on public.organizations for insert
  with check (public.is_verisight_admin_user());
