# Phase Next Step 15 - Post-Leadership Suite Freeze and Consolidation Gate Plan

## Title

Freeze the current Verisight suite after Leadership Scan activation, and explicitly route the next work toward suite consolidation and commercialization hardening instead of another product expansion.

## Korte Summary

Na de green close-out van [WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md) is de beoogde bredere Verisight-suite nu feitelijk live:

- twee kernproducten: `ExitScan`, `RetentieScan`
- een buyer-facing portfolioroute: `Combinatie`
- vier bounded follow-on routes: `Pulse`, `TeamScan`, `Onboarding 30-60-90`, `Leadership Scan`
- zes runtime `scan_type`-producten: `exit`, `retention`, `pulse`, `team`, `onboarding`, `leadership`

De eerstvolgende logische stap is daarom niet nog een nieuwe candidate openen. De suite is nu breed genoeg dat het grootste risico niet meer "te weinig aanbod" is, maar:

- routeverwarring
- contractdrift tussen marketing, funnel en runtime
- asymmetrie tussen wat publiek live staat en wat backend/API volledig ondersteunt
- te vroege verschuiving van decision-driven suite naar brede productcatalogus

De kernbeslissing van deze stap is daarom:

- Verisight wordt nu bestuurlijk bevroren op de huidige zeven live buyer-facing routes
- er opent geen nieuwe productlijn of nieuwe candidate-planning
- de volgende gecontroleerde track wordt expliciet `suite consolidation + commercial architecture refresh + runtime hardening`
- pas nadat die nieuwe consolidatielaag decision-complete en vervolgens groen is, mag een latere expansion- of scale-up keuze opnieuw op tafel komen

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen nieuwe buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De huidige implementatie laat nu een belangrijk nieuw omslagpunt zien:

### 1. The suite is now broad enough

- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) kent nu zeven live buyer-facing routes
- [types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts) kent nu zes runtime `scan_type`-producten
- [registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py) kent nu zes backend productmodules
- de follow-on laag is nu groter geworden dan in de eerdere consolidatiestappen waarop de huidige suiteguardrails waren gebaseerd

### 2. The current risk has shifted

Na Leadership is het grootste risico nu niet nieuwe productarmoede, maar suitespanning:

- de publieke suite voelt sneller als brede catalogus als de hiërarchie niet opnieuw expliciet wordt aangescherpt
- buyer-facing follow-on routes kunnen te groot gaan klinken ten opzichte van de kernproducten
- report-, funnel- en contactcontracten kunnen uit sync raken met de live routewerkelijkheid
- reserved future routes (`MTO`, `Customer Feedback`) kunnen te vroeg opnieuw aandacht trekken

### 3. There is already evidence that consolidation matters more than expansion

De huidige codebase laat al zien dat de volgende winst vooral in consolidatie zit:

