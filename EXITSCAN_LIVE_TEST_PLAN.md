# EXITSCAN_LIVE_TEST_PLAN.md

## 1. Summary

Dit plan gebruikt de huidige ExitScan-implementatie, de actuele live routes en de bestaande promptstructuur als basis voor een volledige live test van ExitScan, met `EXITSCAN_LIVE_TEST_PLAN.md` als source of truth voor de uitvoering.

De scope blijft bewust scherp:

- ExitScan is het primaire product.
- RetentieScan wordt alleen meegenomen waar vergelijking nodig is om ExitScan live duidelijker te positioneren.
- Dit traject gaat nog niet over fixes of codewijzigingen, maar over een uitvoerbare live testvolgorde die daarna exact kan worden afgewerkt.

Belangrijkste repo- en live-observaties die dit plan sturen:

- De publieke hoofdroute loopt via `https://www.verisight.nl`, niet via een apart dashboard-subdomein.
- Op 14 april 2026 reageren `https://www.verisight.nl/`, `/producten/exitscan` en `/login` met `200 OK`.
- Op 14 april 2026 geeft `https://www.verisight.nl/dashboard` een `307` redirect naar `/login`.
- Op 14 april 2026 resolveert `dashboard.verisight.nl` niet; dat behandelen we als risico of legacy-pad, niet als canonieke hoofdroute.
- De contactflow loopt via `POST /api/contact` naar backend `POST /api/contact-request`.
- De respondentflow loopt via `GET/POST /survey/[token]` als frontend-proxy naar de backend-survey.
- De dashboardflow kent in de codebase expliciete staten voor:
  - `0 respondenten`
  - `1-4 responses`
  - `5-9 responses`
  - `10+ responses`
  - `gesloten campagne`
  - `geen toegang`
- PDF-download loopt via `GET /api/campaigns/{id}/report`, met afhankelijkheid op frontend-proxy, organisatie-auth en backend reportgeneratie.

De kern van dit traject is daarom:

- niet alleen controleren of links en knoppen werken;
- wel de volledige live keten nalopen van publieke route naar contact, login, respondentflow, dashboard, campaign detail en rapportdownload;
- en expliciet vastleggen wat live blocker is, wat UX- of conversierisico is, en wat pas daarna gefixt hoeft te worden.

Publieke interfaces en contracten die in dit traject leidend blijven:

- `GET /`
- `GET /producten/exitscan`
- `GET /login`
- `GET /dashboard` met anonieme redirect naar `/login`
- `GET/POST /survey/[token]`
- `POST /api/contact`
- `GET /api/campaigns/{id}/report`

Uitvoeringsstatus op 14 april 2026:

- De publieke hoofd- en productroutes zijn live gecontroleerd en reageren zoals verwacht:
  - `/`
  - `/producten`
  - `/producten/exitscan`
  - `/login`
  - `/aanpak`
  - `/tarieven`
  - `/privacy`
  - `/voorwaarden`
  - `/dpa`
- Anonieme toegang tot `/dashboard`, `/campaigns/test-campaign` en `/api/campaigns/test-campaign/report` geeft live een `307` redirect naar `/login`.
- De contactflow valideert live correct:
  - `POST /api/contact` met lege body geeft `400`
  - `GET /api/contact` geeft `405`
  - honeypot-submit met gevuld `website`-veld geeft `200 {"message":"Verstuurd"}`
- De authlaag is live verder gevalideerd:
  - onjuiste login toont live `Ongeldig e-mailadres of wachtwoord.`
  - ingelogde gebruikers die `/login` openen worden live doorgestuurd naar `/dashboard`
  - `GET /forgot-password` geeft live een `307` redirect naar `/login`, waardoor de herstelroute functioneel ontbreekt
- Er is een dedicated live fixtureomgeving opgezet via `seed_exit_live_test_environment.py`:
  - organisatie-slug: `exitscan-live-test`
  - vaste testaccounts:
    - `exitscan-live-admin@verisight.test`
    - `exitscan-live-member@verisight.test`
    - `exitscan-live-viewer@verisight.test`
    - `exitscan-live-noaccess@verisight.test`
  - campaign IDs en sample tokens worden per seed-run opnieuw gegenereerd; de laatste scriptoutput is leidend voor concrete IDs
