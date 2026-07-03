# Verdiepingsvragen bij lage factorscores — Design Spec

**Datum:** 2026-07-03
**Status:** ter review
**Scope:** Loep Vertrek (exit), Loep Behoud (retention), Loep Start (onboarding)

---

## 1. Doel

Gesloten factorvragen tonen *dat* iets laag scoort, niet *waarom*. De verdiepingsvragen halen het waarom structureel op als telbare beslisinformatie, zodat het rapport per risicofactor kan zeggen: "60% van de respondenten met een lage werkbelasting-score wijst naar gebrek aan herstel, niet naar de hoeveelheid werk." Dat maakt de eerste managementvraag scherper — het kernonderscheid van Loep.

Bewuste afbakening (besluit 2026-07-03): dit is "trede 1" — conditionele meerkeuzevragen, géén AI, géén adaptieve vrije vragen. Trede 2 (AI-gegenereerde vervolgvragen) komt pas ter tafel na 2–3 pilots én als trede 1 aantoonbaar te grof blijkt.

## 2. Vastgelegde ontwerpkeuzes

| Keuze | Besluit | Rationale |
|---|---|---|
| Triggerniveau | Factorniveau (gemiddelde van de 3 items per sectie), opties bouwen voort op de items | Max 6 verdiepingen ooit, meestal 0–2; matcht het aggregatieniveau van het rapport |
| Drempel | Factorgemiddelde ≤ 2,5 (5-puntsschaal) | Duidelijk negatief, niet slechts lauw |
| Antwoordvorm | Eén keuze ("Wat speelde vooral?") | Dwingt tot prioriteren; telling blijft beslisbaar |
| Anders-optie | "Anders, namelijk…" mét kort tekstveld | Feedbackloop om optiesets te verbeteren; zelfde anonimiteitsregels als bestaande open vraag |
| Verplichting | Optioneel — respondent kan overslaan | Vertrouwen boven volledigheid |
| Scoring | Geen invloed op frictiescore/retentiesignaal | Verdieping is duiding, geen scoring-input; vergelijkbaarheid met eerdere campagnes blijft intact |

## 3. Surveygedrag

1. Respondent vult de 3 items van een factorsectie in.
2. Client-side wordt het gemiddelde berekend. Bij ≤ 2,5 verschijnt direct aansluitend (zelfde flow, vóór de volgende sectie) één verdiepingsvraag.
3. Kop: "Je gaf aan dat [factorlabel] niet goed zat/zit. Wat speelde/speelt vooral?" — tijdsvorm per scan.
4. Opties in willekeurige volgorde per respondent (volgorde-bias vermijden), "Anders, namelijk…" altijd onderaan.
5. Overslaan kan ("Liever niet zeggen / overslaan"-link, geen verplicht veld).
6. Antwoord telt niet mee in enige score.
7. localStorage-persistence geldt ook voor verdiepingsantwoorden (bestaand concept-mechanisme).

Introductieregel éénmalig bij de eerste verdiepingsvraag: "Soms vragen we kort door op een onderwerp dat je laag scoorde. Ook dit antwoord blijft anoniem en op groepsniveau."

## 4. Optiesets per factor

Ontwerpcriteria per optieset:
- (a) dekt de drie items van de factor;
- (b) elke optie is vertaalbaar naar een andere managementvraag (actionable onderscheid);
- (c) neutraal geformuleerd — geen schuldvraag, geen namen/rollen van individuen;
- (d) 4–6 opties + Anders;
- (e) minimaal één optie buiten de eigen ervaring (context/structuur-oorzaak).

Tijdsvormen: exit = verleden tijd ("speelde"), retention = tegenwoordige tijd ("speelt"), onboarding = eerste periode ("speelt in je eerste periode"). Hieronder de retentie-formulering als basis; exit- en onboarding-varianten volgen hetzelfde patroon als `ORG_SECTIONS` (per-scan tekstvariant per optie, zelfde optie-key).

### 4.1 Werkbelasting (`workload`)

> Je gaf aan dat de werkbelasting niet goed zit. Wat speelt vooral?

| Key | Retentie-formulering | Managementvraag waar de optie naar wijst |
|---|---|---|
| `wl_volume` | De hoeveelheid werk is structureel te veel | Capaciteit / takenpakket |
| `wl_recovery` | Het werk is haalbaar, maar er is te weinig hersteltijd | Roostering / piek-herstel-balans |
| `wl_priorities` | Onduidelijke of wisselende prioriteiten maken het zwaarder dan nodig | Sturing / prioritering |
| `wl_understaffing` | Onderbezetting of openstaande vacatures in het team | Formatie / werving |
| `wl_peaks` | Piekbelasting: sommige perioden zijn niet te doen, andere wel | Werkspreiding / planning |
| `wl_other` | Anders, namelijk… | — |

