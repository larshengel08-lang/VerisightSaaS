# SALES_ENABLEMENT_SYSTEM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand documenteert de sales enablement tranche; actuele commerciële routewaarheid wint in de actieve canon en de actuele sales reference docs.

Historical boundary note:

- dit plan beschrijft de tranche-uitrol, maar is niet de hoogste actieve first-buy of routecanon
- buyer-facing routevolgorde en commerciële guardrails winnen nu in [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md), [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md), [COMMERCIAL_AND_ONBOARDING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_AND_ONBOARDING_SIGNOFF.md) en [PACKAGING_AND_ROUTE_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PACKAGING_AND_ROUTE_LOGIC.md)
- dagelijkse sales-uitvoering wint in [SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md) en [SALES_PRODUCT_DECISION_TREE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SALES_PRODUCT_DECISION_TREE.md)

## 1. Summary

Dit traject heeft van de bestaande founder-led backbone, boardroom-laag, trustcontracten, pricingrichting en voorbeeldoutput een herhaalbaar Sales Enablement System gemaakt dat direct aansluit op de actuele repo-implementatie.

De uitgevoerde richting in deze tranche:

- een overdraagbare sales enablement systeemlaag toegevoegd naast de bestaande founder-led lijn
- een expliciete product decision tree toegevoegd voor ExitScan, RetentieScan, combinatie en no-go/her-scope routes
- een vaste comparison matrix toegevoegd voor managementvraag, output, claimsgrens en privacygrens
- vaste objection/claims, proposal en governance artefacten toegevoegd als reporeferentie
- compacte buyer-facing one-pagers toegevoegd die rechtstreeks afleiden uit pricing, preview, productcopy en rapportoutput
- regressiebescherming toegevoegd zodat nieuwe sales artefacten minder makkelijk losraken van site, preview, pricing en trustbasis

Belangrijkste repo-observaties waarop deze uitvoering is gebaseerd:

- de founder-led backbone was al sterk, maar nog te founder-afhankelijk en te verspreid om als systeemlaag te dienen
- ExitScan stond al scherp als primaire wedge, maar routekeuze en vergelijking stonden nog niet als expliciete salesartefacten vast
- RetentieScan stond al scherp als verification-first route, maar had nog geen compacte buyer one-pager of expliciete decision-tree plek
- proposal en objection logica bestonden al in founder-vorm, maar niet als bredere sales enablement suite
- pricing, preview en trust waren al bruikbaar als prooflaag, maar zonder vaste buyer-assets bleef hergebruik beperkt

Status 2026-04-15:

- Uitgevoerd in deze ronde:
  - `docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md`
  - `docs/reference/SALES_PRODUCT_DECISION_TREE.md`
  - `docs/reference/SALES_COMPARISON_MATRIX.md`
  - `docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md`
  - `docs/reference/SALES_PROPOSAL_SPINES.md`
  - `docs/reference/SALES_ENABLEMENT_ACCEPTANCE_CHECKLIST.md`
  - `docs/reference/EXITSCAN_SALES_ONE_PAGER.md`
  - `docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md`
  - `docs/reference/COMBINATIE_PORTFOLIO_MEMO.md`
  - regressietest `tests/test_sales_enablement_system.py`
  - validatie bevestigd via `pytest`, `vitest`, `eslint` en `next build`
- Bewust niet uitgevoerd in deze ronde:
  - geen groot website-redesign
  - geen pricingherbouw buiten huidige prijsankers
  - geen sample-output bibliotheek buiten compacte buyer-assets
  - geen CRM-, outbound- of automationsuite
  - geen verzonnen case proof of testimoniallaag

## 2. Milestones

### Milestone 0 - Freeze Current Sales Enablement Baseline And Asset Map
Dependency: none

- [x] Uitgevoerd op 2026-04-15: de huidige sales enablement-laag gereconstrueerd uit strategie, trust, boardroom, founder-led, marketingcopy, pricingcopy, contactflow, preview, rapportcontracten en voorbeeld-PDF's.

#### Tasks
- [x] Huidige sales enablement-laag in kaart gebracht over strategie, methodiek, trustmatrix, boardroom-plan, founder-led plan, playbook, acceptance-checklist, marketingcopy, pricingcopy, contactflow, previewcopy, report payloads en voorbeeld-PDF's.
- [x] Vastgelegd welke verkoopartefacten al bestonden en welke nog ontbraken.
- [x] Expliciet vastgelegd waar de huidige salesuitleg al sterk was en waar die nog founder-afhankelijk of te verspreid bleef.
- [x] De grens gemarkeerd met founder-led, terminology, pricing en sample-output trajecten.

#### Definition of done
- [x] Er lag een repo-gebaseerd baselinebeeld van de huidige sales enablement-laag.
- [x] Bestaande versus ontbrekende sales-assets waren expliciet geinventariseerd.
- [x] De grens tussen sales enablement en aangrenzende trajecten was inhoudelijk scherp gemaakt.

