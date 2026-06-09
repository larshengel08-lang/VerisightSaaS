# Loep Internal Rebrand Program Plan

## Doel

Deze spec beschrijft hoe de interne rebrand van `Verisight` naar `Loep` volledig en veilig wordt uitgevoerd, nu de externe website al op `Loep` staat.

De scope van dit document is bewust intern en operationeel:

- app- en productcopy
- interne merkassets
- e-mail- en rapportuitvoer
- templates, demo- en samplebestanden
- actieve documentatie
- tests en fixtures
- configuratie en domeinverwijzingen
- admin- en policy-identifiers waar relevant

Dit document is geen oproep tot een blinde globale rename. De kernregel is:

`alles wat user-facing, operator-facing of operationeel zichtbaar is moet naar Loep; diepe technische identifiers migreren alleen als dat veilig en zinvol is.`

## Huidige situatie

De publieke website is al gerebrand naar `Loep`, maar de codebase bevat nog veel interne `Verisight`-verwijzingen in:

- backend titels, rapportlabels en exportbestandsnamen
- e-mailafzenders, contactadressen en e-mailtemplates
- survey- en statuspagina's
- frontend labels, tests en marketing-supportlagen
- voorbeeldrapporten en downloadtemplates
- demo- en acceptance-fixtures
- actieve docs en operationele runbooks
- Supabase rollen, policies en helperfuncties zoals `is_verisight_admin_user()`

Deze sporen vallen niet allemaal in dezelfde risicoklasse.

## Uitgangspunten

1. `Loep` wordt de enige actieve merknaam in alle actuele user-facing en operator-facing lagen.
2. Historische archiefstukken hoeven niet volledig hernoemd te worden zolang ze duidelijk als historisch blijven.
3. Productiediepte gaat voor cosmetische volledigheid: brand-copy en operationele output eerst, DB-identifiers later of nooit.
4. Elke naamswijziging die auth, policies, migrations of data-contracten kan raken wordt bewust beoordeeld.
5. De eindtoestand moet intern consistent genoeg zijn dat een klant, operator of nieuwe teamgenoot `Verisight` niet meer als actieve merklaag tegenkomt.

## Risicobakken

### A. Direct vervangen

Laag risico, hoge zichtbaarheid, goed autonoom uitvoerbaar.

Voorbeelden:

