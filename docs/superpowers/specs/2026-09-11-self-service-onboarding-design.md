# Spoor 1: self-service onboarding, van eerste login tot rapport in eigen hand

Datum: 2026-09-11
Status: concept, wacht op review Lars
Bron: `docs/onboarding-flow-inventaris-2026-09-11.md` (feitelijke kaart van de huidige flow), strategisch besluit 2026-09-11 (het rapport moet zonder Lars als facilitator werken).

## 1. Doel en kader

Een klant die door Lars na de intake is uitgenodigd, doorloopt vanaf de eerste login alles zelf: campagne inrichten, uitnodigen, herinneren, sluiten, rapport downloaden. Loep komt er niet meer aan te pas, behalve bij het aanmaken van organisatie en campagne (contractgebonden, blijft bij Lars) en bij een nieuwe meting (aanvraag via mail).

Het rapport is de deliverable. Nu kan de klant het niet zelf ophalen. Dat is het grootste gat en het eerste dat dicht moet.

Fase: pre eerste betalende klant, concierge. Alles in deze spec is MVP tenzij anders gelabeld. Niets hierin raakt multi-tenancy of modulariteit: alle wijzigingen zitten in de klant-UI, server actions en één backend-noemer; RLS blijft leidend en wordt niet verruimd.

## 2. Besluiten van Lars (11 september)

1. **Rapport onder de drempel:** een campagne met minder dan tien ingevulde vragenlijsten krijgt geen rapport. Bij het verlopen van de sluitdatum kiest de klant: verlengen of toch sluiten zonder rapport.
2. **Kijkersrol:** geschrapt. Eén eigenaar per klant; het rapport is een PDF die zij zelf doorstuurt.
3. **Afdelingen:** Lars vult de afdelingen (met aantallen) voor uit de intake; de klant corrigeert alleen.

## 3. Scope in zeven blokken

| Blok | Wat | Waarom nu |
|---|---|---|
| A | Rapport downloaden door de klant + rapportenpagina | Zonder dit levert het product niets af |
| B | Rapport-klaar-mail repareren | Faalt nu stil; de klant merkt niets van sluiting |
| C | Herinneringstekst uit de juiste bron, met link | Huidige tekst is fout en beschamend |
| D | Sluitdatum en herinneringsdag door de klant; dode knoppen echt maken | Zonder sluitdatum verloopt niets en eindigt niets |
| E | Drempels afdwingen in de wizard; afdelingen voorvullen door Lars | Voorkomt campagnes die nooit een rapport kunnen opleveren |
| F | Rollen opschonen: eigenaar doet, anderen lezen | Kijker ziet nu een wizard die altijd faalt |
| G | Dashboard met meerdere metingen; "nieuwe meting aanvragen" | Vervolgmeting van €1.250 is publiek beloofd en breekt nu de weergave |

Volgorde van bouwen: A en B eerst (klein, direct zichtbaar), dan C, D, E, F, G. Blok A heeft één backend-onderdeel (par. 4.6) dat wacht op de merge van stresstest ronde 2; al het andere is frontend en kan in een eigen worktree parallel.

## 4. Blok A: rapport in eigen hand

### 4.1 Vrijgaveregel

Het rapport is voor de klant beschikbaar als de campagne gesloten is **en** het aantal ingevulde vragenlijsten ten minste `FIRST_INSIGHT_THRESHOLD` (10) is. Nieuwe helper `isReportReleaseReady(totalCompleted, { scanType })` in `frontend/lib/response-activation.ts`, naast de bestaande `isDashboardReleaseReady`. Voor `culture_assessment` blijft de bestaande 30-regel gelden via `getResponseActivationThresholds`.

Consequentie voor het dashboard: `reportReady` in `dashboard/page.tsx` en `campaigns/[id]/page.tsx` gebruikt voortaan `isReportReleaseReady`. Daarmee vuurt de actie "Voldoende respons, sluit de campagne" pas bij tien, niet bij vijf. De copy van die staat wordt "Voldoende respons voor een rapport. Je kunt de campagne sluiten of nog even open laten."

De dashboarddrempel van vijf blijft alleen bestaan als ondergrens voor het tonen van voortgang (bestaand gedrag, ongewijzigd).

