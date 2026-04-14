# RETENTIESCAN_LIVE_TEST_PLAN.md

## 1. Summary

Dit bestand is de actuele source of truth voor de uitgevoerde live test van RetentieScan per 14 april 2026.

Hoofduitkomst van de uitgevoerde checks:

- RetentieScan is publiek zichtbaar en commercieel consistent genoeg als complementair product naast ExitScan.
- De publieke basisroutes reageren live zoals verwacht:
  - `GET /` -> `200`
  - `GET /producten` -> `200`
  - `GET /producten/retentiescan` -> `200`
  - `GET /login` -> `200`
  - `GET /dashboard` -> `307 -> /login`
  - `GET /forgot-password` -> `200`
  - `GET /survey/complete` -> `200`
- De publieke browserflow is handmatig bevestigd op desktop en mobile:
  - homepage-CTA `Plan mijn gesprek` scrollt naar `#kennismaking`
  - RetentieScan-productpagina-CTA scrollt ook naar `#kennismaking`
  - mobile menu opent correct en bereikt zowel `Plan mijn gesprek` als `Inloggen`
  - geen horizontale overflow bevestigd op homepage, login en productpagina
- De contact- en loginflow zijn visueel bevestigd:
  - leeg contactformulier toont client-validatie
  - een echte contactsubmit via `/api/contact` is live opgeslagen met succesmelding `Verstuurd`
  - foutief wachtwoord op `/login` toont `Ongeldig e-mailadres of wachtwoord.`
  - correcte login gaat live door naar `/dashboard`
- De survey-statusketen is live nu weer gezond:
  - geldige open RetentieScan-tokens openen live met `200`
  - ongeldige token geeft live een nette `404`-statuspagina
  - verlopen token geeft live `410`
  - gesloten campaign-token geeft live `410`
  - completed token geeft live de verwachte completion-state
- De eerdere survey- en invalid-tokenblockers zijn daarmee live opgelost en herbevestigd.
- De submitketen werkt wel via de live frontendroute `POST /survey/submit`:
  - een echte submit op de dedicated RetentieScan testcampaign is succesvol opgeslagen
  - de respondent is daarna `completed`
  - stats en rapportgeneratie lezen die nieuwe response correct uit
- De live rolmatrix is nu sessie-gebaseerd bevestigd met dedicated testaccounts:
  - ingelogde gebruikers die `/login` openen krijgen `307 -> /dashboard`
  - `admin` ziet op `/dashboard` de beheer-CTA `Nieuwe campaign`
  - `member` en `viewer` zien de klantvariant zonder beheer-CTA
  - `no-access` kan wel inloggen maar ziet geen RetentieScan-campaigns op dashboard
- Campaign detail en report-proxy zijn live per rol bevestigd:
  - `admin` en `member` zien op actieve RetentieScan-campaigns `Herinnering` en `Archiveer campaign`
  - `viewer` ziet geen beheeracties, maar wel de rapportknop
  - `no-access` krijgt `404` op campaign detail en report-proxy
- RetentieScan-specifieke live lagen zijn bevestigd op de volwassen demo-campaign:
  - `Trend sinds vorige meting`
  - `Segment-specifieke playbooks`
  - `Verbetersignalen uit open antwoorden`
- De browsermatige actieflow is nu ook bevestigd:
  - `PDF-rapport` downloadt live correct voor toegestane rollen
  - `Archiveer campaign` werkt live via de UI en zet de dedicated archive-safe campaign correct dicht
  - `Herinnering` gebruikt nu live de werkende admin-route en toont geen kapotte `[object Object]`-melding meer
  - de reminderactie eindigt live nu wel op `sent: 0, failed: 2`

Leidende conclusie:

- De eerdere live blockers rond open surveys, invalid tokens en forgot-password zijn opgelost en live herbevestigd.
- De reminderketen is code- en route-technisch hersteld:
  - admin-route `POST /api/campaigns/{id}/respondents/send-invites` geeft nu `200`
  - de UI toont nu een eerlijke foutstatus in plaats van `[object Object]`
- De resterende blocker zit nu buiten de repo in de mailproviderconfig:
  - reminderroute eindigt live met `{"sent":0,"failed":2,"skipped":0}`
  - contactaanvragen worden opgeslagen, maar `contact_requests.notification_error` laat live dezelfde providerlaag zien
  - bekende fouttekst in de database: `ResendError: The send.verisight.nl domain is not verified`