- De surveyketen is live inhoudelijk gevalideerd:
  - ongeldige token geeft live `503 Service Unavailable` met `Database-fout opgetreden`, niet de verwachte nette ongeldige-link-state
  - geldige open token geeft live `500 Internal Server Error` op `GET /survey/[token]`
  - verlopen token geeft live `410 Gone`
  - ingevulde token geeft live `200` met `Al ingevuld`
  - gesloten campagne geeft live `410 Gone`
  - `POST /survey/submit` met een geldige open token werkt live wel en zet de respondent naar completed-state
- De dashboard- en campaigndetailflow zijn live gevalideerd voor `admin`, `member`, `viewer` en `no-access`:
  - state-drempels `0`, `1-4`, `5-9`, `10+`, `gesloten` en `geen toegang` zijn met echte fixtures bekeken
  - `viewer` ziet op campaign detail geen reminder- of archive-acties
  - `member` ziet deze acties op dit moment wel
  - `no-access` ziet geen expliciete fout op dashboard, maar een lege cockpit die legitiem oogt
- De operationele actieflow is live gevalideerd:
  - `PDF-rapport` geeft via echte browserklik `403 {"detail":"Autorisatie voor rapportdownload ontbreekt."}`
  - `Herinnering` geeft live `Versturen mislukt: Autorisatie voor backend-uitnodigingen ontbreekt.`
  - `Archiveer campaign` werkt live op de dedicated action-safe fixture en sluit de campaign succesvol
  - na muterende tests is de fixtureset telkens opnieuw geseed om een schone baseline te houden
- Mobile smoke is live meegetest:
  - mobile menu opent
  - `Plan mijn gesprek` landt op `/#kennismaking`
  - login en dashboard blijven op klein scherm functioneel bereikbaar

## 2. Milestones

### Milestone 0 - Freeze Scope, Testmatrix And Access
Dependency: none
Status: uitgevoerd op 14 april 2026

#### Tasks
- [ ] Leg vast dat dit traject alleen ExitScan dekt, met RetentieScan alleen als positioneringsvergelijking.
- [ ] Maak een vaste testmatrix met rollen:
  - `admin`
  - `owner/member`
  - `viewer`
  - `anonymous`
- [ ] Maak een vaste datamatrix met ExitScan-fixtures:
  - `0 respondenten`
  - `1-4 responses`
  - `5-9 responses`
  - `10+ responses`
  - `gesloten campagne`
  - `geen toegang`
- [ ] Leg vast welke checks read-only zijn en welke alleen op een dedicated testcampagne mogen plaatsvinden:
  - `reminder`
  - `archive`
  - `PDF-download`
  - `contact submit`
  - `survey submit`
- [ ] Leg vast dat de live basis voor dit traject `https://www.verisight.nl` is en niet `dashboard.verisight.nl`.

#### Definition of done
- [ ] De live test start met een expliciete scope-, rollen- en datamatrix.
- [ ] Elke vervolgstap verwijst naar een vaste rol en een vaste campagne-state.
- [ ] Er is geen impliciete scope-uitbreiding meer tijdens uitvoering.

#### Validation
- [ ] Elke route in scope is gekoppeld aan minstens een rol en een state.
- [ ] Er is expliciet benoemd welke checks blokkeren zonder credentials, tokens of fixtures.
- [ ] De canonieke live basis en het non-canonieke dashboard-subdomein zijn expliciet onderscheiden.

#### Execution Notes
- Fixtureseed live uitgevoerd:
  - gebruik `seed_exit_live_test_environment.py` voor de open campaign- en tokenfixtures
  - het script maakt ook een dedicated `ExitScan Live Test - Action Safe` campaign aan voor reminder/archive
- Live accounts en rollen ingericht:
  - `admin`: `exitscan-live-admin@verisight.test`
  - `member`: `exitscan-live-member@verisight.test`
  - `viewer`: `exitscan-live-viewer@verisight.test`
  - `no-access`: `exitscan-live-noaccess@verisight.test`
- Belangrijke live nuance:
  - campaign IDs en sample tokens wisselen bij elke reseed; behandel de laatste scriptoutput als leidende momentopname

### Milestone 1 - Public Website, Navigation And CTA Flow
Dependency: Milestone 0
Status: uitgevoerd op 14 april 2026

