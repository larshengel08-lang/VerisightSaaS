# PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

Historical boundary note:

- dit plan blijft leidend voor portfolio-architectuur binnen zijn tranche, maar niet voor de huidige buyer-facing routewoorden
- termen als `Live` en `ritme` zijn in dit document oudere pre-normalisatie labels voor vervolg- en ritmeroutes
- lees ze in de huidige hardeningcontext als `ritmeroute`
- bij conflict met de actuele taal- of commerciële canon winnen [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md) en [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md)

## 1. Summary

Deze tranche maakt de portfolio-architectuur van Verisight repo-breed explicieter en semantisch strakker. De runtime bleef al beperkt tot twee echte producttypes (`exit` en `retention`), maar de marketinglaag liet `Combinatie` en meerdere toekomstige proposities nog te snel voelen als extra producten in plaats van als route- of reserveringslaag.

Uitgevoerd in deze tranche:

- [x] Het buyer-facing productmodel expliciet gemaakt met drie vaste rollen:
  - `core_product`
  - `portfolio_route`
  - `future_reserved_route`
- [x] ExitScan en RetentieScan bevestigd als de enige live kernproducten.
- [x] `Combinatie` expliciet hergepositioneerd als buyer-facing portfolioroute en niet als derde kernproduct.
- [x] Toekomstige proposities expliciet hergeframed als bewust nog niet actieve reserved future routes.
- [x] Publieke product-, homepage-, pricing-, contact- en navigatiecopy aangescherpt op "2 kernproducten + 1 route".
- [x] Structured data en productdetailgedrag aangepast zodat alleen kernproducten als volwaardige service-laag worden gemodelleerd.
- [x] Regressiebescherming toegevoegd voor portfoliohiërarchie, routeframing en runtime-contractgrenzen.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt en planning-artifacts opnieuw gesynchroniseerd.

Bewuste defaults:

- [x] Verisight blijft de portfolio- en platformlaag.
- [x] ExitScan blijft de primaire wedge en standaard eerste route.
- [x] RetentieScan blijft complementair en verification-first.
- [x] `Combinatie` blijft publiek zichtbaar, maar alleen als portfolioroute tussen twee bestaande kernproducten.
- [x] `Baseline`, `Live`, `ritme` en compacte vervolgmeting blijven onderliggende productvormen, geen extra productfamilies.
- [x] `segment_deep_dive` blijft de enige expliciete add-on.
- [x] Toekomstige proposities blijven bewust buiten de actieve kernportfolio totdat een apart traject ze activeert.

## 2. Milestones

### Milestone 0 - Freeze Current Portfolio Truth
Dependency: none

#### Tasks
- [x] De huidige portfolio-vorm vastgelegd over strategie, pricing, lifecycle, marketing, contactflow en runtime-contracten.
- [x] Expliciet onderscheid gemaakt tussen runtime productarchitectuur, commerciÃ«le package-architectuur, buyer-facing route-architectuur en toekomstige reserveringslaag.
- [x] De belangrijkste spanningen vastgelegd:
  - `Combinatie` route in docs, maar te productmatig in marketing
  - `Baseline/Live` als subvorm in runtime, maar soms semi-productmatig in copy
  - rijkere Retentie-vervolglijn dan ExitScan-vervolglijn
  - toekomstige proposities zichtbaar als `coming_soon`
- [x] Repo-breed bevestigd wat echt bestaat:
  - `exit`
  - `retention`
  - `segment_deep_dive`
  - `baseline/live`
  - routekeuze via `route_interest`
- [x] Repo-breed bevestigd wat bewust nog niet bestaat:
  - nieuwe `scan_type`s
  - derde runtime-kernproduct
  - subscription- of planlaag
  - self-serve portfolio-uitbreiding

#### Definition of done
- [x] Er lag een scherp startbeeld van de huidige portfolio-architectuur.
- [x] Het verschil tussen product, route, package, add-on en toekomstreserve was expliciet.
- [x] Geen conclusie leunde op aannames buiten de repo.

#### Validation
- [x] Observaties waren herleidbaar naar actuele docs, frontend, backend en schema/types.
- [x] ExitScan bleef aantoonbaar de primaire wedge.
- [x] `Combinatie` bleef aantoonbaar buiten runtime-producttypes.

### Milestone 1 - Define The Canonical Portfolio Architecture
Dependency: Milestone 0

