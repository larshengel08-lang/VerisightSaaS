# Gespreksrichting bij verdiepingen (Loep Behoud) — Design Spec

**Datum:** 2026-07-05 (v2 — na externe review, 60 bevindingen getrieerd)
**Status:** ter review
**Scope:** Loep Behoud (retention) — inclusief cap-verhoging 2 → 3. **Loep Vertrek volgt als eigen ronde** ("wat had het verschil gemaakt?"); Loep Start buiten scope.
**Bouwt voort op:** `2026-07-03-verdiepingsvragen-design.md` (trede 1). Alle daar vastgelegde kaders gelden onverkort, tenzij hieronder expliciet anders.

**Terminologie:** dit is de **gespreksrichting-vraag** (intern kort: richtingsvraag) — deterministisch meerkeuze, géén AI. "Trede 2" blijft gereserveerd voor de uitgestelde AI-variant.

---

## 1. Doel

De verdieping (trede 1) haalt een gestructureerde toelichting op — *wat er speelt*. De richtingsvraag haalt daarbovenop een geprioriteerde **gespreksrichting** op — *welke route het gesprek als eerste zou helpen*. Rationale (besluit Lars, 2026-07-05): het advies aan MT's is altijd "wil je weten wat anders moet, dan moet je de vraag stellen" — Loep stelt hem alvast, aan de bron.

Twee soorten signaal, beide waardevol:
- **Concordant** — de gekozen richting sluit aan op de gekozen oorzaak: bevestiging met prioriteit.
- **Discrepant** — oorzaak en richting lopen uiteen ("oorzaak: onderbezetting; richting: duidelijkere prioriteiten"): het scherpste gesprekshaakje dat de scan kan leveren.

Framing overal: **"gespreksrichting uit de groep — input van respondenten, het besluit ligt bij management."** Nooit "aanbeveling", "actieplan", "verschilmaker" of "wat moet anders" in klantzichtbare copy.

## 2. Vastgelegde ontwerpkeuzes

| Keuze | Besluit | Rationale |
|---|---|---|
| Scope | Alleen Loep Behoud | Kleinste scope, live vóór eerste pilot; Vertrek-formulering is wezenlijk anders |
| Frequentie | Bij **elke beantwoorde** verdieping (met cap 3: max 3× oorzaak+richting) | Besluit Lars, gehandhaafd na review; risico afgedekt via pilotmetrics (§9) en stopregel (§7.4) |
| Optiemodel | **Factor-brede gespreksroute-set**: 6 routes + Anders per factor, vrije keuze. **Géén 1-op-1 spiegeling** van de oorzaakset (reviewbevinding: spiegeling meet tweemaal hetzelfde en maakt de vraag tautologisch) | Routes zijn managementrichtingen, geen positieve inversies; discrepantie oorzaak↔richting wordt rapporteerbaar signaal |
| Optie-keys | Eigen namespace (`wld_*`, `ldd_*`, …) + per route een **verwantschaps-mapping** naar de meest verwante oorzaak-key(s), alleen voor analyse | Concordantie/discrepantie deterministisch bepaalbaar zonder starre key-koppeling |
| Kop | *"Welke richting zou het gesprek over [factorlabel] het meest helpen?"* | Gespreks-frame voorkomt opvolgings-verwachting én dekt gevoelige factoren (beloning) zonder aparte kop |
| Scherm | Eigen scherm, direct ná de verdieping van dezelfde factor | Mobiel-eis trede 1 |
| Antwoordvorm | Eén keuze, geen tweede "meespelende" keuze | Prioriteringsvraag; microcopy verzacht (§3.4) |
| Conditie | Alleen na verdieping met `status: answered` — skip cascadeert | Geen richting zonder oorzaakcontext |
| Optievolgorde | Vast, **eigen volgorde** (gespreks-/afstemmingsroutes eerst, structurele routes daarna) — bewust niet de oorzaakvolgorde | Anchoring op de corresponderende oorzaakpositie voorkomen |
| Cap | Behoud 2 → **3** (prioriteringsregels ongewijzigd) | Rijker beeld; belasting wordt pilotmetric |
| Scoring | Geen invloed op retentiesignaal/frictiescore/SDT/eNPS | Duiding, geen scoring-input |
| Versiebeheer | Eigen `question_set_version` (`retention_<factor>_direction_v1`) | Herweging los van de oorzaakset |
| Segmentniveau | Verdieping- én richtingdata in v1 **uitsluitend op totaalniveau** | Combinatie-herleidbaarheid (oorzaak+richting+segment) en kleine-teams-risico bij leiderschap in één regel afgedekt |