- Report generation in de backend is voor RetentieScan-fixtures gezond.
- De live testuitvoering is hiermee functioneel bijna afgerond; wat nu resteert is een externe e-mailconfigfix plus live hervalidatie van reminder en contactnotificatie.

Vaste fixturebasis die nu al is klaargezet in de demo-organisatie `Bakker & Partners BV` (`508dad5e-e523-49de-9f9c-c5c3647f9c70`):

- Vorige meting / closed:
  - `9c747e71-6254-490e-a558-089cfff585c0` `RetentieScan Najaar 2025 Demo`
- Huidige volwassen demo:
  - `f0b83566-cfc6-4c07-bf6d-222ed5557296` `RetentieScan Voorjaar 2026 Demo`
- Empty:
  - `16a06969-cb27-486c-b6ef-a2d44fbba39a` `RetentieScan Live Test - Empty`
- Indicatief 4:
  - `16a0f284-6310-4ca8-bf90-76abd11baedf` `RetentieScan Live Test - Indicatief 4`
- Indicatief 7:
  - `f2e35e22-0ff8-46cb-9069-2f55115cc10c` `RetentieScan Live Test - Indicatief 7`
- Expired token:
  - `0d28ac61-32b2-4f36-8fb9-4c2c76e20edd` `RetentieScan Live Test - Expired Token`
- Action-safe:
  - `12c865d3-c21b-4e0c-bcb5-39e8018e0e1a` `RetentieScan Live Test - Action Safe`
- Archive-safe:
  - `ad6e2acb-42f3-49a6-b714-e27e23d08493` `RetentieScan Live Test - Archive Safe`
- Vaste live testaccounts:
  - `retentiescan-live-admin@verisight.test`
  - `retentiescan-live-member@verisight.test`
  - `retentiescan-live-viewer@verisight.test`
  - `retentiescan-live-noaccess@verisight.test`

## 2. Milestones

### Milestone 0 - Freeze Scope, Access And Fixture Basis
Dependency: none
Status: uitgevoerd

#### Tasks
- [x] Leg vast dat dit traject alleen RetentieScan dekt; ExitScan wordt alleen gebruikt als positioneringsvergelijking.
- [x] Fixeer de live basis op `https://www.verisight.nl`.
- [x] Fixeer de fixtureorganisatie en de RetentieScan campaignmatrix.
- [x] Fixeer de state-set:
  - `0 respondenten`
  - `1-4 responses`
  - `5-9 responses`
  - `10+ responses`
  - `gesloten campagne`
  - `geen toegang`
  - `trend beschikbaar`
  - `segment_deep_dive actief`
- [x] Gebruik productie voor publieke routechecks en survey-statuschecks.
- [x] Gebruik fixtures voor veilige submit-, stats-, report- en statechecks.
- [x] Fixeer de rolenset met concrete accounts:
  - `anonymous`
  - `viewer`
  - `owner/member`
  - `admin`

#### Definition of done
- [x] De scope, live basis en fixturebasis liggen vast.
- [x] Elke belangrijke RetentieScan-state heeft nu een concrete campaign.
- [x] Elke check heeft ook al een concrete rolaccount.

#### Validation
- [x] Muterende checks zijn aan een dedicated testcampaign gekoppeld.
- [x] Trend- en segmentbasis zijn aanwezig via de demo pair `Najaar 2025` + `Voorjaar 2026`.
- [x] `segment_deep_dive` staat actief op de bestaande demo pair.

#### Execution Notes
- Demo-organisatie:
  - `508dad5e-e523-49de-9f9c-c5c3647f9c70` `Bakker & Partners BV`
- Bestaande trendbasis:
  - `9c747e71-6254-490e-a558-089cfff585c0`
  - `f0b83566-cfc6-4c07-bf6d-222ed5557296`
- Nieuw aangelegde live-test fixtures:
  - empty `16a06969-cb27-486c-b6ef-a2d44fbba39a`
  - indicatief 4 `16a0f284-6310-4ca8-bf90-76abd11baedf`
  - indicatief 7 `f2e35e22-0ff8-46cb-9069-2f55115cc10c`
  - expired `0d28ac61-32b2-4f36-8fb9-4c2c76e20edd`
  - action-safe `12c865d3-c21b-4e0c-bcb5-39e8018e0e1a`
  - archive-safe `ad6e2acb-42f3-49a6-b714-e27e23d08493`
