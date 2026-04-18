# CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

Historical boundary note:

- dit plan blijft leidend voor onboarding- en adoptionhardening binnen zijn tranche
- routewoorden als `ExitScan Live` en `RetentieScan ritme` zijn hier historische pre-normalisatie labels
- lees ze in de huidige hardeningcontext als `ExitScan ritmeroute` en `RetentieScan ritmeroute`
- voor actuele onboardingtaal en flowvolgorde winnen [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md), [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md) en [COMMERCIAL_LANGUAGE_PARITY_RECHECK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_LANGUAGE_PARITY_RECHECK.md)

## 1. Summary

Dit traject maakt van de assisted klantstart van Verisight één expliciete onboarding- en adoptionlaag van akkoord naar eerste bruikbare managementwaarde.

Bewuste defaults:

- [x] ExitScan blijft de primaire eerste route.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Assisted onboarding blijft de verkochte waarheid.
- [x] Adoptie betekent niet alleen livegang, maar ook werkelijk gebruik van dashboard en rapport.
- [x] Buyer-facing handoff moet aansluiten op website, pricing en sales.

## 1A. Repo Implementation Status

Uitgevoerd in deze tranche:

- [x] Buyer-facing handoff aangescherpt in marketing en aanpak.
- [x] Canonieke onboardingtruth gecentraliseerd in frontend-content en ops-docs.
- [x] Admin setup explicieter gemaakt als operator-playbook.
- [x] Importverwachtingen en klantaanlevering aangescherpt.
- [x] Klantactivatie meer als handoff naar waarde gepositioneerd.
- [x] Dashboard en campaignpagina explicieter gemaakt als adoptionlaag.
- [x] Acceptance-checklist verbreed naar eerste managementgebruik.
- [x] Regressietests toegevoegd voor onboarding- en marketingdefaults.

Bewust niet uitgevoerd in deze tranche:

- [ ] Persistente onboardingstatus per gebruiker of organisatie buiten localStorage.
- [ ] Expliciete `delivery_mode`-keuze in admin-setup.
- [ ] Nieuwe analytics- of eventstack voor adoption.
- [ ] Zware CRM- of workflow-automatisering.

## 2. Milestones

### Milestone 1 - Freeze Current Onboarding And Adoption Truth
Dependency: none

#### Tasks
- [x] De huidige end-to-end route vastgelegd van route-aware lead capture naar intake, organisatie-aanmaak, campaign setup, respondentimport, invites, klantactivatie, dashboardgebruik en rapportdownload.
- [x] Expliciet benoemd welke delen buyer-facing zijn, welke intern zijn en waar de handoff nog impliciet of handmatig blijft.
- [x] De actuele first-value drempels vastgezet op repo-waarheid:
  - detailweergave vanaf 5 responses
  - patroonanalyse vanaf 10 responses
  - rapport en dashboard als eerste managementwaarde
- [x] De rol van Verisight versus de rol van de klant expliciet gemaakt per stap.
- [x] De verschillen vastgelegd tussen ExitScan Baseline, ExitScan Live, RetentieScan Baseline en RetentieScan ritme.
- [x] Vastgelegd dat het genoemde externe `.docx`-bestand lokaal niet aanwezig is en dat de actuele `.md` en `.xlsx` procesflow als referentie dienen.

#### Definition of done
- [x] Er ligt één controleerbaar repo-gebaseerd beeld van de huidige klantstart en eerste adoptie.
- [x] De verschillen tussen verkochte route, operationele setup en echte eerste waarde zijn expliciet gemaakt.
- [x] Frictiepunten zijn herleidbaar naar actuele repo-bestanden of ontbrekende assets.

#### Validation
- [x] Observaties zijn terug te voeren op marketing, dashboard, backend, Supabase en operations-docs.
- [x] ExitScan blijft zichtbaar de standaard eerste route.
- [x] Geen onboardingconclusie leunt op aannames buiten repo-truth.

### Milestone 2 - Define The Canonical Verisight Onboarding And Adoption Model
Dependency: Milestone 1

#### Tasks
- [x] Een canoniek onboardingmodel vastgelegd met vaste fases:
  - route en intake
  - implementation intake
  - campaign setup
  - respondentimport en uitnodigingen
  - klantactivatie
  - eerste dashboardread
  - rapportuitleg
  - eerste managementgesprek
