# Richtingsvraag bij verdiepingen (Loep Behoud) — Design Spec

**Datum:** 2026-07-05 (v1)
**Status:** ter review
**Scope:** Loep Behoud (retention) — inclusief cap-verhoging 2 → 3. **Loep Vertrek volgt als eigen ronde** met eigen formulering ("wat had het verschil gemaakt?"); Loep Start buiten scope.
**Bouwt voort op:** `2026-07-03-verdiepingsvragen-design.md` (trede 1). Alle daar vastgelegde kaders (triggerlogica, staffels, noemer-keten, versiebeheer, verboden woorden) gelden onverkort, tenzij hieronder expliciet anders.

**Terminologie:** dit is de **richtingsvraag** — deterministisch meerkeuze, géén AI. De term "trede 2" blijft gereserveerd voor de (uitgestelde) AI-variant uit de trede-1-spec.

---

## 1. Doel

De verdieping (trede 1) haalt een gestructureerde toelichting op — *wat er speelt*. De richtingsvraag haalt daarbovenop een geprioriteerde richting op — *wat als eerste verschil zou maken*. Rationale (besluit Lars, 2026-07-05): het advies aan MT's is altijd "wil je weten wat anders moet, dan moet je de vraag stellen" — Loep stelt hem alvast, aan de bron.

Framing overal: **"richting uit de groep — input van respondenten, het besluit ligt bij management."** Nooit "aanbeveling", "actieplan" of "wat moet anders" in klantzichtbare copy.

## 2. Vastgelegde ontwerpkeuzes

| Keuze | Besluit | Rationale |
|---|---|---|
| Scope | Alleen Loep Behoud | Kleinste scope, live vóór eerste pilot; Vertrek-formulering is wezenlijk anders |
| Frequentie | Bij **elke beantwoorde** verdieping (met cap 3: max 3× oorzaak+richting) | Huidig personeel verdraagt dit; consistent rapportbeeld per factor |
| Optiemodel | **Factor-brede richtingset**: 6 richtingen + Anders per factor, vrije keuze, 1-op-1 spiegel van de oorzaakset | Aggregatie op factorniveau blijft boven de n-staffels; per-oorzaak-subsets versplinteren de data onder de n<5-grens; dynamische volgorde geeft volgordebias |
| Optie-keys | Richtingset **hergebruikt de oorzaak-keys** (aparte namespace via eigen set + versie-id) | 1-op-1 spiegel per constructie afdwingbaar in een guard-test |
| Scherm | **Eigen scherm**, direct ná de verdieping van dezelfde factor | Mobiel-eis trede 1 (langste set zonder scrollen) breekt bij combinatie op één scherm |
| Antwoordvorm | **Eén keuze**, geen "meespelende" tweede keuze | Richting is een prioriteringsvraag; stapelen verwatert |
| Conditie | Alleen na verdieping met `status: answered` — **skip cascadeert** | Geen richting zonder oorzaakcontext |
| Cap | Behoud 2 → **3** (prioriteringsregels ongewijzigd) | Rijker "waarom"-beeld; ~30 sec extra voor de zwaarst getriggerde respondent |
| Scoring | Geen invloed op retentiesignaal/frictiescore/SDT/eNPS | Duiding, geen scoring-input |
| Versiebeheer | Eigen `question_set_version` per richtingset (`retention_<factor>_direction_v1`) | Herweging na campagnes los van de oorzaakset |

## 3. Surveygedrag en respondent-copy

1. Volgorde per getriggerde factor: 3 factor-items → oorzaakverdieping (bestaand scherm) → **richtingsvraag (nieuw scherm)** → volgende sectie.
2. **Kop:** *"Wat zou voor jou als eerste verschil maken bij [factorlabel]?"*
3. Eén keuze uit 6 richtingen + *"Anders, namelijk…"* (max 200 tekens, zelfde anonimiserings-microcopy als trede 1).
4. Overslaanbaar via dezelfde neutrale link (*"Deze vraag liever overslaan"*); overslaan van de richtingsvraag laat het oorzaak-antwoord intact.
5. De éénmalige introductieregel uit trede 1 dekt ook deze vraag; geen extra introductie.
6. Vaste optievolgorde: identiek aan de volgorde van de oorzaakset van dezelfde factor (geen dynamische volgorde — volgordebias).
7. Formuleringsregels richtingen: neutraal "wat zou helpen"-frame; geen belofte-taal, geen verwijt-taal ("management moet…" verboden); verboden woorden trede 1 gelden onverkort.
8. localStorage-persistence, TTL en wissen-na-submit: identiek aan trede 1.
9. **Mobiel-eis:** langste richtingset zonder scrollen bruikbaar binnen de vraag op een gangbaar mobiel scherm.

## 4. Richtingsets v1 (`retention_<factor>_direction_v1`)

Elke richting spiegelt exact één oorzaak-key; guard-test: `keys(richtingset) == keys(oorzaakset)` per factor.