#### Tasks
- [ ] Test de publieke ExitScan-route op desktop:
  - homepage
  - productenoverzicht waar relevant voor ExitScan
  - ExitScan-productpagina
  - public header
  - public footer
- [ ] Test de publieke ExitScan-route op mobile:
  - sticky header
  - mobile menu
  - CTA-bereikbaarheid
  - terugnavigatie
- [ ] Controleer alle ExitScan-gerelateerde CTA's en links:
  - `Plan mijn gesprek`
  - `Bekijk producten`
  - login-link
  - ExitScan-routekaarten
  - vergelijking met RetentieScan
- [ ] Controleer anchor-gedrag naar `#kennismaking`.
- [ ] Beoordeel copyflow van homepage naar ExitScan-productpagina op duidelijke primaire route:
  - ExitScan eerst
  - RetentieScan complementair
  - combinatie alleen als ondersteunende portfolioroute
- [ ] Classificeer elke link of button als:
  - `werkt`
  - `verwarrend`
  - `dood`
  - `redirect onverwacht`
  - `bewust informatief`

#### Definition of done
- [ ] Alle publieke ExitScan-klikpaden zijn handmatig afgevinkt.
- [ ] Alle CTA's hebben een expliciete bestemming en logisch vervolg.
- [ ] Afhaakpunten en copybreuken tussen home en productpagina zijn benoemd.

#### Validation
- [ ] De anchor naar `#kennismaking` werkt op de verwachte route en scrollt niet naar een kapotte state.
- [ ] ExitScan leest live als primair product en niet als vage portfolio-teaser.
- [ ] Mobile en desktop leveren geen afwijkende of dode klikpaden op.

#### Execution Notes
- Live geverifieerd dat de interne links op homepage en ExitScan-productpagina status `200` geven voor de kernroutes.
- Live geverifieerd dat `Plan mijn gesprek`, `Bekijk producten`, productlinks, login-link en juridische links allemaal een bestaande publieke bestemming hebben.
- Mobile smoke live geverifieerd:
  - mobile menu opent
  - `Plan mijn gesprek` landt op `/#kennismaking`
  - homepage, productpagina en login blijven mobiel bereikbaar
- Gevonden afwijking:
  - de publieke dashboardpreview toont `dashboard.verisight.nl` terwijl dat domein live niet resolveert

### Milestone 2 - Contact, Auth And Recovery Path
Dependency: Milestone 1
Status: grotendeels uitgevoerd op 14 april 2026; forgot-password-route blokkeert volledige hersteltest

#### Tasks
- [ ] Test het formulier onder `#kennismaking` op:
  - lege velden
  - client-validatie
  - succesmelding
  - backendfout
  - netwerkfout
- [ ] Controleer dat de contactflow logisch blijft voor ExitScan, ook al is het formulier portfoliobreed.
- [ ] Test `/login` voor anoniem bezoek op:
  - juiste laadstate
  - foutmelding bij onjuiste login
  - succesvolle login
  - doorstroom naar `/dashboard`
- [ ] Test `/forgot-password` op:
  - formulier
  - succesmelding
  - terugpad naar login
- [x] Controleer dat anonieme toegang tot `/dashboard` consequent terugvalt op `/login` en niet op een half-gerenderde state.
- [ ] Controleer of login, herstel en redirects op mobile en desktop consistent aanvoelen.

#### Definition of done
- [ ] Contact- en auth-flow zijn end-to-end beschreven als live klikpad.
- [ ] Elke foutmelding en succesmelding is vastgelegd met verwachte trigger.
- [ ] Login, herstel en redirectgedrag zijn consistent per device.

#### Validation
- [ ] `POST /api/contact` en backend `POST /api/contact-request` staan benoemd als testpunt en risicopunt.
- [x] `/dashboard -> /login` is vastgelegd als verwachte anonieme baseline, niet als bug.
- [ ] De contactflow blijft commercieel logisch voor ExitScan en voelt niet als generieke intake zonder vervolg.

#### Execution Notes
- Live geverifieerd:
  - `/dashboard` geeft anoniem `307 -> /login`
  - `POST /api/contact` met lege body geeft `400`
  - `GET /api/contact` geeft `405`
  - honeypot-submit op `POST /api/contact` geeft `200 {"message":"Verstuurd"}`
  - onjuiste login toont live `Ongeldig e-mailadres of wachtwoord.`
  - ingelogde gebruikers die `/login` openen worden live doorgestuurd naar `/dashboard`
