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
  api_key       uuid unique default gen_random_uuid(),
  is_active     boolean default true,
  created_at    timestamptz default now()
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.organizations    enable row level security;
alter table public.org_members      enable row level security;
alter table public.org_invites      enable row level security;
alter table public.campaigns        enable row level security;
alter table public.respondents      enable row level security;
alter table public.survey_responses enable row level security;

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

-- ── Policies: drop + recreate zodat ze altijd correct zijn ──────────────────

-- Organizations
drop policy if exists "org_members_can_select_org"       on public.organizations;
drop policy if exists "authenticated_can_insert_org"     on public.organizations;
drop policy if exists "owners_can_update_org"            on public.organizations;

create policy "org_members_can_select_org"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "authenticated_can_insert_org"
  on public.organizations for insert
  with check (auth.uid() is not null);

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
