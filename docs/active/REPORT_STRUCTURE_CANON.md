# REPORT_STRUCTURE_CANON.md

Last updated: 2026-04-18
Status: active
Source of truth: dit document is leidend voor de canonieke rapportstructuur van Verisight.

## 1. Purpose

Dit document legt twee dingen vast:

1. `ExitScan` heeft een vaste, niet-onderhandelbare rapportarchitectuur.
2. De gedeelde report grammar is een abstractielaag voor andere rapporten en mag de vaste ExitScan-opbouw niet reduceren, samenvoegen of herordenen.

Belangrijke boundary:

- de ExitScan-report-architectuur is elders inhoudelijk vastgezet en geldt hier als immutable source of truth
- redesign, parity of shared grammar mogen die architectuur niet heropenen
- RetentieScan en latere productlijnen mogen op de gedeelde grammar landen, maar niet door ExitScan terug te duwen naar een kortere generieke structuur

Primair gebruikte referenties:

1. [voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)
   - actuele ExitScan normset voor managementtoon en paginalogica
2. [verisight_spec_v3.html](C:/Users/larsh/Downloads/verisight_spec_v3.html)
   - target-architectuurinput voor RetentieScan en de bredere gedeelde grammar

## 2. ExitScan Architecture Freeze

### ExitScan vaste paginavolgorde

Voor `ExitScan` geldt de volgende vaste hoofdrapportstructuur:

1. `P1 - Cover`
2. `P2 - Respons`
3. `P3 - Bestuurlijke handoff`
4. `P4 - Frictiescore & verdeling van het vertrekbeeld`
5. `P5 - Signalen in samenhang`
6. `P6 - Drivers & prioriteitenbeeld`
7. `P7 - SDT Basisbehoeften`
8. `P8 - Organisatiefactoren`
9. `P9 - Eerste route & actie`

Canonregel:

- deze volgorde is vast voor ExitScan
- shared grammar mag deze pagina's niet samenvoegen of reduceren naar een generieke 6-paginavariant
- aanvullende appendix- of deep-dive-lagen mogen bestaan, maar nooit ten koste van deze hoofdflow

## 3. ExitScan Page Rules

### P1 - Cover

Required content:

- Verisight
- slogan
- bedrijfsnaam
- rapportnaam
- periode
- deep dive ja/nee

Purpose:

- calm, premium opening page
- orient the reader immediately
- no clutter
- no large explanation blocks

Important:

- this is not the KPI page anymore
- keep it clean and editorial
- make `deep dive ja/nee` a compact metadata field, not a dominant visual element

### P2 - Respons

Required content:

- uitgenodigd
- ingevuld
- circular chart with percentages
- explanation of what response rate means
- explanation of what a low response can mean
- explanation of what a high response can mean

Purpose:

- make response quality an explicit interpretive layer
- help management understand what response strength says about confidence and reading discipline

Implementation notes:

- the circular chart must be secondary to interpretation, not decorative
- include short readable explanation blocks:
  - what response rate says
  - what low response may mean
  - what high response may mean
- do not overstate certainty

### P3 - Bestuurlijke handoff

Required content:

- sterkste signaal
- waarom telt dit
- wat eerst doen
- waarom dat eerst telt
- wat je hieruit moet concluderen

Purpose:

- executive translation page
- strongest management read in one page

Important:

- keep this sharper than earlier versions
- do not bring back a diffuse 5-step handoff
- the page must read like a boardroom handoff, not like a text summary

### P4 - Frictiescore & verdeling van het vertrekbeeld

Required content:

- clear explanation:
  `Frictiescore is een interne managementsamenvatting van ervaren werkfrictie rondom vertrek. Gebruik deze score altijd samen met vertrekredenen, topfactoren en werksignalen, niet als causaliteitsclaim, externe benchmark of voorspelling.`
- a horizontal score band / diagram with color notation
- visibly mark where the score sits on the scale
- `Verdeling van het vertrekbeeld` like in the old sample report

Purpose:

- separate score interpretation from broader signal synthesis
- make the frictiescore easier to understand

Implementation notes:

- this page must explicitly explain how to read the score
- include a `Hoe lees je dit?` micro-layer
- include a short explanation of what the banding means
- use old-report logic for the distribution view as inspiration, but fit it into the new system
- do not collapse this into the later signal synthesis page

### P5 - Signalen in samenhang

Required content:

- keep this largely as it is now
- exclude frictiescore from this page
- this page should focus on combined reading of:
  - hoofdredenen
  - meespelende factoren
  - quotes / survey voices
  - eerdere signalering if available

