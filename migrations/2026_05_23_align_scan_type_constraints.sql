-- Migration: align scan_type constraints with the current route contract
-- Datum: 2026-05-23
-- Uitvoeren in: Supabase Dashboard -> SQL Editor

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_scan_type_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_scan_type_check
  CHECK (
    scan_type IN (
      'exit',
      'retention',
      'pulse',
      'team',
      'onboarding',
      'leadership',
      'culture_assessment'
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pilot_learning_dossiers'
  ) THEN
    ALTER TABLE public.pilot_learning_dossiers
      DROP CONSTRAINT IF EXISTS pilot_learning_dossiers_scan_type_check;

    ALTER TABLE public.pilot_learning_dossiers
      ADD CONSTRAINT pilot_learning_dossiers_scan_type_check
      CHECK (
        scan_type IS NULL OR scan_type IN (
          'exit',
          'retention',
          'pulse',
          'team',
          'onboarding',
          'leadership',
          'culture_assessment'
        )
      );
  END IF;
END $$;
