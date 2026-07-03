# Verdiepingsvragen bij lage factorscores — Design Spec

**Datum:** 2026-07-03 (v3 — na twee externe reviewrondes)
**Status:** ter review
**Scope v1:** Loep Vertrek (exit) + Loep Behoud (retention). **Loep Start volgt als v1.1** met eigen, volledig uitgewerkte verdiepingsset (besluit 2026-07-03: geen half uitgewerkte set in een klantzichtbare survey; commerciële focus is retentie-led).

---

## 1. Doel

Gesloten factorvragen tonen *dat* iets laag scoort, niet *waarom*. De verdiepingsvragen halen een **gestructureerde toelichting** op die de eerste managementvraag aanscherpt — mits de antwoordbasis groot genoeg is. Framing overal: *"gestructureerde toelichting die de managementvraag aanscherpt"*, nooit *"het waarom van de lage score"*.

Bewuste afbakening: dit is "trede 1" — conditionele meerkeuzevragen, géén AI. Trede 2 (AI-gegenereerde vervolgvragen) pas na 2–3 pilots én als trede 1 aantoonbaar te grof blijkt.

## 2. Vastgelegde ontwerpkeuzes

| Keuze | Besluit | Rationale |
|---|---|---|
| Triggerniveau | Factorniveau; opties bouwen voort op de items | Matcht aggregatieniveau rapport |
| Trigger | Factorgemiddelde ≤ 2,5 **óf** (één item = 1 **én** factorgemiddelde ≤ 3,5) **óf** twee items ≤ 2 | Gemiddelde alleen verbergt scherpe deelproblemen; de ≤3,5-grens voorkomt trigger op misclick/geïsoleerd item (1-5-5 = 3,67 → geen trigger) |
| Rapporttaal trigger | "Respondenten met een verdieptrigger op [factor]" waar het gemiddelde niet laag is; "laag signaal" alleen bij gemiddelde ≤ 2,5 | 1-4-4 is geen "laag signaal" |
| Cap | **Max 2 per respondent** (Behoud), **max 3** (Vertrek). Prioritering bij meer triggers: (1) laagste gemiddelde, (2) meeste items ≤ 2, (3) laagste minimumscore | Negatieve respondenten niet zwaarder belasten; deterministische volgorde |
| Antwoordvorm | Hoofdkeuze + optioneel één meespelende keuze, **op één scherm** ("Wat speelt het meest?" → "Speelt er daarnaast nog iets mee?"), secondary ≠ primary afgedwongen, geen validatiefout bij ontbreken secondary | Prioritering blijft; gestapelde oorzaken niet verloren; geen extra pagina |
| Anders-optie | "Anders, namelijk…", max 200 tekens, microcopy: *"Noem liever geen namen, functietitels, teams of herkenbare situaties."* | Herleidbaarheid begrensd |
| Optievolgorde | Vast (persoonlijke ervaring → samenwerking/leiding → structuur/context → anders) | Respondentbegrip boven volgordebias-perfectie |
| Verplichting | Optioneel; zichtbare neutrale link "Deze vraag liever overslaan" | Vertrouwen boven volledigheid |
| Scoring | Geen invloed op frictiescore/retentiesignaal | Duiding, geen scoring-input |
| Versiebeheer | Elke opgeslagen entry draagt `question_set_version` | Optiesets wijzigen na pilots (geplande evaluatiestap); data moet over campagnes vergelijkbaar blijven |

## 3. Surveygedrag en respondent-copy

1. Na de 3 items van een factorsectie: client-side triggercheck; bij trigger en binnen de cap verschijnt direct aansluitend de verdieping (zelfde flow, één scherm).
2. **Kop:** *Welke omschrijving past het best bij jouw ervaring met [factorlabel]?*
3. Zelfde scherm, onder de hoofdkeuze: *"Speelt er daarnaast nog iets mee?"* — optioneel, max één, default "Nee, dit was het", kan niet gelijk zijn aan de hoofdkeuze.
4. **Introductieregel éénmalig bij de eerste verdieping:** *"Soms stellen we een korte verduidelijkingsvraag bij enkele onderwerpen. Je antwoord wordt niet individueel teruggekoppeld; we tonen alleen groepsuitkomsten bij voldoende antwoorden."* (Niet "één vraag" — er kunnen er 2–3 komen. Niet "anoniem" — met open tekstveld is "niet individueel teruggekoppeld + groepsuitkomsten" preciezer en eerlijker.)
5. Verboden woorden respondent-copy: laag gescoord, niet goed, risico, probleem, oorzaak, anoniem (in deze context). Gebruik: speelt mee, past het best, ervaring, verduidelijking.
6. localStorage: concept-persistence zoals bestaand, met als eisen — wissen direct na submit, TTL max 24 uur, geen restanten na afronding.
7. **Mobiel-eis:** de langste optieset (werkbelasting/beloning: 6 opties + anders + secondary) moet zonder scrollen binnen de vraag bruikbaar zijn op een gangbaar mobiel scherm; anders opties inkorten. Geen rood/waarschuwingstaal.

