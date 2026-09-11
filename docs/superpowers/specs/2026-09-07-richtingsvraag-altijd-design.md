# Richtingsvraag voor elke respondent + "Wat er moet gebeuren" in het rapport

**Datum:** 2026-09-07
**Status:** concept, ter review Lars
**Scope:** Loep Vertrek (exit) + Loep Behoud (retention). Loep Start en Cultuurbeeld buiten scope.
**Vervangt:** de gespreksrichting-na-verdieping uit `2026-07-05-richtingsvraag-behoud-design.md` (par. 5 t/m 7.3). De waarom-verdieping uit `2026-07-03-verdiepingsvragen-design.md` blijft ongewijzigd.

---

## 1. Waarom

De positionering (copy-ronde 2026-09-06) belooft: *"Loep vertelt je wat je mensen daarmee bedoelen, en waar je maandag begint."* Het rapport levert het eerste (de waarom-verdieping) maar het tweede alleen indirect: een gespreksopener en een leeg invulblok. De richtingvraag die dat "waar je begint" moet dragen wordt nu alleen gesteld ná een beantwoorde verdieping, alleen bij Behoud, en de uitkomst landt als scenario-zin in de opener. In een pilot van 13 respondenten haalt die staffel (n≥8) zelden.

Dit ontwerp maakt de richtingvraag een vaste vraag voor elke respondent, op zijn eigen laagst scorende werkfactor, met een eerlijke uitweg ("Niets, dit zit hier goed"), en geeft de uitkomst een eigen plek in het rapport: **"Wat er moet gebeuren"**, in opdrachtvorm, met bron, in drie eerlijke staten.

## 2. Besluiten uit het brainstormgesprek

| # | Vraag | Besluit |
|---|---|---|
| 1 | Verhouding tot de bestaande richting-na-verdieping | **Vervangen.** Eén richtingvraag per respondent, losgekoppeld van de verdieping. Eén noemer per factor: "bij wie dit het laagst scoorde". De scenariomachine (concordant/discrepant, 40%-stopregel) vervalt. |
| 2 | Tie-break bij gelijke laagste factorscore | **Bestaande prioriteitsketen** van `compute_deepening_offers`: laagste gemiddelde → meeste stellingen ≤2 → laagste minimum → vaste `DEEPENING_FACTOR_KEYS`-volgorde. Eén prioriteitsregel in de codebase. |
| 3 | Staffels voor de nieuwe noemer | **Vloer op 3** beantwoorders (niet 5). Verdedigbaar omdat deze subgroep onzichtbaar is voor de organisatie (zie par. 6.3). Precisie: 3-4 aantallen + beperkte-basis-regel, 5-9 aantallen, ≥10 ook percentages. |
| 4 | Vraagtekst bij een hoge laagste score (bijv. een 8) | **Eén neutrale tekst** voor iedereen: "…scoorde bij jou het laagst. Wat zou hier volgens jou het meest helpen?" De niets-optie is de uitweg. Eén vraagversie, één noemer. |
| 5 | Regel op pagina 2 | **Bij alle drie de staten** (duidelijk / verdeeld / niets nodig); geen regel onder de vloer. |
| 6 | Waarom-verdieping | **Ongewijzigd**, pijn-getriggerd, cap 3. Een respondent krijgt dus 0-3 verdiepingen + precies 1 richtingvraag. |
| 7 | Opslag | **Eigen kolom** `direction_response` (JSONB). Niet als entry in `deepening_responses`. |

Eenmalig genoteerd risico: **"Niets, dit zit hier goed" als eerste optie** heeft een primacy-effect (de eerste én makkelijkste optie wordt vaker gekozen). Bewuste keuze van Lars; gaat op de herwegingslijst na 2-3 campagnes, samen met de bestaande optieset-herweging (`_v2`-bump).

## 3. Survey-flow

### 3.1 Stappen

```
organisatiefactoren
  → verdiepingsstap        (alleen bij ≥1 trigger; bestaand, ongewijzigd)
  → richtingstap           (ALTIJD, nieuw gedrag)
  → behoudssignalen / afsluiting
```