## 3. Surveygedrag en respondent-copy

1. Volgorde per getriggerde factor: 3 factor-items → oorzaakverdieping → **richtingsvraag (eigen scherm)** → volgende sectie.
2. **Introductieregel, éénmalig vóór de eerste richtingsvraag:** *"Deze vraag helpt het gesprek te richten. Het is geen toezegging dat deze richting wordt uitgevoerd."*
3. **Kop:** *"Welke richting zou het gesprek over [factorlabel] het meest helpen?"*
4. **Microcopy onder de kop:** *"Kies wat als eerste gesprekspunt het meest zou helpen; andere punten kunnen ook meespelen."*
5. **Voortgangsregel boven de vraag:** *"Nog één korte vraag over dit onderwerp."*
6. Eén keuze uit 6 routes + *"Anders, namelijk…"* (max 200 tekens). **Aangescherpte microcopy:** *"Noem geen namen, functietitels, teams, locaties, medische informatie of herkenbare situaties."* (Deze aanscherping ook doorvoeren op het trede-1-Anders-veld — micro-wijziging.)
7. Overslaanbaar via dezelfde neutrale link; overslaan laat het oorzaak-antwoord intact.
8. Formuleringsregels routes: gespreks-/toetsings-frame; geen belofte-taal, geen verwijt-taal, geen disciplinerings-suggestie; verboden woorden trede 1 + "verschilmaker".
9. localStorage-persistence, TTL en wissen-na-submit: identiek aan trede 1.
10. **Mobiel-eis:** langste richtingset zonder scrollen bruikbaar binnen de vraag.

## 4. Gespreksroute-sets v1 (`retention_<factor>_direction_v1`)

> **NB (reviewgate 2026-07-05):** de tabellen hieronder tonen de v2-conceptteksten. De definitieve, door Lars goedgekeurde route- en gespreksvraag-teksten (jargonfixes + directe trede-1-stem) staan in `DIRECTION_SETS` in `backend/products/shared/deepening.py` - die is de bron van waarheid; wijzigingen gepind door tests/test_direction_content.py.

Kolom "verwant aan" = verwantschaps-mapping voor concordantie-analyse (géén key-gelijkheid vereist; meerdere oorzaken mogen naar dezelfde route wijzen). Guard-test: elke set compleet (6 + other), elke route heeft ≥1 verwante oorzaak-key, mapping-keys bestaan in de oorzaakset.

### 4.1 Werkbelasting

| Key | Gespreksroute | Verwant aan |
|---|---|---|
| `wld_scope` | Takenpakket en werkvolume beter afbakenen | `wl_volume` |
| `wld_planning` | Planning en bezetting beter laten aansluiten op het werk dat er ligt | `wl_capacity` |
| `wld_peaks` | Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen | `wl_peaks_adhoc` |
| `wld_recovery` | Meer ruimte om te herstellen en werk goed af te ronden | `wl_recovery` |
| `wld_priorities` | Duidelijkere keuzes over wat voorrang heeft en wat kan wachten | `wl_priorities` |
| `wld_friction` | Minder dubbel werk, systeemfrictie of overdrachtsverlies | `wl_process` |
| `wld_other` | Anders, namelijk… | — |

### 4.2 Leiderschap

| Key | Gespreksroute | Verwant aan |
|---|---|---|
| `ldd_feedback` | Meer bruikbare feedback en richting | `ld_feedback` |
| `ldd_mandate` | Duidelijker mandaat om binnen mijn werk zelfstandig keuzes te maken | `ld_autonomy` |
| `ldd_escalation` | Duidelijkere hulp bij escalaties, spanningen of vastlopende situaties | `ld_support` |
| `ldd_recognition` | Concretere terugkoppeling op wat goed gaat en wat wordt gewaardeerd | `ld_recognition` |
| `ldd_availability` | Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende | `ld_availability` |
| `ldd_consistency` | Stabielere en beter uitlegbare besluiten en verwachtingen | `ld_consistency` |
| `ldd_other` | Anders, namelijk… | — |

### 4.3 Psychologische veiligheid & samenwerking

