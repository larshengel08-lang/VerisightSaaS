alter table public.org_invites
drop constraint if exists org_invites_role_check;

alter table public.org_invites
add constraint org_invites_role_check
check (role in ('owner', 'member', 'viewer'));

create table if not exists public.campaign_action_audit_events (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid references public.organizations(id) on delete cascade not null,
  campaign_id       uuid references public.campaigns(id) on delete cascade not null,
  actor_user_id     uuid references auth.users(id) on delete set null,
  action_key        text not null check (action_key in ('import_respondents', 'launch_invites', 'send_reminders', 'grant_client_access', 'delivery_lifecycle_changed', 'delivery_checkpoint_confirmed')),
  outcome           text not null check (outcome in ('completed', 'blocked')),
  action_label      text not null,
  owner_label       text not null,
  actor_role        text,
  actor_label       text,
  summary           text not null,
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz default now()
);

create index if not exists idx_campaign_action_audit_campaign
  on public.campaign_action_audit_events(campaign_id, created_at desc);

create index if not exists idx_campaign_action_audit_org
  on public.campaign_action_audit_events(organization_id, created_at desc);

alter table public.campaign_action_audit_events enable row level security;

drop policy if exists "org_members_can_select_campaign_action_audit_events"
  on public.campaign_action_audit_events;

drop policy if exists "org_members_can_insert_campaign_action_audit_events"
  on public.campaign_action_audit_events;

create policy "org_members_can_select_campaign_action_audit_events"
  on public.campaign_action_audit_events for select
  using (public.is_verisight_admin_user() or public.is_org_member(organization_id));

create policy "org_members_can_insert_campaign_action_audit_events"
  on public.campaign_action_audit_events for insert
  with check (public.is_verisight_admin_user() or public.is_org_member(organization_id));
