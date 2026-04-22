# Report Shared Abstraction Plan

## Status

Status: active derived implementation plan.

This file is not the reporting canon. It inherits precedence from:

- [REPORT_TRUTH_BASELINE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_TRUTH_BASELINE.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_STRUCTURE_CANON.md)
- [REPORT_METHODOLOGY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_METHODOLOGY_CANON.md)
- [TERMINOLOGY_GOVERNANCE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/TERMINOLOGY_GOVERNANCE_CANON.md)

## Korte samenvatting

Dit document beschrijft de eerstvolgende implementatiefase na het bevriezen van ExitScan en RetentieScan als actieve baselines. Het doel is niet om beide producten identiek te maken, maar om veilige gedeelde rendererlagen uit de nu stabiele recipes te halen zonder producttruth, canonbetekenis of visual master gedrag te vervlakken.

## Doel

Het doel van deze planlaag is:

- vastleggen welke delen nu veilig gedeeld kunnen worden
- scherp houden welke delen recipe- of productspecifiek moeten blijven
- een veilige volgorde bepalen voor latere renderer-abstrahering
- regressierisico's expliciet maken voordat code gedeeld wordt

## Huidige baseline of canon

Deze planning bouwt op:

- `docs/reporting/REPORT_TRUTH_BASELINE.md`
- `docs/reporting/REPORT_STRUCTURE_CANON.md`
- `docs/reporting/REPORT_METHODOLOGY_CANON.md`
- `docs/reporting/visual/REPORT_VISUAL_POLICY.md`
- `docs/reporting/visual/REPORT_VISUAL_MASTERS.md`
- de bevroren actieve baselines:
  - `docs/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf`

Binnen deze fase geldt:

- ExitScan en RetentieScan blijven recipe-first referenties
- abstrahering volgt pas na bewezen baseline-stabiliteit
- gedeeld maken is alleen toegestaan waar grammar, mastergedrag en rendererlogica aantoonbaar gelijk lopen

## Belangrijkste beslissingen

- De shared reporting grammar blijft canoniek op documentniveau en wordt niet opnieuw in rendererlogica uitgevonden.
- Visual master behavior mag gedeeld worden waar families echt hetzelfde doen.
- Productspecifieke recipe-volgorde, scoreduiding en managementtaal blijven buiten de eerste abstraheringsslag.
- Shared helpers moeten eerst rendering discipline en layoutveiligheid verbeteren, niet architectuur herschrijven.
- Regressies worden primair bewaakt op page order, master-family mapping, copy boundaries en text safety.
- De huidige shared layer geldt nu expliciet als het bewuste eindpunt van deze abstraheringsfase.
- Verdere renderer-abstrahering stopt hier totdat er expliciet bewijs is van identiek mastergedrag zonder semantisch risico, of totdat de canon zelf verandert.

## Structuur / regels

### 1. Shared reporting grammar

Wat veilig gedeeld kan worden:

- de vaste family-ordening als concept
- canonieke page labels en appendixgrenzen
- gating rules voor conditionele appendixlagen

Wat recipe-level moet blijven:

- exacte productspecifieke paginavulling
- productspecifieke combinatie of splitsing van inhoudslagen
- score- en signaalduiding per product

### 2. Shared visual master behavior

Wat veilig gedeeld kan worden:

- `Cover / Intro`, `Executive Read`, `Analytical Insight` en `Action / Route` als renderer masters
- vaste heading-, intro-, micro-structure- en page-chrome patronen
- spacing, divider, caption, chart-frame en emphasis-surface gedrag per master family

Wat recipe-level moet blijven:

- welke contentblokken per pagina binnen een master landen
- productspecifieke compositiekeuzes zoals RetentieScan P4 versus ExitScan P4

### 3. Shared renderer utilities

Wat als eerste helperlaag gedeeld kan worden:

- section heading builders
- micro-structure builders
- chart/table frame helpers
- page chrome, folio en sample-output markers
- text-safety helpers voor wrapping, card heights en local spacing
- appendix table utilities

Wat pas later mag volgen:

- hogere orchestration helpers die complete pagina's samenstellen
- generieke recipe builders die productspecifieke beslissingen verbergen

### 4. Product-specific recipe logic

Moet expliciet productspecifiek blijven:

