-- ============================================================
-- Verisight — Supabase Schema
-- Uitvoeren in: Supabase Dashboard → SQL Editor
-- Volledig idempotent: veilig meerdere keren uitvoeren
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- TABELLEN
-- ============================================================

create table if not exists public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  contact_email text not null,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

create table if not exists public.organization_secrets (
  org_id      uuid primary key references public.organizations(id) on delete cascade,
  api_key     uuid unique default gen_random_uuid(),
  created_at  timestamptz default now()
);

create table if not exists public.org_members (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid references public.organizations(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  -- owner  = Verisight-beheerder (volledige toegang, kan campaigns aanmaken)
  -- member = toekomstig intern gebruik
  -- viewer = HR-klant (alleen lezen: dashboard + PDF downloaden)
  role       text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

create table if not exists public.org_invites (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations(id) on delete cascade not null,
  email       text not null,
  full_name   text,
  role        text not null default 'viewer' check (role in ('member', 'viewer')),
  invited_by  uuid references auth.users(id) on delete set null,
  invited_at  timestamptz default now(),
  accepted_at timestamptz,
  unique(org_id, email)
);

create table if not exists public.campaigns (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name            text not null,
  scan_type       text not null check (scan_type in ('exit', 'retention')),
  delivery_mode   text check (delivery_mode in ('baseline', 'live')),
  is_active       boolean default true,
  enabled_modules jsonb,
  created_at      timestamptz default now(),
  closed_at       timestamptz
);

create table if not exists public.respondents (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid references public.campaigns(id) on delete cascade not null,
  token             uuid unique default gen_random_uuid(),
  department        text,
  role_level        text,
  exit_month        text,
  annual_salary_eur numeric,
  sent_at           timestamptz,
  opened_at         timestamptz,
  completed         boolean default false,
  completed_at      timestamptz,
  -- Token vervalt 90 dagen na aanmaken (AVG opslagbeperking + security)
  token_expires_at  timestamptz default (now() + interval '90 days'),
  -- E-mailadres voor uitnodigingsmail (optioneel, nooit zichtbaar in dashboard)
  email             text
);

-- Voeg 'viewer' toe aan de role-constraint als die er nog niet in zit
do $$ begin
  -- Drop de oude constraint en vervang door een die viewer toestaat
  alter table public.org_members
    drop constraint if exists org_members_role_check;
  alter table public.org_members
    add constraint org_members_role_check
    check (role in ('owner', 'member', 'viewer'));
exception when others then null;
end $$;

-- Voeg delivery_mode toe aan bestaande campaigns indien nog niet aanwezig
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'campaigns' and column_name = 'delivery_mode'
  ) then
    alter table public.campaigns add column delivery_mode text;
    alter table public.campaigns
      add constraint campaigns_delivery_mode_check
      check (delivery_mode in ('baseline', 'live'));
  end if;
exception when duplicate_object then null;
end $$;

-- Backfill geheime org-sleutels uit oude organizations.api_key, indien nog aanwezig
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

-- Voeg nieuwe kolommen toe aan bestaande tabel indien nog niet aanwezig
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'respondents' and column_name = 'token_expires_at'
  ) then
    alter table public.respondents
      add column token_expires_at timestamptz default (now() + interval '90 days');
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'respondents' and column_name = 'email'
  ) then
    alter table public.respondents add column email text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'respondents' and column_name = 'exit_month'
  ) then
    alter table public.respondents add column exit_month text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'org_invites' and column_name = 'full_name'
  ) then
    alter table public.org_invites add column full_name text;
  end if;
end $$;

-- Voeg scoring_version toe aan bestaande survey_responses indien nog niet aanwezig
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'survey_responses' and column_name = 'scoring_version'
  ) then
    alter table public.survey_responses
      add column scoring_version text not null default 'v1.0';
  end if;
end $$;