- Live testaccounts:
  - `admin` `retentiescan-live-admin@verisight.test`
  - `member` `retentiescan-live-member@verisight.test`
  - `viewer` `retentiescan-live-viewer@verisight.test`
  - `no-access` `retentiescan-live-noaccess@verisight.test`

### Milestone 1 - Public Website, Navigation And CTA Flow
Dependency: Milestone 0
Status: uitgevoerd

#### Tasks
- [x] Test homepage en RetentieScan-productpagina op live bereikbaarheid.
- [x] Test productenoverzicht, public footer-routes en public login-link op live bereikbaarheid.
- [x] Bevestig dat RetentieScan publiek complementair aan ExitScan gepositioneerd blijft.
- [x] Bevestig dat de primaire CTA-route naar `#kennismaking` loopt.
- [x] Test publieke route volledig in browser op anchor-scroll, header en footer-klikgedrag.
- [x] Test mobile menu, sticky gedrag en CTA-bereikbaarheid.
- [x] Classificeer de zichtbare RetentieScan-CTA's handmatig.

#### Definition of done
- [x] De basispublieke routes zijn live bevestigd.
- [x] De commerciele copyflow is repo-gebaseerd gevalideerd.
- [x] Alle desktop- en mobile klikpaden zijn visueel afgewerkt.

#### Validation
- [x] `GET /` -> `200`
- [x] `GET /producten` -> `200`
- [x] `GET /producten/retentiescan` -> `200`
- [x] De publieke contactroute blijft portfolio-breed en niet self-serve product-led.
- [x] Anchor- en mobilegedrag zijn in een echte browser gevalideerd.

#### Execution Notes
- Live bevestigd:
  - `GET https://www.verisight.nl/` -> `200`
  - `GET https://www.verisight.nl/producten` -> `200`
  - `GET https://www.verisight.nl/producten/retentiescan` -> `200`
  - `GET https://www.verisight.nl/privacy` -> `200`
  - `GET https://www.verisight.nl/voorwaarden` -> `200`
  - `GET https://www.verisight.nl/dpa` -> `200`
  - `GET https://www.verisight.nl/aanpak` -> `200`
  - `GET https://www.verisight.nl/tarieven` -> `200`
- Repo bevestigd:
  - CTA's sturen primair naar `#kennismaking`
  - RetentieScan blijft marketingmatig vroegsignalering op groepsniveau
- Browser bevestigd:
  - homepage `Plan mijn gesprek` -> `#kennismaking`
  - productpagina `Plan mijn gesprek` -> `#kennismaking`
  - mobile menu bereikt `Plan mijn gesprek` en `Inloggen`
  - geen horizontale overflow op homepage, login of productpagina
- CTA-classificatie:
  - `Plan mijn gesprek` -> werkt
  - `Bekijk producten` -> werkt
  - login-link -> werkt
  - vergelijking met ExitScan -> bewust informatief
  - combinatie-route -> bewust informatief

### Milestone 2 - Contact, Login And Recovery
Dependency: Milestone 1
Status: uitgevoerd

#### Tasks
- [x] Test `POST /api/contact` op minimale validatie.
- [x] Test `GET /api/contact` op method guard.
- [x] Test anonieme toegang tot `/dashboard`.
- [x] Test live gedrag van `/forgot-password`.
- [x] Test succesvolle loginflow.
- [x] Test foutmelding bij onjuiste login in de UI.
- [x] Test forgot-password live in de UI op feitelijk gedrag.
- [x] Test contactflow volledig in browser op validatie, submitstate en messaging.

#### Definition of done
- [x] Redirectbaseline voor auth is vastgelegd.
- [x] Contact-endpoint reageert live met verwachte basale statuscodes.
- [x] Auth- en recoveryflow zijn volledig visueel doorlopen voor het huidige live gedrag.

#### Validation
- [x] `GET /dashboard` -> `307 -> /login`
- [x] `GET /login` -> `200`
- [x] `GET /forgot-password` -> `307 -> /login`
- [x] `POST /api/contact` met lege body -> `400`
- [x] `GET /api/contact` -> `405`
- [x] Succesvolle login geeft voor ingelogde accounts `GET /login` -> `307 -> /dashboard`
- [x] Onjuiste login op een testaccount faalt met `Invalid login credentials` via Supabase auth
- [x] Login- en recovery-UX zijn visueel bevestigd.

