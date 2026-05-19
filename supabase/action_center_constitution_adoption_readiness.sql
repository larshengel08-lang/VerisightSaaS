create table if not exists public.action_center_adoption_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_id text not null,
  route_scope_value text not null,
  route_source_id uuid not null,
  scan_type text not null
    check (scan_type in ('exit', 'retention')),
  review_item_id text,
  object_anchor text not null
    check (object_anchor in ('follow_through_route', 'review_moment', 'closeout_continuation_record')),
  event_name text not null
    check (
      event_name in (
        'manager_trigger_delivered',
        'manager_contextual_entry_opened',
        'manager_quick_action_completed',
        'review_completed',
        'review_rescheduled',
        'route_became_stale',
        'route_became_overdue',
        'route_became_escalation_sensitive',
        'route_closed',
        'route_reopened',
        'hr_manual_chase_logged'
      )
    ),
  event_source text not null
    check (
      event_source in (
        'trigger_delivery_ledger',
        'contextual_entry',
        'manager_quick_action',
        'review_transition',
        'review_reschedule',
        'route_state_derivation',
        'route_closeout',
        'route_reopen',
        'hr_manual_chase'
      )
    ),
  actor_role text not null
    check (actor_role in ('hr_rhythm_owner', 'manager_participant', 'system_channel')),
  actor_user_id uuid references auth.users(id) on delete set null,
  measurement_window_key text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint action_center_adoption_events_route_id_text_check
    check (length(btrim(route_id)) > 0),
  constraint action_center_adoption_events_route_scope_value_text_check
    check (length(btrim(route_scope_value)) > 0),
  constraint action_center_adoption_events_route_identity_check
    check (route_id = ((route_source_id)::text || '::' || route_scope_value)),
  constraint action_center_adoption_events_review_item_id_text_check
    check (review_item_id is null or length(btrim(review_item_id)) > 0),
  constraint action_center_adoption_events_measurement_window_key_text_check
    check (measurement_window_key is null or length(btrim(measurement_window_key)) > 0),
  constraint action_center_adoption_events_route_source_campaign_org_fk
    foreign key (route_source_id, org_id) references public.campaigns(id, organization_id) on delete cascade
);

create index if not exists idx_action_center_adoption_events_org
  on public.action_center_adoption_events(org_id, occurred_at desc);

create index if not exists idx_action_center_adoption_events_route
  on public.action_center_adoption_events(route_id, event_name, occurred_at desc);

create index if not exists idx_action_center_adoption_events_review_item
  on public.action_center_adoption_events(review_item_id)
  where review_item_id is not null;

alter table public.action_center_adoption_events enable row level security;

drop policy if exists "service_role_can_select_action_center_adoption_events" on public.action_center_adoption_events;
create policy "service_role_can_select_action_center_adoption_events"
  on public.action_center_adoption_events for select
  to service_role
  using (true);

drop policy if exists "service_role_can_insert_action_center_adoption_events" on public.action_center_adoption_events;
create policy "service_role_can_insert_action_center_adoption_events"
  on public.action_center_adoption_events for insert
  to service_role
  with check (true);

notify pgrst, 'reload schema';
