# SURVEY_METHOD_FIX_PLAN

Last updated: 2026-04-18  
Status: active  
Source of truth: question-to-signal map, method evidence review and method risk matrix.

## Titel

Method And Survey Evidence Flow - Fix plan

## Korte samenvatting

Dit fixplan richt zich niet op redesign, maar op methodische begrenzing en verduidelijking. De kern is: hoofdmetrics behouden, risicovolle nevenafleidingen omlaag zetten, semantische dubbelzinnigheid oplossen en bounded surveybasis overal zichtbaar houden.

## Wat is geaudit

- [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)
- [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)
- [METHOD_RISK_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_RISK_MATRIX.md)

## Belangrijkste bevindingen

- Veel hardening is haalbaar zonder productherontwerp: het gaat vooral om suppressie, labeling en canonische uitleg.
- Eén semantische correctie levert veel op: constructnamen per productlijn expliciet houden.

## Belangrijkste inconsistenties of risico's

- Als docs en code-aliases niet tegelijk worden aangescherpt, blijft constructdrift rond `stay_intent_score` bestaan.
- Als degrade-besluiten niet worden doorgezet in rapport-/dashboard-/mirrorlagen, blijven oude interpretaties terugkomen.

## Beslissingen / canonvoorstellen

- Fixes in dit plan zijn default hardeningwerk en geen commerciële koerswijziging.
- De vaste ExitScan-report-architectuur blijft onaangeraakt; eventuele wijzigingen richten zich alleen op labels, interpretatiegrenzen en suppressie.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [SURVEY_METHOD_FIX_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SURVEY_METHOD_FIX_PLAN.md)

## Fixplan

1. Documenteer een productspecifieke aliaslaag voor generieke velden.
   ExitScan `risk_score` = `Frictiescore`, RetentieScan `risk_score` = `Retentiesignaal`, enzovoort.

2. Splits semantisch in documentatie tussen echte `stay-intent` en ExitScan-exitcontext.
   ExitScan gebruikt het gedeelde veld nu niet voor hetzelfde construct als RetentieScan; dat moet in docs en latere code-aliasen expliciet worden.

3. Houd `preventability_result` uit primaire managementsamenvatting en buyer-facing taal.
   Alleen intern of sterk begrensd als aanvullende methodhulp.

4. Houd `replacement_cost_eur` uit product truth en kernrapportduiding.
   Alleen als optionele interne businesshelper en nooit als bewijs van surveyuitkomst.

5. Voeg per product een compacte “hoe wordt dit signaal opgebouwd?”-disclosure toe waar passend.
   Niet als redesign, wel als truth-fix in methodiek- of helpteksten.

6. Bevestig in alle bounded lijnen expliciet dat de surveybasis compact en single-cycle is.
   Vooral relevant voor TeamScan, Onboarding, Pulse en Leadership.

7. Label `signal_profile`, banding en drempels overal als management- en verificatiehulp.
   Niet als statistische grens, predictor of diagnostische classificatie.

8. Houd open tekst expliciet in de verificatie- en follow-uplaag.
   Niet als aparte evidence score of kwantitatieve claim.

## Validatie

- Alle voorstellen zijn uitvoerbaar zonder de vaste ExitScan-report-architectuur te wijzigen.
- Geen van de fixregels vereist pricing-, portfolio- of statusescalatie.

## Assumptions / defaults

- Waar suppressie wordt genoemd, is document- en interpretatielaag de eerste stap; codewijziging kan in een latere fixwave volgen.
- Productlijnen in `parity_build` krijgen strengere bounded labeling dan `core_proven` lijnen.

## Next gate

Method signoff.
