# Self-service 1: rapport in eigen hand — uitvoeringsverslag

Datum: 2026-09-12
Branch: `feature/self-service-1-rapport` (worktree `.worktrees/self-service-1`)
Plan: `docs/superpowers/plans/2026-09-11-self-service-1-rapport-in-eigen-hand.md`
Spec: `docs/superpowers/specs/2026-09-11-self-service-onboarding-design.md`, blokken A (par. 4.1 t/m 4.5), B (par. 5), C (par. 6) en F (par. 9).

Uitgevoerd via subagent-driven-development: één verse subagent per taak, en na elke taak twee reviews (spec-compliance tegen de spec, en codekwaliteit). Blokken D, E, G en par. 4.6 zijn buiten scope gebleven; daar is niets van gebouwd.

## Wat er nu werkt

De klant kan het rapport zelf downloaden op het campagnedetail en op `/reports`, krijgt bij sluiting de rapport-klaar-mail, ziet een herinneringstekst die de surveylink bevat in plaats van de oude belofte dat Loep verstuurt, en alleen de eigenaar of de Loep-operator ziet nog beheerknoppen.

## Baselines

| Meting | Voor | Na |
|---|---|---|
| `npx tsc --noEmit` | 133 | 133 |
| `npx vitest run` falende tests | 65 | 61 |

De vier tests die verdwenen, zijn exact de vier die het plan voorspelde: ze faalden op main omdat ze al gedrag verwachtten dat de code nog niet had.

- `app/(dashboard)/reports/page.test.ts > reports overview guardrails keeps the page focused on report download instead of featured library framing`
- `app/(dashboard)/reports/page.route-shell.test.ts > reports route shell keeps report access tied to downloadable PDFs only`
- `lib/dashboard/shell-navigation.test.ts > dashboard shell navigation hides product rail items that do not have any campaign yet`
- `lib/dashboard/shell-navigation.test.ts > dashboard shell navigation maps product rail to only overview and reports entries`

Geen enkele regel kwam erbij: de faalset is per testnaam vergeleken, niet alleen geteld.

**Let op bij hercontrole:** de testsuite is in deze omgeving licht wisselvallig. `app/(dashboard)/beheer/health/page.test.ts` laadt af en toe niet, waardoor een enkele run 62 tot 64 meldt. Bij twijfel: opnieuw draaien en de namen vergelijken, niet het getal.

### Productiebuild, en een valkuil bij worktrees

`npm run build` slaagt: 76 pagina's, en `/reports` bouwt netjes als dynamische route.

Maar niet zomaar. De eerste poging brak af met `Missing API key. Pass it to the constructor new Resend("re_123")` op `/api/internal/progress-nudge`, en daarna op ontbrekende Supabase-sleutels bij het prerenderen van `/reset-password`. Geen van beide routes is door dit plan aangeraakt.

De oorzaak is de worktree zelf: `frontend/.env.local` staat in `.gitignore` en komt dus niet mee als je met `git worktree add` een nieuwe map maakt. Zonder die variabelen faalt de build op modules die hun client bij het laden al opbouwen. De build slaagde pas met dummywaarden voor `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_API_URL`, `FRONTEND_URL` en `BACKEND_ADMIN_TOKEN`.

Voor een volgende worktree: kopieer `frontend/.env.local` erheen voordat je bouwt, anders lijkt het alsof je wijziging de build sloopt terwijl het de omgeving is. Let ook op dat `npm run build 2>&1 | tail` een exitcode 0 laat zien ook als de build faalt; de pipe maskeert de echte status. Lees de laatste regels, niet de exitcode.

## Afwijkingen van het plan

Het plan is stap voor stap gevolgd. Op zes punten is ervan afgeweken; elk punt komt uit een review die een echt defect of een echte regressie aanwees.

### 1. Uitlijning van de downloadknop hersteld op twee bestaande plekken (commit `9e9bb485`)

Taak 3 gaf `PdfDownloadButton` een `align`-prop met `'start'` als standaard. De component stond daarvóór hard op rechts uitgelijnd, en dat gold ook voor twee al bestaande gebruikers in `app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx`, die het plan niet noemt. Die verloren hun uitlijning stil.

Opgelost door op die twee plekken expliciet `align="end"` mee te geven. Daarmee blijft de standaard uit het plan intact en behouden de oude plekken hun weergave. Tegelijk volgt de foutmelding nu de prop, zoals de documentatie erboven al beloofde.