- Gevonden afwijking:
  - `/forgot-password` geeft live `307 -> /login`, ondanks dat de loginpagina ernaar linkt en er in de codebase een aparte route voor bestaat
- Nog open:
  - forgot-password submit- en succesflow is niet uitvoerbaar zolang de live route direct naar `/login` terugvalt
  - netwerkfout-simulatie voor de contactflow is niet apart live afgedwongen

### Milestone 3 - Respondent Flow And Survey Chain
Dependency: Milestone 2
Status: uitgevoerd op 14 april 2026 met live blockers op open-token rendering

#### Tasks
- [ ] Neem de respondentketen expliciet mee:
  - invite-link
  - `GET /survey/[token]`
  - `POST /survey/[token]`
  - submit-resultaat
  - completion-state
- [ ] Test minimaal de volgende token- en campagnestates:
  - geldige token
  - ongeldige token
  - verlopen token
  - al ingevulde token
  - gesloten campagne
- [ ] Controleer dat de surveyflow live afhankelijk is van:
  - frontend-proxy
  - backend-HTML
  - campaign-activestatus
  - tokenstatus
- [ ] Controleer dat submit leidt tot opslag, completion-state en verwachte doorwerking naar dashboard en rapport.
- [x] Leg vast welke checks alleen op een veilige testorganisatie of testcampagne mogen plaatsvinden.

#### Definition of done
- [ ] De respondentflow is opgenomen als kernpad in de ExitScan live test.
- [ ] Alle belangrijke token- en foutstates zijn benoemd.
- [ ] De keten van survey naar dashboard wordt niet meer impliciet verondersteld.

#### Validation
- [ ] Elke survey-state is gekoppeld aan een verwachte UI- of statusuitkomst.
- [ ] De live test maakt onderscheid tussen linkfout, tokenfout, campaign-status en opslagfout.
- [ ] De planuitvoering vereist geen productiegevoelige submits buiten expliciete testfixtures.

#### Execution Notes
- Live geverifieerd:
  - `/survey/complete` geeft `200` en toont de bedankpagina
  - ongeldige token geeft live `503 Service Unavailable` met `Database-fout opgetreden`
  - geldige open token geeft live `500 Internal Server Error` op `GET /survey/[token]`
  - verlopen token geeft `410 Gone`
  - al ingevulde token geeft `200` met `Al ingevuld`
  - gesloten campagne geeft `410 Gone`
  - `POST /survey/submit` met een geldige open token geeft `200 {"status":"ok","message":"Bedankt voor het invullen van de survey."}`
  - na succesvolle submit wordt dezelfde token live `Al ingevuld`
- Belangrijke conclusie:
  - opslag en completion-state leven nog, maar de open surveyrender crasht vóór invullen bij een geldige open token
- Testhygiëne:
  - na de submit-validatie is de volledige fixturelaag opnieuw geseed

### Milestone 4 - Dashboard Home, Campaign Detail And Role-Based States
Dependency: Milestone 3
Status: uitgevoerd op 14 april 2026

#### Tasks
- [ ] Test `/dashboard` per rol op:
  - zichtbaarheid van campagnes
  - routing naar campaign detail
  - zichtbaarheid van rapportacties
  - onboarding-elementen
- [ ] Test `/campaigns/{id}` per rol op:
  - zichtbaarheid van inhoud
  - zichtbaarheid van operationele acties
  - toegang tot respondentenblok
  - leesbaarheid van methodologie- en analyselagen
- [ ] Test de ExitScan-states:
  - `0 respondenten`
  - `1-4 responses`
  - `5-9 responses`
  - `10+ responses`
  - `gesloten`
  - `geen toegang`
- [ ] Controleer alle belangrijke dashboardonderdelen:
  - beslisoverzicht
  - warnings
  - analysedisclosures
  - focusvragen
  - respondententabel
  - methodologiekaart
  - onboardingballoons
- [ ] Controleer dat `owner/member` operationele acties ziet en `viewer` niet onterecht kan beheren.
- [ ] Controleer of interactieve UI-elementen echt vervolgwaarde hebben en niet alleen levendig ogen.

