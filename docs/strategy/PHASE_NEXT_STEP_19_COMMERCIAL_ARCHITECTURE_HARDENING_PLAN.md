# Phase Next Step 19 - Commercial Architecture Hardening Plan

## Title

Sharpen the commercial architecture of the current Verisight suite so pricing, CTA hierarchy, route choice, suite copy, and buyer-facing sequencing stay aligned with the live seven-route portfolio before intake and ops hardening begin.

## Korte Summary

Na [PHASE_NEXT_STEP_18_CONTROLLED_COMMERCIALIZATION_AND_SCALE_UP_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_18_CONTROLLED_COMMERCIALIZATION_AND_SCALE_UP_HARDENING_PLAN.md) is nu expliciet besloten dat commercialization en scale-up hardening de volgende groeifase vormt.

De eerste stap binnen die fase is bewust niet:

- intake- of ops-implementatie
- billing of checkout
- SSO of enterprise controls
- een nieuwe productlijn

Maar juist:

- de commerciële architectuur van de huidige suite strakker vastzetten
- de routehiërarchie scherper maken
- pricing- en CTA-discipline opnieuw bevestigen
- buyer-facing copy en routekeuze reduceren tot een kleiner, helderder beslissysteem

De huidige buyer-facing suite is nu:

- `ExitScan`
- `RetentieScan`
- `Combinatie`
- `Pulse`
- `TeamScan`
- `Onboarding 30-60-90`
- `Leadership Scan`

De huidige commerciële spanning zit niet meer in “hebben we genoeg routes?”, maar in:

- houden we de eerste koop scherp genoeg?
- voorkomen we catalogusgevoel?
- houden we follow-on routes klein én onderscheidend?
- blijft de commerciële leeslijn hetzelfde op home, producten, tarieven, vertrouwen en contact?

De kernbeslissing van deze stap is daarom:

- Verisight blijft commercieel `core-first`
- de commerciële architectuur moet nu expliciet bewaken dat de live zeven-route suite nog steeds als klein, strak en decision-driven aanvoelt
- de eerstvolgende implementation track hoort pas te openen nadat deze architectuur bestuurlijk volledig scherp staat

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The suite is live, but commercial discipline now matters more than more feature breadth

De huidige codebase heeft al:

