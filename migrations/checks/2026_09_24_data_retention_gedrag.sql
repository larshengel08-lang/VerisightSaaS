-- ALLEEN LOKAAL, NOOIT TEGEN PRODUCTIE.
-- Gedragscontrole voor migratie 2026_09_24_add_data_retention.sql in een
-- wegwerp-Postgres. Dit script maakt en overschrijft tabellen en functies
-- (public.profiles, public.organizations, public.campaigns, auth.role/auth.uid)
-- en hoort dus nooit in Supabase Dashboard of op een gedeelde database.
--
-- Draaien (vanuit de repo-root, met het lokale Supabase-Postgres-image):
--   docker run -d --rm --name loep-retentie-check -e POSTGRES_PASSWORD=wegwerp \
--     -v "$PWD/migrations:/m:ro" public.ecr.aws/supabase/postgres:17.6.1.134
--   (wachten tot pg_isready slaagt)
--   docker exec loep-retentie-check psql -U supabase_admin -h localhost -d postgres \
--     -v ON_ERROR_STOP=1 -f /m/checks/2026_09_24_data_retention_gedrag.sql
--   docker stop loep-retentie-check
-- Slaagt alles, dan eindigt de uitvoer met "ALLE GEVALLEN ZOALS VERWACHT";
-- anders stopt het script met een fout die de afwijkende gevallen noemt.
--
-- Gevallen: klant (authenticated, geen operator), anon, operator, service-role
-- en een directe verbinding, op: termijn, data_purged_at, heropenen van een
-- gesloten meting, closed_at verschuiven, stopzetten zonder sluitmoment, een
-- sluitmoment in de toekomst, een tweede keer sluiten (0 rijen, geen fout) en
-- de check-constraint.

-- 1. Minimale tabellen en helpers, zoals in supabase/schema.sql.
create table public.profiles (id uuid primary key, is_verisight_admin boolean default false);
create table public.organizations (id uuid primary key, name text);
create table public.campaigns (
  id uuid primary key,
  organization_id uuid references public.organizations(id),
  name text,
  is_active boolean default true,
  closed_at timestamptz
);
create or replace function public.is_verisight_admin_user() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles
                 where profiles.id = auth.uid() and profiles.is_verisight_admin = true);
$$;
grant select, insert, update on public.organizations, public.campaigns
  to anon, authenticated, service_role;

-- 2. auth.role() en auth.uid() zoals GoTrue ze op gehoste Supabase zet: de
-- claims-json van PostgREST, met terugval op de oude losse claim-instellingen.
-- (Het kale image heeft alleen de oude vorm.)
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
                  (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid $$;
create or replace function auth.role() returns text language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''),
                  (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'))::text $$;

insert into public.profiles values
  ('00000000-0000-0000-0000-00000000000a', true),   -- operator
  ('00000000-0000-0000-0000-00000000000c', false);  -- klant
insert into public.organizations values ('00000000-0000-0000-0000-000000000001', 'org');
insert into public.campaigns values
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'open', true, null),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'gesloten', false,
   '2026-01-01 10:00:00+00');

-- 3. De migratie, twee keer (idempotent).
\ir ../2026_09_24_add_data_retention.sql
\ir ../2026_09_24_add_data_retention.sql

-- 4. Controlequery uit de migratie. Verwacht: t | t | t | 2.
select
  exists (select 1 from information_schema.columns where table_schema = 'public'
          and table_name = 'campaigns' and column_name = 'data_purged_at') as purged_kolom,
  exists (select 1 from information_schema.columns where table_schema = 'public'
          and table_name = 'organizations' and column_name = 'retention_months') as termijn_kolom,
  exists (select 1 from pg_constraint where conname = 'organizations_retention_months_check') as check_bestaat,
  (select count(*) from pg_trigger where tgname in ('organizations_retention_guard_trg',
                                                    'campaigns_retention_guard_trg')) as triggers;

-- 5. Gevallen. Elk geval draait in een subtransactie die daarna altijd wordt
-- teruggedraaid, zodat de gevallen elkaar niet beinvloeden. Elke opdracht
-- eindigt op "returning ...": bij 0 rijen is de uitkomst 'toegestaan (geen rij)'.
create temp table uitslag (nr serial, geval text, verwacht text, kreeg text);

create or replace function pg_temp.geval(p_geval text, p_rol text, p_sub text, p_sql text, p_verwacht text)
returns void language plpgsql as $$
declare
  res text;
  kreeg text;