| Key | Gespreksroute | Verwant aan |
|---|---|---|
| `cud_safety` | Fouten of twijfels makkelijker kunnen bespreken zonder negatieve gevolgen | `cu_mistakes` |
| `cud_dissent` | Meer ruimte voor kritische vragen en afwijkende meningen | `cu_dissent` |
| `cud_conflict` | Spanningen of conflicten eerder bespreekbaar maken | `cu_conflict` |
| `cud_agreements` | Duidelijkere teamafspraken over gedrag, samenwerking en opvolging | `cu_behavior` |
| `cud_involvement` | Eerder betrokken worden bij besluiten of veranderingen die het team raken | `cu_exclusion` |
| `cud_crossteam` | Betere samenwerking tussen teams of afdelingen | `cu_cross_team` |
| `cud_other` | Anders, namelijk… | — |

### 4.4 Groeiperspectief

| Key | Gespreksroute | Verwant aan |
|---|---|---|
| `grd_visibility` | Beter zicht op welke mogelijkheden er voor mij zijn | `gr_visibility` |
| `grd_conversation` | Een concreter gesprek over mijn ontwikkeling | `gr_conversation` |
| `grd_followthrough` | Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen | `gr_follow_through` |
| `grd_time` | Ontwikkeling beter inplannen naast het reguliere werk | `gr_time` |
| `grd_criteria` | Duidelijkere criteria voor hoe doorgroei wordt bepaald | `gr_criteria` |
| `grd_nextstep` | Een open en concreet gesprek over realistische vervolgstappen, binnen of buiten mijn huidige rol | `gr_ceiling` |
| `grd_other` | Anders, namelijk… | — |

### 4.5 Beloning & voorwaarden

Reviewbevinding (hoog): richtingen mogen geen loonclaim of toezegging impliceren — alle routes zijn inzicht-/uitlegbaarheids-/toetsings-geformuleerd.

| Key | Gespreksroute | Verwant aan |
|---|---|---|
| `cpd_insight` | Beter inzicht in hoe beloning zich verhoudt tot vergelijkbaar werk elders | `cp_external` |
| `cpd_explain` | Meer uitlegbaarheid van verschillen tussen vergelijkbare functies | `cp_internal` |
| `cpd_review` | Beloning en rolzwaarte opnieuw tegen elkaar houden | `cp_responsibility` |
| `cpd_path` | Duidelijker groeipad in beloning, inclusief voorwaarden en timing | `cp_growth` |
| `cpd_clarity` | Meer duidelijkheid over hoe beloning en groei worden bepaald | `cp_clarity` |
| `cpd_flex` | Rooster, werktijden of flexibiliteit die beter aansluiten | `cp_flexibility` |
| `cpd_other` | Anders, namelijk… | — |

### 4.6 Rolhelderheid

