create unique index if not exists idx_campaigns_id_organization_id on public.campaigns(id, organization_id);

create table if not exists public.action_center_review_schedule_revisions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_id text not null,
  route_scope_value text not null,
  route_source_id uuid not null,
  scan_type text not null check (scan_type in ('exit')),
  operation text not null check (operation in ('reschedule', 'cancel')),
  revision integer not null check (revision >= 0),
  review_date date,
  previous_review_date date,
  constraint action_center_review_schedule_revisions_route_id_text_check
    check (length(btrim(route_id)) > 0),
  constraint action_center_review_schedule_revisions_route_scope_value_text_check
    check (length(btrim(route_scope_value)) > 0),
  constraint action_center_review_schedule_revisions_review_date_state_check
    check ((operation = 'cancel' and review_date is null) or (operation = 'reschedule' and review_date is not null)),
  constraint action_center_review_schedule_revisions_previous_review_date_check
    check (previous_review_date is not null),
  constraint action_center_review_schedule_revisions_review_date_change_check
    check ((operation = 'cancel') or (review_date <> previous_review_date)),
  constraint action_center_review_schedule_revisions_route_identity_check
    check (route_id = ((route_source_id)::text || '::' || route_scope_value)),
  reason text not null,
  constraint action_center_review_schedule_revisions_reason_text_check
    check (length(btrim(reason)) > 0),
  constraint action_center_review_schedule_revisions_reason_length_check
    check (char_length(reason) <= 160),
  constraint action_center_review_schedule_revisions_route_source_campaign_org_fk
    foreign key (route_source_id, org_id) references public.campaigns(id, organization_id) on delete cascade,
  changed_by uuid not null,
  changed_by_role text not null check (changed_by_role in ('verisight_admin', 'hr_owner', 'hr_member')),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_action_center_review_schedule_revisions_route_revision
  on public.action_center_review_schedule_revisions(route_id, revision);

alter table public.action_center_review_schedule_revisions enable row level security;

drop policy if exists "service_role_can_select_action_center_review_schedule_revisions" on public.action_center_review_schedule_revisions;
create policy "service_role_can_select_action_center_review_schedule_revisions"
  on public.action_center_review_schedule_revisions for select
  to service_role
  using (true);

drop policy if exists "service_role_can_insert_action_center_review_schedule_revisions" on public.action_center_review_schedule_revisions;
create policy "service_role_can_insert_action_center_review_schedule_revisions"
  on public.action_center_review_schedule_revisions for insert
  to service_role
  with check (true);

notify pgrst, 'reload schema';
