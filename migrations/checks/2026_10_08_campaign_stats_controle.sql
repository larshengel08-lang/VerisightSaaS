-- Controle voor migratie 2026_10_08_campaign_stats_zonder_respondentscores.sql.
--
-- VEILIG OP PRODUCTIE: dit bestand is alleen-lezen. Het bevat alleen select-
-- opdrachten, set_config(..., true) en set local role. Er staat geen begin,
-- commit of rollback in: de SQL Editor stuurt een blok als een geheel en
-- Postgres draait dat als een transactie. De instellingen en de rol gelden
-- alleen binnen dat blok en zijn daarna weg; een fout breekt alleen dat blok
-- af. Geen enkele opdracht maakt, wijzigt of verwijdert iets.
-- Zie je ooit "current transaction is aborted", draai dan los: rollback;
--
-- Waar: Supabase Dashboard -> SQL Editor. Controleer bij de knop Run
-- dat de rol op postgres staat; anders draaien alle blokken als een andere
-- rol en zeggen ze niets.
-- Hoe: draai elk blok LOS. Kopieer alleen dat blok in een leeg query-venster,
-- of selecteer het en klik op Run. De SQL Editor toont van een heel bestand
-- alleen de laatste uitkomst, dus alles tegelijk draaien zegt niets.
--
-- Wanneer welk blok:
--   Blok A  direct VOOR de migratie en direct NA de migratie, zonder iets
--           ertussen. Beide keren moeten metingen en vingerafdruk gelijk
--           zijn: de migratie verandert geen enkel cijfer. Vult er tussendoor
--           iemand een vragenlijst in, dan verschuift de vingerafdruk; dat is
--           geen fout van de migratie. Meld het dan (zie "Bij een afwijking").
--   Blok B  NA de migratie: elke regel moet "ok" tonen. Draai je hem ervoor,
--           dan tonen deze regels AFWIJKING (zo zie je dat de controle iets
--           meet): de regel over survey_responses, alle regels over
--           campaign_risk_summary, "leest survey_responses niet meer
--           rechtstreeks" en "anon leest campaign_stats niet". De regels
--           "service_role leest campaign_stats" en "authenticated leest
--           campaign_stats" en "draait nog met de rechten van de aanroeper"
--           zijn voor en na ok.
--   Blok C0 NA de migratie, als postgres: de cijfers van de testklant zoals
--           de beheerverbinding ze ziet. Minstens een meting (meting A, de
--           gesloten meting met antwoorden) moet een ingevuld gemiddelde
--           hebben. Is avg_risk_score overal leeg, stop dan: dan bewijst de
--           vergelijking met C1 niets, want een geweigerde tenancycheck ziet
--           er precies zo uit als "nog geen antwoorden".
--   C1, C2 en C3 nemen bewust de eigenaar van de klant aan, niet de Loep-
--           operator. De operator is ook owner van de testklant (en van elke
--           organisatie die hij aanmaakt) en ziet via zijn lidmaatschappen
--           metingen van andere organisaties; dat zou op een lek lijken.
--   Blok C1 NA de migratie, als eigenaar van de testklant: kolom rol =
--           authenticated, ingelogd_als gevuld, en verder precies dezelfde
--           regels als C0 (en als het dashboard). Elke regel heeft dezelfde
--           organization_id als in C0; een andere organization_id is een
--           meting van een andere organisatie.
--   Blok C2 NA de migratie, als eigenaar van de testklant: moet falen met
--           "permission denied for table survey_responses". Alleen een fout
--           die eindigt op "for table survey_responses" telt als goed. Elke
--           andere fout (bijvoorbeeld "permission denied to set role
--           "authenticated"") betekent dat de controle niet gedraaid heeft.
--           Krijg je een regel terug, kijk dan naar kolom rol: is die
--           authenticated, dan is het lek nog open; is die postgres, dan is
--           het blok niet als geheel gedraaid. Voor de migratie geeft C2
--           juist een risicoband terug (het lek dat dicht moet).
--   Blok C3 NA de migratie, als eigenaar van de testklant: vraagt de cijfers
--           op van een meting van een ANDERE organisatie (de meting met de
--           meeste antwoorden waar deze eigenaar geen lid van is). Kolom
--           uitkomst moet "ok" zijn: gemiddelde leeg en 0/0/0. Staat er
--           "niet getoetst: niet ingelogd als klant-owner", dan is er geen
--           eigenaar van de testklant gevonden of is het blok niet als geheel
--           gedraaid. Staat er "niet getoetst: geen andere meting met
--           antwoorden gevonden", dan bestaat zo'n meting niet. Meld beide.
--           Voor de migratie faalt C3 met "function ... does not exist".
--
-- Bij een afwijking of een onverwachte uitkomst: stop. Verander niets en draai
-- de migratie niet zelf terug; terugdraaien zet het lek weer open. Stuur een
-- schermafbeelding van het blok en de uitkomst naar Claude in de chat.


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
  select 8, 'service_role mag campaign_risk_summary uitvoeren',
         has_function_privilege('service_role', to_regprocedure('public.campaign_risk_summary(uuid)'), 'execute')
  union all
  select 9, 'campaign_stats draait nog met de rechten van de aanroeper',
         exists (select 1 from pg_class
                 where oid = 'public.campaign_stats'::regclass
                   and reloptions @> array['security_invoker=true'])
  union all
  select 10, 'campaign_stats leest survey_responses niet meer rechtstreeks',
         position('survey_responses' in pg_get_viewdef('public.campaign_stats'::regclass)) = 0
  union all
  select 11, 'anon leest campaign_stats niet',
         not has_table_privilege('anon', 'public.campaign_stats', 'SELECT')
  union all
  select 12, 'authenticated leest campaign_stats',
         has_table_privilege('authenticated', 'public.campaign_stats', 'SELECT')
  union all
  select 13, 'service_role leest campaign_stats',
         has_table_privilege('service_role', 'public.campaign_stats', 'SELECT')
) c
order by nr;


