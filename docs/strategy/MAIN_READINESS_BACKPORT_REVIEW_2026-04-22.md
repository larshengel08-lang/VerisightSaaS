# MAIN_READINESS_BACKPORT_REVIEW_2026-04-22

Last updated: 2026-04-22  
Status: active  
Source of truth: `origin/main`, `origin/codex/suite-hardening-parity-normalization` en de suite-integratietranches tot en met `eca1ae2`.

## Titel

Main-readiness en backportreview na suite-hardening en non-core closeout

## Korte samenvatting

De suitebranch is inhoudelijk de werkende canon, maar is nog niet rijp voor een directe promotie naar `main`. De afstand tussen beide lijnen is te groot en te gemengd: `main` heeft nog 9 eigen commits, de suitebranch 58. Het verschil is dus niet alleen "main loopt achter", maar "beide lijnen hebben verschillende waarheden die eerst expliciet moeten worden verzoend".

De suitebranch bevat inmiddels:

- shared grammar / indicator freeze
- 5-closeouts en governance-signoffs
- non-core normalisatie
- shellcorrecties voor Onboarding, Leadership en Pulse
- Pulse-PDF-openstelling
- repo-native portfolio-status

`main` bevat daarentegen nog productie- en domeinfixes die niet zichtbaar op de suitebranch zijn teruggekomen, waaronder de apex-naar-www redirect en extra `NEXT_DIST_DIR`-logica.

## Scope van het verschil

Vergelijking `origin/main..origin/codex/suite-hardening-parity-normalization`:

- 140 bestanden anders
- 15.709 insertions
- 6.619 deletions

Verdeling op hoofdlagen:

- `docs/active`, `docs/reporting`, `docs/strategy`: grote canon- en audittrail-uitbreiding
- `backend/`: report-runtime, non-core productoutput, shared grammar en Pulse-PDF
- `frontend/app/producten`, `frontend/lib/products`, `frontend/app/(dashboard)/campaigns/[id]`: shell-, dashboard- en rapportlanding
- `frontend/tests/e2e` en `tests/`: regressie- en paritylaag
- `frontend/middleware.ts`, `frontend/next.config.ts`, `frontend/package*.json`: productie-/routinglaag

Conclusie: dit is geen smalle documentdelta en ook geen smalle frontenddelta. Het is een gemengde integratie van canon, runtime, UI, regressies en deploymentgedrag.

## Wat al veilig in de suite-canon zit

De suitebranch is nu de beste bron voor:

- productrollen en managementvragen
- de shared grammar-freeze
- de 5-closeouts
- de non-core shell- en boundedheidscorrecties
- de opening van Pulse als bounded PDF-route
- de actuele repo-native portfolio-status

Daarmee is de vraag niet meer of deze inhoud bestaat, maar of deze inhoud al goed genoeg is verzoend met de `main`-specifieke deploy- en routinglaag.

## Wat main nog eigenstandig bevat

De 9 `main`-eigen commits vallen in drie blokken:

### 1. Domein- en redirectgedrag

`main` bevat nog een expliciete apex-naar-www canonical redirect in:

- `frontend/middleware.ts`
- plus de helperlaag `frontend/lib/canonical-host.ts`

Die logica staat niet zichtbaar in de suitebranch. Dat is een echte integratierisico, geen cosmetisch verschil.

### 2. Productiebuild- en distdir-logica

`main` bevat extra `NEXT_DIST_DIR`- en CI/Vercel-logica in:

- `frontend/next.config.ts`
- `frontend/package.json`
- `frontend/package-lock.json`

Ook dit staat niet zichtbaar in de suitebranch. Daardoor is niet bewezen dat de suitebranch zonder aparte verzoening exact dezelfde productiebouw- en deployeigenschappen behoudt als `main`.

### 3. Homepage-/previewstroom

`main` bevat eigen homepage- en previewfixes die deels ouder lijken dan de suite-redesign, maar nog wel tot de hoofdcanon behoren:

