# Beveiliging vóór de eerste klant: uitvoeringsverslag

Datum: 2026-10-09
Branch: `feature/beveiliging-voor-eerste-klant` (vanaf main `91ecfd14`), niet gemerged, niet gepusht.
Spec: `docs/superpowers/specs/2026-10-08-beveiliging-voor-eerste-klant.md`
Plan: `docs/superpowers/plans/2026-10-08-beveiliging-voor-eerste-klant.md`
Werkwijze: subagent-driven-development, per taak een implementer, een spec-review en een codekwaliteitsreview; bevindingen terug naar dezelfde implementer tot beide reviews akkoord waren. Daarna één eindreview over de hele branch.

## Samenvatting

1. **Risicoscore per respondent is dicht.** `campaign_stats` blijft een view met de rechten van de aanroeper, maar haalt de vier risicokolommen voortaan uit de nieuwe security-definer-functie `campaign_risk_summary(uuid)`, die zelf de tenancy afdwingt. Daardoor kon het kolomrecht van `authenticated` op `survey_responses` volledig weg. In een wegwerp-Postgres met het echte schema bewezen: een klant krijgt op elke kolom van `survey_responses` een permissiefout, en `campaign_stats` geeft voor elke rol byte-gelijke uitvoer voor en na de migratie.
2. **Een mislukte rapportgeneratie wordt gezien.** Elke 500 bij rapportgeneratie komt als precies één Sentry-event met foutmelding en stacktrace, getagd met `campaign_id`, `scan_type` en `report_route`, zonder lokale variabelen, headers, querystring, request-body of tekst van log-breadcrumbs. De klant krijgt een vaste zin ("Het rapport kon niet worden gemaakt. Loep heeft hier automatisch een melding van gekregen ..."), en de downloadknop toont die als hoofdmelding. Een 410 na opschoning en een 422 houden hun eigen eerlijke melding en worden niet gemeld.

## Twee keuzes die afwijken van de spec, met reden

