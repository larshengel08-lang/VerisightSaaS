# WEBSITE_REDESIGN_AND_FLOW_PLAN.md

## 1. Summary

Dit traject heeft de publieke Verisight-website herbouwd op basis van de actuele repo-richting, zodat de site inhoudelijk klopt, visueel rustiger voelt en commercieel duidelijker converteert rond twee live routes: ExitScan en RetentieScan.

Uitgevoerde richting in deze tranche:

- homepage herbouwd rond routekeuze, deliverable-proof, vergelijking, audience-value en een strakkere contactflow
- productdetail scherper gemaakt als echte wedge-pagina's met eerdere proof, minder structurele gelijkenis en een secundaire rol voor de combinatieroute
- tarieven en aanpak compacter en geloofwaardiger gemaakt als kooprust-pagina's
- gedeelde marketinglaag aangescherpt op visual rhythm, CTA-hierarchie, trustdistributie en natuurlijker Nederlands
- publieke sample-output routes expliciet bereikbaar gehouden via gedeelde public-route-access in middleware
- source-of-truth vastgelegd in gedeelde content en bijgewerkte prompt-administratie

Hybride baseline:

- actuele repo-working-tree was leidend voor uitvoering
- live/main-verschillen bleven relevant als releasebewaking, maar blokkeerden de redesign niet

Status 2026-04-15:

- uitgevoerd in repo
- frontend tests, lint en build groen
- aanvullende code-level checks gedaan op CTA-flow, trust-linking, showcase-koppelingen en responsive breakpoints
- tweede visuele pass uitgevoerd op homepage en producthero's om de redesign ook boven de vouw duidelijker zichtbaar te maken
- gerichte visual integrity pass uitgevoerd op `/`, `/producten`, `/producten/exitscan`, `/producten/retentiescan`, `/tarieven` en `/aanpak`
- browsermatige breakpoint-QA gedaan op mobiel, tablet en desktop via lokale build- en screenshotcontrole
- layoutsysteem aangescherpt op shellbreedte, vertical rhythm, hero-measures, CTA-rijen, panelhiërarchie, stage-balans en globale overflow-resets
- aanvullende brede visual repair uitgevoerd op de gedeelde hero-shell: intro, stage en support losgetrokken zodat tablet- en mobile-compositie rustiger en logischer opbouwt
- tabletnavigatie hersteld via publieke header-breakpoints zodat menu-toegang niet meer wegvalt tussen mobile en desktop
- midden- en onderlaag verder genormaliseerd via gedeelde flow-stack, compacter sectieritme en minder hoge preview/proof-rails
- gecontroleerde compositiepass per paginatype uitgevoerd: overview, productdetail, pricing, aanpak en support gebruiken nu verschillende hero-measures, stage-dichtheid, supportgewicht en linkrollen binnen dezelfde gedeelde marketing-shell
- naar `main` gepusht en live opnieuw geverifieerd in deze tranche

## 2. Visual Direction

- Verisight voelt nu premium, rustig en boardroom-capable in plaats van als nette maar generieke SaaS-template.
- ExitScan blijft visueel de primaire wedge via blauwtinten, strakkere copy en hardere productfocus.
- RetentieScan blijft complementair via emerald-accenten en verification-first framing.
- Combinatie blijft lichter en secundair, zodat de eerste keuze niet diffuus wordt.
- Layout en spacing zijn aangescherpt op grotere ritmes, minder gelijkgewichtige cards en een duidelijkere verdeling tussen hero, proof, vergelijking en CTA-finale.

## 3. Design Guardrails

- Geen generieke startup- of template-esthetiek.
- Geen planmatrix-gevoel in pricing.
- Geen trust-theater aan de bovenkant van elke pagina.
- Geen sample-output die rijker of harder claimt dan echte deliverables.
- Geen Engels denkende copy in een Nederlands jasje.
- Geen terugval naar losse kaartengrid met overal hetzelfde visuele gewicht.