- [x] Per fase trigger, eigenaar, klantverwachting, input en output vastgelegd.
- [x] Assisted setup als norm vastgelegd.
- [x] Het verschil expliciet gemaakt tussen onboarding, implementation readiness en report-to-action.
- [x] Baseline versus Live als onboarding- en adoptionvariant uitgewerkt zonder productverwarring.
- [x] Een vaste definitie gekozen voor "adoptie geslaagd".

#### Definition of done
- [x] Verisight heeft één expliciete onboarding- en adoptionlogica.
- [x] Elke fase heeft een duidelijke eigenaar en verwachte uitkomst.
- [x] Adoptie is gekoppeld aan gebruik van dashboard en rapport.

#### Validation
- [x] Het model botst niet met strategie, pricing, funnel of sample-output.
- [x] Het model blijft assisted/productized.
- [x] Baseline en Live verschillen zijn scherp genoeg voor deze tranche.

### Milestone 3 - Rebuild The Buyer-To-Delivery Handoff Around Clear Inputs, Expectations And Assets
Dependency: Milestone 2

#### Tasks
- [x] De handoff van contact/intake naar implementation-start gestructureerd rond vaste onboardinginputs.
- [x] Vastgelegd welke buyer-facing uitleg nog tussen websitecontact en setup hoort te zitten.
- [x] Eén canonieke klantaanlevering gedefinieerd voor respondentbestanden.
- [x] Vastgelegd wanneer `segment_deep_dive` extra datadiscipline en onboardinguitleg vraagt.
- [x] Buyer-facing assets toegevoegd voor "wat gebeurt na akkoord?" in aanpak, site-content en ops-docs.
- [x] Expliciet gemaakt wat de klant wel en niet zelf doet tussen akkoord en eerste output.

#### Definition of done
- [x] De overgang van sale naar delivery vraagt minder impliciete kennis of losse uitleg.
- [x] Datavoorwaarden en aanleververwachtingen zijn eenduidiger.
- [x] Buyer-facing verwachtingen sluiten aan op de assisted setupflow.

#### Validation
- [x] De handoff sluit aan op huidige contactcontracten, setupcopy en operations-referenties.
- [x] ExitScan en RetentieScan krijgen allebei passende onboardingverwachtingen.
- [x] Geen asset belooft tooling of automation die de repo niet draagt.

### Milestone 4 - Make Admin Setup, Client Activation And First Use Operationally Legible
Dependency: Milestone 3

#### Tasks
- [x] De adminflow leesbaarder gemaakt als operatorstappen met heldere gating.
- [x] Setupcopy en statussen aangescherpt waar voorkennis te groot was.
- [x] Invite- en activatieroute explicieter als onboarding gemodelleerd.
- [x] De eerste klantlogin meer als "welkom in het juiste dashboard" ingericht.
- [x] Product- en docs-assets toegevoegd voor klantactivatie, campagnestatus, responsopbouw en eerste PDF-read.
- [ ] Pre-flight- en launchchecks volledig buiten localStorage gebracht.
  - Nuance: checklist is inhoudelijk uitgebreid, maar opslag blijft lokaal in deze tranche.

#### Definition of done
- [x] Setup, activatie en eerste gebruik zijn leesbaarder als één operationele route.
- [ ] Belangrijke stappen zijn volledig los van localStorage-only hulp.
  - Nuance: inhoud beter, persistence nog niet.
- [x] Klanttoegang voelt meer als handoff naar waarde.

#### Validation
- [x] De aanpassingen sluiten aan op import-, invite-, reportdownload- en dashboardroutes.
- [x] Viewer- en admin-ervaring blijven logisch gescheiden.
- [x] Geen zware workflow- of CRM-automatisering geforceerd.

### Milestone 5 - Turn Dashboard And Report Into An Explicit Adoption Layer
Dependency: Milestone 4

