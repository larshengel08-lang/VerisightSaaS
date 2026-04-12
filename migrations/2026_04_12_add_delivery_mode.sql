-- Migration: voeg delivery_mode toe aan campaigns
-- Datum: 2026-04-12
-- Uitvoeren in: Supabase Dashboard → SQL Editor
--
-- delivery_mode: "baseline" (standaard) of "live"
-- Bestaande campaigns krijgen NULL → backend behandelt NULL als "baseline"

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS delivery_mode TEXT
  CHECK (delivery_mode IN ('baseline', 'live'));

-- Optioneel: backfill bestaande campagnes naar 'baseline'
-- UPDATE campaigns SET delivery_mode = 'baseline' WHERE delivery_mode IS NULL;
