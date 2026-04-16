# CONTENT_OPERATING_SYSTEM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-16
Source of truth: dit bestand is leidend voor deze tranche.

## 1. Summary

Deze tranche maakt van de bestaande Verisight-contentlaag een expliciet repo-gestuurd operating system bovenop de al uitgevoerde product-, trust-, pricing-, sample-, SEO- en case-prooftranches.

De repo had al een verrassend sterke contentbasis via `site-content.ts`, `marketing-products.ts`, `seo-solution-pages.ts`, `sample-showcase-assets.ts`, actieve planfiles, reference docs en regressietests. Wat nog ontbrak was een expliciete systeemlaag die vastlegt:

- welke contentlagen nu canoniek bestaan
- welke repo-surfaces welke buyer-vraag mogen dragen
- welke bron leidend is bij spanning tussen routecopy, trustcopy, sample-proof en salesassets
- hoe terminologie, claims en hergebruik worden bewaakt
- welke content bewust nog niet mag opschalen

In deze tranche is daarom niet geprobeerd om nieuwe contentmachines, thought-leadershipprogramma's of extra publieke prooflagen te bouwen. In plaats daarvan is de repo uitgerust met:

- een actieve source-of-truth planfile voor content operating system governance
- een canonieke referentiedoc voor contentlagen, surface ownership, reviewvolgorde en growth-gates
- een acceptance checklist voor handmatige review en paritycontrole
- een typed content-system registry in frontend die de inhoudelijke systeemkeuzes expliciet maakt
- regressietests voor de nieuwe content-governancelaag
- prompt-governancefixes en checklist-/roadmapsluiting

Bewuste defaults:

- [x] ExitScan blijft de primaire content- en funnelwedge.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Portfolio-architectuur blijft een expliciete upstream dependency; deze tranche bouwt erop voort zonder portfolio-keuzes opnieuw te openen.
- [x] De tranche blijft repo-first: website, SEO-ingangen, sample-proof, trustcontent en sales enablement krijgen prioriteit.
- [x] Thought leadership blijft een latere reserve-laag en geen actief v1-contentprogramma.
- [x] Publieke proof blijft sample-first tot approved case-proof werkelijk bestaat.
- [x] `PROMPT_CHECKLIST.xlsx` en de gegenereerde roadmap zijn administratief bijgewerkt.

## 1A. Repo Implementation Status

Uitgevoerd in deze tranche:

- [x] `docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md` toegevoegd als actieve source of truth.
- [x] `docs/reference/CONTENT_OPERATING_SYSTEM.md` toegevoegd als canonieke content-system referentie.
- [x] `docs/reference/CONTENT_OPERATING_SYSTEM_ACCEPTANCE_CHECKLIST.md` toegevoegd als handmatige review- en acceptancechecklist.
- [x] `frontend/lib/content-operating-system.ts` toegevoegd als typed registry voor source-of-truth volgorde, contentlagen, surface ownership, reusepatronen en growth-guardrails.
- [x] `frontend/lib/content-operating-system.test.ts` toegevoegd voor regressiebescherming rond content defaults en surface-contracten.
- [x] `tests/test_content_operating_system.py` toegevoegd voor doc- en active-plan parity.
- [x] `docs/prompts/CONTENT_OPERATING_SYSTEM_PLANMODE_PROMPT.md` bijgewerkt naar de actuele `docs/active/SEO_CONVERSION_PROGRAM_PLAN.md` verwijzing.
- [x] `docs/prompts/PROMPT_CHECKLIST.xlsx` bijgewerkt.
- [x] `docs/strategy/ROADMAP.md` opnieuw gegenereerd via de bestaande syncflow zodat Phase F en de checkliststatus weer overeenkomen.

Bewust niet uitgevoerd in deze tranche:

