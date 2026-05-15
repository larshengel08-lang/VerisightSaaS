create table if not exists public.action_center_review_rhythm_configs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  route_id text not null,
  route_scope_value text not null,
  route_source_type text not null
    default 'campaign'
    check (route_source_type in ('campaign')),
  route_source_id uuid references public.campaigns(id) on delete cascade not null,
  scan_type text not null
    check (scan_type in ('exit')),
  cadence_days smallint not null
    check (cadence_days in (7, 14, 30)),
  reminder_lead_days smallint not null
    check (reminder_lead_days in (1, 3, 5)),
  escalation_lead_days smallint not null
    check (escalation_lead_days in (3, 7, 14)),
  reminders_enabled boolean not null default true,
  constraint action_center_review_rhythm_configs_reminder_window_check
    check ((not reminders_enabled) or (reminder_lead_days < cadence_days)),
  constraint action_center_review_rhythm_configs_escalation_window_check
    check (escalation_lead_days > reminder_lead_days),
  updated_by uuid references auth.users(id) on delete set null,
  updated_by_role text not null
    check (updated_by_role in ('verisight_admin', 'hr_owner', 'hr_member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (route_id)
);

create index if not exists idx_action_center_review_rhythm_configs_org
  on public.action_center_review_rhythm_configs(org_id);

create index if not exists idx_action_center_review_rhythm_configs_route_source
  on public.action_center_review_rhythm_configs(route_source_type, route_source_id);

create or replace function public.set_action_center_review_rhythm_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists action_center_review_rhythm_configs_set_updated_at on public.action_center_review_rhythm_configs;
create trigger action_center_review_rhythm_configs_set_updated_at
before update on public.action_center_review_rhythm_configs
for each row execute function public.set_action_center_review_rhythm_updated_at();

alter table public.action_center_review_rhythm_configs enable row level security;

drop policy if exists "hr_and_admins_can_select_action_center_review_rhythm_configs" on public.action_center_review_rhythm_configs;
create policy "hr_and_admins_can_select_action_center_review_rhythm_configs"
  on public.action_center_review_rhythm_configs for select
  using (
    public.is_verisight_admin_user()
    or public.is_org_owner(org_id)
    or exists (
      select 1
      from public.action_center_workspace_members m
      where m.user_id = auth.uid()
        and m.org_id = action_center_review_rhythm_configs.org_id
        and m.access_role in ('hr_owner', 'hr_member')
        and (m.scope_type = 'org' or m.scope_value = action_center_review_rhythm_configs.route_scope_value)
        and m.can_view
    )
  );

drop policy if exists "hr_and_admins_can_upsert_action_center_review_rhythm_configs" on public.action_center_review_rhythm_configs;
create policy "hr_and_admins_can_upsert_action_center_review_rhythm_configs"
  on public.action_center_review_rhythm_configs for all
  using (
    public.is_verisight_admin_user()
    or public.is_org_owner(org_id)
    or exists (
      select 1
      from public.action_center_workspace_members m
      where m.user_id = auth.uid()
        and m.org_id = action_center_review_rhythm_configs.org_id
        and m.access_role in ('hr_owner', 'hr_member')
        and (m.scope_type = 'org' or m.scope_value = action_center_review_rhythm_configs.route_scope_value)
        and m.can_update
    )
  )
  with check (
    public.is_verisight_admin_user()
    or public.is_org_owner(org_id)
    or exists (
      select 1
      from public.action_center_workspace_members m
      where m.user_id = auth.uid()
        and m.org_id = action_center_review_rhythm_configs.org_id
        and m.access_role in ('hr_owner', 'hr_member')
        and (m.scope_type = 'org' or m.scope_value = action_center_review_rhythm_configs.route_scope_value)
        and m.can_update
    )
  );

notify pgrst, 'reload schema';
