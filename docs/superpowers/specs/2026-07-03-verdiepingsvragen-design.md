# Verdiepingsvragen bij lage factorscores — Design Spec

**Datum:** 2026-07-03 (v2 — herzien na externe review)
**Status:** ter review
**Scope:** Loep Vertrek (exit), Loep Behoud (retention), Loep Start (onboarding)

---

## 1. Doel

Gesloten factorvragen tonen *dat* iets laag scoort, niet *waarom*. De verdiepingsvragen halen het waarom gestructureerd op als beslisinformatie, zodat het rapport de eerste managementvraag scherper kan maken — mits de antwoordbasis groot genoeg is. Framing: **gestructureerde verdieping die de gespreksvraag aanscherpt**, niet "het waarom volledig telbaar ophalen".

Bewuste afbakening (besluit 2026-07-03): dit is "trede 1" — conditionele meerkeuzevragen, géén AI, géén adaptieve vrije vragen. Trede 2 (AI-gegenereerde vervolgvragen) komt pas ter tafel na 2–3 pilots én als trede 1 aantoonbaar te grof blijkt.

## 2. Vastgelegde ontwerpkeuzes

| Keuze | Besluit | Rationale |
|---|---|---|
| Triggerniveau | Factorniveau; opties bouwen voort op de items | Matcht het aggregatieniveau van het rapport |
| Trigger | Factorgemiddelde ≤ 2,5 **óf** één item = 1 **óf** twee items ≤ 2 | Gemiddelde alleen verbergt scherpe deelproblemen (1-4-4 = 3,0 → toch verdiepen) |
| Cap | **Max 2 verdiepingen per respondent** (Behoud, Start); **max 3 bij Vertrek**. Bij meer triggers: laagste factorgemiddelden eerst | Juist negatieve respondenten niet zwaarder belasten; hun antwoorden niet oververtegenwoordigen |
| Antwoordvorm | **Hoofdkeuze + optioneel één meespelende keuze** ("Wat speelt het meest?" → "Speelt er daarnaast nog iets mee?") | Prioritering blijft (rapport telt primair op hoofdkeuze); gestapelde oorzaken gaan niet verloren |
| Anders-optie | "Anders, namelijk…" met tekstveld, **max 200 tekens**, microcopy "Noem liever geen namen of herkenbare details" | Feedbackloop voor optiesets; herleidbaarheid begrensd |
| Optievolgorde | **Vast** (persoonlijke ervaring → samenwerking/leiding → structuur/context → anders), niet gerandomiseerd in v1 | Respondentbegrip boven volgordebias-perfectie; bij deze n is volgordebias ruis |
| Verplichting | Optioneel — zichtbare, neutrale overslaan-optie | Vertrouwen boven volledigheid |
| Scoring | Geen invloed op frictiescore/retentiesignaal | Verdieping is duiding, geen scoring-input |

## 3. Surveygedrag en respondent-copy

1. Respondent vult de 3 items van een factorsectie in; client-side triggercheck (regels §2); bij trigger en binnen de cap verschijnt direct aansluitend de verdieping.
2. **Kop (zacht geformuleerd, geen "laag gescoord" / "niet goed"):**
   > *Welke omschrijving past het best bij jouw ervaring met [factorlabel]?*
3. Hoofdkeuze (verplicht als men antwoordt), daarna: *"Speelt er daarnaast nog iets mee?"* — optioneel, max één extra keuze, met "Nee, dit was het" als default.
4. Overslaan-link altijd zichtbaar: *"Deze vraag liever overslaan"*.
5. Introductieregel éénmalig bij de eerste verdieping: *"Soms vragen we één korte verduidelijking bij een onderwerp. Ook dit antwoord blijft anoniem en op groepsniveau."*
6. Verboden woorden in respondent-copy: laag gescoord, niet goed, risico, probleem, oorzaak. Gebruik: speelt mee, past het best, ervaring, verduidelijking.
7. localStorage-persistence geldt ook voor verdiepingsantwoorden (bestaand concept-mechanisme).

## 4. Optiesets

Ontwerpcriteria: (a) dekt de items én de veelvoorkomende praktijkoorzaken; (b) elke optie wijst naar een andere managementvraag; (c) neutraal, geen schuldvraag; (d) 5–6 opties + Anders; (e) minimaal één structuur/context-oorzaak.

