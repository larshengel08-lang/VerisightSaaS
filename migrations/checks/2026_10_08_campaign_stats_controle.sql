-- Controle voor migratie 2026_10_08_campaign_stats_zonder_respondentscores.sql.
--
-- VEILIG OP PRODUCTIE: dit bestand is alleen-lezen. Het bevat alleen select-
-- opdrachten, set_config(..., true) (geldt alleen binnen de transactie) en
-- set local role binnen een transactie die eindigt met rollback. Geen enkele
-- opdracht maakt, wijzigt of verwijdert iets.
--
-- Waar: Supabase Dashboard -> SQL Editor (draait als postgres).
-- Hoe: draai elk blok LOS. Kopieer alleen dat blok in een leeg query-venster,
-- of selecteer het en klik op Run. De SQL Editor toont van een heel bestand
-- alleen de laatste uitkomst, dus alles tegelijk draaien zegt niets.
--
-- Wanneer welk blok:
--   Blok A  VOOR de migratie en direct NA de migratie. Beide keren moeten
--           metingen en vingerafdruk gelijk zijn: de migratie verandert geen
--           enkel cijfer. Vult er tussendoor iemand een vragenlijst in, dan
--           verschuift de vingerafdruk; draai dan Blok A voor en na opnieuw
--           kort na elkaar (of vergelijk met Blok C0 en C1).
--   Blok B  NA de migratie: elke regel moet "ok" tonen. Draai je hem ervoor,
--           dan tonen deze regels AFWIJKING (zo zie je dat de controle iets
--           meet): de regel over survey_responses, alle regels over
--           campaign_risk_summary, "leest survey_responses niet meer
--           rechtstreeks" en "anon leest campaign_stats niet".
--   Blok C0 NA de migratie, als postgres: de cijfers van de testklant zoals
--           de beheerverbinding ze ziet.
--   C1 en C2 nemen bewust de eigenaar van de klant aan, niet de Loep-
--           operator. De operator is ook owner van de testklant (en van elke
--           organisatie die hij aanmaakt) en ziet via zijn lidmaatschappen
--           metingen van andere organisaties; dat zou op een lek lijken.
--   Blok C1 NA de migratie, als eigenaar van de testklant: moet precies
--           dezelfde regels geven als C0 (en als het dashboard), en geen
--           meting van een andere organisatie.
--   Blok C2 NA de migratie, als eigenaar van de testklant: moet falen met
--           "permission denied for table survey_responses". Voor de migratie
--           geeft hij juist een risicoband terug (het lek dat dicht moet).


-- Blok A: vingerafdruk van campaign_stats (alle metingen, als postgres)
select count(*) as metingen,
       md5(coalesce(json_agg(cs order by cs.campaign_id)::text, '')) as vingerafdruk
from public.campaign_stats cs;


-- Blok B: rechten en eigenschappen
-- to_regprocedure geeft leeg als de functie nog niet bestaat; de regel toont
-- dan AFWIJKING in plaats van dat het hele blok met een fout stopt.
select controle, case when coalesce(goed, false) then 'ok' else 'AFWIJKING' end as uitkomst
from (
  select 1 as nr,
         'anon en authenticated lezen geen enkele kolom van survey_responses' as controle,
         not exists (
           select 1
           from (values ('anon'), ('authenticated')) v(rol)
           cross join pg_attribute a
           where a.attrelid = 'public.survey_responses'::regclass
             and a.attnum > 0 and not a.attisdropped
             and has_column_privilege(v.rol, 'public.survey_responses', a.attname, 'SELECT')
         ) as goed
  union all
  select 2, 'campaign_risk_summary bestaat',
         to_regprocedure('public.campaign_risk_summary(uuid)') is not null
  union all
  select 3, 'campaign_risk_summary is security definer met search_path=public',
         exists (select 1 from pg_proc
                 where oid = to_regprocedure('public.campaign_risk_summary(uuid)')
                   and prosecdef and proconfig @> array['search_path=public'])
  union all
  select 4, 'campaign_risk_summary is van postgres',
         exists (select 1 from pg_proc
                 where oid = to_regprocedure('public.campaign_risk_summary(uuid)')
                   and pg_get_userbyid(proowner) = 'postgres')
  union all
  select 5, 'campaign_risk_summary laat zonder tenancycheck alleen beheerverbindingen door (lijst van wat wel mag)',
         position($t$coalesce(current_setting('role', true), 'none') in ('none', 'postgres', 'service_role')$t$
                  in pg_get_functiondef(to_regprocedure('public.campaign_risk_summary(uuid)'))) > 0
         and position($t$coalesce(auth.role(), '') not in ('anon', 'authenticated')$t$
                  in pg_get_functiondef(to_regprocedure('public.campaign_risk_summary(uuid)'))) > 0
  union all
  select 6, 'anon mag campaign_risk_summary niet uitvoeren',
         to_regprocedure('public.campaign_risk_summary(uuid)') is not null
         and not has_function_privilege('anon', to_regprocedure('public.campaign_risk_summary(uuid)'), 'execute')
  union all
  select 7, 'authenticated mag campaign_risk_summary uitvoeren',
         has_function_privilege('authenticated', to_regprocedure('public.campaign_risk_summary(uuid)'), 'execute')
  union all
  select 8, 'campaign_stats draait nog met de rechten van de aanroeper',
         exists (select 1 from pg_class
                 where oid = 'public.campaign_stats'::regclass
                   and reloptions @> array['security_invoker=true'])
  union all
  select 9, 'campaign_stats leest survey_responses niet meer rechtstreeks',
         position('survey_responses' in pg_get_viewdef('public.campaign_stats'::regclass)) = 0
  union all
  select 10, 'anon leest campaign_stats niet',
         not has_table_privilege('anon', 'public.campaign_stats', 'SELECT')
) c
order by nr;