#### Tasks
- [x] Vastgelegd hoe dashboard en rapport het eerste managementgebruik ondersteunen.
- [x] Missing adoptionhulp na eerste login opgevangen met route-intro, leeswijzer en managementread-panelen.
- [x] Coachmarks, empty states en methodology-blokken opnieuw gekaderd als adoptioninstrument.
- [x] ExitScan en RetentieScan verschillen explicieter gemaakt in eerste interpretatie en eerste managementgesprek.
- [x] Post-delivery rituelen vastgelegd in checklist en playbook.
- [x] "Eerste managementgebruik geslaagd" expliciet gedefinieerd.

#### Definition of done
- [x] Dashboard en rapport zijn expliciet onderdeel van adoptie.
- [x] De stap van live output naar werkelijk managementgebruik is concreter beschreven.
- [x] ExitScan en RetentieScan houden elk hun eigen adoptionlogica.

#### Validation
- [x] De adoptionlaag blijft binnen claims- en methodische guardrails.
- [x] De interpretatiehulp sluit aan op de bestaande dashboard- en rapportstructuur.
- [x] Geen adoptioncopy verkoopt meer zekerheid dan het product draagt.

### Milestone 6 - Add Onboarding QA, Adoption Signals And Governance
Dependency: Milestone 5

#### Tasks
- [x] Een acceptance checklist gedefinieerd voor onboardingkwaliteit.
- [ ] Praktische adoptionsignalen v1 in productdata gemeten.
  - Nuance: signalen zijn inhoudelijk gedefinieerd in docs, maar nog niet instrumenteel geïmplementeerd.
- [x] Regressiebescherming toegevoegd in docs, tests en acceptance-runs.
- [x] Vastgelegd welke onderdelen later in `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md` verder worden uitgewerkt.
- [x] Governance vastgelegd: eerst plan, daarna assets, flows, tests en checklist.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt en dit plan als leidend document bevestigd.

#### Definition of done
- [x] Onboarding en adoptie zijn inhoudelijk, operationeel en administratief reviewbaar.
- [x] Toekomstige wijzigingen veroorzaken minder snel losse delivery- of uitlegfrictie.
- [x] Het prompt-systeem weerspiegelt dat dit traject nu de source of truth is.

#### Validation
- [x] De acceptance-laag dekt klantstart én eerste managementgebruik.
- [ ] Adoptionsignalen zijn al meetbaar in de huidige architectuur.
  - Nuance: ze zijn gedefinieerd, nog niet als aparte eventlaag gebouwd.
- [x] `PROMPT_CHECKLIST.xlsx` weerspiegelt de repo-status.

## 3. Execution Breakdown By Subsystem

### Buyer-facing handoff and expectation setting
- [x] Assisted en professioneel gehouden; geen self-service setup verkocht.
- [x] Explicieter gemaakt wat tussen akkoord en eerste output gebeurt.
- [x] ExitScan-first zichtbaar gehouden zonder RetentieScan verkeerd te framen.

### Intake, scan scope and data prerequisites
- [x] Implementation intake explicieter gemaakt rond routekeuze, timing, doelgroep en metadata.
- [x] Klantaanlevering gestandaardiseerd voor respondentbestanden en segmentvelden.
- [x] Baseline versus Live explicieter gemaakt als verwachtingskader.

### Admin setup and implementation flow
- [x] `Beheer` behandeld als operator-playbook en niet alleen als CRUD-scherm.
- [x] Gating verduidelijkt tussen organisatie, campaign, import, uitnodigen en klanttoegang.
- [ ] Pre-flight checks minder afhankelijk gemaakt van inhoudelijke voorkennis, maar nog niet los van localStorage.

### Respondent import and invite operations
- [x] CSV/XLSX-preview, validatie en foutfeedback leidend gehouden.
- [x] Importlaag sterker gekoppeld aan klantaanleverspecificatie en add-on discipline.
- [ ] Uitnodigingen en reminders nog niet als aparte persistente onboardingstatus gemodelleerd.

### Client access and first login
- [x] Activatiemail, wachtwoordinstelling en eerste dashboardtoegang als onboardingmoment gepositioneerd.
- [x] Voor klantgebruikers duidelijker gemaakt wat ze na eerste login wel en niet zien.
- [x] Klantactivatie voelt meer als handoff naar waarde.

### Dashboard, report and first management use
- [x] Dashboard expliciet als adoptionlaag gebruikt.
- [x] Verschil tussen indicatief beeld, stevig patroonbeeld en vervolgactie aangescherpt.
- [x] Rapportdownload en rapportuitleg gekoppeld aan een vaste adoptiondefinitie.