De richtingstap komt altijd ná de verdieping: wie een trigger op zijn laagste factor heeft, beantwoordt eerst "waarom" en dan "wat". Bij nul triggers wordt de verdiepingsstap overgeslagen via het bestaande `data-skipped`-mechanisme en is de richtingstap het enige tussenscherm. Stapnummering en voortgangsbalk volgen zoals nu uit de zichtbare stappen.

### 3.2 Scherm

Eén vraagblok, geen lijst van blokken meer.

> Van deze onderwerpen scoorde **werkbelasting** bij jou het laagst.
> Wat zou hier volgens jou het meest helpen?

Vertrek: *"…scoorde bij jou het laagst. Wat had hier volgens jou het meest geholpen?"*

Opties, in deze volgorde:
1. **Niets, dit zit hier goed** (Vertrek: *zat*)
2. de zes routes van die factor (par. 8)
3. **Anders, namelijk…** (vrij tekstveld, max 200 tekens, verplicht bij deze keuze; bestaande regel)

Eén keuze. Knop "Overslaan" zoals bij de verdieping. Geen inleidende zin op basis van scorehoogte (besluit 4).

### 3.3 Clientlogica

- `computeDirectionFactor(orgRaw)` in de survey-JS spiegelt de Python-keten uit par. 5.1 exact. De server is de autoriteit (422 bij mismatch); de client hoeft alleen consistent te zijn.
- Herberekening bij elke binnenkomst op de richtingstap (ook via "Vorige"). Als de factor gelijk blijft, blijft een al gegeven antwoord staan; wijzigt de factor, dan wordt het blok leeg opnieuw gerenderd.
- localStorage-restore zoals nu (sleutel `verisight_survey_{token}` blijft, zie beslissing 2026-07-05); het richtingantwoord wordt opgeslagen mét de factor waarvoor het gold, en alleen hersteld als die factor bij herberekening gelijk is.
- De bestaande `renderDirectionBlocks`/`answeredDeepeningFactors`-koppeling aan de verdiepingsstap verdwijnt.

## 4. Datamodel en validatie

### 4.1 Opslag

Migratie `migrations/2026_09_07_add_direction_response.sql`, additief en idempotent:

```sql
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS direction_response jsonb;
```

Inhoud:

```json
{
  "factor_key": "workload",
  "question_set_version": "retention_workload_direction_v2",
  "status": "answered",
  "choice": "wld_peaks",
  "other_text": null
}
```

- `status ∈ {"answered", "skipped"}`; bij `skipped` zijn `choice` en `other_text` `null`.
- `other_text` alleen bij een `*_other`-keuze, na `anonymize_text`.
- Versies: retention `_v2` (optieset wijzigt door de niets-optie), exit `_v1` (nieuw).

### 4.2 Modellen

- Pydantic: nieuw `DirectionResponse(factor_key, question_set_version, status, choice, other_text)`; veld `direction_response: DirectionResponse | None` op de submit-payload. `direction` verdwijnt uit `DeepeningEntry`.
- SQLAlchemy: `direction_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)` op `SurveyResponse`.

### 4.3 Servervalidatie (client is untrusted)

| Situatie | Gedrag |
|---|---|
| `factor_key` ≠ `compute_direction_factor(payload.org_raw)` | 422 "Gespreksrichting hoort niet bij deze inzending." |
| onbekende `choice` | 422 "Onbekende gespreksrichting-optie." |
| `question_set_version` ≠ huidige versie voor scan+factor | 422 "Verouderde gespreksrichting-versie." |
| scantype buiten exit/retention met `direction_response` | 422 "Gespreksrichting wordt niet ondersteund voor dit scantype." |
| `other_text` zonder `*_other`-keuze, of >200 tekens | 422 |
| `status = skipped` met `choice` gezet | 422 |
| `direction_response` ontbreekt bij exit/retention | **geaccepteerd** (oude client, cache), maar zichtbaar: de aggregatie telt dit als "niet aangeboden" en de keten toont het verschil |
| geneste `direction` in een verdieping-entry | 422 "Verouderd inzendformaat voor gespreksrichting." Niet stil negeren (Fail Loud). |

### 4.4 Bestaande data

De juli-pilotdata met geneste `direction` blijft staan in `deepening_responses`, wordt door de nieuwe aggregatie genegeerd en niet meer gerenderd. Geen backfill: andere vraag, andere populatie.

## 5. Logica in `backend/products/shared/deepening.py`