### 4.2 Campagnedetail

Op `/campaigns/[id]` in de staat `report_ready` ziet elke rol met `view_report` (eigenaar, en legacy member/viewer) de downloadknop. De tekst "Je rapport is in voorbereiding. Loep neemt contact met je op" en het Calendly-blok verdwijnen voor klanten. De admin-tak blijft functioneel identiek (zelfde knop).

Blok boven de knop:

> **Je rapport staat klaar.** Het antwoord staat op pagina twee. De gespreksagenda achterin is de leidraad voor het gesprek met je MT.

`PdfDownloadButton` krijgt de dashboard-huisstijl (navy knop, geen `bg-blue-600`). Foutmeldingen blijven zoals ze zijn (route geeft `detail` terug).

### 4.3 Rapportenpagina

`/reports` wordt van besprekingsplanner een rapportenoverzicht. Kop "Rapporten", intro: "Elke afgeronde meting staat hier als PDF. Lopende metingen zie je met hun status."

Per campagne één rij: scan, campagnenaam, periode, respons, en rechts:
- gesloten en ≥10 ingevuld: downloadknop (hergebruik `PdfDownloadButton`);
- gesloten en <10: label "Gesloten met X antwoorden, te weinig voor een rapport";
- actief: label "Loopt" (of "Nog niet gestart" als niet gelanceerd).

Calendly en `mailto:` "Plan bespreking" verdwijnen van deze pagina. De sidebar zegt al "Rapporten" (`dashboard-shell.tsx`), maar `shell-navigation.ts` noemt dezelfde route nog "Bespreking" (regels 188 en 234, cockpit-labels en breadcrumb): beide naar "Rapporten".

### 4.4 Report-route

`/api/campaigns/[id]/report` blijft ongewijzigd: `canDownloadCampaignReport` staat pdf al toe voor elke rol met `view_report`. De service-role-fallback in `organization-secrets.ts` blijft (bekende MEDIUM-hardening, buiten deze spec).

### 4.5 Segmentexport

`showSegmentSummaryExport` blijft standaard uit voor klanten (bestaand gedrag). Niet in scope.

### 4.6 Backend: responsnoemer in het rapport (wacht op ronde 2)

`build_report_data` in `backend/report_html.py` zet `n_invited = len(respondents)`. Bij `self_send` zijn dat gestarte respondenten, niet uitgenodigden. Nieuw:

- als `campaign.comms_mode == "self_send"` en `campaign.delivery_record.invited_count` is gezet: `n_invited = invited_count`, `completion = n_completed / n_invited`;
- als `self_send` zonder `invited_count` (mag na blok E niet meer voorkomen, wel bij oude data): `n_invited = None`, en de responsbasis toont "aantal uitgenodigden niet bekend" in plaats van een percentage (Fail Loud, geen 100%-schijnrespons);
- `managed`: ongewijzigd.

`completion_pct` mag boven de 100 uitkomen als er meer is ingevuld dan uitgenodigd (klant vulde te laag aantal in); het rapport kapt af op 100 en zet een regel "meer ingevuld dan uitgenodigd; controleer het ingevulde aantal". Dit blok raakt dezelfde regels als par. 6 van de ronde-2-spec (responsregels <50%/<30%); die regels moeten op deze noemer draaien. Bouwen ná de ronde-2-merge, met de stresstest-harnas als regressiegate.

## 5. Blok B: rapport-klaar-mail

`closeCampaignAction` in `dashboard-actions.ts`:

