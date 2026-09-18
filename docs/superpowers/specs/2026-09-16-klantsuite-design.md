# Klantsuite: van eerste login tot rapport zonder hulp

Datum: 2026-09-16
Status: concept, wacht op review Lars
Vervolg op: `docs/superpowers/specs/2026-09-11-self-service-onboarding-design.md` (blok D, E en G, daar al akkoord) en de klantreis-walkthrough `docs/klantreis-walkthrough-2026-09-16.md` (6 blokkerend, 26 hinderlijk, 11 cosmetisch). Blok A, B, C en F zijn gebouwd (plan 1, main `aace7e44`).

## 1. Doel en lat

Een HR-manager die voor het eerst inlogt richt zonder hulp een meting in, nodigt uit, herinnert, sluit of verlengt, en pakt het rapport. Op desktop én telefoon. Elke plek waar de walkthrough-persona moest raden, is een fout.

**Lat.** Een herhaalde walkthrough op de testklant (zelfde route, zelfde persona) telt nul blokkerende en hoogstens vijf hinderlijke bevindingen, en de zeven punten uit `docs/testklant.md` zijn groen. De browsercheck is de eindgate van elke bouwbranch; "Lars checkt handmatig" bestaat niet meer.

**Uitgangspunten** (ongewijzigd): Lars maakt organisatie en campagne aan na de intake; vanaf de eerste login doet de klant alles zelf; één eigenaar per klant; onder tien ingevulde vragenlijsten geen rapport; Fail Loud; klantcopy in gewone taal, je/jij, Loep als onderwerp, geen em-dashes.

## 2. Wat de walkthrough leerde, boven op de spec van 11 september

De spec van 11 september beschreef wat er moet komen. De walkthrough liet zien wat een klant nú meemaakt. Zeven dingen verschuiven daardoor de prioriteit of vallen buiten de oude blokken:

1. **De wizard is op een telefoon niet te bedienen** (drie kolommen naast elkaar op 375 px, velden van 30 px). Een HR-manager die de link op haar telefoon opent, strandt bij stap 1.
2. **De activatiepagina** staat in het oude blauwe ontwerp en belooft "je hoeft geen setup te beheren" en "Loep heeft de respondentimport voorbereid": copy uit de managed-flow, twee schermen vóór de wizard die het tegendeel vraagt.
3. **"Ja, verstuurd" is onomkeerbaar zonder bevestiging** en zonder weg terug naar stap 1: een typefout in het aantal (3 in plaats van 30) is niet te herstellen.
4. **Sluiten is voor de klant onbereikbaar** zolang er minder dan tien antwoorden zijn en er geen sluitdatum staat, en er is geen enkele uitleg over de drempel van tien.
5. **Het overzicht kent maar één meting**: campagne C was nergens in de UI te vinden, ook niet na lancering; `/reports` toont "18 van 18" omdat de noemer daar gestarte respondenten is.
6. **Er is geen hulp of contact** in de ingelogde schil; `/help` geeft de marketing-404. De kop toont "Hotmail" (het maildomein) in plaats van de organisatienaam.
7. **Kleine onwaarheden in de schil**: "Geen herinnering versturen" doet niets, "Campagne sluiten" staat als tijdlijnpunt maar is geen knop, de herinneringskaart plakt onderwerp en bericht als één blok, campagne A heeft een "Open rapport"-knop die naar zichzelf linkt, stap 3 zegt "rapport via Loep".

## 3. Scope: vier blokken

| Blok | Inhoud | Bron |
|---|---|---|
| D | Sluitdatum en herinneringsdag door de klant; echte knoppen voor sluiten, verlengen, herinnering overslaan; eerlijke eindtoestand onder de drempel | spec 11-9 par. 7 + walkthrough 3.3, 3.13, 4.1, 4.4 |
| E | Drempels afgedwongen en uitgelegd; velden met toelichting; terug naar stap 1; bevestiging vóór lancering; afdelingen voorgevuld door Lars | spec 11-9 par. 8 + walkthrough 3.2, 3.4, 3.6, 3.10 |
| G | Alle metingen in het overzicht; juiste noemer op `/reports`; "nieuwe meting aanvragen"; hulp en contact in de schil; organisatienaam in de kop | spec 11-9 par. 10 + walkthrough 1.x, 6.x, 7.x |
| H (nieuw) | Wizard responsive; activatiepagina in Loep-stijl met self-service-copy; validatiemeldingen in het Nederlands; dubbele rapportkaart weg; em-dashes uit de UI-copy; mobiel menu met uitloggen | walkthrough 0.x, 3.5, 3.9, 5.x, 7.2, 8.1 |

