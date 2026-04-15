# SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md

## 1. Summary

Dit traject heeft de sample-output- en showcase-laag van Verisight aangescherpt op basis van de actuele repo-implementatie in rapportgenerator, preview-copy, website-routing, pricing, trust en prompt/documentatie.

De uitgevoerde richting in deze tranche:

- een canonieke asset stack vastgelegd voor buyer-facing active, internal demo support en legacy archive
- de report-engine voorzien van een buyer-facing samplemodus zonder vertrouwelijkheidsframing
- de sample-generator deterministischer en website-ready gemaakt via publieke pdf-mirrors
- productdetail, pricing en trust gekoppeld aan dezelfde actieve voorbeeldrapporten
- docs, prompts en acceptancechecks opgeschoond zodat de showcase-laag minder snel weer uit elkaar loopt

Belangrijkste repo-observaties waarop deze uitvoering is gebaseerd:

- actieve voorbeeld-pdf's kwamen al uit de echte report-engine, maar waren nog niet strak genoeg als buyer-facing showcase-pipeline beheerd
- de previewlaag was inhoudelijk sterk, maar visueel en contractmatig nog deels synthetisch
- de website verwees nog niet expliciet naar de canonieke voorbeeldrapporten
- actieve pdf's droegen nog vertrouwelijkheidsframing die beter past bij klantoutput dan bij showcase-assets
- legacy voorbeelden leefden nog mee in delen van de promptlaag

Status 2026-04-15:

- Uitgevoerd in deze ronde:
  - buyer-facing sample asset registry toegevoegd in `frontend/lib/sample-showcase-assets.ts`
  - previewcopy en previewslider gekoppeld aan typed showcase-contracten en sample-report CTA's
  - `backend/report.py` uitgebreid met `sample_output_mode`
  - `generate_voorbeeldrapport.py` deterministischer gemaakt en gekoppeld aan `docs/examples` plus `frontend/public/examples`
  - productdetail-, pricing- en trustpagina's voorzien van expliciete buyer-facing showcase-ingangen
  - actieve ExitScan- en RetentieScan-voorbeeldrapporten opnieuw gegenereerd en als repo-meereizende showcase-assets ingericht
  - referentiedocs, active plan, acceptance checklist en promptverwijzingen bijgewerkt
  - Niet uitgevoerd in deze tranche:
  - geen automatische freshness-check of interactieve on-screen samplevariant; deze blijven follow-upwerk

## 2. Milestones

### Milestone 0 - Freeze Current Sample-Output Baseline And Asset Map
Dependency: none

- [x] Uitgevoerd op 2026-04-15: actieve, ondersteunende en legacy showcase-assets repo-breed gemarkeerd en vastgelegd in docs en registry.

#### Tasks
- [x] Huidige sample- en showcase-assets geïnventariseerd over `docs/examples`, preview, site-routing en prompts.
- [x] Actieve versus legacy assets expliciet gelabeld.
- [x] Drift vastgelegd tussen preview, actieve pdf's en promptverwijzingen.
- [x] ExitScan bevestigd als primaire buyer-facing route en RetentieScan als complementaire route.

#### Definition of done
- [x] Er ligt één repo-gebaseerde asset map met actieve, legacy en interne showcase-assets.
- [x] Het verschil tussen normset, teaser-preview en historisch referentiepunt is expliciet.
- [x] De grootste parity- en geloofwaardigheidsrisico's zijn concreet benoemd.

#### Validation
- [x] Hoofdobservaties zijn herleidbaar naar actuele repo-bestanden.
- [x] ExitScan is zichtbaar de primaire buyer-facing route.
- [x] RetentieScan blijft complementair en verification-first.

### Milestone 1 - Define The Canonical Sample Output And Showcase Contract
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-15: canonieke showcase-stack vastgelegd in registry, referentiedoc en actieve docs/examples-normset.

#### Tasks
- [x] Canonieke showcase-stack vastgesteld voor actieve pdf's, portfolio-preview, productspecifieke previews en supporting visual.
- [x] Per asset doelgroep, gebruiksmoment, claimsgrens en trustframing vastgelegd.
- [x] Buyer-facing labeling verduidelijkt rond illustratief voorbeeld, fictieve data en managementstructuur.
- [x] Vastgelegd dat buyer-facing sample-assets geen vertrouwelijkheidsframing dragen.
- [x] Vastgelegd dat legacy-pdf's niet meer leidend mogen zijn.

#### Definition of done
- [x] De implementatie hoeft niet meer te kiezen welke sample-assets leidend zijn.
- [x] Buyer-facing versus interne versus legacy showcase-lagen zijn expliciet afgebakend.
- [x] Labeling en claimsgrens zijn voor elk actief asset vastgelegd.

#### Validation
- [x] Het contract blijft binnen strategie-, methodiek- en trustguardrails.
- [x] ExitScan blijft de eerste commerciële showcase.
- [x] RetentieScan houdt een eigen verification-first buyer-facing vorm.

