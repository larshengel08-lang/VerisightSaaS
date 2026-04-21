# Report Truth Baseline

## Status

Status: canoniek reporting truth baseline.

This file defines reporting source precedence and the boundary between embedded baseline, target architecture, buyer-facing mirror and appendix / technical depth.

## Korte samenvatting

Dit document legt de huidige rapportwaarheid vast voor de canonfase van Verisight. De inhoudelijke baseline start bij de echte embedded rapportoutput en niet bij de HTML blueprint of CSS-bronnen. ExitScan is nu de sterkste embedded baseline. De v3 rapportarchitectuur is de scherpste target grammar voor gedeelde rapportlogica, met name voor de verdere normalisatie van RetentieScan. Buyer-facing mirrors mogen de managementlezing spiegelen, maar mogen de architectuur niet bepalen. Technische diepte blijft expliciet gescheiden van het executive verhaal.

## Doel

Het doel van deze baseline is:

- vastleggen welke bronnen in deze fase leidend zijn
- expliciet maken wat "current embedded baseline" is en wat "target architecture" is
- borgen dat visual blueprints en rendererwerk pas na canon en methodische governance leidend mogen worden
- voorkomen dat ExitScan, RetentieScan, voorbeeldoutput, preview en technische diepte opnieuw door elkaar gaan lopen

## Huidige baseline of canon

### Current embedded baseline

De huidige embedded baseline is de combinatie van:

- `docs/examples/voorbeeldrapport_verisight.pdf` als sterkste actuele embedded referentie voor ExitScan
- `docs/examples/voorbeeldrapport_retentiescan.pdf` als actuele embedded referentie voor RetentieScan-runtime
- `docs/active/REPORTING_SYSTEM_SHARPENING_PLAN.md`
- `docs/active/REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md`
- `docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md`
- `docs/reference/METHODOLOGY.md`

Binnen deze laag geldt:

- ExitScan is de sterkste embedded managementbaseline
- RetentieScan is inhoudelijk sterk, maar nog niet overal op exact hetzelfde canon-niveau als ExitScan
- de actuele voorbeeldrapporten tellen zwaarder dan abstracte visual of rendererbeschrijvingen

### Target architecture

De target architecture is de gedeelde rapportgrammar zoals aangescherpt in:

- `v3 rapport architectuur.txt`

Binnen deze laag geldt:

- de v3 architectuur is target grammar, niet automatisch live recipe
- RetentieScan v3-architectuur geldt als expliciete target grammar voor verdere normalisatie
- de target grammar beschrijft de gewenste leesorde, laaggrenzen en methodische plaatsing
- de target grammar forceert nog geen identieke recipes voor alle productlijnen

### Buyer-facing mirror

De buyer-facing mirror is elke laag die het rapport verkoopt, uitlegt of samenvat naar buiten toe, zoals:

- voorbeeldrapporten als showcase of illustratieve mirror
- preview- en commerciële vertellagen
- managementsamenvattingen die de rapportlezing spiegelen

Binnen deze laag geldt:

- buyer-facing mirrors moeten de canonieke managementlezing spiegelen
- buyer-facing mirrors mogen de rapportarchitectuur niet overschrijven
- scherpere verkooptaal mag nooit harder claimen dan de canon en methodiek dragen

### Appendix / technical depth

De appendix en technische diepte omvatten:

- SDT-uitleg
- item- en factorbasis
- werkfactorsignaal-logica
- banding- en drempeluitleg
- technische verantwoordingsblokken

Binnen deze laag geldt:

- technische diepte ondersteunt vertrouwen, maar stuurt niet de executive leesvolgorde
- appendix is de expliciete plek voor technische verantwoording
- technische diepte mag niet teruglekken als hoofdarchitectuur van het managementrapport

## Belangrijkste beslissingen

- ExitScan is de huidige embedded baseline voor rapporttoon, leesdiscipline en eerste volledige normalisatie.
- RetentieScan v3-architectuur is de target grammar voor gedeelde rapportlogica en verdere recipe-normalisatie.
- De canon start bij echte rapportoutput, actieve reporting-plannen en `METHODOLOGY.md`.
- De HTML blueprint en CSS-bronnen zijn in deze stap geen architectuurbron, maar latere visual/governance-input.
- Het onderscheid tussen `current embedded baseline`, `target architecture`, `buyer-facing mirror` en `appendix / technical depth` is verplicht en moet in latere reporting-besluiten zichtbaar blijven.
- Management-first lezen blijft leidend: executive read eerst, methodische nuance zichtbaar maar ondergeschikt, appendix voor technische diepte.

