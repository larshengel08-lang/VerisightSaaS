# PDF Redesign — Design Spec
**Datum:** 2026-06-12  
**Status:** Goedgekeurd door gebruiker  
**Subsysteem:** 3 van 5 (volgorde: Portfolio → PDF → Email → Dashboard → Site)

---

## Context

De huidige PDF-rapporten zijn functioneel maar voelen als interne documenten. Doel: een rapport dat HR zonder uitleg aan directie kan geven — professioneel, gecureerd, premium. De techniek (WeasyPrint + Playwright fallback) is gebouwd; dit spec beschrijft de visuele richting, paginastructuur en module-architectuur.

**Constraint:** WeasyPrint heeft beperkingen op complexe CSS (sommige grid/flexbox-combinaties, SVG). Alle visuele keuzes moeten binnen WeasyPrint-compatibele CSS blijven.

---

## Visuele richting

**Stijl B — Bold & Statement**

- **Voorblad:** donker navy (`#1a1a2e`), amber accent (`#b8873a`), grote openingsvraag
- **Binnenpagina's:** wit, amber als accentkleur, ruime witruimte
- **Typografie:** consistente hiërarchie door heel het document — één display-lettertype voor koppen, één sans-serif voor body
- **Kleurcodering:** elke scantype krijgt eigen accentkleur (amber = ExitScan, teal = RetentieScan, bruin = Onboarding) — zichtbaar in eyebrow-labels, lijnen en highlights
- **Decoratieve elementen:** subtiele concentrische ringen of loep-uitsnede op voorblad, niet op binnenpagina's

---

## Architectuur: gedeeld skelet, product-specifieke modules

Alle drie de producten delen één visuele template en dezelfde macrostructuur. De analytische kern verschilt per product via aan/uitzettable modules. Dit voorkomt drie aparte templates die elk afzonderlijk onderhouden moeten worden.

### Gedeelde secties (alle producten)

| # | Sectie | Altijd aanwezig |
|---|--------|-----------------|
| 01 | Voorblad | ✅ |
| 02 | Bestuurlijke read | ✅ |
| 03 | Responsbasis & reikwijdte | ✅ |
| 04 | Overzichtsprofiel | ✅ |
| — | **[Product-specifieke kern]** | Zie per product |
| — | Verdiepingspagina's (data-gedreven aantal) | Conditioneel |
| — | Segmentbeeld | Conditioneel |
| — | Open thema's & respondentstemmen | Conditioneel |
| — | Eerste managementspoor | ✅ |
| — | Appendix: volledige vraagresultaten | Conditioneel |
| — | Methodiek, privacy & interpretatiegrenzen | ✅ (laatste pagina) |

---

## Paginaspecificaties

### 01 — Voorblad

**Lay-out:** donker voorblad, product-specifieke accentkleur, vaste Loep-signatuur.

**Verplichte elementen:**
- Loep-logo of wordmark (klein, bovenlinks)
- "VERTROUWELIJK" (klein, rechts, licht contrast — leesbaar in print)
- Scantype-label (bijv. "ExitScan") als eyebrow in accentkleur
- Openingsvraag als grote h1 — product-specifiek (zie hieronder)
- Dunne horizontale amberlijn als visuele scheiding
- Onderste balk met drie klantwaarde-statistieken

**Openingsvraag per product:**
- ExitScan: *"Wat speelde mee bij vertrek?"* (niet "Wat drijft vertrek" — te causaal)
- RetentieScan: *"Waar staat behoud nu onder druk?"*
- Onboarding: *"Hoe landen uw nieuwe medewerkers?"*

**Coverstatistieken (onderste balk) — klantwaarde, geen documentmetadata:**

| Wat tonen | Wat NIET tonen |
|-----------|----------------|
| Aantal respondenten | Paginatelling |
| Responspercentage | "Gemiddelde score" (te vaag) |
| Primair signaal (bijv. "Groeiperspectief") | Datum van aanmaak |

Organisatienaam + periode als subkop onder de openingsvraag.

---

### 02 — Bestuurlijke read