Buiten scope blijven: zelf campagnes aanmaken door de klant, betaalmuur, de backend-responsnoemer in het rapport (spoor 2), het rapport zelf (spoor 2), en de security-restanten uit de audit.

## 4. Blok D: de meting heeft een begin, een einde en een herinnering

### 4.1 Wizard stap 1 krijgt twee velden

- **Sluitdatum.** Standaard start + 21 dagen; minimaal start + 7, maximaal start + 90. Toelichting: "Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; verlengen kan later met twee weken per keer."
- **Herinnering.** Keuze: 3, 5 (standaard) of 7 dagen na de start, of "geen herinnering". Toelichting: "Op die dag zet Loep de herinneringstekst voor je klaar; jij verstuurt hem vanuit je eigen mail." De herinneringsdag moet vóór de sluitdatum liggen.

Opslag: `campaigns.closes_at` (RLS staat de eigenaar dit al toe) en `campaign_delivery_records.reminder_config` als `{ enabled, firstReminderAfterDays, maxReminderCount: 1 }`, beide via `saveLaunchSetupAction`. Servervalidatie spiegelt de grenzen; fouten komen terug als `{ ok: false, error }`, nooit als throw. Datumfouten in het Nederlands, niet de browsermelding "Value must be ...": het datumveld krijgt `min`, én de server geeft "Kies een datum vanaf vandaag" terug.

### 4.2 Stap 3 wordt echt, en de tijdlijn krijgt datums

Stap 3 heet "Volgen en afronden" en toont ná de lancering de tijdlijn met echte datums: start (datum), herinnering (datum of "geen"), sluit (datum), en de regel "Rapport downloaden zodra de meting gesloten is met minimaal 10 ingevulde vragenlijsten." De tekst "rapport via Loep" verdwijnt. Vóór de lancering staat dezelfde vier-regelige vooruitblik gedimd.

Diezelfde tijdlijn met datums staat op élke kaart van een lopende meting (ook de herinneringskaart, die hem nu mist), zodat "Sluitdatum: nog niet gepland" niet meer voorkomt.

### 4.3 Sluiten en verlengen zijn altijd bereikbaar

Op een lopende meting staat altijd een knop **"Meting sluiten"**, ongeacht het aantal antwoorden. De knop opent een eigen dialoog in de app (geen `confirm()` van de browser) die de gevolgen benoemt:

- bij tien of meer: "Je sluit met X van Y ingevuld. Daarna kan niemand meer invullen en staat het rapport klaar."
- onder de tien: "Je sluit met X van Y ingevuld. Voor een rapport zijn minimaal 10 antwoorden nodig; die komen er dan niet. Wil je liever twee weken verlengen?" met twee knoppen: "Twee weken verlengen" en "Toch sluiten".

**Verlengen** = `extendCampaignAction`: `closes_at` wordt max(vandaag, closes_at) + 14 dagen; maximaal drie keer per meting (geteld via auditevents `delivery_lifecycle_changed` met `metadata.extension = true`); daarna alleen sluiten. Eigenaar of operator.

**Verlopen** (`expired`, sluitdatum bereikt) toont dezelfde dialoogkeuzes als hoofdkaart: bij tien of meer "Meting sluiten" primair en "Verlengen" secundair; onder de tien andersom.

**Herinnering overslaan** = `skipReminderAction`: auditevent `send_reminders`, outcome `completed`, `metadata.channel = 'skipped_by_customer'`; `isReminderDue` beschouwt elk `send_reminders`-event op of na de vervaldatum als afgehandeld. De kaart "Vandaag: stuur de herinnering" verdwijnt dan eerlijk.

### 4.4 Herinneringskaart

De herinneringskaart toont de tijdlijn en biedt onderwerp en bericht apart met elk een eigen kopieerknop (zoals de wizard en de "Campagne loopt"-kaart al doen). "Kopieer herinneringstekst" als één blok vervalt. De kaart verschijnt pas op de herinneringsdag; vóór die dag staat op de "Campagne loopt"-kaart alleen "Herinnering: [datum]" in de tijdlijn, zonder de tekst, zodat niemand op dag één een herinnering stuurt.

### 4.5 Gesloten zonder rapport

`processing` met `insufficient_response` wordt een eindtoestand: "Deze meting is gesloten met X ingevulde vragenlijsten. Voor een rapport zijn er minimaal 10 nodig. Wil je opnieuw meten? Mail Loep." met de mailknop uit blok G. Geen "je ontvangt een e-mail" meer.