## 4. Priority Pages

1. Homepage
2. Productpagina's
3. Tarieven
4. Aanpak
5. Productenoverzicht

Deze volgorde was leidend tijdens uitvoering omdat begrip, wedge-positionering en kooprust de grootste commerciële winst opleveren vóór ondersteunende overzichtslagen.

## 5. Milestones

### Milestone 1 - Diagnose En Prioritering Van De Huidige Site
Dependency: none

#### Tasks
- [x] Per kernpagina de grootste structurele, visuele en commerciële zwaktes vastgelegd.
- [x] Werking-tree versus live/main als hybride baseline benoemd.
- [x] Grootste breukpunten geprioriteerd: te veel gelijkgewichtige secties, te weinig deliverable-proof, te vlakke CTA-opbouw.

#### Definition of done
- [x] Redesignprioriteiten waren expliciet genoeg om zonder nieuwe productbeslissingen uit te voeren.

#### Validation
- [x] Uitvoering kon daarna pagina voor pagina worden doorgevoerd zonder opnieuw scope te bepalen.

### Milestone 2 - Visual Direction En Design Guardrails
Dependency: Milestone 1

#### Tasks
- [x] Gedeelde marketing-contentlaag herschreven.
- [x] Shell, header, footer en globale marketing-ritmes aangescherpt.
- [x] Visual direction doorvertaald naar grotere panelen, rustiger CTA-hierarchie en minder herhaalde componentpatronen.
- [x] Tweede visuele pass toegevoegd met donker stage-hero contrast, sterkere asymmetrie en minder catalogusgevoel boven de vouw.

#### Definition of done
- [x] Er ligt een concreter, consistenter en rustiger marketingfundament.

#### Validation
- [x] Shared marketingcomponents ondersteunen nu een premiumer ritme zonder nieuw stijlsysteem per pagina.

### Milestone 3 - Informatiearchitectuur En Paginaflow
Dependency: Milestone 2

#### Tasks
- [x] Homepage, productenoverzicht, productdetail, aanpak en tarieven herordend rond duidelijke conversion roles.
- [x] Trust publiek bereikbaar gehouden, maar minder dominant in de eerste commerciële flow.
- [x] Sample-output als prooflaag explicieter geïntegreerd op home, productdetail en tarieven.

#### Definition of done
- [x] Elke kernpagina heeft een duidelijkere commerciële taak.

#### Validation
- [x] Routekeuze, proof en gesprek volgen logischer op elkaar dan voorheen.

### Milestone 4 - Hero, Bovenste Flow En Kernboodschap
Dependency: Milestone 3

#### Tasks
- [x] Homepage-hero herbouwd rond managementroute in plaats van brede uitleg.
- [x] Producthero's aangescherpt op route, deliverable en productgrens.
- [x] ExitScan visueel primair gehouden; RetentieScan complementair; Combinatie secundair.
- [x] Homepage en productdetail visueel verder uit elkaar getrokken van de eerdere template-achtige compositie.

#### Definition of done
- [x] De eerste schermen maken sneller duidelijk wat Verisight is en welke route logisch is.

#### Validation
- [x] Hero-copy en CTA-logica sluiten directer aan op strategy, boardroom, trust en founder-led sales.

### Milestone 5 - Benefits, Hoe Het Werkt, Output En Trustlaag
Dependency: Milestone 4

#### Tasks
- [x] Benefits, proof, preview, sample-output en trust compacter en logischer geordend.
- [x] Pricing en aanpak gekoppeld aan dezelfde commerciële leeslijn als productdetail.
- [x] Contactflow behouden als eindpunt van de route, niet als los formulierenblok.
- [x] Publieke voorbeeldrapporten expliciet publiek toegankelijk gehouden in route-access en middleware.

#### Definition of done
- [x] Midden- en onderkant van de site verkopen productwaarde en vervolgstap helderder.