### 5.1 `compute_direction_factor(org_raw) -> str | None`

Zelfde sorteersleutel als `compute_deepening_offers` (`(avg, -low_count, min, idx)`), maar over **alle** factoren met ≥1 stelling, zonder triggerfilter. Geeft de eerste terug. `None` alleen als geen enkele factor stellingen heeft. Refactor: de sleutelfunctie wordt gedeeld tussen beide functies zodat er één prioriteitsregel bestaat.

### 5.2 `get_direction_sets(scan_type) -> dict`

Voor exit én retention. Per factor: `question_set_version`, `question` (scan-specifiek), `options` (`key`, `text` scan-specifiek). De niets-optie staat als eerste in `options`; `imperative` is server-side en gaat niet naar de client.

### 5.3 `aggregate_direction(rows, scan_type) -> dict[factor_key, agg]`

`rows` = per respondent `(org_raw, direction_response | None)`.

```
lowest_n   # compute_direction_factor(org_raw) == fk  (herberekend, niet uit het veld)
offered    # direction_response aanwezig met factor_key == fk
answered   # status == answered
skipped    # status == skipped
counts     # {choice: n} over answered, incl. *_none en *_other
```

Elke respondent telt in precies één factor voor `lowest_n`. `offered > lowest_n` kan door de validatie niet ontstaan; de aggregatie logt een warning als het toch gebeurt en telt gewoon door.

### 5.4 `direction_state(agg) -> dict`

Met `n = agg["answered"]`, geëvalueerd in deze volgorde:

| Staat | Regel |
|---|---|
| `too_few` | `n < 3` |
| `none_needed` | `counts[*_none] / n > 0.5` (strikte meerderheid; zie fix-ronde 1, B11) |
| `clear` | top-optie is geen `*_none` en geen `*_other`, `top / n ≥ 0.5`, én `top − tweede ≥ 2` (niets en anders tellen mee als concurrent) |
| `divided` | alles wat overblijft, inclusief "anders" als top |

Gevolgen: bij n=3 is `clear` alleen 3-0; bij n=4 vanaf 3-1; bij gelijkspel niets/route op n=4 (2-2) valt de factor door naar `divided`, want de helft is niet “de meeste” (B11, 11 september 2026). Retourneert `{state, n, top_key, top_n, second_n, ranked}` voor de renderer.

Bij `*_other` als top-optie over n≥8: `logger.warning("direction: *_other is topoptie voor %s - optieset review nodig")`, gespiegeld aan het bestaande verdiepingspatroon.

### 5.5 Vervalt

`direction_agenda_scenario`, `_direction_top`, `is_concordant`, `get_direction_agenda_question`, de `related`- en `agenda`-velden in `DIRECTION_SETS`, de 40%-skip-stopregel en hun tests.

## 6. Rapport (`backend/report_html.py`)

### 6.1 Blok "Wat er moet gebeuren"

Plaats: op de gespreksagenda-pagina in `_prioriteringsraster`, tussen de rastertabel (+ uitleg) en het navy slotblok. Twee kaarten: **Startpunt: [factor]** en **Tweede punt: [factor]** (dezelfde rijen die in het raster `agenda_role` dragen). De rasterkolom "Verdieping" blijft het "waarom"; dit blok is het "wat".

Eyebrow boven het blok: *"Wat er moet gebeuren"* (de sectienaam zelf). De attributie staat per kaart in de bronregel ("Volgens X van de Y bij wie dit het laagst scoorde"), niet nog eens boven het blok; herhaling zou de kop verzwakken.

Per kaart, naar staat:

| Staat | Kop (groot) | Regel onder de kop |
|---|---|---|
| `clear` | de `imperative` van de top-route, bijv. *"Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze."* | *"Volgens 6 van de 8 bij wie werkbelasting het laagst scoorde."* |
| `divided` | *"Geen eenduidige richting."* | *"De 8 bij wie dit het laagst scoorde kozen verschillend."* |
| `none_needed` | *"Hier hoeft volgens de meeste betrokkenen niets."* | *"5 van de 8 bij wie dit het laagst scoorde kozen ‘Niets, dit zit hier goed’. Bespreek of dit dan het startpunt moet zijn."* (tweede punt: *"…of dit het tweede punt moet zijn."*) |
| `too_few` | *"Te weinig antwoorden voor een richting."* | geen |

