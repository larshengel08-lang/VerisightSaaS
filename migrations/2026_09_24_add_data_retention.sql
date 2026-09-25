-- Migration: bewaartermijn van metinggegevens (fixronde 24-9, Deel C)
-- Aanleiding: privacyverklaring (P6) en verwerkersovereenkomst (D5) beloven dat
-- Loep uiterlijk twee jaar na het sluiten van een meting de gegevens verwijdert
-- of anonimiseert, of eerder op verzoek, tenzij schriftelijk anders afgesproken.
-- backend/data_retention.py doet dat; deze migratie geeft het twee kolommen en
-- triggers die de klok en opgeschoonde metingen bewaken.
-- Uitvoeren in: Supabase Dashboard -> SQL Editor. Additief en idempotent: opnieuw
-- draaien verandert niets, en de live backend merkt er niets van (de kolommen
-- staan bewust niet op het ORM-model).

alter table public.campaigns
  add column if not exists data_purged_at timestamptz;

comment on column public.campaigns.data_purged_at is
  'Moment waarop backend/data_retention.py de respondentgegevens van deze meting verwijderde. Leeg: niet opgeschoond.';

alter table public.organizations
  add column if not exists retention_months integer;

comment on column public.organizations.retention_months is
  'Schriftelijk afgesproken bewaartermijn in maanden na het sluiten van een meting. Leeg: 24.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_retention_months_check'
  ) then
    alter table public.organizations
      add constraint organizations_retention_months_check
      check (retention_months is null or retention_months between 1 and 120);
  end if;
end $$;

-- Klanten mogen hun organisatierij bijwerken (policy owners_can_update_org) en
-- managers mogen metingen aanmaken en bijwerken (org_managers_can_insert_campaigns,
-- org_managers_can_update_campaigns). Deze kolommen zijn van Loep: een klant die
-- geen operator is, mag ze niet wijzigen, en mag ook geen meting aanmaken met
-- data_purged_at al gevuld (die zou de opschoning dan voor altijd overslaan).
-- Om dezelfde reden bewaakt de trigger de klok van de bewaartermijn (die loopt
-- vanaf closed_at). Voor een klant is de database eigenaar van het sluitmoment:
-- zodra closed_at van leeg naar gevuld gaat (sluiten, of een meting aanmaken
-- met een sluitmoment), zet de trigger closed_at op now(), wat de client ook
-- stuurt. Een sluitmoment in de toekomst zou de termijn uitstellen, een in het
-- verleden zou de meting bij de volgende opschoning onherroepelijk wissen; nu
-- kan geen van beide, en een afwijkende browserklok geeft ook geen fout. Verder
-- kan een klant een gesloten meting niet heropenen en closed_at daarna niet
-- verschuiven, en een meting stopzetten (is_active van waar naar onwaar) of
-- meteen stopgezet aanmaken kan alleen met een sluitmoment erbij; een meting
-- zonder closed_at raakt de opschoning nooit. Geen enkele klantflow wordt
-- hierdoor geweigerd (sluiten zet is_active en closed_at samen, en alleen als
-- closed_at nog leeg is).
-- 'anon' valt er ook onder (verdediging in de diepte; RLS laat anon hier niets
-- schrijven). De service-role en een directe databaseverbinding (de opschoning)
-- hebben geen van die JWT-rollen en mogen wel.
-- Let op: de tabelnaam staat in een eigen, buitenste if. PL/pgSQL rekent een
-- expressie als "tg_table_name = 'campaigns' and new.data_purged_at ..." niet
-- kort: op organizations bestaat new.data_purged_at niet en dan faalt elke
-- update van een klant op die tabel.
create or replace function public.guard_retention_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_verisight_admin_user() then
    if tg_table_name = 'organizations' then
      if tg_op = 'UPDATE' then
        if new.retention_months is distinct from old.retention_months then
          raise exception 'retention_months wordt alleen door Loep gezet';
        end if;
      end if;
    elsif tg_table_name = 'campaigns' then
      if tg_op = 'INSERT' then
        if new.data_purged_at is not null then
          raise exception 'data_purged_at wordt alleen door de opschoning gezet';
        end if;
        if new.is_active is false and new.closed_at is null then
          raise exception 'Sluit een meting met een sluitmoment';
        end if;
        if new.closed_at is not null then
          new.closed_at := now();
        end if;
      else
        if new.data_purged_at is distinct from old.data_purged_at then
          raise exception 'data_purged_at wordt alleen door de opschoning gezet';
        end if;
        if coalesce(old.is_active, false) and new.is_active is false and new.closed_at is null then
          raise exception 'Sluit een meting met een sluitmoment';
        end if;
        if old.closed_at is not null then
          if new.closed_at is distinct from old.closed_at
             or (coalesce(new.is_active, false) and not coalesce(old.is_active, false)) then
            raise exception 'een gesloten meting kan alleen Loep heropenen of een ander sluitmoment geven';
          end if;
        elsif new.closed_at is not null then
          new.closed_at := now();
        end if;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists organizations_retention_guard_trg on public.organizations;
