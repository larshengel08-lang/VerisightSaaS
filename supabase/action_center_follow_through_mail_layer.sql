create table if not exists public.action_center_follow_through_mail_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  route_id text not null,
  route_scope_value text not null,
  route_source_id uuid references public.campaigns(id) on delete cascade not null,
  scan_type text not null
    check (scan_type in ('exit', 'retention')),
  trigger_type text not null
    check (trigger_type in ('assignment_created', 'review_upcoming', 'review_overdue', 'follow_up_open_after_review')),
  recipient_role text not null
    check (recipient_role in ('manager', 'hr_oversight')),
  recipient_email text not null,
  source_marker text not null,
  dedupe_key text not null,
  delivery_status text not null
    check (delivery_status in ('sent', 'suppressed', 'failed')),
  suppression_reason text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (dedupe_key)
);

create index if not exists idx_action_center_follow_through_mail_events_org
  on public.action_center_follow_through_mail_events(org_id, created_at desc);

create index if not exists idx_action_center_follow_through_mail_events_route
  on public.action_center_follow_through_mail_events(route_id, trigger_type);

alter table public.action_center_follow_through_mail_events enable row level security;

drop policy if exists "service_role_can_select_action_center_follow_through_mail_events" on public.action_center_follow_through_mail_events;
create policy "service_role_can_select_action_center_follow_through_mail_events"
  on public.action_center_follow_through_mail_events for select
  to service_role
  using (true);

drop policy if exists "service_role_can_insert_action_center_follow_through_mail_events" on public.action_center_follow_through_mail_events;
create policy "service_role_can_insert_action_center_follow_through_mail_events"
  on public.action_center_follow_through_mail_events for insert
  to service_role
  with check (true);

notify pgrst, 'reload schema';
