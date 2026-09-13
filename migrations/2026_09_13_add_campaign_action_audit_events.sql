-- Migration: campaign_action_audit_events
-- Aanleiding: de testklant-seed van 2026-09-13 stelde vast dat deze tabel op
-- productie ontbreekt, terwijl frontend/lib/campaign-audit.ts erin schrijft en
-- dashboard/page.tsx, campaigns/[id]/page.tsx, beheer-data.ts en
-- api/internal/progress-nudge eruit lezen. Gevolg: "herinnering verstuurd" en
-- "campagne gesloten" konden nergens worden vastgelegd, en closeCampaignAction
-- gaf "Sluiten gelukt, maar loggen mislukt".
-- Uitvoeren in: Supabase Dashboard → SQL Editor. Additief en idempotent.
-- Kolommen volgen CampaignAuditEventRecord + de insert in campaign-audit.ts.

create table if not exists public.campaign_action_audit_events (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  campaign_id      uuid not null references public.campaigns(id) on delete cascade,
  actor_user_id    uuid references auth.users(id) on delete set null,
  action_key       text not null,
  outcome          text not null check (outcome in ('completed', 'blocked')),
  action_label     text not null,
  owner_label      text not null,
  actor_role       text,
  actor_label      text,
  summary          text not null default '',
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists campaign_action_audit_events_campaign_idx
  on public.campaign_action_audit_events (campaign_id, action_key, created_at desc);

alter table public.campaign_action_audit_events enable row level security;

-- Leden van de organisatie lezen; eigenaar/member (is_org_manager) en de
-- Loep-operator schrijven. Service-role omzeilt RLS (progress-nudge).
drop policy if exists "org_members_can_select_audit_events" on public.campaign_action_audit_events;
create policy "org_members_can_select_audit_events"
  on public.campaign_action_audit_events for select
  using (public.is_org_member(organization_id) or public.is_verisight_admin_user());

drop policy if exists "org_managers_can_insert_audit_events" on public.campaign_action_audit_events;
create policy "org_managers_can_insert_audit_events"
  on public.campaign_action_audit_events for insert
  with check (public.is_org_manager(organization_id) or public.is_verisight_admin_user());

-- Auditrijen zijn onveranderlijk voor klanten: geen update/delete-policy.
revoke update, delete on public.campaign_action_audit_events from authenticated;
