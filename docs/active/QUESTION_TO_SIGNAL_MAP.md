# QUESTION_TO_SIGNAL_MAP

Last updated: 2026-04-18  
Status: active  
Source of truth: product definitions, shared SDT/org-factor logic, product scoring modules and current data model.

## Titel

Method And Survey Evidence Flow - Question to signal map

## Korte samenvatting

Deze mapping maakt expliciet welke surveyvragen welke signalen voeden, welke signalen de hoofdmetric bouwen en welke outputs alleen context of verificatie zijn. De belangrijkste uitkomst is dat de suite methodisch vooral bestaat uit compacte, verklaarbare afleidingsketens, maar dat ExitScan en RetentieScan enkele semantische overbelasting en rule-based syntheses bevatten die duidelijk begrensd moeten blijven.

## Wat is geaudit

- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)
- [backend/products/shared/sdt.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/sdt.py)
- [backend/products/shared/org_factors.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/org_factors.py)
- [backend/products/shared/definitions.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/definitions.py)
- [backend/products/exit/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/definition.py)
- [backend/products/exit/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/scoring.py)
- [backend/products/retention/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py)
- [backend/products/retention/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/scoring.py)
- [backend/products/team/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/definition.py)
- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py)
- [backend/products/onboarding/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/definition.py)
- [backend/products/onboarding/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/scoring.py)
- [backend/products/pulse/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/pulse/definition.py)
- [backend/products/pulse/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/pulse/scoring.py)
- [backend/products/leadership/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/definition.py)
- [backend/products/leadership/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/scoring.py)
- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)

## Belangrijkste bevindingen

- SDT en organisatiefactoren vormen de methodische ruggengraat van alle productlijnen.
- RetentieScan heeft de rijkste extra signaallaag: bevlogenheid, vertrekintentie en stay-intent zijn aanvullende signalen bovenop het retentiesignaal.
- ExitScan gebruikt naast de hoofdmetric meerdere contextvragen die methodisch nuttig zijn, maar niet allemaal dezelfde constructhelderheid hebben.
- De compacte follow-on lijnen zijn methodisch beperkt maar ook relatief transparant: weinig items, weinig afleidingsstappen, duidelijke bounded triage.

## Belangrijkste inconsistenties of risico's

- `stay_intent_score` is semantisch overbelast: in RetentieScan betekent het echte stay-intent, terwijl het in ExitScan wordt hergebruikt in de exitcontext.
- `risk_score` is technisch generiek en vraagt daarom altijd productspecifieke vertaling in rapport en dashboard.
- ExitScan `preventability_result` en `replacement_cost_eur` worden niet rechtstreeks door dezelfde surveybasis gedragen als de hoofdmetric.

## Beslissingen / canonvoorstellen

- Survey-naar-signaal-ketens worden per product expliciet begrensd als hoofdmetric, aanvullende signalen, context of interne methodlaag.
- Open tekst telt in alle productlijnen als kwalitatieve verificatielaag en niet als numerieke metricbasis.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)

## Mapping

### ExitScan

| Vragenbasis | Tussenlaag | Output |
| --- | --- | --- |
| `B1-B12` SDT-items | `sdt_scores` -> `sdt_risk` | onderdeel van `Frictiescore` |
| 6 x 3 organisatiefactor-items | `org_scores` -> factor risks | onderdeel van `Frictiescore`; topfactoren en factorlezing |
| exit reason hoofdvraag | `primary_reason_code` / `primary_reason_label` | vertrekcontext, geen onderdeel van hoofdmetric |
| meespelende redenen / pull factor codes | contributing reason labels | contextlaag en hypotheses, geen onderdeel van hoofdmetric |
| eerdere signalering-vraag | `signal_visibility_summary` | contextlaag voor bestuurlijke handoff |
| exitcontext-vraag in veld `stay_intent_score` | gebruikt in `preventability_result` en contextsummary | niet lezen als echte stay-intent; interne / contextuele afleiding |
| open tekst | geanonimiseerde groepsinput | kwalitatieve verificatie, geen metric |
| salaris + rolmetadata | role multiplier / cost helper | `replacement_cost_eur`, interne niet-hoofdlaag |

