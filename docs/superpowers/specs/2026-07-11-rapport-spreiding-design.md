# Rapport-spreiding, drempel-duiding en quote-transparantie — design

**Datum:** 2026-07-11
**Status:** goedgekeurd door Lars (brainstormsessie met visuele companion)
**Scope:** uitsluitend rapportzijde (`backend/report_html.py` + `backend/report_css.py`). De survey — vragen, flow, opslag — wordt niet aangeraakt. Geen schema-wijziging: alle benodigde data (per-respondent `org_scores`, `sdt_scores`, intentiescores) staat al in de database en wordt al geladen in `build_report_data`.

## Aanleiding

Gap-analyse van het rapport (11 juli): het rapport toont overal uitsluitend groepsgemiddelden. Een gemiddelde van 5.0 kan "iedereen rond de 5" zijn (breed, mild probleem) of "helft op 2, helft op 8" (gepolariseerd, geconcentreerd probleem) — het rapport toont in beide gevallen hetzelfde beeld. Daarnaast: de RAG-banden worden nergens onderbouwd ("waarom is 4.8 kwetsbaar?") en de quote-selectie is willekeurig en onvermeld (eerste 5 in databasevolgorde).

## Besluiten

### 1. Spreidingsvisual: geïntegreerde stippen-op-zone-as

Eén visual per score die drie lagen combineert:

- **As met drie zone-tinten** (subtiele achtergrond, 10%-opacity), met een 2px onderrand in de volle RAG-kleur per zone. RAG-kleuren: `#C0392B` / `#C17C00` / `#3C8D8A` (bestaande gedempte set). **Zonegrenzen = exact de bestaande `_factor_label`-drempels** (kwetsbaar punt / aandachtspunt / relatief sterk) — géén tweede bandensysteem; de zone-labels onder de as gebruiken dezelfde termen als de rest van het rapport.
- **Stippen**: elke respondent één stip (7px, opacity 0.9), horizontaal op de exacte score, verticaal gejitterd (deterministisch, bijv. op index — geen `random`, WeasyPrint-stabiel en reproduceerbaar). Stipkleur = zonekleur.
- **Gemiddelde-marker**: verticale 2px navy lijn met mono-label "GEM X.X" erboven.
- **Zone-aantallen** eronder in mono-labels: "Laag 16 · Midden 7 · Hoog 16" (absolute aantallen, geen percentages — telbare MT-taal).

Implementatie als inline-SVG of pure-CSS div-compositie (zelfde aanpak als bestaande `_mini_bar_svg`); WeasyPrint-compatibel: geen flex-gap, geen CSS-variabelen, geen `inset`.

### 2. Duidingszin bij polarisatie

Onder de visual een gegenereerde zin, **alleen** wanneer het beeld gepolariseerd is:

> **Verdeeld beeld:** 16 van de 39 respondenten scoren in de laagste zone, 16 in de hoogste. Dit gemiddelde beschrijft twee verschillende ervaringen.

**Polarisatie-criterium (mechanisch, geen interpretatie):** beide buitenzones (laag én hoog) bevatten elk ≥ 25% van de respondenten én samen ≥ 60%. Geen zin bij een normaal gespreid of eenzijdig beeld — de zin moet betekenis houden door schaarste.

### 3. Plaatsing

