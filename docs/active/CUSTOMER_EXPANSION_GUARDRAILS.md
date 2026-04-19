# Hardening And Commercial Guardrails

## Titel

Customer Expansion Guardrails

## Korte samenvatting

De suggester is alleen bruikbaar als hij strenger is dan opportunistische saleslogica. Deze guardrails leggen vast welke remmen bewust in de engine en UI zijn ingebouwd, zodat vervolgvoorstellen pas ontstaan wanneer product, lifecycle en routecanon daarvoor klaar zijn.

## Wat is ontworpen / gebouwd

- lifecycle gate op `firstManagementUseConfirmed`
- suppressie van niet-gedragen routes
- confidence ceiling
- rationale + guardrail per suggestiekaart
- bounded quick-apply naar bestaande `next_route`

## Belangrijkste bevindingen

- De belangrijkste commerciele bescherming zit in suppressie, niet in extra copy.
- `RetentieScan ritme` verdient voorrang boven bounded alternatieven wanneer retention al de huidige route is.
- `Pulse`, `Segment Deep Dive` en `TeamScan` hebben alleen waarde als ze klein en contextgebonden blijven.

## Belangrijkste risico's

- Operators kunnen nog steeds handmatig vrije tekst invullen in `next_route`; de engine voorkomt dat niet volledig, maar maakt het juiste spoor wel explicieter.
- TeamScan blijft afhankelijk van beschikbare lokale contextsignalen; zonder die basis blijft de engine terecht conservatief.

## Beslissingen / canonvoorstellen

- Geen suggestie voor first management use.
- Geen automatische cross-core routeverschuiving.
- Geen automatische `Combinatie`, `Onboarding 30-60-90` of `Leadership Scan`.
- Geen hoge confidence voor bounded routes zonder expliciete review- of actiecontext.
- Geen Segment Deep Dive zonder dat respons en segmentgrond dat dragen.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: `docs/active/CUSTOMER_EXPANSION_GUARDRAILS.md`
- Guardrailteksten ingebed in elke suggestion card via `frontend/lib/customer-expansion-suggester.ts`

## Guardrail checklist

| Guardrail | Implementatie |
| --- | --- |
| Niet te vroeg | `firstManagementUseConfirmed` blokkeert expansionbesluit |
| Niet te breed | only v1 routecatalogus, rest suppressed |
| Niet te agressief | status `aanbevolen` / `te_overwegen` / `nu_niet` |
| Niet suite-first | geen cross-core, combinatie of parity-build auto-push |
| Niet zonder uitleg | elke kaart toont rationale + boundary |
| Niet zonder operatorcontext | workbench quick-apply blijft handmatige overname |

## Validatie

- Unit-tests dekken readiness gating, retention-prioriteit, bounded alternatieven en suppressie.
- UI toont guardrails zichtbaar in zowel dashboard als workbench.

## Assumptions / defaults

- Operatoren blijven eindverantwoordelijk voor de feitelijke handoffbeslissing.
- Vrije tekst in `next_route` blijft voorlopig bestaan om migrationscope te vermijden.

## Next gate

Hardening signoff: bevestigen dat de MVP zich commercieel gedisciplineerd gedraagt op de huidige routecanon.