create table if not exists public.survey_responses (
  id                        uuid primary key default gen_random_uuid(),
  respondent_id             uuid unique references public.respondents(id) on delete cascade not null,
  tenure_years              numeric,
  exit_reason_category      text,
  exit_reason_code          text,
  stay_intent_score         int,
  sdt_raw                   jsonb default '{}',
  sdt_scores                jsonb default '{}',
  org_raw                   jsonb default '{}',
  org_scores                jsonb default '{}',
  pull_factors_raw          jsonb default '{}',
  open_text_raw             text,
  open_text_analysis        text,
  uwes_raw                  jsonb default '{}',
  uwes_score                numeric,
  turnover_intention_raw    jsonb default '{}',
  turnover_intention_score  numeric,
  risk_score                numeric,
  risk_band                 text,
  preventability            text,
  replacement_cost_eur      numeric,
  full_result               jsonb default '{}',
  submitted_at              timestamptz default now(),
  -- Versie van het scoringsmodel (bump bij gewichtswijzigingen voor historische vergelijking)
  scoring_version           text not null default 'v1.0'
);

create table if not exists public.contact_requests (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  work_email        text not null,
  organization      text not null,
  employee_count    text not null,
  route_interest    text not null default 'exitscan',
  cta_source        text not null default 'website_contact_form',
  desired_timing    text not null default 'orienterend',
  current_question  text not null,
  website           text,
  notification_sent boolean not null default false,
  notification_error text,
  created_at        timestamptz default now()
);

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'contact_requests' and column_name = 'route_interest'
  ) then
    alter table public.contact_requests add column route_interest text not null default 'exitscan';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'contact_requests' and column_name = 'cta_source'
  ) then
    alter table public.contact_requests add column cta_source text not null default 'website_contact_form';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'contact_requests' and column_name = 'desired_timing'
  ) then
    alter table public.contact_requests add column desired_timing text not null default 'orienterend';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'contact_requests' and column_name = 'notification_error'
  ) then
    alter table public.contact_requests add column notification_error text;
  end if;
end $$;

