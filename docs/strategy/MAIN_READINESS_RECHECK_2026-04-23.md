# MAIN_READINESS_RECHECK_2026-04-23

Last updated: 2026-04-23  
Status: active  
Source of truth: `origin/main`, `origin/codex/suite-hardening-parity-normalization`, de reconcile-, commercial- en delivery-landingen tot en met `d854419`.

## Titel

Main-readiness herbeoordeling na suite-finalisatie en lokale root-cleanup

## Korte samenvatting

De suitebranch is nu inhoudelijk completer en technisch schoner dan in de review van 2026-04-22. Sindsdien zijn drie belangrijke dingen gebeurd:

- de `main`-reconcilefixes zijn geland op de suitebranch
- de commerciële guardrails zijn geland op de suitebranch
- de delivery operating discipline is geland op de suitebranch

Daarnaast is de lokale root-worktree op `codex/suite-hardening-parity-normalization` opgeschoond en nu weer een schone lokale spiegel van de remote suitebranch. Daarmee is de eerdere blokkade rond een vuile lokale suite-root opgelost.

De conclusie verandert daarmee wel van aard, maar nog niet naar een directe promotie naar `main`:

- de primaire blokkade is niet meer een ontbrekende reconcile-laag
- de primaire blokkade is nu de **breedte van de suitepromotie zelf**

## Wat sinds de vorige review is opgelost

Ten opzichte van de review van 2026-04-22 zijn nu expliciet opgelost:

### 1. Main-only routing en buildfixes zijn niet langer de hoofdbarrière

De suitebranch bevat nu zelf:

- `frontend/middleware.ts`
- `frontend/lib/canonical-host.ts`
- `frontend/next.config.ts`
- bijbehorende `package.json` / `package-lock.json` wijzigingen

Daarmee is de vorige hoofdbarrière grotendeels weggenomen: de suitebranch mist niet langer zichtbaar de `main`-eigen redirect- en buildlaag.

### 2. Delivery is nu ook geland op de suitebranch

De suitebranch bevat nu ook de delivery hardening:

- expliciete operating discipline in `frontend/lib/ops-delivery.ts`
- scherpere governance en warnings in `frontend/components/dashboard/preflight-checklist.tsx`
- extra delivery regressies in `frontend/lib/ops-delivery.test.ts`

### 3. De suitebranch is opnieuw groen gecontroleerd

Op de geïntegreerde suitevariant zijn opnieuw bevestigd:

- gerichte frontend regressies op delivery, routing, commercial en non-core shellgedrag
- een succesvolle `next build` met echte frontend envs

### 4. De lokale suite-root is opgeschoond

De lokale root-worktree op `codex/suite-hardening-parity-normalization` is niet langer een vuile, overlappende reststroom.

Wat is gedaan:

- lokale tracked wijzigingen zijn eerst als patch gearchiveerd buiten de repo
- waardevolle ongetrackte docs/migrations zijn apart preserved buiten de repo
- tmp/node_modules en andere lokale cleanup-rest zijn verwijderd
- de lokale suitebranch is daarna fast-forward bijgewerkt naar `origin/codex/suite-hardening-parity-normalization`

Dat betekent dat de lokale root nu geen verborgen tegenwaarheid meer vormt.

## Huidig verschil tussen main en suite

Actuele afstand:

- `main`: 9 unieke commits
- `codex/suite-hardening-parity-normalization`: 61 unieke commits

De vraag is nu dus niet meer:

`mist de suite nog kritieke main-fixes?`

maar:

`is de suite-branch inmiddels smal en stabiel genoeg om als één gecontroleerde promotie naar main te bewegen?`

Het antwoord daarop is nog steeds: **nog niet direct**.

## Wat de 9 main-only commits nu betekenen

De 9 `main`-eigen commits zijn:

- apex/canonical redirects
- production build fixes
- homepage-/preview- en management-flow wijzigingen

De eerste twee categorieën zijn door de suite inmiddels functioneel ingehaald of expliciet gereconcilieerd.

Wat overblijft is vooral:

- een oudere homepage-/previewlijn op `main`
- een kleinere lokale management-flow geschiedenis op `main`

Die is niet meer de dominante waarheid, maar hoort nog wel expliciet te worden afgetekend als:

- ingehaald door suite
- of nog bewust terug te halen

## Waarom directe promotie naar main nog steeds niet zuiver is

De reden is nu niet meer "suite mist kritieke productiegedrag".

De reden is nu:

### 1. De suitepromotie is nog steeds groot en gemengd

De suitebranch bevat tegelijk:

- report-runtime uitbreiding
- non-core shellnormalisatie
- 5-closeouts en governance
- buyer-facing productversterking
- delivery-hardening
- routing/buildverzoening
- veel docs, regressies en frontend-oppervlakken

Dat is nog steeds geen smalle promotie.

### 2. Main heeft nog een eigen oudere marketing-/homepage-lijn

Hoewel die lijn waarschijnlijk grotendeels is ingehaald, is nog niet expliciet per relevant oppervlak vastgelegd:

- welke `main`-eigen homepage/preview-wijzigingen echt nog tellen
- welke al functioneel door de suite zijn vervangen

### 3. Er is nog geen gecontroleerde suite-to-main promotiesnede gekozen

Zonder zo'n snede blijft een directe PR naar `main` te veel tegelijk meenemen.

## Huidig oordeel

De suitebranch is nu:

- de werkende canon
- technisch schoner
- beter geverifieerd
- lokaal en remote weer aligned

Maar:

- nog niet rijp voor een blinde of directe promotie naar `main`

De resterende vraag is nu geen producttruth- of reconcilevraag meer, maar een **promotiescope-vraag**.

## Aanbevolen volgende stap

Open geen nieuwe brede implementatiewave, maar een smalle `suite-to-main promotion slice review`.

Die review moet expliciet bepalen:

1. welke delen van de suitebranch nu echt promotierijp zijn
2. welke homepage-/preview- of marketinglijn op `main` nog apart moet worden afgetekend
3. of de juiste route een directe suite-PR is, of eerst nog één promotiesnede/backport-slice

De juiste kernvraag is nu:

`welke minimale, gecontroleerde promotiescope brengt main naar de werkende suitecanon zonder een te brede tranche in één stap naar de hoofdbranch te trekken?`
