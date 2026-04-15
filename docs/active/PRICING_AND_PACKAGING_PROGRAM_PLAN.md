# PRICING_AND_PACKAGING_PROGRAM_PLAN.md

## 1. Summary

Dit traject heeft van de bestaande prijsankers, package-vormen en commerciële uitleg van Verisight één strakke, verkoopbare en repo-consistente pricing- en packaginglaag gemaakt.

De uitgevoerde richting in deze tranche:

- één canonieke pricing- en packagingarchitectuur vastgelegd rond eerste trajecten, vervolgvormen, add-ons en een portfolioroute
- ExitScan Baseline expliciet gehouden als primaire publieke eerste route
- ExitScan Live expliciet gehouden als quote-only vervolgroute na baseline of bestaand exitvolume
- RetentieScan Baseline expliciet gehouden als eigen eerste route voor actieve-populatie vroegsignalering
- RetentieScan ritme expliciet gehouden als buyer-facing vervolgvorm na baseline
- `Retentie vervolgmeting` genormaliseerd tot compacte vervolgcomponent binnen de RetentieScan-ritmelaag
- `segment_deep_dive` expliciet gehouden als enige repo-brede add-on
- publieke pricing, salesdocs, proposalspines, buyer-assets en paritytests op dezelfde packageboom gezet

Belangrijkste repo-observaties waarop deze uitvoering is gebaseerd:

- de prijsankers stonden al publiek en in salesdocs vast, maar de pricing-truth was verspreid
- de commerciële packageboom was verder ontwikkeld dan de technische productconfiguratie
- `segment_deep_dive` was al de enige echte repo-brede add-on
- `delivery_mode` bestond backendmatig, maar droeg `ExitScan Live` nog niet als volwaardige publieke productmodus
- RetentieScan had commercieel meer package-varianten dan ExitScan, waardoor package-uitleg sneller diffuus kon worden
- strategie, trust en roadmap maakten expliciet dat pricing assisted/productized moest blijven en niet mocht doorschieten naar plans, seats, subscriptions of Stripe-logica

Status 2026-04-15:

- Uitgevoerd in deze ronde:
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
- Bewust niet uitgevoerd in deze ronde:
  - geen Stripe, billing, subscription- of seatlogica
  - geen self-service checkout of publieke planmatrix
  - geen nieuwe technische campaign-entiteiten voor elke commerciële vervolgroute
  - geen groot website-redesign buiten package- en pricingalignment
  - geen admin/dashboardcopy-wijziging, omdat de huidige interne termen de publieke packagecopy nu niet blokkeren

## 2. Milestones

### Milestone 0 - Freeze Current Pricing Baseline And Packaging Truth
Dependency: none

- [x] Uitgevoerd op 2026-04-15: de huidige pricing- en packaginglaag repo-breed vastgelegd en de spanningen tussen site, sales en productrealiteit expliciet gemaakt.

#### Tasks
- [x] De huidige pricing- en packaginglaag vastgelegd over site, productpagina's, salesdocs, proposal spines, previewcopy en voorbeeldoutput.
- [x] Expliciet onderscheid gemaakt tussen publieke prijsankers, quote-only vervolgvormen, echte add-ons en portfolioroutes.
- [x] Vastgelegd welke package-elementen technisch echt ondersteund zijn: `segment_deep_dive`, `delivery_mode` en RetentieScan trend-/ritme-output.
- [x] Vastgelegd waar pricing inhoudelijk rust op echte output en waar pricing vooral een commerciële constructie was.
- [x] De belangrijkste verwarringspunten gedocumenteerd: ExitScan Baseline versus ExitScan Live, RetentieScan ritme versus compacte vervolgmeting, combinatie als route versus pakket en add-on versus productvorm.

#### Definition of done
- [x] Er lag één controleerbaar startbeeld van de huidige pricing- en packaginglaag.
- [x] Het verschil tussen verkocht, ondersteund en voorbereid was expliciet.
- [x] De grootste spanningen tussen site, sales en productrealiteit waren benoemd.

#### Validation
- [x] Observaties waren herleidbaar naar actuele repo-bestanden.
- [x] ExitScan bleef zichtbaar de primaire wedge in de baselineanalyse.
- [x] Geen bevinding leunde op aannames buiten de repo.

### Milestone 1 - Define The Canonical Verisight Pricing And Packaging Architecture
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-15: een decision-complete pricing- en packagingarchitectuur vastgelegd.

#### Tasks
- [x] De vaste packagehiërarchie vastgelegd: ExitScan Baseline, ExitScan Live, RetentieScan Baseline, RetentieScan ritme, Segment deep dive en combinatie als portfolioroute.
- [x] Beslist dat `Retentie vervolgmeting` niet als parallelle hoofdpackage blijft bestaan, maar als compacte vervolgcomponent binnen de RetentieScan-ritmelaag.
- [x] Vastgelegd dat Baseline en vervolgvormen asymmetrisch mogen zijn per product.
- [x] Vastgelegd welke prijsankers publiek blijven en welke bewust quote-only zijn.
- [x] Vaste buyer-facing package-termen vastgelegd: product, eerste traject, vervolgvorm, add-on en portfolioroute.
- [x] Vastgelegd dat pricing in deze fase verkoopstructuur is en geen billingmodel.

