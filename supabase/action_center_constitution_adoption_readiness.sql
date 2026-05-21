create table if not exists public.action_center_route_actions (
  id uuid primary key default gen_random_uuid(),
  manager_response_id uuid references public.action_center_manager_responses(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  org_id uuid references public.organizations(id) on delete cascade not null,
  route_id text not null,
  route_scope_type text not null
    check (route_scope_type in ('department', 'item')),
  route_scope_value text not null,
  manager_user_id uuid references auth.users(id) on delete cascade not null,
  owner_name text not null,
  owner_assigned_at timestamptz not null,
  primary_action_theme_key text
    check (primary_action_theme_key is null or primary_action_theme_key in ('leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity')),
  primary_action_text text,
  primary_action_expected_effect text,
  primary_action_status text
    check (primary_action_status is null or primary_action_status in ('open', 'in_review', 'afgerond', 'gestopt')),
  review_scheduled_for date,
  semantic_state text
    check (semantic_state is null or semantic_state in ('draft', 'active', 'review_due', 'in_review', 'blocked', 'completed', 'stopped', 'superseded')),
  validation_disposition text
    check (validation_disposition is null or validation_disposition in ('valid', 'invalid', 'needs_hr_review')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint action_center_route_actions_route_id_text_check
    check (length(btrim(route_id)) > 0),
  constraint action_center_route_actions_route_scope_value_text_check
    check (length(btrim(route_scope_value)) > 0),
  constraint action_center_route_actions_owner_name_text_check
    check (length(btrim(owner_name)) > 0),
  constraint action_center_route_actions_route_identity_check
    check (route_id = ((campaign_id)::text || '::' || route_scope_value))
);

create table if not exists public.action_center_action_reviews (
  id uuid primary key default gen_random_uuid(),
  action_id uuid references public.action_center_route_actions(id) on delete cascade not null,
  reviewed_at timestamptz not null,
  observation text not null,
  action_outcome text not null
    check (action_outcome in ('effect-zichtbaar', 'bijsturen-nodig', 'nog-te-vroeg', 'stoppen')),
  evidence_source text
    check (evidence_source is null or evidence_source in ('manager-observation', 'team-conversation', 'other-bounded-source')),
  confidence_level text
    check (confidence_level is null or confidence_level in ('low', 'medium', 'high')),
  follow_up_note text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint action_center_action_reviews_observation_text_check
    check (length(btrim(observation)) > 0),
  constraint action_center_action_reviews_follow_up_note_text_check
    check (follow_up_note is null or length(btrim(follow_up_note)) > 0)
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'theme_key'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'primary_action_theme_key'
  ) then
    alter table public.action_center_route_actions rename column theme_key to primary_action_theme_key;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'action_text'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'primary_action_text'
  ) then
    alter table public.action_center_route_actions rename column action_text to primary_action_text;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'expected_effect'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'primary_action_expected_effect'
  ) then
    alter table public.action_center_route_actions rename column expected_effect to primary_action_expected_effect;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'status'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'action_center_route_actions'
      and column_name = 'primary_action_status'
  ) then
    alter table public.action_center_route_actions rename column status to primary_action_status;
  end if;
end $$;

alter table public.action_center_route_actions
  add column if not exists manager_response_id uuid references public.action_center_manager_responses(id) on delete cascade,
  add column if not exists route_id text,
  add column if not exists owner_name text,
  add column if not exists owner_assigned_at timestamptz,
  add column if not exists primary_action_theme_key text,
  add column if not exists primary_action_text text,
  add column if not exists primary_action_expected_effect text,
  add column if not exists primary_action_status text,
  add column if not exists semantic_state text,
  add column if not exists validation_disposition text;

alter table public.action_center_action_reviews
  add column if not exists evidence_source text,
  add column if not exists confidence_level text;

alter table public.action_center_action_reviews
  alter column follow_up_note drop not null;