#### Validation
- [x] Observaties waren herleidbaar naar actuele repo-bestanden.
- [x] ExitScan-primair, RetentieScan-complementair en combinatie-als-route bleven leidend.
- [x] Gaten in assets en gaten in claims- of productlogica bleven van elkaar onderscheiden.

### Milestone 1 - Define The Verisight Sales Enablement Contract
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-15: een canoniek sales enablement contract en vaste asset stack vastgelegd als reporeferentie.

#### Tasks
- [x] Een canoniek sales enablement contract vastgelegd voor probleemopening, routekeuze, vergelijking, demo-volgorde, trustvolgorde, pricing-overgang, voorstelovergang en follow-up.
- [x] De canonieke asset stack vastgelegd in de nieuwe reference docs.
- [x] Vastgelegd dat `FOUNDER_LED_SALES_PLAYBOOK.md` founder-specifiek blijft en dat de nieuwe sales enablement playbook de overdraagbare systeemlaag vormt.
- [x] Vastgelegd welke buyer-facing assets in deze tranche thuishoren en welke juist niet.
- [x] De vaste claimladder voor sales assets expliciet gemaakt.

#### Definition of done
- [x] Er is een decision-complete sales enablement contract voor gesprekken, demo's, voorstellen en herbruikbare assets.
- [x] De uitvoerder hoeft niet meer te kiezen welke interne salesdocs leidend zijn.
- [x] De asset stack en scopegrens zijn vastgelegd zonder overlapchaos.

#### Validation
- [x] Het contract botst niet met strategie-, methodiek-, trust-, boardroom- of founder-led documenten.
- [x] Trust blijft reassurance in plaats van primaire pitch.
- [x] Geen asset verkoopt RetentieScan als MTO/predictor of ExitScan als diagnose.

### Milestone 2 - Rebuild Product Routing, Comparison And Route Choice
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: expliciete routing- en comparison-artefacten toegevoegd voor ExitScan, RetentieScan, combinatie en no-go/her-scope.

#### Tasks
- [x] Een expliciete sales decision tree toegevoegd voor ExitScan Baseline, ExitScan Live, RetentieScan Baseline, Retention Loop, combinatie en nog-niet-verkopen routes.
- [x] Een vaste comparison matrix toegevoegd over managementvraag, leesrichting, doelgroep, output, claimsgrens, privacygrens, wanneer wel en wanneer niet.
- [x] De salesroute-taal geharmoniseerd met bestaande productpagina's, tariefcopy, contactflow en previewcopy door de nieuwe docs daarop af te leiden.
- [x] Vastgelegd welke termen sales-facing consistent moeten blijven.
- [x] De combinatiepropositie expliciet gehouden als bewuste tweede route en niet als upsell.

#### Definition of done
- [x] Elke seller kan zonder improvisatie bepalen welke route eerst logisch is.
- [x] ExitScan, RetentieScan en combinatie zijn commercieel beter uitlegbaar zonder inhoudsverlies.
- [x] Routekeuze, comparison en claimsgrens spreken elkaar niet tegen over site, preview en voorstel.

#### Validation
- [x] Decision tree en comparison matrix reproduceren de bestaande productguardrails correct.
- [x] Contactflow, productcopy, preview en pricing blijven dezelfde routekeuze ondersteunen.
- [x] De combinatie voelt niet als featurebundel en RetentieScan niet als lichtere afgeleide van ExitScan.

### Milestone 3 - Convert Founder-Led Backbone Into Reusable Sales Assets
Dependency: Milestone 2

- [x] Uitgevoerd op 2026-04-15: de founder-led backbone omgezet naar overdraagbare interne en buyer-facing sales assets.

#### Tasks
- [x] De founder-led backbone vertaald naar overdraagbare assets voor discovery, demo, objections, proposal en follow-up.
- [x] Een compacte ExitScan one-pager gebouwd als primaire wedge.
- [x] Een compacte RetentieScan one-pager gebouwd als specifieke of complementaire route.
- [x] Een compacte portfolio memo gebouwd voor de combinatie als bewuste portfolioroute.
- [x] Per asset vastgelegd dat strategie, trust, pricing, preview, voorbeeldrapporten en report-contracten leidend blijven.

#### Definition of done
- [x] Sales enablement is niet meer alleen founder-kennis of losse marketingcopy, maar een herbruikbare assetset.
- [x] Er is per primaire route minimaal een compacte buyer-facing salesasset.
- [x] Proposal-, objection- en follow-up-overgangen zijn vastgelegd zonder terugval naar losse feature-uitleg.