#### Execution Notes
- Belangrijke UX-spanning:
  - de loginpagina linkt naar `/forgot-password`
  - live valt die route nu direct terug naar `/login`
- Bevestigde accountbaseline:
  - ingelogde `admin`, `member`, `viewer` en `no-access` accounts worden vanaf `/login` doorgezet naar `/dashboard`
  - foutief wachtwoord wordt auth-technisch afgewezen
- Browser bevestigd:
  - leeg contactformulier toont meervoudige validatiefouten
  - echte contactsubmit met regulier mailadres geeft succesmelding `Verstuurd`
  - submit is live opgeslagen in `public.contact_requests`
  - foutief wachtwoord toont `Ongeldig e-mailadres of wachtwoord.`
  - `/forgot-password` is geen aparte werkende herstel-UI maar een redirect terug naar `/login`

### Milestone 3 - Respondent Flow And Survey Chain
Dependency: Milestone 2
Status: uitgevoerd

#### Tasks
- [x] Test live completion-state.
- [x] Test live invalid-token state.
- [x] Test live expired-token state.
- [x] Test live closed-campaign state.
- [x] Test live completed-token state.
- [x] Test live open-token rendering op meerdere fixturetokens.
- [x] Isoleer de backendroute lokaal voor dezelfde tokenstates.
- [x] Voer een echte RetentieScan submit uit op een dedicated fixturecampaign.
- [x] Bevestig opslag van response en `completed`-status in de database.
- [x] Bevestig doorwerking naar stats en report generation.

#### Definition of done
- [x] De surveyketen is niet alleen theoretisch maar met echte tokens getest.
- [x] Het verschil tussen productieproxy en backendlogica is expliciet gemaakt.
- [x] Er is minimaal een echte RetentieScan submit door de live frontendroute gegaan.

#### Validation
- [x] `GET /survey/complete` -> `200`
- [x] `GET /survey/invalid-test-token` -> `503` op productie
- [x] `GET /survey/{expired-token}` -> `410`
- [x] `GET /survey/{closed-token}` -> `410`
- [x] `GET /survey/{completed-token}` -> `200`
- [x] `GET /survey/{open-token}` -> `500` op productie voor meerdere open RetentieScan-tokens
- [x] Dezelfde open tokens geven lokaal via `fastapi.testclient` -> `200`
- [x] Dezelfde invalid token geeft lokaal -> `404`
- [x] `POST https://www.verisight.nl/survey/submit` op action-safe fixture slaat response op

#### Execution Notes
- Productie-open-tokens met bevestigde `500`:
  - `570f134b-71f6-4e31-b839-28ef1e7d51c2`
  - `c4f1d07a-aba6-4fbb-9118-7e7d43d298e1`
  - `5b5ad9b2-73c7-46ed-b831-0cf862f44ed6`
  - `ca0add94-d929-456e-bd53-147f3106de93`
- Productie-states die wel correct reageerden:
  - invalid -> `503`
  - expired -> `410`
  - closed -> `410`
  - completed -> `200`
- Lokaal backendgedrag:
  - open -> `200`
  - invalid -> `404`
  - expired -> `410`
  - closed -> `410`
  - completed -> `200`
- Echte live submit:
  - campaign `12c865d3-c21b-4e0c-bcb5-39e8018e0e1a`
  - na submit: `total_completed = 1`, `completion_rate_pct = 33.3`

### Milestone 4 - Dashboard, Campaign Detail And Role States
Dependency: Milestone 3
Status: uitgevoerd

#### Tasks
- [x] Bevestig repo-gebaseerd welke state-drempels live relevant zijn.
- [x] Bevestig dat trendlaag, playbooks, segment-playbooks en open-signaalclustering bestaan.
- [x] Bevestig dat respondentenweergave voor RetentieScan terughoudender is dan voor ExitScan.
- [x] Bouw fixtures voor `0`, `4`, `7`, `39`, `closed`, `trend`, `segment`.
- [x] Test `/dashboard` als `viewer`.
- [x] Test `/dashboard` als `owner/member`.
- [x] Test `/dashboard` als `admin`.
- [x] Test `/dashboard` als `no-access`.
- [x] Test campaign detail live per rol en per state.
- [x] Test live zichtbaarheid van rapportacties en beheeracties.