begin
  begin
    if p_rol is null then
      perform set_config('request.jwt.claims', '', true);
    else
      perform set_config('request.jwt.claims',
        json_build_object('role', p_rol, 'sub', p_sub)::text, true);
      execute format('set local role %I', p_rol);
    end if;
    execute p_sql into res;
    kreeg := 'toegestaan' || coalesce(' (' || res || ')', ' (geen rij)');
    raise exception using errcode = 'P0099';
  exception
    when sqlstate 'P0099' then null;
    when others then kreeg := 'geweigerd: ' || sqlerrm;
  end;
  insert into uitslag (geval, verwacht, kreeg) values (p_geval, p_verwacht, kreeg);
end;
$$;

-- Kortschrift: K = klant, O = operator; ORG, OPEN, DICHT = de rijen hierboven.
\set K 00000000-0000-0000-0000-00000000000c
\set O 00000000-0000-0000-0000-00000000000a
\set ORG 00000000-0000-0000-0000-000000000001
\set OPEN 00000000-0000-0000-0000-000000000002
\set DICHT 00000000-0000-0000-0000-000000000003

-- Klant (authenticated, geen operator)
select pg_temp.geval('klant: termijn wijzigen', 'authenticated', :'K',
  'update public.organizations set retention_months = 36 returning 1', 'geweigerd');
select pg_temp.geval('klant: naam organisatie wijzigen', 'authenticated', :'K',
  'update public.organizations set name = ''x'' returning 1', 'toegestaan (1)');
select pg_temp.geval('klant: data_purged_at wijzigen', 'authenticated', :'K',
  'update public.campaigns set data_purged_at = now() where id = ' || quote_literal(:'OPEN') || ' returning 1', 'geweigerd');