- **Geen security-definer-view, maar een security-invoker-view met een security-definer-functie voor alleen de risicokolommen.** `campaign_stats` is op twee plekken een toegangspoort: `open-antwoorden/page.tsx` en `campaigns/[id]/beheer/beheer-data.ts` lezen eerst `campaign_stats` met de rechten van de gebruiker en daarna open antwoorden met de service-role. Een view die zelf tenancy nabootst en ook maar iets ruimer is dan de huidige RLS, lekt via die service-role-reads. Bovendien is productie eerder van `schema.sql` afgeweken. Met deze opzet blijven welke metingen iemand ziet en de respondenttellingen per constructie gelijk aan de huidige RLS; alleen de risico-aggregatie hangt aan de nieuwe check.
- **De spec-premisse over Sentry klopte deels niet.** `sentry-sdk` 2.69 meldt een `HTTPException(500)` wél, en een onafgehandelde exceptie ook. Gemeten op de oude code: de PDF-routes gaven de klant "Internal Server Error" en Sentry **twee** ongetagde events (één via de logging-integratie, één voor de exceptie); de segment- en HTML-routes gaven de ruwe fout aan de klant en één ongetagd event. Daarbij stuurde Sentry standaard lokale variabelen mee (in de renderer: open antwoorden en organisatienamen) en, via de 20% performance-traces, de `x-admin-token`-header (die zit niet in Sentry's eigen headerfilter).

## Per taak: wat er gebouwd is en wat de reviews vonden

### Task 1: migratie en schema-spiegel (`e8f17668`, `83534297`)
- Migratie `migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql`, gespiegeld in `supabase/schema.sql`.
- Afwijking implementer: `schema.sql` miste `campaigns.closes_at` helemaal (alleen de migratie van 17-6 voegt hem toe); idempotente `alter table ... add column if not exists` toegevoegd direct na `create table campaigns`, en de view in `schema.sql` heeft nu ook `closed_at`/`closes_at` zoals productie.
- Spec-review: akkoord; migratie byte-gelijk aan het plan, uitkomst gelijk (`survey_responses.respondent_id` is uniek, dus de tellingen in de subquery veranderen niet).
- Kwaliteitsreview: **de bypass voor service-role en directe verbinding was een denylist** (alles behalve anon/authenticated), die faalt open bij een toekomstige klantrol. Nu een allowlist: alleen `current_setting('role')` in `none`, `postgres`, `service_role`, en de JWT-rol niet anon/authenticated. Verder `rows 1`, strengere regex in de contracttest, `closes_at` naar de juiste plek. Herreview akkoord.

### Task 2: gedragsscript (`a71250ce`, `7a204862`)
- `migrations/checks/2026_10_08_campaign_stats_gedrag.sql`: laadt het echte `schema.sql` (twee rondes, de tweede foutloos), zet de productietoestand van vandaag terug (oude view van 17-6, functie weg, kolomrecht van 13-7), seedt twee organisaties, neemt per rol een JSON-snapshot, draait de echte migratie als `postgres` en vergelijkt byte voor byte. 18 gevallen plus extra's, 46 controles.
- Afwijkingen: anon kreeg al vóór de migratie een permissiefout op `campaign_stats` (sinds 13-7 heeft anon geen rechten op de onderliggende tabellen), geen lege lijst; organisaties geseed met de claims van hun eigen owner, zodat de trigger precies de bedoelde lidmaatschappen maakt.
- Mutatieproeven (kopieën, niet gecommit): migratie zonder de `revoke` op `survey_responses` faalt op geval 7; bypass `true` faalt op geval 11; afronding op 1 decimaal faalt op geval 5; de oude denylist faalt op geval 17.
- Kwaliteitsreview: **een tweede run in dezelfde database voerde eerst de "oude toestand"-stap uit en heropende zo het lek** voordat hij op een dubbele sleutel faalde (en op een echte database zou hij nepdata seeden). Nu weigert het script te starten zodra er gebruikers of organisaties zijn. Verder kreeg een NULL in een psql-variabele een Engelse syntaxfout in plaats van de Nederlandse afwijkingsmelding; alle waarden lopen nu via een aggregaat met fallback. Herreview akkoord, beide fixes bewezen.

### Task 3: controlequery voor Lars (`2cf4d929`, `521491df`, `4380005e`, `4eb285c8`)
- `migrations/checks/2026_10_08_campaign_stats_controle.sql`, alleen-lezen, blokken A (vingerafdruk voor en na), B (13 rechten- en eigenschapsregels, ok of AFWIJKING), C0 (testklantcijfers als postgres), C1 (zelfde als klant-owner), C2 (`survey_responses` moet "permission denied" geven), C3 (functie op een meting van een andere organisatie moet leeg/0 geven).
- Getest in een container én via een lokale kopie van de query-service achter de SQL Editor (`postgres-meta`): die toont alleen het laatste resultaat met rijen, dus elk blok draait los.
- Spec-review: **de owner-lookup kon de Loep-operator kiezen** (de operator is ook owner van de testklant en van elke organisatie die hij aanmaakt); C1 toonde dan metingen van andere organisaties, wat op een lek lijkt. Nu worden operators uitgesloten.
- Kwaliteitsreview: **C2 liet de sessie in een afgebroken transactie** (de rollback na de verwachte fout wordt overgeslagen); nu zonder `begin`/`rollback`, elk blok is één impliciete transactie. Verder: alleen "for table survey_responses" telt als goede fout; Blok B controleert nu ook de service-role; C0 moet een gemiddelde tonen, anders bewijst C0 = C1 niets; instructie bij een AFWIJKING; C3 zegt "niet getoetst" als er geen klant-owner is in plaats van een valse "ok". Herreview akkoord.

### Task 4: `backend/observability.py` (`ebd7fa45`, `7f6b26af`, `abdb7779`)
- Sentry-init zonder persoonsgegevens, lokale variabelen of request-body; `scrub_event` voor errors én transacties houdt van het request alleen methode en url, vervangt het pad door de routesjabloon (of `/<onbekende route>`), haalt de tekst uit niet-query-breadcrumbs en houdt van een log-event alleen het sjabloon. `ReportGenerationFailed` (bewust zonder `status_code`), `report_generation_failed()` met tags. `requirements.txt`: `sentry-sdk[fastapi]>=2.0.0,<3`.
- Afwijking implementer: de helper logt naar `loep.report.gemeld`, die voor Sentry is gedempt; anders maakt de logging-integratie er een tweede, ongetagd event van (bewezen: demping uit geeft 2 events).
- Kwaliteitsreview: **traces gingen buiten `before_send` om en stuurden `x-admin-token`, querystring en tokens in het pad**; log-breadcrumbs droegen geformatteerde regels met organisatienaam en e-mail (`main.py` contactaanvraag) mee naar latere events. Beide dicht, met tests die geheimen via concatenatie bouwen (Sentry stuurt broncoderegels mee, een letterlijk geheim in de test zou vals alarm geven). Herreview akkoord; twee restpunten (onbekende route, volledige tekst van ERROR-logregels) daarna ook dicht.

### Task 5: rapportroutes (`9f9623bd`, `4bd106ef`)
- Exception-handler voor `ReportGenerationFailed` (500 met vaste tekst); `_pdf_of_410` meldt via de helper, laat databasefouten door naar de bestaande 503-handlers; segmentexport, HTML-preview en HTML-PDF ook via de helper; `_report_log.error` in `_generate_report_pdf` naar `warning` (anders een tweede ongetagd event).
- Spec-review en kwaliteitsreview: **een bedrijfsregel van de legacy-renderer (Loep Cultuurbeeld nog open, te weinig antwoorden, geen geldige scores) werd een gemelde 500 met "Loep heeft een melding gekregen"**: vals alarm en een misleidende klant. Opgelost met een eigen `ReportNotAvailable(ValueError)` in `backend/report_errors.py` op precies die drie plekken in `report.py`, die `_pdf_of_410` omzet in een 422. Bewust géén brede `except ValueError`: die zou echte renderbugs verbergen en ruwe datawaarden (zoals "could not convert string to float: <waarde>") naar de klant sturen. Extra tests: vastgepinde mutatie (`status_code = 500` op de exceptie geeft 2 events, dus de "precies één"-tests meten echt iets) en een databasefout geeft 503 zonder event. Herreview akkoord.

### Task 6: rapportproxy (`5ead6281`, `e9ffa8fa`, `2cd9713a`)
- `frontend/app/api/campaigns/[id]/report/route.ts`: elke fout wordt gelogd (alleen campagne-id en foutmelding, nooit sleutel of campagnenaam; de frontend-Sentry staat uit, dus dit landt in de Vercel-logs); een onbereikbare backend geeft een nette 502.
- Kwaliteitsreview: **Node's fetch meldt alleen "fetch failed"**, de echte oorzaak (ECONNREFUSED enzovoort) zit in `error.cause`; nu gelogd. **Een verkeerd ingestelde `BACKEND_ADMIN_TOKEN` gaf een 401/403 zonder enige log** (zelfde patroon als 25-9 tot 4-10); nu wordt elke niet-ok status behalve 410/422 gelogd, plus een waarschuwing bij terugval op de interne route. Herreview akkoord.

### Task 7: downloadknop (`35b4de33`, `0d1f7465`, `c2f71105`, `35308fcc`)
- `resolveDownloadError(status, rawDetail)` in `frontend/lib/report-download-error.ts` bundelt alle takken van de knop: een herkende backendzin (410, 422, 500) wordt de hoofdmelding zonder technische regel; al het andere houdt de zin per statuscode plus de technische regel (Fail Loud).
- Spec-review: **een 422 kwam bij de knop binnen als "fout 422, probeer het later opnieuw"** met de eerlijke zin pas als technische voetnoot. Nu wordt een 422 alleen als hoofdmelding getoond als hij uit een JSON-`detail` komt, geen HTML is, geen regeleinde heeft en kort is; anders de nieuwe algemene 422-zin zonder "probeer opnieuw".
- Kwaliteitsreview: broncode-pins vervangen door een gedragstabel (20 gevallen); pariteitstest leest de exacte zinnen uit `backend/observability.py`. Herreview akkoord.

### Eindreview over de hele branch
Klaar voor verificatie, geen kritieke of belangrijke punten. Restpunten staan onder "Follow-ups".

## Lezers van `campaign_stats` en `survey_responses`, en hoe gelijke uitvoer is bewezen

| Bestand | Client | Leest | Waarom gelijk |
|---|---|---|---|
| `app/(dashboard)/dashboard/page.tsx` | gebruiker (RLS) | `campaign_stats` | rol lid/owner byte-gelijk bewezen (gedragsscript geval 5) |
| `app/(dashboard)/dashboard/dashboard-actions.ts` | gebruiker | `campaign_stats` | idem |
| `app/(dashboard)/layout.tsx` | gebruiker | `campaign_stats` | idem |
| `app/(dashboard)/reports/page.tsx` | gebruiker | `campaign_stats` | idem |
| `app/(dashboard)/campaigns/[id]/page.tsx` | gebruiker | `campaign_stats` | idem |
| `app/(dashboard)/campaigns/[id]/decision-actions.ts` | gebruiker | `campaign_stats` | idem |
| `app/(dashboard)/campaigns/[id]/open-antwoorden/page.tsx` | gebruiker voor `campaign_stats` (toegangspoort), service-role voor `survey_responses` | beide | poort: zichtbaarheid onveranderd want view blijft security_invoker; service-role ziet alles voor en na (geval 5 service_role, geval 8) |
| `app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts` | idem (poort met gebruiker, `survey_responses` met service-role) | beide | idem |
| `app/(dashboard)/beheer/page.tsx`, `beheer/campagnes/page.tsx`, `beheer/get-beheer-page-data.ts`, `beheer/klantlearnings/page.tsx` | gebruiker (operator) | `campaign_stats` | operator als `authenticated` byte-gelijk bewezen (ziet via de `campaigns`-policy alleen organisaties waar hij lid is, voor en na) |
| `app/(dashboard)/action-center/page.tsx`, `lib/action-center-page-data.ts` | service-role | `campaign_stats` | service-role byte-gelijk (geval 5) |
| `app/api/internal/progress-nudge/route.ts`, `lib/action-center-manager-results-notifications.ts` | service-role | `campaign_stats` | idem |
| `app/api/organizations/[id]/route.ts` | service-role | `survey_responses` (delete) | service-role houdt alle rechten (geval 8) |
| Backend (`backend/*.py`) | directe databaseverbinding (SQLAlchemy) | `survey_responses` via het ORM; de view niet | directe verbinding (rol `none`) en `SET ROLE postgres` byte-gelijk (geval 18) |

Geen enkele lezer gebruikt `anon`. Vóór de migratie kreeg anon al een permissiefout op `campaign_stats`; nu komt die van de view zelf.

**Snapshot lid A (owner), voor en na, uit de eindrun op de laatste commit (byte-gelijk):**

```
[{"campaign_id":"33333333-0000-0000-0000-0000000000a1","campaign_name":"A1 behoud","scan_type":"retention","organization_id":"22222222-0000-0000-0000-00000000000a","is_active":true,"created_at":"2026-10-01T09:00:00+00:00","closed_at":null,"closes_at":null,"total_invited":6,"total_completed":5,"completion_rate_pct":83.3,"avg_risk_score":5.50,"band_high":2,"band_medium":2,"band_low":1},
 {"campaign_id":"33333333-0000-0000-0000-0000000000a2","campaign_name":"A2 vertrek","scan_type":"exit","organization_id":"22222222-0000-0000-0000-00000000000a","is_active":true,"created_at":"2026-10-02T09:00:00+00:00","closed_at":null,"closes_at":null,"total_invited":0,"total_completed":0,"completion_rate_pct":null,"avg_risk_score":null,"band_high":0,"band_medium":0,"band_low":0}]
```

Eindrun gedragsscript (verse container, laatste commit): schema tweede ronde exit 0, script exit 0, 46 controles `ok`, slotregel `ALLE GEVALLEN ZOALS VERWACHT`.

## Faalset-vergelijking

| Gate | Baseline (main `91ecfd14`) | Eindstand branch |
|---|---|---|
| Backend `pytest tests` | 25 falend / 1816 geslaagd / 11 overgeslagen | 24 falend / 1858 geslaagd / 11 overgeslagen; enige verschil met de baseline-faalset: `test_culture_assessment_route_contract.py::test_culture_assessment_report_generation_requires_closed_baseline` slaagt nu (de 422 voor een nog open Cultuurbeeld-meting, Task 5); geen nieuwe failures |
| Frontend `tsc --noEmit` | 131 | 131 |
| Frontend `vitest run` | 47 falend / 1844 geslaagd | 47 falend / 1884 geslaagd, faalset per testnaam identiek |
| Frontend `npm run build` (dummy-env) | n.v.t. | groen |

## Wat Lars moet doen

1. **Migratie draaien** (`migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql`) in Supabase Dashboard, SQL Editor, met de rol op `postgres`:
   - Eerst **Blok A** van `migrations/checks/2026_10_08_campaign_stats_controle.sql` draaien en de vingerafdruk noteren.
   - Dan de migratie.
   - Direct daarna **Blok A** opnieuw (zelfde vingerafdruk), **Blok B** (alle 13 regels `ok`), en **C0, C1, C2, C3** los na elkaar, met de verwachting zoals in de kop van het bestand.
   - Bij een AFWIJKING: stoppen, niets zelf terugdraaien (dat opent het lek weer), screenshot naar Claude.
2. **Railway redeployen** voor de backendwijzigingen (Sentry-init, rapportroutes, `report_errors.py`). Vercel deployt de frontend vanzelf na de merge.
3. **Volgorde: de migratie mag vóór of na de Railway-deploy, maar draai hem zo snel mogelijk na de merge.** Reden: geen enkele code leest `survey_responses` met klantrechten en de view houdt dezelfde kolommen, dus oude en nieuwe code werken allebei met de oude en de nieuwe database (bewezen voor de database-kant in het gedragsscript; voor de code-kant door de eindreview nagelopen). Tot de migratie draait, is het lek open; de Sentry-wijziging staat daar los van.
4. Na de merge en de migratie toetst de hoofdsessie op productie met de testklant: een klantsessie kan via PostgREST geen `survey_responses` meer lezen, het dashboard toont dezelfde aantallen.

## Restrisico's en follow-ups (niet gedaan, bewust)

- **Afleiden per respondent via momentopnamen.** Een klant ziet de bandtellingen en het gemiddelde per meting, en kan `respondents.completed_at` nog lezen. Wie na elke nieuwe inzending `campaign_stats` opvraagt, ziet welke band met 1 steeg; bij precies één inzending is het gemiddelde de score van die ene persoon. Dichtzetten (bijvoorbeeld een minimum aantal antwoorden in de functie) verandert wat het dashboard toont en hoort dus in een eigen productbesluit.
- **Exceptietekst gaat ongefilterd naar Sentry.** Lokale variabelen, request en breadcrumbs zijn schoon, maar de tekst van de exceptie zelf niet. De huidige meldingen in `report_html.py` en `report.py` bevatten alleen id's, aantallen en interne namen. Afspraak: nooit organisatie- of respondenttekst in een exceptiebericht. Mechanische borging kan later (alleen het exceptietype doorgeven).
- **SQLAlchemy `hide_parameters=True`** in `backend/database.py`: een `StatementError` buiten het rapportpad (bijvoorbeeld bij survey-submit) zet de parameters in de fouttekst.
- **Segmentexport en de twee admin-HTML-routes** maken nog elke `ValueError` tot een 422 met de ruwe tekst (ook echte bugs, die dan Sentry niet bereiken). Fix: daar alleen `ReportNotAvailable` vangen en de bedrijfsregels in `report.py` (regels rond 6261-6289) omzetten. De segmentexport is vandaag nergens aangezet.
- **Ruwe backendzinnen bij een 403/503 van de interne route** ("Admin-token ontbreekt of is ongeldig.") verschijnen bij de klant als technische regel. Nu wel gelogd; de klanttekst kan later netter.
- **Twee kale links** (`beheer/campagnes/page.tsx`, operator-scherm, en `dashboard/cockpit-index.ts`, alleen in tests gebruikt) tonen bij een fout de JSON in plaats van de nette melding. Geen klantscherm.
- **Dubbele generatie bij een netwerkfout halverwege** de eerste poging: de proxy probeert de interne route nog eens; dan kunnen er twee getagde events komen. Zeldzaam.
- **Vervolgpunt uit het gedragsscript:** de operator ziet als `authenticated` in `campaign_stats` alleen organisaties waar hij lid is (de `campaigns`-policy kent geen operatorclausule). Onveranderd door deze ronde.
- Lege map `.worktrees/beveiliging` blijft na verwijderen mogelijk achter door een Windows-filelock (bekend patroon).

## Status

Alle taken gecommit, werkboom schoon. **De branch is klaar voor verificatie door de hoofdsessie (CEO sparring prompt).**