Gedeelde `factor_key`s; **per scan mogen option_keys afwijken waar de context dat vraagt** (met name Loep Start, zie §4.7). Hieronder de basisset (retentie-formulering; exit = verleden tijd).

### 4.1 Werkbelasting (`workload`)

| Key | Optie |
|---|---|
| `wl_volume` | De hoeveelheid werk is structureel te veel |
| `wl_capacity` | Er zijn te weinig mensen of te weinig beschikbare uren |
| `wl_peaks_adhoc` | Piekmomenten en ad-hoc werk maken het onvoorspelbaar |
| `wl_recovery` | Er is te weinig ruimte om te herstellen of werk goed af te ronden |
| `wl_priorities` | Onduidelijke prioriteiten maken het zwaarder dan nodig |
| `wl_process` | Processen, systemen of overdrachten kosten onnodig veel energie |
| `wl_other` | Anders, namelijk… |

### 4.2 Leiderschap (`leadership`)

| Key | Optie |
|---|---|
| `ld_feedback` | Ik krijg te weinig bruikbare feedback of richting |
| `ld_autonomy` | Ik krijg te weinig ruimte om zelfstandig keuzes te maken |
| `ld_support` | Ik voel me onvoldoende gesteund of serieus genomen |
| `ld_availability` | Mijn leidinggevende is te weinig beschikbaar of zichtbaar |
| `ld_consistency` | Besluiten of verwachtingen wisselen te vaak of zijn niet uitlegbaar |
| `ld_escalation` | Problemen of spanningen worden onvoldoende opgepakt |
| `ld_other` | Anders, namelijk… |

(`ld_trust` "onvoldoende vertrouwensband" vervalt — te relationeel geladen en voelt onveilig; `ld_support` + `ld_escalation` dekken de onderliggende ervaring.)

### 4.3 Psychologische veiligheid & samenwerking (`culture`)

| Key | Optie |
|---|---|
| `cu_mistakes` | Fouten of twijfels benoemen voelt niet veilig |
| `cu_dissent` | Kritische vragen of afwijkende meningen krijgen weinig ruimte |
| `cu_conflict` | Spanningen of conflicten blijven te lang onbesproken |
| `cu_exclusion` | Ik voel me onvoldoende betrokken of gehoord |
| `cu_cross_team` | Samenwerking tussen teams of afdelingen loopt stroef |
| `cu_workstyle` | De manier van samenwerken past niet goed bij hoe ik goed kan werken |
| `cu_other` | Anders, namelijk… |

(Nota: `cu_mistakes` en `cu_dissent` worden door respondenten deels als hetzelfde ervaren — niet rapporteren als harde aparte constructen.)

### 4.4 Groeiperspectief (`growth`)

| Key | Optie |
|---|---|
| `gr_visibility` | Ik zie niet welke mogelijkheden er voor mij zijn |
| `gr_conversation` | Er wordt te weinig concreet met mij over ontwikkeling gesproken |
| `gr_time` | Er is te weinig tijd of ruimte om mij te ontwikkelen |
| `gr_criteria` | Het is onduidelijk of oneerlijk hoe doorgroei wordt bepaald |
| `gr_challenge` | Mijn werk biedt te weinig uitdaging of groei in de rol |
| `gr_ceiling` | Ik zit aan het plafond van wat hier voor mij mogelijk is |
| `gr_other` | Anders, namelijk… |

### 4.5 Beloning & voorwaarden (`compensation`)

| Key | Optie |
|---|---|
| `cp_external` | Mijn beloning voelt niet passend vergeleken met vergelijkbaar werk elders |
| `cp_internal` | De beloning voelt oneerlijk vergeleken met collega's of vergelijkbare functies |
| `cp_responsibility` | De beloning past niet bij de zwaarte of verantwoordelijkheid van mijn werk |
| `cp_growth` | Er is te weinig perspectief op salarisgroei |
| `cp_clarity` | Het is onduidelijk hoe beloning of groei wordt bepaald |
| `cp_secondary` | De secundaire voorwaarden passen niet bij wat ik nodig heb |
| `cp_other` | Anders, namelijk… |

