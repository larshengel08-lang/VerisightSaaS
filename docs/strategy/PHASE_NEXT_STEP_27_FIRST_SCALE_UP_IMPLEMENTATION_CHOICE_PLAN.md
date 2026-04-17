# Phase Next Step 27 - First Scale-Up Implementation Choice Plan

## Title

Choose whether Verisight should now open exactly one first scale-up implementation track, or deliberately delay implementation and keep the current suite in its hardened assisted state.

## Korte Summary

Na [PHASE_NEXT_STEP_26_POST_READINESS_SEQUENCE_AND_IMPLEMENTATION_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_26_POST_READINESS_SEQUENCE_AND_IMPLEMENTATION_GATE_PLAN.md) is nu expliciet vastgezet dat:

- de readiness-reeks bestuurlijk compleet is
- geen enkele scale-up candidate automatisch opent
- `billing and checkout` alleen de eerste logische candidate is, niet de eerste verplichting

De volgende logische stap is daarom:

- expliciet kiezen of er nu überhaupt een eerste scale-up implementatiespoor mag openen

Niet:

- automatisch `billing` gaan bouwen
- parallel ook `identity`, `enterprise controls`, `connectors` of `analytics` voorbereiden
- readiness verwarren met mandate

De kernkeuze van deze stap is daarom:

- Verisight opent nu ofwel precies één eerste scale-up implementatietrack
- of kiest bewust voor `delay`, waarbij de huidige suite voorlopig de eindstatus blijft
- als er geopend wordt, is `billing and checkout` de enige toegestane eerste candidate

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The current sequence now requires an explicit executive-style choice

Tot nu toe hebben we:

- productuitbreiding gecontroleerd gedaan
- suite hardening uitgevoerd
- commercialization en scale-up bestuurlijk begrensd

De volgende stap kan nu niet meer automatisch uit de vorige volgen. Er is een echte keuze nodig:

- nu één klein scale-up spoor openen
- of de huidige assisted suite bewust als voldoende stabiele operating state aanhouden

### 2. “Not building yet” is now a valid strategic outcome

Na deze reeks is `delay` geen stilstand meer, maar een verdedigbare beslissing:

- de suite is live
- de suite is gehard
- de suite is commercieel en operationeel scherper gemaakt
- de readiness-thema’s zijn al afgebakend

Dat betekent dat niet bouwen nu net zo expliciet gekozen kan worden als wel bouwen.

### 3. If a track opens, it must be the smallest one with the clearest commercial reason

Op basis van de huidige volgorde blijft de eerste logische candidate:

- `billing and checkout`

Omdat deze candidate:

- de kleinste betekenisvolle grens vormt
- direct commercieel relevant kan zijn
- minder productsemantische verbouwing vraagt dan identity, enterprise controls of connectors

### 4. This step prevents quiet scope creep

Zonder deze keuze-gate zouden we makkelijk vervallen in:

- half billing
- half identity
- wat analytics
- wat ops-automation

Deze stap houdt vast dat één spoor tegelijk het enige toegestane tempo blijft.

## Current Implementation Baseline

### 1. Current suite baseline

- [x] zeven buyer-facing routes zijn live
- [x] zes runtime `scan_type`-producten draaien
- [x] suite hardening is uitgevoerd
- [x] commercialization en readiness-docs zijn uitgewerkt

### 2. Current scale-up candidate baseline

- [x] `billing and checkout` is alleen bestuurlijk afgebakend
- [x] `identity and enterprise controls` is alleen bestuurlijk afgebakend
- [x] `connectors and lifecycle analytics` is alleen bestuurlijk afgebakend

### 3. Current permission baseline

- [x] er is nog geen implementation permission voor een van deze tracks
- [x] er is nog geen parallel spoor toegestaan
- [x] de huidige assisted suite kan ook zonder nieuw spoor blijven bestaan

## Decision

### 1. The Next Step Must Resolve Build Now Versus Delay

Beslissing:

- vanaf dit punt moet expliciet gekozen worden tussen:
  - `open_first_scale_up_track_now`
  - `delay_scale_up_implementation`

Er is geen derde impliciete optie zoals:

- “alvast een beetje voorbereiden”
- “eerst klein wat technische basis leggen”

### 2. Only Billing And Checkout May Be Chosen As The First Scale-Up Track

Beslissing:

- als er nu een eerste implementatiespoor geopend wordt, dan mag dat alleen zijn:
  - `billing_and_checkout`

Niet toegestaan als eerste spoor:

- `identity_and_enterprise_controls`
- `connectors_and_lifecycle_analytics`

### 3. Delay Is The Default If The Reason To Build Is Not Sharp Enough

Beslissing:

- als de commerciële of operationele reden voor billing/checkout nu nog niet scherp genoeg is, geldt `delay` als default keuze

