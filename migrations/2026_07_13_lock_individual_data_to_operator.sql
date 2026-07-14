-- 2026-07-13 — Security-audit H1/H2 (besluit a): individuele respondent-data alleen
-- voor de Loep-operator, nooit voor de klant (welke org-rol dan ook, incl. owner).
--
-- Achtergrond: de SELECT-policies op respondents/survey_responses gebruikten
-- is_org_member(), dat álle rollen insluit. Een ingelogde klant kon zo via de anon-key
-- + PostgREST (devtools) de ruwe individuele antwoorden + respondent-PII lezen, buiten
-- de n-drempels om. De aggregatie voor de klant loopt via campaign_stats (security_invoker)
-- + het backend-gegenereerde rapport. De Loep-operator houdt volledige toegang via de
-- service-role / rechtstreeks Supabase.
--
-- TOEPASVOLGORDE (belangrijk): pas dit toe NÁ het deployen van de frontend die
--   (a) open-antwoorden / campagne-beheer / resend-reminders via de service-role leest, en
--   (b) de add-respondents-insert server-side afhandelt (token/email niet meer in de browser).
-- Anders breken die operatorschermen. Er is nog geen betalende klant, dus een korte
-- window tussen deploy en deze migratie is acceptabel.

-- ── H1a: survey_responses → alleen de aggregatiekolommen die de campaign_stats-view
-- (security_invoker = true) nodig heeft blijven leesbaar; alle ruwe antwoorden, open tekst
-- en scoredetails gaan dicht. Volledige revoke kan NIET: campaign_stats draait met de
-- rechten van de aanroeper (klant) en joint survey_responses (risk_score/risk_band), dus
-- de klant heeft die kolommen nodig om de aggregaten te zien.
-- Ontoegankelijk worden o.a.: open_text_raw, open_text_analysis, sdt_raw/scores, org_raw/scores,
-- pull_factors_raw, uwes_raw, turnover_intention_raw, full_result, exit_reason_*, tenure_years.
-- RESIDU: per-respondent risk_score/risk_band blijft leesbaar (afgeleide risicoband, geen
-- naam/tekst/antwoorden). Volledig verbergen vereist campaign_stats herschrijven naar een
-- security-definer view met een multi-rol tenancy-predicate (klant/operator/service-role) —
-- aparte hardening, vereist live Supabase-verificatie. Zie audit-doc.
revoke select on public.survey_responses from anon, authenticated;
grant  select (id, respondent_id, risk_score, risk_band)
  on public.survey_responses to authenticated;

-- ── H1b: respondents → alleen niet-identificerende operationele kolommen blijven leesbaar
-- (department-tellingen + verzend/afrondstatus in het dashboard). Ontoegankelijk worden:
-- token (survey-toegangstoken), email (PII), role_level/exit_month (quasi-identifiers),
-- annual_salary_eur, token_expires_at, dedup_key_hash.
revoke select on public.respondents from anon, authenticated;
grant select (id, campaign_id, department, completed, completed_at, sent_at, opened_at)
  on public.respondents to authenticated;

-- ── H2: operator-API-sleutel niet langer opvraagbaar door gewone org-leden.
-- De guard gaat van is_org_member (alle rollen) naar is_verisight_admin_user (alleen Loep).
-- Server-side klant-paden (rapportdownload) vallen terug op de service-role
-- (frontend/lib/organization-secrets.ts), dus die blijven werken.
-- DROP eerst: de live-functie had een ander return-type (uuid), en Postgres staat
-- geen return-type-wijziging toe via create-or-replace (42P13). De grant wordt
-- door de drop weggegooid en hieronder opnieuw gezet.
drop function if exists public.get_org_api_key_for_current_user(uuid);
create or replace function public.get_org_api_key_for_current_user(target_org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_key uuid;
begin
  if not public.is_verisight_admin_user() then
    raise exception 'Alleen Loep-beheerders mogen de organisatiesleutel opvragen.';
  end if;

  select api_key
  into resolved_key
  from public.organization_secrets
  where org_id = target_org_id;

  if resolved_key is null then
    raise exception 'API-sleutel voor organisatie ontbreekt.';
  end if;

  return resolved_key;
end;
$$;

grant execute on function public.get_org_api_key_for_current_user(uuid) to authenticated;

-- ── L8: pin search_path op de SECURITY DEFINER-helpers (hardening tegen search_path-hijack).
-- Ze verwijzen al schema-gekwalificeerd, dus dit is defensief; voorkomt een footgun bij
-- toekomstige edits. Bodies ongewijzigd.
create or replace function public.is_org_member(org_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.org_members
    where org_members.org_id = $1 and org_members.user_id = auth.uid());
$$;

create or replace function public.is_org_manager(org_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.org_members
    where org_members.org_id = $1 and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'member'));
$$;

create or replace function public.is_org_owner(org_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.org_members
    where org_members.org_id = $1 and org_members.user_id = auth.uid()
      and org_members.role = 'owner');
$$;

create or replace function public.is_verisight_admin_user()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_verisight_admin = true);
$$;
