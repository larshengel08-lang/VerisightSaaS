create table if not exists public.suite_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  org_id uuid null references public.organizations(id) on delete set null,
  campaign_id uuid null references public.campaigns(id) on delete set null,
  actor_id uuid null references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
