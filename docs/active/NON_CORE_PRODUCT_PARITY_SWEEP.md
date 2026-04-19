# Non-Core Product Parity Sweep

## Titel

`Non-core product parity sweep`

## Korte samenvatting

De non-core productlijnen zijn opnieuw getoetst op bounded taal, claimsgrenzen en parity met de huidige canon. De grootste resterende drift zat in `Pulse` en in enkele lifecycle- en follow-on formuleringen die nog `diagnose`-taal gebruikten.

## Wat is geaudit

- `frontend/lib/products/team/definition.ts`
- `frontend/lib/products/onboarding/definition.ts`
- `frontend/lib/products/pulse/definition.ts`
- `frontend/lib/products/leadership/definition.ts`
- `frontend/lib/marketing-products.ts`
- `frontend/lib/client-onboarding.ts`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`

## Belangrijkste bevindingen

- `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` waren productmatig al grotendeels bounded en truth-first.
- `Pulse` droeg nog resten van oudere `diagnose`-taal in methodiek- en vervolgroutes.
- De lifecycle helperlaag gebruikte op meerdere plekken nog `diagnose` als terugvalwoord voor verbreding, terwijl de actuele canon eerder spreekt over `duiding` en begrensde managementvragen.

## Belangrijkste inconsistenties of risico’s

- `diagnose`-taal in follow-on routes suggereert een methodische hardheid die deze non-core producten niet moeten claimen.
- `delta-uitleg` bij `Pulse` klonk harder dan de huidige bounded vergelijkingslogica draagt.
- Zonder fix kunnen buyer-facing, onboarding- en dashboardlagen opnieuw uit elkaar gaan lopen.

## Beslissingen / canonvoorstellen

- Voor non-core verbreding gebruiken we `bredere duiding` in plaats van `diagnose`.
- `Pulse` blijft een bounded reviewroute met begrensde vergelijkingsduiding, geen diagnostic layer.
- `TeamScan` blijft een lokalisatieroute die eindigt in een lokale managementbespreking, niet in causaliteits- of diagnosetaal.

## Concrete wijzigingen

- `frontend/lib/products/pulse/definition.ts`
- `frontend/lib/client-onboarding.ts`
- `frontend/lib/marketing-products.ts`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/lib/client-onboarding.test.ts`
- `frontend/lib/marketing-positioning.test.ts`

## Validatie

- Gerichte frontend-tests op marketing- en onboardingparity.
- Geen wijziging aan ExitScan-architectuur of productstatuslabels.

## Assumptions / defaults

- `managementread` kan intern nog voorkomen, zolang de bounded betekenis en managementlaag gelijk blijven aan de canon.
- `bounded` blijft hier een intern en buyer-facing begrenzingswoord, geen statuspromotie.

## Next gate

`RetentieScan dashboard/report parity check`