## Structuur / regels

### Bronhierarchie voor deze fase

Gebruik deze volgorde wanneer bronnen spanning geven:

1. actuele embedded voorbeeldrapporten plus actieve reporting-plannen
2. `docs/reference/METHODOLOGY.md`
3. `v3 rapport architectuur.txt` als target grammar
4. buyer-facing mirrors
5. HTML blueprint en CSS als latere visual/governance-input

### Behouden lagen

Deze lagen zijn inhoudelijk behouden en vormen de basis van de canon:

- cover en context
- respons of read-quality laag
- bestuurlijke handoff
- score- of signaalduiding
- signalen in samenhang
- drivers en prioriteiten
- route en actie
- compacte methodiek / leeswijzer
- technische appendix

### Samengevoegde lagen

Deze lagen mogen productspecifiek samengevoegd worden zolang de grammar herkenbaar blijft:

- respons met bestuurlijke handoff
- scoreduiding met bredere signalensynthese, maar alleen als trust en leesbaarheid niet verslechteren
- SDT- en factoruitleg in een compactere hoofdlaag wanneer productlogica daarom vraagt

### Verplaatste lagen

Deze keuzes zijn expliciet verplaatst en horen niet meer dominant in de executive opening:

- technische diepte naar appendix
- uitgebreide methodische verantwoording uit de managementopening
- visual blueprint-beslissingen naar latere governancefase
- renderer- en templatebesluiten naar na canon en visual governance

## Productspecifieke verschillen

### ExitScan

- ExitScan is de leidende embedded baseline.
- ExitScan is de eerste volledig uit te werken recipe binnen de gedeelde grammar.
- ExitScan is nu de eerste volledig gemigreerde recipe binnen het actieve reporting-systeem.
- ExitScan geldt daarmee als actieve baseline voor gedeelde reporting grammar, visual masters en implementatievolgorde.
- Verdere ExitScan-wijzigingen zijn vanaf hier bugfix-only, tenzij een latere canonbeslissing expliciet verandert wat het rapport moet zijn.
- ExitScan leest als terugkijkende vertrekduiding, zonder diagnose, causaliteitsclaim of individuele predictorframing.

### RetentieScan

- RetentieScan is inhoudelijk sterk en blijft expliciet in scope als gedeelde grammar-target.
- RetentieScan is nu ook volledig gemigreerd naar de gedeelde reporting grammar en visual master families, met behoud van productspecifieke recipe-logica.
- RetentieScan geldt daarmee naast ExitScan als actieve baseline voor het reporting-systeem.
- Verdere RetentieScan-wijzigingen zijn vanaf hier bugfix-only, tenzij een latere canonbeslissing expliciet verandert wat het rapport moet zijn.
- RetentieScan wordt niet naar een identieke ExitScan-recipe geforceerd.
- RetentieScan blijft lezen als vroegsignalering op behoud op groeps- en segmentniveau, zonder diagnose, causaliteitsclaim of individuele predictorframing.

## Guardrails

- Behandel de HTML blueprint niet als architectuurbron.
- Behandel HTML en CSS in deze fase alleen als latere visual/governance-input.
- Maak in deze stap geen renderer- of template-implementatie.
- Neem geen brede redesignbesluiten.
- Canoniseer geen nieuwe productlijnen of portfolio-uitbreidingen.
- Laat de appendix expliciet de plek voor technische diepte blijven.
- Laat management-first lezen altijd voorgaan op methodische volledigheid in het hoofdrapport.

## Acceptance

Deze baseline is bruikbaar als:

- ExitScan expliciet als huidige embedded baseline is vastgelegd
- RetentieScan v3-architectuur expliciet als target grammar is vastgelegd
- buyer-facing mirror en technische diepte niet langer met architectuur worden verward
- de drie nieuwe reporting-docs dezelfde bronhierarchie en taalgrenzen gebruiken
- de documenten niet botsen met de bestaande reporting-plannen en voorbeeldrapporten

## Assumptions / defaults

- Wanneer huidige embedded output en latere visual docs elkaar tegenspreken, wint in deze fase de embedded rapportbaseline.
- De voorbeeldrapporten worden behandeld als voldoende representatief voor de huidige managementlezing.
- `v3 rapport architectuur.txt` wordt behandeld als target grammar en niet als directe verplichting tot identieke paginering voor alle producten.
- De eerste governancebasis in deze fase bestaat uit canon en methodische leeslaag, niet uit visual system of rendererbesluiten.