#### Definition of done
- [x] De datastructuur voor dashboardchecks is voorbereid.
- [x] De relevante contentlagen zijn codebase-gevalideerd.
- [x] De live UI-HTML is per rol en state sessie-gebaseerd doorlopen.

#### Validation
- [x] Beschikbare states hebben nu concrete campaigns.
- [x] Trendbasis bestaat uit twee RetentieScan campaigns in dezelfde organisatie.
- [x] `admin`, `member`, `viewer` en `no-access` zijn live getest met dedicated accounts.

#### Execution Notes
- State fixtures:
  - `0` -> `16a06969-cb27-486c-b6ef-a2d44fbba39a`
  - `1-4` -> `12c865d3-c21b-4e0c-bcb5-39e8018e0e1a`
  - `5-9` -> `f2e35e22-0ff8-46cb-9069-2f55115cc10c`
  - `10+` -> `f0b83566-cfc6-4c07-bf6d-222ed5557296`
  - `gesloten` -> `9c747e71-6254-490e-a558-089cfff585c0`
- Live roluitkomst:
  - `admin` ziet `Nieuwe campaign` op dashboard en beheeracties op actieve campaign detail
  - `member` ziet geen `Nieuwe campaign`, maar wel `Herinnering` en `Archiveer campaign` op actieve detailpagina's
  - `viewer` ziet geen beheeracties maar wel `PDF-rapport`
  - `no-access` kan inloggen, ziet geen demo-campaigns op dashboard en krijgt `404` op campaign detail
- Live state-uitkomst:
  - `0` en `1-4` tonen `Nog onvoldoende responses`
  - `5-9` toont `Indicatief beeld`
  - `10+` toont `Beslisniveau bereikt`
  - `closed` toont geen reminder- of archiveknoppen
  - de volwassen demo toont live `Trend sinds vorige meting`, `Segment-specifieke playbooks` en `Verbetersignalen uit open antwoorden`

### Milestone 5 - Report Download, Reminder And Archive Paths
Dependency: Milestone 4
Status: uitgevoerd

#### Tasks
- [x] Test live report proxy zonder sessie.
- [x] Test live reminder-route zonder sessie.
- [x] Valideer backend report generation lokaal voor demo- en fixturecampaigns.
- [x] Bevestig de frontend report-proxyafhankelijkheden in code.
- [x] Bevestig dat archive vanuit de campaign UI via Supabase client update loopt.
- [x] Test live report download als ingelogde gebruiker.
- [x] Test reminderflow als beheerder op de action-safe campaign.
- [x] Test archiveflow als beheerder op een dedicated archive-safe campaign.

#### Definition of done
- [x] De proxy-, auth- en backendafhankelijkheden voor rapport zijn expliciet gemaakt.
- [x] Backend report generation is voor RetentieScan-fixtures bevestigd.
- [x] De ingelogde live UI-acties zijn volledig handmatig gevalideerd inclusief click-dialogs.

#### Validation
- [x] `GET /api/campaigns/{id}/report` zonder sessie -> `307 -> /login`
- [x] `POST /api/campaigns/{id}/respondents/send-invites` zonder sessie -> `307 -> /login`
- [x] Lokale backend `GET /api/campaigns/{id}/report` -> `200 application/pdf` voor:
  - current demo
  - previous demo
  - empty
  - indicatief 4
  - indicatief 7
  - action-safe
- [x] Live report-proxy geeft ingelogd `200 application/pdf` voor `admin`, `member` en `viewer`
- [x] Live report-proxy geeft `404` voor `no-access`
- [x] Live reminder-route geeft voor `admin` op action-safe campaign `403 {"detail":"Autorisatie voor uitnodigingen ontbreekt."}`
- [x] Live reminder-route geeft voor `member`, `viewer` en `no-access` `403`
- [x] Reminder- en archiveklikpaden zijn volledig via de browser-UI doorlopen.

#### Execution Notes
- Report proxyroute probeert:
  - eerst `x-api-key`
  - daarna optioneel interne admin fallback