Restverschil, bewust gelaten: de foutmelding ging van `max-w-48` naar `max-w-xs`. Dat staat zo in de letterlijke code van het plan en is alleen zichtbaar bij een lange foutregel.

### 2. Drie Fail Loud-lekken in de rapport-klaar-mail gedicht (commits `3624f536` en `c35f7fd6`)

De codekwaliteitsreview liep alle paden door de nieuwe `closeCampaignAction` na en vond drie manieren waarop een echte fout onzichtbaar bleef. Dat is precies de klasse fouten die taak 5 moest opruimen, dus ze zijn gedicht.

- **De waarschuwing kon nooit in beeld komen.** `handleClose` zette de melding en riep meteen `router.refresh()` aan. Daarna is de staat niet langer `close_campaign`, en `DashboardStateCard` hing het actie-eiland alleen op bij `copy_reminder` of `close_campaign`. React haalde het eiland dus uit de boom en gooide de melding weg voordat iemand haar kon zien. Het eiland wordt nu onvoorwaardelijk gemonteerd; het bepaalt zelf of het iets toont. De eerste poging (`3624f536`) verplaatste de melding alleen binnen het eiland en loste dit niet op; de review ving dat, waarna `c35f7fd6` de echte oorzaak in `dashboard-state-card.tsx` aanpakte.
- **Alleen de operator mailen zag eruit als succes.** `getOperatorEmail()` levert altijd een geldig adres, dus de ontvangerslijst is nooit leeg. Zonder geaccepteerde eigenaarsuitnodiging en zonder `contact_email` ging er één mail uit, naar Loep zelf, en kreeg de klant niets te zien. Er is nu een pure helper `countCustomerRecipients` en een waarschuwing als er geen enkel klantadres bekend is; het aantal staat ook in `metadata.report_mail.customer_recipients`.
- **Een mislukte `campaign_stats`-query las als "te weinig antwoorden".** De `error` werd weggegooid. Nu wordt hij opgevangen, in `metadata.report_mail.stats_error` gezet, en krijgt de klant een eerlijke melding dat Loep niet kon vaststellen of er genoeg antwoorden zijn.

Er kan altijd maar één waarschuwing terugkomen, in vaste volgorde: statsfout, dan verzendfout, dan geen klantadres.

### 3. Self_send zonder surveylink valt niet meer terug op de oude tekst (commit `6c765ac9`)

`buildReminderText` nam de self-send-tak alleen bij `commsMode === 'self_send' && publicSurveyToken`. Een self_send-campagne zonder token viel daardoor stil terug op de legacy managed-tekst: precies de tekst die belooft dat Loep verstuurt en die geen link bevat, oftewel de fout die taak 6 moest weghalen.

Dit kan vandaag niet gebeuren, want `campaigns.public_survey_token` is `not null default gen_random_uuid()`. Maar niets bij deze helper bewaakte dat, en de waarde komt binnen via een losse cast. Nu geldt: `self_send` bereikt de managed-tekst nooit meer, en zonder bruikbare token komt er een zichtbaar gedegradeerde tekst ("Er is nog geen surveylink beschikbaar voor deze meting") in plaats van een tekst die eruitziet als een bruikbare uitnodiging. Geen throw, want een ontbrekende token mag de dashboardpagina niet slopen.

Bijkomend: `ReminderTextInput.commsMode` is van `string` naar het bestaande type `CommsMode` gegaan.

Een tweede review op die fix vond dat een token van alleen spaties er nog langs glipte: die is waar in JavaScript, dus hij bouwde een link met spaties erin binnen een tekst die er verder uitzag als een normale uitnodiging. Opgelost met `?.trim()` en een eigen test (commit `c18385ab`).

### 4. Documentatiecommentaar herschreven (taak 6)

Het plan zet letterlijk `products/*/definition.py` in een blokcommentaar. De `*/` daarin sluit het commentaar voortijdig en breekt het parsen. Er staat nu `products/{scan}/definition.py`. Alleen de tekst van een commentaar, geen gedragswijziging.

### 5. Uitlijning van de knop op het campagnedetail

De knop op `/campaigns/[id]` lijnt nu links uit in plaats van rechts, omdat het plan daar geen `align` meegeeft en de standaard `'start'` is. Dat past bij het nieuwe kaartontwerp (kop, alinea, knop onder elkaar) en is zo bedoeld, maar het is een zichtbaar verschil met daarvoor.

### 6. Taak 0 en 7 zelf uitgevoerd

Worktree, baselines en de eindverificatie zijn door de coördinator gedaan in plaats van door een subagent; het zijn geen codewijzigingen.

