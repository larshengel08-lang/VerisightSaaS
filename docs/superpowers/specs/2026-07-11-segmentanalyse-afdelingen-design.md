# Segmentanalyse per afdeling — design

**Datum:** 2026-07-11
**Status:** goedgekeurd door Lars (brainstormsessie met visuele companion)
**Scope:** campagne-setup (linkgenerator), open-survey-flow (afdelingsparameter + keuzescherm), rapport-v6 (segmentblok), voorbeeldrapport-generator. **Dashboard-segmentweergave voor klant-owners is bewust uitgesteld** tot na de eerste echte campagne met segmenten — segmentverschillen zonder begeleiding leiden tot verkeerde conclusies ("afdeling X is het probleem"); eerst één keer live in een bespreking duiden.

## Aanleiding

Het rapport heeft een segmentanalyse-sectie die altijd de degraded state toont ("niet beschikbaar"). De legacy-renderer (`backend/report.py`, `_build_department_overview_payload`) had een volledig uitgewerkte afdelingsvergelijking die bij de v6-herbouw nooit is overgezet; de scoringlaag berekent `dept_avg` (`backend/scoring.py:449`) nog steeds, maar de data komt nergens aan. Belangrijker: sinds self_send de enige comms-modus is (één gedeelde link, platform kent respondent-identiteit niet), is er structureel geen afdelingsdata meer — `respondent.department` werd alleen gevuld via de oude managed CSV-import.

## Kernbeslissing: twee bewuste modi bij campagne-setup

1. **Zonder segmenten** — één link, geen keuzescherm, geen segmentblok. Exact de huidige flow; bestaande campagnes vallen automatisch in deze modus.
2. **Met segmenten** — HR/Loep definieert bij setup de afdelingslijst en krijgt **uitsluitend afdelingslinks**; een algemene link wordt in de beheeromgeving niet aangeboden. *"Geen afdeling / overig"* is geen systeemgedrag maar een bewuste lijstkeuze: de setup-wizard suggereert actief die optie toe te voegen (met één zin waarom — mensen die nergens onder vallen klikken anders maar wat aan: stille datavervuiling), maar HR beslist.

## Besluiten

### 1. Linkvorm: gevalideerde slug op de bestaande open-link

Zelfde `public_survey_token`, plus parameter: `/survey/open/{token}?afd=<slug>`. Slugs worden bij setup gegenereerd uit de door HR ingevoerde labels (lowercase, spaties → koppelteken). De server valideert de slug bij binnenkomst tegen de lijst van díe campagne — een onbekende of gemanipuleerde waarde wordt **nooit** als nieuw segment opgeslagen (Fail Loud: geen stille nieuwe groepen), maar behandeld als kale binnenkomst (→ keuzescherm). Manipulatierisico geaccepteerd: het ergste dat een respondent kan doen is zichzelf in een andere bestaande afdeling plaatsen — dat kan bij elke variant, incl. zelfrapportage.

### 2. Kale binnenkomst in segment-modus: verplicht keuzescherm

De kale URL kan technisch niet verdwijnen (de afdelingslink ís de kale URL plus parameter; doorsturen verliest parameters). In segment-modus is een kale binnenkomst daarom nooit een geldige route: de bestaande open-link-startpagina (`/survey/open/{token}`) toont dan één extra stap — *"Bij welke afdeling werk je?"* — met **precies de lijst die HR definieerde**, verplicht kiezen, géén automatische ontsnappingsoptie van systeemwege. De respondent herstelt de routering die de kwijtgeraakte parameter had moeten doen.

Dit staat vóór de vragenlijst (routering), niet erna (identificatievraag) — psychologisch wezenlijk anders voor de anonimiteitsbeleving. Komt iemand mét geldige `?afd=` binnen, dan wordt het scherm overgeslagen: nul frictie op het hoofdpad. Campagnes zonder segmenten: geen scherm, flow ongewijzigd.

### 3. Opslag

Slug/keuze → bestaand veld `respondent.department` (label, niet de slug — leesbaar in alle bestaande consumenten). Gezet bij de start-POST van de open flow. **Schemawijziging nodig** (anders dan de spreidingsronde): de afdelingslijst moet per campagne worden opgeslagen — nieuw nullable JSONB-veld op Campaign (bijv. `segment_departments`: lijst van `{label, slug}`), `NULL`/leeg = modus "zonder segmenten". Supabase-migratie vereist vóór Railway-redeploy.

### 4. Rapportblok (v6, alle drie scans)

Vervangt de degraded state wanneer er kwalificerende data is; de degraded state blijft bestaan voor campagnes zonder segmenten of met te weinig kwalificerende afdelingen.

