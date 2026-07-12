# Klant-selfservice afdelingsbeheer in de setup-wizard — design

**Datum:** 2026-07-12
**Status:** goedgekeurd door Lars (brainstormsessie met visuele companion)
**Bouwt op:** `2026-07-11-segmentanalyse-afdelingen-design.md` (segmentmechanisme, slug-links, keuzescherm, rapportblok — allemaal live op main)

## Aanleiding

De afdelingslijst wordt nu door Lars ingevoerd bij campagne-aanmaak (`/beheer`). Dat betekent een intake-rondje per lijstwijziging en legt de verantwoordelijkheid voor juistheid bij de verkeerde partij: de klant kent zijn eigen organisatie. Daarnaast bestaat `invited_count` alleen campagne-breed, waardoor het rapport per afdeling wel n toont maar geen responspercentage — terwijl "Operations: 11 van 14 (79%)" de segmentanalyse direct geloofwaardiger maakt in de bespreking.

## Besluiten

### 1. Rolverdeling: Lars zet segment-modus aan, klant vult de lijst

De aan/uit-keuze ("rapporteren op afdelingsniveau") blijft bij campagne-aanmaak in `/beheer` — dat is een intake-gesprek waar ook de n≥5-verwachting gemanaged wordt ("met 8 afdelingen van 6 man wordt het rapport dunner dan je denkt"). **De afdelingslijst zelf verhuist naar de klant**: de setup-wizard toont een afdelingsstap zodra de campagne in segment-modus staat. Volledig klant-gestuurde segmentkeuze (toggle incl.) is bewust v2, voor wanneer self-service de standaard wordt.

De bestaande admin-invoer in `new-campaign-form.tsx` blijft bestaan als concierge-fallback (Lars kan de lijst desgewenst vooraf invullen); de wizard toont en bewerkt dezelfde data.

### 2. Rechtenmodel: bestaande owner/member-lijn, geen nieuwe regels

Afdelingen invoeren is een schrijfactie en volgt exact de bestaande `is_org_manager`-grens (owner/member schrijft; viewer ziet alles alleen-lezen) — dezelfde lijn als de lanceerdatum/deelnemersaantal-stap die de wizard al heeft. **Implementatie-aandachtspunt:** `segment_departments` staat op de `campaigns`-tabel; klantrollen hebben daar mogelijk geen RLS-update-recht (launch-velden staan op het delivery record). De schrijfactie loopt daarom via een **server action** met expliciete `getAuthAndMembership`-check (owner/member), zelfde patroon als `launch-setup-actions.ts` — niet via een directe client-side Supabase-update. Servervalidatie hervalideert labels/slugs (zelfde regels als `buildSegmentDepartments`); daarmee krijgt de "tweede schrijver"-waarschuwing uit de segments.py-docstring meteen zijn beslag.

### 3. Wijzigregels (UI-afgedwongen + server-gevalideerd)

- **Toevoegen**: altijd, ook na lancering. Nieuwe link verschijnt direct in de lijst.
- **Hernoemen/verwijderen**: alleen zolang die afdeling **0 responses** heeft. Zodra er één respons op de afdelingslink staat, vergrendelt de rij (naam-input disabled, 🔒 met uitleg: link is in omloop en er hangt data aan). De server checkt dit onafhankelijk (respondent-count per department-label) — de UI-vergrendeling is UX, de servercheck de grens (Fail Loud, 422 bij poging).
- **Aantal deelnemers per afdeling**: altijd aanpasbaar — het is een noemer, geen datalabel.
- Slug blijft bij hernoemen (van een 0-responses-afdeling) gewoon opnieuw gegenereerd uit het nieuwe label; er is dan nog geen link in omloop die breekt (de klant heeft hooguit een link gekopieerd maar er is niets mee ingevuld — acceptabel, de wizard toont altijd de actuele links).

### 4. Opslag: aantallen bij de afdelingen, totaal afgeleid