#### Validation
- [x] Deliverable-proof en trust ondersteunen nu de flow in plaats van die te versnipperen.

### Milestone 6 - Copy Polish, Nederlands, Consistentie En Responsive Afwerking
Dependency: Milestone 5

#### Tasks
- [x] Buyer-facing copy genormaliseerd naar natuurlijker Nederlands.
- [x] Footer- en copy-artefacten opgeschoond.
- [x] Shared labels en CTA's gealigneerd op kennismaking, routes en deliverables.
- [x] Frontend tests, lint en build gedraaid.
- [x] Code-level parity checks gedaan op CTA-flow, trust-linking, showcase-koppelingen en responsive breakpointgebruik.
- [x] Visual integrity pass uitgevoerd op shellbreedte, heading-measures, panelhiërarchie, CTA-rijen en stage-balans.
- [x] Browsermatige breakpoint-QA gedaan op home, producten, productdetail, tarieven en aanpak.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor `WEBSITE_REDESIGN_AND_FLOW_PLANMODE_PROMPT.md`.

#### Definition of done
- [x] De site leest consistenter, rustiger en professioneler.
- [x] De bovenkanten van de kernpagina's breken rustiger en consistenter op mobiel, tablet en desktop.

#### Validation
- [x] `npm.cmd test -- --run lib/marketing-positioning.test.ts lib/report-preview-copy.test.ts lib/sample-showcase-assets.test.ts`
- [x] `npm.cmd test -- --run lib/marketing-flow.test.ts`
- [x] `npm.cmd run lint`
- [x] `npm.cmd run build`
- [x] Code-level responsive / copy / trust / flow parity checks via inline repo-validatie op aangepaste pagina's en gedeelde marketingcontent.
- [x] Browsermatige screenshot-QA via lokale production build op mobiel, tablet en desktop voor `/`, `/producten`, `/producten/exitscan`, `/producten/retentiescan`, `/tarieven` en `/aanpak`.

## 6. Page-Level Redesign Direction

### Homepage
- Current issues: te veel gelijkgewichtige secties, te weinig premium proof, trust te vroeg breed zichtbaar
- Why it underperforms: rationeel sterk, visueel te vlak
- Proposed direction: dominante hero, snelle routekeuze, deliverable-proof, vergelijking, audience-value, CTA
- Primary CTA and conversion role: `Plan kennismaking` als eindpunt van oriëntatie plus overtuiging

### Productpagina's
- Current issues: te veel structurele gelijkenis en te late proof
- Why it underperforms: verschil is inhoudelijk duidelijk maar nog niet verkooptechnisch scherp genoeg
- Proposed direction: eerdere sample-output, minder shell-sameness, duidelijker productgrenzen, secundaire rol voor combinatie
- Primary CTA and conversion role: `Plan kennismaking` na proof en productbegrip

### Tarieven
- Current issues: pricing voelde te informatief en te los van sample-output
- Why it underperforms: rationeel antwoord zonder maximale kooprust
- Proposed direction: prijsankers eerst, proof daarna, vervolgvormen compacter, trust lager in de flow
- Primary CTA and conversion role: `Plan kennismaking` na begrip van eerste route en prijsanker

### Aanpak
- Current issues: procespagina voelde blokmatiger en minder premium dan productlagen
- Why it underperforms: legde uit maar verkocht voorspelbaarheid nog niet sterk genoeg
- Proposed direction: lineaire deliveryflow, inbegrepen output, routecards en procestrust
- Primary CTA and conversion role: `Plan kennismaking` na product- en pricingbegrip

### Productenoverzicht
- Current issues: duidelijk maar commercieel vlakker dan homepage en detailpagina's
- Why it underperforms: oriënteert goed, overtuigt beperkt
- Proposed direction: twee primaire tegels, combinatie secundair, vergelijking en preview ondersteunend
- Primary CTA and conversion role: doorsturen naar detailpagina of gesprek

## 7. Execution Breakdown By Subsystem