select pg_temp.geval('klant: naam open meting wijzigen', 'authenticated', :'K',
  'update public.campaigns set name = ''y'' where id = ' || quote_literal(:'OPEN') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('klant: meting aanmaken met data_purged_at', 'authenticated', :'K',
  'insert into public.campaigns (id, organization_id, name, data_purged_at) values '
  || '(''00000000-0000-0000-0000-000000000009'', ' || quote_literal(:'ORG') || ', ''n'', now()) returning 1', 'geweigerd');
select pg_temp.geval('klant: meting aanmaken zonder data_purged_at', 'authenticated', :'K',
  'insert into public.campaigns (id, organization_id, name) values '
  || '(''00000000-0000-0000-0000-000000000009'', ' || quote_literal(:'ORG') || ', ''n'') returning 1', 'toegestaan (1)');
select pg_temp.geval('klant: open meting sluiten', 'authenticated', :'K',
  'update public.campaigns set is_active = false, closed_at = now() where id = ' || quote_literal(:'OPEN')
  || ' and closed_at is null returning 1', 'toegestaan (1)');
select pg_temp.geval('klant: sluitmoment in de toekomst bij sluiten (teruggezet naar nu)', 'authenticated', :'K',
  'update public.campaigns set is_active = false, closed_at = now() + interval ''30 days'' where id = '
  || quote_literal(:'OPEN') || ' returning closed_at <= now()', 'toegestaan (true)');
select pg_temp.geval('klant: sluitmoment in de toekomst bij aanmaken (teruggezet naar nu)', 'authenticated', :'K',
  'insert into public.campaigns (id, organization_id, name, is_active, closed_at) values '
  || '(''00000000-0000-0000-0000-000000000009'', ' || quote_literal(:'ORG') || ', ''n'', false, now() + interval ''30 days'')'
  || ' returning closed_at <= now()', 'toegestaan (true)');
select pg_temp.geval('klant: open meting stopzetten zonder sluitmoment', 'authenticated', :'K',
  'update public.campaigns set is_active = false where id = ' || quote_literal(:'OPEN') || ' returning 1', 'geweigerd');
select pg_temp.geval('anon: open meting stopzetten zonder sluitmoment', 'anon', null,
  'update public.campaigns set is_active = false where id = ' || quote_literal(:'OPEN') || ' returning 1', 'geweigerd');
select pg_temp.geval('operator: open meting stopzetten zonder sluitmoment', 'authenticated', :'O',
  'update public.campaigns set is_active = false where id = ' || quote_literal(:'OPEN') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('directe verbinding: open meting stopzetten zonder sluitmoment', null, null,
  'update public.campaigns set is_active = false where id = ' || quote_literal(:'OPEN') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('klant: gesloten meting heropenen (is_active)', 'authenticated', :'K',
  'update public.campaigns set is_active = true where id = ' || quote_literal(:'DICHT') || ' returning 1', 'geweigerd');
select pg_temp.geval('klant: gesloten meting heropenen (is_active en closed_at leeg)', 'authenticated', :'K',
  'update public.campaigns set is_active = true, closed_at = null where id = ' || quote_literal(:'DICHT') || ' returning 1', 'geweigerd');
select pg_temp.geval('klant: closed_at verschuiven op gesloten meting', 'authenticated', :'K',
  'update public.campaigns set closed_at = now() where id = ' || quote_literal(:'DICHT') || ' returning 1', 'geweigerd');
select pg_temp.geval('klant: naam gesloten meting wijzigen (klok ongemoeid)', 'authenticated', :'K',
  'update public.campaigns set name = ''z'' where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('klant: tweede keer sluiten met closed_at is null (geen fout, 0 rijen)', 'authenticated', :'K',
  'update public.campaigns set is_active = false, closed_at = now() where id = ' || quote_literal(:'DICHT')
  || ' and closed_at is null returning 1', 'toegestaan (geen rij)');
select pg_temp.geval('klant: tweede keer sluiten zonder filter (geweigerd)', 'authenticated', :'K',
  'update public.campaigns set is_active = false, closed_at = now() where id = ' || quote_literal(:'DICHT') || ' returning 1', 'geweigerd');

-- anon (verdediging in de diepte; RLS laat anon hier in het echt niets schrijven)
select pg_temp.geval('anon: termijn wijzigen', 'anon', null,
  'update public.organizations set retention_months = 36 returning 1', 'geweigerd');
select pg_temp.geval('anon: gesloten meting heropenen', 'anon', null,
  'update public.campaigns set is_active = true where id = ' || quote_literal(:'DICHT') || ' returning 1', 'geweigerd');

-- Operator, service-role en directe verbinding mogen alles
select pg_temp.geval('operator: termijn wijzigen', 'authenticated', :'O',
  'update public.organizations set retention_months = 36 returning 1', 'toegestaan (1)');
select pg_temp.geval('operator: data_purged_at zetten', 'authenticated', :'O',
  'update public.campaigns set data_purged_at = now() where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('operator: gesloten meting heropenen', 'authenticated', :'O',
  'update public.campaigns set is_active = true, closed_at = null where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('operator: closed_at verschuiven', 'authenticated', :'O',
  'update public.campaigns set closed_at = now() where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('service_role: termijn en data_purged_at', 'service_role', null,
  'with a as (update public.organizations set retention_months = 36 returning 1) '
  || 'update public.campaigns set data_purged_at = now() where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('service_role: gesloten meting heropenen', 'service_role', null,
  'update public.campaigns set is_active = true, closed_at = null where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('directe verbinding: termijn en data_purged_at', null, null,
  'with a as (update public.organizations set retention_months = 36 returning 1) '
  || 'update public.campaigns set data_purged_at = now() where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');
select pg_temp.geval('directe verbinding: closed_at verschuiven', null, null,
  'update public.campaigns set closed_at = now() where id = ' || quote_literal(:'DICHT') || ' returning 1', 'toegestaan (1)');

-- Check-constraint
select pg_temp.geval('termijn 0', null, null,
  'update public.organizations set retention_months = 0 returning 1', 'geweigerd');
select pg_temp.geval('termijn 121', null, null,
  'update public.organizations set retention_months = 121 returning 1', 'geweigerd');
select pg_temp.geval('termijn 120', null, null,
  'update public.organizations set retention_months = 120 returning 1', 'toegestaan (1)');

-- 6. Uitslag
select nr, geval, verwacht, kreeg,
       case when kreeg = verwacht or (verwacht = 'geweigerd' and kreeg like 'geweigerd:%')
            then 'OK' else 'AFWIJKING' end as oordeel
from uitslag order by nr;

do $$
declare
  afwijkend text;
begin
  select string_agg(geval, '; ') into afwijkend from uitslag
  where not (kreeg = verwacht or (verwacht = 'geweigerd' and kreeg like 'geweigerd:%'));
  if afwijkend is not null then
    raise exception 'AFWIJKENDE GEVALLEN: %', afwijkend;
  end if;
  raise notice 'ALLE GEVALLEN ZOALS VERWACHT (% gevallen)', (select count(*) from uitslag);
end $$;