Purpose:

- synthesis page
- management story, not score explanation

Implementation notes:

- if earlier signaling data exists, render it explicitly
- if earlier signaling does not exist, remove references to it
- keep analytical blocks primary, quotes secondary

### P6 - Drivers & prioriteitenbeeld

Required content:

- keep this largely as it is now
- add explanation that this page combines:
  - SDT
  - organisatiefactoren

Purpose:

- explain what the factor model is built from
- make the scatter and table more interpretable

Implementation notes:

- add short micro-copy:
  - `Hoe lees je dit?`
  - `Waarom dit ertoe doet?`
- explicitly clarify that the factor view combines SDT-based and organizational factors
- keep scatter + factor table + top factor detail view

### P7 - SDT Basisbehoeften

Required content:

- restore this as an explicit page, based on the old report logic
- include autonomy / competence / relatedness style structure as appropriate to current data model

Purpose:

- make the underlying psychological layer visible again
- restore methodological clarity without overwhelming the main business reader

Implementation notes:

- use the old report as inspiration for page logic, not necessarily exact wording
- explain briefly how to read the SDT layer
- keep it compact and clear
- do not make it a dense academic explanation page

### P8 - Organisatiefactoren

Required content:

- restore a dedicated page for organizational factors
- include factor table / explanation structure inspired by the old report

Purpose:

- make the factor layer methodologically and managerially clearer
- separate it from SDT and from signal synthesis

Implementation notes:

- use the old report's strength:
  - title -> how to read this section -> explanation -> then factor content
- explicitly explain belevingsscore vs signaalwaarde / management reading if applicable
- do not overload the page with too many cards

### P9 - Eerste route & actie

Required content:

- first route
- owner
- first step
- review moment
- action framing

Purpose:

- land the report in a first management route instead of a loose closeout block

Implementation notes:

- keep the route compact, owner-bound and toetsbaar
- stay inside the current report-to-action contract
- do not expand this into a diffuse consulting appendix

## 4. Shared Report Grammar For Other Products

De gedeelde report grammar blijft bruikbaar als abstractielaag voor niet-ExitScan rapporten:

1. `Executive cover`
2. `Bestuurlijke handoff`
3. `Drivers & prioriteitenbeeld`
4. `Kernsignalen in samenhang`
5. `Eerste route & managementactie`
6. `Compacte methodiek / leeswijzer`

Met optionele lagen:

- `Segmentanalyse`
- `Technische verantwoording`

Belangrijke regel:

- deze gedeelde grammar beschrijft inhoudelijke leeslogica
- zij is niet bevoegd om ExitScan terug te brengen tot zes pagina's

## 5. Product-Specific Reading Rules

### ExitScan

ExitScan blijft de leidende embedded baseline voor toon, managementlezing en hoofdstructuur.

ExitScan-taal moet voelen als:

- terugkijkende vertrekduiding
- bestuurlijke prioritering
- werkfactoren rond vertrek
- geen sluitend bewijs van oorzaak

### RetentieScan

RetentieScan mag op de gedeelde grammar landen, maar blijft inhoudelijk anders dan ExitScan.

RetentieScan-taal moet voelen als:

- vroegsignalering op behoud
- verificatie en prioritering
- groepssignalen in samenhang
- geen individuele predictor of selectie-instrument

## 6. Language Rules For Duiding

Verplichte taalprincipes:

- spreek in termen van:
  - managementlezing
  - signalen
  - prioritering
  - verificatie
  - eerste route
  - eerste eigenaar
  - review
- vermijd:
  - diagnose
  - causaliteit
  - individuele voorspelling
  - definitieve waarheid
  - named leader of performance-taal waar die niet gedragen wordt

## 7. Implementation Defaults

- nieuwe rapportvarianten moeten eerst op de gedeelde grammar worden gemapt
- ExitScan blijft daarvan uitgezonderd waar de vaste P1-P9 architectuur specifieker is
- rapportdesign mag de architectuur of grammar versterken, maar niet herschrijven
- dashboard en preview moeten dezelfde hoofdroute kunnen spiegelen zonder de ExitScan-volgorde te vervormen

## 8. Acceptance

Deze canon werkt pas echt als:

- ExitScan expliciet als vaste P1-P9 architectuur is beschermd
- RetentieScan en latere productlijnen de gedeelde grammar kunnen volgen zonder ExitScan terug te brengen tot generieke structuur
- onboarding, dashboard en preview dezelfde hoofdroute herkennen:
  - wat speelt nu
  - waarom telt dit
  - wat eerst doen
  - wat niet concluderen
  - hoe lezen
