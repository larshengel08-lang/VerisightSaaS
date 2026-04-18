# METHOD_SIGNOFF

Last updated: 2026-04-18  
Status: active  
Source of truth: question-to-signal map, method evidence review, method risk matrix and survey method fix plan.

## Titel

Method And Survey Evidence Flow - Signoff

## Korte samenvatting

De methodfase is nu voldoende gehard om door te schuiven naar verdere parity- en productline-hardening. De survey-naar-signaal-keten is expliciet, de grootste methodrisico's zijn benoemd en de buyer-facing claimgrens is per productlijn strakker vastgelegd.

## Wat is geaudit

- [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)
- [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)
- [METHOD_RISK_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_RISK_MATRIX.md)
- [SURVEY_METHOD_FIX_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SURVEY_METHOD_FIX_PLAN.md)
- [RETENTION_METHOD_READ_PARITY_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTION_METHOD_READ_PARITY_REVIEW.md)

## Belangrijkste bevindingen

- Hoofdmetrics zijn methodisch plausibel en proportioneel voor groepsgerichte managementduiding.
- De hoogste risico's zitten niet in de kernsignalering, maar in nevenafleidingen, semantische dubbelzinnigheid en te vroege verbreding van bounded modellen.
- RetentieScan follow-up, trend- en calibration-taal moest scherper beschrijvend worden en is nu ook zo vastgelegd.

## Belangrijkste inconsistenties of risico's

- Degrade-besluiten rond ExitScan-nevenmetrics moeten in latere parity- of producthardeningstappen nog concreet worden doorvertaald.
- Compacte lijnen blijven kwetsbaar zolang hun bounded surveybasis niet in alle lagen even zichtbaar is.
- Gedeelde technische veldnamen kunnen zonder aliaslaag opnieuw methoddrift introduceren.

## Beslissingen / canonvoorstellen

- De method gate is `pass with explicit bounded risks`.
- ExitScan en RetentieScan mogen door naar verdere parity- en producthardening zonder hun hoofdmetric of vaste reportarchitectuur te heropenen.
- Follow-on lijnen mogen alleen door als bounded triagemodellen met expliciete compactheid en suppressiegrenzen.

## Concrete wijzigingen

- Bestand ververst: [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md)

## Buyer-facing method claimladder

| Product | Buyer-facing wel | Buyer-facing niet |
| --- | --- | --- |
| ExitScan | vertrekduiding op groepsniveau, werkfactorprioritering, bestuurlijke leeslijn, eerdere signalering als context | diagnose, causale zekerheid, objectieve vermijdbaarheid, voorspelling van actief vertrek |
| RetentieScan | vroegsignalering op behoud, verificatiehulp, prioritering op groeps- en segmentniveau, samen lezen van retentiesignaal en aanvullende signalen | predictorclaim, persoonsgericht risico, effectbewijs uit herhaalmeting, interventiebewijs |
| TeamScan | bounded lokalisatie, eerste verificatie, department-first managementread | brede teamdiagnose, manager ranking, oorzaakbewijs |
| Onboarding 30-60-90 | single-checkpoint duiding, eerste handoff, beperkte correctiestap | journey-engine, retentievoorspeller, individuele onboardingbeoordeling |
| Pulse | bounded reviewmoment, compacte koerscorrectie, beperkte vergelijking | trendmachine, effectbewijs, brede diagnose |
| Leadership Scan | geaggregeerde managementcontextread, eerste duiding, bounded handoff | named leader oordeel, 360-claim, hierarchy model |

## Validatie

- Surveybasis, afleidingsketen en methodrisico's zijn expliciet repo-gebaseerd vastgelegd.
- De signoff verandert geen pricing, productstatus of commerciele shell.
- De vaste ExitScan-report-architectuur blijft onaangetast.

## Assumptions / defaults

- `Pass with explicit bounded risks` betekent dat vervolgwerk mag starten, maar dat bounded claims en suppressieregels actief bewaakt moeten blijven.
- Buyer-facing claimgrenzen volgen product truth en methodbasis; marketing convenience mag die niet verruimen.

## Next gate

Field semantics and code alias hardening.
