# PRODUCT_LANGUAGE_CANON

Last updated: 2026-04-18  
Status: active  
Source of truth: ExitScan embedded runtime truth is the leading language baseline; RetentieScan is a strong core route with partial target-architecture status in the wider chain; shared report grammar is binding as grammar, not as a rigid one-size-fits-all structure.

## Titel

Language And Truth Parity Flow - Product Language Canon

## Korte samenvatting

Deze canon legt vast welke producttaal leidend is over rapport, dashboard, onboarding en buyer-facing uitleg. De kernbeslissing is dat producttaal niet langer primair uit losse marketingpagina's of oudere voorbeeldrapporten mag worden afgeleid, maar uit embedded productdefinities plus de gedeelde report grammar.

## Wat is geaudit

- [LANGUAGE_PARITY_INVENTORY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_PARITY_INVENTORY.md)
- [LANGUAGE_DRIFT_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_DRIFT_MATRIX.md)
- [REPORT_TRUTH_BASELINE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TRUTH_BASELINE.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md)
- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)
- [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/definition.py)
- [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/report_content.py)
- [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py)
- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/exit/definition.ts)
- [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/definition.ts)
- [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)
- [voorbeeldrapport_retentiescan.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_retentiescan.pdf)

## Belangrijkste bevindingen

- De sterkste taalbasis zit al in de embedded definities van ExitScan en RetentieScan.
- Shared grammar is vooral een rapport- en handofftaal en moet daarom breed worden gebruikt, maar niet verward worden met productspecifieke inhoudsblokken.
- Buyer-facing mirrors mogen vereenvoudigen, maar niet verschuiven van `duiding` naar `diagnose`, van `vroegsignalering` naar `voorspelling`, of van `bounded route` naar impliciete suiteclaim.
- Working maturity labels helpen intern met hardening, maar zijn nu nog te prematuur voor brede publieke of technische canonisering.

## Belangrijkste inconsistenties of risico's

- Zonder expliciete taalhiërarchie blijven oudere landingpagekoppen en voorbeeldrapporten concurreren met embedded truth.
- Leveringsvormen zoals `live`, `momentopname` en `retrospectief` zijn nuttig, maar worden te snel ingezet als identiteitstaal.
- Follow-on routes kunnen onbedoeld te groot of te volwassen klinken wanneer begrenzende taal wegvalt.

## Beslissingen / canonvoorstellen

### Taalhiërarchie

1. Embedded truth  
   Productdefinities, report-contentregels en runtime-terminologie in backend en frontend zijn leidend voor productbetekenis, metrichoofdtaal en methodische begrenzing.
2. Shared grammar  
   Gedeelde rapport- en handofftaal is leidend voor hoofdstuktitels, managementflow, leesvolgorde en interpretatie-overgangen.
3. Buyer-facing mirror  
   Buyer-facing pagina's, previews en voorbeeldrapporten spiegelen de canon, maar mogen die niet herdefiniëren.
4. Working maturity labels  
   Interne labels voor hardening- en besluitvorming; nog niet geschikt als publieke productstatus.

### Shared report grammar

De volgende termen zijn canoniek als gedeelde rapportgrammar:

- `Executive cover`
- `Bestuurlijke handoff`
- `Drivers & prioriteitenbeeld`
- `Kernsignalen in samenhang`
- `Eerste route & managementactie`
- `Compacte methodiek / leeswijzer`
- `Segmentanalyse` wanneer segmentdiepte aanwezig is
- `Technische verantwoording` voor methodische appendixlagen

Deze grammar stuurt rapport, dashboardhints, onboardingflow en report-to-action-logica. De grammar verplicht geen identieke inhoudsstructuur per productlijn.

Boundaryregel:

- voor `ExitScan` geldt daarnaast een vaste P1-P9 rapportarchitectuur
- shared grammar mag die vaste ExitScan-opbouw niet reduceren, samenvoegen of herordenen

### Cross-layer managementtaal

De volgende termen zijn canoniek over rapport, dashboard en onboarding:

- `managementsamenvatting`
- `bestuurlijke handoff`
- `eerste managementvraag`
- `eerste managementsessie`
- `eerste route`
- `eerste eigenaar`
- `eerste stap`
- `reviewmoment`

### ExitScan canon

Hoofdpositionering:

`ExitScan is een begeleide exitscan voor terugkijkende vertrekduiding op groepsniveau.`