- Ontvangers: alle e-mailadressen uit `org_invites` met `org_id` = organisatie, `role = 'owner'`, `accepted_at is not null`, plus `organizations.contact_email`. Ontdubbeld op kleine letters. Geen `profiles.email` (bestaat niet), geen niet-bestaande rollen.
- Verstuur alleen als `isReportReleaseReady` waar is voor het aantal ingevulde vragenlijsten. Bij sluiting onder de drempel geen mail; het dashboard toont de eerlijke staat (par. 7.5).
- Kopie naar de operator: `LOEP_OPERATOR_EMAIL` (env, standaard `hallo@getloep.nl`), zodat Lars weet dat een rapport is vrijgegeven.
- Template `rapport-gereed.ts`: Calendly-blok weg; tekst "Het rapport voor [campagne] staat klaar in je dashboard. Begin op pagina twee." Knop "Open je dashboard" naar `${NEXT_PUBLIC_SITE_URL ?? 'https://www.getloep.nl'}/campaigns/[id]`. Onderregel "Je ontvangt dit bericht omdat je de eigenaar bent van de Loep-omgeving van [organisatie]."
- Foutgedrag: sluiten is al gelukt als de mail faalt. Resultaat wordt `{ ok: true, warning: 'Campagne gesloten. De e-mail naar [n] adres(sen) kon niet worden verstuurd.' }`; `DashboardStateActions` toont de waarschuwing. Het auditevent krijgt `metadata.report_mail = { sent: number, failed: number }`. Geen stille `console.error` meer als enige signaal.

## 6. Blok C: uitnodigings- en herinneringstekst uit één bron

Eén bron voor klantteksten: `frontend/lib/self-send-comms.ts`.

- `buildInviteTemplate` neemt de "waarom"-regel per scan (`SCAN_WHY`) uit de wizard over; de wizard importeert de helper in plaats van een eigen `buildInviteBody`.
- `buildReminderTemplate` blijft, maar krijgt een optionele `departmentLinks: { label, url }[]`. Bij segmentmodus vervangt een lijst "Gebruik de link van je eigen afdeling:" gevolgd door één regel per afdeling, de enkele link.
- Invultijd: één constante `SURVEY_DURATION_LABEL: Record<ScanType, string>` in `lib/campaign-setup.ts`, met de waarde die de vragenlijst zelf noemt (Loep Behoud: "ongeveer 6 minuten", uit `backend/products/retention/definition.py` `survey_intro`; Vertrek en Start: overnemen uit hun `survey_intro`; als daar geen tijd staat: "een paar minuten"). Uitnodiging en herinnering gebruiken die constante; "10–15 minuten" verdwijnt.
- Ondertekening: "HR" blijft de standaard; de bestaande hint "vul je naam in" blijft.

`dashboard/page.tsx` en `campaigns/[id]/page.tsx` bouwen `reminderText` voortaan zo: `comms_mode === 'self_send'` → `buildReminderTemplate(...)` met de surveylink (of afdelingslinks); `managed` → ongewijzigd `buildParticipantCommunicationPreview` (alleen legacy). `RunningStateCard` en de `copy_reminder`-actie tonen dus dezelfde, juiste tekst.

Geen em-dashes in klantteksten (bestaande regel); de huidige templates bevatten er twee, die gaan mee.

## 7. Blok D: sluitdatum en herinneringsdag door de klant

### 7.1 Wizard stap 1 krijgt twee velden erbij

Naast startdatum en aantallen:

- **Sluitdatum** (datumveld). Standaard startdatum + 21 dagen. Grens: minimaal start + 7, maximaal start + 90. Toelichting: "Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; je kunt later verlengen."
- **Herinnering** (keuze): "3 dagen na start", "5 dagen na start" (standaard), "7 dagen na start", "geen herinnering". De herinneringsdag moet vóór de sluitdatum liggen. Toelichting: "Op die dag krijg je in je dashboard de herinneringstekst klaar om te versturen."

Opslag via `saveLaunchSetupAction` (bestaand, uitgebreid): `closes_at` op `campaigns` (RLS `org_managers_can_update_campaigns` staat eigenaar toe; geen migratie), `reminder_config` op `campaign_delivery_records` als `{ enabled, firstReminderAfterDays, maxReminderCount: 1 }`. Servervalidatie spiegelt de grenzen hierboven; ongeldige invoer → `{ ok: false, error }`, geen throw. `confirmLaunchAction` idem: `{ ok: false }` in plaats van throw.

`setClosesAtAction` in `/beheer/campagnes` blijft voor de operator bestaan.

### 7.2 Stap 3 wordt echt

De placeholder "Volgen & rapport" wordt na de lancering een actieve kaart "Volgen en afronden" met de tijdlijn: start (datum), herinnering (datum of "geen"), sluit (datum), en de regel "Rapport downloaden zodra de meting gesloten is met minimaal 10 ingevulde vragenlijsten." Vóór de lancering blijft de kaart gedimd, met dezelfde vier regels als vooruitblik. Geen extra invoer.

