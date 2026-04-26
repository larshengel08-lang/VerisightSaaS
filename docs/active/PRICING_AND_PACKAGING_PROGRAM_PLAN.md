# PRICING_AND_PACKAGING_PROGRAM_PLAN.md

## 1. Summary

Dit traject heeft van de bestaande prijsankers, package-vormen en commerciële uitleg van Verisight één strakke, verkoopbare en repo-consistente pricing- en packaginglaag gemaakt. De strategische alignment in deze reviewronde trekt dat verhaal opnieuw gelijk met de huidige productwaarheid: guided execution, assisted self-service discipline, twee eerlijke first-buy routes en een bewust bounded portfolio.

Sinds 2026-04-26 hoort daar ook expliciet bij dat de inmiddels echte Action Center-productlaag niet meer onzichtbaar onder de commerciële taal mag blijven hangen. Die laag is wél productwaarheid, maar nog niet verkoopbaar als derde product, losse module, add-on of prijsanker. Pricing en packaging moeten dus ruimte laten voor Action Center als embedded follow-through laag zonder daar commerciële fantasie omheen te bouwen.

De uitgevoerde richting in deze tranche:

- één canonieke pricing- en packagingarchitectuur vastgelegd rond twee first-buy routes, guided vervolgvormen, add-ons en een bounded portfolioroute
- ExitScan Baseline expliciet gehouden als default publieke eerste route, niet als geforceerde enige entree
- ExitScan ritmeroute expliciet gehouden als quote-only vervolgroute na baseline of bestaand exitvolume
- RetentieScan Baseline expliciet gehouden als volwaardige eerste route voor actieve-populatie vroegsignalering
- RetentieScan ritmeroute expliciet gehouden als buyer-facing vervolgvorm na baseline
- `Retentie vervolgmeting` genormaliseerd tot compacte vervolgcomponent binnen de RetentieScan-ritmeroute
- `segment_deep_dive` expliciet gehouden als enige repo-brede add-on
- guided execution en assisted self-service expliciet behandeld als productrealiteit onder pricing en packaging
- bounded portfolioverhoudingen expliciet bewaakt zodat combinatie of vervolgroutes geen nieuwe suite- of pricingfantasie openen
- publieke pricing, salesdocs, proposalspines, buyer-assets en paritytests op dezelfde packageboom gezet

Belangrijkste repo-observaties waarop deze uitvoering is gebaseerd:

- de prijsankers stonden al publiek en in salesdocs vast, maar de pricing-truth was verspreid
- de commerciële packageboom was verder ontwikkeld dan de technische productconfiguratie
- `segment_deep_dive` was al de enige echte repo-brede add-on
- `delivery_mode` bestond backendmatig, maar droeg `ExitScan ritmeroute` nog niet als volwaardige publieke productmodus
- RetentieScan had commercieel meer package-varianten dan ExitScan, waardoor package-uitleg sneller diffuus kon worden
- frontend-, funnel- en dashboardlagen stuurden inmiddels al op question-first eerste routekeuze en guided self-service discipline
- de echte Action Center-core bestaat nu als interne follow-through laag met precies twee bounded live consumers, maar nog zonder buyer-facing package- of modulecontract
- portfolio-architectuur en producttaal maakten duidelijk dat bounded vervolgroutes niet als extra kernproducten of brede pricinglaag mogen worden geframed
- strategie, trust en roadmap maakten expliciet dat pricing assisted/productized moest blijven en niet mocht doorschieten naar plans, seats, subscriptions of Stripe-logica

Status 2026-04-26:

- Oorspronkelijk uitgevoerd op 2026-04-15:
  - `docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md`
  - publieke pricingcopy in `frontend/components/marketing/site-content.ts`
  - tarieflaag in `frontend/app/tarieven/page.tsx`
  - package-alignment in `frontend/app/page.tsx`, `frontend/app/aanpak/page.tsx` en `frontend/app/producten/[slug]/page.tsx`
  - sales- en proposal-alignment in:
    - `docs/reference/SALES_PRODUCT_DECISION_TREE.md`
    - `docs/reference/SALES_COMPARISON_MATRIX.md`
    - `docs/reference/SALES_PROPOSAL_SPINES.md`
    - `docs/reference/EXITSCAN_SALES_ONE_PAGER.md`
    - `docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md`
    - `docs/reference/COMBINATIE_PORTFOLIO_MEMO.md`
    - `docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md`
  - handmatige acceptance in `docs/reference/PRICING_AND_PACKAGING_ACCEPTANCE_CHECKLIST.md`
  - regressietests in `frontend/lib/marketing-positioning.test.ts` en `tests/test_pricing_packaging_system.py`
  - prompt closure in `docs/prompts/PROMPT_CHECKLIST.xlsx`