do $$
begin
  update public.action_center_route_actions
  set route_id = ((campaign_id)::text || '::' || route_scope_value)
  where route_id is null
    and campaign_id is not null
    and route_scope_value is not null;

  update public.action_center_route_actions a
  set manager_response_id = r.id
  from public.action_center_manager_responses r
  where a.manager_response_id is null
    and r.campaign_id = a.campaign_id
    and r.org_id = a.org_id
    and r.route_scope_type = a.route_scope_type
    and r.route_scope_value = a.route_scope_value
    and r.manager_user_id = a.manager_user_id;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'action_center_workspace_members'
  ) then
    update public.action_center_route_actions a
    set owner_name = coalesce(
      nullif(btrim(m.display_name), ''),
      nullif(regexp_replace(split_part(coalesce(m.login_email, ''), '@', 1), '[._-]+', ' ', 'g'), ''),
      (a.manager_user_id)::text
    )
    from public.action_center_workspace_members m
    where a.owner_name is null
      and m.org_id = a.org_id
      and m.user_id = a.manager_user_id
      and m.scope_type = a.route_scope_type
      and m.scope_value = a.route_scope_value
      and m.access_role = 'manager_assignee';

    update public.action_center_route_actions a
    set owner_assigned_at = coalesce(m.created_at, a.created_at)
    from public.action_center_workspace_members m
    where a.owner_assigned_at is null
      and m.org_id = a.org_id
      and m.user_id = a.manager_user_id
      and m.scope_type = a.route_scope_type
      and m.scope_value = a.route_scope_value
      and m.access_role = 'manager_assignee';
  end if;

  update public.action_center_route_actions
  set owner_name = (manager_user_id)::text
  where owner_name is null
    and manager_user_id is not null;

  update public.action_center_route_actions
  set owner_assigned_at = created_at
  where owner_assigned_at is null;
end $$;

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_route_id_text_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_route_id_text_check
  check (route_id is null or length(btrim(route_id)) > 0);

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_route_scope_value_text_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_route_scope_value_text_check
  check (length(btrim(route_scope_value)) > 0);

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_owner_name_text_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_owner_name_text_check
  check (owner_name is null or length(btrim(owner_name)) > 0);

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_route_identity_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_route_identity_check
  check (
    route_id is null
    or route_scope_value is null
    or campaign_id is null
    or route_id = ((campaign_id)::text || '::' || route_scope_value)
  );

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_primary_action_theme_key_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_primary_action_theme_key_check
  check (
    primary_action_theme_key is null
    or primary_action_theme_key in ('leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity')
  );

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_primary_action_status_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_primary_action_status_check
  check (
    primary_action_status is null
    or primary_action_status in ('open', 'in_review', 'afgerond', 'gestopt')
  );

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_semantic_state_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_semantic_state_check
  check (
    semantic_state is null
    or semantic_state in ('draft', 'active', 'review_due', 'in_review', 'blocked', 'completed', 'stopped', 'superseded')
  );

alter table public.action_center_route_actions
  drop constraint if exists action_center_route_actions_validation_disposition_check;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_validation_disposition_check
  check (
    validation_disposition is null
    or validation_disposition in ('valid', 'invalid', 'needs_hr_review')
  );

alter table public.action_center_action_reviews
  drop constraint if exists action_center_action_reviews_action_outcome_check;

alter table public.action_center_action_reviews
  add constraint action_center_action_reviews_action_outcome_check
  check (action_outcome in ('effect-zichtbaar', 'bijsturen-nodig', 'nog-te-vroeg', 'stoppen'));

alter table public.action_center_action_reviews
  drop constraint if exists action_center_action_reviews_evidence_source_check;

alter table public.action_center_action_reviews
  add constraint action_center_action_reviews_evidence_source_check
  check (
    evidence_source is null
    or evidence_source in ('manager-observation', 'team-conversation', 'other-bounded-source')
  );

alter table public.action_center_action_reviews
  drop constraint if exists action_center_action_reviews_confidence_level_check;

alter table public.action_center_action_reviews
  add constraint action_center_action_reviews_confidence_level_check
  check (
    confidence_level is null
    or confidence_level in ('low', 'medium', 'high')
  );

alter table public.action_center_action_reviews
  drop constraint if exists action_center_action_reviews_observation_text_check;

alter table public.action_center_action_reviews
  add constraint action_center_action_reviews_observation_text_check
  check (length(btrim(observation)) > 0);

alter table public.action_center_action_reviews
  drop constraint if exists action_center_action_reviews_follow_up_note_text_check;