### 7.3 Resolver

`dashboard-state-resolver.ts`:
- verouderde opmerking bij `closesAt` weg; `expired` werkt zodra de klant een sluitdatum heeft;
- `expired` met ≥10: primaire CTA "Campagne sluiten", secundair "Verlengen met twee weken";
- `expired` met <10: primaire CTA "Verlengen met twee weken", secundair "Toch sluiten (geen rapport)"; subtekst "X van Y ingevuld. Voor een rapport zijn minimaal 10 antwoorden nodig.";
- herinneringsdag: secundair "Geen herinnering versturen" wordt echt.

### 7.4 Secundaire acties worden knoppen

`DashboardStateCard` rendert `secondaryActions` via de client-island:
- `extend` → nieuwe `extendCampaignAction(campaignId)`: `closes_at = max(vandaag, closes_at) + 14 dagen`, eigenaar of admin, auditevent `delivery_lifecycle_changed` met summary "Sluitdatum verlengd tot [datum]". Maximaal drie keer verlengen per campagne (geteld via auditevents); daarna alleen sluiten. Grens tegen eindeloos open campagnes.
- `close_without_report` → bestaande `closeCampaignAction` met bevestigingsdialoog "Je sluit met X antwoorden. Er komt geen rapport. Weet je het zeker?".
- `skip_reminder` → nieuwe `skipReminderAction(campaignId)`: auditevent `send_reminders`, outcome `completed`, `metadata.channel = 'skipped_by_customer'`, summary "HR koos ervoor geen herinnering te versturen." `isReminderDue` verandert niet: elk `send_reminders`-event op of na de vervaldatum telt als afgehandeld, of het nu verstuurd of overgeslagen is. Bewust geen nieuwe outcome-waarde: de audittabel staat niet in de repo-SQL (live aangemaakt), dus een onbekende check-constraint is een risico.

### 7.5 Gesloten zonder rapport

`processing` met `insufficient_response` wordt een eindtoestand met eerlijke copy: "Deze meting is gesloten met X ingevulde vragenlijsten. Voor een rapport zijn er minimaal 10 nodig. Wil je opnieuw meten? Neem contact op met Loep." Knop: mailto (par. 10.2). `degraded` blijft `true` want er is geen verwerkingsstatus (bestaand).

`processing` met `generating` ("Je ontvangt een e-mail…") komt door blok B nu overeen met wat er gebeurt; de tekst wordt "Het rapport wordt klaargezet. Je ontvangt een e-mail zodra het beschikbaar is." In de praktijk is het rapport direct na sluiting op te vragen, dus deze staat is zeldzaam: `report_ready` wint zodra `isReportReleaseReady` waar is. Als iemand toch in `generating` belandt (kan niet bij de huidige gates, maar de code houdt de tak), toont de kaart ook de downloadknop.

## 8. Blok E: drempels afdwingen en afdelingen voorvullen

### 8.1 Eén set drempels

Nieuw `frontend/lib/response-activation.ts`:
- `MIN_INVITED_TOTAL = FIRST_INSIGHT_THRESHOLD` (10): minimum aantal uitgenodigden per campagne;
- `MIN_INVITED_PER_DEPARTMENT = 5`: spiegel van `MIN_SEGMENT_N` in `backend/scoring_config.py` (commentaar verwijst over en weer).

`MIN_INVITED_COUNT` in `self-send-comms.ts` vervalt; `self-send-config/route.ts` en `validateInvitedCount` gebruiken `MIN_INVITED_TOTAL`.

### 8.2 Wizard

- Niet-segment: `invitedCount ≥ 10`, client en server (`saveLaunchSetupAction`). Foutmelding: "Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport."
- Segment: elke afdeling `≥ 5`, totaal `≥ 10`, client en server (`prepareSegmentDepartmentsUpdate`). Foutmelding per afdeling: "Afdeling [naam]: minimaal 5 deelnemers. Kleinere afdelingen voeg je samen; anders vallen ze in het rapport onder 'Overige afdelingen'." De bestaande verwachtingszin wordt: "Per afdeling zijn minimaal 5 ingevulde vragenlijsten nodig om apart in het rapport te verschijnen, en vanaf 10 zie je de spreiding."
- De checkbox "Link getest en werkt" verdwijnt (wordt nergens gebruikt, wekt schijnzekerheid). De "Test →"-link blijft.