## 4. Optiesets (basisset v1: retentie-formulering; exit = verleden tijd)

Criteria: (a) dekt items én veelvoorkomende praktijkoorzaken; (b) elke optie wijst naar een andere managementvraag; (c) neutraal; (d) 5–6 opties + Anders; (e) ≥1 structuur/context-oorzaak. Versie-id per set: `retention_<factor>_v1` / `exit_<factor>_v1`.

### 4.1 Werkbelasting (`workload`)

| Key | Optie |
|---|---|
| `wl_volume` | Binnen mijn rol ligt er structureel meer werk dan redelijk is |
| `wl_capacity` | De bezetting of planning sluit niet aan op het werk dat gedaan moet worden |
| `wl_peaks_adhoc` | Piekmomenten, spoedwerk of druk vanuit klanten/productie maken het zwaar |
| `wl_recovery` | Er is te weinig ruimte om te herstellen of werk goed af te ronden |
| `wl_priorities` | Onduidelijke prioriteiten maken het zwaarder dan nodig |
| `wl_process` | Processen, systemen of overdrachten kosten onnodig veel energie |
| `wl_other` | Anders, namelijk… |

(Volume = takenpakket binnen de rol; capacity = bezetting/planning — bewust rolgericht vs. organisatiegericht geformuleerd om schijnonderscheid te beperken.)

### 4.2 Leiderschap (`leadership`)

| Key | Optie |
|---|---|
| `ld_feedback` | Ik krijg te weinig bruikbare feedback of richting |
| `ld_autonomy` | Ik krijg te weinig ruimte om zelfstandig keuzes te maken |
| `ld_support` | Ik voel me onvoldoende gesteund als er problemen of spanningen zijn |
| `ld_recognition` | Mijn inzet of bijdrage wordt te weinig gezien of gewaardeerd |
| `ld_availability` | Mijn leidinggevende is te weinig beschikbaar of zichtbaar |
| `ld_consistency` | Besluiten of verwachtingen wisselen te vaak of zijn niet uitlegbaar |
| `ld_other` | Anders, namelijk… |

(`ld_support` en `ld_escalation` samengevoegd; waardering/erkenning — geschrapt bij beloning — landt hier, waar hij thuishoort.)

### 4.3 Psychologische veiligheid & samenwerking (`culture`)

| Key | Optie |
|---|---|
| `cu_mistakes` | Fouten of twijfels benoemen voelt niet veilig |
| `cu_dissent` | Kritische vragen of afwijkende meningen krijgen weinig ruimte |
| `cu_conflict` | Spanningen of conflicten blijven te lang onbesproken |
| `cu_behavior` | Gedrag of afspraken worden niet consequent aangesproken |
| `cu_exclusion` | Ik voel me onvoldoende betrokken of gehoord |
| `cu_cross_team` | Samenwerking tussen teams of afdelingen loopt stroef |
| `cu_other` | Anders, namelijk… |

(`cu_workstyle` vervangen door `cu_behavior` — actiegerichter; `cu_mistakes`/`cu_dissent` niet rapporteren als harde aparte constructen.)

### 4.4 Groeiperspectief (`growth`)

| Key | Optie |
|---|---|
| `gr_visibility` | Ik zie niet welke mogelijkheden er voor mij zijn |
| `gr_conversation` | Er wordt te weinig concreet met mij over ontwikkeling gesproken |
| `gr_follow_through` | Eerdere afspraken of verwachtingen over ontwikkeling komen niet van de grond |
| `gr_time` | Er is te weinig tijd of ruimte om mij te ontwikkelen |
| `gr_criteria` | Het is onduidelijk of inconsistent hoe doorgroei wordt bepaald |
| `gr_ceiling` | Ik zit aan het plafond van wat hier voor mij mogelijk is |
| `gr_other` | Anders, namelijk… |

(`gr_challenge` vervangen door `gr_follow_through` — niet-nagekomen ontwikkelafspraken zijn een eigen, veelvoorkomende managementvraag; "oneerlijk" → "inconsistent" om sturing te vermijden.)

### 4.5 Beloning & voorwaarden (`compensation`)