(`cp_recognition` "waardering/erkenning" vervalt als beloningsoptie — hoort bij leiderschap/cultuur en vervuilt de factor.)

### 4.6 Rolhelderheid (`role_clarity`)

| Key | Optie |
|---|---|
| `rc_priorities` | Het is onduidelijk wat nu de belangrijkste prioriteiten zijn |
| `rc_expectations` | Ik weet niet goed waarop ik word beoordeeld of aangesproken |
| `rc_conflicting` | Ik krijg tegenstrijdige opdrachten of verwachtingen |
| `rc_scope` | Mijn takenpakket groeit of verschuift zonder duidelijke afspraken |
| `rc_mandate` | Het is onduidelijk wat ik zelf mag beslissen |
| `rc_information` | Ik mis informatie, context of overdracht om mijn werk goed te doen |
| `rc_other` | Anders, namelijk… |

### 4.7 Loep Start: eigen verdiepingslogica

Onboarding is geen tekstvariant van dezelfde sets — de landing kent eigen oorzaken. Loep Start gebruikt eigen option_keys per factor, gericht op inwerkkwaliteit:

**Werkbelasting (start):** te veel informatie tegelijk (`ws_info_overload`), geen ruimte om het geleerde te laten landen (`ws_landing_time`), team heeft te weinig tijd om mij in te werken (`ws_team_time`), verwachtingen liggen te hoog voor deze fase (`ws_expectations`), systemen/toegang/middelen niet op orde (`ws_tooling`).

**Leiderschap (start):** onduidelijk wat nu het belangrijkst is (`ls_priorities`), leidinggevende of buddy te weinig beschikbaar (`ls_availability`), hulp vragen voelt niet makkelijk (`ls_help`), te weinig terugkoppeling of ik het goed doe (`ls_feedback`).

**Groeiperspectief (start):** geen duidelijk inwerkplan of leerpad (`gs_plan`), te weinig begeleiding of leermomenten (`gs_guidance`), onduidelijk hoe mijn rol zich kan ontwikkelen (`gs_visibility`), de rol blijkt anders dan voorgesteld (`gs_mismatch`).

**Rolhelderheid (start):** verwachtingen anders dan bij sollicitatie voorgesteld (`rs_mismatch`), onduidelijk waarop ik word aangesproken (`rs_expectations`), tegenstrijdige uitleg van verschillende mensen (`rs_conflicting`), onduidelijk wat ik zelf al mag oppakken (`rs_mandate`).

Cultuur en beloning gebruiken de basisset met onboarding-tijdsvorm ("in mijn eerste periode").

Elke Start-set krijgt ook `*_other`. Definitieve formuleringen in het implementatieplan, langs dezelfde criteria als §4.

## 5. Datamodel

Nieuw veld op survey response (JSONB, additief):

```json
"deepening_responses": [
  { "factor_key": "workload", "primary": "wl_recovery", "secondary": "wl_peaks_adhoc", "other_text": null },
  { "factor_key": "growth", "primary": "gr_other", "secondary": null, "other_text": "..." }
]
```

- `secondary` is optioneel (null als "Nee, dit was het").
- `other_text` alleen bij `*_other` (primary of secondary), max 200 tekens; zelfde opslag- en anonimiseringsregels als bestaand open tekstveld.
- Overslaan = geen entry. De trigger is reconstrueerbaar uit itemscores; het rapport berekent per factor: aantal getriggerd, aantal beantwoord, aantal overgeslagen (zie §6.1 — noemer verplicht).
- Optiesets leven in `backend/products/shared/` (basisset + per-scan overrides voor Loep Start), geleverd via de bestaande definition-structuur.

## 6. Rapportontwerp

### 6.1 Noemer-transparantie (harde regel)

Elke weergave van verdiepingsdata toont de volledige keten, altijd:

> *"Van de 18 respondenten met een laag werkbelasting-signaal beantwoordden 12 de verdiepingsvraag. Daarvan kozen 8 'te weinig ruimte om te herstellen' als belangrijkste."*

Nooit "60% wijst naar X" zonder deze keten. Percentages gaan altijd over beantwoorders, met de aantallen ernaast. Meespelende keuzes (secondary) worden apart getoond ("daarnaast genoemd"), nooit opgeteld bij de hoofdkeuzes.

