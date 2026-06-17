-- Migration: voeg closes_at toe aan campaigns + update campaign_stats view
-- Datum: 2026-06-17
-- Uitgevoerd in: Supabase Dashboard → SQL Editor
-- Additief en idempotent.

-- 1. Verwijder bestaande view (volgorde verandert)
DROP VIEW IF EXISTS public.campaign_stats;

-- 2. Voeg geplande sluitdatum toe aan campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS closes_at date;

-- 3. Maak view opnieuw aan met closed_at + closes_at
CREATE VIEW public.campaign_stats WITH (security_invoker = true) AS
SELECT
  c.id                                                AS campaign_id,
  c.name                                              AS campaign_name,
  c.scan_type,
  c.organization_id,
  c.is_active,
  c.created_at,
  c.closed_at,
  c.closes_at,
  count(r.id)                                         AS total_invited,
  count(r.id) FILTER (WHERE r.completed)              AS total_completed,
  round(
    count(r.id) FILTER (WHERE r.completed)::numeric
    / nullif(count(r.id), 0) * 100, 1
  )                                                   AS completion_rate_pct,
  round(avg(sr.risk_score)::numeric, 2)               AS avg_risk_score,
  count(sr.id) FILTER (WHERE sr.risk_band = 'HOOG')   AS band_high,
  count(sr.id) FILTER (WHERE sr.risk_band = 'MIDDEN') AS band_medium,
  count(sr.id) FILTER (WHERE sr.risk_band = 'LAAG')   AS band_low
FROM public.campaigns c
LEFT JOIN public.respondents      r  ON r.campaign_id   = c.id
LEFT JOIN public.survey_responses sr ON sr.respondent_id = r.id
GROUP BY
  c.id, c.name, c.scan_type, c.organization_id, c.is_active,
  c.created_at, c.closed_at, c.closes_at;
