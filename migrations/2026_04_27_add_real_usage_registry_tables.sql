-- Real usage registry tables for assisted billing, telemetry, and proof.
-- Keeps the RU wave DB-backed in the linked Supabase environment while
-- preserving bounded shapes that match the current app layer.

create table if not exists public.billing_registry (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique references public.organizations(id) on delete cascade,
  legal_customer_name text not null,
  contract_state text not null default 'draft'
    check (contract_state in ('draft', 'pending_signature', 'signed')),
  billing_state text not null default 'draft'
    check (billing_state in ('draft', 'active_manual', 'paused', 'closed')),
  payment_method_confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_registry_billing_state_idx
  on public.billing_registry (billing_state);

create index if not exists billing_registry_updated_at_idx
  on public.billing_registry (updated_at desc);

create or replace function public.set_billing_registry_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists billing_registry_set_updated_at on public.billing_registry;
create trigger billing_registry_set_updated_at
before update on public.billing_registry
for each row execute function public.set_billing_registry_updated_at();

create table if not exists public.suite_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null
    check (
      event_type in (
        'owner_access_confirmed',
        'first_value_confirmed',
        'first_management_use_confirmed',
        'manager_denied_insights',
        'action_center_review_scheduled',
        'action_center_closeout_recorded'
      )
    ),
  org_id uuid references public.organizations(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists suite_telemetry_events_org_idx
  on public.suite_telemetry_events (org_id, created_at desc);

create index if not exists suite_telemetry_events_campaign_idx
  on public.suite_telemetry_events (campaign_id, created_at desc);

create index if not exists suite_telemetry_events_type_idx
  on public.suite_telemetry_events (event_type, created_at desc);

create table if not exists public.case_proof_registry (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  route text not null,
  proof_state text not null default 'lesson_only'
    check (proof_state in ('lesson_only', 'internal_proof_only', 'sales_usable', 'public_usable', 'rejected')),
  approval_state text not null default 'draft'
    check (approval_state in ('draft', 'internal_review', 'claim_check', 'customer_permission', 'approved', 'rejected')),
  summary text not null,
  claimable_observation text,
  supporting_artifacts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists case_proof_registry_org_idx
  on public.case_proof_registry (org_id, created_at desc);

create index if not exists case_proof_registry_campaign_idx
  on public.case_proof_registry (campaign_id, created_at desc);

create index if not exists case_proof_registry_state_idx
  on public.case_proof_registry (proof_state, approval_state, created_at desc);

alter table public.billing_registry enable row level security;
alter table public.suite_telemetry_events enable row level security;
alter table public.case_proof_registry enable row level security;

drop policy if exists "billing_registry_org_owner_or_admin_select" on public.billing_registry;
drop policy if exists "billing_registry_org_owner_or_admin_insert" on public.billing_registry;
drop policy if exists "billing_registry_org_owner_or_admin_update" on public.billing_registry;
drop policy if exists "billing_registry_org_owner_or_admin_delete" on public.billing_registry;

create policy "billing_registry_org_owner_or_admin_select"
  on public.billing_registry for select
  using (public.is_verisight_admin_user() or public.is_org_owner(org_id));

create policy "billing_registry_org_owner_or_admin_insert"
  on public.billing_registry for insert
  with check (public.is_verisight_admin_user() or public.is_org_owner(org_id));

create policy "billing_registry_org_owner_or_admin_update"
  on public.billing_registry for update
  using (public.is_verisight_admin_user() or public.is_org_owner(org_id))
  with check (public.is_verisight_admin_user() or public.is_org_owner(org_id));

create policy "billing_registry_org_owner_or_admin_delete"
  on public.billing_registry for delete
  using (public.is_verisight_admin_user() or public.is_org_owner(org_id));

drop policy if exists "suite_telemetry_org_owner_or_admin_select" on public.suite_telemetry_events;
drop policy if exists "suite_telemetry_org_owner_or_admin_insert" on public.suite_telemetry_events;
drop policy if exists "suite_telemetry_admin_delete" on public.suite_telemetry_events;

create policy "suite_telemetry_org_owner_or_admin_select"
  on public.suite_telemetry_events for select
  using (public.is_verisight_admin_user() or (org_id is not null and public.is_org_owner(org_id)));

create policy "suite_telemetry_org_owner_or_admin_insert"
  on public.suite_telemetry_events for insert
  with check (public.is_verisight_admin_user() or (org_id is not null and public.is_org_owner(org_id)));

create policy "suite_telemetry_admin_delete"
  on public.suite_telemetry_events for delete
  using (public.is_verisight_admin_user());

drop policy if exists "case_proof_org_owner_or_admin_select" on public.case_proof_registry;
drop policy if exists "case_proof_org_owner_or_admin_insert" on public.case_proof_registry;
drop policy if exists "case_proof_org_owner_or_admin_update" on public.case_proof_registry;
drop policy if exists "case_proof_admin_delete" on public.case_proof_registry;

create policy "case_proof_org_owner_or_admin_select"
  on public.case_proof_registry for select
  using (public.is_verisight_admin_user() or (org_id is not null and public.is_org_owner(org_id)));

create policy "case_proof_org_owner_or_admin_insert"
  on public.case_proof_registry for insert
  with check (public.is_verisight_admin_user() or (org_id is not null and public.is_org_owner(org_id)));

create policy "case_proof_org_owner_or_admin_update"
  on public.case_proof_registry for update
  using (public.is_verisight_admin_user() or (org_id is not null and public.is_org_owner(org_id)))
  with check (public.is_verisight_admin_user() or (org_id is not null and public.is_org_owner(org_id)));

create policy "case_proof_admin_delete"
  on public.case_proof_registry for delete
  using (public.is_verisight_admin_user());