### Milestone 2 - Rebuild The Buyer-Facing Sample PDFs From The Real Product Layer
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: generator en report-engine buyer-facing veilig gemaakt voor actieve sample-output.

#### Tasks
- [x] Sample-generator aangescherpt als buyer-facing asset pipeline.
- [x] Demo-identiteit deterministischer gemaakt via vaste demo-slug en vaste orggegevens.
- [x] Afgevangen dat toevallige database-organisaties het samplebeeld vervuilen.
- [x] Buyer-facing sample-output gekoppeld aan `sample_output_mode=True`.
- [x] Publieke pdf-mirrors toegevoegd voor websitegebruik.
- [x] Actieve buyer-facing pdf's expliciet uit `.gitignore` gehaald zodat ze mee kunnen reizen naar `main`.

#### Definition of done
- [x] De actieve sample-pdf's zijn actuele productoutput en geen losstaande demo-bestanden.
- [x] Demo-identiteit en buyer-facing framing zijn consistenter en herhaalbaar.
- [x] ExitScan en RetentieScan blijven inhoudelijk verschillend leesbaar.

#### Validation
- [x] Actieve pdf's volgen de huidige report contracts.
- [x] Sample-output claimt niet meer dan de echte output draagt.
- [x] Buyer-facing sample-output draagt geen vertrouwelijkheidsframing meer.

### Milestone 3 - Align Website Preview, Product Pages And Showcase Entry Points
Dependency: Milestone 2

- [x] Uitgevoerd op 2026-04-15: previewcontracten aangescherpt en productspecifieke showcase-ingangen toegevoegd.

#### Tasks
- [x] Previewcards, factornadruk en sample-report CTA's ondergebracht in één typed contract.
- [x] Hardcoded preview-elementen in `PreviewSlider` teruggebracht en afgeleid van previewcopy.
- [x] Productdetailpagina's gekoppeld aan canonieke voorbeeldrapporten.
- [x] Home en producten-overzicht teaser-first gelaten.
- [x] Tarieven en vertrouwen alleen ondersteunend gekoppeld aan sample-output.

#### Definition of done
- [x] Website-showcase en actieve sample-output vertellen hetzelfde productverhaal.
- [x] Preview is een eerlijke teaser en niet een los demo-universum.
- [x] De site heeft een beperkte showcase-flow met duidelijke primaire entry points.

#### Validation
- [x] Een buyer wordt minder verrast door verschil tussen preview en voorbeeldrapport.
- [x] ExitScan leest publiek als primaire first demo.
- [x] RetentieScan leest publiek als specifieke vervolgroute.

### Milestone 4 - Align Sales, Pricing, Trust And Prompt References Around The Same Sample Layer
Dependency: Milestone 3

- [x] Uitgevoerd op 2026-04-15: pricing, trust, docs/examples en promptverwijzingen afgestemd op dezelfde normset.

#### Tasks
- [x] Pricing- en trustpagina's voorzien van ondersteunende sample-output prooflagen.
- [x] `docs/examples/README.md` omgezet naar actieve normset met publieke mirrors en governance.
- [x] Promptverwijzingen opgeschoond naar actuele sample-assets en juiste planpaden.
- [x] Vastgehouden dat sample-output deliverable-proof is en geen case-proof.

#### Definition of done
- [x] Sample-assets ondersteunen sales, pricing, website en trust in dezelfde volgorde en met dezelfde betekenis.
- [x] Legacy-verwijzingen verstoren het normbeeld minder of niet meer.
- [x] Geen buyer-facing laag verkoopt sample-output als hard bewijs van effect of validatie.

#### Validation
- [x] Sales-, pricing- en trustlagen verwijzen impliciet of expliciet naar dezelfde actuele sample-realiteit.
- [x] Prompt- en docs-referenties wijzen naar de actieve normset.
- [x] Geen laag introduceert unsupported claims via showcaseframing.

### Milestone 5 - Add Governance, Acceptance And Regression Protection
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-15: testuitbreiding, acceptancechecklist, pdf-tracking en administratieve sluiting afgerond.

#### Tasks
- [x] Tests uitgebreid voor sample-generator, preview-contracten en sample-output framing.
- [x] Acceptance-checklist toegevoegd voor visuele kwaliteit, inhoudelijke juistheid en claimsgrenzen.
- [x] Governance vastgelegd voor refreshmomenten.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt als administratieve sluiting van dit traject.

#### Definition of done
- [x] De showcase-laag is inhoudelijk en commercieel reviewbaar.
- [x] Actieve sample-assets kunnen minder makkelijk ongemerkt verouderen of losraken.
- [x] Prompt-systeem, normset en checklist sluiten op elkaar aan.

#### Validation
- [x] Backend smoke-tests en parity-tests beschermen actuele sample-output.
- [x] Frontend tests beschermen preview/showcase-parity.
- [x] De checklist weerspiegelt de echte repo-status van dit traject.