- Strategisch aangescherpt op 2026-04-24:
  - `docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md`
  - `docs/strategy/STRATEGY.md`
  - first-buy logica opnieuw gelijkgetrokken met guided execution, assisted self-service en bounded portfolio guardrails
- Action Center-alignment toegevoegd op 2026-04-26:
  - `docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md`
  - `docs/active/PACKAGING_AND_ROUTE_LOGIC.md`
  - `docs/strategy/STRATEGY.md`
  - expliciet vastgelegd dat Action Center een embedded follow-through laag is en geen publiek prijsanker, add-on of derde productverhaal
- Bewust niet uitgevoerd in deze ronde:
  - geen Stripe, billing, subscription- of seatlogica
  - geen self-service checkout of publieke planmatrix
  - geen nieuwe technische campaign-entiteiten voor elke commerciële vervolgroute
  - geen groot website-redesign buiten package- en pricingalignment
  - geen admin/dashboardcopy-wijziging, omdat de huidige interne termen de publieke packagecopy nu niet blokkeren
  - geen standalone Action Center pricing, modulepositionering of buyer-facing upsellcopy
  - geen nieuwe pricinglaag voor bounded vervolgroutes of portfolioverbreding zonder apart besluit

## 2. Milestones

### Milestone 0 - Freeze Current Pricing Baseline And Packaging Truth
Dependency: none

- [x] Uitgevoerd op 2026-04-15: de huidige pricing- en packaginglaag repo-breed vastgelegd en de spanningen tussen site, sales en productrealiteit expliciet gemaakt.

#### Tasks
- [x] De huidige pricing- en packaginglaag vastgelegd over site, productpagina's, salesdocs, proposal spines, previewcopy en voorbeeldoutput.
- [x] Expliciet onderscheid gemaakt tussen publieke prijsankers, quote-only vervolgvormen, echte add-ons en portfolioroutes.
- [x] Vastgelegd welke package-elementen technisch echt ondersteund zijn: `segment_deep_dive`, `delivery_mode` en RetentieScan trend-/ritme-output.
- [x] Vastgelegd waar pricing inhoudelijk rust op echte output en waar pricing vooral een commerciële constructie was.
- [x] De belangrijkste verwarringspunten gedocumenteerd: ExitScan Baseline versus ExitScan ritmeroute, RetentieScan ritmeroute versus compacte vervolgmeting, combinatie als route versus pakket en add-on versus productvorm.
- [x] Vastgelegd dat de nieuwe Action Center-productlaag wel echt bestaat, maar nog geen eigen package-type, prijsanker of los moduleverhaal heeft.

#### Definition of done
- [x] Er lag één controleerbaar startbeeld van de huidige pricing- en packaginglaag.
- [x] Het verschil tussen verkocht, ondersteund en voorbereid was expliciet.
- [x] Het verschil tussen buyer-facing packages en de onderliggende Action Center-productlaag is expliciet.
- [x] De grootste spanningen tussen site, sales en productrealiteit waren benoemd.

#### Validation
- [x] Observaties waren herleidbaar naar actuele repo-bestanden.
- [x] ExitScan bleef zichtbaar als commerciële default, terwijl RetentieScan expliciet als volwaardige first-buy route herkenbaar bleef bij een actieve behoudsvraag.
- [x] Geen bevinding leunde op aannames buiten de repo.

### Milestone 1 - Define The Canonical Verisight Pricing And Packaging Architecture
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-15: een decision-complete pricing- en packagingarchitectuur vastgelegd.

