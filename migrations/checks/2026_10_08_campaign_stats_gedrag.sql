-- ALLEEN LOKAAL, NOOIT TEGEN PRODUCTIE.
-- Gedragscontrole voor migratie 2026_10_08_campaign_stats_zonder_respondentscores.sql
-- in een wegwerp-Postgres met het echte schema. Dit script draait schema, oude
-- migraties en seeddata, maakt een hulpschema loep_controle en een proefrol
-- loep_proef_klantrol aan, en hoort nooit in Supabase Dashboard of op een
-- gedeelde database.
--
-- Draaien (Git Bash, vanuit de repo-root; MSYS_NO_PATHCONV voorkomt dat Git Bash
-- /repo omzet naar een Windows-pad):
--   export MSYS_NO_PATHCONV=1
--   docker run -d --rm --name loep-stats-check -e POSTGRES_PASSWORD=wegwerp \
--     -v "$(pwd -W):/repo:ro" public.ecr.aws/supabase/postgres:15.8.1.085
--   # wachten: eerst tot de init van het image klaar is (het herstart daarna),
--   # dan tot de herstarte server verbindingen aanneemt
--   until docker logs loep-stats-check 2>&1 | grep -q "init process complete"; do sleep 1; done
--   until docker exec loep-stats-check pg_isready -U postgres -h localhost; do sleep 1; done
--   # schema.sql laadt pas in twee rondes (regel 216 wijzigt survey_responses
--   # voordat die bestaat). De fouten van de eerste ronde zijn verwacht en
--   # worden weggegooid; de tweede ronde moet foutloos zijn. Laden als
--   # postgres, zodat tabellen en view net als in productie van postgres zijn.
--   docker exec loep-stats-check psql -U postgres -h localhost -d postgres -q -f /repo/supabase/schema.sql >/dev/null 2>&1
--   docker exec -e PGOPTIONS='-c client_min_messages=warning' loep-stats-check \
--     psql -U postgres -h localhost -d postgres -q -v ON_ERROR_STOP=1 -f /repo/supabase/schema.sql
--   docker exec loep-stats-check psql -U supabase_admin -h localhost -d postgres -v ON_ERROR_STOP=1 \
--     -f /repo/migrations/checks/2026_10_08_campaign_stats_gedrag.sql
--   docker stop loep-stats-check
-- Slaagt alles, dan eindigt de uitvoer met "ALLE GEVALLEN ZOALS VERWACHT";
-- anders stopt het script met een fout die het afwijkende geval noemt.
-- Opnieuw draaien vraagt een nieuwe container. Het script weigert te starten
-- zodra er al gebruikers of organisaties zijn: een tweede keer draaien zou de
-- oude productietoestand terugzetten (het lek weer open) en nepdata seeden.
--
-- Over het image: postgres is daar geen superuser maar heeft wel BYPASSRLS,
-- net als op gehoste Supabase; de functie campaign_risk_summary is van
-- postgres en leest survey_responses dus zonder RLS. auth.uid() en auth.role()
-- lezen in dit image alleen de oude losse claims (request.jwt.claim.sub en
-- request.jwt.claim.role); gehoste Supabase leest ook request.jwt.claims. Het
-- script zet daarom altijd beide vormen, zodat de uitkomst niet van die versie
-- afhangt.
--
-- Een identiteit aannemen gaat zoals PostgREST het doet: claims zetten in de
-- transactie en daarna SET LOCAL ROLE naar de rol uit de JWT. Een directe
-- databaseverbinding (SQL Editor zonder SET ROLE, de opschoning) is hier een
-- nieuwe sessie als postgres zonder SET ROLE en zonder claims; dan geeft
-- current_setting('role') de waarde 'none'.
--
-- Vaste uuid's:
--   gebruikers   11111111-0000-0000-0000-000000000001  lidA_owner (owner van A)
--                11111111-0000-0000-0000-000000000002  lidA_member (member van A)
--                11111111-0000-0000-0000-000000000003  lidB_owner (owner van B)
--                11111111-0000-0000-0000-000000000004  operator (is_verisight_admin, geen lid)
--                11111111-0000-0000-0000-000000000005  buitenstaander (geen lidmaatschap)
--   organisaties 22222222-0000-0000-0000-00000000000a  A
--                22222222-0000-0000-0000-00000000000b  B
--   metingen     33333333-0000-0000-0000-0000000000a1  A1 (retention, 6 respondenten, 5 ingevuld)
--                33333333-0000-0000-0000-0000000000a2  A2 (exit, geen respondenten)
--                33333333-0000-0000-0000-0000000000b1  B1 (exit, 3 respondenten, 3 ingevuld)

