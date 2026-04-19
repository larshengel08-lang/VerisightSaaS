# METHOD_RISK_MATRIX

Last updated: 2026-04-18  
Status: active  
Source of truth: method evidence review and the audited scoring/data model.

## Titel

Method And Survey Evidence Flow - Risk matrix

## Korte samenvatting

De hoogste methodrisico's zitten in ExitScan-nevenafleidingen, semantische veldhergebruik en te vroege promotie van bounded lijnen. De hoofdmetrics zelf zijn niet risicoloos, maar wel beheersbaar zolang ze expliciet als gegroepeerde managementsamenvatting en niet als diagnose of predictor worden gepositioneerd.

## Wat is geaudit

- [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)
- [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)
- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/products/exit/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/scoring.py)
- [backend/products/retention/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/scoring.py)

## Belangrijkste bevindingen

- Niet alle methodrisico's zijn gelijk: sommige vragen alleen strengere copygrenzen, andere vragen expliciete suppressie of herlabeling.
- ExitScan heeft de meeste kans op businessrisico als legacy-afleidingen te prominent blijven.
- RetentieScan verschuift methodisch vooral richting risico zodra beschrijvende vervolgoutput wordt gelezen als effectbewijs of interventievalidatie.

## Belangrijkste inconsistenties of risico's

- Semantische drift tussen datafield en constructnaam kan later zowel rapporttaal als analytics vervuilen.
- Bounded producten kunnen inhoudelijk te vroeg als volwaardige diagnostische producten gelezen worden als hun surveybasis niet expliciet zichtbaar blijft.
- RetentieScan repeat- en calibration-taal kan bij te harde formulering meer longitudinal evidence suggereren dan nu aanwezig is.

## Beslissingen / canonvoorstellen

- Hoge methodrisico's moeten in volgende hardeningwaves ofwel suppressed, ofwel expliciet herlabeld, ofwel intern-only gemaakt worden.

## Concrete wijzigingen

- Bestand ververst: [METHOD_RISK_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_RISK_MATRIX.md)

## Risk matrix

| Risico | Product / laag | Ernst | Waarom | Voorkeursmaatregel |
| --- | --- | --- | --- | --- |
| `preventability_result` klinkt te hard | ExitScan | Hoog | rule-based afleiding met sterke causaliteitsconnotatie | internal-only of sterk downgrade |
| `replacement_cost_eur` klinkt als productbewijs | ExitScan | Hoog | metadatahelper, geen surveygebaseerde managementwaarheid | uit hoofdlezing houden |
| `stay_intent_score` betekent niet overal hetzelfde | ExitScan + RetentieScan + compacte lijnen | Hoog | semantische constructdrift in gedeeld veld | documentalias nu, code-alias later |
| expert-judgment gewichten | ExitScan | Middel | plausibel maar nog niet gekalibreerd op eigendata | expliciete disclosure behouden |
| rule thresholds 4.5 / 5.5 / 7.0 | alle lijnen | Middel | nuttige leesgrenzen, geen externe validatie | labelen als managementbanding |
| `signal_profile` is ruleset, geen latent model | RetentieScan | Middel | synthese van hoofdmetric en aanvullingen | verification-first label behouden |
| repeat/trend/calibration-taal klinkt als effectbewijs | RetentieScan | Middel | beschrijvende vervolgoutput kan te snel als interventie- of effectvalidatie worden gelezen | expliciet beschrijvende wording en trendgrens behouden |
| bounded compact models te vroeg breder claimen | Team, Onboarding, Pulse, Leadership | Hoog | surveybasis is smal en single-cycle | bounded route taal handhaven |
| open tekst als impliciet bewijs lezen | alle lijnen | Middel | kwalitatieve groepsinput, geen representatieve metric | altijd als verificatielaag labelen |
| veilige groepsdrempels omzeilen | Team, segmentlagen | Hoog | kleine n geeft schijnprecisie en privacyrisico | suppression rules leidend houden |

## Validatie

- Elke risicoregel is rechtstreeks herleidbaar tot een concrete scoring- of datalaag.
- De matrix introduceert geen nieuwe productclaim en raakt de ExitScan-report-architectuur niet.

## Assumptions / defaults

- `Hoog` betekent hier: reeel business- of trustrisico bij buyer-facing of managementpromotie.
- `Middel` betekent: bruikbaar mits disclosure en interpretatiegrens intact blijven.

## Next gate

Statusboard herijken en method closeout vastleggen.
