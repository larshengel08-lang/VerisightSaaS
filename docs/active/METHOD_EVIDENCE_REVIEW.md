# METHOD_EVIDENCE_REVIEW

Last updated: 2026-04-18  
Status: active  
Source of truth: methodology reference, question-to-signal map, scoring logic and trust contracts.

## Titel

Method And Survey Evidence Flow - Evidence review

## Korte samenvatting

De methodevidence is sterk genoeg voor gecontroleerde producthardening, maar niet gelijkmatig sterk over alle afleidingslagen. Hoofdmetrics op basis van SDT plus organisatiefactoren zijn inhoudelijk plausibel en intern consistent; rule-based syntheses, semantisch overbelaste velden en legacy-afleidingen vragen duidelijkere begrenzing.

## Wat is geaudit

- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)
- [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)
- [backend/scoring_config.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring_config.py)
- [backend/products/exit/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/scoring.py)
- [backend/products/retention/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/scoring.py)
- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py)
- [backend/products/onboarding/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/scoring.py)
- [backend/products/pulse/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/pulse/scoring.py)
- [backend/products/leadership/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/scoring.py)

## Belangrijkste bevindingen

- `Frictiescore` en `Retentiesignaal` zijn inhoudelijk te onderbouwen als samenvattende groepssignalen, omdat ze rusten op verklaarbare combinaties van SDT en beinvloedbare werkfactoren.
- ExitScan blijft methodisch kwetsbaarder dan RetentieScan door retrospectieve bias, expert-judgment gewichten en extra afleidingen buiten de kernscore.
- RetentieScan aanvullende signalen zijn logisch, maar hun bestuurlijke synthese (`signal_profile`) blijft een ruleset en geen bewezen latent model.
- TeamScan, Onboarding, Pulse en Leadership zijn methodisch verdedigbaar als bounded triage-instrumenten, juist omdat ze klein en expliciet begrensd zijn.
- RetentieScan herhaalmeting, trendkaarten en playbook-ijking zijn alleen methodisch verdedigbaar als beschrijvende vervolglaag en niet als effect- of interventiebewijs.

## Belangrijkste inconsistenties of risico's

- ExitScan `preventability_result` suggereert een sterkte van afleiding die de surveybasis niet volledig draagt.
- ExitScan `replacement_cost_eur` is geen surveygebaseerde productwaarheid maar een business helper op metadata.
- Dezelfde veldnaam `stay_intent_score` staat voor verschillende constructen in verschillende producten.
- Drempels als `4.5`, `5.5` en `7.0` zijn bruikbare leesgrenzen, maar geen externe validatiegrenzen of significantietesten.
- Effectachtige taal rond RetentieScan follow-up, trends of calibration kan de evidence-basis harder laten lijken dan die nu is.

## Beslissingen / canonvoorstellen

- Hoofdmetrics blijven methodisch verdedigbaar als indicatieve managementsamenvattingen.
- Rule-based syntheses en afgeleide business helpers moeten expliciet als begrensde hulplagen worden gelabeld.
- Semantische dubbelzinnigheid in gedeelde veldnamen moet in docs en later in code-aliasing worden opgelost.
- Longitudinale of playbooktaal blijft beschrijvend totdat echte follow-upuitkomsten een hardere claim dragen.

## Concrete wijzigingen

- Bestand ververst: [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)

## Evidence review per product

| Product | Evidence oordeel | Proportionele claims | Niet proportioneel zonder extra begrenzing |
| --- | --- | --- | --- |
| ExitScan | Plausibel, intern consistent, maar retrospectief en expert-judgment heavy | groepsgerichte vertrekduiding, prioritering, werkfactorlezing, eerdere signalering als context | vermijdbaarheid als harde uitkomst, replacement cost als productbewijs, causaliteit |
| RetentieScan | Plausibel, intern consistent, v1-werkmodel | vroegsignalering op behoud, verificatiehulp, samen lezen van hoofdmetric en aanvullingen, beschrijvende repeat/trendlaag | predictorclaim, persoonsgericht risico, harde trend-, effect- of causaliteitsclaim |
| TeamScan | Plausibel als bounded lokalisatie | localisatie, eerste verificatie, department-first managementread | brede teamdiagnose, manager ranking, oorzaakbewijs |
| Onboarding 30-60-90 | Plausibel als single-checkpoint read | vroege checkpointduiding, eerste handoff, beperkte correctiestap | journey-engine, retentievoorspeller, cohortmodel |
| Pulse | Plausibel als bounded reviewsnapshot | momentopname, review, kleine koerscorrectie, beperkte vergelijking | zelfstandige trendmachine, effectbewijs |
| Leadership Scan | Plausibel als geaggregeerde managementcontextread | group-level managementcontext, eerste duiding, bounded handoff | named leader oordeel, 360-claim, hierarchy model |

## Validatie

- De review is gebaseerd op concrete survey-, scoring- en trustlagen.
- Geen van de conclusies opent of wijzigt de vaste ExitScan-report-architectuur.

## Assumptions / defaults

- Methodische verdedigbaarheid betekent hier: intern consistent, inhoudelijk plausibel en proportioneel voor managementgebruik; niet extern gevalideerd of wetenschappelijk bewezen als predictor.

## Next gate

Method risk matrix en statusherijking uitwerken.