#### Tasks
- [x] De canonieke portfolio-hiÃ«rarchie vastgelegd:
  - Verisight als portfoliolaag
  - ExitScan als primaire kernpropositie
  - RetentieScan als complementaire kernpropositie
  - `Combinatie` als portfolioroute
  - `Baseline/Live/ritme` als productvormen
  - `segment_deep_dive` als add-on
  - toekomstige proposities als reserved future routes
- [x] Buyer-facing regels vastgelegd:
  - ExitScan opent standaard de publieke route
  - RetentieScan is alleen eerste route bij expliciete actieve behoudsvraag
  - `Combinatie` wordt pas logisch na of naast een heldere eerste route
  - toekomstige proposities krijgen geen live-portfoliozwaarte
- [x] Vastgelegd wat extern scherp gescheiden blijft:
  - productnaam
  - route
  - vervolgvorm
  - add-on
  - toekomstreserve
- [x] Vastgelegd wat intern gedeeld mag blijven:
  - previewstructuur
  - managementtaal
  - platformlaag
  - campaign- en report-infrastructuur
- [x] Vastgelegd wat niet meer mag gebeuren:
  - `Combinatie` framen als derde kernproduct
  - `Live` of ritme tonen als zelfstandige productfamilie
  - toekomstige producten zichtbaar maken alsof ze portfolio-ready zijn

#### Definition of done
- [x] De canonieke portfolio-architectuur is decision-complete.
- [x] Elke laag heeft een vaste semantische plek in het portfolio.
- [x] De architectuur maakt expliciet wat nu wel en niet verkocht wordt.

#### Validation
- [x] De architectuur botst niet met strategy, pricing, lifecycle of assisted-to-SaaS guardrails.
- [x] ExitScan bleef commercieel de wedge.
- [x] Toekomstige uitbreiding bleef mogelijk zonder huidige productverwarring.

### Milestone 2 - Rebuild Buyer-Facing Portfolio Surfaces Around The Canonical Model
Dependency: Milestone 1

#### Tasks
- [x] Publieke portfolio-opbouw herbouwd in homepage, productenoverzicht, productdetail, pricing, contact en navigatie.
- [x] Op overzichtsniveau expliciet gemaakt:
  - 2 kernproducten
  - 1 portfolioroute
  - geen derde peer-product
- [x] `Combinatie` buyer-facing herpositioneerd als route-explainer en niet als gelijkwaardige kernpropositie.
- [x] `Baseline/Live` en `RetentieScan ritme` ondergeschikt gehouden aan hun product.
- [x] Toekomstige proposities expliciet als bewust nog niet actief gereframed.
- [x] Portfolio-volgorde doorgetrokken in chooser-copy, CTA-context en contactroute-uitleg.

#### Definition of done
- [x] Een first-time buyer kan de kern, de aanvulling en de gereserveerde laag sneller onderscheiden.
- [x] Geen publieke surface behandelt `Combinatie` als gelijkwaardige kernpropositie.
- [x] Toekomstige proposities vergroten minder de huidige verkoopverwarring.

#### Validation
- [x] Homepage, producten, tarieven en contactflow vertellen dezelfde portfolio-hiÃ«rarchie.
- [x] `Combinatie` voelt route-first.
- [x] `ExitScan Live`, `RetentieScan ritme` en compacte vervolgmeting blijven vervolgregels en geen losse producten.

### Milestone 3 - Align Runtime, Types And Internal Contracts With The Portfolio Story
Dependency: Milestone 2

#### Tasks
- [x] Bevestigd en beschermd dat alleen `exit` en `retention` echte producttypes blijven.
- [x] `combinatie` expliciet buiten `scan_type` gehouden en binnen route-/funnelcontext gelaten.
- [x] `delivery_mode` technisch onder productniveau gehouden.
- [x] Marketingmodellen en productregistratie in lijn gebracht met:
  - `core_product`
  - `portfolio_route`
  - `future_reserved_route`
- [x] Structured data en productdetailgedrag op dezelfde hiÃ«rarchie gezet.
- [x] Een relevante reference doc (`COMBINATIE_PORTFOLIO_MEMO.md`) explicieter gemaakt op "niet als derde kernproduct".

#### Definition of done
- [x] Interne architectuur en commerciële portfolio zijn semantisch beter uitgelijnd.
- [x] Geen type of schema suggereert een derde runtime-kernproduct.
- [x] Buyer-facing copy kan minder makkelijk ongemerkt afwijken van runtime-waarheid.

#### Validation
- [x] `scan_type`- en registry-contracten blijven beperkt tot ExitScan en RetentieScan.
- [x] `route_interest` blijft bruikbaar voor `combinatie`.
- [x] Niet-kernroutes krijgen geen Service-schema meer als actieve productlaag.