#### Tasks
- [x] De vaste packagearchitectuur vastgelegd rond twee first-buy routes: ExitScan Baseline en RetentieScan Baseline, plus guided vervolgvormen, `Segment deep dive` en combinatie als bounded portfolioroute.
- [x] Beslist dat `Retentie vervolgmeting` niet als parallelle hoofdpackage blijft bestaan, maar als compacte vervolgcomponent binnen de RetentieScan-ritmeroute.
- [x] Vastgelegd dat Baseline en vervolgvormen asymmetrisch mogen zijn per product.
- [x] Vastgelegd welke prijsankers publiek blijven en welke bewust quote-only zijn.
- [x] Vaste buyer-facing package-termen vastgelegd: product, eerste traject, vervolgvorm, add-on en portfolioroute.
- [x] Vastgelegd dat pricing in deze fase guided execution ondersteunt, assisted/productized blijft en geen billingmodel is.
- [x] Vastgelegd dat Action Center onder pricing hoort als embedded follow-through laag en daarom buiten de buyer-facing packageboom blijft.

#### Definition of done
- [x] Verisight heeft één decision-complete pricing- en packagingarchitectuur.
- [x] Elk package-element heeft een vaste plaats in de commerciële boom.
- [x] Action Center heeft expliciet geen plaats als los publiek package-element.
- [x] De architectuur ondersteunt question-first first-buy routes zonder RetentieScan te degraderen tot afgeleide feature.

#### Validation
- [x] De architectuur botst niet met strategie-, methodiek- en trustdocs.
- [x] De architectuur kon direct worden doorgetrokken naar site, sales en tests.
- [x] Geen package-vorm forceert plans, seats, usage of subscriptionlogica.

### Milestone 2 - Rebuild Public Pricing Surfaces Around The Canonical Package Story
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: de publieke pricing- en aanpaklaag herbouwd rond eerste trajecten, vervolgvormen, add-ons en de combinatieroute.

#### Tasks
- [x] De publieke pricinglaag herschikt naar primaire prijsankers, vervolgvormen, add-ons, combinatie op aanvraag, keuzehulp en FAQ.
- [x] ExitScan op de tarieflaag zichtbaar gehouden als default eerste route zonder RetentieScan te verlagen tot pseudo-secundaire optie.
- [x] Expliciet gemaakt dat ExitScan ritmeroute vooral logisch is na baseline of bestaand volume en daarom quote-only blijft.
- [x] Expliciet gemaakt dat RetentieScan ritmeroute een vervolgvorm is en geen parallel eerste pakket.
- [x] `Retentie vervolgmeting` herpositioneerd als compacte vervolgcomponent binnen de ritmelaag.
- [x] `Segment deep dive` scherp gehouden als bewuste verdieping en niet als standaard inbegrepen laag.
- [x] Combinatie-taal strikt route-gedreven gehouden: op aanvraag, geen bundel en geen kortingstaal.
- [x] Homepage-, product-, aanpak- en tarieven-copy consistenter gemaakt in wat je koopt, wanneer je dit koopt, hoe guided execution werkt en wat daarna logisch volgt.

#### Definition of done
- [x] Een buyer kan de publieke packageboom in ongeveer één minuut begrijpen.
- [x] De site maakt duidelijk onderscheid tussen eerste route, guided vervolgvorm, add-on en portfolioroute.
- [x] ExitScan, RetentieScan en combinatie kannibaliseren elkaar minder op de pricinglaag.

#### Validation
- [x] `frontend/app/tarieven/page.tsx`, `frontend/app/aanpak/page.tsx`, `frontend/app/page.tsx` en `frontend/app/producten/[slug]/page.tsx` vertellen dezelfde package-architectuur.
- [x] Publieke pricingcopy suggereert geen productvorm die de repo inhoudelijk niet draagt.
- [x] FAQ's blijven commercieel scherp zonder overclaiming of productverwarring.

### Milestone 3 - Align Sales, Proposal And Buyer Asset Packaging With Public Pricing
Dependency: Milestone 2

- [x] Uitgevoerd op 2026-04-15: salesdocs, proposalspines en buyer-assets geharmoniseerd met dezelfde package-architectuur.