\set ON_ERROR_STOP 1
\set ECHO errors
\pset tuples_only on
\pset format unaligned

-- Bewaker: alleen in een verse wegwerpcontainer. Na de twee schemarondes zijn
-- auth.users en public.organizations leeg; staat daar iets, dan is dit een
-- gebruikte of echte database en verandert het script niets.
do $$
begin
  if exists (select 1 from auth.users) or exists (select 1 from public.organizations) then
    raise exception 'GESTOPT: deze database bevat al gebruikers of organisaties. Dit script draait alleen in een verse wegwerpcontainer (zie de kop); start een nieuwe container.';
  end if;
end $$;

-- 0. Hulpmiddelen, alleen voor dit script.
create schema if not exists loep_controle;
grant usage on schema loep_controle to public;

-- Stopt het script als de bewering niet waar is (ook als hij leeg is). De
-- melding beschrijft wat verwacht werd.
create or replace function loep_controle.controleer(ok boolean, melding text)
returns text language plpgsql as $$
begin
  if ok is not true then
    raise exception 'AFWIJKING, verwacht: %', melding;
  end if;
  return 'ok: ' || melding;
end $$;

-- Idem voor een voor/na-vergelijking; bij een verschil staan beide snapshots
-- in de foutmelding.
create or replace function loep_controle.controleer_gelijk(voor text, na text, melding text)
returns text language plpgsql as $$
begin
  if voor is distinct from na then
    raise exception 'AFWIJKING, verwacht: %', melding
      using detail = 'voor: ' || coalesce(voor, '(leeg)') || E'\nna:   ' || coalesce(na, '(leeg)');
  end if;
  return 'ok: ' || melding;
end $$;

-- Zet de claims zoals PostgREST ze zet, in beide vormen, alleen voor deze
-- transactie. Een lege sub laat de sub weg. Geeft een vaste tekst terug, zodat
-- \gset nooit een lege waarde krijgt.
create or replace function loep_controle.zet_claims(sub text, rol text)
returns text language sql as $$
  select set_config('request.jwt.claim.sub', coalesce(sub, ''), true),
         set_config('request.jwt.claim.role', coalesce(rol, ''), true),
         set_config('request.jwt.claims',
                    jsonb_strip_nulls(jsonb_build_object('sub', sub, 'role', rol))::text, true);
  select 'claims gezet'::text;
$$;
grant execute on all functions in schema loep_controle to public;

-- 1. Productietoestand van vandaag: de oude view (2026_06_17) en het kolomrecht
-- van 13-7. schema.sql bevat al de nieuwe toestand, dus de functie gaat weg
-- (productie heeft hem nog niet) nadat 2026_06_17 de view heeft verwijderd.
set role postgres;
\i /repo/migrations/2026_06_17_add_closes_at.sql
drop function if exists public.campaign_risk_summary(uuid);
\i /repo/migrations/2026_07_13_lock_individual_data_to_operator.sql
reset role;

select loep_controle.controleer(
  to_regprocedure('public.campaign_risk_summary(uuid)') is null
  and has_column_privilege('authenticated', 'public.survey_responses', 'risk_band', 'select')
  and has_column_privilege('authenticated', 'public.survey_responses', 'risk_score', 'select')
  and not has_column_privilege('authenticated', 'public.survey_responses', 'open_text_raw', 'select')
  and has_table_privilege('anon', 'public.campaign_stats', 'select'),
  'VOORAF: productietoestand nagebootst (geen functie, kolomrecht op risk_band/risk_score, anon mag de view lezen)');