- **Kwalificatie (geporteerd uit legacy):** afdeling individueel getoond vanaf n≥5 (`MIN_SEGMENT_N`); minimaal 2 kwalificerende afdelingen, anders degraded state (1 afdeling tegenover de rest = zinloos én privacyrisico); max 8 rijen, kleinere/overige groepen gebundeld als "Overige afdelingen"; sortering op score; voetregel "geen causale ranking" + n≥5-uitleg.
- **Vorm (gekozen uit visuele vergelijking):** tabel met per afdeling: naam, n, signaalscore (kleur = `_factor_color`), bandlabel, en een **spreidingsstrip** (compacte `distribution_svg`-variant) — de visuele handtekening van het rapport doorgetrokken naar segmenten, omdat "is dit héél de afdeling of een deel?" dé MT-vraag is.
- **Strip-gate: n≥10, rapportbreed één regel.** Afdelingen met 5–9 responses krijgen wél hun rij (score, band) maar in de spreidingskolom een mono-regel "spreiding vanaf 10 responses". Bewust géén verlaging naar 5: (a) vijf stippen zijn ruis, en het polarisatiecriterium zou bij n=5 al op 2+2 triggeren — overclaimen op vier mensen; (b) de methodiekpagina definieert 10+ als patroonduiding-drempel — een spreidingsvisual ís patroonduiding; (c) privacy weegt op afdelingsniveau zwaarder: bij n=5 kennen alle vijf elkaar én de leidinggevende.
- **"Overige afdelingen" krijgt nooit een strip** (samengestelde restgroep — spreiding is daar betekenisloos); mono-regel "spreiding niet getoond — samengestelde restgroep".
- **Geen polarisatiezin per afdeling** in v1 (de strip toont het al; per-rij zinnen maken de tabel onleesbaar).
- **Topfactor:** geen kolom (breedte), wel één regel onder de tabel voor de laagst scorende afdeling ("Binnen [afdeling] scoort [factor] het laagst").
- Geen dekkingszin nodig: in segment-modus wordt iedereen gerouteerd (keuzescherm), dus er is geen structurele "zonder afdeling"-restgroep; n<5-groepen vallen zichtbaar onder "Overige".

### 5. Setup-UX (beheeromgeving)

In de campagne-aanmaak/setup (admin, `/beheer` — hybride model: Lars doet setup): keuze "met/zonder afdelingssegmenten"; bij "met": afdelingslabels invoeren (vrije tekst, wizard suggereert "Geen afdeling / overig" als optie), daarna N kopieerbare links (zelfde patroon als de bestaande kopieer-sjablonen in de self-send-flow). Achteraf toevoegen van een afdeling aan een lopende campagne: toegestaan (additief); verwijderen/hernoemen van een afdeling met bestaande responses: niet in v1 (alleen bij 0 responses op dat label).

### 6. Voorbeeldrapport

`generate_voorbeeldrapport.py` seedt afdelingen (bijv. Operations/Sales/Kantoor met realistisch verschillende profielen + één groep onder de drempel om de "Overige"-bucketing te tonen) zodat het segmentblok in alle publieke samples zichtbaar is — het was een expliciete wens dat de segmentanalyse in het voorbeeldrapport staat.

## Wat bewust niet in deze ronde

- Dashboard-segmentweergave voor klant-owners (na eerste echte segment-campagne).
- Optionele afdelingsvraag ín de survey als fallback voor single-kanaal-distributie (QR/poster) — v2; het keuzescherm dekt dat scenario al grotendeels.
- Segmentatie op andere assen (rol-niveau, locatie) — `role_level` bestaat, maar één as tegelijk; uitbreiden kan later op hetzelfde mechanisme.
- Kleur-inversie of andere per-scan-varianten van de strip.
- Hernoemen/mergen van afdelingen met bestaande responses.

## Datastroom

Setup: `Campaign.segment_departments` (JSONB, `[{label, slug}]`) → linkgenerator rendert N links. Survey: `GET /survey/open/{token}?afd=<slug>` → valideer slug → toon start (of keuzescherm bij ontbrekende/ongeldige slug in segment-modus) → start-POST zet `respondent.department = label`. Rapport: `build_report_data` groepeert per-respondent scores op `respondent.department` (hergebruik `factor_resp_scores`-patroon per afdeling voor de strips; `dept_avg`-logica uit scoring als referentie) → segmentblok-renderer in `report_html.py` met `distribution_svg` per kwalificerende afdeling.

## Testen

- Unit: slugvalidatie (geldig/ongeldig/ontbrekend × segment-modus aan/uit), kwalificatieregels (n≥5, min 2 afdelingen, max 8 + Overige-bucketing), strip-gate (n=9 geen strip, n=10 wel), label-opslag.
- Flow: open-link e2e — met geldige slug (geen keuzescherm), kale link in segment-modus (keuzescherm, verplichte keuze), kale link zonder segmenten (ongewijzigde flow), gemanipuleerde slug (→ keuzescherm, geen nieuw segment).
- Render: segmentblok aanwezig bij ≥2 kwalificerende afdelingen; degraded state bij <2 of geen segmenten; "Overige"-rij zonder strip; voetregels aanwezig.
- WeasyPrint: alle drie samples 0 warnings + pagineringscheck (Docker).
- Regressie: volledige suite op bestaande baseline (25 failed) — 0 nieuwe fails.
- Migratie: idempotent SQL-script voor Supabase; documenteer dat migratie vóór Railway-redeploy moet draaien.