Onder de kop (niet bij `too_few`): compacte verdelingstabel (`item-tbl`-stijl) met alle gekozen opties, gesorteerd op aantal, met de niets-optie en "Anders" gewoon in de lijst. Aantallen; vanaf n≥10 `pct (n)`. Bij n 3-4 (`DIRECTION_MIN_N` t/m `DIRECTION_CAVEAT_MAX_N`) daaronder de regel *"Beperkte basis: gebruik dit als gesprekshaakje, niet als conclusie."*

Onder elke kaart altijd de keten:
*"Van de 13 respondenten hadden 9 dit als laagste; 8 beantwoordden de vraag, 1 sloeg over."*
Bij `lowest_n > offered` (oude client): *"…; 7 kregen de vraag, 6 beantwoordden die, 1 sloeg over."*
Bij `lowest_n == 0` (niemands eigen laagste factor was deze): *"Niemand had dit als laagste onderwerp."* en verder niets. Een clausule met de telling 0 wordt nooit geschreven; dan eindigt de zin bij de opener.

De Y in de bronregel is `answered` (principe "percentages altijd over beantwoorders", verdiepingsspec 6.1); de keten maakt het verschil met `lowest_n` zichtbaar.

Campagne-gate zoals bij de verdieping: het blok verschijnt alleen als `any(offered > 0)` over alle factoren. Historische rapporten blijven ongewijzigd.

### 6.2 Regel op pagina 2

In de bestuurlijke read, onder de bestaande bronregel bij de gespreksopener, één regel over het **startpunt**:

| Staat | Regel |
|---|---|
| `clear` | *"Wat er volgens 6 van de 8 moet gebeuren: Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze."* |
| `divided` | *"Over wat hier moet gebeuren zijn de 8 die dit het laagst scoorden verdeeld. Zie de gespreksagenda."* |
| `none_needed` | *"5 van de 8 die dit het laagst scoorden zeggen: hier hoeft niets."* |
| `too_few` | geen regel |

NB: de rapport-taalronde (`2026-09-06-rapport-taalronde-design.md`) kan de paginanaam "Bestuurlijke read" hernoemen; deze spec verwijst naar "pagina 2 / de openingspagina" en volgt die hernoeming.

### 6.3 Methodiekpagina

Drie zinnen erbij: (1) elke respondent kreeg één richtingvraag, over het onderwerp dat bij hem het laagst scoorde; (2) de opdrachtvorm in "Wat er moet gebeuren" geeft de keuze van die respondenten weer, geen advies van Loep; (3) dit blok toont al vanaf 3 antwoorden, lager dan de 5 die voor afdelingen geldt, omdat niemand in de organisatie kan zien wie een onderwerp als laagste had; het risico bij kleine aantallen is dat het beeld toevallig is, niet dat het herleidbaar is, en daarom staat er dan een beperkte-basis-regel bij.

### 6.4 Vervalt

