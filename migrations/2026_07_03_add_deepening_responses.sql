-- Migration: verdiepingsvragen-antwoorden op survey_responses
-- Datum: 2026-07-03
-- Uitvoeren in: Supabase Dashboard → SQL Editor
-- Additief en idempotent.

ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS deepening_responses jsonb;