#### Definition of done
- [x] Verisight heeft één decision-complete pricing- en packagingarchitectuur.
- [x] Elk package-element heeft een vaste plaats in de commerciële boom.
- [x] De architectuur ondersteunt ExitScan als wedge zonder RetentieScan te degraderen tot feature.

#### Validation
- [x] De architectuur botst niet met strategie-, methodiek- en trustdocs.
- [x] De architectuur kon direct worden doorgetrokken naar site, sales en tests.
- [x] Geen package-vorm forceert plans, seats, usage of subscriptionlogica.

### Milestone 2 - Rebuild Public Pricing Surfaces Around The Canonical Package Story
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: de publieke pricing- en aanpaklaag herbouwd rond eerste trajecten, vervolgvormen, add-ons en de combinatieroute.

#### Tasks
- [x] De publieke pricinglaag herschikt naar primaire prijsankers, vervolgvormen, add-ons, combinatie op aanvraag, keuzehulp en FAQ.
- [x] ExitScan op de tarieflaag zichtbaarder als default eerste route gehouden.
- [x] Expliciet gemaakt dat ExitScan Live vooral logisch is na baseline of bestaand volume en daarom quote-only blijft.
- [x] Expliciet gemaakt dat RetentieScan ritme een vervolgvorm is en geen parallel eerste pakket.
- [x] `Retentie vervolgmeting` herpositioneerd als compacte vervolgcomponent binnen de ritmelaag.
- [x] `Segment deep dive` scherp gehouden als bewuste verdieping en niet als standaard inbegrepen laag.
- [x] Combinatie-taal strikt route-gedreven gehouden: op aanvraag, geen bundel en geen kortingstaal.
- [x] Homepage-, product-, aanpak- en tarieven-copy consistenter gemaakt in wat je koopt, wanneer je dit koopt en wat daarna logisch volgt.

#### Definition of done
- [x] Een buyer kan de publieke packageboom in ongeveer één minuut begrijpen.
- [x] De site maakt duidelijk onderscheid tussen eerste traject, vervolgvorm en add-on.
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
- [x] `ExitScan Live` expliciet gehouden als vervolg na baseline of bestaand exitvolume, niet als concurrerende eerste offer.
- [x] `RetentieScan ritme` en compacte retentie vervolgmeting hiërarchisch consistent gemaakt.
- [x] Combinatie-assets en proposals vrijgehouden van bundel- of discountlogica.
- [x] De vaste regel intact gehouden: geen gratis pilot als standaard, wel een betaald eerste traject.
- [x] Pricinguitleg direct bruikbaar gemaakt voor discovery, demo en voorstelovergang.

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
- [x] Expliciet vastgelegd hoe `ExitScan Live` verkocht mag worden zolang `delivery_mode` nog geen volwaardige publieke productmodus is: guided vervolgroute, quote-only, niet self-serve.
- [x] Expliciet vastgelegd dat `segment_deep_dive` de enige repo-breed echte add-on is en dat andere commerciële vervolgvormen geen technisch add-on-contract hoeven te zijn.
- [x] Pricing gekoppeld gehouden aan echte voorbeeldoutput en report-structuur.
- [x] Vastgelegd welke packageclaims niet mogen: always-on live monitoring alsof dit al product-led standaard is, benchmark- of ROI-claims zonder basis en SaaS-planframing.
- [x] Interne admin/dashboardcopy beoordeeld; geen directe wijziging nodig geacht in deze tranche.

#### Definition of done
- [x] Elke package-vorm is inhoudelijk gekoppeld aan bestaande product- en outputrealiteit.
- [x] Pricing belooft niet meer dan dashboard, report, preview en campaignmodel waarmaken.
- [x] De packagearchitectuur blijft assisted/productized in plaats van pseudo-SaaS.

#### Validation
- [x] `backend/report.py`, previewcopy, dashboard/admin-context en voorbeeld-PDF's ondersteunen de packageclaims.
- [x] Interne campaignlogica en publieke pricing kunnen naast elkaar bestaan zonder betekenisbotsing.
- [x] Geen pricinglaag introduceert verborgen productschuld via ongedragen beloftes.

### Milestone 5 - Add Pricing QA, Governance And Prompt Closure
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-15: regressiebescherming, acceptance, governance en prompt closure toegevoegd.

