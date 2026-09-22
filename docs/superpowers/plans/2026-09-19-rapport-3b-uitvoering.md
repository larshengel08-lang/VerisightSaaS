# Plan 3b: uitvoeringsverslag

Plan: `docs/superpowers/plans/2026-09-19-rapport-3b-werkvragen-en-besluit.md`. Spec: `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md`, onderdeel 3 (par. 6) en 4 (par. 7); alle afwijkingen staan daar onder "Afwijkingen bij plan 3b". Content-spec: `docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md`. Branch `feature/rapport-3b`, worktree `.worktrees/rapport-3b`, vanaf main `5dc757be`. Uitgevoerd 20 september 2026 via subagent-driven-development: per taak één implementer, daarna een spec-compliance-review en een codekwaliteitsreview, met herreviews tot beide akkoord waren. **Niet gemerged, niet gepusht.**

**Taak 0 tot en met 12 zijn af. Taak 13 en 15 wachten op de review van Lars** (zie "Wat op een poort wacht"), Taak 14 is een handmatige stap op productie.

## Baselines

| | Voor (`5dc757be`) | Na (`27cc6b4a`) |
|---|---|---|
| Backend | 25 failed / 1413 passed / 11 skipped | 25 failed / 1524 passed / 11 skipped |
| Backend-faalset | `docs/superpowers/plans/plan3b-baseline-failset.txt` | identiek per testnaam (`diff` leeg) |
| Frontend `tsc --noEmit` | 133 | 133 |
| Frontend `vitest run` | 59 failed / 1563 tests | 59 failed / 1629 tests, faalset identiek per testnaam (`diff` leeg) |
| Python 3.11-guard | groen | groen (venv 3.11.9, gelijk aan Railway) |
| Nieuwe tests | | +111 backend, +66 frontend |

De gate is per testnaam, niet per aantal; beide diffs zijn leeg. Na elke backendtaak is het faalset-commando uit Taak 0 gedraaid, telkens met `GEEN_REGRESSIES`.

## PDF-validatie in het productie-image

Gemeten met `scripts/render_in_image.py` in `loep-backend:test` (`Dockerfile`, WeasyPrint 70.0), op alle 21 stresstestscenario's plus de drie voorbeeldrapporten. `docs/stresstest/` is gitignored en is vóór elke meting opnieuw gegenereerd.

| | Nulmeting (Taak 0) | Eindmeting (HEAD) |
|---|---|---|
| Bestanden | 24 | 24 |
| Met bevindingen | 4 | **3** |
| WeasyPrint-waarschuwingen | 0 | 0 |
| Em-dashes en en-dashes in de tekstlaag | 0 | 0 |
| `p02-op-een-a4` | geen bevinding | geen bevinding |
| `besluit-op-een-a4` | bestond nog niet | geen bevinding, ook niet bij een maximaal ingevuld besluit |

De drie resterende bevindingen zijn alle drie `paginavulling` en alle drie pre-existent, met exact dezelfde percentages als vóór deze branch: 01 (pagina 7, 36%), 09 (pagina 7, 26%), 19 (pagina 7, 36%). Twee bevindingen zijn gesloten: `voorbeeldrapport_loep` (appendixstaart, 36%) via de uitzondering uit Taak 8, en scenario 14 (35%) via de fix in `b61e0f22`. Er is geen enkel bestand bijgekomen.

`check_pdf_report.py` geeft dus **niet** op alle 24 bestanden OK: op 21 wel, op 01, 09 en 19 niet, om een reden die al vóór plan 3b bestond en die in de spec met metingen is verantwoord.

## Matrix "Na plan 3b"