- homepage shell
- preview/export fixes
- lokale preview stabilisatie

Deze laag kan deels al inhoudelijk zijn ingehaald door de suite, maar is nog niet expliciet als "superseded" of "overgenomen" afgetekend.

## Waarom een directe promotie naar main nu onzuiver is

Een directe merge of backport naar `main` zou nu drie risico's stapelen:

### 1. Canon zonder runtime-verzoening

Dan krijgt `main` wel nieuwe productwaarheid, maar zonder expliciet besluit over de nog open deploy- en redirectverschillen.

### 2. Runtime zonder regressiekader

Dan trek je mogelijk grote rapport- en shellwijzigingen naar `main` zonder eerst vast te leggen welke `main`-eigen gedragspunten behouden moeten blijven.

### 3. Valse "klaar voor main"-conclusie

Dat zou onterecht suggereren dat de suitebranch al volledig production-equivalent is, terwijl de main-only hotfixlaag nog niet is gereconcilieerd.

## Wat wel veilig als conclusie geldt

De volgende uitspraak is nu wél verantwoord:

- de werkende product- en rapportcanon leeft op de suitebranch
- er staan geen bekende besliskritische 5-closeout-, shared-grammar- of non-core audittrail-artefacten meer alleen in losse worktrees
- de voornaamste resterende barrière naar `main` zit nu in deploy-, redirect- en hoofdrouteverzoening, niet in ontbrekende productinhoud

## Backport-oordeel per soort wijziging

### Docs-only backport

Niet als eerste stap aanbevolen.

Reden:

- veel nieuwe docs beschrijven runtime- en shellwaarheid die nog niet op `main` leeft
- docs alleen terugzetten zou `main` semantisch moderner maken dan zijn codebasis

### Runtime- en UI-backport

Nog niet smal genoeg.

Reden:

- de suitebranch bevat te veel gekoppelde wijzigingen in backend reportlogic, frontend shell en tests om nu veilig als losse cherry-picks naar `main` te trekken

### Main-fixes naar suite trekken

Dit is de eerstvolgende logische verzoeningsrichting.

Reden:

- de suitebranch is inhoudelijk de werkende canon
- `main` bevat een kleine maar kritische set productie-/routingfixes
- die set moet eerst in de suitebranch expliciet worden beoordeeld en waar nodig worden overgenomen of bewust vervangen

## Concrete blockerlijst voor echte main-readiness

Voordat een suite-naar-main PR zuiver wordt, moeten minimaal deze punten expliciet worden afgehandeld:

1. `frontend/middleware.ts`
   Bepalen of de apex-naar-www redirect uit `main` in de suite moet terugkomen.

2. `frontend/lib/canonical-host.ts`
   Bepalen of deze helper nog nodig is of inhoudelijk is vervangen.

3. `frontend/next.config.ts`
   Bepalen of de `NEXT_DIST_DIR`-logica uit `main` behouden moet blijven in de suite.

4. `frontend/package.json` en `frontend/package-lock.json`
   Controleren of production build scripts uit `main` nog ontbreken in de suite.

5. Homepage-/previewlaag
   Expliciet vastleggen of de `main`-eigen homepage- en previewfixes volledig door de suite zijn ingehaald of nog deels terug moeten.

## Oordeel

`main` is nog niet klaar voor een directe promotie van de suitebranch.

De juiste interpretatie is:

- productinhoud: grotendeels klaar
- audittrail: geconsolideerd
- main-readiness: nog geblokkeerd door een kleine maar kritische productielaag die alleen op `main` zichtbaar is

## Aanbevolen volgende stap

Open een aparte `main-reconciliation`-werkstroom die niet opnieuw aan productinhoud werkt, maar uitsluitend deze vraag beantwoordt:

`welke main-only productie-, redirect- en homepagefixes moeten expliciet terug naar de suitebranch voordat een suite-naar-main promotie zuiver wordt?`

Pas nadat die verzoening groen is, is een gecontroleerde suite-naar-main PR bestuurlijk en technisch verantwoord.