### 4.1 Werkbelasting

| Key | Richtingsoptie |
|---|---|
| `wl_volume` | Een realistischer takenpakket binnen mijn rol |
| `wl_capacity` | Bezetting of planning beter afstemmen op het werk |
| `wl_peaks_adhoc` | Betere opvang van piekmomenten en spoedwerk |
| `wl_recovery` | Meer ruimte om te herstellen en werk goed af te ronden |
| `wl_priorities` | Duidelijkere keuzes over wat voorrang heeft en wat kan wachten |
| `wl_process` | Soepelere processen, systemen of overdrachten |
| `wl_other` | Anders, namelijk… |

### 4.2 Leiderschap

| Key | Richtingsoptie |
|---|---|
| `ld_feedback` | Meer bruikbare feedback en richting |
| `ld_autonomy` | Meer ruimte om zelfstandig keuzes te maken |
| `ld_support` | Meer steun bij problemen of spanningen |
| `ld_recognition` | Meer erkenning voor inzet en bijdrage |
| `ld_availability` | Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende |
| `ld_consistency` | Stabielere en beter uitlegbare besluiten en verwachtingen |
| `ld_other` | Anders, namelijk… |

### 4.3 Psychologische veiligheid & samenwerking

| Key | Richtingsoptie |
|---|---|
| `cu_mistakes` | Meer veiligheid om fouten of twijfels te benoemen |
| `cu_dissent` | Meer ruimte voor kritische vragen en afwijkende meningen |
| `cu_conflict` | Spanningen of conflicten eerder bespreekbaar maken |
| `cu_behavior` | Consequenter aanspreken op gedrag en afspraken |
| `cu_exclusion` | Meer betrokken en gehoord worden bij wat er speelt |
| `cu_cross_team` | Betere samenwerking tussen teams of afdelingen |
| `cu_other` | Anders, namelijk… |

### 4.4 Groeiperspectief

| Key | Richtingsoptie |
|---|---|
| `gr_visibility` | Beter zicht op welke mogelijkheden er voor mij zijn |
| `gr_conversation` | Een concreter gesprek over mijn ontwikkeling |
| `gr_follow_through` | Opvolging van eerdere afspraken over ontwikkeling |
| `gr_time` | Meer tijd en ruimte om mij te ontwikkelen |
| `gr_criteria` | Duidelijkere criteria voor hoe doorgroei wordt bepaald |
| `gr_ceiling` | Een eerlijk gesprek over mijn vervolgstap, ook buiten mijn huidige rol |
| `gr_other` | Anders, namelijk… |

### 4.5 Beloning & voorwaarden

| Key | Richtingsoptie |
|---|---|
| `cp_external` | Beloning meer in lijn met vergelijkbaar werk elders |
| `cp_internal` | Meer evenwicht in beloning tussen vergelijkbare functies |
| `cp_responsibility` | Beloning die beter past bij zwaarte en verantwoordelijkheid |
| `cp_growth` | Meer perspectief op salarisgroei |
| `cp_clarity` | Meer duidelijkheid over hoe beloning en groei worden bepaald |
| `cp_flexibility` | Rooster, werktijden of flexibiliteit die beter aansluiten |
| `cp_other` | Anders, namelijk… |

### 4.6 Rolhelderheid

| Key | Richtingsoptie |
|---|---|
| `rc_priorities` | Duidelijkere prioriteiten binnen mijn rol |
| `rc_expectations` | Duidelijkheid over waarop ik word beoordeeld |
| `rc_conflicting` | Minder tegenstrijdige opdrachten of verwachtingen |
| `rc_scope` | Duidelijke afspraken als mijn takenpakket verandert |
| `rc_mandate` | Duidelijkheid over wat ik zelf mag beslissen |
| `rc_information` | Betere informatie, context en overdracht voor mijn werk |
| `rc_other` | Anders, namelijk… |

## 5. Datamodel

Additieve uitbreiding van de bestaande `deepening_responses`-entry (JSONB, geen migratie):

```json
{
  "factor_key": "workload",
  "question_set_version": "retention_workload_v1",
  "status": "answered",
  "primary": "wl_recovery",
  "secondary": "wl_peaks_adhoc",
  "other_text": null,
  "direction": {
    "question_set_version": "retention_workload_direction_v1",
    "status": "answered",
    "choice": "wl_recovery",
    "other_text": null
  }
}
```

- `direction.status`: `answered` | `skipped`. Geen `direction`-veld = vraag niet aangeboden (pre-richtingsvraag-data of oorzaak overgeslagen) — oude campagnes renderen ongewijzigd (zelfde gate-principe als trede 1).
- `direction.other_text` alleen bij `*_other`, max 200 tekens, zelfde anonimiseringsregels.
- Richtingsets in `backend/products/shared/deepening.py` naast de oorzaaksets, geleverd via dezelfde definition-structuur.

## 6. Servervalidatie (fail-loud, 422)