Eén pagina. "Bestuurlijke read" blijft als Loep-merktaal (bewuste keuze — positioneert het document als executive reading experience, niet als generieke samenvatting).

**Bevat:**
1. Kernzin: wat speelde, wat vraagt actie
2. Totaalbeeld in max. 3 zinnen
3. Primaire factor + waarom deze bovenaan staat (compact bewijsblok, max. 3 regels)
4. Relatief sterke factor (wat werkt wél)
5. Responsbasis (verwijzing naar p.03)
6. Eerste managementvraag voor de bespreking

De "Wat valt op?"-inzichten worden geïntegreerd in deze pagina, niet als aparte pagina. Een goed geschreven bestuurlijke read *is* de "wat valt op"-pagina.

---

### 03 — Responsbasis & reikwijdte

Kort. Directie wil weten hoe stevig het beeld is, niet de volledige methodiek.

**Bevat:**
- Uitgenodigd / afgerond / responspercentage
- Meetperiode
- Populatiebeschrijving (alle medewerkers / specifieke groep)
- Segmentstatus (beschikbaar / niet beschikbaar + reden)
- Eén trustregel: "Dit rapport toont groepspatronen. Individuen zijn niet herleidbaar."

Volledige methodiek en AVG-uitleg staan op de *laatste* pagina.

---

### 04 — Overzichtsprofiel

Alle factoren gescoord, gerangschikt, kleurgecodeerd.

**Lezer moet zien:** wat is laag, wat is relatief sterk, wat onderscheidt zich werkelijk.

**Bevat:**
- Alle factoren met score en label
- Visuele rangorde (horizontale bars of bullet-chart — WeasyPrint-compatibel)
- Kleurband: rood/oranje/groen per drempelwaarde
- Geen betekenisloze micro-bars die niets toevoegen

---

## Product-specifieke analytische kern

### ExitScan-kern

Komt **na** het overzichtsprofiel, **vóór** de factordiepte.

**ExitScan 05 — Vertrekcontext** *(ExitScan exclusief)*

De belangrijkste ontbrekende pagina. ExitScan is vertrekduiding, niet primair factoranalyse.

Bevat:
- Hoofdredenen van vertrek (top-3, met n)
- Wat speelde mee (meespelende context, onderscheiden van hoofdreden)
- Werkgerelateerd vs. gemengd beeld
- Verschil tussen hoofdreden en meespelende factor — kort uitgelegd
- Relatie met primaire factor in overzichtsprofiel

**ExitScan 06–08 — Factordiepte** *(data-gedreven: 1 pagina per prioriteitsfactor, max. 3)*

Prioriteit op basis van: factorscore + relatie met vertrekreden + itemniveau + open antwoorden + voldoende n. *Niet* alleen op laagste score.

Per pagina:
1. Factorscore en label
2. Waarom deze factor managementaandacht krijgt (koppeling aan vertrekcontext)
3. Laagste item (letterlijke vraagformulering + score)
4. Hoogste item binnen factor
5. Compacte itemset
6. Open thema of respondentstem als beschikbaar
7. Eerste managementvraag voor deze factor

---

### RetentieScan-kern

**RetentieScan 05 — Behoudscontext** *(RetentieScan exclusief)*

Bevat:
- Retentiesignaal (overall behoudsscore)
- Stay-intent: aandeel dat overweegt te blijven / te vertrekken
- Vertrekintentie op groepsniveau
- Bevlogenheid als aanvullend signaal
- Primaire behoudsfactor bovenaan met reden

**RetentieScan 06–08 — Factordiepte** *(zelfde opbouw als ExitScan, andere koppeling)*

Koppeling aan behoudsrelevantie, niet aan vertrekreden.

---

### Onboarding-kern

**Onboarding 05 — Checkpointoverzicht** *(Onboarding exclusief)*

Bevat:
- Scores per checkpoint (30 / 60 / 90 dagen) naast elkaar
- Waar frictie het sterkst is in de onboardingfase
- Visuele tijdlijn of fasevergelijking

**Onboarding 06 — Landingskwaliteit per domein** *(Onboarding exclusief)*