## Bewust niet gedaan

Deze punten kwamen uit reviews, zijn beoordeeld en zijn met opzet blijven liggen. Ze staan hier zodat ze niet verdwijnen.

1. **`RESEND_API_KEY` ontbreekt telt als geslaagde verzending.** `lib/email.ts` logt een `console.warn` en keert normaal terug als de sleutel niet gezet is. In de nieuwe teller telt dat als verstuurd, dus dan verschijnt er geen waarschuwing terwijl er niets is bezorgd. Het plan zet `lib/email.ts` expliciet buiten scope (apart traject). In productie staat de sleutel, dus dit raakt vooral lokale runs, maar het blijft een Fail Loud-gat.
2. **`canManage` staat nu drie keer uitgeschreven**, in beide dashboardpagina's en in de wizardpagina. Een gedeelde helper zou netter zijn, maar het plan schrijft de inline code voor én pint hem met een source-guard-test, en de spec stelt het opruimen van het rechtenmodel expliciet uit. Samenvoegen kan beter mee met blok D of G.
3. **`buildReportOverviewRows` en `buildHrReportDownloadRows` delen hun kwartaalafleiding en filter.** Een gedeelde helper zou drift voorkomen. Niet gedaan, omdat `buildHrReportDownloadRows` op de nominatie staat om via verify-before-delete te verdwijnen; dan is investeren in gedeelde code de verkeerde kant op. Het commentaarblok erboven zegt welke van de twee je moet hebben.

   Preciezer dan het plan het stelde: `buildHrReportDownloadRows` wordt sinds deze branch alleen nog gelezen door `dashboard/cockpit-index.ts`, en dát bestand wordt zelf nergens meer geïmporteerd behalve door zijn eigen test. De hele keten is dus vermoedelijk dood. Het commentaar in `report-library.ts` is hierop bijgewerkt; het opruimen zelf is een los traject, want het raakt bestanden die het plan expliciet met rust liet.

10. **`isReportReleaseReady` is functioneel gelijk aan het al bestaande `isInsightReleaseReady`**, dat nul aanroepers heeft en die al op main niet had. Het plan koos bewust voor een eigen functie, omdat `isInsightReleaseReady` een `isActive`-gate heeft die hier niet thuishoort. Netto staan er nu drie bijna gelijke predicaten in `response-activation.ts`. Het samenvoegen of weggooien van de dode variant is opnieuw verify-before-delete-werk, geen onderdeel van dit plan.

11. **`/reports` toont voor een gesloten self_send-meting minder dan het dashboard deed toen ze liep.** De overzichtspagina leest alleen `campaign_stats`, waar `total_invited` bij self_send 0 is, en toont daarom eerlijk "12 ingevuld" zonder noemer. De dashboardpagina's hebben de echte noemer wel (`invited_count` uit `campaign_delivery_records`) en tonen tijdens de looptijd "12 van 30 ingevuld (40%)". Dat is een verbetering ten opzichte van main (dat toonde "12 / 0"), en eerlijk in plaats van misleidend, maar de klant ziet na sluiting dus minder dan daarvoor. Hoort bij blok G, waar het dashboard toch meerdere metingen gaat tonen.
4. **`ReminderTextInput` is een verzameling losse velden** waarvan de helft alleen voor `self_send` en de andere helft alleen voor `managed` telt. Een discriminated union zou onmogelijke combinaties onmogelijk maken. Blok D en G werken aan dezelfde naad; daar hoort het thuis.
5. **De slotregel van de rapport-klaar-mail klopt niet voor twee van de drie ontvangers.** "Je ontvangt dit bericht omdat je de eigenaar bent van de Loep-omgeving van X" gaat ook naar het algemene `contact_email` en naar Loep zelf. De zin staat zo in de spec; aanpassen is een copykeuze voor jou, niet voor mij.
6. **`campaign_stats` met `.maybeSingle()`:** nul rijen geeft `{ data: null, error: null }` en leest nog steeds als nul antwoorden. De review heeft dit uitgezocht in `supabase/schema.sql`: de view hangt aan `campaigns` met alleen left joins en zonder `where`, dus één zichtbare campagnerij levert altijd precies één statsrij. En deze code komt er pas na een geslaagde `update` op diezelfde campagne, wat de strengere `is_org_manager`-check al passeerde. Nul rijen kan hier dus niet legitiem voorkomen. Een waarschuwing toevoegen zou vals alarm geven; wel zou een commentaarregel bij de query die aanname vastleggen.
7. **`/beheer/campagnes` gebruikt nog de oude drempel van 5** voor de kolom "Rapport". Een gesloten campagne met 6 tot 9 antwoorden toont daar dus een werkende downloadlink, terwijl het klantdashboard zegt dat er te weinig antwoorden zijn. Dat is een operatorpagina, de operator mag altijd downloaden, en het rapport toont sinds fixronde 1 een eerlijke pagina twee onder de tien. Buiten de scope van dit plan gelaten; wel iets om bij blok G mee te nemen.
8. **`/reports` toont op mobiel de periode en de respons zonder label**, omdat de kolomkop pas vanaf `lg` verschijnt. Dat was al zo en is niet door dit plan geïntroduceerd.
9. **`DashboardStateActions` heeft geen key op campagne.** Zou een gebruiker ooit client-side van het ene campagnedetail naar het andere navigeren terwijl er nog een melding staat, dan kan die melding blijven hangen bij de verkeerde campagne. Bij het sluiten zelf treedt dit niet op: `handleClose` wist de melding aan het begin en `router.refresh()` is geen routewissel.