**Niet gemaakt, bewust.** De matrix hoort bij Taak 15 en die staat achter dezelfde poort als Taak 13: zolang `WORK_QUESTIONS` leeg is, toont het blok "Zo maak je er een besluit van" twee van de drie vragen. Q3 ("weet ik als MT-lid wat ik nu moet doen?") is precies de vraag die de ontbrekende derde rij, de vertaalvraag, moet beantwoorden. Een Q3-score meten op een feature die nog een derde mist, zou een getal opleveren dat na Taak 13 meteen ongeldig is, en dat is precies het soort schijnzekerheid dat dit rapport niet hoort te produceren. De matrix wordt gevuld zodra de content erin staat.

Wat er nu wel staat ten opzichte van vóór de branch: elke gespreksagenda draagt per gesprekspunt een herkenningsvraag met noemer en een besluitvraag, er is een invulbaar A4 "Besluit van het MT" vóór de appendix, en dat besluit kan in het dashboard worden vastgelegd waarna het rapport het voordrukt.

## Wat er is gebouwd, per taak

| Taak | Onderwerp | Commit |
|---|---|---|
| 0 | Worktree, drie baselines, productie-image, `render_in_image.py` | `f15f9440` |
| 1 | Migratie `campaign_decisions` met RLS + `previous_campaign_id`, SQL-guard | `546ddcd3`, `f6ce8b4e` |
| 2 | Model `CampaignDecision`, `load_decision`, `build_report_data["decision"]` | `5c0c5a51`, `ce5305b1` |
| 3 | `_nl_tijd` via `ZoneInfo`, één bron voor "Nederlandse dag" | `8a0d7300` |
| 4 | Datastructuur en keuzefunctie van de vertaalvraag (content leeg) | `6ad4ff4e`, `506aca4a` |
| 5 | Blok "Zo maak je er een besluit van" + de vaste regel op de afdelingspagina | `32de0ff8`, `6b3dfe7b` |
| 6 | Besluitpagina (leeg), "Uit de bespreking" weg, leidraad rij 5 | `a7a22abf` |
| 7 | Besluitpagina drukt een vastgelegd besluit voor | `f5508b02`, `36770c43` |
| 8 | `check_pdf_report.py`: `besluit-op-een-a4` + uitzondering appendixstaart | `5e3f407a` |
| 9 | Dunne verdiepingsblokken laten doorlopen (kern niet gehaald, zie hieronder) | `5f3f01d4` |
| 10 | Frontend: type, normalisatie, validatie | `b9ef153f`, `596330e0` |
| 11 | Frontend: server action `saveCampaignDecisionAction` | `abdc782f` |
| 12 | Frontend: blok "Besluit vastleggen" op de campagnedetailpagina | `297a3e43` |
| extra | Scenario 14 niet meer alleen op een vel; label gelijkgetrokken | `b61e0f22`, `27cc6b4a` |

21 commits in totaal.

## Wat de reviews vonden

Elke taak kreeg twee reviews. Dit zijn de bevindingen die echt iets hebben voorkomen, niet de stilistische:

1. **De H7-regel deed een onware belofte (Critical, Taak 5).** De regel op de afdelingspagina ("het rapport toont die alleen organisatiebreed") hing aan `bool(deep_agg)`, wat alleen zegt dat de verdieping in deze meting actief was. De reviewer reproduceerde een rapport met drie onderwerpen op 3, 4 en 0 antwoorden: geen enkel onderwerp haalde de staffel, er stond nergens een toelichting, en de regel stond er toch. Nu volgt de vlag wat er werkelijk gerenderd wordt (`_toont_toelichtingen`). Geen staffel verlaagd.
2. **Een volledig ingevuld besluit paste niet op één A4 (Important, Taak 7).** Lege velden hebben een vaste regelbegroting, een gevuld veld rendert onbegrensd. Gemeten in het productie-image: met elk tekstveld op de frontendlimiet (600 tekens) liep de besluitpagina in alle drie de producten over een tweede vel, waarmee de belofte "los te printen" stil brak. Opgelost met een zichtbaar aangekondigde begrenzing (`BESLUIT_TEKST_MAX = 300`, `BESLUIT_INGEKORT`), niet met een stille afkap en niet door een regel te verzwakken. De knik lag bij 470 tot 480 tekens; 300 is de marge voor natuurlijke tekst.
3. **Stille terugval naast een buurfunctie die bewust hard faalt (Important, Taak 5).** `_werkvragen_block` deed `direction_agg.get(fk)` terwijl `_wat_moet_gebeuren_block` op dezelfde rijen en sleutels bewust direct indexeert, met een docstring die uitlegt waarom. Nu consistent.
4. **`normalizeDecisionInput` crashte op `null`, `validateDecisionInput` op een ontbrekend veld (Important, Taak 10).** Beide worden server-side op onbetrouwbare formulierinvoer aangeroepen; een leeg of kapot request body werd zo een 500 in plaats van een nette melding. Gefixt en met tests vastgelegd die zonder de fix aantoonbaar falen.
5. **De logregel bij een onleesbare besluitentabel stelde de oorzaak vast (Important, Taak 2).** "Is de migratie gedraaid?" was de enige genoemde verklaring, terwijl dezelfde `except` ook een ontbrekende kolom of een verbroken verbinding vangt, en de echte foutmelding werd niet gelogd. Nu noemt de regel de foutklasse én de melding en presenteert de migratie als mogelijke, niet als enige oorzaak.
6. **Twee guardtests konden niet falen (Minor, Taak 1 en 4).** Een test op de org-trigger controleerde de naam maar niet dat hij op `insert or update` staat; een test op een onbekend onderwerp accepteerde elke `KeyError`, ook een nietszeggende. Beide aangescherpt en bewezen falend zonder de fix.
7. **Een ongeteste structurele tak (Important, Taak 7).** Alle tests zetten `feedback_plan` leeg, waardoor de tak die de driekoloms tabel vervangt door één tekstblok nooit draaide. Nu gedekt.
8. **Labelbreuk tussen de lagen (Important, eindreview).** Het dashboard noemde het eerste veld "Onderwerp", de PDF "Startpunt", voor hetzelfde veld en dezelfde lezer. Het dashboard volgt nu de PDF.

Een implementer meldde daarnaast zelf een fout in het plan: de wiringtest combineerde `n_total=13` met een fixture waarvan de laagste-onderwerptelling 17 is, wat rekenkundig onmogelijk is en door `_direction_totals_line` terecht wordt geweigerd. De fixture is verrijkt, geen gate verzwakt.

## Afwijkingen van het plan

Alle afwijkingen staan met onderbouwing in de spec onder "Afwijkingen bij plan 3b". Samengevat:

- **Het werkvragenblok staat binnen `.agenda-slot`** in plaats van ervoor (Taak 6). Daarbuiten bleef het navy gespreksopenervlak in acht van de 21 scenario's alleen op een vel achter, op 11 tot 13%.
- **`.verd-los .card { break-before: avoid; }`** is toegevoegd aan de letterlijke plan-CSS (Taak 9), omdat die zonder deze regel bij drie eerder passerende scenario's een kaart van zijn blok loskoppelde.
- **Begrensde weergave van lange MT-velden** op de besluitpagina (Taak 7-opvolging), met een zichtbare melding. De opgeslagen waarde en het dashboard zijn ongewijzigd.
- **`.dir-block` verliest `break-inside: avoid`**, alleen de kaartentabel houdt het, plus krappere regelafstand in de Anders-lijst (fix scenario 14).
- **Taak 9 heeft zijn kern niet gehaald.** De twee toegestane ladder-tredes zijn geprobeerd en gemeten, en allebei teruggedraaid omdat ze meer scenario's braken dan ze fixten (trede 1: 6 bevindingen, trede 2: 8, tegen 4 toen). Scenario 01, 09 en 19 staan op exact dezelfde percentages als vóór de branch. Root cause, geverifieerd door de reviewer in de generator: die drie tonen een korte maar niet-lege "te weinig antwoorden"-terugval, dus `triggered > 0`, en vallen daarmee buiten de plan-definitie van "dun". De gebouwde infrastructuur is geen dode code: in vier andere scenario's (02, 09, 13, 15) wordt hij wel geactiveerd en voorkomt hij daar een regressie.

