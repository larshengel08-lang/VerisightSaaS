-- Migration: richtingantwoord per respondent op survey_responses
-- Spec: docs/superpowers/specs/2026-09-07-richtingsvraag-altijd-design.md par. 4.1
-- Uitvoeren in: Supabase Dashboard → SQL Editor, VÓÓR de Railway-redeploy.
-- Additief en idempotent.

ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS direction_response jsonb;
