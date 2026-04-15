# Verisight Product Terminology And Taxonomy

Intern referentiedocument voor website, dashboard, rapport, survey, pricing, sales en preview-copy.
Laatste update: 2026-04-15

## Doel

Dit document legt de canonieke producttaal van Verisight vast.
Gebruik het als eerste referentie voor:

- buyer-facing productcopy
- dashboardlabels
- report- en previewtaal
- survey- en invitecopy
- pricing- en routecopy
- salesverhaal en demo-uitleg
- parityreviews en regressietests

## Kernprincipes

- ExitScan blijft de primaire entreepropositie.
- RetentieScan blijft complementair en verification-first.
- Combinatie is een portfolioroute, geen derde kernproduct met gelijkwaardige terminologische zwaarte.
- Dezelfde term moet over site, dashboard, rapport, survey en sales hetzelfde betekenen.
- Claims mogen commercieel scherp zijn, maar nooit semantisch harder dan de methodiek en trustlaag dragen.

## Portfolio Terms

### Verisight

- Gebruik voor het platform, de begeleide productvorm en de portfolio-laag.
- Niet gebruiken alsof Verisight een brede people-suite of generieke surveytool is.

### ExitScan

- Primaire entreepropositie.
- Productnaam voor terugkijkende vertrekduiding op groepsniveau.
- Default eerste route in buyer-facing copy en demo's, tenzij de vraag expliciet over actieve medewerkers gaat.

### RetentieScan

- Complementair product.
- Productnaam voor vroegsignalering op behoud op groeps- en segmentniveau.
- Alleen primaire route wanneer de buyer-vraag expliciet gaat over actieve medewerkers, behoudsdruk of periodieke opvolging.

### Combinatie

- Buyer-facing portfolioroute voor organisaties met beide managementvragen.
- Niet verkopen als bundelvariant, feature-upgrade of derde peer-product.

## Route Terms

### ExitScan route

- Primair: `vertrekduiding`
- Ondersteunend: `terugkijkend`, `vertrekbeeld`, `patroonbeeld op uitstroom`
- Vermijden als hoofdterm: `exit-analyse`, `diagnose`, `voorspelling`

### RetentieScan route

- Primair: `vroegsignalering op behoud`
- Ondersteunend: `behoud onder druk`, `behoudsdruk`, `verification-first`
- Vermijden als hoofdterm: `behoudsscan` zonder productnaam, `MTO-light`, `predictor`, `risicomodel`

## Score And Signal Terms

### ExitScan

- Primaire metric: `frictiescore`
- Primaire samenvattende duiding: `vertrekduiding`
- Ondersteunende signaallaag: `signalen van werkfrictie`
- Aanvullende context: `vertrekredenen`, `meespelende factoren`, `eerdere signalering`

Buyer-facing voorkeursvolgorde:

1. `frictiescore`
2. `vertrekduiding`
3. `signalen van werkfrictie`

Buyer-facing vermijden:

- `werksignaal` als los hoofdetiket
- `preventability`
- `diagnose`
- `causale verklaring`

### RetentieScan

- Primaire metric: `retentiesignaal`
- Primaire samenvattende duiding: `vroegsignalering op behoud`
- Aanvullende signalen: `stay-intent`, `vertrekintentie`, `bevlogenheid`
- Ondersteunende managementtaal: `behoud onder druk`, `behoudsdruk`, `eerste verificatiespoor`

Buyer-facing voorkeursvolgorde:

1. `retentiesignaal`
2. `vroegsignalering op behoud`
3. `aanvullende signalen rond behoud`

Buyer-facing vermijden:

- `behoudssignaal` als primaire metric
- `retentiesignalen` als vervanging van het product of de hoofdmetric
- `predictor`
- `risicoprofiel`
- `performance-instrument`

## Output Terms

Deze termen zijn platformbreed vast en mogen niet per laag hernoemd worden:

- `managementsamenvatting`
- `bestuurlijke handoff`
- `eerste besluit`
- `eerste eigenaar`
- `eerste stap`

Productspecifieke invulling mag verschillen, maar de basisnaam niet.

## Retentie Versus Behoud

- `Retentie` is primair de product- en systeemterm.
- `Behoud` is primair de domein- en managementtaal daaromheen.
- Gebruik daarom:
  - `RetentieScan`
  - `retentiesignaal`
  - `vroegsignalering op behoud`
  - `behoud onder druk`
- Gebruik liever niet:
  - `behoudssignaal` als metric
  - `behoudssignalering` als hoofdnaam voor het product

## Internal-Only Or Technical Terms

Deze termen mogen technisch of intern blijven, maar horen niet buyer-facing zonder expliciete vertaling:

- `preventability`
- `STERK_WERKSIGNAAL`
- `GEMENGD_WERKSIGNAAL`
- `BEPERKT_WERKSIGNAAL`
- enum- en helpernamen uit scoring of persistence
- wire- of schema-id's

## Buyer-Facing Terms To Avoid

- `diagnose`
- `predictor`
- `risicomodel`
- `risicoprofiel`
- `black-box`
- `MTO-light`
- `people-suite`
- `performance-instrument`
- `selectietool`

## Implementation Defaults

- ExitScan opent buyer-facing standaard eerst.
- RetentieScan gebruikt `retentiesignaal` als metric en `behoud` als managementcontext.
- ExitScan gebruikt `frictiescore` als metric en `signalen van werkfrictie` als duidende signaallaag.
- Combinatie blijft een routekeuze binnen een portfolio, geen losse derde producttaxonomie.
- Nieuwe copy of output moet eerst tegen dit document worden gehouden en pas daarna tegen stijlvoorkeuren.