-- Blok C0: cijfers van de testklant zoals postgres ze ziet
select cs.campaign_id, cs.campaign_name, cs.total_invited, cs.total_completed,
       cs.avg_risk_score, cs.band_high, cs.band_medium, cs.band_low
from public.campaign_stats cs
join public.organizations o on o.id = cs.organization_id
where o.slug = 'loep-testklant'
order by cs.created_at;


-- Blok C1: dezelfde cijfers als eigenaar van de testklant
-- Neemt de identiteit aan zoals de app dat doet (claims in de transactie, dan
-- de rol uit de inlog) en draait alles terug. De claims staan er in twee
-- vormen, zodat het werkt welke versie van auth.uid() de database ook heeft.
-- Verwacht: kolom rol = authenticated, ingelogd_als gevuld, en verder precies
-- de regels van Blok C0. Is ingelogd_als leeg, dan is er geen eigenaar van
-- de testklant gevonden die geen Loep-operator is, en zegt de rest niets.
-- Is rol niet authenticated, dan is het blok niet als geheel gedraaid.
begin;
select set_config('request.jwt.claim.sub', m.user_id::text, true),
       set_config('request.jwt.claim.role', 'authenticated', true),
       set_config('request.jwt.claims',
         json_build_object('sub', m.user_id, 'role', 'authenticated')::text, true)
from public.org_members m
join public.organizations o on o.id = m.org_id
where o.slug = 'loep-testklant' and m.role = 'owner'
  and not exists (select 1 from public.profiles p
                  where p.id = m.user_id and p.is_verisight_admin)
limit 1;
set local role authenticated;
select current_user as rol, auth.uid() as ingelogd_als,
       cs.campaign_id, cs.campaign_name, cs.total_invited, cs.total_completed,
       cs.avg_risk_score, cs.band_high, cs.band_medium, cs.band_low
from (select 1) as ik
left join public.campaign_stats cs on true
order by cs.created_at;
rollback;


-- Blok C2: als eigenaar van de testklant geen enkele risicoband meer leesbaar
-- Verwacht: ERROR: permission denied for table survey_responses.
-- De fout breekt de transactie af. Er is niets gewijzigd: de transactie bevat
-- alleen leesopdrachten en instellingen die met de transactie verdwijnen.
begin;
select set_config('request.jwt.claim.sub', m.user_id::text, true),
       set_config('request.jwt.claim.role', 'authenticated', true),
       set_config('request.jwt.claims',
         json_build_object('sub', m.user_id, 'role', 'authenticated')::text, true)
from public.org_members m
join public.organizations o on o.id = m.org_id
where o.slug = 'loep-testklant' and m.role = 'owner'
  and not exists (select 1 from public.profiles p
                  where p.id = m.user_id and p.is_verisight_admin)
limit 1;
set local role authenticated;
select risk_band from public.survey_responses limit 1;
rollback;