- frontend funnel ondersteunt nu wel `leadership` in [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- maar backend `ContactRequestCreate.route_interest` in [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py) kent `leadership` nog niet
- dit soort contractmismatches zijn precies het type issue dat nu belangrijker is dan nog een extra route openen

Daarom moet de suite eerst opnieuw bestuurlijk worden vastgezet voor de nieuwe zeven-route realiteit.

## Current Implementation Baseline

### 1. Current live buyer-facing suite

- [x] `ExitScan` en `RetentieScan` zijn live `core_product`
- [x] `Combinatie` is live `portfolio_route`
- [x] `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` zijn live `follow_on_route`
- [x] de huidige buyer-facing suite telt dus zeven live routes

### 2. Current runtime suite

- [x] backend `CampaignCreate.scan_type` ondersteunt `exit | retention | pulse | team | onboarding | leadership`
- [x] frontend `ScanType` ondersteunt `exit | retention | pulse | team | onboarding | leadership`
- [x] de runtime blijft campaign-centered en kent nog geen aparte plan-, billing- of entitlementlaag

### 3. Current reserved future set

- [x] `MTO` blijft `reserved_future`
- [x] `Customer Feedback` blijft `reserved_future`
- [x] er is nu geen andere serieuze expansion-candidate actief geopend

### 4. Current suite tension

- [x] de bestaande consolidatie- en runtime-gates waren geschreven voor de pre-Leadership suite
- [x] de live follow-on laag is nu groter en semantisch gevoeliger dan eerder
- [x] er bestaan al signalen van contractdrift tussen funnel en backend-contactschema
- [x] de volgende bestuurlijke winst zit dus in herconsolidatie, niet in verbreding

## Decision

### 1. The Suite Is Now Explicitly Frozen At Seven Live Buyer-Facing Routes

Beslissing:

- de live buyer-facing suite wordt nu bestuurlijk bevroren op:
  - `ExitScan`
  - `RetentieScan`
  - `Combinatie`
  - `Pulse`
  - `TeamScan`
  - `Onboarding 30-60-90`
  - `Leadership Scan`
- er opent nu geen achtste live route
- `MTO` en `Customer Feedback` blijven expliciet gesloten

Rationale:

- de huidige suite is nu groot genoeg om eerst opnieuw als geheel scherp te worden gemaakt
- extra routegroei zou nu eerder diffusie dan productkwaliteit toevoegen

### 2. No New Expansion Candidate Opens After Leadership

Beslissing:

- er start nu geen nieuwe product-candidate-reeks
- er komt nu geen `PHASE_NEXT_STEP_*` voor een volgende productlijn
- reserved routes blijven bestuurlijk op afstand tot na consolidatie en hardening

Rationale:

- Leadership was de laatste serieuze bounded candidate die direct aansloot op de bestaande suite
- de resterende reserved routes liggen inhoudelijk verder weg of vragen een andere suitevorm

### 3. The Next Track Becomes Seven-Route Suite Consolidation

Beslissing:

- de eerstvolgende track is expliciet geen expansion-track maar een consolidatie-track
- die track moet opnieuw vastzetten:
  - de commerciële hiërarchie voor de zeven-route suite
  - de funnel- en CTA-hiërarchie
  - de report-, route- en runtime-contracten
  - de suite-brede regressie- en smokeverwachtingen

Rationale:

- eerdere consolidatie- en QA-docs waren correct voor de pre-Leadership suite
- na Leadership is een refresh nodig zodat de source of truth weer klopt met de huidige productrealiteit

### 4. Commercialization Is Only Allowed As Controlled Hardening, Not As Breadth Expansion

Beslissing:

- commercialization mag nu alleen gaan over:
  - scherpere packaging
  - sterkere CTA-logica
  - betere routekeuze
  - helderdere pricing- en trustuitlijning
  - suitecoherentie
- commercialization mag niet gebruikt worden om:
  - nieuwe productlijnen te openen
  - follow-on routes op te blazen tot quasi-kernproducten
  - de suite te reframen als brede people-platformcatalogus

### 5. Runtime Hardening Must Now Catch Live Contract Drift

Beslissing:

- de volgende runtime/QA-refresh moet expliciet alle live route- en funnelcontracten opnieuw toetsen
- concrete contractmismatches tellen nu als prioritaire consolidatierisico's
- het feit dat een route live is buyer-facing betekent dat contact-, CTA-, metadata- en backend-oppervlakken opnieuw als geheel beoordeeld moeten worden

Rationale:

- Leadership is nu publiek live
- dus contractdrift zoals `frontend leadership route_interest wel, backend contact schema nog niet` is nu belangrijker dan een volgende roadmapsprong

## Key Changes

- de suite wordt na Leadership expliciet bevroren
- er opent geen nieuwe productlijn of candidate-track
- de volgende bestuurlijke focus verschuift naar consolidatie, commercialization hardening en runtime-contractdiscipline
- oudere zes-route consolidatie-aannames mogen niet stilzwijgend leidend blijven
- de zeven-route suite moet nu opnieuw expliciet als geheel worden vastgezet

## Belangrijke Interfaces/Contracts

### 1. Live Suite Contract

Live buyer-facing suite:

- `exitscan`
- `retentiescan`
- `combinatie`
- `pulse`
- `teamscan`
- `onboarding-30-60-90`
- `leadership-scan`

Beslissing:

- deze set blijft nu bestuurlijk vast

### 2. Runtime Product Contract

Live runtime `scan_type` set:

- `exit`
- `retention`
- `pulse`
- `team`
- `onboarding`
- `leadership`

Beslissing:

- geen nieuwe runtime `scan_type` mag openen voordat de refresh op consolidatie en hardening is afgerond

### 3. Reserved Future Contract

Remaining reserved routes:

- `mto`
- `customer-feedback`

Beslissing:

- beide blijven dicht
- geen van beide opent nu als nieuwe candidate

### 4. Post-Leadership Governance Contract

Volgorde vanaf nu:

1. suitefreeze bevestigen
2. seven-route suite commercial architecture refresh
3. seven-route runtime hardening and QA refresh
4. pas daarna eventueel expliciete keuze over verdere scale-up of latere expansion

## Primary Reference Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [docs/strategy/PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md)
- [docs/strategy/PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md)
- [docs/strategy/WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md)

## Testplan

### Product acceptance

- [x] Er opent geen nieuwe productlijn direct na Leadership.
- [x] De suitefreeze is expliciet voor de huidige live route-set.
- [x] De volgende track gaat over consolidatie in plaats van breadth.

### Strategy acceptance

- [x] De stap sluit aan op de huidige live suite en niet op een abstract toekomstbeeld.
- [x] De stap behandelt Leadership als omslagpunt naar herconsolidatie.
- [x] De vervolgstap is eenduidig: eerst architecture refresh, niet expansion.

### Codebase acceptance

- [x] Het document erkent de huidige zeven-route en zes-runtime realiteit.
- [x] Het document benoemt concrete contractdrift in de huidige implementatie als consolidatiesignaal.
- [x] Er wordt geen nieuwe runtime- of marketinguitbreiding uitgevoerd in deze stap.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de post-Leadership suitefreeze.
- [x] De governancevolgorde na Leadership is expliciet.
- [x] De eerstvolgende toegestane stap is duidelijk begrensd.

## Assumptions/Defaults

- Leadership was de laatste bounded uitbreiding die logisch direct aansloot op de huidige suite
- de grootste volgende winst zit nu in suitekwaliteit, contractdiscipline en commerciële scherpte
- reserved future routes blijven bestuurlijk dicht totdat de zeven-route suite eerst stabieler en coherenter is gemaakt
- consolidation en commercialization moeten nu opnieuw worden bekeken voor de actuele suite, niet voor de eerdere zes-route versie

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_16_SEVEN_ROUTE_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md`

Er is nog geen build permission voor een nieuwe productlijn of nieuwe expansion-candidate.