- Archive gebruikt geen aparte Next API-route maar een client-side Supabase update op `campaigns.is_active` en `closed_at`
- Archive-permissielaag is sessie-gebaseerd gevalideerd:
  - `admin` en `member` mogen de campaign-updatepad raken
  - `viewer` en `no-access` krijgen geen update-resultaat terug
- Browser bevestigd:
  - `PDF-rapport` downloadt live als `Verisight_RetentieScan_Voorjaar_2026_Demo.pdf`
  - `Herinnering` toont in de UI nu kapotte fouttekst `Versturen mislukt: [object Object],[object Object]`
  - `Archiveer campaign` werkte live inclusief confirm-dialog en sloot de dedicated archive-safe campaign correct

### Milestone 6 - Triage, Priority And Closeout
Dependency: Milestone 5
Status: uitgevoerd

#### Tasks
- [x] Rangschik huidige bevindingen naar blocker, hoog risico en lager risico.
- [x] Koppel eigenaarstype waar dat al duidelijk is.
- [x] Leg de vaste resterende uitvoervolgorde vast.
- [x] Werk dit bestand bij als actuele source of truth.
- [x] Werk role-based live checks af zodra accounts zijn toegewezen.
- [x] Werk daarna een eindtriage bij met alle dashboard- en mobile bevindingen.

#### Definition of done
- [x] Een volgende uitvoerder kan dit document direct oppakken.
- [x] De hoogste blockers zijn helder genoeg om eerst te fixen of te isoleren.
- [x] Alle geplande live UI-checks zijn afgerond.

#### Validation
- [x] De open-survey render blocker staat nu bovenaan.
- [x] Invalid-token `503` is apart benoemd van de open-token `500`.
- [x] Report generation is expliciet uit de primaire blockerzone gehaald.

#### Execution Notes
- Huidige prioriteitsvolgorde:
  - `1` open survey render `500`
  - `2` invalid-token `503`
  - `3` reminder-route `403` voor admin door ontbrekende uitnodigingsautorisatie plus kapotte UI-foutweergave
  - `4` forgot-password redirectbreuk
  - `5` portfolio-brede contactflow na productspecifieke intent

## 3. Execution Breakdown By Subsystem

### Public Marketing Flow
- [x] Live routebasis bevestigd op `www.verisight.nl`.
- [x] RetentieScan-productpagina is live bereikbaar.
- [x] Complementaire positionering ten opzichte van ExitScan is repo-gebaseerd bevestigd.
- [x] Browsermatige CTA-, anchor- en mobilechecks uitgevoerd.

### Contact And Auth
- [x] Contact-endpoint-validatie bevestigd.
- [x] Anonieme dashboardredirect bevestigd.
- [x] Forgot-password redirectbreuk bevestigd.
- [x] Ingelogde auth- en recovery-UX uitgevoerd voor het huidige live gedrag.

### Respondent Flow
- [x] Completion, completed, expired en closed live getest.
- [x] Open-token render op productie getest en systemisch kapot bevonden.
- [x] Backend dezelfde tokens lokaal getest en gezond bevonden.
- [x] Echte live submit op testfixture uitgevoerd.
- [x] Doorwerking naar opgeslagen response, stats en report bevestigd.

### Dashboard And Detail
- [x] Relevante state- en featurelagen in code bevestigd.
- [x] Concrete fixturecampaigns per state klaargezet.
- [x] Live dashboard- en campaign-detailchecks uitgevoerd met echte accounts.

### Report And Actions
- [x] Live report proxy zonder sessie getest.
- [x] Live reminder-route zonder sessie getest.
- [x] Lokale backend report generation bevestigd.
- [x] Ingelogde reportflow live getest.
- [x] Ingelogde reminder-auth live getest.
- [x] Archive-clickflow inclusief confirm-dialog uitgevoerd.

### Access Matrix
- [x] `anonymous` is live getest.
- [x] `viewer` account bestaat en is live getest.
- [x] `owner/member` account bestaat en is live getest.
- [x] `admin` account bestaat en is live getest.
- [x] `no-access` account bestaat en is live getest.

### Device Coverage
- [x] Server-side routechecks op desktopcontext uitgevoerd.
- [x] Echte mobile browserflow uitgevoerd.
- [x] Visuele sticky-, overflow- en klikbereikbaarheid uitgevoerd.

## 4. Current Product Risks

