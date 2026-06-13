-- Migration: self-send deelnemer- en e-mailbeheer (subsysteem 2)
-- Datum: 2026-06-13
-- Uitvoeren in: Supabase Dashboard -> SQL Editor
-- Additief en idempotent. Bestaande campagnes blijven 'managed'.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS comms_mode text NOT NULL DEFAULT 'managed';

ALTER TABLE public.campaign_delivery_records
  ADD COLUMN IF NOT EXISTS invited_count integer,
  ADD COLUMN IF NOT EXISTS self_send_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS self_send_reminders jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.respondents
  ADD COLUMN IF NOT EXISTS dedup_key_hash text;

CREATE INDEX IF NOT EXISTS idx_respondents_dedup
  ON public.respondents (campaign_id, dedup_key_hash);