-- 2. Seed (als supabase_admin).
insert into auth.users (id, aud, role, email) values
  ('11111111-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'lida-owner@proef.test'),
  ('11111111-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'lida-member@proef.test'),
  ('11111111-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'lidb-owner@proef.test'),
  ('11111111-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'operator@proef.test'),
  ('11111111-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'buitenstaander@proef.test');

-- De trigger on_user_created maakt de profielen al aan; hier alleen de
-- operatorvlag zetten.
insert into public.profiles (id, is_verisight_admin) values
  ('11111111-0000-0000-0000-000000000001', false),
  ('11111111-0000-0000-0000-000000000002', false),
  ('11111111-0000-0000-0000-000000000003', false),
  ('11111111-0000-0000-0000-000000000004', true),
  ('11111111-0000-0000-0000-000000000005', false)
on conflict (id) do update set is_verisight_admin = excluded.is_verisight_admin;

-- De trigger handle_new_org maakt auth.uid() owner van een nieuwe organisatie
-- (zonder null-check). Daarom wordt elke organisatie ingevoegd met de claims
-- van haar eigen owner: zo ontstaat precies het bedoelde owner-lidmaatschap en
-- wordt de operator nergens lid.
begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'authenticated') as gezet \gset tmp_
insert into public.organizations (id, name, slug, contact_email)
values ('22222222-0000-0000-0000-00000000000a', 'Proef A', 'proef-a', 'a@proef.test');
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000003', 'authenticated') as gezet \gset tmp_
insert into public.organizations (id, name, slug, contact_email)
values ('22222222-0000-0000-0000-00000000000b', 'Proef B', 'proef-b', 'b@proef.test');
commit;

insert into public.org_members (org_id, user_id, role) values
  ('22222222-0000-0000-0000-00000000000a', '11111111-0000-0000-0000-000000000002', 'member');

select loep_controle.controleer(
  (select string_agg(org_id::text || '/' || user_id::text || '/' || role, ',' order by org_id, user_id)
     from public.org_members)
  = '22222222-0000-0000-0000-00000000000a/11111111-0000-0000-0000-000000000001/owner,'
    '22222222-0000-0000-0000-00000000000a/11111111-0000-0000-0000-000000000002/member,'
    '22222222-0000-0000-0000-00000000000b/11111111-0000-0000-0000-000000000003/owner',
  'SEED: lidmaatschappen zijn precies lidA_owner, lidA_member en lidB_owner (operator geen lid)');

insert into public.campaigns (id, organization_id, name, scan_type, created_at) values
  ('33333333-0000-0000-0000-0000000000a1', '22222222-0000-0000-0000-00000000000a', 'A1 behoud',  'retention', '2026-10-01 09:00:00+00'),
  ('33333333-0000-0000-0000-0000000000a2', '22222222-0000-0000-0000-00000000000a', 'A2 vertrek', 'exit',      '2026-10-02 09:00:00+00'),
  ('33333333-0000-0000-0000-0000000000b1', '22222222-0000-0000-0000-00000000000b', 'B1 vertrek', 'exit',      '2026-10-03 09:00:00+00');

insert into public.respondents (id, campaign_id, department, completed) values
  ('44444444-0000-0000-0000-0000000000a1', '33333333-0000-0000-0000-0000000000a1', 'Zorg', true),
  ('44444444-0000-0000-0000-0000000000a2', '33333333-0000-0000-0000-0000000000a1', 'Zorg', true),
  ('44444444-0000-0000-0000-0000000000a3', '33333333-0000-0000-0000-0000000000a1', 'Zorg', true),
  ('44444444-0000-0000-0000-0000000000a4', '33333333-0000-0000-0000-0000000000a1', 'Staf', true),
  ('44444444-0000-0000-0000-0000000000a5', '33333333-0000-0000-0000-0000000000a1', 'Staf', true),
  ('44444444-0000-0000-0000-0000000000a6', '33333333-0000-0000-0000-0000000000a1', 'Staf', false),
  ('44444444-0000-0000-0000-0000000000b1', '33333333-0000-0000-0000-0000000000b1', 'Werkplaats', true),
  ('44444444-0000-0000-0000-0000000000b2', '33333333-0000-0000-0000-0000000000b1', 'Werkplaats', true),
  ('44444444-0000-0000-0000-0000000000b3', '33333333-0000-0000-0000-0000000000b1', 'Werkplaats', true);

insert into public.survey_responses (respondent_id, risk_score, risk_band) values
  ('44444444-0000-0000-0000-0000000000a1', 3.2, 'LAAG'),
  ('44444444-0000-0000-0000-0000000000a2', 4.8, 'MIDDEN'),
  ('44444444-0000-0000-0000-0000000000a3', 5.5, 'MIDDEN'),
  ('44444444-0000-0000-0000-0000000000a4', 6.1, 'HOOG'),
  ('44444444-0000-0000-0000-0000000000a5', 7.9, 'HOOG'),
  ('44444444-0000-0000-0000-0000000000b1', 7.0, 'HOOG'),
  ('44444444-0000-0000-0000-0000000000b2', 2.5, 'LAAG'),
  ('44444444-0000-0000-0000-0000000000b3', 3.0, 'LAAG');

-- Elke waarde die naar \gset gaat is niet leeg en komt uit een aggregaat (dus
-- altijd precies een rij): een lege waarde maakt de psql-variabele ongedaan en
-- dan stopt het script met een onduidelijke syntaxfout in plaats van met de
-- AFWIJKING-melding. Waar leeg verwacht wordt, staat er '(leeg)'.

-- 3. Snapshots "voor" (geval 1 en 2).
\echo '--- snapshots voor de migratie'

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_lida_owner_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000002', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_lida_member_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000003', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_lidb_owner_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000004', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_operator_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000005', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_buitenstaander_
commit;

begin;
select loep_controle.zet_claims(null, 'service_role') as gezet \gset tmp_
set local role service_role;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_service_
commit;

-- SQL Editor of beheer: SET ROLE postgres, geen claims.
begin;
set local role postgres;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_setrole_postgres_
commit;

-- Directe verbinding: nieuwe sessie als postgres, geen SET ROLE, geen claims.
\c - postgres
select loep_controle.controleer(
  current_setting('role', true) = 'none' and auth.uid() is null and auth.role() is null,
  'VOORAF: directe verbinding heeft rol none en geen claims');
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_direct_
\c - supabase_admin

-- Geval 2: anon voor de migratie. In de productietoestand heeft anon wel
-- leesrecht op de view, maar sinds 13-7 geen enkel recht op respondents en
-- survey_responses; omdat de view met de rechten van de aanroeper draait, krijgt
-- anon dus al een permissiefout. Na de migratie moet dat zo blijven (geval 6),
-- nu al op de view zelf.
begin;
select loep_controle.zet_claims(null, 'anon') as gezet \gset tmp_
set local role anon;
do $$
begin
  perform 1 from public.campaign_stats;
  raise exception 'AFWIJKING in GEVAL 2 anon voor: campaign_stats is leesbaar voor anon';
exception when insufficient_privilege then
  null;  -- verwacht
end $$;
\echo 'ok: GEVAL 2 anon voor: permissiefout zoals verwacht'
commit;

-- Geval 0: de nagebootste productietoestand lekt echt. lidA_owner leest per
-- respondent de risicoband (dit is wat de migratie moet dichtzetten).
begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select count(*)::text as n,
       coalesce(string_agg(risk_band, ',' order by risk_score), '(geen rijen)') as banden
  from public.survey_responses \gset lek_voor_
commit;
select loep_controle.controleer(
  :'lek_voor_n' = '5' and :'lek_voor_banden' = 'LAAG,MIDDEN,MIDDEN,HOOG,HOOG',
  'GEVAL 0: voor de migratie leest lidA_owner per respondent de risicoband (het lek dat dicht moet)');

\echo 'voor lidA_owner:'
\echo :voor_lida_owner_uit

-- Geval 3: de seed klopt. lidA_owner ziet A1 en A2 met de verwachte cijfers
-- en niets van B.
with s as (
  select * from json_to_recordset(:'voor_lida_owner_uit'::json) as x(
    campaign_id uuid, total_invited bigint, total_completed bigint,
    completion_rate_pct numeric, avg_risk_score numeric,
    band_high bigint, band_medium bigint, band_low bigint)
)
select loep_controle.controleer(
  (select count(*) from s) = 2
  and exists (select 1 from s
              where campaign_id = '33333333-0000-0000-0000-0000000000a1'
                and total_invited = 6 and total_completed = 5
                and completion_rate_pct = 83.3 and avg_risk_score = 5.50
                and band_high = 2 and band_medium = 2 and band_low = 1)
  and exists (select 1 from s
              where campaign_id = '33333333-0000-0000-0000-0000000000a2'
                and total_invited = 0 and total_completed = 0
                and completion_rate_pct is null and avg_risk_score is null
                and band_high = 0 and band_medium = 0 and band_low = 0)
  and not exists (select 1 from s where campaign_id = '33333333-0000-0000-0000-0000000000b1'),
  'GEVAL 3: lidA_owner ziet voor de migratie A1 (6/5/83.3/5.50/2/2/1) en A2 (0, leeg, 0/0/0) en geen B1');

-- Organisatie B ziet alleen B1; operator (geen lid) en buitenstaander zien
-- via de view niets, de service-role en postgres zien alles.
with s as (select * from json_to_recordset(:'voor_lidb_owner_uit'::json) as x(
             campaign_id uuid, avg_risk_score numeric, band_high bigint, band_low bigint))
select loep_controle.controleer(
  (select count(*) from s) = 1
  and exists (select 1 from s where campaign_id = '33333333-0000-0000-0000-0000000000b1'
                                and avg_risk_score = 4.17 and band_high = 1 and band_low = 2),
  'GEVAL 1: lidB_owner ziet voor de migratie alleen B1 (4.17, 1 hoog, 2 laag)');
select loep_controle.controleer(
  :'voor_lida_member_uit' = :'voor_lida_owner_uit',
  'GEVAL 1: lidA_member ziet voor de migratie hetzelfde als lidA_owner');
select loep_controle.controleer(
  :'voor_operator_uit' = '[]' and :'voor_buitenstaander_uit' = '[]',
  'GEVAL 1: operator (geen lid) en buitenstaander zien voor de migratie geen meting');
select loep_controle.controleer(
  json_array_length(:'voor_service_uit'::json) = 3
  and json_array_length(:'voor_direct_uit'::json) = 3
  and json_array_length(:'voor_setrole_postgres_uit'::json) = 3,
  'GEVAL 1: service-role, directe verbinding en SET ROLE postgres zien voor de migratie alle drie de metingen');

-- 4. De migratie, als postgres zoals in de SQL Editor.
\echo '--- migratie'
set role postgres;
\i /repo/migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql
reset role;

-- 5. Snapshots "na", byte-gelijk aan "voor".
\echo '--- snapshots na de migratie'

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_lida_owner_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000002', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_lida_member_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000003', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_lidb_owner_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000004', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_operator_
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000005', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_buitenstaander_
commit;

begin;
select loep_controle.zet_claims(null, 'service_role') as gezet \gset tmp_
set local role service_role;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_service_
commit;

begin;
set local role postgres;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_setrole_postgres_
commit;

\c - postgres
select loep_controle.controleer(
  current_setting('role', true) = 'none' and auth.uid() is null and auth.role() is null,
  'NA: directe verbinding heeft rol none en geen claims');
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset na_direct_
\c - supabase_admin

\echo 'na lidA_owner:'
\echo :na_lida_owner_uit

select loep_controle.controleer_gelijk(:'voor_lida_owner_uit', :'na_lida_owner_uit',
  'GEVAL 5 lidA_owner: campaign_stats is na de migratie byte-gelijk aan voor');
select loep_controle.controleer_gelijk(:'voor_lida_member_uit', :'na_lida_member_uit',
  'GEVAL 5 lidA_member: campaign_stats is na de migratie byte-gelijk aan voor');
select loep_controle.controleer_gelijk(:'voor_lidb_owner_uit', :'na_lidb_owner_uit',
  'GEVAL 5 lidB_owner: campaign_stats is na de migratie byte-gelijk aan voor');
select loep_controle.controleer_gelijk(:'voor_operator_uit', :'na_operator_uit',
  'GEVAL 5 operator: campaign_stats is na de migratie byte-gelijk aan voor');
select loep_controle.controleer_gelijk(:'voor_buitenstaander_uit', :'na_buitenstaander_uit',
  'GEVAL 5 buitenstaander: campaign_stats is na de migratie byte-gelijk aan voor');
select loep_controle.controleer_gelijk(:'voor_service_uit', :'na_service_uit',
  'GEVAL 5 service_role: campaign_stats is na de migratie byte-gelijk aan voor');
select loep_controle.controleer_gelijk(:'voor_setrole_postgres_uit', :'na_setrole_postgres_uit',
  'GEVAL 18 SET ROLE postgres: campaign_stats is na de migratie byte-gelijk aan voor');
select loep_controle.controleer_gelijk(:'voor_direct_uit', :'na_direct_uit',
  'GEVAL 18 directe verbinding: campaign_stats is na de migratie byte-gelijk aan voor');
-- Gelijk is niet genoeg als beide leeg of zonder cijfers zouden zijn: de
-- beheerverbindingen moeten na de migratie alles zien, met de echte cijfers.
with s as (select * from json_to_recordset(:'na_direct_uit'::json) as x(
             campaign_id uuid, avg_risk_score numeric, band_high bigint))
select loep_controle.controleer(
  (select count(*) from s) = 3
  and exists (select 1 from s where campaign_id = '33333333-0000-0000-0000-0000000000a1'
                                and avg_risk_score = 5.50 and band_high = 2)
  and exists (select 1 from s where campaign_id = '33333333-0000-0000-0000-0000000000b1'
                                and avg_risk_score = 4.17 and band_high = 1),
  'GEVAL 18: directe verbinding ziet na de migratie alle metingen met echte cijfers');
select loep_controle.controleer(
  :'na_setrole_postgres_uit' = :'na_direct_uit' and :'na_service_uit' = :'na_direct_uit',
  'GEVAL 18: SET ROLE postgres en service-role zien na de migratie hetzelfde als de directe verbinding');

-- Geval 6: anon op campaign_stats na de migratie: permissiefout op de view zelf.
select loep_controle.controleer(
  not has_table_privilege('anon', 'public.campaign_stats', 'select'),
  'GEVAL 6: anon heeft geen leesrecht meer op campaign_stats');
begin;
select loep_controle.zet_claims(null, 'anon') as gezet \gset tmp_
set local role anon;
do $$
begin
  perform 1 from public.campaign_stats;
  raise exception 'AFWIJKING in GEVAL 6 anon: campaign_stats is na de migratie leesbaar voor anon';
exception when insufficient_privilege then
  null;  -- verwacht
end $$;
\echo 'ok: GEVAL 6 anon: permissiefout zoals verwacht'
commit;

-- Geval 7: geen enkele kolom of rij van survey_responses voor een klant of anon.
begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'authenticated') as gezet \gset tmp_
set local role authenticated;
do $$
declare
  vraag text;
begin
  foreach vraag in array array[
    'select risk_band from public.survey_responses limit 1',
    'select risk_score from public.survey_responses limit 1',
    'select id from public.survey_responses limit 1',
    'select count(*) from public.survey_responses'
  ] loop
    begin
      execute vraag;
      raise exception 'AFWIJKING in GEVAL 7 lidA_owner: survey_responses nog leesbaar met: %', vraag;
    exception when insufficient_privilege then
      null;  -- verwacht
    end;
  end loop;
end $$;
\echo 'ok: GEVAL 7 lidA_owner: permissiefout op risk_band, risk_score, id en count(*)'
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000002', 'authenticated') as gezet \gset tmp_
set local role authenticated;
do $$
declare
  vraag text;
begin
  foreach vraag in array array[
    'select risk_band from public.survey_responses limit 1',
    'select risk_score from public.survey_responses limit 1',
    'select id from public.survey_responses limit 1',
    'select count(*) from public.survey_responses'
  ] loop
    begin
      execute vraag;
      raise exception 'AFWIJKING in GEVAL 7 lidA_member: survey_responses nog leesbaar met: %', vraag;
    exception when insufficient_privilege then
      null;  -- verwacht
    end;
  end loop;
end $$;
\echo 'ok: GEVAL 7 lidA_member: permissiefout op risk_band, risk_score, id en count(*)'
commit;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000004', 'authenticated') as gezet \gset tmp_
set local role authenticated;
do $$
declare
  vraag text;
begin
  foreach vraag in array array[
    'select risk_band from public.survey_responses limit 1',
    'select risk_score from public.survey_responses limit 1',
    'select id from public.survey_responses limit 1',
    'select count(*) from public.survey_responses'
  ] loop
    begin
      execute vraag;
      raise exception 'AFWIJKING in GEVAL 7 operator als authenticated: survey_responses nog leesbaar met: %', vraag;
    exception when insufficient_privilege then
      null;  -- verwacht
    end;
  end loop;
end $$;
\echo 'ok: GEVAL 7 operator als authenticated: permissiefout op risk_band, risk_score, id en count(*)'
commit;

begin;
select loep_controle.zet_claims(null, 'anon') as gezet \gset tmp_
set local role anon;
do $$
declare
  vraag text;
begin
  foreach vraag in array array[
    'select risk_band from public.survey_responses limit 1',
    'select risk_score from public.survey_responses limit 1',
    'select id from public.survey_responses limit 1',
    'select count(*) from public.survey_responses'
  ] loop
    begin
      execute vraag;
      raise exception 'AFWIJKING in GEVAL 7 anon: survey_responses nog leesbaar met: %', vraag;
    exception when insufficient_privilege then
      null;  -- verwacht
    end;
  end loop;
end $$;
\echo 'ok: GEVAL 7 anon: permissiefout op risk_band, risk_score, id en count(*)'
commit;

-- has_column_privilege telt ook rechten via PUBLIC, via een andere rol en op
-- tabelniveau mee (zelfde controle als Blok B van de controlequery).
select loep_controle.controleer(
  not exists (
    select 1
    from pg_attribute a
    cross join (values ('anon'), ('authenticated')) as r(rol)
    where a.attrelid = 'public.survey_responses'::regclass
      and a.attnum > 0 and not a.attisdropped
      and has_column_privilege(r.rol, 'public.survey_responses', a.attname, 'SELECT')),
  'GEVAL 7: anon en authenticated mogen geen enkele kolom van survey_responses lezen');

-- Geval 8: de service-role leest survey_responses nog wel.
begin;
select loep_controle.zet_claims(null, 'service_role') as gezet \gset tmp_
set local role service_role;
select count(*)::text as n from public.survey_responses \gset service_sr_
commit;
select loep_controle.controleer(:'service_sr_n' = '8',
  'GEVAL 8: service-role leest na de migratie alle 8 antwoorden');

-- Geval 9: directe functieaanroep lekt niets naar een niet-lid.
begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select count(*)::text as rijen,
       coalesce(bool_and(avg_risk_score is null and band_high = 0 and band_medium = 0
                         and band_low = 0)::text, '(geen rij)') as leeg
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000b1') \gset g9a_
commit;
select loep_controle.controleer(:'g9a_rijen' = '1' and :'g9a_leeg' = 'true',
  'GEVAL 9: lidA_owner krijgt via campaign_risk_summary(B1) geen cijfers van B');

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000005', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select count(*)::text as rijen,
       coalesce(bool_and(avg_risk_score is null and band_high = 0 and band_medium = 0
                         and band_low = 0)::text, '(geen rij)') as leeg
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g9b_
commit;
select loep_controle.controleer(:'g9b_rijen' = '1' and :'g9b_leeg' = 'true',
  'GEVAL 9: buitenstaander krijgt via campaign_risk_summary(A1) geen cijfers');

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000003', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select count(*)::text as rijen,
       coalesce(bool_and(avg_risk_score is null and band_high = 0 and band_medium = 0
                         and band_low = 0)::text, '(geen rij)') as leeg
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g9c_
commit;
select loep_controle.controleer(:'g9c_rijen' = '1' and :'g9c_leeg' = 'true',
  'GEVAL 9: lidB_owner krijgt via campaign_risk_summary(A1) geen cijfers van A');

-- Geval 10: anon mag de functie niet aanroepen.
begin;
select loep_controle.zet_claims(null, 'anon') as gezet \gset tmp_
set local role anon;
do $$
begin
  perform * from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1');
  raise exception 'AFWIJKING in GEVAL 10 anon: campaign_risk_summary is aan te roepen door anon';
exception when insufficient_privilege then
  null;  -- verwacht
end $$;
\echo 'ok: GEVAL 10 anon: permissiefout zoals verwacht'
commit;

-- Geval 11: databaserol authenticated zonder claims ontsnapt niet.
begin;
set local role authenticated;
select loep_controle.controleer(
  auth.uid() is null and auth.role() is null
  and nullif(current_setting('request.jwt.claims', true), '') is null,
  'GEVAL 11: deze transactie heeft echt geen claims');
select count(*)::text as rijen,
       coalesce(bool_and(avg_risk_score is null and band_high = 0 and band_medium = 0
                         and band_low = 0)::text, '(geen rij)') as leeg
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g11_
commit;
select loep_controle.controleer(:'g11_rijen' = '1' and :'g11_leeg' = 'true',
  'GEVAL 11: databaserol authenticated zonder claims krijgt geen cijfers van A1');

-- Geval 12: databaserol authenticated met claims-rol service_role ontsnapt niet.
begin;
select loep_controle.zet_claims(null, 'service_role') as gezet \gset tmp_
set local role authenticated;
select count(*)::text as rijen,
       coalesce(bool_and(avg_risk_score is null and band_high = 0 and band_medium = 0
                         and band_low = 0)::text, '(geen rij)') as leeg
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g12_
commit;
select loep_controle.controleer(:'g12_rijen' = '1' and :'g12_leeg' = 'true',
  'GEVAL 12: databaserol authenticated met claims-rol service_role krijgt geen cijfers van A1');

-- Geval 13: de operator (authenticated, geen lid) krijgt de echte cijfers.
begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000004', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(max(avg_risk_score)::text, '(leeg)') as gem,
       coalesce(max(band_high)::text, '(leeg)') as hoog,
       coalesce(max(band_medium)::text, '(leeg)') as midden,
       coalesce(max(band_low)::text, '(leeg)') as laag
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g13_
commit;
select loep_controle.controleer(
  :'g13_gem' = '5.50' and :'g13_hoog' = '2' and :'g13_midden' = '2' and :'g13_laag' = '1',
  'GEVAL 13: operator krijgt via campaign_risk_summary(A1) de echte cijfers (5.50, 2/2/1)');

-- Ter controle dat de functie de tenancy echt toepast en niet alles dichtzet:
-- lidA_member krijgt de cijfers van zijn eigen meting.
begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000002', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(max(avg_risk_score)::text, '(leeg)') as gem
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g13b_
commit;
select loep_controle.controleer(:'g13b_gem' = '5.50',
  'GEVAL 13: lidA_member krijgt via campaign_risk_summary(A1) de cijfers van zijn eigen meting');

-- Geval 17: een eigen klantachtige databaserol valt niet onder de lijst van
-- beheerverbindingen. Zonder lidmaatschap: niets (fail closed). Met de sub van
-- een lid: wel de cijfers, dus de tenancycheck wordt toegepast.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'loep_proef_klantrol') then
    create role loep_proef_klantrol nologin;
  end if;
end $$;
grant usage on schema public to loep_proef_klantrol;
grant select on public.campaign_stats to loep_proef_klantrol;
grant execute on function public.campaign_risk_summary(uuid) to loep_proef_klantrol;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000005', 'loep_proef_klantrol') as gezet \gset tmp_
set local role loep_proef_klantrol;
select coalesce(current_setting('role', true), '(leeg)') as rol,
       count(*)::text as rijen,
       coalesce(bool_and(avg_risk_score is null and band_high = 0 and band_medium = 0
                         and band_low = 0)::text, '(geen rij)') as leeg
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g17_
commit;
select loep_controle.controleer(
  :'g17_rol' = 'loep_proef_klantrol' and :'g17_rijen' = '1' and :'g17_leeg' = 'true',
  'GEVAL 17: eigen klantrol zonder lidmaatschap krijgt geen cijfers van A1');

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'loep_proef_klantrol') as gezet \gset tmp_
set local role loep_proef_klantrol;
select coalesce(max(avg_risk_score)::text, '(leeg)') as gem
  from public.campaign_risk_summary('33333333-0000-0000-0000-0000000000a1') \gset g17b_
commit;
select loep_controle.controleer(:'g17b_gem' = '5.50',
  'GEVAL 17: eigen klantrol met de sub van lidA_owner krijgt wel de cijfers van A1');

-- Geval 14: eigenschappen van functie en view, en rechten.
select loep_controle.controleer(
  (select prosecdef and proconfig = array['search_path=public']
     from pg_proc where oid = 'public.campaign_risk_summary(uuid)'::regprocedure),
  'GEVAL 14: campaign_risk_summary is security definer met search_path=public');
select loep_controle.controleer(
  (select pg_get_userbyid(proowner) = 'postgres'
     from pg_proc where oid = 'public.campaign_risk_summary(uuid)'::regprocedure),
  'GEVAL 14: campaign_risk_summary is van postgres');
select loep_controle.controleer(
  (select 'security_invoker=true' = any(reloptions)
     from pg_class where oid = 'public.campaign_stats'::regclass),
  'GEVAL 14: campaign_stats draait met security_invoker=true');
select loep_controle.controleer(
  not has_function_privilege('anon', 'public.campaign_risk_summary(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.campaign_risk_summary(uuid)', 'execute')
  and has_function_privilege('service_role', 'public.campaign_risk_summary(uuid)', 'execute'),
  'GEVAL 14: alleen authenticated en service_role mogen de functie aanroepen, anon niet');

-- Geval 15: idempotentie. De migratie nog een keer, daarna hetzelfde beeld.
\echo '--- migratie opnieuw (idempotentie)'
set role postgres;
\i /repo/migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql
reset role;

begin;
select loep_controle.zet_claims('11111111-0000-0000-0000-000000000001', 'authenticated') as gezet \gset tmp_
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset nogmaals_lida_owner_
commit;
select loep_controle.controleer_gelijk(:'voor_lida_owner_uit', :'nogmaals_lida_owner_uit',
  'GEVAL 15: na een tweede keer migreren is campaign_stats voor lidA_owner nog byte-gelijk aan voor');
select loep_controle.controleer(
  not has_table_privilege('anon', 'public.campaign_stats', 'select')
  and not exists (
    select 1
    from pg_attribute a
    cross join (values ('anon'), ('authenticated')) as r(rol)
    where a.attrelid = 'public.survey_responses'::regclass
      and a.attnum > 0 and not a.attisdropped
      and has_column_privilege(r.rol, 'public.survey_responses', a.attname, 'SELECT')),
  'GEVAL 15: na een tweede keer migreren zijn de rechten nog steeds dicht');

\echo 'ALLE GEVALLEN ZOALS VERWACHT'
