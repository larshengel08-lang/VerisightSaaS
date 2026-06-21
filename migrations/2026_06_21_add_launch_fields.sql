-- Migration: launch_date + launch_confirmed_at op campaign_delivery_records
-- Datum: 2026-06-21
-- Uitvoeren in: Supabase Dashboard -> SQL Editor
-- Additief en idempotent.

ALTER TABLE public.campaign_delivery_records
  ADD COLUMN IF NOT EXISTS launch_date date,
  ADD COLUMN IF NOT EXISTS launch_confirmed_at timestamptz;
