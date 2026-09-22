-- Migration: campaign_decisions + campaigns.previous_campaign_id
-- Hoort bij: plan 3b (docs/superpowers/plans/2026-09-19-rapport-3b-werkvragen-en-besluit.md),
-- spec docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md par. 7 en 11.
-- Uitvoeren in: Supabase Dashboard -> SQL Editor, VOOR de Railway-redeploy van plan 3b.
-- Additief en idempotent: opnieuw draaien verandert niets.
--
-- campaign_decisions: het besluit dat het MT na het gesprek vastlegt. Een rij
-- per meting. Bevat alleen wat het MT zelf invult; geen koppeling met
-- survey_responses of respondents.
-- previous_campaign_id: koppeling naar de vorige meting. Blijft ongebruikt tot
-- plan 3c (vervolgmeting); staat hier zodat er maar een keer SQL gedraaid hoeft
-- te worden. De backend leest deze kolom nog niet.

create table if not exists public.campaign_decisions (
  campaign_id       uuid primary key references public.campaigns(id) on delete cascade,
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  decided_at        date,
  primary_topic     text not null default '',
  primary_action    text not null default '',
  owner             text not null default '',
  follow_up_date    date,
  secondary_topic   text not null default '',
  secondary_action  text not null default '',
  feedback_plan     text not null default '',
  success_criterion text not null default '',
  recorded_by       uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists campaign_decisions_org_idx
  on public.campaign_decisions (organization_id);

-- De policies hieronder kijken naar organization_id op de besluitrij. Deze
-- trigger dwingt af dat die gelijk is aan de organisatie van de meting, zodat
-- niemand een besluit aan de meting van een andere organisatie kan hangen.
create or replace function public.campaign_decisions_org_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  campaign_org uuid;
begin
  select c.organization_id into campaign_org from public.campaigns c where c.id = new.campaign_id;
  if campaign_org is null or campaign_org <> new.organization_id then
    raise exception 'campaign_decisions: organisatie van het besluit wijkt af van die van de meting';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists campaign_decisions_org_guard_trg on public.campaign_decisions;
create trigger campaign_decisions_org_guard_trg
  before insert or update on public.campaign_decisions
  for each row execute function public.campaign_decisions_org_guard();

alter table public.campaign_decisions enable row level security;

-- Leden van de organisatie lezen; alleen de eigenaar en de Loep-operator
-- schrijven. is_org_owner en niet de ruimere manager-check: die omvat ook de
-- rol 'member' (meelezer). Service-role (de backend) omzeilt RLS.
drop policy if exists "org_members_can_select_decisions" on public.campaign_decisions;
create policy "org_members_can_select_decisions"
  on public.campaign_decisions for select
  using (public.is_org_member(organization_id) or public.is_verisight_admin_user());

drop policy if exists "org_owners_can_insert_decisions" on public.campaign_decisions;
create policy "org_owners_can_insert_decisions"
  on public.campaign_decisions for insert
  with check (public.is_org_owner(organization_id) or public.is_verisight_admin_user());

drop policy if exists "org_owners_can_update_decisions" on public.campaign_decisions;
create policy "org_owners_can_update_decisions"
  on public.campaign_decisions for update
  using (public.is_org_owner(organization_id) or public.is_verisight_admin_user())
  with check (public.is_org_owner(organization_id) or public.is_verisight_admin_user());

-- Een besluit wordt bijgewerkt, niet gewist: er is bewust geen delete-policy,
-- en het recht zelf is ingetrokken.
revoke delete on public.campaign_decisions from authenticated;
revoke all on public.campaign_decisions from anon;

-- Koppeling naar de vorige meting (plan 3c). Nullable, geen default, geen index
-- nodig op dit volume.
alter table public.campaigns
  add column if not exists previous_campaign_id uuid
  references public.campaigns(id) on delete set null;