#### Tasks
- [x] De sales decision tree, comparison matrix, proposal spines, one-pagers en objection matrix bijgewerkt op dezelfde package-architectuur.
- [x] Gezamenlijke packagewoorden doorgetrokken over site en sales.
- [x] `ExitScan ritmeroute` expliciet gehouden als vervolg na baseline of bestaand exitvolume, niet als concurrerende eerste offer.
- [x] `RetentieScan ritmeroute` en compacte retentie vervolgmeting hiërarchisch consistent gemaakt.
- [x] Combinatie-assets en proposals vrijgehouden van bundel- of discountlogica.
- [x] De vaste regel intact gehouden: geen gratis pilot als standaard, wel een betaald eerste traject.
- [x] Pricinguitleg direct bruikbaar gemaakt voor discovery, demo en voorstelovergang zonder terug te vallen op een geforceerde oude ExitScan-first hiërarchie.

#### Definition of done
- [x] Site, sales en proposal-lagen vertellen dezelfde pricing- en packaginglijn.
- [x] Een seller hoeft niet meer te improviseren tussen publieke pricing en voorsteltaal.
- [x] Vervolgvormen zijn commercieel geloofwaardig zonder productverwarring.

#### Validation
- [x] De belangrijkste salesdocs volgen dezelfde package-architectuur.
- [x] Geen salesasset verkoopt RetentieScan als goedkopere of lichtere versie van ExitScan.
- [x] Geen proposal- of one-pagerlaag botst met publieke pricing of andersom.

### Milestone 4 - Align Pricing Claims With Product Reality, Report Proof And Internal Contracts
Dependency: Milestone 3

- [x] Uitgevoerd op 2026-04-15: packageclaims getoetst aan productrealiteit, previewproof en huidige interne contracten.

#### Tasks
- [x] Per package-vorm getoetst of de commerciële belofte echt door product en output wordt gedragen.
- [x] Expliciet vastgelegd hoe `ExitScan ritmeroute` verkocht mag worden zolang `delivery_mode` nog geen volwaardige publieke productmodus is: guided vervolgroute, quote-only, niet self-serve.
- [x] Expliciet vastgelegd dat `segment_deep_dive` de enige repo-breed echte add-on is en dat andere commerciële vervolgvormen geen technisch add-on-contract hoeven te zijn.
- [x] Pricing gekoppeld gehouden aan echte voorbeeldoutput en report-structuur.
- [x] Pricing expliciet gekoppeld gehouden aan guided execution, assisted self-service discipline en bounded portfolio guardrails uit de actuele productlaag.
- [x] Pricing expliciet gekoppeld gehouden aan de huidige Action Center-truth: dossier-first follow-through, reviewdruk, expliciete eigenaar en slechts twee bounded live consumers.
- [x] Vastgelegd welke packageclaims niet mogen: always-on live monitoring alsof dit al product-led standaard is, benchmark- of ROI-claims zonder basis en SaaS-planframing.
- [x] Vastgelegd welke Action Center-claims nu niet mogen: losse moduleframing, cross-product orchestration alsof alle adapters al live zijn en buyer-facing pricing alsof follow-through al productized self-serve is.
- [x] Interne admin/dashboardcopy beoordeeld; geen directe wijziging nodig geacht in deze tranche.

#### Definition of done
- [x] Elke package-vorm is inhoudelijk gekoppeld aan bestaande product- en outputrealiteit.
- [x] Pricing belooft niet meer dan dashboard, report, preview en campaignmodel waarmaken.
- [x] De packagearchitectuur blijft assisted/productized in plaats van pseudo-SaaS.
- [x] Action Center wordt commercieel niet zwaarder gelezen dan de huidige bounded ops- en follow-upcapaciteit draagt.

#### Validation
- [x] `backend/report.py`, previewcopy, dashboard/admin-context en voorbeeld-PDF's ondersteunen de packageclaims.
- [x] Interne campaignlogica en publieke pricing kunnen naast elkaar bestaan zonder betekenisbotsing.
- [x] Geen pricinglaag introduceert verborgen productschuld via ongedragen beloftes.

### Milestone 5 - Add Pricing QA, Governance And Prompt Closure
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-15: regressiebescherming, acceptance, governance en prompt closure toegevoegd.