Bevat:
- Rolhelderheid, begeleiding, informatie/tools
- Sociale landing, cultuurbegrip
- Eerste succeservaring
- Scores per domein per fase (waar data het toelaat)

**Onboarding 07–08 — Factordiepte** *(zelfde opbouw, koppeling aan onboardingfase)*

---

## Gedeelde staartmódules

### Segmentbeeld *(conditioneel)*

Toont alleen als data het toelaat (boven minimum-n per segment).

**Twee states:**

**State A — beschikbaar:**
- Factor × segment heatmap of tabel
- Alleen betrouwbare verschillen (n getoond)
- Geen manager-ranking, geen kleine groepen

**State B — niet beschikbaar:**
> "Segmentverschillen zijn niet getoond om herleidbaarheid te voorkomen. Verdieping opent zodra voldoende responses per groep beschikbaar zijn."

Nooit lege of kunstmatige visualisaties.

---

### Open thema's & respondentstemmen *(conditioneel — alleen als open antwoorden beschikbaar)*

Niet vijf losse quotes op een pagina. Thematisch gestructureerd:

| Thema | n | Betekenis |
|-------|---|-----------|
| [Themanaam] | [n] | Bevestigt / verdiept / nuanceert primaire factor |

Daarna 2–3 gecureerde quotes per thema. Loep selecteert — geen keyword-extractie, geen automatische clustering.

---

### Eerste managementspoor

Geen interventieplan. Gespreksagenda voor de begeleide managementbespreking.

**Bevat:**
- Primair managementthema (top-1 factor + vertrekcontext)
- Tweede aandachtspunt
- Eerste managementvraag voor de bespreking
- Wat nog niet besloten moet worden
- Wie neemt eigenaarschap
- Wanneer opnieuw bespreken
- Optie: geen vervolg / verdieping / kortere vervolgmeting

Toon: geen "risicofactoren" (te hard), geen "interventies" (te prescriptief). Richting: "aandachtspunten" en "gespreksopeners".

---

### Appendix: volledige vraagresultaten *(conditioneel)*

Aanwezig als: dataset > 20 respondenten én > 5 factoren én HR heeft hier baat bij.

Bevat:
- Alle items, score, n
- Eventueel spreiding (als informatief)
- Reverse-coded items gemarkeerd
- Geen managementinterpretatie — ruwe data voor HR-partner

---

### Methodiek, privacy & interpretatiegrenzen *(altijd, laatste pagina)*

Bevat:
- Groepsoutput — geen individuele data
- Minimum-n grenzen en segmentonderdrukking
- Open-tekstgovernance
- Geen diagnose, geen voorspelling, geen causale claim
- AVG-conformiteit en verwerkersgrondslag

---

## Paginatelling

Variabel op basis van data — geen vaste template die altijd 15 pagina's produceert.

| Situatie | Verwacht aantal pagina's |
|----------|--------------------------|
| Kleine dataset, geen segmenten, weinig open tekst | 8–10 |
| Standaard dataset, 3 prioriteiten, beperkte segmenten | 12–14 |
| Rijke dataset, volledige segmenten, open tekst, appendix | 15–18 |

---

## Technische constraints (WeasyPrint)

- Geen CSS Grid met `subgrid` — niet ondersteund
- Flexbox: basis werkt, complexe wrapping met `gap` soms onvoorspelbaar — testen
- SVG: inline SVG werkt, externe SVG-bestanden soms niet — alles inline
- Page breaks: `page-break-before: always` / `page-break-inside: avoid` gebruiken
- Fonts: alleen via `@font-face` met lokale paden, geen Google Fonts CDN in productie
- Donker voorblad: weergave in print kan afwijken van scherm — testen op fysieke print

---

## Buiten scope van deze spec

- ExitScan Live variant (ritmeroute — niet meer actief)
- Cultuurbeeld PDF (bestaat, niet in actieve portfoliopromotie)
- Dashboard-integratie van PDF-download (subsysteem 1)
- E-mail/deelnemerbeheer (subsysteem 2)