#### Validation
- [x] Alle assets volgen bestaande claimsgrenzen, pricingrichting en outputrealiteit.
- [x] One-pagers en memo-assets voelen als afgeleiden van echte Verisight-output.
- [x] Het verschil tussen interne assets en buyer-facing assets is expliciet en hanteerbaar.

### Milestone 4 - Align Demo, Proposal, Pricing And Sample-Output Handoffs
Dependency: Milestone 3

- [x] Uitgevoerd op 2026-04-15: demo-, proposal-, pricing- en outputhandoffs geordend in vaste proposal spines en route-defaults.

#### Tasks
- [x] Per productroute de vaste demo-architectuur vastgelegd in het sales enablement playbook en de proposal spines.
- [x] Per route vastgelegd welke previewvariant, voorbeeldrapporten en pricingankers als prooflaag horen.
- [x] De proposal spines concreet gemaakt voor ExitScan Baseline, ExitScan Live, RetentieScan Baseline, Retention Loop en combinatie.
- [x] Vastgelegd dat pricing in deze tranche aan de huidige prijsankers gekoppeld blijft en niet structureel wordt herbouwd.
- [x] Vastgelegd dat sample-output in deze tranche als bewijslaag geordend blijft en niet wordt uitgebreid tot showcasebibliotheek.

#### Definition of done
- [x] Demo, proposal, pricing en output vormen per route een verkoopbare lijn.
- [x] Een seller weet wat eerst getoond, gezegd, geprijsd en voorgesteld moet worden.
- [x] De stap van gesprek naar betaald eerste traject is inhoudelijk strak en niet vrijblijvend.

#### Validation
- [x] Elke route eindigt op een geloofwaardige volgende stap die past bij huidige productvorm en pricing.
- [x] Geen demo of proposal belooft features, validatie of bewijs dat niet in de repo wordt gedragen.
- [x] Sample-output wordt gebruikt als echte evidence-support en niet als los verkooppraatje.

### Milestone 5 - Add QA, Governance And Prompt-System Closure
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-15: paritytests, acceptance, governance en prompt-checklist closure toegevoegd voor deze tranche.

#### Tasks
- [x] Regressiebescherming toegevoegd voor sales enablement parity over docs, marketingcopy, previewcopy, pricing en trustlaag.
- [x] Handmatige acceptance uitgebreid met sales enablement checklist voor routekeuze, proposal, buyer-assets en governance.
- [x] Governance vastgelegd voor toekomstige updates van founder-led, sales enablement, pricing en sample-output docs.
- [x] In tests verankerd dat ExitScan default eerste route blijft, RetentieScan verification-first blijft en combinatie geen standaard upsell wordt.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor `SALES_ENABLEMENT_SYSTEM_PLANMODE_PROMPT.md`.

#### Definition of done
- [x] Sales enablement is inhoudelijk, commercieel en regressietechnisch reviewbaar.
- [x] Toekomstige copy- of assetwijzigingen kunnen minder makkelijk losraken van product- en trustrealiteit.
- [x] Prompt-systeem, checklist en planbestand sluiten administratief op elkaar aan.

#### Validation
- [x] Relevante frontend en repo-parity checks zijn gedraaid via `pytest tests/test_sales_enablement_system.py tests/test_reporting_system_parity.py` en `vitest` voor marketing- en preview-parity.
- [x] Frontend lint en build zijn groen bevestigd via `npm run lint` en `npm run build`.
- [x] Handmatige acceptance maakt zichtbaar of buyer, seller en site nog hetzelfde verhaal vertellen.
- [x] De checkliststatus weerspiegelt de echte repo-uitvoering van dit traject.

## 3. Execution Breakdown By Subsystem

### Sales canon and governance
- [x] Een overdraagbare sales enablement canon toegevoegd naast de bestaande founder-led canon.
- [x] `FOUNDER_LED_SALES_PLAYBOOK.md` founder-specifiek gelaten en het nieuwe playbook als systeemlaag gepositioneerd.
- [x] De grens met terminology-, pricing- en sample-output-trajecten expliciet vastgelegd.

### Product routing and comparison
- [x] Een expliciete sales decision tree toegevoegd voor ExitScan, RetentieScan, combinatie en no-go/her-scope routes.
- [x] Een comparison matrix toegevoegd voor managementvraag, output, claimsgrens en privacygrens per route.
- [x] De routekeuzetaal doorgetrokken naar proposal en buyer-assets op basis van bestaande site-, preview- en pricingcopy.

### Reusable sales assets
- [x] Discovery, demo, objections, proposal en follow-up omgezet in vaste interne reference docs.
- [x] Compacte buyer one-pagers toegevoegd voor ExitScan en RetentieScan.
- [x] Een portfolio memo toegevoegd voor de combinatie.

