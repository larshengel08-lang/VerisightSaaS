# Hardening And Commercial Guardrails

## Titel

Customer Expansion Hardening Signoff

## Korte samenvatting

De engine is gehard op de punten die in deze tranche het meeste commercieel risico gaven: te vroeg suggereren, bounded routes te groot laten voelen en dezelfde UI zonder guardrailtekst laten terugvallen op impliciete upsell. De huidige uitwerking is daarmee bruikbaar als interne operator-supportlaag.

## Wat is gebouwd

- readiness-blokkade voor first management use
- suppressieve routecatalogus
- prioritering van `RetentieScan ritme` binnen retention
- guardrailtekst per routekaart
- quick-apply alleen voor niet-gesuppresste routes

## Belangrijkste bevindingen

- De engine kiest in twijfelgevallen liever voor `te overwegen` of `nu niet` dan voor een harde vervolgpitch.
- De workbench maakt de suggester direct bruikbaar in operatorflow zonder persistence-uitbreiding.
- De dashboardkaart maakt dezelfde logica zichtbaar waar delivery de route na first management use bespreekt.

## Belangrijkste risico's

- Volledige end-to-end buildvalidatie blijft lokaal beperkt door ontbrekende Supabase envs.
- Cross-core routewissels blijven bewust buiten scope; dat is veilig, maar laat nog handmatig werk over.

## Beslissingen / canonvoorstellen

- Huidige hardening is voldoende voor een MVP in een build-thread.
- Verdere hardening hoort pas in beeld te komen als er behoefte ontstaat aan persistente decision logging of strengere admin-validatie op `next_route`.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: `docs/active/CUSTOMER_EXPANSION_HARDENING_SIGNOFF.md`

## Validatie

- Gerichte vitest-suite geslaagd
- Gerichte lint geslaagd
- Build compileert, maar stopt later op ontbrekende projectenvs voor Supabase-prerendering

## Assumptions / defaults

- Deze signoff beoordeelt de feature op operator- en producttruthgeschiktheid, niet op live deployment readiness zonder env-config.

## Next gate

Final Validation: toetsen of de suggester commercieel bruikbaar en productmatig verantwoord voelt binnen de huidige Verisight-realiteit.