#### Definition of done
- [ ] De dashboardtest dekt zowel inhoudelijke leesbaarheid als permissiegedrag.
- [ ] Alle state-drempels uit de codebase zijn expliciet opgenomen.
- [ ] Per rol is duidelijk wat zichtbaar, klikbaar en geblokkeerd hoort te zijn.

#### Validation
- [ ] `0`, `<5`, `5-9`, `10+` en `closed` hebben elk een verwachte uitkomst in het plan.
- [ ] Het plan benoemt waar UI-elementen risico lopen op schijninteractie of verkeerde beschikbaarheid.
- [ ] ExitScan-dashboard leest live als managementroute en niet als generiek scan-dashboard.

#### Execution Notes
- Live geverifieerd:
  - anonieme toegang tot `/campaigns/test-campaign` geeft `307 -> /login`
  - `admin`, `member`, `viewer` en `no-access` kunnen live worden ingelogd en op dashboard/campaign detail worden getest
  - de states `0`, `1-4`, `5-9`, `10+`, `gesloten` en `geen toegang` zijn via echte fixtures bekeken
- Role-based live uitkomst:
  - `viewer` ziet geen `Herinnering` of `Archiveer campaign` op campaign detail
  - `member` ziet deze beheeracties op dit moment wel
  - `no-access` ziet op dashboard geen expliciete toegangsfout maar een lege cockpit
  - `no-access` krijgt op een campaigndetail een 404-achtige niet-gevonden-state
- Extra UX-observatie:
  - op member- en viewer-dashboards verschijnt een los `1`-element voor `Open je campagne`, wat als visuele ruis of badge-lek oogt

### Milestone 5 - PDF Download, Campaign Actions And Failure Paths
Dependency: Milestone 4
Status: uitgevoerd op 14 april 2026 met harde blockers op PDF en reminder

#### Tasks
- [ ] Test `PDF-rapport` op:
  - loading
  - succesdownload
  - backendfout
  - authfout
  - verbindingsfout
- [ ] Test `Herinnering` alleen op een dedicated testcampagne, inclusief confirm-dialog en post-action refresh.
- [ ] Test `Archiveer campaign` alleen op een dedicated testcampagne, inclusief confirm-dialog en post-action refresh.
- [ ] Controleer of rapport- en campaign-actions logisch aansluiten op:
  - campaign-status
  - rolrechten
  - verwachte vervolgactie
- [ ] Leg vast dat rapportdownload afhankelijk is van:
  - frontend-proxy
  - org API-key
  - backend admin fallback
  - backend report generation
- [ ] Classificeer elk foutpad als:
  - `live blocker`
  - `operationeel risico`
  - `UX-risico`
  - `cosmetisch`

#### Definition of done
- [ ] Rapportdownload en operationele acties zijn als aparte risicolaag uitgewerkt.
- [ ] Elke actie heeft een verwacht succes- en foutpad.
- [ ] Het plan maakt onderscheid tussen blocker, operationeel risico en cosmetische issue.

#### Validation
- [ ] PDF-fouten zijn apart te herleiden naar UI, frontend proxy, backend auth of report generation.
- [ ] Reminder en archive worden nooit op productiegevoelige campagnes uitgevoerd buiten expliciete testfixtures.
- [ ] Operationele acties zijn per rol en status logisch begrensd.

#### Execution Notes
- Live geverifieerd:
  - anonieme toegang tot `/api/campaigns/test-campaign/report` geeft `307 -> /login`
  - `PDF-rapport` geeft via echte browserklik `403 {"detail":"Autorisatie voor rapportdownload ontbreekt."}`
  - `Herinnering` geeft live `Versturen mislukt: Autorisatie voor backend-uitnodigingen ontbreekt.`
  - `Archiveer campaign` werkt live op de dedicated action-safe fixture en zet de campaign naar `Gesloten`
- Vanuit codebase bevestigd:
  - rapportdownload hangt af van frontend-proxy, org API-key, backend admin fallback en backend report generation
  - reminder gebruikt server action plus organization secret plus backend invite-endpoint
- Belangrijke conclusie:
  - zowel PDF-download als reminder falen op server-side autorisatie/configuratie, niet op de knop zelf
  - archive werkt functioneel wel
- Testhygiëne:
  - na de archive-check is de fixtureset direct opnieuw geseed