### RetentieScan

| Vragenbasis | Tussenlaag | Output |
| --- | --- | --- |
| `B1-B12` SDT-items | `sdt_scores` -> `sdt_risk` | onderdeel van `Retentiesignaal` |
| 6 x 3 organisatiefactor-items | `org_scores` -> factor risks | onderdeel van `Retentiesignaal`; topfactoren |
| `uwes_1-3` | `engagement_score` | aanvullende signaallaag `bevlogenheid` |
| `ti_1-2` | `turnover_intention_score` | aanvullende signaallaag `vertrekintentie` |
| `stay_intent` item | `stay_intent_score` | aanvullende signaallaag `stay-intent` |
| hoofdmetric + aanvullingen | `signal_profile` ruleset | bestuurlijke synthese, geen apart surveyconstruct |
| open tekst | geanonimiseerde groepsinput | verificatielaag en opvolginput |

### TeamScan

| Vragenbasis | Tussenlaag | Output |
| --- | --- | --- |
| `B1`, `B5`, `B9` | compacte `sdt_scores` -> `sdt_risk` | onderdeel van `Teamsignaal` |
| actieve org-items per campaign | `org_scores` voor actieve factoren | onderdeel van `Teamsignaal` en lokale topfactor |
| lokale richtingsvraag (`stay_item`) | `local_direction_score` | ondersteunend signaal voor bounded handoff |
| metadata `department` | veilige groepsread / delta vs org | lokale contextlaag, geen zelfstandige metric |
| open tekst | geanonimiseerde groepsinput | lokale verificatie |

### Onboarding 30-60-90

| Vragenbasis | Tussenlaag | Output |
| --- | --- | --- |
| `B1`, `B5`, `B9` | compacte `sdt_scores` -> `sdt_risk` | onderdeel van `Onboardingsignaal` |
| actieve vroege org-items | `org_scores` voor actieve factoren | onderdeel van `Onboardingsignaal` en checkpointduiding |
| checkpoint-richtingsvraag (`stay_item`) | `checkpoint_direction_score` | ondersteunend signaal voor eerste handoff |
| open tekst | geanonimiseerde groepsinput | checkpointverificatie |

### Pulse

| Vragenbasis | Tussenlaag | Output |
| --- | --- | --- |
| `B1`, `B5`, `B9` | compacte `sdt_scores` -> `sdt_risk` | onderdeel van `Pulsesignaal` |
| actieve pulsefactor-items | `org_scores` voor actieve factoren | onderdeel van `Pulsesignaal` en reviewtopfactor |
| richtingsvraag (`stay_item`) | `stay_intent_score` | ondersteunend reviewsignaal |
| open tekst | geanonimiseerde groepsinput | review- en opvolginput |

### Leadership Scan

| Vragenbasis | Tussenlaag | Output |
| --- | --- | --- |
| `B1`, `B5`, `B9` | compacte `sdt_scores` -> `sdt_risk` | onderdeel van `Leadershipsignaal` |
| actieve leadership-/werkfactor-items | `org_scores` voor actieve factoren | onderdeel van `Leadershipsignaal` en managementcontext |
| managementrichtingsvraag (`stay_item`) | `leadership_direction_score` | ondersteunend signaal voor eerste duiding |
| open tekst | geanonimiseerde groepsinput | verificatie en managementfollow-up |

## Validatie

- Elke keten is herleidbaar naar definitions, scoring.py en het datamodel.
- De mapping maakt expliciet onderscheid tussen surveyconstruct, rule-based synthese en interne afleiding.

## Assumptions / defaults

- Compacte follow-on lijnen blijven methodisch bounded triagemodellen totdat latere waves meer surveybasis of longitudinale bewijsvoering toevoegen.
- ExitScan `stay_intent_score` wordt in dit document behandeld als semantisch afwijkend exitcontext-item en niet als retentiestay-intent.

## Next gate

Method evidence review en risk matrix opstellen.
