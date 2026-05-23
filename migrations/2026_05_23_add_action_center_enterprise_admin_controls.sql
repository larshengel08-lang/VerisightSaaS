create table if not exists public.action_center_route_activation_approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_family text not null check (route_family in ('exit', 'retention')),
  scope_value text not null,
  requested_by uuid not null references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approval_status text not null check (approval_status in ('requested', 'approved', 'rejected', 'revoked')),
  rationale text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, route_family, scope_value)
);

create table if not exists public.action_center_support_access_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_id text,
  scope_value text,
  accessed_by uuid not null references auth.users(id) on delete set null,
  access_reason text not null,
  access_kind text not null check (access_kind in ('support', 'privacy', 'governance', 'incident')),
  created_at timestamptz not null default now()
);

create table if not exists public.action_center_audit_export_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete set null,
  export_scope text not null check (export_scope in ('bounded_summary')),
  request_status text not null default 'generated' check (request_status in ('generated')),
  created_at timestamptz not null default now()
);

create index if not exists idx_action_center_route_activation_approvals_org
  on public.action_center_route_activation_approvals(org_id, route_family, approval_status);
create index if not exists idx_action_center_support_access_events_org
  on public.action_center_support_access_events(org_id, access_kind, created_at desc);
create index if not exists idx_action_center_audit_export_requests_org
  on public.action_center_audit_export_requests(org_id, created_at desc);

create or replace function public.set_action_center_enterprise_admin_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists action_center_route_activation_approvals_set_updated_at on public.action_center_route_activation_approvals;
create trigger action_center_route_activation_approvals_set_updated_at
before update on public.action_center_route_activation_approvals
for each row execute function public.set_action_center_enterprise_admin_updated_at();

alter table public.action_center_route_activation_approvals enable row level security;
alter table public.action_center_support_access_events enable row level security;
alter table public.action_center_audit_export_requests enable row level security;

drop policy if exists "ac_route_activation_admins_select" on public.action_center_route_activation_approvals;
drop policy if exists "ac_route_activation_admins_insert" on public.action_center_route_activation_approvals;
drop policy if exists "ac_route_activation_admins_update" on public.action_center_route_activation_approvals;
drop policy if exists "ac_support_access_admins_select" on public.action_center_support_access_events;
drop policy if exists "ac_support_access_admins_insert" on public.action_center_support_access_events;
drop policy if exists "ac_audit_export_admins_select" on public.action_center_audit_export_requests;
drop policy if exists "ac_audit_export_admins_insert" on public.action_center_audit_export_requests;

create policy "ac_route_activation_admins_select"
  on public.action_center_route_activation_approvals for select
  using (public.is_org_owner(org_id) or public.is_verisight_admin_user());

create policy "ac_route_activation_admins_insert"
  on public.action_center_route_activation_approvals for insert
  with check (public.is_org_owner(org_id) or public.is_verisight_admin_user());

create policy "ac_route_activation_admins_update"
  on public.action_center_route_activation_approvals for update
  using (public.is_org_owner(org_id) or public.is_verisight_admin_user())
  with check (public.is_org_owner(org_id) or public.is_verisight_admin_user());

create policy "ac_support_access_admins_select"
  on public.action_center_support_access_events for select
  using (public.is_org_owner(org_id) or public.is_verisight_admin_user());

create policy "ac_support_access_admins_insert"
  on public.action_center_support_access_events for insert
  with check (public.is_org_owner(org_id) or public.is_verisight_admin_user());

create policy "ac_audit_export_admins_select"
  on public.action_center_audit_export_requests for select
  using (public.is_org_owner(org_id) or public.is_verisight_admin_user());

create policy "ac_audit_export_admins_insert"
  on public.action_center_audit_export_requests for insert
  with check (public.is_org_owner(org_id) or public.is_verisight_admin_user());