### Milestone 6 - Blocker Triage, Execution Order And Closeout
Dependency: Milestone 5
Status: uitgevoerd op 14 april 2026

#### Tasks
- [ ] Rangschik alle bevindingen als:
  - `live blocker`
  - `hoog UX/conversierisico`
  - `middel`
  - `laag`
- [ ] Leg de uitvoervolgorde vast:
  - publiek
  - contact/auth
  - survey
  - dashboard
  - report/actions
  - cross-device recheck
- [ ] Leg per bevinding een eigenaarstype vast:
  - marketing
  - product
  - frontend
  - backend
  - ops
- [ ] Schrijf de eindoutput in `EXITSCAN_LIVE_TEST_PLAN.md` met de vaste structuur uit het prompt-systeem.
- [ ] Werk na uitvoering van deze prompt ook de rij voor `EXITSCAN_PLANMODE_LIVE_TEST_PROMPT.md` bij in `PROMPT_CHECKLIST.xlsx`.

#### Definition of done
- [ ] Het plan is milestone-voor-milestone uitvoerbaar zonder nieuwe keuzes.
- [ ] Elke bevinding heeft een prioriteit en een eigenaarstype.
- [ ] Het deliverable blijft één planbestand.

#### Validation
- [ ] Een andere engineer of agent kan het plan direct uitvoeren zonder extra scopebesluiten.
- [ ] `PROMPT_CHECKLIST.xlsx` is opgenomen als laatste expliciete stap.
- [ ] De planuitvoer sluit af op repo-feiten en live-observaties, niet op losse aannames.

#### Execution Notes
- Huidige blockertriage op basis van live uitvoering:
  - `live blocker` | owner `frontend/backend`: geldige open survey-token geeft `500` op `GET /survey/[token]`
  - `live blocker` | owner `frontend/backend/ops`: ongeldige survey-token geeft `503` met databasefout in plaats van nette foutstate
  - `live blocker` | owner `frontend/ops`: `PDF-rapport` geeft live `403 Autorisatie voor rapportdownload ontbreekt`
  - `live blocker` | owner `frontend/ops`: `Herinnering` geeft live `Autorisatie voor backend-uitnodigingen ontbreekt`
  - `hoog UX/conversierisico` | owner `frontend/marketing`: publieke preview toont `dashboard.verisight.nl` terwijl dat domein niet resolveert
  - `hoog UX-risico` | owner `frontend/product`: `/forgot-password` redirect naar `/login` maakt herstelroute live onbruikbaar
  - `middel` | owner `product/frontend`: `no-access` gebruiker ziet lege cockpit in plaats van expliciete toegangsfout
  - `middel` | owner `frontend/product`: los `1`-element voor `Open je campagne` oogt als badge- of layoutlek
- `PROMPT_CHECKLIST.xlsx` is bijgewerkt voor deze prompt en aangevuld met de uitgevoerde live-validatie.

## 3. Execution Breakdown By Subsystem

### Public Marketing Flow
- [ ] Test homepage, productnavigatie, ExitScan-productpagina, header, footer en mobile nav als één commerciële route.
- [ ] Controleer CTA-anchors, vergelijkingslinks en routecontinuïteit richting `#kennismaking`.
- [ ] Toets of ExitScan overal de primaire route blijft en RetentieScan alleen ondersteunend meekijkt.

### Contact And Conversion Flow
- [ ] Test formuliergedrag, client-validatie, API-submit en success/error messaging.
- [ ] Bevestig dat de portfoliobrede contactflow voor ExitScan niet te generiek of diffuus voelt.
- [ ] Leg afhankelijkheden op backend-beschikbaarheid en rate limiting expliciet vast.

### Auth Flow
- [ ] Test login, forgot password en anonieme dashboard-redirect.
- [ ] Controleer of succesvolle login logisch doorzet naar de dashboardcockpit.
- [ ] Controleer of auth-fouten rustig en begrijpelijk gecommuniceerd worden.

### Respondent Flow
- [ ] Test tokenroute, submit, invalid/expired/completed/closed states en completion-flow.
- [ ] Controleer de keten van survey naar opgeslagen response, dashboard en rapport.
- [ ] Behandel respondentflow als echt kernpad van ExitScan Live, niet als secundaire technische route.