- [ ] Geen brede refactor van `site-content.ts`.
- [ ] Geen wijziging aan bestaande buyer-facing marketingcopy of routing om deze tranche niet te vermengen met lopende user-edits.
- [ ] Geen nieuwe thought-leadership surfaces, blog, kennisbank of topical SEO-clusters.
- [ ] Geen buyer-facing case layer zonder approved case-proof.
- [ ] Geen portfolioherontwerp dat thuishoort in `PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md`.

## 2. Milestones

### Milestone 1 - Freeze The Current Content System Baseline
Dependency: none

- [x] De huidige content system baseline vastgelegd over sitecontent, SEO-ingangen, trustcontent, sample-proof, sales-assets en terminologiebronnen.
- [x] Expliciet gemaakt welke repo-artefacten nu canoniek zijn voor buyer-facing messaging, proof, funnelrouting en governance.
- [x] Expliciet gemaakt welke contentlagen al systemisch actief zijn en welke nog verspreid of impliciet bestaan.
- [x] Vastgelegd dat portfolio-architectuur een expliciete upstream dependency blijft en dat huidige ExitScan-first defaults daarop voortbouwen als operating defaults.
- [x] Vastgelegd welke contenttypen nog bewust niet actief zijn: brede thought leadership, echte buyer-facing cases, named proof en schaalcontent.

### Milestone 2 - Define The Canonical Content Architecture
Dependency: Milestone 1

- [x] Een canonieke contentarchitectuur toegevoegd met vaste lagen: route, proof, trust, conversion, sales enablement en reserved growth.
- [x] Per contentlaag intended use, audience, claim boundary, updatebron en toegestane surfaces vastgelegd.
- [x] Expliciet gemaakt welke lagen product- en funneldragend zijn en welke ondersteunend of reassurance-first blijven.
- [x] Vastgelegd welke content intern gedeeld mag blijven en welke buyer-facing scherp gescheiden moet blijven.
- [x] Een mapping toegevoegd tussen bestaande code-registries en de canonieke contentlagen.

### Milestone 3 - Rebuild Governance Around Terminology, Claims And Reuse
Dependency: Milestone 2

- [x] Een vaste governance-structuur toegevoegd voor terminologie, claimgrenzen, proofstatus en cross-channel hergebruik.
- [x] Vastgelegd welke reference docs leidend zijn voor producttaal, trustclaims, sample-proof, case-proof en salescopy.
- [x] Een vaste reviewketen vastgelegd voor nieuwe buyer-facing content.
- [x] Hergebruikspatronen vastgelegd zodat site, SEO, pricing, trust, sample en sales niet opnieuw hoeven te worden uitgevonden.
- [x] Expliciet gemaakt welke wijzigingen aanleiding moeten geven tot paritychecks, testupdates of sample-refresh.

### Milestone 4 - Organize Content By Buyer Journey And Surface Ownership
Dependency: Milestone 3

- [x] De contentlaag geordend langs routekeuze, productfit, deliverable-proof, trust/due diligence, pricing, aanpak en sales handoff.
- [x] Per repo-surface vastgelegd welke buyer-vraag primair wordt gedragen.
- [x] Expliciet gemaakt hoe solution pages, product pages en support pages elkaar aanvullen zonder parallelle verhalen te openen.
- [x] Vastgelegd welke contenttypen de homepage bewust niet moet dragen.
- [x] Ownership per contentlaag vastgelegd via docs en typed registry.

### Milestone 5 - Define The Controlled Growth Layer
Dependency: Milestone 4

- [x] Vastgelegd welke content later logisch kan groeien: approved case-proof, lifecycle-content, objection-led assets en beperkte thematic expansions.
- [x] Vastgelegd welke content juist buiten v1 blijft: brede contentmachine, hoge publicatiefrequentie en generieke kennisbank.
- [x] Een updatecadans toegevoegd voor repo-first contentlagen.
- [x] Acceptancecriteria voor een bruikbaar content operating system toegevoegd.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt en roadmap-sync uitgevoerd.

## 3. Execution Breakdown By Subsystem

### Content model and canonical sources

- [x] Een typed registry toegevoegd voor:
  - source-of-truth volgorde
  - contentlagen
  - surface ownership
  - reusepatronen
  - growth guardrails