| Key | Optie |
|---|---|
| `cp_external` | Mijn beloning voelt niet passend vergeleken met vergelijkbaar werk elders |
| `cp_internal` | De beloning voelt oneerlijk vergeleken met collega's of vergelijkbare functies |
| `cp_responsibility` | De beloning past niet bij de zwaarte of verantwoordelijkheid van mijn werk |
| `cp_growth` | Er is te weinig perspectief op salarisgroei |
| `cp_clarity` | Het is onduidelijk hoe beloning of groei wordt bepaald |
| `cp_flexibility` | Rooster, werktijden of flexibiliteit passen niet goed bij wat ik nodig heb |
| `cp_other` | Anders, namelijk… |

(`cp_secondary` geconcretiseerd naar rooster/werktijden/flexibiliteit — de meest retentie-relevante secundaire voorwaarde in NL-MKB.)

### 4.6 Rolhelderheid (`role_clarity`)

| Key | Optie |
|---|---|
| `rc_priorities` | Binnen mijn rol is onduidelijk wat nu de belangrijkste prioriteiten zijn |
| `rc_expectations` | Ik weet niet goed waarop ik word beoordeeld of aangesproken |
| `rc_conflicting` | Ik krijg tegenstrijdige opdrachten of verwachtingen |
| `rc_scope` | Mijn takenpakket groeit of verschuift zonder duidelijke afspraken |
| `rc_mandate` | Het is onduidelijk wat ik zelf mag beslissen |
| `rc_information` | Ik mis informatie, context of overdracht om mijn werk goed te doen |
| `rc_other` | Anders, namelijk… |

### 4.7 Loep Start — v1.1 (buiten deze bouwronde)

Loep Start krijgt een eigen verdiepingsset gericht op inwerkkwaliteit (inwerkplan, beschikbaarheid begeleiding, verwachtingen vs. voorstelling, informatiedosering, middelen/toegang). Wordt als eigen mini-spec uitgewerkt vóór de v1.1-bouw; niet als tekstvariant van de basisset. Aandachtspunt daarbij: onboarding-oorzaken (bijv. "verwachtingen anders dan voorgesteld") kunnen bij meerdere factoren landen — de Start-sets moeten per factor disjunct ontworpen worden.

## 5. Datamodel

Nieuw veld op survey response (JSONB, additief):

```json
"deepening_responses": [
  {
    "factor_key": "workload",
    "question_set_version": "retention_workload_v1",
    "status": "answered",
    "primary": "wl_recovery",
    "secondary": "wl_peaks_adhoc",
    "other_text": null
  },
  {
    "factor_key": "growth",
    "question_set_version": "retention_growth_v1",
    "status": "skipped",
    "primary": null,
    "secondary": null,
    "other_text": null
  }
]
```

- **`status`: `answered` | `skipped`.** Aangeboden-en-overgeslagen wordt dus expliciet opgeslagen. Getriggerd-maar-niet-aangeboden (cap) krijgt géén entry — het onderscheid aangeboden/niet-aangeboden is daarmee volledig uit de data af te leiden (entry = aangeboden; triggerstatus is reconstrueerbaar uit itemscores; cap-verdringing = trigger zonder entry).
- `question_set_version` verplicht per entry — analyse over campagnes en na optieset-wijzigingen blijft zuiver.
- `secondary` optioneel; `other_text` alleen bij `*_other` (primary of secondary), max 200 tekens, zelfde anonimiseringsregels als bestaand open tekstveld.
- Optiesets in `backend/products/shared/` (basisset + per-scan varianten), geleverd via de bestaande definition-structuur.

## 6. Rapportontwerp

### 6.1 Noemer-transparantie (harde regel)

Elke weergave toont de volledige keten — getriggerd → aangeboden → beantwoord → gekozen:

> *"Van de 18 respondenten met een laag werkbelasting-signaal kregen 15 de verdiepingsvraag; 12 beantwoordden die. Daarvan kozen 8 'te weinig ruimte om te herstellen' als belangrijkste."*

Nooit percentages zonder aantallen en keten. Percentages gaan altijd over beantwoorders.

### 6.2 Toelichtingsblok in de factoranalyse — gestaffeld

Bloktitel: **"Welke toelichting respondenten kozen"** (niet "wat respondenten aanwijzen" — geen causaliteitssuggestie).

| Beantwoorders (n) | Weergave |
|---|---|
| n < 5 | Geen verdeling (privacygrens). Label: *"Te weinig verdiepingsantwoorden om een verdeling te tonen. Bespreek dit onderwerp in de managementbespreking."* |
| n = 5–9 | Alleen absolute aantallen, geen percentages. Kader-label: *"Beperkte antwoordbasis — gebruik dit als gesprekshaakje, niet als conclusie."* |
| n ≥ 10 | Verdeling met percentages én aantallen |