Onboarding-variant: `wl_volume` → "De hoeveelheid informatie en taken in mijn eerste periode is te veel tegelijk"; `wl_recovery` → "Ik krijg te weinig ruimte om het geleerde te laten landen"; `wl_understaffing` vervalt niet maar wordt "Het team heeft te weinig tijd om mij goed in te werken".

### 4.2 Leiderschap (`leadership`)

> Je gaf aan dat de aansturing niet goed zit. Wat speelt vooral?

| Key | Retentie-formulering | Wijst naar |
|---|---|---|
| `ld_feedback` | Ik krijg te weinig bruikbare feedback over mijn functioneren | Gesprekscyclus / feedbackcultuur |
| `ld_autonomy` | Ik krijg te weinig ruimte om mijn werk op mijn manier te doen | Sturingsstijl / delegeren |
| `ld_trust` | Er is onvoldoende vertrouwensband met mijn leidinggevende | Relatie / teamsamenstelling |
| `ld_availability` | Mijn leidinggevende is te weinig beschikbaar of zichtbaar | Span of control / agenda |
| `ld_consistency` | Besluiten of verwachtingen wisselen te vaak of zijn niet uitlegbaar | Besluitvorming / communicatie |
| `ld_other` | Anders, namelijk… | — |

### 4.3 Psychologische veiligheid & cultuurmatch (`culture`)

> Je gaf aan dat de samenwerking of veiligheid in het team niet goed zit. Wat speelt vooral?

| Key | Retentie-formulering | Wijst naar |
|---|---|---|
| `cu_mistakes` | Fouten toegeven voelt hier niet veilig | Leiderschapsgedrag / voorbeeldrol |
| `cu_dissent` | Kritische vragen of een afwijkende mening worden niet gewaardeerd | Overlegcultuur |
| `cu_values` | De manier van werken hier past niet bij wat ik belangrijk vind | Cultuur / waardenmatch |
| `cu_conflict` | Onderlinge spanningen of conflicten blijven onbesproken | Teaminterventie |
| `cu_exclusion` | Ik voel me onvoldoende betrokken of gehoord in het team | Inclusie / teamdynamiek |
| `cu_other` | Anders, namelijk… | — |

### 4.4 Groeiperspectief (`growth`)

> Je gaf aan dat groeiperspectief niet goed zit. Wat speelt vooral?

| Key | Retentie-formulering | Wijst naar |
|---|---|---|
| `gr_visibility` | Ik zie niet welke mogelijkheden er voor mij zijn | Loopbaanpaden zichtbaar maken |
| `gr_conversation` | Er wordt niet echt met mij over mijn ontwikkeling gesproken | Gesprekscyclus |
| `gr_time` | Er is geen tijd of ruimte om aan ontwikkeling te werken | Werkdruk vs. ontwikkelruimte |
| `gr_investment` | De organisatie investeert te weinig (opleiding, begeleiding, budget) | L&D-aanbod |
| `gr_ceiling` | Ik zit aan het plafond van wat hier voor mij mogelijk is | Doorgroei / functiehuis |
| `gr_other` | Anders, namelijk… | — |

Onboarding-variant: gericht op landen in de rol — `gr_visibility` → "Ik zie niet hoe mijn rol zich hier kan ontwikkelen"; `gr_time` → "Er is te weinig tijd of begeleiding om mijn rol goed te leren".

### 4.5 Beloning & voorwaarden (`compensation`)

> Je gaf aan dat beloning en voorwaarden niet goed zitten. Wat speelt vooral?

| Key | Retentie-formulering | Wijst naar |
|---|---|---|
| `cp_market` | Mijn salaris is niet marktconform | Benchmarken / loongebouw |
| `cp_fairness` | De beloning voelt oneerlijk vergeleken met collega's of vergelijkbare functies | Interne billijkheid / transparantie |
| `cp_clarity` | Het is onduidelijk hoe beloning en groei hier worden bepaald | Beloningsbeleid uitlegbaar maken |
| `cp_secondary` | De secundaire voorwaarden passen niet bij wat ik nodig heb | Arbeidsvoorwaardenpakket |
| `cp_recognition` | Het gaat mij minder om geld en meer om waardering en erkenning | Erkenning / niet-financiële waardering |
| `cp_other` | Anders, namelijk… | — |

### 4.6 Rolhelderheid (`role_clarity`)

> Je gaf aan dat rolhelderheid niet goed zit. Wat speelt vooral?

| Key | Retentie-formulering | Wijst naar |
|---|---|---|
| `rc_priorities` | Het is onduidelijk wat nu de belangrijkste prioriteiten zijn | Sturing / doelen |
| `rc_expectations` | Ik weet niet goed waarop ik word beoordeeld of aangesproken | Verwachtingsmanagement |
| `rc_conflicting` | Ik krijg tegenstrijdige opdrachten of verwachtingen | Afstemming tussen leidinggevenden/afdelingen |
| `rc_scope` | Mijn takenpakket groeit of verschuift zonder duidelijke afspraken | Functieafbakening |
| `rc_information` | Ik mis informatie of context om mijn werk goed te kunnen doen | Informatievoorziening |
| `rc_other` | Anders, namelijk… | — |

