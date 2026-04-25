-- Migration: voeg teamscan toe aan pilot_learning_dossiers.route_interest
-- Datum: 2026-04-25
-- Uitvoeren in: Supabase Dashboard -> SQL Editor

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pilot_learning_dossiers'
  ) THEN
    ALTER TABLE public.pilot_learning_dossiers
      DROP CONSTRAINT IF EXISTS pilot_learning_dossiers_route_interest_check;

    ALTER TABLE public.pilot_learning_dossiers
      ADD CONSTRAINT pilot_learning_dossiers_route_interest_check
      CHECK (route_interest IN ('exitscan', 'retentiescan', 'teamscan', 'combinatie', 'nog-onzeker'));
  END IF;
END $$;
