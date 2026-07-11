-- Afdelingssegmentatie: JSON-lijst [{label, slug}] per campagne.
-- NULL/leeg = campagne zonder segmenten (bestaand gedrag ongewijzigd).
-- Idempotent: veilig om meermaals te draaien.
alter table campaigns
  add column if not exists segment_departments jsonb;
