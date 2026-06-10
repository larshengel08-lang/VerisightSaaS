-- Migration: voeg public_survey_token toe aan campaigns
-- Datum: 2026-06-09
-- Uitvoeren in: Supabase Dashboard → SQL Editor
--
-- public_survey_token: niet-raadbare UUID per campagne voor de open survey flow.
-- Respondenten openen /survey/open/{public_survey_token} zonder in te loggen.
-- De interne campaign.id wordt nooit publiek blootgesteld.
--
-- Bestaande campagnes krijgen automatisch een token via DEFAULT gen_random_uuid().
-- Geen backfill nodig.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS public_survey_token uuid
    NOT NULL
    DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_public_survey_token
  ON public.campaigns (public_survey_token);