### Operations, checklists and internal enablement
- [x] Canonieke onboarding-acceptance checklist toegevoegd.
- [x] Afhankelijkheid van Lars verlaagd via assets, checklists en expliciete defaults.
- [x] Zware CRM- of workflow-automation bewust buiten scope gehouden.

### Adoption signals and governance
- [ ] Adoption in v1 nog niet technisch gemeten via productsignalen.
- [x] Eerste managementgebruik expliciet herkenbaar gemaakt als succesmoment.
- [x] Dit plan eerst als truth vastgezet voor vervolgroutes.

## 4. Validation Run

Uitgevoerd in deze tranche:

- [x] `frontend`: `npm test`
- [x] `frontend`: `npm run lint`
- [x] `frontend`: `npm run build`
- [x] Lokale flow-check op gebouwde app voor buyer-facing en onboardingroutes

Niet uitgevoerd:

- [ ] Backend pytest-runs
  - Geen backend-code gewijzigd in deze tranche.
- [ ] Volledige geauthenticeerde invite -> complete-account -> dashboard e2e met echte sessie
  - Niet veilig of praktisch zonder testaccount en mailflow in deze omgeving.

## 5. Files That Carry This Tranche

- `frontend/lib/client-onboarding.ts`
- `frontend/components/dashboard/onboarding-panels.tsx`
- `frontend/app/(dashboard)/beheer/page.tsx`
- `frontend/components/dashboard/new-campaign-form.tsx`
- `frontend/components/dashboard/add-respondents-form.tsx`
- `frontend/app/(auth)/complete-account/page.tsx`
- `frontend/app/(dashboard)/dashboard/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/components/dashboard/preflight-checklist.tsx`
- `frontend/app/aanpak/page.tsx`
- `frontend/components/marketing/site-content.ts`
- `docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md`
- `docs/ops/ONBOARDING_ACCEPTANCE_CHECKLIST.md`
- `docs/ops/SETUP.md`
- `frontend/lib/client-onboarding.test.ts`
- `frontend/lib/marketing-flow.test.ts`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`

## 6. Explicitly Not Executed

- [x] Geen persistente onboardingstatus per org of user gebouwd.
- [x] Geen expliciete `delivery_mode`-keuze in admin gebouwd.
- [x] Geen nieuwe analytics- of eventstack toegevoegd.
- [x] Geen CRM-automation of workflow-orchestratie toegevoegd.

Waarom niet:

- Deze onderdelen vragen schema- of architectuurwerk buiten de proportionele scope van deze tranche.
- De hoogste impact zat nu in expliciete handoff, setup, activatie, adoptioncopy, docs en regressiebescherming.

## 7. Out of Scope For Now

- [x] Geen self-service onboarding, account provisioning of publieke checkout.
- [x] Geen Stripe, billing, plans, seats of subscriptionlogica.
- [x] Geen groot CRM- of workflow-automatiseringssysteem.
- [x] Geen nieuwe productfamilies buiten ExitScan, RetentieScan en de bestaande combinatieroute.
- [x] Geen methodische herbouw van scoring, survey-inhoud of report-engine buiten wat nodig is voor onboarding- en adoptionalignment.
- [x] Geen verzonnen case-proof, ROI-proof of adoptionclaims zonder echte basisdata.

## 8. Defaults Chosen

- [x] `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLANMODE_PROMPT.md` is de leidende prompt voor dit traject.
- [x] `docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md` is de source of truth.
- [x] ExitScan blijft de primaire eerste route voor onboarding.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Assisted onboarding blijft de verkochte en productmatige waarheid.
- [x] Adoptie betekent in dit traject dat de klant dashboard en rapport echt als eerste managementinstrument gebruikt.
- [x] De actuele externe operations-referenties voor dit onderwerp zijn de onboarding markdown en xlsx-procesflow in `Docs_External/05_Operations_En_CRM`; het in de prompt genoemde `.docx`-bestand was lokaal niet aanwezig.
- [x] `PROMPT_CHECKLIST.xlsx` is bijgewerkt op de echte repo-status.