### 8.3 Voorvullen door Lars

`new-campaign-form.tsx` (operator): bij "Rapporteren op afdelingsniveau" krijgt elke afdelingsregel een veld "aantal medewerkers". Validatie via dezelfde `prepareSegmentDepartmentsUpdate` (≥2 afdelingen, elk ≥5, geen dubbelen). Opslag: `segment_departments` met `invited_count` per afdeling en de som in `campaign_delivery_records.invited_count` (record aanmaken als het nog niet bestaat). Ook niet-segment: veld "aantal medewerkers in de doelgroep" (≥10), naar `invited_count`.

De klant ziet in stap 1 de voorgevulde rijen en aantallen en past ze aan. Vergrendeling na eerste respons blijft zoals gespecificeerd in `2026-07-12-klant-afdelingsbeheer-design.md`.

`comms_mode`: de admin-insert zet al `self_send`. De DB-default blijft `managed` (geen migratie in deze spec); wel een guard-test dat `new-campaign-form.tsx` `self_send` blijft zetten (bestaat al).

## 9. Blok F: rollen

- Uitnodigen blijft altijd `owner` (bestaand). De kijkersrol wordt nergens meer aangeboden; `getCustomerRoleSummary` en de rechtenlogica blijven staan voor legacy leden, maar de UI gaat uit van één eigenaar.
- Beide dashboardpagina's bepalen server-side `canManage = isAdmin || role === 'owner'`. Alleen dan renderen `WelcomeGate`, de wizard, de herinnerings- en sluitacties en de secundaire knoppen. Anders een alleen-lezen kaart met de statustekst en de regel "Alleen de eigenaar van deze Loep-omgeving kan de meting beheren." Dit sluit gat 1 (kijker ziet wizard) en gat 4 (member-inconsistentie) aan de UI-kant. `member` behoudt zijn huidige serverrechten (owner/member in de server actions), maar krijgt geen knoppen; die dubbele waarheid wordt bewust niet in deze spec opgeruimd (geen actieve members).
- De operator (`is_verisight_admin`) blijft alles kunnen.
- Buiten scope, gelogd voor het security-spoor: eigenaar kan via RLS de organisatie verwijderen (geen UI, wel mogelijk via PostgREST) en L12 (member kan owner toekennen).

## 10. Blok G: dashboard met meerdere metingen

### 10.1 Overzicht

`dashboard/page.tsx` haalt alle campagnes op (was: `limit(1)`). Hoofdkaart: de nieuwste **actieve** campagne; is er geen actieve, dan de nieuwste. Daaronder, alleen als er meer dan één campagne is, een compacte lijst "Andere metingen": campagnenaam, scan, statuslabel (afgeleid van `resolveDashboardState(...).kind`: "Nog in te richten", "Loopt", "Actie nodig", "Gesloten", "Rapport beschikbaar") en link naar `/campaigns/[id]`. Geen extra query per rij behalve wat de kaart al nodig heeft; de delivery records en auditevents worden in één keer opgehaald met `in(campaign_id, [...])`.

### 10.2 Nieuwe meting aanvragen

Onder het overzicht een vast blok: "Klaar voor een vervolgmeting? Een nieuwe meting op dezelfde inrichting kost €1.250. Mail Loep en we zetten hem klaar." Knop: `mailto:hallo@getloep.nl?subject=Nieuwe meting aanvragen: [organisatie]&body=[vaste tekst met organisatienaam en laatste campagne]`. Het adres staat in één constante `LOEP_CONTACT_EMAIL` in `frontend/lib/loep-contact.ts`; `/reports` en de `insufficient_response`-kaart gebruiken dezelfde constante. Later kan deze knop achter een betaal- of aanvraagmuur (buiten scope).

### 10.3 Zonder campagne

`no_campaign`-copy: "Loep richt je eerste meting in. Je ontvangt een e-mail zodra je kunt starten. Vragen? Mail hallo@getloep.nl." Dit is de staat direct na activatie, vóórdat Lars de campagne heeft aangemaakt.