### Milestone 4 - Add Future-Expansion Guardrails
Dependency: Milestone 3

#### Tasks
- [x] Een vaste activatieregel doorvertaald in de marketing registry: toekomstige proposities blijven `reserved_future` totdat een apart traject ze activeert.
- [x] Reserved future routes in code behouden zonder buyer-facing kerngewicht.
- [x] Portfolio-uitbreiding gekoppeld gehouden aan expliciete governance in plaats van placeholder-copy.
- [x] "Bewust nog niet actief" doorgetrokken naar future productpagina's en OG-beelden.
- [x] Acceptance vastgelegd voor "bewust nog niet bestaand" aanbod.

#### Definition of done
- [x] De repo heeft een scherpere grens tussen actief portfolio en gereserveerde uitbreiding.
- [x] Toekomstige groei kan minder makkelijk via placeholder-logica naar voren schuiven.
- [x] Portfolio-uitbreiding blijft afhankelijk van expliciete activatie.

#### Validation
- [x] Reserved future routes blijven technisch mogelijk zonder extra commerciële zwaarte.
- [x] Geen buyer-facing surface verkoopt toekomstige proposities als bijna-live.
- [x] Guardrails sluiten aan op roadmap en assisted-to-SaaS volgorde.

### Milestone 5 - Add QA, Acceptance And Prompt Closure
Dependency: Milestone 4

#### Tasks
- [x] Regressiebescherming toegevoegd voor portfoliohiërarchie over marketing, contact en type-contracten.
- [x] Acceptance-scenario's toegevoegd voor:
  - ExitScan als default eerste route
  - RetentieScan als complementair product
  - `Combinatie` als portfolioroute
  - runtime blijft 2 producttypes
  - future routes blijven niet-actief aanbod
- [x] Governance vastgelegd via dit actieve planbestand als source of truth.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt.
- [x] Planning-artifacts opnieuw gesynchroniseerd.

#### Definition of done
- [x] De portfolio-architectuur is inhoudelijk en regressietechnisch reviewbaar.
- [x] Toekomstige wijzigingen kunnen minder makkelijk productverwarring terugbrengen.
- [x] Prompt-systeem en source-of-truth laag wijzen dezelfde richting op.

#### Validation
- [x] Tests dekken hiërarchie, routeframing en non-existence van extra runtime-producten.
- [x] Acceptance maakt zichtbaar of copy, funnel en types nog hetzelfde verhaal vertellen.
- [x] Checklist en roadmap weerspiegelen de nieuwe repo-status.

## 3. Execution Breakdown By Subsystem

### Portfolio and positioning
- [x] Van "3 live producten" naar "2 kernproducten + 1 portfolioroute" aangescherpt.
- [x] ExitScan overal explicieter als kernwedge gehouden.
- [x] RetentieScan zelfstandig maar complementair gehouden.
- [x] `Combinatie` route-first gemaakt in model, copy en supportdocs.

### Marketing, navigation and pricing
- [x] Productregistry uitgebreid met expliciete portfolio-rollen.
- [x] Productoverzicht, homepage, pricing en contactcopy op dezelfde hiÃ«rarchie gezet.
- [x] Dropdownnavigatie gesplitst in kernproducten en portfolioroute.
- [x] Toekomstige proposities gemarkeerd als reserved future routes in plaats van `coming_soon`.

### Runtime, schema and type contracts
- [x] `scan_type = exit | retention` intact gelaten.
- [x] `route_interest = combinatie` intact gelaten.
- [x] `delivery_mode = baseline | live` intact gelaten als fulfillmentlaag.
- [x] Alleen kernproducten krijgen nog Service structured data als volwaardige actieve productlaag.

### Docs, sales and governance
- [x] Dit actieve planbestand toegevoegd als source of truth.
- [x] `COMBINATIE_PORTFOLIO_MEMO.md` aangescherpt op "niet als derde kernproduct".
- [x] Prompt closure uitgevoerd via `PROMPT_CHECKLIST.xlsx` en roadmap-sync.

### QA and acceptance
- [x] Frontend regressiontest uitgebreid voor portfolio-semantiek.
- [x] Nieuwe python acceptance toegevoegd voor active plan, productcontract en publieke surfaces.
- [x] Portfolio-regels nu inhoudelijk toetsbaar naast bestaande pricing- en saleschecks.

## 4. Current Product Risks