-- Blok C0: cijfers van de testklant zoals postgres ze ziet
select cs.organization_id, cs.campaign_id, cs.campaign_name,
       cs.total_invited, cs.total_completed,
       cs.avg_risk_score, cs.band_high, cs.band_medium, cs.band_low
from public.campaign_stats cs
join public.organizations o on o.id = cs.organization_id
where o.slug = 'loep-testklant'
order by cs.created_at;


-- Blok C1: dezelfde cijfers als eigenaar van de testklant
-- Neemt de identiteit aan zoals de app dat doet (claims, dan de rol uit de
-- inlog). De claims staan er in twee vormen, zodat het werkt welke versie
-- van auth.uid() de database ook heeft.
-- Verwacht: kolom rol = authenticated, ingelogd_als gevuld, en verder precies
-- de regels van Blok C0. Is ingelogd_als leeg, dan is er geen eigenaar van
-- de testklant gevonden die geen Loep-operator is, en zegt de rest niets.
-- Is rol niet authenticated, dan is het blok niet als geheel gedraaid.
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
       cs.organization_id, cs.campaign_id, cs.campaign_name,
       cs.total_invited, cs.total_completed,
       cs.avg_risk_score, cs.band_high, cs.band_medium, cs.band_low
from (select 1) as ik
left join public.campaign_stats cs on true
order by cs.created_at;


-- Blok C2: als eigenaar van de testklant geen enkele risicoband meer leesbaar
-- Verwacht: ERROR: permission denied for table survey_responses.
-- Alleen die fout telt als goed (zie de kop).
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
select current_user as rol, risk_band from public.survey_responses limit 1;


-- Blok C3: als eigenaar van de testklant geen cijfers van een andere organisatie
-- Kiest eerst, nog als postgres, de meting met de meeste antwoorden bij een
-- organisatie waar deze eigenaar geen lid van is, en vraagt daarna als klant
-- de cijfers van die meting op via campaign_risk_summary.
-- Verwacht: rol = authenticated, ingelogd_als gevuld, uitkomst = ok.
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
select set_config('loep.vreemde_meting', coalesce((
         select c.id::text
         from public.campaigns c
         join public.organizations o on o.id = c.organization_id
         join public.respondents r on r.campaign_id = c.id
         join public.survey_responses sr on sr.respondent_id = r.id
         where o.slug <> 'loep-testklant'
           and not exists (select 1 from public.org_members m2
                           where m2.org_id = c.organization_id
                             and m2.user_id = auth.uid())
         group by c.id
         order by count(*) desc, c.id
         limit 1), ''), true);
set local role authenticated;
select current_user as rol, auth.uid() as ingelogd_als,
       coalesce(nullif(current_setting('loep.vreemde_meting', true), ''),
                'geen andere meting met antwoorden gevonden') as vreemde_meting,
       rs.avg_risk_score as vreemd_gemiddelde_moet_leeg_zijn,
       rs.band_high as vreemd_hoog_moet_0_zijn,
       rs.band_medium as vreemd_midden_moet_0_zijn,
       rs.band_low as vreemd_laag_moet_0_zijn,
       case
         when auth.uid() is null or current_user <> 'authenticated'
           then 'niet getoetst: niet ingelogd als klant-owner'
         when nullif(current_setting('loep.vreemde_meting', true), '') is null
           then 'niet getoetst: geen andere meting met antwoorden gevonden'
         when rs.avg_risk_score is null and rs.band_high = 0
              and rs.band_medium = 0 and rs.band_low = 0
           then 'ok'
         else 'AFWIJKING: cijfers van een andere organisatie zichtbaar'
       end as uitkomst
from (select 1) as ik
left join lateral public.campaign_risk_summary(
  nullif(current_setting('loep.vreemde_meting', true), '')::uuid) rs on true;