#### Tasks
- [x] Regressiebescherming toegevoegd voor pricing- en packagingpariteit over publieke pricingcopy, homepage/product/aanpak-routes, sales assets, trustgrenzen en previewproof.
- [x] Handmatige acceptance toegevoegd voor first-time buyer begrip, ExitScan als default route, RetentieScan als volwaardige first-buy route, logische vervolgvormen en combinatie als bounded route.
- [x] Governance vastgelegd voor toekomstige pricingwijzigingen: eerst pricing source of truth, daarna site, sales, assets en tests.
- [x] Het traject administratief afgesloten met actief planbestand en bijgewerkte `PROMPT_CHECKLIST.xlsx`.

#### Definition of done
- [x] Pricing en packaging zijn regressietechnisch en inhoudelijk reviewbaar.
- [x] Toekomstige wijzigingen kunnen minder makkelijk packageverwarring terugbrengen.
- [x] Het prompt-systeem weerspiegelt dat dit traject nu de pricing source of truth is.

#### Validation
- [x] Frontend- en repo-paritytests dekken de belangrijkste pricing- en packagecontracten af.
- [x] Handmatige acceptance maakt zichtbaar of publieke routes, salesdocs en outputproof nog hetzelfde verhaal vertellen.
- [x] `PROMPT_CHECKLIST.xlsx` weerspiegelt de echte repo-status van dit traject.

## 3. Execution Breakdown By Subsystem

### Pricing canon and package architecture
- [x] Eén vaste commerciële boom gedefinieerd met onderscheid tussen first-buy route, guided vervolgvorm, add-on en bounded portfolioroute.
- [x] Publieke prijsankers compact en boardroom-geschikt gehouden.
- [x] Quote-only routes bruikbaar gehouden voor sales zonder publieke verwarring te creëren.

### Website and buyer-facing surfaces
- [x] Dezelfde pricinglogica doorgetrokken naar homepage, producten, aanpak en tarieven.
- [x] ExitScan als default eerste route behouden zonder RetentieScan kleiner te maken dan de productwaarheid draagt.
- [x] Keuzehulp en FAQ gebruikt om verkeerde buyer-interpretaties actief te corrigeren.

### Sales, proposal and buyer assets
- [x] Packagevolgorde en pricingwoorden geharmoniseerd over decision tree, proposals en one-pagers.
- [x] `RetentieScan ritmeroute` en compacte retentie vervolgmeting genormaliseerd tot één begrijpelijke vervolgarchitectuur.
- [x] Combinatie op aanvraag en route-gedreven gehouden.

### Product reality and internal contracts
- [x] Packageclaims verankerd in echte report-, preview- en campaignrealiteit.
- [x] `ExitScan ritmeroute` gepositioneerd als guided vervolgroute in plaats van volwaardige publieke productmodus.
- [x] Alleen echte add-ons technisch en copymatig als add-on laten voelen.
- [x] Guided execution en assisted self-service expliciet behandeld als deel van de prijs- en packagewaarheid.

### QA and governance
- [x] Pricing paritytests en acceptance-checks toegevoegd.
- [x] Dit planbestand als leidende pricing source of truth vastgelegd.
- [x] `PROMPT_CHECKLIST.xlsx` pas na uitvoering en validatie bijgewerkt.

## 4. Current Product Risks

- [x] Commerciële packageverwarring is verkleind, maar blijft een risico zodra publieke en interne termen weer uit elkaar gaan lopen.
- [x] RetentieScan heeft nog steeds een rijkere vervolglijn dan ExitScan; dit wordt nu beter gekaderd, maar moet commercieel bewaakt blijven.
- [x] `ExitScan ritmeroute` blijft afhankelijk van begeleide delivery en voldoende volume; de quote-only framing verkleint hier het risico op overselling.
- [x] Alleen `segment_deep_dive` is repo-breed een echte add-on; dit blijft expliciet bewaakt in copy en tests.
- [x] Oude ExitScan-first taal kan nog steeds terugkeren en de vraaggestuurde first-buy logica onnodig vernauwen.
- [x] Action Center kan te snel als module, cockpitproduct of suite-shell worden geframed nu de productlaag technisch echter is geworden dan de commerciële docs nog lieten zien.
- [x] Premature SaaS-logica is in deze tranche bewust buiten scope gehouden.
- [x] Trust-erosie door te harde packageclaims is verkleind via alignment met preview, trustdocs en paritytests.

## 5. Open Questions

