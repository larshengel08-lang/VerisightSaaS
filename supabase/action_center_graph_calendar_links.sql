create table if not exists public.action_center_graph_calendar_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_id text not null,
  review_item_id text not null,
  route_scope_value text not null,
  route_source_id uuid not null,
  provider text not null check (provider in ('microsoft_graph')),
  event_id text not null,
  organizer_email text not null,
  organizer_user_id text,
  consent_state text not null check (consent_state in ('granted', 'missing', 'revoked')),
  sync_state text not null check (sync_state in ('linked', 'cancelled', 'fallback', 'failed')),
  last_synced_revision integer not null check (last_synced_revision >= 0),
  i_cal_uid text,
  last_sync_error text,
  constraint action_center_graph_calendar_links_route_id_text_check
    check (length(btrim(route_id)) > 0),
  constraint action_center_graph_calendar_links_review_item_id_text_check
    check (length(btrim(review_item_id)) > 0),
  constraint action_center_graph_calendar_links_route_scope_value_text_check
    check (length(btrim(route_scope_value)) > 0),
  constraint action_center_graph_calendar_links_event_id_text_check
    check (length(btrim(event_id)) > 0),
  constraint action_center_graph_calendar_links_organizer_email_text_check
    check (length(btrim(organizer_email)) > 0),
  constraint action_center_graph_calendar_links_route_identity_check
    check (route_id = ((route_source_id)::text || '::' || route_scope_value)),
  constraint action_center_graph_calendar_links_route_source_campaign_org_fk
    foreign key (route_source_id, org_id) references public.campaigns(id, organization_id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_action_center_graph_calendar_links_route_provider
  on public.action_center_graph_calendar_links(route_id, provider);

create unique index if not exists idx_action_center_graph_calendar_links_event_provider
  on public.action_center_graph_calendar_links(event_id, provider);

alter table public.action_center_graph_calendar_links enable row level security;

drop policy if exists "service_role_can_select_action_center_graph_calendar_links" on public.action_center_graph_calendar_links;
create policy "service_role_can_select_action_center_graph_calendar_links"
  on public.action_center_graph_calendar_links for select
  to service_role
  using (true);

drop policy if exists "service_role_can_insert_action_center_graph_calendar_links" on public.action_center_graph_calendar_links;
create policy "service_role_can_insert_action_center_graph_calendar_links"
  on public.action_center_graph_calendar_links for insert
  to service_role
  with check (true);

drop policy if exists "service_role_can_update_action_center_graph_calendar_links" on public.action_center_graph_calendar_links;
create policy "service_role_can_update_action_center_graph_calendar_links"
  on public.action_center_graph_calendar_links for update
  to service_role
  using (true)
  with check (true);

notify pgrst, 'reload schema';