- ExitScan frictiescore, vertrekbeeld en vertrekduiding
- RetentieScan retentiesignaal, stay-intent, vertrekintentie en bevlogenheid
- productgrenzen rond geen diagnose, geen causaliteitsclaim en geen individuele predictor
- route- en handoffcopy waar bestuurlijke betekenis productafhankelijk is
- score page recipes
- handoff recipes
- synthesis recipes
- route/action recipes
- productspecifieke methodology wording waar betekenis, trustgrens of gebruiksregel verschilt

### 5. Product-specific copy and semantics

Moet volledig productspecifiek blijven:

- managementtaal
- metric names
- scorebetekenis
- methodology wording
- appendixuitleg waar artikelgebruik of betekenis verschilt

## Huidige shared boundary

De veilige gedeelde laag eindigt in deze fase bij:

- gedeelde text-safety en layout utilities
- gedeelde visual master builders op surface-niveau
- gedeelde appendix- en method-table builders
- beperkte layout-level orchestration helpers voor identieke master-shells

Concreet betekent dit:

- openingsblokken, quiet surfaces, framed surfaces en appendix/method-tabellen mogen gedeeld zijn
- de `Methodiek / leeswijzer`-shell mag gedeeld zijn zolang copy en semantiek per product lokaal blijven
- score-, handoff-, synthese- en route-recepten blijven expliciet lokaal

Dit shared boundary is nu het bewuste eindpunt van fase 1 t/m 4 van deze abstraheringsvolgorde. Binnen de huidige repo-status geldt:

- geen verdere abstrahering in recipe-lagen
- alleen bugfixes binnen bestaande shared helpers of lokale recipes
- nieuwe abstrahering alleen na expliciet bewijs van identiek mastergedrag zonder semantisch risico
- nieuwe abstrahering mag ook alleen starten na canonwijziging als die wijzigt wat gedeeld mag worden

## Productspecifieke verschillen

### ExitScan

- ExitScan blijft de referentie voor de eerste volledig uitgewerkte recipe.
- ExitScan mag vooral gedeelde layout- en utility-abstrahering voeden.
- ExitScan-semantiek blijft lokaal waar vertrekduiding, frictiescore en exit-specifieke interpretatie spelen.

### RetentieScan

- RetentieScan valideert dat dezelfde grammar en masters ook met andere productsemantiek kunnen werken.
- RetentieScan mag niet worden gladgetrokken naar ExitScan-termen of ExitScan-page builders.
- RetentieScan-semantiek blijft lokaal waar retentiesignaal, stay-intent, vertrekintentie en behoudsduiding spelen.

## Guardrails

- Geen abstrahering die page order of report grammar impliciet verandert.
- Geen shared copylaag die producttaal vervlakt.
- Geen generieke scorepagina-helper als daardoor ExitScan- en RetentieScan-betekenis door elkaar lopen.
- Geen refactor die bestaande baselines eerst breekt en pas daarna weer probeert te herstellen.
- Geen abstrahering zonder regressietests op master mapping, sample output en recipevolgorde.

## Acceptance

De volgende fase is goed gestart als:

- eerst alleen veilige renderer utilities worden gedeeld
- beide productsamples na elke stap visueel en tekstueel gelijk blijven aan de bevroren baselines
- master-family mappingtests groen blijven
- producttaaltests groen blijven
- er geen impliciete recipe-convergentie ontstaat

Deze fase is correct afgesloten als:

- het huidige shared boundary expliciet als stopmoment is vastgelegd
- score-, handoff-, synthese- en route-recepten nog steeds lokaal zijn
- verdere wijzigingen vanaf hier alleen bugfix-only zijn of opnieuw expliciet worden gelegitimeerd

## Assumptions / defaults

- ExitScan en RetentieScan blijven de primaire regressiebaselines voor elke abstraheringsstap.
- De eerste abstraheringsvolgorde is:
  1. gedeelde text-safety en layout utilities
  2. gedeelde visual master builders
  3. gedeelde appendix- en methodetabellen
  4. pas daarna beperkte orchestration helpers
- Als een helper meer dan een productspecifieke `if` nodig heeft om betekenis te bewaken, hoort die helper voorlopig recipe-level te blijven.
- De huidige repository heeft deze veilige laag nu bereikt; verdere abstrahering moet hier stoppen totdat expliciet opnieuw besloten wordt om verder te gaan.