## 5. Blok E: de klant kan niets fout invullen zonder dat het rapport het vertelt

### 5.1 Eén set drempels

`frontend/lib/response-activation.ts`: `MIN_INVITED_TOTAL = FIRST_INSIGHT_THRESHOLD` (10) en `MIN_INVITED_PER_DEPARTMENT = 5` (spiegel van `MIN_SEGMENT_N` in de backend, met verwijzing over en weer). `MIN_INVITED_COUNT` in `self-send-comms.ts` vervalt.

### 5.2 Wizard

- Niet-segment: `invitedCount >= 10`, client en server. Melding: "Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport."
- Segment: elke afdeling `>= 5`, totaal `>= 10`. Melding per afdeling: "Afdeling X: minimaal 5 deelnemers. Kleinere afdelingen voeg je samen; anders vallen ze in het rapport onder 'Overige afdelingen'."
- **Toelichting bij "Aantal deelnemers"**, per scan: Loep Behoud "Iedereen die je uitnodigt, inclusief parttimers en oproepkrachten. Stagiairs alleen als ze de vragenlijst ook krijgen." Loep Vertrek "Het aantal mensen dat in de meetperiode vertrekt en de vragenlijst krijgt, niet het hele personeelsbestand." Loep Start "Alle nieuwe medewerkers die je in deze ronde uitnodigt."
- **Toelichting bij "Startdatum"**: "De dag waarop je de uitnodiging verstuurt."
- De checkbox "Link getest en werkt" verdwijnt; de testlink blijft.
- **Terug naar stap 1** tot aan de lancering: de wizard onthoudt de stap niet hard; stap 2 heeft een link "Terug naar stap 1", en na herladen opent de wizard op stap 1 met de opgeslagen waarden.
- **Bevestiging vóór "Ja, verstuurd"**: een dialoog "Heb je de uitnodiging naar je medewerkers gestuurd? Daarna telt de meting als gestart en kun je stap 1 niet meer wijzigen." met "Ja, verstuurd" en "Nog niet". Als er niets gekopieerd is, zegt de dialoog dat er nog niets is gekopieerd.
- Ondertekening in de uitnodiging: "Met vriendelijke groet, [organisatienaam]" in plaats van "HR"; de tip "vul je naam in" blijft. De scannaam tussen haakjes ("(Loep Vertrek)") verdwijnt uit de mail: de ontvanger kent Loep niet. De vragenlijstpagina zelf noemt Loep wel.

### 5.3 Voorvullen door Lars

Het beheerformulier krijgt per afdeling een veld "aantal medewerkers" en voor niet-segment een veld "aantal in de doelgroep"; validatie via dezelfde helper; opslag in `segment_departments[].invited_count` en `campaign_delivery_records.invited_count`. De klant ziet de voorgevulde waarden in stap 1 en corrigeert.

## 6. Blok G: het overzicht klopt en er is een uitweg

### 6.1 Alle metingen

`/dashboard` toont de nieuwste actieve meting als hoofdkaart (of de nieuwste als er geen actieve is) en daaronder, zodra er meer dan één meting is, een lijst "Al je metingen" met naam, scan, statuslabel en link. Statuslabels: "Nog in te richten", "Loopt", "Actie nodig", "Gesloten, geen rapport", "Rapport beschikbaar". Elke campagnepagina heeft de link "Alle metingen" terug.

### 6.2 `/reports` met de echte noemer

De rijen krijgen de noemer uit `campaign_delivery_records.invited_count` (één query met `in(campaign_id, ...)`), zodat er "6 van 30" staat en niet "6 van 6". Een niet-gelanceerde meting heet "Nog niet gestart", niet "Meting loopt".

### 6.3 Nieuwe meting aanvragen

Vast blok onderaan `/dashboard` en op de eindtoestand van 4.5: "Klaar voor een vervolgmeting? Dezelfde meting opnieuw kost €1.250. Mail Loep en we zetten hem klaar." Knop `mailto:hallo@getloep.nl` met onderwerp "Nieuwe meting aanvragen: [organisatie]" en een voorgevulde tekst. Adres uit `LOEP_CONTACT_EMAIL` in `lib/loep-contact.ts` (bestaat sinds plan 1).

### 6.4 Hulp en contact in de schil