create trigger organizations_retention_guard_trg
  before update on public.organizations
  for each row execute function public.guard_retention_columns();

drop trigger if exists campaigns_retention_guard_trg on public.campaigns;
create trigger campaigns_retention_guard_trg
  before insert or update on public.campaigns
  for each row execute function public.guard_retention_columns();

-- Na de opschoning slaat de opschoning een meting voor altijd over
-- (data_purged_at is gevuld). Wat een klant daarna nog in een tabel per meting
-- schrijft, bijvoorbeeld een eigenaarnaam in campaign_decisions, zou dus nooit
-- meer verdwijnen. Deze trigger weigert daarom voor een klant (anon, of
-- ingelogd en geen operator; dezelfde regel als hierboven) elke insert en
-- update op een tabel per meting waarvan de meting is opgeschoond. Bij een
-- update telt ook de meting waar de rij vandaan komt. Operator, service-role
-- en een directe verbinding mogen wel: de opschoning zelf schrijft hier de
-- geanonimiseerde waarden. Verwijderen blijft mogelijk, dat haalt alleen weg.
-- De tabellen zijn precies die een klant via RLS mag schrijven en die aan een
-- meting hangen (supabase/schema.sql en migrations/, 24-9):
--   campaign_id:           respondents, campaign_delivery_records,
--                          campaign_decisions, campaign_action_audit_events,
--                          action_center_manager_responses,
--                          action_center_route_actions,
--                          suite_telemetry_events, case_proof_registry
--                          (migratie 2026_04_27, policies voor de eigenaar)
--   via een ouderrij:      campaign_delivery_checkpoints (delivery_record_id),
--                          action_center_action_reviews (action_id)
--   bron en doel:          action_center_route_relations
--   route_source_id:       action_center_review_rhythm_configs,
--                          action_center_governance_interventions (zonder RLS
--                          in schema.sql, dus schrijfbaar als hij bestaat)
-- Niet erbij: survey_responses (geen schrijfpolicy voor klanten) en de tabellen
-- die alleen de operator of de service-role schrijft. Een tabel die op deze
-- omgeving niet bestaat, wordt overgeslagen. Een tabel die pas na het draaien
-- van deze migratie ontstaat, krijgt de trigger alleen als deze migratie
-- opnieuw wordt gedraaid.
-- De kolommen worden via to_jsonb gelezen: zo leest de functie nooit een kolom
-- die op de tabel niet bestaat (hetzelfde probleem als hierboven).
create or replace function public.guard_purged_campaign_writes()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rijen jsonb[];
  rij jsonb;
  ids uuid[] := '{}';
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_verisight_admin_user() then
    rijen := array[to_jsonb(new)];
    if tg_op = 'UPDATE' then
      rijen := array_append(rijen, to_jsonb(old));
    end if;
    foreach rij in array rijen loop
      ids := ids || array[
        (rij ->> 'campaign_id')::uuid,
        (rij ->> 'source_campaign_id')::uuid,
        (rij ->> 'target_campaign_id')::uuid,
        (rij ->> 'route_source_id')::uuid
      ];
      if tg_table_name = 'campaign_delivery_checkpoints' then
        ids := ids || array(select d.campaign_id from public.campaign_delivery_records d
                            where d.id = (rij ->> 'delivery_record_id')::uuid);
      elsif tg_table_name = 'action_center_action_reviews' then
        ids := ids || array(select a.campaign_id from public.action_center_route_actions a
                            where a.id = (rij ->> 'action_id')::uuid);
      end if;
    end loop;
    if exists (select 1 from public.campaigns c
               where c.id = any(ids) and c.data_purged_at is not null) then
      raise exception 'De gegevens van deze meting zijn verwijderd; hier kan niets meer bij.';
    end if;
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'respondents', 'campaign_delivery_records', 'campaign_delivery_checkpoints',
    'campaign_decisions', 'campaign_action_audit_events',
    'action_center_manager_responses', 'action_center_route_actions',
    'action_center_action_reviews', 'action_center_route_relations',
    'action_center_review_rhythm_configs', 'action_center_governance_interventions',
    'suite_telemetry_events', 'case_proof_registry'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists %I on public.%I', t || '_purged_guard_trg', t);
      execute format('create trigger %I before insert or update on public.%I '
                     'for each row execute function public.guard_purged_campaign_writes()',
                     t || '_purged_guard_trg', t);
    end if;
  end loop;
end $$;

-- Controle voor Lars (alleen lezen, mag in productie): de trigger leest de rol
-- via auth.role(). Die moet de claims-json van PostgREST lezen, anders ziet hij
-- elke klant als 'geen rol' en laat hij alles door. Verwacht: true.
-- select pg_get_functiondef('auth.role'::regproc) like '%request.jwt.claims%';