- [ ] Willen we `Compacte retentie vervolgmeting` later publiek blijven tonen als aparte vervolgcomponent, of alleen nog als sales-/proposalterm binnen `RetentieScan ritmeroute`?
- [ ] Willen we `ExitScan ritmeroute` later publiek prominenter maken zodra `delivery_mode` ook frontend- en admin-breed verder is uitgewerkt?
- [ ] Vanaf welk moment is de Action Center-laag volwassen genoeg om publiek als werkwijze te worden benoemd zonder hem pricingmatig als module of derde product te laten voelen?
- [ ] Willen we later een compactere executive pricing-view naast de huidige tariefpagina?
- [ ] Willen we combinatie later semi-gestandaardiseerd tonen als portfolio-opbouw, of structureel `op aanvraag` houden?
- [ ] Willen we bounded vervolgroutes later publiek/commercieel explicieter maken, of blijven die pas na aparte sign-off zichtbaar buiten de huidige kernpricing?
- [ ] Willen we toekomstige productfamilies pas pricingmatig zichtbaar maken zodra hun packagecontract net zo scherp is als voor ExitScan en RetentieScan?

## 6. Follow-up Ideas

- [ ] Gebruik dit pricing-plan direct als randvoorwaarde voor `SAMPLE_OUTPUT_AND_SHOWCASE_PROGRAM_PLANMODE_PROMPT.md`.
- [ ] Gebruik dit pricing-plan daarna als input voor funnel-alignment en website-redesign.
- [ ] Gebruik eerste echte salesgesprekken om pricingfrictie, packagebegrip en quoteconversie te ijken.
- [ ] Voeg later een compacte internal pricing acceptance checklist toe voor elke nieuwe website- of saleswijziging.
- [ ] Gebruik het pricing-canon later als input voor `ACCOUNT_AND_BILLING_MODEL_READINESS_PLANMODE_PROMPT.md` nadat assisted packaging stabiel genoeg is.

## 7. Out of Scope For Now

- [x] Geen Stripe, subscription billing of self-service checkout.
- [x] Geen plan-, seat- of usage-architectuur.
- [x] Geen herbouw van productmethodiek, scoring of report-engine buiten pricingpariteit.
- [x] Geen nieuwe productfamilies buiten ExitScan, RetentieScan en combinatie.
- [x] Geen standalone Action Center pricing, Action Center-module of publieke Action Center-upsell.
- [x] Geen heropening van bounded vervolgroutes als nieuwe publieke pricinglaag zonder apart besluit.
- [x] Geen groot website-redesign buiten wat nodig is om pricing- en packagecopy te alignen.
- [x] Geen verzonnen ROI-, benchmark- of klantproofclaims.
- [x] Geen verplichting om elke commerciële vervolgroute technisch als aparte campaign- of billing-entiteit te modelleren.

## 8. Defaults Chosen

- [x] `docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md` is de source of truth voor dit traject.
- [x] ExitScan Baseline blijft de default publieke eerste route en `EUR 2.950` het standaard eerste prijsanker.
- [x] RetentieScan Baseline blijft een volwaardige first-buy route op `EUR 3.450`, niet een goedkopere of lichtere afgeleide van ExitScan.
- [x] ExitScan ritmeroute blijft een secundaire vervolgroute op aanvraag, niet een concurrerende publieke eerste package.
- [x] RetentieScan ritmeroute blijft de buyer-facing vervolgvorm na baseline, met `vanaf EUR 4.950` als anker.
- [x] `Compacte retentie vervolgmeting` blijft een compact vervolg binnen de RetentieScan-ritmeroute en niet een parallelle hoofdpackage.
- [x] `Segment deep dive` blijft de enige expliciete add-on die repo-breed technisch en commercieel herkenbaar is.
- [x] Combinatie blijft een portfolioroute op aanvraag, geen bundel, korting of standaard upsell.
- [x] Action Center blijft embedded in guided execution, dossier-first en review-first, zonder eigen publiek prijsanker.
- [x] Pricing blijft guided execution ondersteunen, assisted/productized en boardroom-geschikt, zonder premature SaaS-billinglogica.
- [x] Claims mogen commercieel scherp zijn, maar nooit verder gaan dan huidige output, trustgrenzen en productrealiteit dragen.
