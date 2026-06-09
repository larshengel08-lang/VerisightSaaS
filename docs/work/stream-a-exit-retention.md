# Werkstroom A - ExitScan / RetentieScan core maturity

Status: active  
Priority: highest  
Owner: Lars  
Last updated: 2026-05-26

## Purpose

Werkstroom A is de commerciele kern van Loep.

Deze werkstroom maakt precies deze keten volwassen:

- ExitScan
- RetentieScan
- dashboard
- PDF / formele output
- Action Center
- de admin/onboardinglaag die nodig is om deze kern herhaalbaar te laten werken

Alles buiten deze keten is ondergeschikt zolang de kern nog niet commercieel robuust is.

## Hard priority rule

Werkstroom A wint altijd van Werkstroom B.

Dat betekent:

- geen Stream B-werk mag Stream A blokkeren
- geen nieuwe productverbreding als Stream A nog zichtbare ruwe randen heeft
- geen nieuwe buyer-facing route-expansie zolang ExitScan en RetentieScan niet aantoonbaar volwassen zijn

## Primary source set

Lees deze documenten eerst voordat je aan Werkstroom A werkt:

- `C:\Users\larsh\Desktop\Business\Verisight\docs\active\COMMERCIAL_DEFAULT_MODEL.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\active\LOEP_CORE_MATURITY_ROADMAP.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\active\EXITSCAN_PRODUCT_SHARPENING_PLAN.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\active\RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\METHODOLOGY.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\active\ACTION_CENTER_CANON.md`

Als andere docs hiermee botsen, wint deze set.

## North star

Loep voelt pas volwassen als een klant door de kernketen kan zonder voortdurende uitleg of handmatige redding:

1. route begrijpen
2. survey draaien
3. dashboard lezen
4. PDF vertrouwen en delen
5. eerste managementactie kiezen
6. follow-through en review in Action Center terugvinden

## Scope

### In scope

- ExitScan-productwaarheid
- RetentieScan-productwaarheid
- dashboardinformatiehierarchie
- rapport/PDF-parity
- Action Center bounded follow-through
- setup/admin/productization voor deze kern
- smoke- en acceptance-checks voor deze kern

### Out of scope

- Engagement / MTO enterprise-opbouw
- nieuwe buyer-facing productfamilies
- brede workflow-uitbouw in Action Center
- benchmark- of predictorlagen
- nieuwe marketingexperimentele routes
- architectuurvernieuwing zonder directe kernwinst

## Definition of done

### ExitScan

- productbelofte is consistent over website, dashboard en PDF
- geen drift naar generieke exit-enquete, diagnose of overclaim
- managementread voelt scherp, rustig en bestuurlijk bruikbaar

### RetentieScan

- productbelofte is consistent over website, dashboard en PDF
- geen drift naar brede MTO, predictor of diffuus surveyproduct
- privacy-, groeps- en vroegsignaallogica blijven expliciet

### Dashboard

- geen zichtbare broken visuals of incoherente lege states
- indicatief versus stevig beeld is direct leesbaar
- informatiehierarchie voelt kalm en senior
- gebruiker begrijpt zonder hulp wat belangrijk is en wat de volgende bounded stap is

### PDF

- rapport is deelbaar zonder excuses
- structuur, copy en claims sluiten aan op dashboardwaarheid
- visuele en inhoudelijke output voelt professioneel en consistent

### Action Center

- bounded follow-through blijft leidend
- eigenaar, eerste stap, reviewmoment en uitkomst zijn zichtbaar
- closeout en vervolgdiscipline zijn expliciet
- geen drift naar breed taak- of workflowplatform

### Operational readiness

- setup/adminflow voor deze kern is herhaalbaar
- acceptance/smoke-runs bestaan voor admin, respondent en klant
- minder founder-only handoffs

## Current maturity lens

Werk in deze volgorde, tenzij expliciet anders besloten:

1. productwaarheid en claimsdiscipline
2. dashboardvolwassenheid
3. PDF / formele output
4. Action Center follow-through
5. admin/onboarding productization

## Current blockers to watch

Gebruik deze checklist als heuristiek voor wat eerst aandacht vraagt:

- drift tussen productcopy, dashboardtaal en rapporttaal
- visuals die technisch werken maar niet senior/professioneel aanvoelen
- lege of half-actieve states die uitleg van Lars vragen
- Action Center-flow die nog te veel HR-/admin-interventie per stap vraagt
- setup of onboardingstappen die alleen via founder-memory helder zijn

## Non-negotiables

- Stream A niet verbreden met nieuwe productscope
- geen nieuwe claims buiten bewezen productgedrag
- dashboard blijft decision-first, geen tweede Action Center
- Action Center blijft bounded, geen brede operations wall
- admin/setup blijft ondersteunend aan de kern, niet de nieuwe hoofdervaring

## Required working style for other threads

Als een andere draad aan Werkstroom A werkt, moet die eerst teruggeven:

1. huidige staat
2. grootste maturity gap
3. waarom die gap commercieel relevant is
4. welke files geraakt worden
5. welke waarheid bewaakt moet blijven

Pas daarna implementeren.

## Prompt starter for Stream A threads

Gebruik dit als openingsblok:

```text
Lees eerst:
- AGENTS.md
- docs/work/stream-a-exit-retention.md
- docs/active/LOEP_CORE_MATURITY_ROADMAP.md
- docs/active/EXITSCAN_PRODUCT_SHARPENING_PLAN.md
- docs/active/RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md
- docs/reference/METHODOLOGY.md
- docs/active/ACTION_CENTER_CANON.md

Je werkt alleen aan Werkstroom A.
Verbreding naar Engagement / MTO, nieuwe buyer-facing producten of brede workflowlogica is buiten scope.

Doel:
maak Loep volwassener op de kernketen:
ExitScan / RetentieScan / dashboard / PDF / Action Center.

Geef eerst terug:
1. huidige staat
2. grootste maturity gaps
3. welke 1-2 gaps nu het meest commercieel schadelijk zijn
4. aanbevolen uitvoervolgorde
5. welke files geraakt worden

Nog niet implementeren. Eerst plan terug.
```