## 3. Execution Breakdown By Subsystem

### Canonical sample asset system
- [x] Eén canonieke registry toegevoegd voor actieve, legacy en ondersteunende showcase-assets.
- [x] Docs-normset en publieke mirrors expliciet gekoppeld aan dezelfde actieve asset stack.
- [x] De normset klein gehouden: ExitScan sample, RetentieScan sample, portfolio-preview en productspecifieke previewvarianten.

### Generator and report-derived samples
- [x] De sample-generator deterministicer en buyer-facing veiliger gemaakt.
- [x] Actieve voorbeeld-pdf's expliciet gekoppeld aan de actuele report-engine.
- [x] Buyer-facing sample-output van vertrouwelijkheidsframing ontdaan via een expliciete samplemodus.

### Preview and website showcase
- [x] `PreviewSlider` gekoppeld aan typed previewcontracten in plaats van losse component-hardcodes.
- [x] Productspecifieke showcase-entry points toegevoegd op ExitScan en RetentieScan.
- [x] Tarieven en vertrouwen alleen ondersteunend gekoppeld aan sample-output.

### Sales, pricing and trust parity
- [x] Sample-output gebruikt als deliverable-proof en trustproof.
- [x] Pricing en trust verwijzen nu naar dezelfde actieve voorbeeldrapporten.
- [x] ExitScan blijft de standaard eerste showcase-route.

### Tests and acceptance
- [x] Acceptancechecklist toegevoegd.
- [x] Refresh-governance vastgelegd in referentiedocs.
- [x] Prompt- en checklistsluiting meegenomen in deze tranche.

## 4. Current Product Risks

- [x] Risico op te synthetische preview is verkleind door typed contracts, maar blijft gevoelig zodra previewcopy weer los van echte output gaat evolueren.
- [x] Risico op mismatch tussen demo en product is verlaagd via buyer-facing samplemodus en publieke pdf-mirrors.
- [x] Risico op normvervuiling door legacy-assets is verkleind via docs-, prompt- en registryscheiding.
- [x] Risico op te weinig verschil tussen ExitScan en RetentieScan voorbeelden blijft bewaakt via productspecifieke preview en sample-ingangen.
- [x] Risico op zwakke verkoopondersteuning door ontbrekende entry points is verkleind op productdetail, pricing en trust.
- [x] Risico dat generator-output niet deterministisch genoeg is, is verkleind via vaste demo-slug en vaste outputbestemmingen.
- [x] Risico op buyer-facing pdf's met onjuiste framing is verkleind via sample output mode.

## 5. Open Questions

- [ ] Willen we later een echte on-screen showcasevariant direct uit report payloads renderen?
- [ ] Willen we later productdetail ook voorzien van inline pdf-samenvattingen of thumbnails naast de download/open-link?
- [ ] Willen we sample-output later koppelen aan case-proof zodra echte klantcases beschikbaar zijn?

## 6. Follow-up Ideas

- [ ] Gebruik het pricing-traject later om sample-output nog preciezer te koppelen aan pakketverschillen en ritmevormen.
- [ ] Voeg later een automatische freshness-check toe die faalt wanneer publieke mirrors ontbreken of ouder zijn dan de docs-normset.
- [ ] Overweeg later een interactieve live sample die direct uit dezelfde report contracts rendert.
- [ ] Overweeg later een compacte boardroom one-pager als afgeleide van de actieve voorbeeld-pdf's.

## 7. Out of Scope For Now

- [x] Geen volledig website-redesign buiten showcase-parity en gerichte entry points.
- [x] Geen nieuw pricingprogramma of prijsarchitectuur.
- [x] Geen nieuwe productmethodiek, scoring of validatieclaims.
- [x] Geen case-proof, testimonials of ROI-verhalen zonder echte basis.
- [x] Geen brede demo-omgeving of aparte samplebibliotheek voor toekomstige producten buiten ExitScan en RetentieScan.

## 8. Defaults Chosen

- [x] `docs/active/SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md` is de source of truth voor dit traject.
- [x] `SAMPLE_OUTPUT_AND_SHOWCASE_PROGRAM_PLANMODE_PROMPT.md` blijft de leidende prompt voor dit onderwerp.
- [x] ExitScan blijft de primaire buyer-facing showcase-route.
- [x] RetentieScan blijft complementair en verification-first.
- [x] De actieve normset blijft gebaseerd op echte report-engine output.
- [x] Legacy `*_35_fictief.pdf` blijft alleen historisch referentiepunt.
- [x] Buyer-facing sample-assets krijgen fictieve-data-framing en geen vertrouwelijkheidsframing.
- [x] De publieke preview blijft teaser-first; de echte sample-output blijft de prooflaag.
- [x] `PROMPT_CHECKLIST.xlsx` wordt bijgewerkt op basis van feitelijke repo-uitvoering.