### Content architecture
- `site-content.ts` herschreven als canonieke buyer-facing contentlaag voor nav, trust, pricing, homepageflow en supporting pages.

### Navigation and CTA architecture
- header, footer en shell aangescherpt op eenvoudigere routekeuze en kennismakings-CTA
- trust blijft bereikbaar, maar minder dominant in de bovenkant van commerciële pagina's

### Visual system and shared components
- `marketing-page-shell`, `public-header`, `public-footer`, `preview-slider` en `sample-showcase-card` aangescherpt op rust, proof en CTA-ritme
- globale marketingspacing en shellbreedte verfijnd in `globals.css`
- visual integrity pass toegevoegd voor gedeelde hero-measures, contentbreedte, panelradius, box-sizing, image max-width en stage-compositie
- aanvullende paginatype-pass toegevoegd in `marketing-page-shell` en `globals.css`, zodat overview, productdetail, pricing, aanpak en support niet langer als dezelfde hero-compositie aanvoelen

### Page work
- homepage herbouwd rond routekeuze, proof, vergelijking en contact
- productenoverzicht compacter en duidelijker gemaakt
- ExitScan en RetentieScan eerder proof-driven gemaakt
- combinatie duidelijker secundair gepositioneerd
- tarieven en aanpak herbouwd op kooprust
- paginatypes verder uit elkaar getrokken via verschillende hero-grid-verhoudingen, title-scales, stage-title-scales, support-layouts en snellere vervolglinks

### Public access and proof delivery
- publieke voorbeeldrapporten en contactroute expliciet gecentraliseerd in `public-route-access` zodat sample-output buyer-facing blijft zonder loginfrictie
- `middleware.ts` gebruikt deze gedeelde toegangslijst nu als canonieke publieke toegangsbasis

## 8. Current Product Risks

- UX-risico blijft bestaan wanneer later weer teveel gelijkgewichtige cards worden toegevoegd.
- Conversierisico blijft bestaan wanneer trust of pricing opnieuw te vroeg of te breed in de flow komt.
- Generieke SaaS-uitstraling kan terugkeren zodra nieuwe secties zonder ritmediscipline worden toegevoegd.
- Taalrisico blijft bestaan wanneer copy buiten de centrale contentlaag opnieuw los evolueert.
- Repo-release-risico blijft relevant zolang deze tranche nog niet is gepusht.

## 9. Open Questions

- Moet Combinatie op termijn een volledige pagina blijven of later ondersteunender worden?
- Willen we op termijn echte case-proof toevoegen zodra pilots beschikbaar zijn?
- Willen we body-typografie later nog explicieter aanpassen nu de layout- en copylaag eerst zijn aangescherpt?

## 10. Follow-up Ideas

- Gebruik daarna `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT` voor intake-, demo- en vervolgstroom.
- Gebruik daarna `SEO_CONVERSION_PROGRAM` zodra messaging en page-order stabiel zijn.
- Voeg later een kleine case-proof laag toe zodra echte cases beschikbaar zijn.
- Overweeg later een rijkere HTML-showcasevariant naast pdf-proof.

## 11. Out of Scope For Now

- dashboard- of app-redesign
- auth- of surveyflow-redesign
- nieuwe productfamilies buiten ExitScan, RetentieScan en Combinatie
- pricingmodel-herontwerp buiten presentatie en flow
- nieuwe trustclaims of badges zonder feitelijke basis
- backend- of contact-API-herbouw

## 12. Defaults Chosen

- `WEBSITE_REDESIGN_AND_FLOW_PLANMODE_PROMPT.md` bleef de leidende prompt
- deliverable staat in `docs/active/WEBSITE_REDESIGN_AND_FLOW_PLAN.md`
- hybride baseline bleef leidend
- ExitScan blijft de primaire commerciële wedge
- RetentieScan blijft complementair en verification-first
- trust blijft reassurance, niet de eerste pitch
- sample-output blijft kernonderdeel van de redesign