### 6.2 Waarom-blok in de factoranalyse — gestaffeld

Per aandachtsfactor, onder de factorscore, blok **"Wat respondenten vooral aanwijzen"**:

| Beantwoorders (n) | Weergave |
|---|---|
| n < 5 | Geen verdeling (privacygrens). Label: *"Te weinig verdiepingsantwoorden om een verdeling te tonen. Bespreek dit onderwerp in de managementbespreking."* |
| n = 5–9 | Alleen absolute aantallen, geen percentages, geen dominantie-duiding. Kader-label: *"Beperkte antwoordbasis — gebruik dit als gesprekshaakje, niet als conclusie."* |
| n ≥ 10 | Verdeling met percentages én aantallen |

Het woord "betrouwbaar" komt in geen enkele rapporttekst voor in relatie tot deze data. "Anders"-teksten: nooit letterlijk in het rapport tenzij handmatig gereviewd en veilig herschreven; in v1 primair intern gebruikt om optiesets te verbeteren.

### 6.3 Doorwerking in "Wat nu?" / gespreksagenda

De gespreksagenda (top-2 risicofactoren) wordt verrijkt met de dominante hoofdkeuze-richting **alleen als**: n (beantwoorders) ≥ 8 **én** topoptie ≥ 50% van de hoofdkeuzes **én** topoptie ≥ 4 respondenten. Anders blijft de generieke agenda-regel staan.

Kalibratie-notitis: bij typische campagnes (20–40 respondenten) levert een lage factor 5–12 beantwoorders op. Strengere drempels (bijv. n ≥ 15) zouden de verrijking in de praktijk nooit laten vuren; de waarborg zit in de vorm — het verrijkte agendapunt is een gespreksvraag met volledige noemer, geen conclusie:

> *"Van de 18 respondenten met een laag werkbelasting-signaal beantwoordden 12 de verdieping; 8 kozen hersteltijd als belangrijkste. Gespreksvraag: hoe bewaken we herstel na piekperioden?"*

Per optie-key één vaste gespreksvraag-template per scan (deterministisch, toetsbaar — geen generatieve tekst).

### 6.4 Dashboard

V1: alleen in het PDF-rapport. Dashboard-weergave is een bewuste latere uitbreiding.

## 7. Wat het níet doet

- Geen AI, geen gegenereerde vragen of teksten.
- Geen invloed op frictiescore, retentiesignaal, SDT- of eNPS-berekening; geen wijziging aan bestaande vragen of gewichten.
- Geen verplichte beantwoording; geen weergave op individueel of te-klein-segment-niveau.
- Geen "waarom"-claims: rapporttaal is "meest gekozen toelichting", niet "de oorzaak".
- Culture assessment, pulse, team en leadership scans: buiten scope v1.

## 8. Testen

- Unit: triggerlogica — alle drie de triggercondities, randgevallen (2,5 exact = trigger; 1-4-4 = trigger via item=1; ontbrekende items = geen trigger); cap-logica (laagste gemiddelden eerst; 2 vs 3 per scan).
- Unit: rapport-aggregatie — noemer-keten (getriggerd/beantwoord/overgeslagen), staffels (n<5 / 5–9 / ≥10), agenda-verrijkingsregel (n≥8 ∧ ≥50% ∧ ≥4), secondary nooit opgeteld bij primary.
- Content-guard: elke factor heeft per scan een complete optieset incl. gespreksvraag-templates; verboden woorden ("laag gescoord", "niet goed", "betrouwbaar") komen niet voor in respondent-/rapportcopy.
- Survey e2e: trigger + cap, hoofd- en meespelende keuze, overslaan, 200-tekens-limiet, localStorage.
- Privacy: anders-tekst nooit in rapport zonder review-vlag; geen weergave onder n<5.

## 9. Open punten (bewust uitgesteld)

- Definitieve exit-formuleringen (verleden tijd) en Loep Start-formuleringen voluit — in het implementatieplan.
- Dashboard-weergave; vergelijking van waarom-verdelingen tussen herhaalmetingen.
- Herweging van optiesets op basis van "Anders"-teksten na de eerste 2–3 campagnes (vaste evaluatiestap).