#### Tasks
- [x] Regressiebescherming toegevoegd voor pricing- en packagingpariteit over publieke pricingcopy, homepage/product/aanpak-routes, sales assets, trustgrenzen en previewproof.
- [x] Handmatige acceptance toegevoegd voor first-time buyer begrip, ExitScan als default wedge, RetentieScan als eigen product, logische vervolgvormen en combinatie als route.
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
- [x] Eén vaste commerciële boom gedefinieerd met onderscheid tussen product, eerste traject, vervolgvorm, add-on en portfolioroute.
- [x] Publieke prijsankers compact en boardroom-geschikt gehouden.
- [x] Quote-only routes bruikbaar gehouden voor sales zonder publieke verwarring te creëren.

### Website and buyer-facing surfaces
- [x] Dezelfde pricinglogica doorgetrokken naar homepage, producten, aanpak en tarieven.
- [x] ExitScan als eerste route laten domineren zonder RetentieScan kleiner te maken om de verkeerde reden.
- [x] Keuzehulp en FAQ gebruikt om verkeerde buyer-interpretaties actief te corrigeren.

### Sales, proposal and buyer assets
- [x] Packagevolgorde en pricingwoorden geharmoniseerd over decision tree, proposals en one-pagers.
- [x] `RetentieScan ritme` en compacte retentie vervolgmeting genormaliseerd tot één begrijpelijke vervolgarchitectuur.
- [x] Combinatie op aanvraag en route-gedreven gehouden.

### Product reality and internal contracts
- [x] Packageclaims verankerd in echte report-, preview- en campaignrealiteit.
- [x] `ExitScan Live` gepositioneerd als guided vervolgroute in plaats van volwaardige publieke productmodus.
- [x] Alleen echte add-ons technisch en copymatig als add-on laten voelen.

### QA and governance
- [x] Pricing paritytests en acceptance-checks toegevoegd.
- [x] Dit planbestand als leidende pricing source of truth vastgelegd.
- [x] `PROMPT_CHECKLIST.xlsx` pas na uitvoering en validatie bijgewerkt.

## 4. Current Product Risks

- [x] Commerciële packageverwarring is verkleind, maar blijft een risico zodra publieke en interne termen weer uit elkaar gaan lopen.
- [x] RetentieScan heeft nog steeds een rijkere vervolglijn dan ExitScan; dit wordt nu beter gekaderd, maar moet commercieel bewaakt blijven.
- [x] `ExitScan Live` blijft afhankelijk van begeleide delivery en voldoende volume; de quote-only framing verkleint hier het risico op overselling.
- [x] Alleen `segment_deep_dive` is repo-breed een echte add-on; dit blijft expliciet bewaakt in copy en tests.
- [x] Premature SaaS-logica is in deze tranche bewust buiten scope gehouden.
- [x] Trust-erosie door te harde packageclaims is verkleind via alignment met preview, trustdocs en paritytests.

## 5. Open Questions

- [ ] Willen we `Compacte retentie vervolgmeting` later publiek blijven tonen als aparte vervolgcomponent, of alleen nog als sales-/proposalterm binnen `RetentieScan ritme`?
- [ ] Willen we `ExitScan Live` later publiek prominenter maken zodra `delivery_mode` ook frontend- en admin-breed verder is uitgewerkt?
- [ ] Willen we later een compactere executive pricing-view naast de huidige tariefpagina?
- [ ] Willen we combinatie later semi-gestandaardiseerd tonen als portfolio-opbouw, of structureel `op aanvraag` houden?
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
- [x] Geen groot website-redesign buiten wat nodig is om pricing- en packagecopy te alignen.
- [x] Geen verzonnen ROI-, benchmark- of klantproofclaims.
- [x] Geen verplichting om elke commerciële vervolgroute technisch als aparte campaign- of billing-entiteit te modelleren.

## 8. Defaults Chosen

- [x] `docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md` is de source of truth voor dit traject.
- [x] ExitScan Baseline blijft de primaire publieke eerste route en `EUR 2.950` het standaard eerste prijsanker.
- [x] RetentieScan Baseline blijft een specifieke complementaire eerste route op `EUR 3.450`, niet een goedkopere of lichtere afgeleide van ExitScan.
- [x] ExitScan Live blijft een secundaire vervolgroute op aanvraag, niet een concurrerende publieke eerste package.
- [x] RetentieScan ritme blijft de buyer-facing vervolgvorm na baseline, met `vanaf EUR 4.950` als anker.
- [x] `Compacte retentie vervolgmeting` blijft een compact vervolg binnen de RetentieScan-ritmelaag en niet een parallelle hoofdpackage.
- [x] `Segment deep dive` blijft de enige expliciete add-on die repo-breed technisch en commercieel herkenbaar is.
- [x] Combinatie blijft een portfolioroute op aanvraag, geen bundel, korting of standaard upsell.
- [x] Pricing blijft assisted/productized en boardroom-geschikt, zonder premature SaaS-billinglogica.
- [x] Claims mogen commercieel scherp zijn, maar nooit verder gaan dan huidige output, trustgrenzen en productrealiteit dragen.