- publieke pricingankers in [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- route-aware CTA’s in [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- suite- en routecopy in [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- een buyer-facing productoverzicht in [producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)

Daarmee is er genoeg commerciële structuur aanwezig om nu niet opnieuw te ontwerpen, maar om gericht te verharden.

### 2. The main risk is now suite blur across surfaces

De huidige suite kent nu:

- twee kernproducten
- één portfolioroute
- vier follow-on routes

Zonder expliciete commerciële architectuur kan die suite te snel voelen als:

- zeven producten die tegelijk concurreren
- te veel CTA’s zonder heldere default
- te brede vervolgroutes
- te weinig onderscheid tussen `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan`

### 3. Pricing, CTA and copy must now work as one decision system

De huidige implementatie toont al een sterke richting:

- `ExitScan` blijft de default first route
- `RetentieScan` is de expliciete primary exception
- follow-on routes zijn `op aanvraag`
- contactcapture blijft route-aware

Maar deze laag moet nu expliciet als één commercieel systeem worden vastgezet, zodat latere intake- en ops-hardening daarop kunnen bouwen.

### 4. This is the last decision layer before commercial implementation waves

Als deze stap niet eerst scherp genoeg is, dan ontstaan in latere implementation waves snel verkeerde optimalisaties:

- te brede qualification
- te vroege lead-routing complexiteit
- copy- of CTA-wijzigingen die de suite juist diffuser maken
- ops-optimalisaties op een commercieel model dat nog niet strak genoeg vastligt

## Current Implementation Baseline

### 1. Current route hierarchy in code

- [x] `ExitScan` en `RetentieScan` zijn buyer-facing kernproducten
- [x] `Combinatie` is buyer-facing portfolioroute
- [x] `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` zijn buyer-facing follow-on routes
- [x] `ExitScan` blijft CTA-default in funnel en globale primary CTA’s

### 2. Current pricing and package reality

- [x] kernproducten hebben publieke prijsankers
- [x] follow-on routes blijven `op aanvraag`
- [x] combinatie blijft route-only en geen discount- of bundelverhaal
- [x] pricing blijft assisted en niet-SaaS

### 3. Current copy and portfolio reality

- [x] home, producten, tarieven en vertrouwen noemen nu dezelfde suite
- [x] follow-on routes zijn publiek zichtbaar
- [x] de site probeert nu al expliciet kernproducten van vervolg te onderscheiden
- [x] `Leadership Scan` heeft al buyer-facing guardrails tegen named leader- en 360-framing

### 4. Current funnel reality

- [x] contactflow is route-aware
- [x] `ExitScan` is default route-interest
- [x] `nog-onzeker` blijft beschikbaar
- [x] follow-on routes kunnen buyer-facing gekozen worden, maar zijn nog geen globale defaults

## Decision

### 1. Core-First Commercial System Remains Hard

Beslissing:

- Verisight blijft buyer-facing draaien om twee eerste kernroutes:
  - `ExitScan`
  - `RetentieScan`

- `Combinatie` blijft een expliciete portfolioroute tussen twee kernvragen
- alle overige routes blijven commercieel kleiner dan de eerste koop

Rationale:

- dit voorkomt zeven gelijke keuzes
- dit houdt de suite verkoopbaar in een boardroom- en HR-context

### 2. First-Route Contract

Beslissing:

- `ExitScan` blijft de default first route
- `RetentieScan` blijft alleen primaire eerste route wanneer de actieve behoudsvraag aantoonbaar voorligt
- `Combinatie` mag nooit de standaard eerste route zijn
- follow-on routes mogen nooit globale startdefaults worden

Niet toegestaan:

- de homepage of globale CTA verschuiven naar een follow-on route
- `Combinatie` behandelen als standaard instappakket
- `Leadership Scan` of onboarding laten lezen als nieuw kernproduct

### 3. Commercial Hierarchy Contract

De commerciële hiërarchie wordt nu definitief als volgt vastgezet:

- `core_product`
  - `ExitScan`
  - `RetentieScan`
- `portfolio_route`
  - `Combinatie`
- `follow_on_route`
  - `Pulse`
  - `TeamScan`
  - `Onboarding 30-60-90`
  - `Leadership Scan`

Beslissing:

- elke buyer-facing surface moet deze hiërarchie kunnen reproduceren
- een route mag publiek zichtbaar zijn zonder daarmee ook “eerste koop” te worden

### 4. Pricing Discipline Contract

Beslissing:

- publieke prijsankers blijven exclusief gekoppeld aan kernproducten
- `Combinatie` blijft `op aanvraag`
- alle follow-on routes blijven `op aanvraag`
- pricing mag de suite niet verbreden tot parallelle shoppingopties

Niet toegestaan:

- follow-on routes een vergelijkbare publieke prijsblokstatus geven als de kernproducten
- introductie van plan-, seat-, usage- of subscriptiontaal
- commerciële copy die follow-on routes doet voelen als low-friction trial products

### 5. CTA Hierarchy Contract

Beslissing:

- globale primary CTA blijft `Plan kennismaking` richting een kernroutegesprek
- secondaire CTA’s mogen verwijzen naar producten, tarieven of vertrouwen
- route-specifieke CTA’s op productpagina’s blijven toegestaan, maar moeten bounded blijven
- contactcapture blijft route qualification, niet open productshopping

Niet toegestaan:

- globale CTA-fragmentatie per route
- meerdere concurrerende primaire CTA-richtingen op dezelfde kernsurface
- CTA-copy die buyer-facing een route “te makkelijk” als default vervolg verkoopt

### 6. Follow-On Differentiation Contract

Beslissing:

- de vier follow-on routes moeten niet alleen kleiner klinken, maar ook duidelijker verschillen in managementvraag:
  - `Pulse` = hercheck / review
  - `TeamScan` = lokalisatie
  - `Onboarding 30-60-90` = vroege lifecycle-check
  - `Leadership Scan` = bounded managementcontext-duiding

Niet toegestaan:

- `TeamScan` en `Leadership Scan` als semantisch uitwisselbaar vertellen
- `Onboarding 30-60-90` laten overlappen met client onboarding
- `Pulse` laten voelen als brede trendmachine of nieuwe baseline

### 7. Suite Surface Consistency Contract

Beslissing:

- de commerciële architectuur moet consistent blijven over minimaal deze oppervlakken:
  - [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
  - [producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
  - [producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
  - [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
  - [vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx)
  - [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
  - [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)

- deze surfaces moeten samen hetzelfde antwoord geven op:
  - wat is de eerste route?
  - wanneer is een follow-on logisch?
  - hoe klein blijft die follow-on?
  - wat is bewust geen kernproduct?

### 8. Commercial Architecture Stops Before Qualification Logic And Ops Logic

Beslissing:

- deze stap eindigt bij:
  - routehiërarchie
  - pricing discipline
  - CTA discipline
  - suitecopy discipline
  - cross-surface consistency

- deze stap opent nog niet:
  - qualification states
  - intake triage logic
  - delivery handoff logic
  - support/ops workflow changes

Rationale:

- eerst het commerciële model, dan pas de commerciële machine eromheen

## Key Changes

- de commerciële architectuur wordt nu als zelfstandig beslissysteem vastgezet
- core-first selling blijft de harde backbone
- follow-on differentiatie wordt scherper gemaakt als architectuurregel, niet alleen als copykwaliteit
- pricing en CTA discipline blijven klein, assisted en non-SaaS
- latere qualification- en ops-tracks krijgen nu een duidelijker fundament

## Belangrijke Interfaces / Contracts

### 1. Entry Route Contract

- `default_first_route = ExitScan`
- `explicit_exception = RetentieScan`
- `portfolio_route_only = Combinatie`
- `follow_on_only = Pulse | TeamScan | Onboarding 30-60-90 | Leadership Scan`

### 2. Pricing Contract

- `public_anchor = core products only`
- `quote_only = portfolio route + all follow-on routes`
- `no bundle discount default = true`
- `no plans/seats/subscriptions = true`

### 3. CTA Contract

- `global_primary_cta = Plan kennismaking`
- `global_primary_cta_target = core-first route conversation`
- `route_specific_cta = allowed but bounded`
- `default_route_interest = exitscan`

### 4. Follow-On Semantics Contract

- `pulse != broader baseline`
- `teamscan != leadership scan`
- `onboarding != client onboarding`
- `leadership != named leaders | 360 | performance`

### 5. Suite Surface Contract

De volgende buyer-facing surfaces moeten dezelfde commerciële hiërarchie blijven dragen:

- home
- producten overview
- product detail
- tarieven
- vertrouwen
- contact funnel
- shared marketing copy

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_18_CONTROLLED_COMMERCIALIZATION_AND_SCALE_UP_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_18_CONTROLLED_COMMERCIALIZATION_AND_SCALE_UP_HARDENING_PLAN.md)
- [SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md)
- [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)
- [CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md)
- [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
- [producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)

## Testplan

### Product acceptance

- [x] De suite blijft `core-first`.
- [x] De eerste koop blijft buyer-facing klein en helder.
- [x] Follow-on routes blijven vervolgstappen, geen parallelle instapproducten.

### Commercial acceptance

- [x] Pricing discipline blijft exclusief sterk op de kernproducten rusten.
- [x] CTA discipline blijft routekeuze boven catalogusgedrag plaatsen.
- [x] `Combinatie` blijft tussenroute en geen derde kernproduct.
- [x] `Leadership Scan` blijft bounded en niet semantisch te groot.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige live suite en bestaande marketing/funnel surfaces.
- [x] Dit document opent nog geen implementation wave.
- [x] Dit document forceert geen billing-, ops- of enterprise-architectuur.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de eerste commercialization subfase.
- [x] De grens tussen commercial architecture en latere qualification/ops hardening is expliciet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- de grootste korte-termijnwinst zit in kleinere, scherpere commerciële beslisstructuur
- buyer-facing surfaces moeten de suite reduceren, niet uitbreiden
- publieke zichtbaarheid van follow-on routes blijft toegestaan zolang de hiërarchie hard blijft
- de assisted, decision-driven productvorm blijft een commerciële sterkte
- verdere commercialization moet nog steeds one-wave-at-a-time blijven lopen

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md`

Er is nog geen build permission voor:

- billing
- checkout
- enterprise controls
- ops implementation waves
- een nieuwe productlijn