alter table public.action_center_action_reviews
  add constraint action_center_action_reviews_follow_up_note_text_check
  check (follow_up_note is null or length(btrim(follow_up_note)) > 0);

create index if not exists idx_action_center_route_actions_manager_response
  on public.action_center_route_actions(manager_response_id);

create index if not exists idx_action_center_route_actions_route
  on public.action_center_route_actions(route_id, primary_action_status, review_scheduled_for);

create index if not exists idx_action_center_route_actions_manager_scope
  on public.action_center_route_actions(org_id, manager_user_id, route_scope_type, route_scope_value);

create index if not exists idx_action_center_action_reviews_action
  on public.action_center_action_reviews(action_id, reviewed_at desc);

alter table public.action_center_route_actions enable row level security;
alter table public.action_center_action_reviews enable row level security;

drop policy if exists "managers_can_select_action_center_route_actions" on public.action_center_route_actions;
create policy "managers_can_select_action_center_route_actions"
  on public.action_center_route_actions for select
  using (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_workspace_members m
      where m.user_id = auth.uid()
        and m.org_id = action_center_route_actions.org_id
        and m.access_role = 'manager_assignee'
        and m.scope_type = action_center_route_actions.route_scope_type
        and m.scope_value = action_center_route_actions.route_scope_value
        and m.can_view
    )
  );

drop policy if exists "managers_can_insert_action_center_route_actions" on public.action_center_route_actions;
create policy "managers_can_insert_action_center_route_actions"
  on public.action_center_route_actions for insert
  with check (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_workspace_members m
      where m.user_id = auth.uid()
        and m.org_id = action_center_route_actions.org_id
        and m.access_role = 'manager_assignee'
        and m.scope_type = action_center_route_actions.route_scope_type
        and m.scope_value = action_center_route_actions.route_scope_value
        and m.can_update
    )
  );

drop policy if exists "managers_can_update_action_center_route_actions" on public.action_center_route_actions;
create policy "managers_can_update_action_center_route_actions"
  on public.action_center_route_actions for update
  using (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_workspace_members m
      where m.user_id = auth.uid()
        and m.org_id = action_center_route_actions.org_id
        and m.access_role = 'manager_assignee'
        and m.scope_type = action_center_route_actions.route_scope_type
        and m.scope_value = action_center_route_actions.route_scope_value
        and m.can_update
    )
  )
  with check (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_workspace_members m
      where m.user_id = auth.uid()
        and m.org_id = action_center_route_actions.org_id
        and m.access_role = 'manager_assignee'
        and m.scope_type = action_center_route_actions.route_scope_type
        and m.scope_value = action_center_route_actions.route_scope_value
        and m.can_update
    )
  );

drop policy if exists "managers_can_select_action_center_action_reviews" on public.action_center_action_reviews;
create policy "managers_can_select_action_center_action_reviews"
  on public.action_center_action_reviews for select
  using (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_route_actions a
      join public.action_center_workspace_members m
        on m.org_id = a.org_id
       and m.scope_type = a.route_scope_type
       and m.scope_value = a.route_scope_value
      where a.id = action_center_action_reviews.action_id
        and m.user_id = auth.uid()
        and m.access_role = 'manager_assignee'
        and m.can_view
    )
  );

drop policy if exists "managers_can_insert_action_center_action_reviews" on public.action_center_action_reviews;
create policy "managers_can_insert_action_center_action_reviews"
  on public.action_center_action_reviews for insert
  with check (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_route_actions a
      join public.action_center_workspace_members m
        on m.org_id = a.org_id
       and m.scope_type = a.route_scope_type
       and m.scope_value = a.route_scope_value
      where a.id = action_center_action_reviews.action_id
        and m.user_id = auth.uid()
        and m.access_role = 'manager_assignee'
        and m.can_update
    )
  );