`_direction_block` (het blok "Welke gespreksrichting respondenten kozen" op de verdiepingspagina's), `_direction_agenda_line` en de scenariozinnen in de gespreksopener, bijbehorende CSS. De gespreksopener blijft de toelichting-gebaseerde regel (`_deepening_mgmt_q`) met de bestaande fallback.

Richtingdata van factoren buiten startpunt/tweede punt wordt niet getoond. Follow-up (niet nu): appendix-regel per factor.

### 6.5 Copy-regels

Geen em-dashes. Geen "risico", "interventie", "actieplan". De imperatieven zijn de stem van de respondenten, niet die van Loep; het blok zegt nooit "Loep adviseert". Geen oorzaakclaims.

## 7. Voorbeeldrapporten

`generate_voorbeeldrapport.py` seedt `direction_response` per respondent via de echte `compute_direction_factor`, niets gefaket. Seed zo dat de Behoud-sample `clear` toont op het startpunt en `divided` op het tweede punt; de Vertrek-sample `clear` op het startpunt en `too_few` of `divided` op het tweede punt. `none_needed` en de n=3/4-grenzen worden unit-getest, niet in de sample geforceerd. HTML + PDF via WeasyPrint-Docker regenereren, 0 warnings.

## 8. Content: routes per factor

Per route: sleutel, tekst Behoud (bestaand), tekst Vertrek (verleden tijd waar nodig; anders gelijk), opdrachtvorm voor het rapport (tijd-neutraal: de organisatie krijgt dezelfde instructie, ongeacht of de bron bleef of vertrok). Vraagtekst per factor gebruikt het onderwerp uit de kolom "onderwerp".

**Concept ter review.** Sleutels van bestaande routes ongewijzigd; per factor één nieuwe `*_none`-sleutel.

### 8.1 Werkbelasting (`workload`, onderwerp: *werkbelasting*)

| key | Behoud | Vertrek | Opdrachtvorm |
|---|---|---|---|
| `wld_none` | Niets, dit zit hier goed | Niets, dit zat hier goed | (geen) |
| `wld_scope` | Takenpakket en werkvolume beter afbakenen | idem | Baken het takenpakket en het werkvolume scherper af. |
| `wld_planning` | Planning en bezetting beter laten aansluiten op het werk dat er ligt | idem | Laat planning en bezetting beter aansluiten op het werk dat er ligt. |
| `wld_peaks` | Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen | idem | Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze. |
| `wld_recovery` | Meer ruimte om te herstellen en werk goed af te ronden | idem | Maak meer ruimte om te herstellen en werk goed af te ronden. |
| `wld_priorities` | Duidelijkere keuzes over wat voorrang heeft en wat kan wachten | idem | Maak duidelijker wat voorrang heeft en wat kan wachten. |
| `wld_friction` | Minder dubbel werk, systeemgedoe of fouten in overdracht | idem | Haal dubbel werk, systeemgedoe en fouten in de overdracht weg. |
| `wld_other` | Anders, namelijk… | idem | (geen) |

### 8.2 Aansturing (`leadership`, onderwerp: *de aansturing*)

| key | Behoud | Vertrek | Opdrachtvorm |
|---|---|---|---|
| `ldd_none` | Niets, dit zit hier goed | Niets, dit zat hier goed | (geen) |
| `ldd_feedback` | Meer bruikbare feedback en richting | idem | Geef meer bruikbare feedback en richting. |
| `ldd_mandate` | Duidelijker wat ik zelf mag beslissen in mijn werk | Duidelijker wat ik zelf mocht beslissen in mijn werk | Maak duidelijker wat medewerkers zelf mogen beslissen. |
| `ldd_escalation` | Duidelijkere steun als er spanningen zijn of situaties vastlopen | Duidelijkere steun als er spanningen waren of situaties vastliepen | Bied duidelijkere steun als er spanningen zijn of situaties vastlopen. |
| `ldd_recognition` | Concretere terugkoppeling op wat goed gaat en wat wordt gewaardeerd | Concretere terugkoppeling op wat goed ging en wat werd gewaardeerd | Koppel concreter terug wat goed gaat en wat wordt gewaardeerd. |
| `ldd_availability` | Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende | idem | Zorg dat leidinggevenden beschikbaarder en zichtbaarder zijn. |
| `ldd_consistency` | Stabielere en beter uitlegbare besluiten en verwachtingen | idem | Maak besluiten en verwachtingen stabieler en beter uitlegbaar. |
| `ldd_other` | Anders, namelijk… | idem | (geen) |

### 8.3 Samenwerking (`culture`, onderwerp: *de samenwerking in het team*)

| key | Behoud | Vertrek | Opdrachtvorm |
|---|---|---|---|
| `cud_none` | Niets, dit zit hier goed | Niets, dit zat hier goed | (geen) |
| `cud_safety` | Fouten of twijfels makkelijker en veiliger kunnen bespreken | idem | Maak het makkelijker en veiliger om fouten of twijfels te bespreken. |
| `cud_dissent` | Meer ruimte voor kritische vragen en afwijkende meningen | idem | Geef kritische vragen en afwijkende meningen meer ruimte. |
| `cud_conflict` | Spanningen of conflicten eerder bespreekbaar maken | idem | Maak spanningen of conflicten eerder bespreekbaar. |
| `cud_agreements` | Duidelijkere teamafspraken over gedrag, samenwerking en opvolging | idem | Maak duidelijkere teamafspraken over gedrag, samenwerking en opvolging. |
| `cud_involvement` | Eerder betrokken worden bij besluiten of veranderingen die het team raken | Eerder betrokken worden bij besluiten of veranderingen die het team raakten | Betrek medewerkers eerder bij besluiten of veranderingen die het team raken. |
| `cud_crossteam` | Betere samenwerking tussen teams of afdelingen | idem | Verbeter de samenwerking tussen teams of afdelingen. |
| `cud_other` | Anders, namelijk… | idem | (geen) |

### 8.4 Groeiperspectief (`growth`, onderwerp: *groeiperspectief*)

| key | Behoud | Vertrek | Opdrachtvorm |
|---|---|---|---|
| `grd_none` | Niets, dit zit hier goed | Niets, dit zat hier goed | (geen) |
| `grd_visibility` | Beter zicht op welke mogelijkheden er voor mij zijn | Beter zicht op welke mogelijkheden er voor mij waren | Maak zichtbaar welke mogelijkheden er voor medewerkers zijn. |
| `grd_conversation` | Een concreter gesprek over mijn ontwikkeling | idem | Voer een concreter gesprek over ontwikkeling. |
| `grd_followthrough` | Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen | idem | Leg ontwikkelafspraken concreter vast en volg ze zichtbaar op. |
| `grd_time` | Ontwikkeling beter inplannen naast het reguliere werk | idem | Plan ontwikkeling in naast het reguliere werk. |
| `grd_criteria` | Duidelijkere criteria voor hoe doorgroei wordt bepaald | Duidelijkere criteria voor hoe doorgroei werd bepaald | Maak duidelijker hoe doorgroei wordt bepaald. |
| `grd_nextstep` | Een open en concreet gesprek over realistische vervolgstappen binnen de organisatie | idem | Voer een open en concreet gesprek over realistische vervolgstappen binnen de organisatie. |
| `grd_other` | Anders, namelijk… | idem | (geen) |

### 8.5 Beloning en voorwaarden (`compensation`, onderwerp: *beloning en voorwaarden*)

| key | Behoud | Vertrek | Opdrachtvorm |
|---|---|---|---|
| `cpd_none` | Niets, dit zit hier goed | Niets, dit zat hier goed | (geen) |
| `cpd_insight` | Beter inzicht in hoe beloning zich verhoudt tot vergelijkbaar werk elders | Beter inzicht in hoe beloning zich verhield tot vergelijkbaar werk elders | Geef inzicht in hoe de beloning zich verhoudt tot vergelijkbaar werk elders. |
| `cpd_explain` | Meer uitlegbaarheid van verschillen tussen vergelijkbare functies | idem | Leg verschillen tussen vergelijkbare functies beter uit. |
| `cpd_review` | Beter kijken of beloning past bij de zwaarte en verantwoordelijkheid van mijn werk | Beter kijken of beloning paste bij de zwaarte en verantwoordelijkheid van mijn werk | Kijk opnieuw of de beloning past bij de zwaarte en verantwoordelijkheid van het werk. |
| `cpd_path` | Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing | idem | Geef duidelijkheid over mogelijke salarisgroei, voorwaarden en timing. |
| `cpd_clarity` | Meer duidelijkheid over hoe beloning en groei worden bepaald | Meer duidelijkheid over hoe beloning en groei werden bepaald | Maak duidelijk hoe beloning en groei worden bepaald. |
| `cpd_flex` | Meer duidelijkheid of ruimte rond rooster, werktijden of flexibiliteit | idem | Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit. |
| `cpd_other` | Anders, namelijk… | idem | (geen) |

### 8.6 Rolhelderheid (`role_clarity`, onderwerp: *duidelijkheid over je rol*)

| key | Behoud | Vertrek | Opdrachtvorm |
|---|---|---|---|
| `rcd_none` | Niets, dit zit hier goed | Niets, dit zat hier goed | (geen) |
| `rcd_priorities` | Duidelijkere prioriteiten binnen mijn rol | idem | Maak de prioriteiten binnen rollen duidelijker. |
| `rcd_expectations` | Duidelijkheid over verwachtingen en waarop ik word aangesproken | Duidelijkheid over verwachtingen en waarop ik werd aangesproken | Maak duidelijk wat er wordt verwacht en waarop medewerkers worden aangesproken. |
| `rcd_alignment` | Eenduidigere opdrachten en betere afstemming tussen betrokkenen | idem | Maak opdrachten eenduidiger en stem beter af tussen betrokkenen. |
| `rcd_scope` | Duidelijke afspraken als mijn takenpakket verandert | Duidelijke afspraken als mijn takenpakket veranderde | Maak duidelijke afspraken wanneer een takenpakket verandert. |
| `rcd_mandate` | Duidelijkheid over wat ik zelf mag beslissen | Duidelijkheid over wat ik zelf mocht beslissen | Maak duidelijk wat medewerkers zelf mogen beslissen. |
| `rcd_information` | Betere informatie, context en overdracht voor mijn werk | idem | Zorg voor betere informatie, context en overdracht. |
| `rcd_other` | Anders, namelijk… | idem | (geen) |

Opmerking bij 8.6: de bestaande vraag zei "rolhelderheid"; in de respondentvraag wordt dat *duidelijkheid over je rol* (gewone taal, copy-ronde 2026-09-06). Het rapportlabel blijft de bestaande factorlabelset.

## 9. Tests

**Pure logica (`tests/test_deepening_direction.py`, nieuw):**
- `compute_direction_factor`: laagste wint; tie-break op low_count, dan minimum, dan volgorde; `None` zonder stellingen; gelijk aan `compute_deepening_offers()[0]` wanneer die niet leeg is.
- `direction_state`: elk van de vier staten; n=2 → too_few; n=3 3-0 → clear, 2-1 → divided; n=4 3-1 → clear, 2-2 niets/route → divided, 2-1-1 → divided; anders als top → divided; niets boven 50% wint vóór clear.
- `aggregate_direction`: één factor per respondent voor `lowest_n`; `lowest_n > offered` bij ontbrekend veld; counts alleen over answered; warning bij `offered > lowest_n`.
- `get_direction_sets`: exit én retention, niets-optie eerst, versies, `imperative` niet in de client-set, elke route heeft een niet-lege `imperative` behalve `*_none`/`*_other`.

**API (`tests/test_api_flows.py` of nieuw):** 422-gevallen uit par. 4.3; happy path exit + retention; geneste `direction` → 422; ontbrekend veld → 200 en `direction_response IS NULL`.

**Rapport (`tests/test_report_direction_block.py`, nieuw; bestaande direction-tests aangepast of verwijderd):** blok per staat aanwezig met de juiste kop en bronregel; keten met en zonder `lowest_n > offered`; beperkte-basis-regel bij n 3-4, percentages vanaf 10; p.02-regel per staat en afwezig bij too_few; campagne-gate; em-dash-guard; `_direction_block`-copy niet meer aanwezig.

**Voorbeeldrapporten:** generator draait foutloos, staten zoals in par. 7.

**Browser-e2e (SQLite-lokaal, zoals juli):** nul-trigger-pad (alleen richtingstap), trigger-pad (verdieping → richting op dezelfde factor), terugnavigeren met scorewijziging (factor wisselt, antwoord vervalt), refresh-restore met behoud van keuze, anders-validatie, overslaan, mobiel 375px, submit → `direction_response` in DB.

**Baseline:** volledige backend-suite op de bestaande faalset (byte-identiek via stash-diff); 0 nieuwe regressies.

## 10. Uitrol

1. Migratie in Supabase draaien **vóór** Railway-redeploy (de kolom moet bestaan voordat de nieuwe code schrijft).
2. Railway-redeploy (backend + templates).
3. Voorbeeldrapport-PDF's regenereren via WeasyPrint-Docker en meecommitten; de live voorbeeld-PDF's (o.a. de link die Gerianne heeft) tonen dan het blok na de Vercel-deploy.
4. Pre-pilot: de vraagtekst en de niets-optie cognitief pretesten bij 2-3 HR-peers, met nadruk op de respondent wiens laagste een 8 is.

## 11. Follow-ups (niet in deze spec)

- Loep Start: eigen routesets (hoort bij de Loep Start-verdiepingsset v1.1).
- Appendix-regel per factor met de richtingverdeling buiten startpunt/tweede punt.
- Herweging na 2-3 campagnes: primacy-effect van de niets-optie, `*_other`-frequentie, optieset `_v3`.
- Dashboard-weergave van de richtingdata.
- Overweging "uitbreiden naar twee" (laagste + op één na laagste) als het tweede punt structureel onder de vloer blijft.