- `Verisight API` in [backend/main.py](C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- rapportlabels `Door Verisight` en `Vertrouwelijk - Verisight` in [backend/report.py](C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) en [backend/report_design.py](C:/Users/larsh/Desktop/Business/Verisight/backend/report_design.py)
- user-facing copy in [templates](C:/Users/larsh/Desktop/Business/Verisight/templates)
- frontend labels zoals `Verisight beheer` en `owner: Verisight` in [frontend/lib](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib)
- voorbeeldbestandsnamen en templatebestanden onder [frontend/public](C:/Users/larsh/Desktop/Business/Verisight/frontend/public)
- testverwachtingen die alleen merknaam, afzendernaam of copy spiegelen
- actieve docs in [docs/active](C:/Users/larsh/Desktop/Business/Verisight/docs/active) en relevante gidsen in [docs/reference](C:/Users/larsh/Desktop/Business/Verisight/docs/reference)

### B. Vervangen na configbesluit

Middel risico. Eerst merk- en infrawaarheid vastzetten.

Voorbeelden:

- `EMAIL_FROM=Verisight <noreply@verisight.nl>` in [.env.example](C:/Users/larsh/Desktop/Business/Verisight/.env.example)
- `hallo@verisight.nl`, `privacy@verisight.nl`, `sales-demo@verisight.nl`
- canonieke hostlogica in [frontend/lib/canonical-host.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/canonical-host.ts)
- `robots.txt`, `llms.txt`, report contactblokken
- demo domeinen zoals `demo.verisight.local`
- mail-/invite-teksten die reply-to of sender identity impliceren

Deze bak vereist drie expliciete waarheden:

- primair e-maildomein
- primair webdomein
- policy voor test- en demo-domeinen

### C. Alleen migreren als er echte waarde is

Hoger technisch risico. Functioneel vaak niet nodig voor commerciële livegang.

Voorbeelden:

- `is_verisight_admin_user()` in [supabase/schema.sql](C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- profielveld `is_verisight_admin`
- persona `verisight_admin`
- policynamen `verisight_admins_can_*`
- recorded role values zoals `verisight_admin`
- lokale storage keys zoals `verisight_survey_{token}` in [templates/survey.html](C:/Users/larsh/Desktop/Business/Verisight/templates/survey.html)

Standaardadvies:

- user-facing label naar `Loep`
- technische identifier voorlopig laten staan
- pas migreren als er een echte reden is, zoals nieuwe integraties, interne verwarring of expliciete security-/data-governance winst

### D. Historisch laten staan

Geen actieve rewrite nodig tenzij een document nog operationeel gebruikt wordt.

Voorbeelden:

- archiefdocs onder [docs/archive](C:/Users/larsh/Desktop/Business/Verisight/docs/archive)
- oude exportpaden in historische plannen
- oude artifactnamen in afgeronde review- en releaseverslagen

## Inventaris per laag

### 1. Merkcopy en operationele UI

Nog zichtbaar in onder meer:

- [app.py](C:/Users/larsh/Desktop/Business/Verisight/app.py)
- [dashboard/app.py](C:/Users/larsh/Desktop/Business/Verisight/dashboard/app.py)
- [backend/main.py](C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/report.py](C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [backend/report_design.py](C:/Users/larsh/Desktop/Business/Verisight/backend/report_design.py)
- [frontend/lib/campaign-audit.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/campaign-audit.ts)
- [frontend/lib/client-onboarding.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- [frontend/lib/dashboard/dashboard-shell-config.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/dashboard/dashboard-shell-config.ts)
- [frontend/lib/launch-controls.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/launch-controls.ts)

Aanpak:

- merknaam en ownerlabels naar `Loep`
- `Verisight beheer` naar `Loep beheer`
- rapport- en e-mailteksten herschrijven

Risico: laag.

### 2. Assets en bestandsnamen

Huidige merkbestanden:

- [frontend/public/verisight-logo-text.svg](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/verisight-logo-text.svg)
- [frontend/public/verisight-wordmark.svg](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/verisight-wordmark.svg)
- [frontend/public/brand/verisight-pulse-logo.svg](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/brand/verisight-pulse-logo.svg)
- [frontend/public/examples/voorbeeldrapport_verisight.pdf](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/examples/voorbeeldrapport_verisight.pdf)
- [frontend/public/templates/verisight-respondenten-template.csv](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/templates/verisight-respondenten-template.csv)
- [frontend/public/templates/verisight-respondenten-template.xlsx](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/templates/verisight-respondenten-template.xlsx)

Aanpak:

- nieuwe `loep-*` assetnamen invoeren
- alle referenties omzetten
- waar nodig tijdelijk aliases laten bestaan om dode links te voorkomen

Risico: laag tot middel, afhankelijk van publieke bestandsroutes.

### 3. Domeinen, e-mail en contactadressen

Nog zichtbaar in onder meer:

- [.env.example](C:/Users/larsh/Desktop/Business/Verisight/.env.example)
- [backend/email.py](C:/Users/larsh/Desktop/Business/Verisight/backend/email.py)
- [backend/report.py](C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [frontend/lib/canonical-host.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/canonical-host.ts)
- [frontend/public/robots.txt](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/robots.txt)
- [frontend/public/llms.txt](C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt)
- demo- en seed-scripts

Nog open besluit:

- wat worden de canonieke `Loep` adressen en domeinen?

Zonder dit besluit kunnen we de merklaag niet schoon afronden.

Risico: middel.

### 4. Demo-, QA- en acceptance-identiteiten

Nog zichtbaar in onder meer:

- [demo_environment.py](C:/Users/larsh/Desktop/Business/Verisight/demo_environment.py)
- [manage_demo_environment.py](C:/Users/larsh/Desktop/Business/Verisight/manage_demo_environment.py)
- [seed_exit_live_test_environment.py](C:/Users/larsh/Desktop/Business/Verisight/seed_exit_live_test_environment.py)
- [seed_retention_demo_environment.py](C:/Users/larsh/Desktop/Business/Verisight/seed_retention_demo_environment.py)
- [frontend/scripts/seed-action-center-manager-pilot.mjs](C:/Users/larsh/Desktop/Business/Verisight/frontend/scripts/seed-action-center-manager-pilot.mjs)

Aanpak:

- demo-orgnamen, slugs en mailboxen naar `Loep`
- alleen na besluit over testdomein en acceptance naming

Risico: middel.

### 5. Tests

Nog veel merkverwachtingen in:

- [tests/test_api_flows.py](C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)
- [tests/test_report_generation_smoke.py](C:/Users/larsh/Desktop/Business/Verisight/tests/test_report_generation_smoke.py)
- [frontend/lib/*.test.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib)

Aanpak:

- fasegewijs laten meelopen met productiecode
- waar mogelijk alleen assertions updaten
- waar tests diepe identifiers bewaken, niet blind renamen

Risico: laag tot middel.

### 6. Database, auth en policylagen

Nog zichtbaar in:

- [supabase/schema.sql](C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- [supabase/live_hardening_patch.sql](C:/Users/larsh/Desktop/Business/Verisight/supabase/live_hardening_patch.sql)
- [migrations](C:/Users/larsh/Desktop/Business/Verisight/migrations)
- [frontend/lib/suite-access.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/suite-access.ts)
- [frontend/lib/suite-access-server.ts](C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/suite-access-server.ts)

Aanpak:

- user-facing labels onmiddellijk rebranden
- technische schema-identifiers alleen migreren na expliciet besluit

Default:

- `is_verisight_admin` en `verisight_admin` mogen tijdelijk blijven
- UI mag wel `Loep beheer` tonen

Risico: hoog.

## Aanbevolen fasering

### Fase 0. Merkcanon vastzetten

Eerst expliciet vastleggen:

- merknaam: `Loep`
- primaire domeinnaam
- primaire afzenderadressen
- privacy/contact/sales mailboxen
- rapportprefix
- template-bestandsnamen
- test- en demo-domeinstrategie

Output:

- korte brand-config spec als interne waarheid

### Fase 1. Veilige user-facing en operator-facing sweep

Doel:

- alle actuele interne zichtlagen naar `Loep`

In scope:

- backend titles
- rapportlabeling
- templates en e-mails
- frontend labels
- actieve docs
- voorbeeldbestandsnamen
- tests die direct mee moeten

Geen scope:

- DB policy/function renames

### Fase 2. Config-, domein- en fixturelaag

Doel:

- alle operationele adressen, hosts, demo-orgs en acceptance-identiteiten corrigeren

In scope:

- env defaults
- canonical host logic
- robots/llms/supporting SEO artifacts
- demo/seed scripts
- QA mailboxen en domains

### Fase 3. Diepe technische renamebeslissing

Beslis pas dan:

- houden we `is_verisight_admin` technisch in stand?
- of voeren we een echte DB/app-migratie naar `is_loep_admin` en `loep_admin` uit?

Deze fase is optioneel.

## Wat Codex autonoom kan oppakken

### Direct autonoom

- volledige inventory onderhouden
- fase-1 sweep uitvoeren
- relevante actieve docs en tests aanpassen
- assets en bestandsreferenties hernoemen waar geen extern risico aan hangt
- acceptance checklist voor rebrand opstellen

### Autonoom na korte bevestiging

- nieuwe canonical filenames voor templates en voorbeeldrapporten
- exacte wording voor `Loep beheer`, `Loep Ops`, `Loep delivery`
- welke actieve docs mee moeten en welke historisch mogen blijven

### Alleen na expliciet besluit

- e-maildomeinwisseling
- canonical host switch
- demo/test domain switch
- deep DB / policy / role migration

## Definition of done

De interne rebrand is pas echt klaar als:

- actuele app- en rapportuitvoer nergens meer actief `Verisight` toont
- mailtemplates, surveytemplates en statuspagina's `Loep` tonen
- voorbeeldrapporten, downloadtemplates en assetnamen op `Loep` zijn afgestemd
- actieve docs en operationele gidsen `Loep` als canonieke merknaam gebruiken
- tests slagen met de nieuwe merklaag
- open technische `Verisight` identifiers alleen nog in bewust behouden diepte-lagen zitten
- er een expliciete beslissing is genomen over e-mail-, host- en demo-domeinen

## Eerste aanbevolen vervolgstap

Begin met een gecontroleerde fase-1 implementatiesweep:

1. merkcopy en output
2. actieve docs
3. assets en voorbeeldbestanden
4. testverwachtingen

Daarna pas:

5. config en domeinen
6. diepe schema-/policybeslissingen