Rationale:

- de huidige suite werkt al
- de huidige assisted commerciële laag is coherent
- een te vroege billinglaag kan meer schade doen dan waarde opleveren

### 4. Opening Billing/Checkout Still Does Not Permit Broader Scale-Up Work

Beslissing:

- zelfs als `billing_and_checkout` gekozen wordt, geeft dat nog geen vrijgave voor:
  - identity / SSO
  - enterprise controls
  - connectors
  - analytics

Die blijven expliciet op slot tot na het eerste gekozen implementatiespoor.

## Choice Frame To Lock

### 1. Option A - Delay Scale-Up Implementation

Betekenis:

- er opent nu geen nieuw buildspoor
- de huidige suite blijft de actieve operating baseline
- eventuele latere heropening vraagt opnieuw een expliciet keuzemoment

Wanneer logisch:

- als assisted verkoop en delivery nog voldoende werken
- als billing nog geen directe bottleneck is
- als er meer waarde zit in exploitatie dan in extra systeemlagen

### 2. Option B - Open Billing And Checkout As First Scale-Up Track

Betekenis:

- er mag daarna een aparte decision-complete implementatievoorbereiding voor billing/checkout starten
- nog steeds één spoor tegelijk
- nog steeds zonder verbreding naar subscriptions, seats, SSO of enterprise breadth

Wanneer logisch:

- als commerciële afhandeling nu echt frictie veroorzaakt
- als er een duidelijke transactiegrens zichtbaar is
- als de huidige assisted routekeuze stabiel genoeg is om een kleine billinglaag te dragen

## Key Changes

- de scale-up keuze is nu expliciet gemaakt tot build-now-versus-delay beslismoment
- `billing and checkout` is bevestigd als enige toegestane eerste implementation candidate
- `delay` is expliciet gelegitimeerd als serieuze uitkomst
- bredere scale-up candidates blijven geblokkeerd

## Belangrijke Interfaces / Contracts

### 1. Choice Contract

Toegestane uitkomsten vanaf deze stap:

- `delay_scale_up_implementation`
- `open_billing_and_checkout_first`

### 2. First Track Contract

Als een first track opent:

- het is precies één track
- het is `billing_and_checkout`
- het is nog geen buildwave maar eerst een apart implementatieplan

### 3. Block Contract

Blijven dicht:

- `identity_and_enterprise_controls`
- `connectors_and_lifecycle_analytics`
- elke nieuwe productlijn
- parallelle scale-up tracks

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md)
- [PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md)
- [PHASE_NEXT_STEP_24_IDENTITY_AND_ENTERPRISE_CONTROLS_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_24_IDENTITY_AND_ENTERPRISE_CONTROLS_READINESS_PLAN.md)
- [PHASE_NEXT_STEP_25_CONNECTORS_AND_LIFECYCLE_ANALYTICS_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_25_CONNECTORS_AND_LIFECYCLE_ANALYTICS_READINESS_PLAN.md)
- [PHASE_NEXT_STEP_26_POST_READINESS_SEQUENCE_AND_IMPLEMENTATION_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_26_POST_READINESS_SEQUENCE_AND_IMPLEMENTATION_GATE_PLAN.md)

## Testplan

### Product acceptance

- [x] Deze stap opent geen nieuwe productlijn.
- [x] De huidige suite blijft intact ongeacht de keuze.
- [x] Scale-up blijft ondergeschikt aan productwaarheid.

### Commercial acceptance

- [x] `Delay` is expliciet een geldige uitkomst.
- [x] `Billing and checkout` is de enige toegestane eerste candidate.
- [x] Er opent nog geen bredere commercial breadth.

### Operational acceptance

- [x] Er opent nog geen implementation wave.
- [x] Parallelle tracks blijven verboden.
- [x] Assisted delivery en qualification blijven leidend totdat anders besloten wordt.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige state van de suite en readiness-docs.
- [x] Dit document introduceert geen nieuwe infrastructuur.
- [x] Dit document forceert geen implementation zonder expliciete vervolgstap.

### Documentation acceptance

- [x] Dit document functioneert als choice gate na de volledige readiness-reeks.
- [x] De twee toegestane uitkomsten zijn expliciet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- `delay` is de default als de reden voor billing/checkout niet scherp genoeg is
- de eerste implementation candidate blijft `billing and checkout`
- bredere scale-up work blijft riskanter dan de eerste billingcandidate
- na deze stap hoort eerst een expliciete keuze of vrijgave te volgen, niet automatisch build

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_28_BILLING_AND_CHECKOUT_IMPLEMENTATION_GATE_PLAN.md`

Er is nog geen build permission voor:

- billing implementation
- checkout implementation
- identity implementation
- enterprise controls implementation
- connectors implementation
- lifecycle analytics implementation