- **Wel:** factorverdieping (de per-factor pagina's, alle drie scans) — bij de factorkop; en de intentiescores in de behoudscontext (Loep Behoud: blijfintentie, vertrekintentie, bevlogenheid).
- **Niet:** overzichtsprofiel (p5) — dat blijft de rustige balkenlijst; appendix blijft tabel.
- Bij intentiescores vervangt de visual niet de bestaande stat-cards met ankervragen; hij komt eronder als compacte strip per intentiescore.

### 4. Ondergrens: n ≥ 10

Zelfde drempel als de bestaande patroonanalyse-grens. Onder n=10: geen spreidingsvisual, geen zone-aantallen — alleen het gemiddelde zoals nu. Geen aparte tussenstaffel. De bestaande methodiekpagina-uitleg over de n≥10-grens dekt dit al; één zin toevoegen dat dit ook voor spreidingsweergave geldt.

**Privacy-rationale:** stippen zijn individuele antwoorden. Bij kleine campagnes wordt raden wie welke stip is realistisch; n≥10 sluit aan op de bestaande, al uitgelegde drempel — één regel, geen nieuwe uitzonderingen.

### 5. Drempel-duiding RAG-banden

- **Voetregel onder het overzichtsprofiel** (eerste plek waar banden verschijnen), één zin: "Banden zijn vaste schaaldrempels, geen benchmark. De rangorde tussen factoren weegt zwaarder dan de kleur — zie Methodiek."
- **Blok op de methodiekpagina** "Hoe de banden werken": de grenswaarden expliciet, de eerlijke onderbouwing (vaste meetlat, geen externe benchmark, intern vergelijkend), en het vervolgmeting-argument: een vaste meetlat maakt meting 1 en 2 vergelijkbaar.
- **Niet:** inline herhaling bij elke factorkop.

### 6. Quotes: alles tonen, thema-indeling eruit

- **Selectie:** alle open toelichtingen tonen t/m 12. Boven 12: de eerste 12 in ontvangstvolgorde, met expliciete vermelding ("Getoond: de eerste 12 van N in ontvangstvolgorde"). Geen inhoudelijke selectie, geen selectie op lengte.
- **Thema-indeling volledig verwijderen:** de trefwoord-classificatie (`_classify`, `THEME_KEYWORDS`-gebruik in `_themed_quotes`, themasamenvatting bovenaan, thema-badge per kaart) vervalt. Trefwoorden kunnen geen negatie onderscheiden ("met mijn leidinggevende was niets mis, het zat 'm in de werkdruk" → label "Leiderschap"); dit is in strijd met het vastgelegde besluit van 2026-04-09 (geen geautomatiseerde analyse op open tekst). De kaarten tonen alleen de geanonimiseerde quote + anonimiseringslabel.
- Bestaande `MIN_QUOTES_N`-gate (minimaal 5 antwoorden) blijft.
- Duiding van de quotes gebeurt waar die hoort: in de begeleide managementbespreking.

### 7. Bijvangst: onboarding-cover

"Hoe landen uw nieuwe medewerkers?" → persoonsvorm-vrij, consistent met de andere twee covers (die vraagvorm zonder direct aanspreken gebruiken). Voorstel: "Hoe landen nieuwe medewerkers?"

## Wat bewust niet in deze ronde

- Overzichtsprofiel-balken vervangen door spreidingsvisuals (rust van p5 behouden).
- Benchmark-data of normering (bestaat niet; niet suggereren).
- Segmentanalyse-verbetering en vervolgmeting-rapportlaag (aparte blokken uit de gap-analyse).
- Survey- of schemawijzigingen (niets nodig).

## Datastroom

`build_report_data` levert al `pattern_input` met per-respondent `org_scores` (per item) en `sdt_scores`, plus per-respondent intentiescores. Toe te voegen: een aggregatiefunctie `score_distribution(values) -> {zones: (n_laag, n_midden, n_hoog), dots: [scores], polarized: bool}` (pure functie, unit-testbaar) en per factor de individuele factorscores per respondent (gemiddelde van de items van die factor per respondent — al beschikbaar in `pattern_input`).

## Testen

- Unit: `score_distribution` — zonegrens-randen (scores exact op de `_factor_label`-drempels), polarisatie-criterium (net wel / net niet), lege input, n<10-gate.
- Render: spreidingsvisual aanwezig op factorverdieping + behoudscontext bij n≥10; afwezig bij n<10; duidingszin alleen bij gepolariseerde fixture; geen thema-labels meer in quotes-blok; voetregel onder overzichtsprofiel; methodiekblok aanwezig.
- WeasyPrint: render van alle drie samples foutloos met 0 warnings (Docker), pagineringscheck.
- Regressie: volledige backend-suite op bestaande baseline (0 nieuwe fails).