Nieuwe pagina `/help` in de ingelogde omgeving: de drie stappen in gewone taal (inrichten, uitnodigen en herinneren, sluiten en rapport), de drempels (10 en 5) met waarom, wat de klant zelf kan en wat Loep doet, en één contactblok (hallo@, reactie binnen één werkdag). Link "Hulp" in de sidebar en in het mobiele menu. `/help` staat in `PROTECTED_APP_ROUTES`.

### 6.5 Kop en menu

De kop toont de organisatienaam (uit `organizations.name`), niet het maildomein. Het mobiele menu bevat "Uitloggen" en het accountblok, net als de desktopsidebar.

## 7. Blok H: wat de walkthrough blootlegde buiten de oude blokken

- **Wizard responsive.** Onder 1024 px staan de drie stappen onder elkaar; velden vullen de breedte; de knop "Opslaan en verder" blijft één regel. Controle op 375 px in de browsercheck.
- **Activatiepagina** (`/complete-account`) in het Loep-ontwerp (navy, amber, zelfde knop als de rest) met self-service-copy: "Kies een wachtwoord. Daarna richt je in drie stappen je eerste meting in: startdatum en deelnemers, uitnodigen, volgen en afronden." Geen "respondentimport", "campaign", "surveylogica" of "begeleide inrichting". Beide wachtwoordvelden krijgen dezelfde placeholder-stijl.
- **Dubbele rapportkaart** op een gesloten meting: de statuskaart met "Open rapport" (die naar zichzelf linkt) toont op de campagnepagina zelf geen knop; alleen het rapportblok met de downloadknop blijft.
- **Validatiemeldingen** in het Nederlands, ook voor datumvelden.
- **Em-dashes** uit alle UI-copy in `components/dashboard/*` en `app/(dashboard)/*` (source-guard-test).
- **Onderwerpveld** in wizard en kaarten als één-regelig invoerveld dat niet afkapt.
- **Inlogpagina** lichter: "Log in bij Loep" met e-mail en wachtwoord, de contactregel, en niets over managers of "v2.0".

## 8. Data

Geen schemawijziging. Alle velden bestaan (`closes_at`, `reminder_config`, `invited_count`, `segment_departments`, `campaign_action_audit_events` sinds de migratie van 13 september). `extendCampaignAction` en `skipReminderAction` gebruiken bestaande outcome-waarden en `metadata`.

## 9. Foutgedrag

Server actions geven `{ ok, error?, warning? }`; geen throw naar de error-boundary voor voorspelbare fouten. Elke onomkeerbare actie (lanceren, sluiten) heeft een eigen dialoog die de gevolgen benoemt. Elke afgewezen invoer zegt in het Nederlands wat er mis is en wat de klant kan doen.

## 10. Verificatie

- Pure functies: resolver (expired boven en onder de drempel, skip-reminder, eindtoestand), drempelvalidatie, verleng-datumlogica en de drie-keer-grens, `/reports`-noemer.
- Server actions met gemockte Supabase: `saveLaunchSetupAction` (sluitdatum en herinnering), `extendCampaignAction`, `skipReminderAction`, `closeCampaignAction` ongewijzigd.
- Source-guards: geen `confirm(`, geen em-dashes in dashboardcopy, `/help` in de beschermde routes, activatiepagina zonder managed-copy.
- Baselines: tsc 133, vitest 61 falend met faalset-diff, backend 25 (de backend wordt niet aangeraakt behalve als het beheerformulier een API raakt).
- **Eindgate:** de walkthrough opnieuw op de testklant (agent, zelfde persona, desktop én 375 px), plus de zeven punten uit `docs/testklant.md`, plus reset. Nul blokkerend, hoogstens vijf hinderlijk.

## 11. Uitvoering

Twee plannen, na elkaar (ze raken dezelfde dashboardpagina's), elk in een aparte sessie met per taak twee reviews:

- **Plan 2a: blok D + E** (levenscyclus en drempels): wizard, resolver, acties, dialogen, beheerformulier.
- **Plan 2b: blok G + H** (overzicht en schil): dashboard, `/reports`, `/help`, kop en menu, activatiepagina, responsive wizard, copy-sweep.

## 12. Open punten voor de review

1. De toelichting bij "Aantal deelnemers" per scan (5.2): klopt de omschrijving voor Loep Vertrek met hoe jij het in de intake uitlegt?
2. Ondertekening "[organisatienaam]" in plaats van "HR": akkoord?
3. Verlengen maximaal drie keer, twee weken per keer: dat stond al in de spec van 11 september en blijft; zeg het als je het anders wilt.