### Live Blockers
- [x] `ops/email`: reminderroute loopt live nu door, maar eindigt met `sent: 0, failed: 2` omdat de Resend-verzenddomeinconfig niet gezond is.
- [x] `ops/email`: contactaanvragen worden opgeslagen maar interne notificatiemails falen live op dezelfde providerlaag.
- [x] `ops/email`: recente `contact_requests.notification_error` bevestigt live `ResendError: The send.verisight.nl domain is not verified.`

### UX And Flow Risks
- [x] `frontend/product`: `/forgot-password` is live hersteld en publiek bereikbaar; dit risico is opgelost.
- [x] `marketing/product`: de kennismakingsflow blijft portfolio-breed nadat iemand al bewust voor RetentieScan koos.
- [x] `frontend/product`: mobile CTA- en menu-ervaring zijn visueel bevestigd en voelen niet als primaire blocker.

### Conversion Risks
- [x] `marketing/product`: door de brede intake kan RetentieScan-intent afzwakken voor salescontact.
- [x] `ops/email`: contact- en reminderflows ogen aan de voorkant werkend, maar e-maillevering valt nog stil op providerconfig.

### Dashboard And Interaction Risks
- [x] `frontend/product`: trend-, playbook- en segmentlagen zijn inhoudelijk aanwezig en live bevestigd op de volwassen demo.
- [x] `frontend/product`: zichtbaarheid van beheeracties per rol is live bevestigd.

### Risk Of Fake Interaction Or Dead Elements
- [x] `frontend`: report-route werkt ingelogd voor toegestane rollen en geeft `404` voor no-access.
- [x] `frontend/ops`: reminderroute en UI zijn nu eerlijker, maar de actie blijft operationeel dood zolang providerverzending `failed` retourneert.
- [x] `frontend`: archiveknop en beheer-UI zijn handmatig live afgewerkt.

### Risk That RetentieScan Feels Unclear Or Frictional Live
- [x] `product`: RetentieScan is inhoudelijk coherent en de primaire surveyflow werkt weer live.
- [x] `product`: de resterende frictie zit nu vooral in operationele e-maillevering, niet meer in website-, auth- of surveyroutes.

## 5. Open Questions

- [ ] Willen we de dedicated live testaccounts structureel behouden of later vervangen/roteren?
- [ ] Willen we de dedicated live testfixtures na triage behouden als regressiebasis of weer opruimen?
- [ ] Wie kan de Resend-domeinverificatie voor `send.verisight.nl` uitvoeren of vervangen?
- [ ] Willen we voor de volgende fixronde ook screenshots of schermopnames per blocker vastleggen?

## 6. Follow-up Ideas

- [ ] Verifieer of vervang het Resend-verzenddomein `send.verisight.nl`, zodat reminders en contactnotificaties echt afleveren.
- [ ] Voeg daarna een korte live smoke check toe voor:
  - contactaanvraag met `notification_sent = true`
  - reminderactie met `sent > 0`
  - update van `respondents.sent_at`
- [ ] Leg het verschil vast tussen repo-fixes en externe mailproviderconfig, zodat volgende live tests sneller te triageren zijn.
- [ ] Voeg later een Playwright-pack toe voor publieke route, loginredirect en survey states.

## 7. Out Of Scope For Now

- [ ] Productcopy herschrijven.
- [ ] Methodologische wijzigingen in RetentieScan scoring.
- [ ] ExitScan-review buiten vergelijkingscontext.
- [ ] Grote backend- of report-architectuurwijzigingen.
- [ ] Nieuwe automation- of observabilitylagen buiten wat nodig is om de live blocker te isoleren.

## 8. Defaults Chosen

- [x] Dit bestand is de vervangende source of truth.
- [x] `https://www.verisight.nl` is de canonieke live basis.
- [x] Productie is gebruikt voor publieke routes en survey-statuschecks.
- [x] Fixtures zijn gebruikt voor submit-, stats-, report- en statechecks.
- [x] `seed_retention_demo_environment.py` blijft de conceptuele basis; de fixturelaag is nu aangevuld met expliciete live-test campaigns.
- [x] ExitScan blijft primair product; RetentieScan wordt alleen live beoordeeld als complementair product.
- [x] Bevindingen zijn repo- en uitvoering-gebaseerd, niet claim- of aannamegedreven.