create table if not exists public.pilot_learning_dossiers (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid references public.organizations(id) on delete cascade,
  campaign_id             uuid references public.campaigns(id) on delete cascade,
  contact_request_id      uuid references public.contact_requests(id) on delete set null,
  title                   text not null,
  route_interest          text not null default 'exitscan' check (route_interest in ('exitscan', 'retentiescan', 'combinatie', 'nog-onzeker')),
  scan_type               text check (scan_type in ('exit', 'retention')),
  delivery_mode           text check (delivery_mode in ('baseline', 'live')),
  triage_status           text not null default 'nieuw' check (triage_status in ('nieuw', 'bevestigd', 'geparkeerd', 'uitgevoerd', 'verworpen')),
  lead_contact_name       text,
  lead_organization_name  text,
  lead_work_email         text,
  lead_employee_count     text,
  buyer_question          text,
  expected_first_value    text,
  buying_reason           text,
  trust_friction          text,
  implementation_risk     text,
  adoption_outcome        text,
  management_action_outcome text,
  next_route              text,
  stop_reason             text,
  created_by              uuid references auth.users(id) on delete set null,
  updated_by              uuid references auth.users(id) on delete set null,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create table if not exists public.pilot_learning_checkpoints (
  id                      uuid primary key default gen_random_uuid(),
  dossier_id              uuid references public.pilot_learning_dossiers(id) on delete cascade not null,
  checkpoint_key          text not null check (checkpoint_key in ('lead_route_hypothesis', 'implementation_intake', 'launch_output', 'first_management_use', 'follow_up_review')),
  owner_label             text not null,
  status                  text not null default 'nieuw' check (status in ('nieuw', 'bevestigd', 'geparkeerd', 'uitgevoerd', 'verworpen')),
  objective_signal_notes  text,
  qualitative_notes       text,
  interpreted_observation text,
  confirmed_lesson        text,
  lesson_strength         text not null default 'incidentele_observatie' check (lesson_strength in ('incidentele_observatie', 'terugkerend_patroon', 'direct_uitvoerbare_verbetering')),
  destination_areas       jsonb not null default '[]'::jsonb,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (dossier_id, checkpoint_key)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_campaigns_org        on public.campaigns(organization_id);
create index if not exists idx_respondents_campaign on public.respondents(campaign_id);
create index if not exists idx_respondents_token    on public.respondents(token);
create index if not exists idx_responses_respondent on public.survey_responses(respondent_id);
create index if not exists idx_org_members_user     on public.org_members(user_id);
create index if not exists idx_org_members_org      on public.org_members(org_id);
create index if not exists idx_org_invites_org      on public.org_invites(org_id);
create index if not exists idx_org_invites_email    on public.org_invites(email);
create index if not exists idx_contact_requests_created_at on public.contact_requests(created_at desc);
create index if not exists idx_learning_dossiers_org on public.pilot_learning_dossiers(organization_id);
create index if not exists idx_learning_dossiers_campaign on public.pilot_learning_dossiers(campaign_id);
create index if not exists idx_learning_dossiers_contact_request on public.pilot_learning_dossiers(contact_request_id);
create index if not exists idx_learning_checkpoints_dossier on public.pilot_learning_checkpoints(dossier_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.organizations    enable row level security;
alter table public.organization_secrets enable row level security;
alter table public.org_members      enable row level security;
alter table public.org_invites      enable row level security;
alter table public.campaigns        enable row level security;
alter table public.respondents      enable row level security;
alter table public.survey_responses enable row level security;
alter table public.pilot_learning_dossiers enable row level security;
alter table public.pilot_learning_checkpoints enable row level security;

-- ── Hulpfuncties ─────────────────────────────────────────────────────────────

-- is_org_member: iedereen die lid is van de org (owner, member, viewer)
-- Gebruik voor SELECT-policies (lezen is voor alle rollen toegestaan)
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.org_members
    where org_members.org_id = $1
      and org_members.user_id = auth.uid()
  );
$$;

-- is_org_manager: alleen owner en member (niet viewer)
-- Gebruik voor INSERT/UPDATE-policies (schrijven is alleen voor beheerders)
create or replace function public.is_org_manager(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.org_members
    where org_members.org_id = $1
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'member')
  );
$$;

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

create or replace function public.get_org_api_key_for_current_user(target_org_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_key uuid;
begin
  if not public.is_org_member(target_org_id) then
    raise exception 'Geen toegang tot organisatiesecret voor deze organisatie.';
  end if;

  select api_key
  into resolved_key
  from public.organization_secrets
  where org_id = target_org_id;

  if resolved_key is null then
    raise exception 'API-sleutel voor organisatie ontbreekt.';
  end if;

  return resolved_key;
end;
$$;

grant execute on function public.get_org_api_key_for_current_user(uuid) to authenticated;

create or replace function public.accept_org_invites_for_current_user()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text;
  accepted_count integer := 0;
begin
  current_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if auth.uid() is null or current_email = '' then
    return 0;
  end if;

  insert into public.org_members (org_id, user_id, role)
  select oi.org_id, auth.uid(), oi.role
  from public.org_invites oi
  where lower(oi.email) = current_email
    and oi.accepted_at is null
  on conflict (org_id, user_id)
  do update set role = excluded.role;

  update public.org_invites
  set accepted_at = now()
  where lower(email) = current_email
    and accepted_at is null;

  get diagnostics accepted_count = row_count;
  return coalesce(accepted_count, 0);
end;
$$;

grant execute on function public.accept_org_invites_for_current_user() to authenticated;

-- ── Policies: drop + recreate zodat ze altijd correct zijn ──────────────────

-- Organizations
drop policy if exists "org_members_can_select_org"       on public.organizations;
drop policy if exists "authenticated_can_insert_org"     on public.organizations;
drop policy if exists "verisight_admins_can_insert_org"  on public.organizations;
drop policy if exists "owners_can_update_org"            on public.organizations;
drop policy if exists "owners_can_delete_org"            on public.organizations;

create policy "org_members_can_select_org"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "verisight_admins_can_insert_org"
  on public.organizations for insert
  with check (public.is_verisight_admin_user());

create policy "owners_can_update_org"
  on public.organizations for update
  using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = id
        and org_members.user_id = auth.uid()
        and org_members.role = 'owner'
    )
  );

