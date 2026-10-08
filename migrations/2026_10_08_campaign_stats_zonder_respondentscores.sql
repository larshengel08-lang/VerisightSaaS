-- Migration: risicoscore per respondent niet meer leesbaar voor de klant
-- Datum: 2026-10-08 (spec docs/superpowers/specs/2026-10-08-beveiliging-voor-eerste-klant.md, punt 1)
-- Uitvoeren in: Supabase Dashboard -> SQL Editor, als postgres. Additief en
-- idempotent: opnieuw draaien verandert niets. Volgorde ten opzichte van een
-- Railway- of Vercel-deploy maakt niet uit: geen code leest survey_responses
-- met de rechten van een klant, en de view houdt dezelfde kolommen.
--
-- Achtergrond: na de audit van 13-7 had authenticated nog een kolomrecht op
-- survey_responses (id, respondent_id, risk_score, risk_band), omdat de view
-- campaign_stats met de rechten van de aanroeper draait en die kolommen joint.
-- Elk lid van een organisatie kon daardoor via PostgREST per respondent de
-- risicoscore lezen, buiten elke drempel om. Besluit (a) van 13-7: de klant ziet
-- nooit individuele antwoorden.
--
-- Oplossing: de view blijft security_invoker, zodat welke metingen iemand ziet
-- en de respondenttellingen precies blijven wat de RLS op campaigns en
-- respondents nu bepaalt. Alleen de vier risicokolommen komen uit een security-
-- definer-functie die zelf de tenancy afdwingt en uitsluitend aggregaten per
-- meting teruggeeft. Daarna kan het kolomrecht op survey_responses weg.

-- 1. Aggregatie per meting achter een security-definer-functie.
-- Bevoegd: lid van de organisatie van de meting, de Loep-operator, of een
-- verbinding die geen klantrol is (service-role, directe databaseverbinding).
-- Een klantrol herkennen we aan zowel de JWT-rol als de databaserol
-- (current_setting('role') is de SET ROLE van PostgREST, ook binnen een
-- security-definer-functie). Allebei moeten zeggen "geen klant" voordat de
-- tenancycheck vervalt. Wie niet bevoegd is, krijgt dezelfde uitkomst als bij
-- een meting zonder antwoorden (leeg gemiddelde, nul per band): de functie
-- verraadt niets.
-- Een SQL-functie met security definer wordt door Postgres nooit ge-inlined,
-- dus de rechten van de eigenaar gelden altijd.
create or replace function public.campaign_risk_summary(target_campaign_id uuid)
returns table (
  avg_risk_score numeric,
  band_high      bigint,
  band_medium    bigint,
  band_low       bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    round(avg(sr.risk_score)::numeric, 2),
    count(sr.id) filter (where sr.risk_band = 'HOOG'),
    count(sr.id) filter (where sr.risk_band = 'MIDDEN'),
    count(sr.id) filter (where sr.risk_band = 'LAAG')
  from public.campaigns c
  join public.respondents      r  on r.campaign_id    = c.id
  join public.survey_responses sr on sr.respondent_id = r.id
  where c.id = target_campaign_id
    and (
      (
        coalesce(auth.role(), '') not in ('anon', 'authenticated')
        and coalesce(current_setting('role', true), '') not in ('anon', 'authenticated')
      )
      or public.is_verisight_admin_user()
      or public.is_org_member(c.organization_id)
    );
$$;

revoke all on function public.campaign_risk_summary(uuid) from public, anon;
grant execute on function public.campaign_risk_summary(uuid) to authenticated, service_role;

-- 2. campaign_stats: zelfde kolommen in dezelfde volgorde als in productie
-- (migrations/2026_06_17_add_closes_at.sql), zelfde rekenregels. De
-- respondenttellingen gebeuren eerst per meting in een subquery, zodat de
-- functie één keer per meting draait en niet één keer per respondent.
create or replace view public.campaign_stats with (security_invoker = true) as
select
  s.campaign_id,
  s.campaign_name,
  s.scan_type,
  s.organization_id,
  s.is_active,
  s.created_at,
  s.closed_at,
  s.closes_at,
  s.total_invited,
  s.total_completed,
  s.completion_rate_pct,
  rs.avg_risk_score,
  rs.band_high,
  rs.band_medium,
  rs.band_low
from (
  select
    c.id                                                as campaign_id,
    c.name                                              as campaign_name,
    c.scan_type,
    c.organization_id,
    c.is_active,
    c.created_at,
    c.closed_at,
    c.closes_at,
    count(r.id)                                         as total_invited,
    count(r.id) filter (where r.completed)              as total_completed,
    round(
      count(r.id) filter (where r.completed)::numeric
      / nullif(count(r.id), 0) * 100, 1
    )                                                   as completion_rate_pct
  from public.campaigns c
  left join public.respondents r on r.campaign_id = c.id
  group by
    c.id, c.name, c.scan_type, c.organization_id, c.is_active,
    c.created_at, c.closed_at, c.closes_at
) s
cross join lateral public.campaign_risk_summary(s.campaign_id) rs;

-- anon heeft hier niets te zoeken (geen enkele lezer in de code is anon).
revoke select on public.campaign_stats from anon;

-- 3. survey_responses: geen enkele kolom meer leesbaar voor anon of authenticated.
-- Een revoke op tabelniveau neemt ook de kolomrechten mee; de tweede regel maakt
-- dat expliciet. De operator leest via de service-role.
revoke select on public.survey_responses from anon, authenticated;
revoke select (id, respondent_id, risk_score, risk_band) on public.survey_responses from anon, authenticated;