## Iets wat je moet weten over het proces

Een van de reviewsubagents draaide vroeg in de rit `git stash` en `git stash pop` in de worktree. Daarmee popte hij een oude stash van een andere branch (`codex/add-enps-exit-retention`), kreeg conflicten, en zette de worktree daarna terug met `git reset --hard HEAD`. Gecontroleerd en in orde: alle vier stash-entries staan er nog, alle drie de worktrees zijn schoon, en er is niets verloren. Alle volgende subagents kregen een expliciet verbod op stash-commando's mee. De stash-stapel wordt gedeeld met de andere sessie in `.worktrees/ronde-2`, dus dit had misgekund.

## Handmatige controle na deploy (Lars)

In deze sessie waren geen testinloggegevens beschikbaar, dus dit is niet in de browser gecontroleerd. Onderstaande punten zijn de dingen die geautomatiseerde tests hier niet kunnen aantonen.

1. Log in als eigenaar van een testorganisatie met een gesloten meting met tien of meer ingevulde vragenlijsten. Op het campagnedetail staat "Je rapport staat klaar" met een werkende downloadknop, en de PDF opent.
2. `/reports` toont die meting onder "Beschikbaar nu" met een knop "Download PDF", en lopende metingen onder "Nog niet beschikbaar". Controleer ook of het menu links nu "Rapporten" heet in plaats van "Bespreking".
3. Sluit een meting met tien of meer antwoorden. Controleer dat de rapport-klaar-mail aankomt op het eigenaarsadres, op het contactadres van de organisatie en op hallo@getloep.nl.
4. Sluit een meting met minder dan tien antwoorden. Er komt geen mail, en het dashboard zegt eerlijk dat er te weinig antwoorden zijn voor een rapport. Het belooft nergens meer een e-mail die niet komt.
5. Bekijk bij een lopende meting de herinneringstekst op het dashboard. Die bevat de surveylink, of bij afdelingsrapportage een regel per afdeling, en belooft nergens dat Loep verstuurt. Controleer ook de invultijd: Loep Behoud hoort "ongeveer 6 minuten" te zeggen, niet "10-15 minuten".
6. Log in met een account dat lid is maar geen eigenaar. Dat account ziet de status zonder knoppen en kan `/campaigns/<id>/setup` niet openen: het wordt teruggestuurd naar het campagnedetail.
7. Controleer op `/campaigns/<id>/beheer` (operator) of de twee downloadknoppen er nog goed uitzien; hun uitlijning is aangeraakt.
8. De waarschuwing bij een mislukte mail is niet in een browser te reproduceren zonder de mailverzending te laten falen. Als je het toch wilt zien: sluit een campagne terwijl `RESEND_API_KEY` op een ongeldige waarde staat. Let op dat een *ontbrekende* sleutel geen waarschuwing geeft (zie punt 1 onder "Bewust niet gedaan").

## Vervolg

Blok D (sluitdatum en herinneringsdag door de klant, de dode secundaire knoppen echt maken), blok E (drempels afdwingen, afdelingen voorvullen), blok G (meerdere metingen op het dashboard) en par. 4.6 (de responsnoemer in het rapport, die op de merge van stresstest ronde 2 wacht) staan nog open. Het tweede plan hoort de punten 2, 4 en 7 uit "Bewust niet gedaan" mee te nemen, want die raken dezelfde bestanden.
