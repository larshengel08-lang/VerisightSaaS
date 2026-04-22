# PORTFOLIO_CANON_STATUS_2026-04-22

Last updated: 2026-04-22  
Status: active  
Source of truth: suite-hardening parity branch, shared grammar freeze, 5-closeouts, non-core normalisatie en externe synclaag.

## Titel

Portfolio canon en external sync-status

## Korte samenvatting

De werkende portfolio-canon leeft per 2026-04-22 op `codex/suite-hardening-parity-normalization` en nog niet op `main`. De suitebranch bevat inmiddels de shared grammar-freeze, de product-specifieke 5-closeouts, de non-core normalisatie en de opening van Pulse-PDF.

Belangrijke nuance:

- niet alles wat nog buiten `main` staat, staat ook buiten de repo
- de meeste actuele waarheid zit al in de repo, maar op de suitebranch
- de externe Excel- en PDF-laag blijft bewust buiten de repo, zolang de canonieke samenvatting en besluitlogica in-repo bestaan

## Canonlagen

### 1. Werkende repo-canon

De actuele werkende canon staat op:

- `origin/codex/suite-hardening-parity-normalization`

Deze branch is nu leidend voor:

- shared grammar / indicator freeze
- ExitScan-, RetentieScan-, Onboarding-, Pulse- en Leadership-closeouts
- non-core report normalisatie
- shellcorrecties voor Onboarding, Leadership en Pulse
- Pulse-PDF-openstelling

### 2. Hoofdcanon

`origin/main` is nog niet bijgewerkt naar deze suite-stand en is daarom nog niet de beste bron voor actuele portfolio-, shell- en reportwaarheid.

### 3. Externe synclaag

De volgende artefacten leven bewust buiten de repo als referentie- of assetlaag:

- [Verisight_Portfolio_Kwaliteit_En_Parity_Overzicht_2026-04-21.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/01_Strategie_En_Planning/Verisight_Portfolio_Kwaliteit_En_Parity_Overzicht_2026-04-21.xlsx)
- voorbeeldrapporten in [Voorbeeldrapporten_2026-04-22](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/01_Strategie_En_Planning/Voorbeeldrapporten_2026-04-22)

Deze externe laag is alleen houdbaar zolang de samenvatting, classificatie en beslislogica in de repo zelf aanwezig zijn.

## Huidige productstatus

| Product | Productrol | Huidige canonstatus |
| --- | --- | --- |
| ExitScan | peer product | inhoudelijk volwassen referentieroute, formele 5-closeout en gap-analyse in repo |
| RetentieScan | peer product | volwassen kernroute, met expliciete 5-gate en evidence-vraag in repo |
| Onboarding 30-60-90 | bounded peer product | 5-readiness signoff en shellcorrectie in repo |
| Pulse | bounded support route | bounded 5-closeout, shellcorrectie en PDF-openstelling in suite-canon |
| Leadership Scan | bounded support route | governance-signoff en shellcorrectie in repo |
| Combinatie | portfolioroute | geen zelfstandig meetproduct; route- en keuze-artefact |
| TeamScan | geen actief portfolio-item | alleen nog historische referentie, geen actieve canonlaag |

## Wat buiten de repo blijft

De volgende zaken hoeven niet als bronbestand in de repo te staan:

- de externe Excel-workbook voor portfolio-overzicht
- gegenereerde voorbeeld-PDF's voor fictieve respondenten
- oude externe blokkernotities als zij door de suitecanon zijn ingehaald

Voorwaarde is wel:

- de repo bevat een actuele tekstuele canonstatus
- de repo maakt expliciet wat extern slechts referentie of sample-evidence is
- de repo laat geen besliskritische waarheid alleen in externe bestanden leven

## Wat nu bewust in de repo is vastgezet

Met deze tranche zijn nu ook de laatste losse audittrail-artefacten opgenomen:

- [EXITSCAN_5_NIVEAU_GAP_ANALYSE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/EXITSCAN_5_NIVEAU_GAP_ANALYSE.md)
- [ONBOARDING_SHELL_CORRECTION_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ONBOARDING_SHELL_CORRECTION_REVIEW.md)
- [pulse-page-shell.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/pulse-page-shell.test.ts)

Daarmee blijven er geen bekende besliskritische non-core shell- of ExitScan-closeoutartefacten meer alleen in losse worktrees hangen.

## Wat nog niet op main staat

`main` loopt nog substantieel achter op de suitebranch. Daardoor vallen onder meer deze canonlagen nog buiten de hoofdcanon:

- shared grammar / indicator freeze
- non-core normalisatie
- Pulse-PDF-openstelling
- diverse 5-closeouts en governance-signoffs
- de nieuwe repo-native portfolio-status

Dat betekent:

- de repo als geheel bevat de waarheid wel
- maar `main` is nog niet de juiste branch om die waarheid volledig uit af te lezen

## Oordeel

De actuele portfolio- en productwaarheid staat niet meer verspreid over losse worktrees, maar is nu geconsolideerd in de suite-canon. De belangrijkste zaken die nog buiten de repo leven, zijn bewust externe sync-artefacten en geen ontbrekende kernbesluiten.

De volgende echte governancebeslissing is daarom niet meer "wat moet nog vanuit worktrees in de repo?", maar:

- wanneer en hoe promoveert de suite-canon gecontroleerd naar `main`?

## Aanbevolen volgende stap

Gebruik `codex/suite-hardening-parity-normalization` voorlopig als werkende canonbranch en open pas daarna een aparte main-readiness of backport-ronde. Behandel de externe Excel en voorbeeld-PDF's als referentie- en assetlaag, niet als concurrerende bron van waarheid.