## Wat op een poort wacht

**Taak 13 (GATE) is niet begonnen.** Bovenaan `docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md` staat nog `Status: concept, wacht op review Lars`. Zolang daar geen regel staat die met `Status: akkoord` begint, worden de 72 vertaalvragen en de verdeeld-zinnen niet ingevuld; er is ook geen enkele vraagtekst verzonnen. `WORK_QUESTIONS` en `WORK_QUESTION_VARIANTS` zijn lege dicts, `work_questions_ready()` geeft `False`, en het blok toont daardoor twee rijen (Herkennen en Besluiten) in plaats van drie. De structuur, de keuzefunctie per richtingstaat, de Fail-Loud-paden en de guardtests staan klaar; er hoeft alleen content in. Een half gevulde set kan niet stil doorglippen: een ontbrekende vraag bij een bestaande route geeft een `KeyError` met een duidelijke melding, niet een lege regel.

**Taak 15 wacht op Taak 13.** De eindverificatie (21 scenario's opnieuw beoordelen, de matrix "Na plan 3b", de leesronde light, het regenereren van de voorbeeldrapporten en de browsercheck) hoort na de content, anders publiceren we voorbeeldrapporten zonder vertaalvragen. Wat wel al is gedaan en niet hoeft te wachten: de volledige meting in het productie-image (hierboven) en de drie faalset-gates.

**Taak 14 (WACHTSTAP) is een handmatige stap voor Lars,** zie hieronder. De migratie is niet op productie gedraaid; dat doet de agent niet.

## Taak 14: de migratie, kopieerklaar

Draaien in Supabase Dashboard, SQL Editor. Additief en idempotent: opnieuw draaien verandert niets, en de live backend (nog zonder plan 3b) merkt er niets van. Bron: `migrations/2026_09_19_add_campaign_decisions.sql`.

```sql
create table if not exists public.campaign_decisions (
  campaign_id       uuid primary key references public.campaigns(id) on delete cascade,
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  decided_at        date,
  primary_topic     text not null default '',
  primary_action    text not null default '',
  owner             text not null default '',
  follow_up_date    date,
  secondary_topic   text not null default '',
  secondary_action  text not null default '',
  feedback_plan     text not null default '',
  success_criterion text not null default '',
  recorded_by       uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists campaign_decisions_org_idx
  on public.campaign_decisions (organization_id);

create or replace function public.campaign_decisions_org_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  campaign_org uuid;
begin
  select c.organization_id into campaign_org from public.campaigns c where c.id = new.campaign_id;
  if campaign_org is null or campaign_org <> new.organization_id then
    raise exception 'campaign_decisions: organisatie van het besluit wijkt af van die van de meting';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists campaign_decisions_org_guard_trg on public.campaign_decisions;
create trigger campaign_decisions_org_guard_trg
  before insert or update on public.campaign_decisions
  for each row execute function public.campaign_decisions_org_guard();

alter table public.campaign_decisions enable row level security;

drop policy if exists "org_members_can_select_decisions" on public.campaign_decisions;
create policy "org_members_can_select_decisions"
  on public.campaign_decisions for select
  using (public.is_org_member(organization_id) or public.is_verisight_admin_user());

drop policy if exists "org_owners_can_insert_decisions" on public.campaign_decisions;
create policy "org_owners_can_insert_decisions"
  on public.campaign_decisions for insert
  with check (public.is_org_owner(organization_id) or public.is_verisight_admin_user());

drop policy if exists "org_owners_can_update_decisions" on public.campaign_decisions;
create policy "org_owners_can_update_decisions"
  on public.campaign_decisions for update
  using (public.is_org_owner(organization_id) or public.is_verisight_admin_user())
  with check (public.is_org_owner(organization_id) or public.is_verisight_admin_user());

revoke delete on public.campaign_decisions from authenticated;
revoke all on public.campaign_decisions from anon;

alter table public.campaigns
  add column if not exists previous_campaign_id uuid
  references public.campaigns(id) on delete set null;
```

Controlequery daarna, verwacht `true | true | 3 | true`:

```sql
select
  to_regclass('public.campaign_decisions') is not null as tabel_bestaat,
  (select relrowsecurity from pg_class where oid = 'public.campaign_decisions'::regclass) as rls_aan,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'campaign_decisions') as policies,
  exists (select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'campaigns'
            and column_name = 'previous_campaign_id') as kolom_bestaat;
```

`previous_campaign_id` blijft tot plan 3c ongebruikt en staat bewust **niet** op het ORM-model: een kolom in het model komt in elke `SELECT` op `campaigns`, en een niet-gedraaide migratie legde op 13 september elk rapport plat. De kolom zit nu alleen in de migratie, zodat er maar één keer SQL gedraaid hoeft te worden.

## Wat Lars moet beslissen

1. **De 72 vertaalvragen en de verdeeld-zinnen** (`docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md`): per rij akkoord of herschrijven, plus de twijfels in sectie 4 en het Vertrek-patroon. Zet daarna bovenaan `Status: akkoord Lars, <datum>`. Dit is de poort voor Taak 13 en 15.
2. **Scenario 01, 09 en 19 blijven onder de vullingsregel** (36%, 26%, 36%), net als vóór deze branch. Een structurele oplossing vraagt een ander mechanisme dan een breekregel op het verdiepingsblok: het volgende hoofdstuk laten meestromen in plaats van zijn vaste paginabreuk, of meerdere korte "te weinig antwoorden"-blokken in de datalaag samenvoegen. Beide zijn een groter herontwerp dan Taak 9 beoogde. Wil je dat als eigen taak, of accepteer je drie pagina's op een derde gevuld?
3. **De begrenzing van lange MT-velden op 300 tekens in de PDF**, met de regel "Dit vel toont het begin van lange antwoorden; het volledige besluit staat in het dashboard." Akkoord, of liever een andere grens of formulering?
4. **De aannames die het plan noemt en die zo zijn gebouwd**: `plurality` krijgt de route-eigen vraag; geen vertaalvraag bij `none_needed`, `too_few` en een verdeelde richting zonder twee inhoudelijke routes; de terugval van de herkenningsvraag noemt de score in plaats van "zo laag"; de voetregel van de besluitpagina belooft tot plan 3c niets over de vervolgmeting; de appendixstaart is uitgezonderd van de vullingsregel; "Wat dit rapport niet doet" uit plan 3a blijft staan; alleen de eigenaar en de operator schrijven een besluit.
5. **De migratie draaien** (Taak 14), vóór de browsercheck en vóór de Railway-redeploy na de merge.

## Na merge

Railway-redeploy is nodig: alle rapportwijzigingen zitten in Python. Vercel deployt de frontend vanzelf. De migratie moet er vóór staan, anders meldt de besluitpagina bij elk rapport dat het besluit niet te lezen was en werkt het dashboardblok niet, allebei zichtbaar en zonder dat er iets omvalt.

## Opruimwerk dat deze branch heeft achtergelaten

- `.fill-steps .step`, `.fill-steps .step-sublbl` en `.fill-steps .step-fill-hint` in `backend/report_css.py` hebben geen producent meer.
- `review_when` is een ongebruikte parameter geworden in `_prioriteringsraster` en `_eerste_managementspoor`; `_playbook_card` en `_step_cards` hadden al nul aanroepers en dragen nog "tijdens de bespreking"-taal. Ze renderen nergens.
- `.bl-tekst` zet geen `white-space: pre-wrap`, dus regeleinden die het MT in een tekstvak typt, worden in de PDF één alinea. Pre-existent gedrag van vrije tekst, nu voor het eerst zichtbaar.