`segment_departments` wordt `[{label, slug, invited_count}]` (JSONB — **geen migratie nodig**, alleen shape-uitbreiding; bestaande entries zonder `invited_count` blijven geldig, veld is optioneel). Het bestaande campagne-brede `invited_count` op het delivery record blijft bestaan, maar wordt in segment-modus **automatisch de som** van de afdelingsaantallen — de wizard vraagt het totaal niet meer apart en schrijft de som weg naar het bestaande veld, zodat alle bestaande weergaves (responspercentage in panel/dashboard) ongewijzigd blijven werken. Buiten segment-modus verandert er niets.

### 5. Wizard-UI: alles in één stap (gekozen uit visuele vergelijking)

Eén blok per afdeling in de bestaande navy wizard-stijl: naam-input + aantal-input + "Kopieer link"-knop, met de link-preview eronder. "+" om een afdeling toe te voegen; automatisch optellend totaal onderaan; één verwachtingszin bovenaan ("Elke afdeling krijgt een eigen link. Minimaal 5 deelnemers per afdeling voor zichtbaarheid in het rapport."). Rij-vergrendeling per §3. **Geen apart bevestigingsmoment** (variant B afgewezen): de vergrendeling-zodra-responses is de echte bescherming, niet een bevestigingsklik.

Plaatsing: de afdelingsstap vervangt in segment-modus het bestaande enkelvoudige "aantal deelnemers"-veld in de wizard (het totaal is immers afgeleid) en de linkgenerator-lijst in het setup-panel toont dezelfde blokken. Minimaal 2 afdelingen vereist voordat de wizard de stap als voltooid markeert (zelfde regel als de bestaande admin-invoer).

### 6. Responspercentage per afdeling in dashboard en rapport

- **Dashboard/setup-panel**: per afdeling "X van Y ingevuld (Z%)" zodra `invited_count` bekend is; zonder aantal alleen X (eerlijke degradatie, geen fake noemer).
- **Rapport**: het segmentblok (`_segment_block`) krijgt een responskolom per afdeling wanneer de noemer bekend is — "n 11/14 · 79%". Bij ontbrekende noemer alleen n (bestaand gedrag). "Overige afdelingen" toont geen percentage (samengestelde noemer is betekenisloos zodra niet alle gebundelde afdelingen een aantal hebben; bij complete data mag de som getoond worden).
- **Voorbeeldrapporten**: generator seedt per-afdeling aantallen zodat de responskolom in de publieke samples zichtbaar is.

## Wat bewust niet in deze ronde

- Klant-gestuurde segment-toggle (v2, zie §1).
- Respondent-flow, keuzescherm, slugvalidatie bij binnenkomst — ongewijzigd (vorige ronde).
- Per-afdeling reminders of per-afdeling sluiting — buiten scope.
- Verwijderen/hernoemen van afdelingen mét responses (blijft onmogelijk, ook voor admin, behalve via SQL).

## Datastroom

Wizard (client, owner/member) → server action `saveSegmentDepartmentsAction(campaignId, [{label, invited_count}])` → hervalideert (labels/slugs, ≥2 afdelingen, hernoemen/verwijderen alleen bij 0 responses per label) → schrijft `campaigns.segment_departments` (service role, na membership-check) + som naar delivery record `invited_count`. Rapport: `build_report_data` verrijkt `segment_rows` met `invited` per afdeling (label-match op `segment_departments`); `_segment_block` rendert de responskolom conditioneel. Setup-panel: per-afdeling completed-counts komen uit een respondent-count-per-department query in `beheer-data.ts` (bestaat deels al voor het rapport — hergebruik het patroon).

## Testen

- Unit: som-afleiding (invited_count = som per-afdeling), shape-migratie (oude entries zonder invited_count blijven geldig), hernoemen/verwijderen-guard (0 responses wel / ≥1 respons 422), ≥2-afdelingen-regel.
- Server action: membership-check (viewer → geweigerd), servervalidatie onafhankelijk van client.
- Render: responskolom aanwezig bij bekende noemer, afwezig zonder; "Overige"-regels; percentage-berekening.
- Wizard-UI guard-tests: vergrendeld-bij-responses, totaal-som, kopieerknoppen per rij.
- Regressie: volledige suites op bestaande baselines (backend 25 failed / tsc 133), 0 nieuw.