- Het woord "betrouwbaar" komt nergens voor in relatie tot deze data.
- **Meespelende keuzes (secondary):** alleen getoond bij ≥ 5 secondary-antwoorden, uitsluitend als compacte regel (*"Daarnaast werden vooral X en Y genoemd."*), nooit opgeteld bij hoofdkeuzes, nooit gebruikt voor agenda-verrijking in v1.
- "Anders"-teksten: nooit letterlijk in het rapport tenzij handmatig gereviewd en veilig herschreven; v1 primair intern voor optieset-verbetering.

### 6.3 Doorwerking in "Wat nu?" / gespreksagenda

De gespreksagenda (top-2 risicofactoren) wordt verrijkt met de **meest gekozen toelichting** (geen "dominante richting" — consistent met de gesprekshaakje-framing van de 5–9-staffel), alleen als **alle** voorwaarden gelden:

1. n (beantwoorders) ≥ 8;
2. topoptie ≥ 50% van de hoofdkeuzes;
3. topoptie ≥ 4 respondenten;
4. topoptie ligt ≥ 2 respondenten voor op de nummer 2;
5. **topoptie is niet `*_other`** — is other de topkeuze, dan blijft de generieke agenda-regel staan en wordt de optieset gemarkeerd voor review.

Anders: generieke agenda-regel. Kalibratie-notitie: bij typische campagnes (20–40 respondenten) levert een lage factor 5–12 beantwoorders; strengere drempels (n ≥ 15) zouden de verrijking in de praktijk nooit laten vuren. De waarborg zit in de vorm — een gespreksvraag met volledige noemer, geen conclusie:

> *"Van de 18 respondenten met een laag werkbelasting-signaal beantwoordden 12 de verdieping; 8 kozen hersteltijd als belangrijkste toelichting. Gespreksvraag: hoe bewaken we herstel na piekperioden?"*

Per optie-key één vaste gespreksvraag-template per scan (deterministisch, toetsbaar — geen generatieve tekst).

### 6.4 Dashboard

V1: alleen in het PDF-rapport. Dashboard-weergave is een bewuste latere uitbreiding.

## 7. Wat het níet doet

- Geen AI, geen gegenereerde vragen of teksten.
- Geen invloed op frictiescore, retentiesignaal, SDT- of eNPS-berekening; geen wijziging aan bestaande vragen of gewichten.
- Geen verplichte beantwoording; geen weergave op individueel of te-klein-segment-niveau.
- Geen "waarom"-claims: rapporttaal is "gekozen toelichting", niet "de oorzaak".
- Loep Start, culture assessment, pulse, team en leadership: buiten scope v1.

## 8. Testen

- Unit triggerlogica: alle drie condities incl. de gemiddelde-≤3,5-begrenzing op de single-item-trigger (1-5-5 = geen trigger; 1-4-4 = trigger); cap-prioritering met alle drie tiebreakers; 2 vs 3 per scan.
- Unit rapport-aggregatie: volledige noemer-keten (getriggerd/aangeboden/beantwoord/overgeslagen — vereist `status`-veld); staffels; agenda-regel met alle vijf voorwaarden incl. other-fallback en voorsprong-regel; secondary-drempel en nooit-optellen.
- Content-guard: complete optiesets + gespreksvraag-templates per scan; `question_set_version` aanwezig op elke set; verboden woorden ("laag gescoord", "niet goed", "betrouwbaar", "anoniem", "aanwijzen" in bloktitel) afwezig in respondent-/rapportcopy.
- Survey e2e: trigger + cap, hoofd- en meespelende keuze op één scherm, secondary ≠ primary, overslaan → `status: skipped`, 200-tekens-limiet, localStorage gewist na submit.
- Visueel: langste optieset op mobiel viewport zonder scrollen binnen de vraag.
- Privacy: anders-tekst nooit in rapport zonder review-vlag; geen weergave onder n < 5.

## 9. Open punten (bewust uitgesteld)

- Exit-formuleringen (verleden tijd) voluit — in het implementatieplan.
- Loep Start-verdiepingsset — eigen mini-spec vóór v1.1.
- Dashboard-weergave; vergelijking van toelichting-verdelingen tussen herhaalmetingen.
- Herweging optiesets o.b.v. "Anders"-teksten na 2–3 campagnes (vaste evaluatiestap; versiebump `_v2` per gewijzigde set).