| Key | Gespreksroute | Verwant aan |
|---|---|---|
| `rcd_priorities` | Duidelijkere prioriteiten binnen mijn rol | `rc_priorities` |
| `rcd_expectations` | Duidelijkheid over verwachtingen en waarop ik word aangesproken | `rc_expectations` |
| `rcd_alignment` | Eenduidigere opdrachten en betere afstemming tussen betrokkenen | `rc_conflicting` |
| `rcd_scope` | Duidelijke afspraken als mijn takenpakket verandert | `rc_scope` |
| `rcd_mandate` | Duidelijkheid over wat ik zelf mag beslissen | `rc_mandate` |
| `rcd_information` | Betere informatie, context en overdracht voor mijn werk | `rc_information` |
| `rcd_other` | Anders, namelijk… | — |

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
    "choice": "wld_priorities",
    "other_text": null
  }
}
```

- `direction.status`: `answered` | `skipped`. Geen `direction`-veld = niet aangeboden. **Afleidbaarheid (geen extra statussen nodig):** entry zonder `direction` + verdieping `skipped` = skip-cascade; entry zonder `direction` + verdieping `answered` = pre-feature-data (post-feature wordt bij `answered` altijd aangeboden).
- **Concordantie wordt niet opgeslagen** maar afgeleid: `concordant = primary ∈ verwant_aan(direction.choice)` via de mapping uit §4.
- `direction.other_text` alleen bij `*_other`, max 200 tekens, zelfde anonimiseringsregels.
- Routesets + mapping in `backend/products/shared/deepening.py`, geleverd via de bestaande definition-structuur.

## 6. Servervalidatie (fail-loud, 422)

1. `direction` alleen geaccepteerd als de bijbehorende verdieping `status: answered` heeft.
2. `direction.status = answered` **vereist** een geldige `choice` uit de routeset van die factor; `status = skipped` vereist géén `choice` en géén `other_text`.
3. `choice = *_other` vereist niet-lege `other_text` (max 200 tekens); `other_text` bij een andere choice → 422.
4. Bestaande trede-1-hervalidatie ongewijzigd; cap-constante retention 2 → 3.

## 7. Rapportontwerp

Klantzichtbare term overal: **"gespreksrichting"** (nooit kaal "richting" als zelfstandig label, nooit "verschilmaker").

### 7.1 Blok "Welke gespreksrichting respondenten kozen" (factoranalyse)

Naast "Welke toelichting respondenten kozen". **Volledige noemer-keten vanaf de trigger:**

> *"18 respondenten hadden een verdieptrigger op werkbelasting; 15 kregen de verdieping, 12 beantwoordden die. Van hen gaven 10 een gespreksrichting; 6 kozen 'duidelijkere keuzes over wat voorrang heeft'."*

Staffels op gespreksrichting-beantwoorders, identiek aan trede 1 (n<5 niets · 5–9 alleen aantallen + gesprekshaakje-label · ≥10 percentages én aantallen).

**Vaste voetregel:** *"Gespreksrichting uit de groep is input van respondenten, geen uitvoeringsadvies. Haalbaarheid, rechtvaardigheid en passendheid binnen bestaand beleid wegen mee in de managementbespreking."*

Verboden in dit blok: "aanbeveling", "actieplan", "moet", "interventie", "verschilmaker".

### 7.2 Gespreksagenda-verrijking — vier scenario's

Basisvoorwaarden per verrijking: de bestaande vijf trede-1-voorwaarden, voor richting gerekend over richting-beantwoorders. Daarbovenop:

| Scenario | Gedrag |
|---|---|
| **Alleen oorzaak voldoet** | Huidige trede-1-regel blijft; geen richting-vermelding |
| **Alleen richting voldoet** | Géén verrijking — richting zonder oorzaakcontext is niet duidbaar |
| **Beide voldoen, concordant** (oorzaak-top ∈ verwant_aan(richting-top)) | Eén compacte gecombineerde zin, géén aparte richting-alinea (tautologie-rem): *"…8 kozen hersteltijd als belangrijkste toelichting; de meest gekozen gespreksrichting sluit daarbij aan. Gespreksvraag: hoe maken we meer ruimte voor herstel en het goed afronden van werk?"* |
| **Beide voldoen, discrepant** | Expliciete uiteenloop-regel: *"Respondenten kozen vooral [oorzaak] als toelichting, maar [gespreksrichting] als richting voor het gesprek. Bespreek eerst waar dit verschil vandaan komt."* |

Aanvullende regels:
- Oorzaak-top = `*_other` → géén richting-verrijking; optieset-reviewvlag (bestaand trede-1-gedrag).
- Richting-top = `*_other` → nooit template-verrijking; alleen bij voldoende n de neutrale regel *"veel antwoorden vielen buiten de vaste opties"* + interne reviewvlag.
- **Gespreksvraag-templates:** per route-key één vaste, doelgerichte gespreksvraag in dezelfde directe stem als de trede-1-agendavragen (besluit Lars 2026-07-05, reviewgate: geen 'eerst toetsen'-frame — de vraagvorm zelf plus de voetregel uit §7.1 bewaken de geen-prescriptie-grens). De 36 templates zijn bij de reviewgate goedgekeurd en staan in `DIRECTION_SETS`.

### 7.3 Kwaliteits- en claimregels

- **Stopregel overslag:** >40% van de aangeboden richtingsvragen bij een factor overgeslagen → geen agenda-verrijking; label *"gespreksrichting-basis beperkt door overslag"*. Skipratio's alleen geaggregeerd rapporteren (kwaliteitssignaal, geen inhoudelijk signaal), nooit per klein segment.
- **Geen trend/benchmark-claim:** vaste regel — *"gespreksrichting-data uit één meting is een gesprekshaakje, geen benchmark of trend."* (Vergelijking tussen metingen: open punt, hoort bij de vervolgmeting-propositie.)
- **Totaalniveau:** geen verdieping- of richtingweergave op segmentniveau in v1 (zie §2).

### 7.4 Dashboard en voorbeeldrapport

Dashboard: buiten scope. Voorbeeldrapport-generator seedt richtingdata via de echte triggerlogica — niets gefaket; minimaal één concordant én één discrepant scenario in de sample.

## 8. Privacy en doelbinding

- Interne privacy-notitie aanvullen: **doel** = groepsduiding ten behoeve van het managementgesprek; **géén** individuele opvolging; **géén** arbeidsrechtelijke of beloningsbesluitvorming op persoonsniveau; richtingdata is input voor gespreksagenda, niet voor maatregelen jegens individuen.
- Anders-teksten: nooit in het rapport zonder handmatige review; scherpere microcopy (§3.6).
- Combinatie-herleidbaarheid (oorzaak-top + richting-top + segment) structureel afgevangen door de totaalniveau-regel.

## 9. Wat het níet doet + pilotmetrics

- Geen AI; geen scoring-invloed; geen tweede keuze bij richting; geen prescriptietaal; Vertrek/Start/culture/pulse buiten scope; dashboard later.
- **Pilotmetrics (harde meetpunten, geen aannames):** completion rate hele survey; drop-off specifiek op het richtingscherm; tijd per vraag; overslag-percentage per factor; concordantie-ratio per factor. "Huidig personeel verdraagt dit" wordt hiermee toetsbaar i.p.v. aangenomen.
- **Pre-pilot checklistpunt (niet blokkerend voor bouw):** de kop + één routeset cognitief pretesten bij 2–3 HR-peers uit het warme netwerk: begrijpen ze oorzaak vs. gespreksrichting als verschillende vragen?

## 10. Testen

- **Unit gedrag:** skip-cascade beide kanten; cap-3-prioritering; validatieregels §6 (incl. answered-zonder-choice en other_text-regels).
- **Content-guard:** 6 complete routesets; verwantschaps-mapping compleet (elke route ≥1 bestaande oorzaak-key); versie-ids; verboden woorden in respondent- én rapportcopy (incl. "verschilmaker", "aanbeveling", "actieplan").
- **Rapport-aggregatie:** volledige keten vanaf trigger; staffels; alle vier agenda-scenario's + beide other-regels + stopregel-overslag; concordantie-afleiding via mapping.
- **Survey e2e:** trigger → oorzaak → richting → submit; overslaan-varianten; refresh-persistence; 200-tekens; localStorage gewist.
- **Visueel:** langste routeset op mobiel viewport zonder scrollen; intro- en voortgangsregel aanwezig.
- **Privacy:** niets onder n<5; geen segmentweergave; Anders-tekst nooit ongefilterd.
- **Regressie:** trede-1-suite groen; campagnes zonder richtingdata renderen byte-identiek.

## 11. Open punten (bewust uitgesteld)

- Loep Vertrek-routeset ("wat had voor jou het verschil gemaakt?") — eigen ronde.
- De 36 gespreksvraag-templates — implementatieplan, met eigen reviewgate vóór bouw.
- Factorlabel "Beloning & voorwaarden" klantzichtbaar heroverwegen ("Beloning, voorwaarden & flexibiliteit") — `cp_flexibility` is strikt genomen arbeidsorganisatie.
- Dashboard-weergave; vergelijking gespreksrichting-verdelingen tussen herhaalmetingen (vervolgmeting-propositie).
- Herweging routesets o.b.v. "Anders"-teksten en concordantie-ratio's na 2–3 campagnes (`_direction_v2`).

## 12. Reviewlog (v1 → v2)

Externe review (ChatGPT, 60 bevindingen) verwerkt. Kernwijzigingen: 1-op-1-spiegeling vervangen door gespreksroute-sets met verwantschaps-mapping; alle copy naar gespreks-/toetsings-frame; concordant/discrepant-scenario's; beloningsset volledig herschreven (verwachtings-/claimrisico); totaalniveau-regel; validatie- en other-gaten gedicht; pilotmetrics en stopregel toegevoegd. **Verworpen:** #43 (feitelijk onjuist — `ld_recognition` bestaat in de trede-1-set), #6/#9 (frequentie-beperking — besluit Lars gehandhaafd, afgedekt met metrics + stopregel), #48 (extra statussen — afleidbaar uit bestaande data), #50 (dubbele ondergrens — staffels + volledige keten volstaan), 30–40%-gate uit #5 (arbitrair — vervangen door concordantie-scenario §7.2), #44 (experimentflag — overkill pre-eerste-klant).