drop policy if exists "managers_can_update_action_center_action_reviews" on public.action_center_action_reviews;
create policy "managers_can_update_action_center_action_reviews"
  on public.action_center_action_reviews for update
  using (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_route_actions a
      join public.action_center_workspace_members m
        on m.org_id = a.org_id
       and m.scope_type = a.route_scope_type
       and m.scope_value = a.route_scope_value
      where a.id = action_center_action_reviews.action_id
        and m.user_id = auth.uid()
        and m.access_role = 'manager_assignee'
        and m.can_update
    )
  )
  with check (
    public.is_verisight_admin_user()
    or exists (
      select 1
      from public.action_center_route_actions a
      join public.action_center_workspace_members m
        on m.org_id = a.org_id
       and m.scope_type = a.route_scope_type
       and m.scope_value = a.route_scope_value
      where a.id = action_center_action_reviews.action_id
        and m.user_id = auth.uid()
        and m.access_role = 'manager_assignee'
        and m.can_update
    )
  );

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
        'manager_quick_action_offered',
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
  constraint action_center_adoption_events_review_scope_check
    check (
      ((object_anchor = 'review_moment') and review_item_id is not null)
      or ((object_anchor <> 'review_moment') and review_item_id is null)
    ),
  constraint action_center_adoption_events_actor_identity_check
    check (
      ((actor_role = 'system_channel') and actor_user_id is null)
      or ((actor_role <> 'system_channel') and actor_user_id is not null)
    ),
  constraint action_center_adoption_events_event_mapping_check
    check (
      (event_name = 'manager_trigger_delivered' and event_source = 'trigger_delivery_ledger' and object_anchor = 'follow_through_route' and actor_role = 'system_channel')
      or (event_name = 'manager_contextual_entry_opened' and event_source = 'contextual_entry' and object_anchor = 'follow_through_route' and actor_role = 'manager_participant')
      or (event_name = 'manager_quick_action_offered' and event_source = 'manager_quick_action' and object_anchor = 'review_moment' and actor_role = 'system_channel')
      or (event_name = 'manager_quick_action_completed' and event_source = 'manager_quick_action' and object_anchor = 'review_moment' and actor_role = 'manager_participant')
      or (event_name = 'review_completed' and event_source = 'review_transition' and object_anchor = 'review_moment' and actor_role in ('hr_rhythm_owner', 'manager_participant'))
      or (event_name = 'review_rescheduled' and event_source = 'review_reschedule' and object_anchor = 'review_moment' and actor_role = 'hr_rhythm_owner')
      or (event_name = 'route_became_stale' and event_source = 'route_state_derivation' and object_anchor = 'follow_through_route' and actor_role = 'system_channel')
      or (event_name = 'route_became_overdue' and event_source = 'route_state_derivation' and object_anchor = 'follow_through_route' and actor_role = 'system_channel')
      or (event_name = 'route_became_escalation_sensitive' and event_source = 'route_state_derivation' and object_anchor = 'follow_through_route' and actor_role = 'system_channel')
      or (event_name = 'route_closed' and event_source = 'route_closeout' and object_anchor = 'closeout_continuation_record' and actor_role = 'hr_rhythm_owner')
      or (event_name = 'route_reopened' and event_source = 'route_reopen' and object_anchor = 'closeout_continuation_record' and actor_role = 'hr_rhythm_owner')
      or (event_name = 'hr_manual_chase_logged' and event_source = 'hr_manual_chase' and object_anchor = 'follow_through_route' and actor_role = 'hr_rhythm_owner')
    ),
  constraint action_center_adoption_events_metadata_check
    check (jsonb_typeof(metadata) = 'object' and metadata = '{}'::jsonb),
  constraint action_center_adoption_events_measurement_window_key_text_check
    check (measurement_window_key is null or length(btrim(measurement_window_key)) > 0),
  constraint action_center_adoption_events_route_source_campaign_org_fk
    foreign key (route_source_id, org_id) references public.campaigns(id, organization_id) on delete cascade
);

alter table public.action_center_follow_through_mail_events
  drop constraint if exists action_center_follow_through_mail_events_scan_type_check;

alter table public.action_center_follow_through_mail_events
  add constraint action_center_follow_through_mail_events_scan_type_check
  check (scan_type in ('exit', 'retention'));

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