### Dashboard Flow
- [ ] Test dashboardcockpit en campaign detail voor alle relevante rollen.
- [ ] Toets state-drempels, warnings, analyselagen, respondentenblok en methodologie.
- [ ] Controleer of ExitScan-dashboard leesbaar blijft op zowel indicatief als volwassen dataniveau.

### Report And Actions
- [ ] Test PDF-proxy, downloadgedrag, foutmeldingen en afhankelijkheden op backendauth.
- [ ] Test reminder en archive alleen op een dedicated testcampagne.
- [ ] Controleer of operationele acties alleen zichtbaar zijn waar dat live logisch en veilig is.

### Access Matrix
- [ ] Gebruik `anonymous`, `admin`, `owner/member` en `viewer` als vaste rolenset.
- [ ] Leg per rol vast welke routes, knoppen en states zichtbaar of geblokkeerd moeten zijn.
- [ ] Markeer alle checks die nog credentials of fixtures nodig hebben als expliciete afhankelijkheid.

### Device Coverage
- [ ] Gebruik desktop als primaire testbasis voor alle flows.
- [ ] Gebruik mobile als verplichte tweede check voor publieke site, login en kritieke dashboardknoppen.
- [ ] Smoke-check horizontale overflow, sticky gedrag, menu-open/close en download-/action-button bereikbaarheid.

## 4. Current Product Risks

### Live blockers
- [ ] `dashboard.verisight.nl` resolveert op 14 april 2026 niet; elke verwijzing hiernaar veroorzaakt verwarring of een dood pad.
- [ ] Rapportdownload hangt af van meerdere schakels; één auth- of backendfout maakt de knop direct waardeloos.
- [ ] De respondentflow hangt af van proxy plus backend-HTML; fouten hierin voelen voor eindgebruikers als kapotte survey-link of kapotte invulflow.
- [ ] `GET /survey/invalid-test-token` geeft live `503 Service Unavailable` met `Database-fout opgetreden` in plaats van een nette ongeldige-token-state.
- [ ] `GET /survey/[geldige-open-token]` geeft live `500 Internal Server Error`, terwijl dezelfde token via `POST /survey/submit` wel succesvol opgeslagen kan worden.
- [ ] `PDF-rapport` geeft live `403 {"detail":"Autorisatie voor rapportdownload ontbreekt."}` bij echte browserklik.
- [ ] `Herinnering` geeft live `Autorisatie voor backend-uitnodigingen ontbreekt.`, waardoor operationele opvolging stukloopt.

### UX- And Flow Risks
- [ ] De drempels `0`, `<5`, `5-9`, `10+` kunnen onduidelijk voelen als de overgang tussen compact, indicatief en verdiepend niet strak wordt getest.
- [ ] Disclosures, previewsliders, infochips en onboarding-elementen kunnen levendig ogen zonder dat hun vervolgwaarde live duidelijk is.
- [ ] Mobile navigatie, sticky header en CTA-anchors kunnen in de praktijk sneller frictie geven dan de desktopflow doet vermoeden.
- [ ] Contact, login en dashboard vormen functioneel één keten; kleine breuken tussen die lagen voelen live groter dan in losse schermreview.
- [ ] `/forgot-password` redirect live naar `/login` terwijl de loginpagina expliciet naar een herstelroute linkt.

### Conversion Risks
- [ ] Home, ExitScan-productpagina en `#kennismaking` moeten één duidelijke route vormen; elke copy- of CTA-breuk verlaagt demo- en leadkwaliteit.
- [ ] De contactflow is portfoliobreed; als ExitScan niet duidelijk genoeg de primaire context blijft, voelt de intake te breed of te vaag.
- [ ] Verwijzingen naar RetentieScan of combinatie mogen ExitScan helpen kaderen, maar niet de primaire kooproute vertroebelen.

### Dashboard And Interaction Risks
- [ ] Role-based zichtbaarheid van `Herinnering` en `Archiveer campaign` kan verkeerde verwachtingen of ongewenste acties geven.
- [ ] Indicatieve states kunnen te weinig uitleg geven, terwijl volwassen states te veel detail ineens zichtbaar kunnen maken.
- [ ] De dashboardroute moet aanvoelen als managementflow en niet als verzameling losse analyseblokken.
- [ ] `member` kan live dezelfde beheeracties zien als `admin`; als dit niet bewust bedoeld is, is dit een permissierisico.
- [ ] `no-access` toont live een lege cockpit in plaats van expliciete geen-toegang-state, wat toegangsschijn geeft.

