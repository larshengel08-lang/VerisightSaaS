create table if not exists public.billing_registry (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  legal_customer_name text not null,
  contract_state text not null check (contract_state in ('draft','pending_signature','signed')),
  billing_state text not null check (billing_state in ('draft','active_manual','paused','closed')),
  payment_method_confirmed boolean not null default false,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id)
);
