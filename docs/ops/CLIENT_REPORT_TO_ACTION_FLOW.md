# CLIENT_REPORT_TO_ACTION_FLOW

Last updated: 2026-04-18  
Status: active  
Source of truth: report-to-action program plan, shared report grammar and client onboarding flow system.

## Titel

Commercial Architecture And Onboarding Flow Refinement - Client report-to-action flow

## Korte samenvatting

Deze flow maakt de stap van rapport en dashboard naar eerste managementgebruik expliciet. De kern is dat Verisight-output eindigt in een eerste eigenaar, eerste actie en reviewmoment, niet in losse interpretatie.

## Wat is geaudit

- [REPORT_TO_ACTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)

## Belangrijkste bevindingen

- De contractlaag voor `eerste managementsessie`, `eerste eigenaar`, `eerste actie` en `reviewmoment` is al inhoudelijk verankerd.
- Het resterende risico zat vooral in operationele overdraagbaarheid: operators moesten die route nog uit meerdere documenten reconstrueren.
- ExitScan en RetentieScan volgen dezelfde managementflow, maar beschermen verschillende inhoudelijke producten: vertrekduiding versus verificatie en behoudsinterventie.

## Belangrijkste inconsistenties of risico's

- Zonder expliciete flow kan een managementgesprek blijven hangen in interpretatie zonder eigenaar of toetsbare stap.
- Een te harde advieslezing zou de methodische grens overschrijden; rapport blijft managementinput, geen oorzaaksbewijs.

## Beslissingen / canonvoorstellen

- De canonieke volgorde is: wat speelt nu -> waarom telt dit -> wat eerst doen -> wie is eerste eigenaar -> welke eerste stap telt -> wanneer reviewen we opnieuw.
- De eerste actie moet klein, toetsbaar en eigenaar-gebonden zijn.
- `Report to action` blijft productspecifiek in inhoud, maar gedeeld in managementflow.
- Reviewmoment hoort standaard bij de eerste actie, niet als optionele nagedachte.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [CLIENT_REPORT_TO_ACTION_FLOW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_REPORT_TO_ACTION_FLOW.md)

## Flow

1. Bevestig dat dashboard en/of rapport bruikbaar zijn.
2. Lees eerst de managementsamenvatting en bestuurlijke handoff.
3. Kies de eerste prioriteit of eerste verificatiespoor.
4. Bepaal wie als eerste eigenaar optreedt.
5. Definieer de eerste kleine, toetsbare stap.
6. Leg reviewmoment en verwachte terugkoppeling vast.
7. Beslis pas daarna of verdieping, vervolgmeting of bounded vervolgroutes logisch zijn.

## Acceptance

- Er is een eerste managementgesprek gevoerd.
- Eerste eigenaar, eerste actie en reviewmoment zijn expliciet.
- Verdere uitbreiding volgt uit een gekozen managementroute en niet uit losse productpush.

## Validatie

- De flow sluit aan op de bestaande report-to-action contractlaag in rapport, dashboard en onboarding.
- De flow verandert de vaste ExitScan-report-architectuur niet en gebruikt die alleen als boundary.

## Assumptions / defaults

- `ExitScan` stuurt primair naar vertrekduiding, bestuurlijke prioritering en eerste verbeteractie.
- `RetentieScan` stuurt primair naar verificatiespoor, eerste interventie en reviewmoment.
- Een rapport mag richting geven, maar blijft geen harde causale diagnose.

## Next gate

Commercial and onboarding signoff vastleggen op samenhang, guardrails en buyer-facing begrenzing.
