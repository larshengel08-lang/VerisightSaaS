# Report Visual Policy

## Korte samenvatting

Dit document legt de visuele governance-laag boven op de reporting canon vast. De canon-documenten bepalen wat een rapport is, hoe de leesgrammatica werkt en welke methodische grenzen gelden. De visual-documenten bepalen hoe die canon eruitziet in page masters, spacing, hierarchy, card-usage, chart-styling en ritme. De visual-laag mag de canon niet herschrijven. Er is precies één actieve visual truth.

## Doel

Het doel van deze policy is:

- de verhouding tussen reporting canon en visual governance expliciet maken
- één actieve visual source of truth aanwijzen
- vastleggen wat de blueprint en CSS-bestanden wel en niet mogen bepalen
- voorkomen dat visual assets productlogica, methodiek of report grammar zelfstandig wijzigen

## Huidige baseline of canon

De actieve bronvolgorde voor reporting en visual governance is:

1. `docs/reporting/REPORT_TRUTH_BASELINE.md`
2. `docs/reporting/REPORT_STRUCTURE_CANON.md`
3. `docs/reporting/REPORT_METHODOLOGY_CANON.md`
4. dit document
5. `docs/reporting/visual/REPORT_VISUAL_MASTERS.md`
6. `docs/reporting/visual/REPORT_VISUAL_BLUEPRINT_ACTIVE.html`
7. `docs/reporting/visual/REPORT_VISUAL_TOKENS.css`
8. `docs/reporting/visual/REPORT_VISUAL_PROOFS.css`

Daarmee geldt:

- canon docs bepalen wat een rapport is
- visual docs bepalen hoe het eruitziet
- renderer- en template-implementatie volgen pas na deze governance-laag

## Belangrijkste beslissingen

- De reporting canon is inhoudelijk en architectonisch leidend.
- De visual governance-laag is leidend voor vorm, ritme en page-master discipline.
- Er is precies één actieve visual truth:
  - `REPORT_VISUAL_BLUEPRINT_ACTIVE.html`
  - `REPORT_VISUAL_TOKENS.css`
  - `REPORT_VISUAL_PROOFS.css`
- De v2 blueprint-set is gekozen als actieve visual referentie en geland onder `docs/reporting/visual`.
- Oudere governance docs die nog een eerdere 6-page of eerdere v3-flow als actief behandelen, zijn gedegradeerd en mogen de canon niet meer overrulen.
- ExitScan is de eerste volledig embedded visual recipe.
- RetentieScan blijft buiten deze migratiestap en wordt niet naar de ExitScan recipe geforceerd.

## Structuur / regels

### Wat canon docs bepalen

Canon docs bepalen:

- wat een rapport is
- welke secties en laaggrenzen bestaan
- wat hoofdrapport en appendix zijn
- wat methodologische claims en non-claims zijn
- wat metrics betekenen
- wat productstatus en producttruth zijn
- hoe ExitScan en RetentieScan zich architectonisch tot elkaar verhouden

### Wat visual docs bepalen

Visual docs mogen bepalen:

- page masters
- spacing
- hierarchy
- card usage
- chart styling
- rhythm
- alignment discipline
- typography rhythm
- how-read strips, chrome en surfaces

### Wat visual docs niet zelfstandig mogen wijzigen

Visual docs mogen niet zelfstandig wijzigen:

- section order
- methodology claims
- metric meanings
- product truth
- product status
- product recipes
- appendix boundaries
- reporting thresholds

### Blueprint HTML-status

De blueprint HTML is:

- een visual master reference
- een governance-input voor compositie, zones, hierarchy en styling
- een bruikbare referentie voor latere renderer-implementatie

De blueprint HTML is niet:

- een architecture source
- een source of truth voor productlogic
- een bron voor methodology claims
- een bron voor metric meaning

### CSS-status

De CSS-lagen zijn:

- token/proof layers
- dragers van kleur, type, spacing, surfaces en proof-compositie

De CSS-lagen zijn niet:

- canon op productlogic
- canon op methodology
- canon op metric semantics
- canon op report architecture

### Eén actieve visual truth

Er mag maar één actieve visual truth tegelijk bestaan.

Dat betekent:

- precies één actieve blueprint HTML
- precies één actieve token/base stylesheet
- precies één actieve proof stylesheet
- varianten blijven alleen bestaan als gedegradeerde bron of importbron, nooit als tweede actieve waarheid

### Active visual truth in deze fase

De actieve visual truth in deze fase is:

- [REPORT_VISUAL_BLUEPRINT_ACTIVE.html](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/visual/REPORT_VISUAL_BLUEPRINT_ACTIVE.html)
- [REPORT_VISUAL_TOKENS.css](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/visual/REPORT_VISUAL_TOKENS.css)
- [REPORT_VISUAL_PROOFS.css](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/visual/REPORT_VISUAL_PROOFS.css)

De oorspronkelijke bronbestanden buiten deze map gelden vanaf nu alleen nog als importbron / legacy source:

- `C:/Users/larsh/Desktop/Business/Verisight Visual Blueprint v2.html`
- `C:/Users/larsh/Desktop/Business/styles-v2.css`
- `C:/Users/larsh/Desktop/Business/proofs-v2.css`

## Productspecifieke verschillen

### ExitScan

- ExitScan is de eerste volledig embedded recipe waar de visual masters actief op gemapt worden.
- ExitScan mag de vier master families volledig gebruiken binnen de al vastgelegde canon.
- ExitScan-visual governance mag de expliciete page splits uit de structure canon ondersteunen, maar niet reduceren.

### RetentieScan

- RetentieScan blijft onder dezelfde visual governance-principes vallen waar productlogica dat toelaat.
- RetentieScan wordt in deze stap niet visueel of structureel naar de ExitScan recipe gemigreerd.
- Future inheritance voor RetentieScan betekent hergebruik van masters waar passend, niet copy-paste van ExitScan-paginering.

## Guardrails

- Gebruik de canon docs voor alle vragen over report identity, structure en method.
- Gebruik de visual docs voor alle vragen over hierarchy, spacing, surfaces en rhythm.
- Behandel de blueprint HTML nooit als architectuurbron.
- Behandel de CSS-lagen nooit als methodologische of productinhoudelijke waarheid.
- Laat visual governance geen tweede canon worden.
- Laat visual governance RetentieScan niet impliciet in de ExitScan flow trekken.
- Pas in deze stap geen renderer logic of report architecture aan.

## Acceptance

Deze visual policy is bruikbaar als:

- de scheiding tussen canon en visual governance expliciet is
- er precies één actieve visual truth is aangewezen
- blueprint en CSS een duidelijke, begrensde rol hebben
- oudere visual governance docs niet meer impliciet boven de canon kunnen spreken
- toekomstige implementatie weet welke laag over vorm gaat en welke over betekenis

## Assumptions / defaults

- De v2 blueprint-set is visueel sterk genoeg om als actieve visual referentie te dienen tot een expliciete opvolger wordt goedgekeurd.
- Als een visual idee conflicteert met de reporting canon, wint de canon.
- Als meerdere bestanden hetzelfde visuele onderwerp beschrijven, wint het bestand in `docs/reporting/visual` dat expliciet als active truth is aangewezen.
- Toekomstige renderer-implementatie moet deze visual governance volgen, maar mag de canon niet via styling terug herschrijven.