- [x] Expliciet gemaakt dat `site-content.ts` een implementatiecontainer blijft en niet de hoogste bron.
- [x] Strategie, roadmap, checklist, taxonomy, trust, sample, case-proof en sales enablement geordend als vaste referentieketen.

### Buyer-facing website system

- [x] Home bevestigd als routekeuze + premium proof teaser + centrale kennismakingsingang.
- [x] `/producten` bevestigd als chooser-first portfolio-overview.
- [x] Productdetailpagina's bevestigd als primaire plek voor deliverable-proof en route-aware leadcapture.
- [x] `/oplossingen/*` bevestigd als compacte intent-ingangen naar bestaande productroutes.
- [x] `/tarieven` bevestigd als pricing- en packaginglaag.
- [x] `/aanpak` bevestigd als proces- en handofflaag.
- [x] `/vertrouwen` bevestigd als due-diligence en trusthub.
- [x] Per surface vastgelegd wat daar bewust niet thuishoort.

### Proof, evidence and sales alignment

- [x] Expliciet vastgelegd dat sample-output `deliverable_proof` en ondersteunend `trust_proof` blijft.
- [x] Vastgelegd dat publieke proof sample-first blijft totdat approved case-proof bestaat.
- [x] Een vaste koppeling beschreven tussen sample-output, pricing-proof, trustproof en sales-assets.
- [x] Vastgelegd dat salescontent dezelfde product-, trust- en proofcontracten consumeert als de site.
- [x] Vastgelegd dat buyer-facing content niet buiten de huidige evidence-tiering mag treden.

### Governance and content reuse

- [x] De reviewketen `strategy/portfolio -> terminology -> trust/claims -> proof/evidence -> surface fit -> parity/tests` vastgelegd.
- [x] Herbruikbare contentblokken benoemd: productkern, pricingframing, trustuitleg, sample-proof, objections en comparison snippets.
- [x] Vastgelegd welke assets nooit direct buyer-facing mogen worden hergebruikt: internal demo, learningdossiers, case-candidates en technische helpertermen.
- [x] Wijzigingstriggers voor refresh en parity vastgelegd.

### Controlled growth rules

- [x] Thought leadership expliciet begrensd als later-fase reservecontent.
- [x] Eerste latere uitbreidingen beperkt tot approved case-proof, lifecycle-content en beperkte objection-led/thematic assets.
- [x] Brede blog, kennisbank, contentkalender en distribution machine expliciet buiten scope geplaatst.
- [x] Vastgelegd dat portfolio-architectuur eerst expliciet afgestemd moet zijn voordat content naar toekomstige proposities verbreedt.

## 4. Validation Run

Uitgevoerd in deze tranche:

- [x] `npm.cmd test -- --run lib/content-operating-system.test.ts`
- [x] `python -m pytest tests/test_content_operating_system.py -q`
- [x] `npm.cmd run lint -- lib/content-operating-system.ts lib/content-operating-system.test.ts`
- [x] `npm.cmd run build`
- [x] `npm.cmd test -- --run lib/content-operating-system.test.ts lib/marketing-flow.test.ts lib/marketing-positioning.test.ts lib/seo-conversion.test.ts`
- [x] `@'
import openpyxl
from pathlib import Path

path = Path(r"C:\Users\larsh\Desktop\Business\Verisight\docs\prompts\PROMPT_CHECKLIST.xlsx")
wb = openpyxl.load_workbook(path)
ws = wb.active
for row in ws.iter_rows(min_row=2):
    if row[0].value == "CONTENT_OPERATING_SYSTEM_PLANMODE_PROMPT.md":
        print(row[0].value, row[2].value, row[3].value, row[4].value, row[5].value)
        break
'@ | python -`
- [x] `python sync_planning_artifacts.py`

Niet uitgevoerd:

- [ ] Geen copy- of runtimefix doorgevoerd voor de bestaande `marketing-flow` failure op `homepageProductRoutes[0].chip`
  - De parity-run is bewust wel uitgevoerd, maar faalt op een al lopende marketingcopy-wijziging buiten deze tranche: huidige waarde `Kernproduct - primair` versus bestaande testverwachting `Primaire route`.
  - Deze tranche wijzigt bewust geen bestaande buyer-facing marketingcopy die al dirty in de worktree stond.

## 5. Files That Carry This Tranche

- `docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md`
- `docs/reference/CONTENT_OPERATING_SYSTEM.md`
- `docs/reference/CONTENT_OPERATING_SYSTEM_ACCEPTANCE_CHECKLIST.md`
- `frontend/lib/content-operating-system.ts`
- `frontend/lib/content-operating-system.test.ts`
- `tests/test_content_operating_system.py`
- `docs/prompts/CONTENT_OPERATING_SYSTEM_PLANMODE_PROMPT.md`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`
- `docs/strategy/ROADMAP.md`

## 6. Current Product Risks

- [x] Contentversnippering blijft een risico zolang een deel van de buyer-facing copy nog in grote handmatige containers leeft.
- [x] Te vroege schaalcontent blijft riskant; deze tranche begrenst dat nu explicieter maar voert nog geen growthfilter in de UI of CMS af.
- [x] Claims en terminologie blijven gevoelig voor drift zodra buyer-facing copy sneller verandert dan reference docs of tests.
- [x] Publieke proof blijft sample-first; zonder echte approved cases moet contentdiscipline extra strak blijven.
- [x] Portfolio-architectuur leeft nu als aparte upstream tranche; deze laag blijft daarom bewust dependency-aware en opent die keuzes niet opnieuw.
- [x] Toekomstige productslugs kunnen nog steeds productverwarring geven als latere portfolio-architectuur daar niet expliciet op landt.

## 7. Open Questions

- [ ] Landt approved case-proof later eerst in sales/follow-up of ook direct op de site?
- [ ] Is een latere content registry-refactor wenselijk zodra de huidige user-facing marketingbestanden weer stabiel zijn?
- [ ] Hoe licht of zwaar moet een latere reviewcadans operationeel worden zolang het team founder-led blijft?

## 8. Follow-up Ideas

- [ ] Voeg na portfolio-architectuur een lichte registry-refactor toe zodat meer buyer-facing copy uit kleinere contracten komt.
- [ ] Voeg later paritychecks toe tussen reference docs en geselecteerde buyer-facing page copy.
- [ ] Voeg pas na approved cases een compacte case-surface toe op product-, pricing- of trustpagina's.
- [ ] Gebruik deze tranche later als basis voor een heel compacte thought-leadership reserve die aan bewezen buyer-vragen hangt.

## 9. Out of Scope For Now

- [x] Geen brede blog of kennisbank.
- [x] Geen volwaardige thought-leadership machine of publicatiecadans.
- [x] Geen nieuwe productfamilies buiten ExitScan, RetentieScan en de combinatieroute.
- [x] Geen named testimonials, ROI-verhalen of publieke customer proof zonder approved basis.
- [x] Geen herbouw van de bestaande funnel- of SEO-architectuur.
- [x] Geen portfolioherontwerp dat thuishoort in `PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md`.

## 10. Defaults Chosen

- [x] `CONTENT_OPERATING_SYSTEM_PLANMODE_PROMPT.md` blijft de leidende prompt voor dit onderwerp.
- [x] `docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md` is de source of truth.
- [x] ExitScan blijft de primaire content-, SEO- en saleswedge.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Portfolio-architectuur blijft expliciete upstream dependency.
- [x] Sample-output blijft publieke proofdefault tot approved case-proof bestaat.
- [x] Trust blijft reassurance en due diligence, niet de eerste pitch.
- [x] SEO-content blijft compact en productgebonden.
- [x] Thought leadership blijft later-fase reservecontent.
- [x] Nieuwe buyer-facing content moet eerst langs strategy, taxonomy, trust, evidence en surface review.
