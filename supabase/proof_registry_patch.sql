create table if not exists public.case_proof_registry (
  id uuid primary key default gen_random_uuid(),
  org_id uuid null references public.organizations(id) on delete set null,
  campaign_id uuid null references public.campaigns(id) on delete set null,
  route text not null,
  proof_state text not null check (proof_state in ('lesson_only','internal_proof_only','sales_usable','public_usable')),
  approval_state text not null check (approval_state in ('draft','internal_review','claim_check','customer_permission','approved','rejected')),
  summary text not null,
  claimable_observation text null,
  supporting_artifacts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