- [x] `Combinatie` is nu scherper route-first, maar vraagt blijvende discipline om niet opnieuw als peer-product te voelen.
- [x] Toekomstige proposities zijn nu explicieter gereserveerd, maar de slugs en pagina's bestaan nog steeds en vragen blijvende governance.
- [x] `Baseline/Live` en `ritme` blijven conceptueel kwetsbaar voor productmatige framing zodra copy verslapt.
- [x] ExitScan blijft de wedge; wijzigingen mogen die eerste koop niet vervagen.
- [x] De commerciële pakketlaag blijft rijker dan de runtime-architectuur, wat blijvende paritychecks vraagt.

## 5. Open Questions

- [ ] Welke reserved future route zou als eerste opnieuw beoordeeld mogen worden zodra de kernportfolio stabiel genoeg is?
- [ ] Wanneer is er genoeg case-proof om `Combinatie` zichtbaarder te maken zonder kernverwarring terug te brengen?
- [ ] Moet een latere future route eerst sales-only gevalideerd worden voordat die weer publiek zichtbaar wordt?

## 6. Follow-up Ideas

- [ ] Gebruik dit plan direct als randvoorwaarde voor `CONTENT_OPERATING_SYSTEM_PLAN.md`.
- [ ] Gebruik eerste echte funnel- en salesdata om te meten of routekeuze sneller en zuiverder wordt.
- [ ] Voeg later een compacte portfolio-acceptance checklist toe voor marketing- en navigatiewijzigingen.
- [ ] Herbeoordeel reserved future routes pas na stabiele kernportfolio, pricing en cases.

## 7. Out of Scope For Now

- [x] Geen nieuwe `scan_type` of derde runtime-kernproduct.
- [x] Geen activering van nieuwe productfamilies buiten ExitScan en RetentieScan.
- [x] Geen billing-, plan-, seat- of subscriptionarchitectuur.
- [x] Geen herbouw van survey-, scoring- of report-engine buiten portfolioframing.
- [x] Geen brede content- of SEO-uitbreiding los van portfoliohelderheid.
- [x] Geen bundel-, korting- of suite-framing voor `Combinatie`.

## 8. Defaults Chosen

- [x] `PORTFOLIO_ARCHITECTURE_PROGRAM_PLANMODE_PROMPT.md` is de leidende prompt.
- [x] `docs/active/PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md` is de source of truth.
- [x] ExitScan blijft de primaire kernpropositie en default eerste route.
- [x] RetentieScan blijft complementair en verification-first.
- [x] `Combinatie` blijft publiek zichtbaar als portfolioroute en niet als derde kernproduct.
- [x] `Baseline`, `Live`, `ritme` en compacte vervolgmeting blijven onderliggende productvormen.
- [x] `segment_deep_dive` blijft de enige expliciete add-on.
- [x] Toekomstige proposities blijven reserved future routes totdat een apart vervolgtraject ze activeert.

## 9. Validation Run

Uitgevoerd in deze tranche:

- [x] `frontend`: `npm.cmd test -- --run lib/marketing-positioning.test.ts`
- [x] `frontend`: `npm.cmd run lint -- app/page.tsx app/producten/page.tsx "app/producten/[slug]/page.tsx" "app/producten/[slug]/opengraph-image.tsx" app/tarieven/page.tsx app/aanpak/page.tsx components/marketing/contact-form.tsx components/marketing/solutions-dropdown.tsx components/marketing/site-content.ts lib/marketing-products.ts lib/marketing-positioning.test.ts`
- [x] `frontend`: `npm.cmd run build`
- [x] `backend/tests`: `python -m pytest tests/test_portfolio_architecture_program.py tests/test_pricing_packaging_system.py tests/test_sales_enablement_system.py tests/test_customer_lifecycle_and_expansion_model.py`
- [x] `python sync_planning_artifacts.py`

Niet uitgevoerd:

- [x] Geen extra niet-proportionele validatierondes buiten bovenstaande tests, lint, build en paritychecks.

## 10. Files That Carry This Tranche

- `docs/active/PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md`
- `frontend/lib/marketing-products.ts`
- `frontend/components/marketing/site-content.ts`
- `frontend/app/page.tsx`
- `frontend/app/producten/page.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/app/producten/[slug]/opengraph-image.tsx`
- `frontend/app/tarieven/page.tsx`
- `frontend/app/aanpak/page.tsx`
- `frontend/components/marketing/contact-form.tsx`
- `frontend/components/marketing/solutions-dropdown.tsx`
- `docs/reference/COMBINATIE_PORTFOLIO_MEMO.md`
- `frontend/lib/marketing-positioning.test.ts`
- `tests/test_portfolio_architecture_program.py`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`
- `docs/strategy/ROADMAP.md`