create table if not exists public.action_center_bounded_execution_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_id text not null,
  route_scope_value text not null,
  route_source_id uuid not null,
  route_family text not null
    check (route_family in ('exit', 'retention')),
  action_id uuid,
  object_anchor text not null
    check (object_anchor in ('follow_through_route', 'action_card')),
  event_type text not null
    check (
      event_type in (
        'route_opened',
        'route_became_execution_expected',
        'action_draft_created',
        'action_draft_validated',
        'action_draft_rejected',
        'action_draft_sent_to_hr_review',
        'action_state_changed',
        'action_review_opened',
        'action_review_completed',
        'hr_chase_event'
      )
    ),
  actor_role text not null
    check (actor_role in ('hr_rhythm_owner', 'manager_participant', 'system_channel')),
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint action_center_bounded_execution_events_route_id_text_check
    check (length(btrim(route_id)) > 0),
  constraint action_center_bounded_execution_events_route_scope_value_text_check
    check (length(btrim(route_scope_value)) > 0),
  constraint action_center_bounded_execution_events_route_identity_check
    check (route_id = ((route_source_id)::text || '::' || route_scope_value)),
  constraint action_center_bounded_execution_events_action_scope_check
    check (
      ((object_anchor = 'action_card') and action_id is not null)
      or ((object_anchor = 'follow_through_route') and action_id is null)
    ),
  constraint action_center_bounded_execution_events_actor_identity_check
    check (
      ((actor_role = 'system_channel') and actor_user_id is null)
      or ((actor_role <> 'system_channel') and actor_user_id is not null)
    ),
  constraint action_center_bounded_execution_events_event_mapping_check
    check (
      (event_type = 'route_opened' and object_anchor = 'follow_through_route' and actor_role in ('hr_rhythm_owner', 'system_channel'))
      or (event_type = 'route_became_execution_expected' and object_anchor = 'follow_through_route' and actor_role = 'system_channel')
      or (event_type = 'action_draft_created' and object_anchor = 'action_card' and actor_role in ('hr_rhythm_owner', 'manager_participant'))
      or (event_type = 'action_draft_validated' and object_anchor = 'action_card' and actor_role in ('hr_rhythm_owner', 'manager_participant'))
      or (event_type = 'action_draft_rejected' and object_anchor = 'action_card' and actor_role in ('hr_rhythm_owner', 'manager_participant'))
      or (event_type = 'action_draft_sent_to_hr_review' and object_anchor = 'action_card' and actor_role in ('hr_rhythm_owner', 'manager_participant'))
      or (event_type = 'action_state_changed' and object_anchor = 'action_card' and actor_role in ('hr_rhythm_owner', 'manager_participant', 'system_channel'))
      or (event_type = 'action_review_opened' and object_anchor = 'action_card' and actor_role in ('hr_rhythm_owner', 'manager_participant'))
      or (event_type = 'action_review_completed' and object_anchor = 'action_card' and actor_role in ('hr_rhythm_owner', 'manager_participant'))
      or (event_type = 'hr_chase_event' and object_anchor = 'follow_through_route' and actor_role = 'hr_rhythm_owner')
    ),
  constraint action_center_bounded_execution_events_metadata_check
    check (jsonb_typeof(metadata) = 'object' and metadata = '{}'::jsonb),
  constraint action_center_bounded_execution_events_route_source_campaign_org_fk
    foreign key (route_source_id, org_id) references public.campaigns(id, organization_id) on delete cascade
);

create index if not exists idx_action_center_bounded_execution_events_org
  on public.action_center_bounded_execution_events(org_id, occurred_at desc);

create index if not exists idx_action_center_bounded_execution_events_route
  on public.action_center_bounded_execution_events(route_id, event_type, occurred_at desc);

create index if not exists idx_action_center_bounded_execution_events_action
  on public.action_center_bounded_execution_events(action_id, occurred_at desc)
  where action_id is not null;

alter table public.action_center_bounded_execution_events enable row level security;

drop policy if exists "service_role_can_select_action_center_bounded_execution_events" on public.action_center_bounded_execution_events;
create policy "service_role_can_select_action_center_bounded_execution_events"
  on public.action_center_bounded_execution_events for select
  to service_role
  using (true);

drop policy if exists "service_role_can_insert_action_center_bounded_execution_events" on public.action_center_bounded_execution_events;
create policy "service_role_can_insert_action_center_bounded_execution_events"
  on public.action_center_bounded_execution_events for insert
  to service_role
  with check (true);

notify pgrst, 'reload schema';