### 10.4 Welkomstscherm

`WelcomeGate` blijft op localStorage (gat 19); een tweede keer ballonnen op een ander apparaat is geen schade. Bewust niet aangepakt.

## 11. Wat bewust buiten deze spec blijft

- Zelf campagnes aanmaken door de klant, betaalmuur, Stripe.
- Operator-voortgangsnudge als cron (blijft handmatig).
- Reminder-dispatch via backend (`/api/internal/reminders/dispatch`): het dashboard is de werkende weg.
- Half-doorgevoerde opslag in de wizard (afdelingen wel, datum niet): bestaande partiële melding blijft.
- Service-role-fallback voor de rapportsleutel; org-verwijderrecht van de eigenaar; L12. Naar het security-spoor.
- Gesprekshandleiding, werkvragen en besluitpagina in het rapport: dat is spoor 2 (onbegeleid rapport), eigen spec.
- `home-launcher.ts` / `cockpit-index.ts` opruimen (verweesd, verify-before-delete, los traject).

## 12. Data en migraties

Geen schemawijziging. Alle velden bestaan: `campaigns.closes_at`, `campaign_delivery_records.reminder_config` / `invited_count`, `campaigns.segment_departments`, `org_invites.email`, `campaign_action_audit_events` (alleen bestaande outcome-waarden; het overslaan van een herinnering wordt in `metadata` vastgelegd).

Env: `LOEP_OPERATOR_EMAIL` (optioneel, standaard hallo@getloep.nl).

## 13. Foutgedrag (Fail Loud)

- Server actions geven altijd `{ ok, error?, warning? }` terug; geen `throw` naar de error-boundary voor voorspelbare fouten (DB-weigering, validatie).
- Mail die faalt na een geslaagde sluiting: waarschuwing in de UI en in het auditevent, nooit stil.
- Rapport-noemer onbekend: tekst "aantal uitgenodigden niet bekend", geen percentage.
- Meer ingevuld dan uitgenodigd: afgekapt op 100% met meldregel.
- Downloadfout: bestaande `detail`-melding onder de knop.

## 14. Tests en verificatie

- Pure functies: `isReportReleaseReady`, resolver (expired ≥10 / <10, skipped reminder, insufficient eindtoestand, secundaire acties), `buildReminderTemplate` met afdelingslinks, drempelvalidatie (wizard-helpers en `prepareSegmentDepartmentsUpdate`), `extend`-datumlogica en de drie-keer-grens.
- Server actions: bestaande testpatronen (mocked Supabase) voor `saveLaunchSetupAction` (sluitdatum/herinnering-validatie), `closeCampaignAction` (ontvangerslijst uit `org_invites` + `contact_email`, geen mail onder de drempel, warning bij mailfout), `extendCampaignAction`, `skipReminderAction`.
- Guard-tests op broncode: klant-downloadknop aanwezig in `campaigns/[id]/page.tsx`; geen "Loep neemt contact met je op"; `/reports` zonder Calendly; `MIN_INVITED_COUNT` weg; `new-campaign-form` zet `self_send`.
- Backend: test op `n_invited` uit `invited_count` bij `self_send`, `None`-pad, >100%-pad; stresstest-harnas draait ongewijzigd op de 20 scenario's.
- Baselines: tsc 133, vitest 65 falend (byte-identieke faalset via stash-diff), backend 25 falend.
- Browser: één doorloop op de lokale stack met een eigenaar-account: wizard (voorgevulde afdelingen corrigeren, sluitdatum, herinnering) → lanceren → herinneringstekst met link → sluitdatum verlopen (datum injecteren) → verlengen → sluiten → downloadknop → PDF; en een tweede doorloop die onder de drempel sluit en de eindtoestand toont. Geen testcredentials in de sessie: dit doet Lars, met een checklist in de plan-tekst.

## 15. Open punten voor de review

1. Verleng-grens (drie keer, twee weken per keer): akkoord, of liever onbegrensd?
2. Sluitdatum-grenzen (minimaal een week, maximaal 90 dagen na start): akkoord?
3. Wil je de operator-kopie van de rapport-klaar-mail (zodat je weet dat een klant een rapport heeft)? Standaard aan in deze spec.