Hoofdtermen:

- `vertrekduiding`
- `vertrekbeeld`
- `frictiescore`
- `signalen van werkfrictie`
- `hoofdredenen`
- `meespelende factoren`
- `eerdere signalering`
- `werkhypothesen`
- `bestuurlijke handoff`

Toegestane ondersteunende termen:

- `retrospectief`
- `live`
- `baseline`
- `verloopanalyse`

Verboden of te harde termen als hoofdterm:

- `diagnose`
- `causale verklaring`
- `objectieve oorzaak`
- `voorspelmodel`
- `exit-analyse` als vervanging van `exitscan`
- `Begrijp waarom medewerkers vertrekken` als primaire productdefinitie

Canonregel:

`retrospectief` en `live` beschrijven de inzet- of leveringsvorm, niet de productidentiteit. ExitScan blijft primair een route voor terugkijkende vertrekduiding.

### RetentieScan canon

Hoofdpositionering:

`RetentieScan is een compacte scan voor vroegsignalering op behoud op groeps- en segmentniveau.`

Hoofdtermen:

- `vroegsignalering op behoud`
- `behoudsdruk`
- `retentiesignaal`
- `groepsbeeld`
- `segmentbeeld`
- `stay-intent`
- `vertrekintentie`
- `bevlogenheid`
- `eerste verificatiespoor`
- `eerste interventie`
- `reviewmoment`

Toegestane ondersteunende termen:

- `medewerkersbehoud`
- `momentopname`
- `live`
- `segmentniveau`

Verboden of te harde termen als hoofdterm:

- `brede MTO`
- `predictor`
- `retentierisico` als hoofdmetric
- `individuele voorspeller`
- `performance-instrument`
- `werkfrictie` als primaire headline

Canonregel:

`retentiesignaal` is de hoofdmetric in taal. `stay-intent`, `vertrekintentie` en `bevlogenheid` zijn aanvullende signalen en mogen niet naar voren schuiven als alternatieve hoofdmetric zonder expliciete metriccanon.

### Follow-on route canon

Portfolio- en verbredingstaal moet de huidige grenzen bewaken:

- `Combinatie` is een portfolioroute, geen derde kernproduct.
- `TeamScan` is een lokale verificatie- of verdiepingsroute, geen brede teamsuite en geen rankinginstrument.
- `Onboarding 30-60-90` is een bounded checkpoint-read, geen algemeen onboarding operating system.
- `Pulse` is een compacte reviewroute, geen derde brede instaproute naast ExitScan en RetentieScan.
- `Leadership Scan` is een bounded management read, geen 360-tool en geen named leader assessment.

### Working maturity labels

De volgende labels zijn toegestaan binnen dit hardening-programma:

- `core_proven`
- `parity_build`
- `bounded_support_route`
- `portfolio_route`

Canonregel:

Deze labels zijn intern en mogen nog niet verschijnen als buyer-facing status, dashboardbadge, pricinglabel of repo-brede eindcanon zonder latere signoff.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- Taalhiërarchie expliciet gemaakt zodat toekomstige fixes, contentupdates en paritykeuzes aan dezelfde bronvolgorde kunnen worden getoetst
- Producttaal per kernroute en per follow-on route begrensd om drift naar diagnose-, suite- of statusclaimtaal te voorkomen

## Validatie

- Canontermen zijn rechtstreeks gespiegeld aan embedded productdefinities en huidige report grammar.
- Verboden of te harde termen zijn alleen opgenomen waar ze al in mirrors voorkomen of logisch uit de driftanalyse volgen.
- De canon promoveert geen nieuwe productstatus en verandert geen pricing- of portfolio-besluit.

## Assumptions / defaults

- Buyer-facing detailpagina's zullen later op deze canon worden getoetst, maar zijn in deze stap nog niet herschreven.
- RetentieScan blijft commercieel een kernroute, terwijl taalbeslissingen voor de bredere keten nog voorzichtig target-architectuur kunnen weerspiegelen.
- Wanneer shared grammar en productspecifieke inhoud botsen, wint embedded productbetekenis en wordt de grammar productspecifiek toegepast.

## Next gate

Language parity signoff voorbereiden of, als eerst concrete fix-uitvoering wenselijk is, gerichte buyer-facing copy- en parity-fixes prioriteren op basis van de driftmatrix.