1. `direction` alleen geaccepteerd als de bijbehorende verdieping `status: answered` heeft.
2. `direction.choice` moet een geldige key uit de richtingset van die factor zijn.
3. `direction.other_text` alleen bij `*_other`, max 200 tekens.
4. Bestaande trede-1-hervalidatie (trigger, cap, factor) ongewijzigd; cap-constante retention 2 → 3.

## 7. Rapportontwerp

### 7.1 Blok "Richting uit de groep" (factoranalyse)

Naast "Welke toelichting respondenten kozen", zelfde staffels en noemer-transparantie — de keten wordt één schakel langer:

> *"Van de 12 respondenten die de verdieping beantwoordden, gaven 10 een richting; 6 kozen 'meer ruimte om te herstellen en werk goed af te ronden'."*

| Richting-beantwoorders (n) | Weergave |
|---|---|
| n < 5 | Geen verdeling. Label: *"Te weinig richting-antwoorden om een verdeling te tonen."* |
| n = 5–9 | Alleen aantallen. Label: *"Beperkte antwoordbasis — gebruik dit als gesprekshaakje, niet als conclusie."* |
| n ≥ 10 | Verdeling met percentages én aantallen |

Vaste voetregel in het blok: *"Richting uit de groep is input van respondenten — het besluit ligt bij management."*
Verboden in dit blok: "aanbeveling", "actieplan", "moet", "interventie".

### 7.2 Gespreksagenda-verrijking

De agenda-regel wordt uitgebreid met de richting-topoptie, alleen als **beide** verrijkingen zelfstandig aan de vijf trede-1-voorwaarden voldoen (n ≥ 8, top ≥ 50%, ≥ 4 respondenten, voorsprong ≥ 2, niet-`*_other` — voor richting gerekend over richting-beantwoorders):

> *"…8 kozen hersteltijd als belangrijkste toelichting; 6 noemden 'meer ruimte om te herstellen' als eerste verschilmaker. Gespreksvraag: wat is de eerste concrete stap om herstel na piekperioden te borgen?"*

Voldoet alleen de oorzaak-verrijking: huidige regel blijft. Voldoet alleen de richting: géén verrijking (richting zonder oorzaakcontext is niet duidbaar). Per richting-key één vaste gespreksvraag-template (deterministisch; de 36 templates worden in het implementatieplan voluit uitgeschreven, patroon: *"wat is de eerste concrete stap om [richting-kern] te realiseren?"* — werkbelasting-set in deze spec is de norm).

### 7.3 Dashboard en voorbeeldrapport

Dashboard: buiten scope (consistent met trede 1). Voorbeeldrapport-generator seedt richtingdata via de echte triggerlogica — niets gefaket.

## 8. Wat het níet doet

- Geen AI, geen gegenereerde teksten.
- Geen invloed op scoring; geen wijziging aan bestaande vragen, gewichten of trede-1-gedrag (behalve cap 2→3).
- Geen tweede ("meespelende") keuze bij richting.
- Geen prescriptietaal; rapporttaal is "richting uit de groep", nooit "wat moet anders".
- Loep Vertrek, Loep Start, culture assessment, pulse: buiten scope. Vertrek-richtingset ("wat had het verschil gemaakt?") is een benoemd open punt.

## 9. Testen

- **Unit gedrag:** skip-cascade (oorzaak geskipt → geen richtingsvraag; richting geskipt → oorzaak intact); cap-3-prioritering met bestaande tiebreakers; validatieregels 1–3 uit §6.
- **Content-guard:** 6 complete richtingsets; `keys(richtingset) == keys(oorzaakset)` per factor; versie-ids aanwezig; verboden woorden afwezig in respondent- én rapportcopy (incl. "aanbeveling", "actieplan" in het richtingblok).
- **Rapport-aggregatie:** verlengde noemer-keten; staffels op richting-beantwoorders; agenda-verrijking met dubbele voorwaardentoets incl. alleen-oorzaak- en alleen-richting-scenario's; other-fallback.
- **Survey e2e:** trigger → oorzaak → richting → submit; overslaan-varianten; refresh-persistence; 200-tekens-limiet; localStorage gewist na submit.
- **Visueel:** langste richtingset op mobiel viewport zonder scrollen.
- **Privacy:** geen weergave onder n < 5; Anders-tekst nooit ongefilterd in rapport.
- **Regressie:** trede-1-suite blijft groen; campagnes zonder richtingdata renderen byte-identiek (gate).

## 10. Open punten (bewust uitgesteld)

- Loep Vertrek-richtingset ("wat had voor jou het verschil gemaakt?") — eigen ronde.
- De 36 gespreksvraag-templates voluit — implementatieplan.
- Dashboard-weergave; vergelijking richting-verdelingen tussen herhaalmetingen (relevant voor de vervolgmeting/€1.250-propositie).
- Herweging richtingsets o.b.v. "Anders"-teksten na 2–3 campagnes (versiebump `_direction_v2`).
