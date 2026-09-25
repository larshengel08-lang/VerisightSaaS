-- Migration: bewaartermijn van metinggegevens (fixronde 24-9, Deel C)
-- Aanleiding: privacyverklaring (P6) en verwerkersovereenkomst (D5) beloven dat
-- Loep uiterlijk twee jaar na het sluiten van een meting de gegevens verwijdert
-- of anonimiseert, of eerder op verzoek, tenzij schriftelijk anders afgesproken.
-- backend/data_retention.py doet dat; deze migratie geeft het twee kolommen.
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
-- org_managers_can_update_campaigns). Deze twee kolommen zijn van Loep: een
-- ingelogde klant die geen operator is, mag ze niet wijzigen, en mag ook geen
-- meting aanmaken met data_purged_at al gevuld (die zou de opschoning dan voor
-- altijd overslaan). De service-role en een directe databaseverbinding (de
-- opschoning) hebben geen JWT-rol 'authenticated' en mogen wel.
-- Let op: de tabelnaam staat in een eigen, buitenste if. PL/pgSQL rekent een
-- expressie als "tg_table_name = 'campaigns' and new.data_purged_at ..." niet
-- kort: op organizations bestaat new.data_purged_at niet en dan faalt elke
-- update van een klant op die tabel.
create or replace function public.guard_retention_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'authenticated' and not public.is_verisight_admin_user() then
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
      elsif new.data_purged_at is distinct from old.data_purged_at then
        raise exception 'data_purged_at wordt alleen door de opschoning gezet';
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