### Risk Of Fake Interaction Or Dead Elements
- [ ] Elke button of link die wel visueel sterk is maar niet logisch vervolgt, schaadt het live vertrouwen disproportioneel.
- [ ] Demo- en previewlagen kunnen gebruikers laten denken dat iets interactief of persoonlijk beschikbaar is terwijl het alleen illustratief is.
- [ ] Download-, reminder- en archive-acties moeten scherp begrensd zijn om schijninteractie of onveilige interactie te voorkomen.
- [ ] `PDF-rapport` blijft op meerdere states zichtbaar terwijl de live download nu functioneel blokkeert.
- [ ] Op member- en viewer-dashboards verschijnt live een los `1`-element voor `Open je campagne`, wat als half-interactieve of kapotte badge voelt.

### Risk That ExitScan Feels Unclear Or Frictional Live
- [ ] ExitScan moet live primair en scherp blijven; de portfolio-omgeving mag het product niet verzachten.
- [ ] Survey, dashboard en rapport moeten als één geloofwaardige keten voelen; anders blijft ExitScan hangen tussen marketingbelofte en operationele realiteit.
- [ ] Als auth-, survey- of reportgedrag stroef aanvoelt, daalt de bruikbaarheid voor demo, pilot en echt klantgebruik direct.

## 5. Open Questions

- [ ] Welke server-side configuratie ontbreekt of faalt live voor secret-backed frontend flows?
  - Inference: `PDF-rapport` en `Herinnering` falen vóór succesvolle backendverwerking, waarschijnlijk in `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL` en/of `BACKEND_ADMIN_TOKEN`.
- [ ] Is het de bedoeling dat `member` dezelfde operationele campagneacties ziet als `admin`?
  - Live gedrag laat `Herinnering` en `Archiveer campaign` nu wel zien voor `member`.
- [ ] Moet een gebruiker zonder organisatiekoppeling een lege cockpit zien of juist een expliciete geen-toegang-state?
  - Live voelt de huidige lege cockpit als schijn-toegang.
- [ ] Wat veroorzaakt de open-token rendercrash op `GET /survey/[token]` terwijl `POST /survey/submit` voor dezelfde token wel werkt?
  - Inference: de fout zit waarschijnlijk in de open survey-render of templatinglaag, niet in tokenvalidatie of opslag zelf.

## 6. Follow-up Ideas

- [ ] Zet na dit plan een Playwright smoke pack op voor home, ExitScan, login en anonieme dashboardredirect.
- [ ] Voeg later een role-based smoke checklist toe per release.
- [ ] Voeg later een report-download synthetic check toe op backend- en proxy-beschikbaarheid.
- [ ] Maak later een vaste `ExitScan live demo readiness` one-pager voor sales en pilots.

## 7. Out of Scope For Now

- [ ] Codefixes, copywijzigingen of redesignwerk.
- [ ] RetentieScan-review buiten noodzakelijke ExitScan-vergelijking.
- [ ] Backend-herarchitectuur, performance-optimalisatie of report-engine refactor.
- [ ] Nieuwe metrics, nieuwe productclaims of nieuwe campaign states buiten de huidige codebase.
- [ ] Nieuwe demo- of automationlagen buiten wat nodig is om deze live test uitvoerbaar te plannen.

## 8. Defaults Chosen

- [ ] De respondentflow via `/survey/[token]` hoort bij deze live test.
- [ ] De live checks worden gepland voor alle rollen: `admin`, `owner/member`, `viewer`, `anonymous`.
- [ ] `https://www.verisight.nl` is de canonieke live basis voor dit traject.
- [ ] `dashboard.verisight.nl` wordt behandeld als legacy of defect pad totdat infra anders bevestigt.
- [ ] Anonieme toegang tot `/dashboard` hoort te redirecten naar `/login`.
- [ ] Reminder- en archive-checks gebeuren alleen op een dedicated testcampagne.
- [ ] Elke bevinding wordt gelabeld als blocker of niet-blocker, zodat fixes daarna geprioriteerd kunnen worden.
- [ ] `PROMPT_CHECKLIST.xlsx` wordt na oplevering van dit planbestand bijgewerkt als onderdeel van dit traject.