create policy "owners_can_delete_org"
  on public.organizations for delete
  using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = id
        and org_members.user_id = auth.uid()
        and org_members.role = 'owner'
    )
  );

-- Org members
drop policy if exists "members_can_select_own_memberships" on public.org_members;
drop policy if exists "authenticated_can_insert_membership" on public.org_members;
drop policy if exists "org_managers_can_insert_membership" on public.org_members;

create policy "members_can_select_own_memberships"
  on public.org_members for select
  using (user_id = auth.uid() or public.is_org_member(org_id));

create policy "org_managers_can_insert_membership"
  on public.org_members for insert
  with check (public.is_org_manager(org_id));

-- Org invites
drop policy if exists "org_managers_can_select_invites" on public.org_invites;
drop policy if exists "org_managers_can_insert_invites" on public.org_invites;
drop policy if exists "org_managers_can_update_invites" on public.org_invites;

create policy "org_managers_can_select_invites"
  on public.org_invites for select
  using (public.is_org_manager(org_id));

create policy "org_managers_can_insert_invites"
  on public.org_invites for insert
  with check (public.is_org_manager(org_id));

create policy "org_managers_can_update_invites"
  on public.org_invites for update
  using (public.is_org_manager(org_id));

-- Campaigns
drop policy if exists "org_members_can_select_campaigns"  on public.campaigns;
drop policy if exists "org_members_can_insert_campaigns"  on public.campaigns;
drop policy if exists "org_members_can_update_campaigns"  on public.campaigns;
drop policy if exists "org_managers_can_insert_campaigns" on public.campaigns;
drop policy if exists "org_managers_can_update_campaigns" on public.campaigns;

-- Alle leden (ook viewers) mogen campaigns zien
create policy "org_members_can_select_campaigns"
  on public.campaigns for select
  using (public.is_org_member(organization_id));

-- Alleen managers (owner/member) mogen campaigns aanmaken en aanpassen
create policy "org_managers_can_insert_campaigns"
  on public.campaigns for insert
  with check (public.is_org_manager(organization_id));

create policy "org_managers_can_update_campaigns"
  on public.campaigns for update
  using (public.is_org_manager(organization_id));

-- Respondents
drop policy if exists "org_members_can_select_respondents"  on public.respondents;
drop policy if exists "org_members_can_insert_respondents"  on public.respondents;
drop policy if exists "org_managers_can_insert_respondents" on public.respondents;

-- Alle leden mogen respondenten zien (voor dashboard)
create policy "org_members_can_select_respondents"
  on public.respondents for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and public.is_org_member(c.organization_id)
    )
  );

-- Alleen managers mogen respondenten aanmaken
create policy "org_managers_can_insert_respondents"
  on public.respondents for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and public.is_org_manager(c.organization_id)
    )
  );

-- Survey responses
drop policy if exists "org_members_can_select_responses" on public.survey_responses;

create policy "org_members_can_select_responses"
  on public.survey_responses for select
  using (
    exists (
      select 1
      from public.respondents r
      join public.campaigns   c on c.id = r.campaign_id
      where r.id = respondent_id
        and public.is_org_member(c.organization_id)
    )
  );

-- Pilot learning dossiers
drop policy if exists "verisight_admins_can_select_learning_dossiers" on public.pilot_learning_dossiers;
drop policy if exists "verisight_admins_can_insert_learning_dossiers" on public.pilot_learning_dossiers;
drop policy if exists "verisight_admins_can_update_learning_dossiers" on public.pilot_learning_dossiers;

create policy "verisight_admins_can_select_learning_dossiers"
  on public.pilot_learning_dossiers for select
  using (public.is_verisight_admin_user());

create policy "verisight_admins_can_insert_learning_dossiers"
  on public.pilot_learning_dossiers for insert
  with check (public.is_verisight_admin_user());