### Demo, proposal and buyer handoff
- [x] Per route de vaste demo-volgorde, trustmomenten, pricingmomenten en next-step logica vastgelegd.
- [x] Per route expliciet gemaakt welke preview, welk voorbeeldrapport en welke pricinglaag horen bij het gesprek.
- [x] Proposals als productized vervolg op de demo vastgelegd.

### Tests and acceptance
- [x] `tests/test_sales_enablement_system.py` toegevoegd voor parity over docs, marketingcopy, previewcopy, pricingankers en claimsgrenzen.
- [x] `SALES_ENABLEMENT_ACCEPTANCE_CHECKLIST.md` toegevoegd voor handmatige review.
- [x] Het traject administratief afgesloten met planbestand en checklistupdate.

## 4. Current Product Risks

- [x] Verisight had al een sterk founder-verhaal, maar nog geen volledig overdraagbare sales-asset stack; dit is verkleind door nieuwe reference docs en buyer-assets.
- [x] Routeverwarring tussen ExitScan, RetentieScan en combinatie is verkleind door decision tree en comparison matrix.
- [x] Risico op te harde of te vage claims blijft bewaakt via de objection and claims matrix en regressietests.
- [x] Risico dat salesuitleg losraakt van het echte product is verkleind doordat buyer-assets expliciet op pricing, preview en rapportoutput rusten.
- [x] Founder-afhankelijkheid is verkleind, maar niet volledig weg zolang echte live salesfeedback nog beperkt is.
- [x] Overlapchaos met pricing-, terminology- en sample-output-trajecten is verkleind door expliciete governance en scopegrenzen.
- [x] Zwakke prooflaag blijft een reeel risico; deze tranche gebruikt daarom geen verzonnen klantbewijs en houdt zich aan product- en trustproof uit de repo.

## 5. Open Questions

- [ ] Willen we later naast founder-led ook een expliciete non-founder seller variant uitwerken met eigen scripts en enablement assets?
- [ ] Willen we later een compacte boardroom memo of executive one-pager als apart asset toevoegen?
- [ ] Willen we na eerste echte klantgesprekken de objection matrix herijken op live bezwaarpatronen en proposal-conversie?
- [ ] Willen we later ook outbound- of partner-varianten uitwerken, of blijft dit systeem primair op inbound/discovery/demo/voorstel gericht?

## 6. Follow-up Ideas

- [ ] Gebruik `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md` om sales-, preview-, pricing- en reporttaal nog strakker te harmoniseren.
- [ ] Gebruik `PRICING_AND_PACKAGING_PROGRAM_PLAN.md` om prijsankers, Baseline/Live en add-ons verder te structureren.
- [ ] Gebruik `SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md` om buyer one-pagers en demo-output visueel nog sterker te maken.
- [ ] Gebruik `CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md` om later echte quotes, cases en bewijsvoering toe te voegen zodra pilots dat dragen.
- [ ] Gebruik eerste echte salesgesprekken om discovery-openingen, objections en proposal spines pragmatisch te ijken.

## 7. Out of Scope For Now

- [x] Geen groot website-redesign of funnelherbouw.
- [x] Geen nieuwe pricingarchitectuur buiten koppeling aan de huidige prijsankers.
- [x] Geen brede showcasebibliotheek buiten de compacte buyer-assets van deze tranche.
- [x] Geen CRM-, outbound- of automatiseringsexecutie.
- [x] Geen case-proof, testimonials of klantclaims zonder feitelijke basis.
- [x] Geen wijziging aan productmethodiek, scoring of report engine buiten parity op salesniveau.
- [x] Geen herpositionering van Verisight als people-suite, self-service tool, predictor of consultancy-intensief maatwerktraject.

## 8. Defaults Chosen

- [x] `docs/active/SALES_ENABLEMENT_SYSTEM_PLAN.md` is de source of truth voor dit traject.
- [x] `SALES_ENABLEMENT_SYSTEM_PLANMODE_PROMPT.md` blijft de leidende prompt voor dit onderwerp.
- [x] ExitScan blijft de default eerste commerciele route.
- [x] RetentieScan blijft complementair en verification-first, tenzij de buyer-vraag expliciet over actieve-populatie behoudssignalering gaat.
- [x] De combinatie wordt alleen verkocht wanneer beide managementvragen echt bestaan; nooit als standaard bundel.
- [x] Trust blijft reassurance en claimsgrens, niet de openingshaak.
- [x] Buyer-facing sales-assets blijven afgeleiden van bestaande productrealiteit, pricingrichting, preview en voorbeeldoutput.
- [x] Grote packagingwijzigingen blijven voor het pricing-traject; grote showcase-uitbreidingen blijven voor het sample-output-traject.
- [x] Geen publieke API-wijzigingen; alleen reference docs, buyer-assets, tests en paritygovernance.
- [x] `PROMPT_CHECKLIST.xlsx` is na uitvoering administratief mee bijgewerkt.