## 5. Datamodel

Nieuw veld op survey response (JSONB, additief — geen breaking change):

```json
"deepening_responses": [
  { "factor_key": "workload", "option_key": "wl_recovery", "other_text": null },
  { "factor_key": "growth", "option_key": "gr_other", "other_text": "..." }
]
```

- `other_text` alleen gevuld bij `*_other`; zelfde opslag- en anonimiseringsregels als bestaand open tekstveld.
- Overslaan = geen entry voor die factor (afwezigheid is informatief: wél getriggerd, niet beantwoord — de trigger zelf is reconstrueerbaar uit de itemscores, dus geen aparte opslag nodig).
- Optiesets + per-scan tekstvarianten leven in `backend/products/shared/` naast `ORG_SECTIONS` (zelfde patroon: gedeelde keys, per-scan formulering), en worden via de bestaande definition-structuur aan de survey geleverd.

## 6. Rapportontwerp (volwaardig onderdeel — samen vastgelegd)

De verdieping is pas waardevol als hij landt waar management kijkt. Twee plekken:

### 6.1 Waarom-blok in de factoranalyse

Per factor die in het rapport als aandachtspunt verschijnt, direct onder de factorscore een blok **"Wat respondenten vooral aanwijzen"**:

- Horizontale verdeling van de gekozen oorzaken (percentage + absoluut aantal), gesorteerd op frequentie.
- Alleen getoond bij **≥ 5 verdiepingsantwoorden** op die factor (zelfde privacygrens als quotes). Daaronder een eerlijk degraded label: *"Te weinig verdiepingsantwoorden (n < 5) voor een betrouwbaar waarom-beeld. Dit onderwerp verdient uitvraag in de managementbespreking."* — Fail Loud, geen fake data.
- "Anders"-teksten: alleen geanonimiseerde weergave, zelfde regels en drempels als bestaande open antwoorden; nooit gekoppeld aan segment kleiner dan de segmentgrens.
- Noemer expliciet vermeld: "van de N respondenten die deze factor laag scoorden" — niet van alle respondenten.

### 6.2 Doorwerking in "Wat nu?" / gespreksagenda

De gespreksagenda (top-2 risicofactoren) wordt verrijkt met de dominante waarom-richting:

> **Werkbelasting** — 12 van 18 respondenten met een laag signaal wijzen naar hersteltijd, niet naar de hoeveelheid werk. Eerste managementvraag: *hoe bewaken we herstel na piekperioden?* — in plaats van generiek "werkdruk bespreken".

Regels:
- Alleen als de dominante optie ≥ 40% van de verdiepingsantwoorden heeft én n ≥ 5; anders blijft de bestaande generieke gespreksagenda-regel staan.
- Formulering blijft een gespreksvraag, geen interventie-advies (consistent met trust contract: "de score opent het gesprek, maar sluit het niet af").
- Per optie-key één vaste gespreksvraag-template per scan (content in dezelfde shared structuur), zodat de rapporttekst deterministisch en toetsbaar is — geen generatieve tekst.

### 6.3 Dashboard

V1: geen apart dashboard-blok (rapport eerst). Het waarom-blok komt alleen in het PDF-rapport. Dashboard-weergave is een bewuste latere uitbreiding.

## 7. Wat het níet doet

- Geen AI, geen gegenereerde vragen of teksten.
- Geen invloed op frictiescore, retentiesignaal, SDT- of eNPS-berekening.
- Geen wijziging aan bestaande vragen, gewichten of drempels.
- Geen verplichte beantwoording.
- Geen weergave op individueel of te-klein-segment-niveau.
- Culture assessment, pulse, team en leadership scans: buiten scope v1 (kunnen later aanhaken via dezelfde shared structuur).

## 8. Testen

- Unit: triggerlogica (gemiddelde ≤ 2,5, randgevallen 2,5 exact = trigger; ontbrekende items = geen trigger).
- Unit: rapport-aggregatie (n < 5 → degraded label; dominantie < 40% → generieke agenda-regel; noemer-berekening).
- Content-guard test: elke factor heeft in elke scan-variant een complete optieset (geen ontbrekende scan-vertaling — zelfde guard-patroon als bestaande content-contract tests).
- Survey e2e: verdieping verschijnt/verdwijnt op basis van ingevulde scores; overslaan werkt; localStorage bewaart verdiepingsantwoorden.
- Privacy: "anders"-tekst verschijnt nooit in rapport bij n < 5.

## 9. Open punten (bewust uitgesteld)

- Exit- en onboarding-formuleringen van alle optiesets voluit (patroon staat; uitschrijven in implementatieplan).
- Vangnet-variant "laagste factor < 3,5 toch verdiepen" — pas overwegen na eerste campagnedata.
- Dashboard-weergave van waarom-verdelingen.
- Vergelijking van waarom-verdelingen tussen metingen (herhaalcampagnes).