create policy "verisight_admins_can_update_learning_dossiers"
  on public.pilot_learning_dossiers for update
  using (public.is_verisight_admin_user())
  with check (public.is_verisight_admin_user());

-- Pilot learning checkpoints
drop policy if exists "verisight_admins_can_select_learning_checkpoints" on public.pilot_learning_checkpoints;
drop policy if exists "verisight_admins_can_insert_learning_checkpoints" on public.pilot_learning_checkpoints;
drop policy if exists "verisight_admins_can_update_learning_checkpoints" on public.pilot_learning_checkpoints;

create policy "verisight_admins_can_select_learning_checkpoints"
  on public.pilot_learning_checkpoints for select
  using (
    exists (
      select 1
      from public.pilot_learning_dossiers d
      where d.id = dossier_id
        and public.is_verisight_admin_user()
    )
  );

create policy "verisight_admins_can_insert_learning_checkpoints"
  on public.pilot_learning_checkpoints for insert
  with check (
    exists (
      select 1
      from public.pilot_learning_dossiers d
      where d.id = dossier_id
        and public.is_verisight_admin_user()
    )
  );

create policy "verisight_admins_can_update_learning_checkpoints"
  on public.pilot_learning_checkpoints for update
  using (
    exists (
      select 1
      from public.pilot_learning_dossiers d
      where d.id = dossier_id
        and public.is_verisight_admin_user()
    )
  )
  with check (
    exists (
      select 1
      from public.pilot_learning_dossiers d
      where d.id = dossier_id
        and public.is_verisight_admin_user()
    )
  );

-- ============================================================
-- PROFILES: is_verisight_admin per gebruiker
-- ============================================================

create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  is_verisight_admin boolean not null default false,
  created_at         timestamptz default now()
);

alter table public.profiles enable row level security;

-- Gebruikers mogen alleen hun eigen profiel lezen (niet schrijven via client)
drop policy if exists "users_can_read_own_profile" on public.profiles;
create policy "users_can_read_own_profile"
  on public.profiles for select
  using (id = auth.uid());

-- Auto-aanmaken bij signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_user_created on auth.users;
create trigger on_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: na aanmaken org → eigenaar toevoegen als owner
-- ============================================================

create or replace function public.handle_new_org()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.org_members (org_id, user_id, role)
  values (new.id, auth.uid(), 'owner');
  return new;
end;
$$;

drop trigger if exists on_org_created on public.organizations;

create trigger on_org_created
  after insert on public.organizations
  for each row execute function public.handle_new_org();

-- ============================================================
-- VIEW: campaign_stats
-- ============================================================

-- security_invoker = true: view runs with caller's permissions so RLS on
-- campaigns / respondents / survey_responses is applied. Without this option
-- Supabase would run the view as the view-creator (security definer), bypassing
-- RLS and leaking campaign data across tenants.
-- Requires PostgreSQL 15 — Supabase EU Frankfurt ✓
create or replace view public.campaign_stats with (security_invoker = true) as
select
  c.id                                                as campaign_id,
  c.name                                              as campaign_name,
  c.scan_type,
  c.organization_id,
  c.is_active,
  c.created_at,
  count(r.id)                                         as total_invited,
  count(r.id) filter (where r.completed)              as total_completed,
  round(
    count(r.id) filter (where r.completed)::numeric
    / nullif(count(r.id), 0) * 100, 1
  )                                                   as completion_rate_pct,
  round(avg(sr.risk_score)::numeric, 2)               as avg_risk_score,
  count(sr.id) filter (where sr.risk_band = 'HOOG')   as band_high,
  count(sr.id) filter (where sr.risk_band = 'MIDDEN') as band_medium,
  count(sr.id) filter (where sr.risk_band = 'LAAG')   as band_low
from public.campaigns c
left join public.respondents      r  on r.campaign_id   = c.id
left join public.survey_responses sr on sr.respondent_id = r.id
group by c.id, c.name, c.scan_type, c.organization_id, c.is_active, c.created_at;
