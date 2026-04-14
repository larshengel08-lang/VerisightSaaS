# TRUST_SIGNAL_PROGRAM_PLAN.md

## 1. Summary

Dit traject heeft de zichtbare trust-signals van Verisight aangescherpt over website, report preview, contactflow en publieke legal-supportlagen heen.

Uitgevoerde richting in deze tranche:

- ExitScan blijft zichtbaar de primaire entreepropositie; RetentieScan blijft complementair.
- De bestaande method-and-trust basis is buyer-facing zichtbaarder gemaakt via een publieke trusthub, snellere due-diligence links en sterkere reassurance in de marketinglaag.
- Preview en report-facing copy laten nu explicieter intended use, privacygrenzen, bewijsstatus en live-versus-demo-context zien.
- De kennismakingsflow communiceert nu professioneler wat er met een aanvraag gebeurt en verwijst zichtbaar naar trust-, privacy- en DPA-basis.
- Legal en trust zijn dichter tegen elkaar aangezet zonder onware of prematuur ogende legitimiteitsclaims toe te voegen.

Belangrijkste opleveringen:

- [x] gedeelde buyer-facing trust-contentlaag toegevoegd in `site-content.ts`
- [x] publieke trusthub toegevoegd op `/vertrouwen`
- [x] header, footer, homepage en marketing shells uitgebreid met trust- en due-diligence-links
- [x] report preview copy en previewweergave uitgebreid met trustblokken, demo-disclosure en interpretatiegrenzen
- [x] contactflow aangescherpt op reassurance, vervolgstap en publieke trustverwijzingen
- [x] privacy-, DPA- en voorwaardenpagina's gekoppeld aan dezelfde buyer-facing trustlaag
- [x] frontend- en backend-regressietests uitgebreid voor zichtbare trust-signals

Status 2026-04-14:

- Uitgevoerd in deze ronde:
  - zichtbare trust-taxonomie doorvertaald naar site-content en trusthub
  - buyer-facing trust-distributie toegevoegd over home, productroutes, shells, footer en legal
  - previewtrust aangescherpt op intended use, privacygrens, bewijsstatus en illustratieve demo-context
  - contactflow explicieter gemaakt over route-inschatting, reactietijd en publieke trustlagen
  - backend report trustnotes aangescherpt op n-grenzen en groepsniveau
  - regressietests, lint en build groen bevestigd
- Bewust niet uitgevoerd in deze ronde:
  - geen grote website-redesign
  - geen nieuwe scoring- of surveylogica
  - geen badges, testimonials, klantlogo's of securitycertificeringsclaims
  - geen founder-led salesherbouw of boardroom-herpositionering
  - geen formele bedrijfsclaims boven de huidige repo-basis

## 2. Milestones

### Milestone 0 - Freeze Current Visible Trust Baseline
Dependency: none

- [x] Uitgevoerd op 2026-04-14: de huidige zichtbare trustlaag is gereconstrueerd uit site, legal, report preview, backend report content en contactflow.

#### Tasks
- [x] Huidige trust-signals over home, productlagen, aanpak, tarieven, footer, legal, demo en contactflow in kaart gebracht.
- [x] Signalering geclassificeerd in methodiek, privacy, outputkwaliteit, procestrust en legitimiteit.
- [x] Expliciete, impliciete en ontbrekende signalen onderscheiden.
- [x] Externe afhankelijkheden gemarkeerd die nog niet als harde publieke claim mogen worden gebruikt.

#### Definition of done
- [x] Er lag een repo-gebaseerde trust-inventory als startbeeld voor de uitvoering.
- [x] Het onderscheid tussen copy/UI-gaten en echte externe afhankelijkheden was helder.

#### Validation
- [x] Baseline kwam uit marketingpagina's, legal, report preview, backend report content, contactflow en prompt-checklist.
- [x] ExitScan bleef de primaire entree en RetentieScan de complementaire route.

---

### Milestone 1 - Define The Visible Trust Signal System
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-14: een vaste buyer-facing trust-contentlaag en paginahierarchie ingevoerd.

#### Tasks
- [x] Vaste trust-taxonomie vastgelegd via gedeelde trust-items, quick links, trusthub-secties en supportcards.
- [x] Per laag bepaald waar methodische trust, privacy, outputtrust, procestrust en legitimiteit het zichtbaarst moeten landen.
- [x] Buyer-facing structuur begrensd op truthful signals zonder badges of zwaardere claims dan de repo draagt.
- [x] Vaste sitehierarchie gekozen: homepage voor snelle reassurance, shells voor context, trusthub voor verdieping en legal voor detail.

#### Definition of done
- [x] Er is een zichtbare truststructuur die over meerdere buyer-facing lagen herbruikbaar is.
- [x] Implementatiekeuzes liggen vast zonder nieuwe inhoudelijke claims te hoeven verzinnen.

#### Validation
- [x] De trustlaag sluit aan op `STRATEGY.md`, `METHODOLOGY.md` en `TRUST_AND_CLAIMS_MATRIX.md`.
- [x] Geen trust-signal schuift RetentieScan richting predictor, MTO of persoonsgerichte tool.

---

### Milestone 2 - Strengthen Website Trust Signals
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: trust is zichtbaarder gemaakt in site, shells, navigatie en een nieuwe publieke trusthub.

#### Tasks
- [x] Header, footer, homepage en marketingpage-shells uitgebreid met trust- en due-diligence-links.
- [x] Bestaande trust-signals concreter gemaakt op publieke zichtbaarheid, niet alleen op impliciete copy.
- [x] Nieuwe buyer-facing trusthub gebouwd op `/vertrouwen`.
- [x] Utility-links en legal-links uitgebreid zodat privacy, DPA en trust sneller vindbaar zijn.
- [x] Zichtbare "nog niet rond"-signalen niet verder geactiveerd in primaire commerciële flows.

#### Definition of done
- [x] De site voelt zichtbaarder professioneel en betrouwbaarder zonder redesign.
- [x] Trust-signals zijn logischer verdeeld over de buyer journey.

#### Validation
- [x] Home en productgerichte shells tonen trust op methodiek, privacy, output en proces.
- [x] Trusthub bevat alleen truthful signals en linkt door naar legal voor detail.
- [x] Producthelderheid op homepage en productroutes blijft intact.

---

### Milestone 3 - Strengthen Report, Demo And Showcase Trust
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: preview en report-facing trust zijn explicieter zichtbaar gemaakt.

#### Tasks
- [x] `report-preview-copy.ts` uitgebreid met trusttitels, trustpunten, demo-disclosure en intended-use framing.
- [x] `preview-slider.tsx` uitgebreid met een zichtbare trustrail naast proof-notes.
- [x] Demo-output duidelijker als illustratief gemaakt zonder afstand te nemen van de echte managementstructuur.
- [x] Backend report trustnotes aangescherpt op groepsniveau en n-grenzen.
- [x] Preview en report blijven productspecifiek consistent in bewijsstatus en interpretatiegrenzen.

#### Definition of done
- [x] Preview en rapport functioneren sterker als trust-signals op zichzelf.
- [x] Een buyer ziet nu zichtbaarder wat management wel ziet, wat de privacygrens is en wat de bewijsstatus nu is.

#### Validation
- [x] ExitScan-preview blijft framed als vertrekduiding zonder diagnose.
- [x] RetentieScan-preview blijft framed als groepssignaal zonder predictor- of performanceclaim.
- [x] Frontend preview copy en backend report-trustlagen blijven inhoudelijk in lijn.

---

### Milestone 4 - Strengthen Contactflow And Visible Operating Credibility
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: de kennismakingsflow communiceert nu professioneler hoe een aanvraag wordt ontvangen en opgevolgd.

#### Tasks
- [x] Contactformulier uitgebreid met trust-signals en uitleg over doel en gebruik van de aanvraag.
- [x] Success- en warning-states herschreven naar professionelere, buyer-facing feedback.
- [x] Verwijzingen toegevoegd naar trusthub, privacybeleid en DPA.
- [x] Route-inschatting en reactietijd explicieter gemaakt als onderdeel van de flow.
- [x] Geen sterkere operationele claims toegevoegd dan de repo-basis veilig ondersteunt.

#### Definition of done
- [x] De contactflow voelt veiliger, serieuzer en voorspelbaarder voor first-time buyers.
- [x] Succesfeedback vertelt niet alleen dat iets is verstuurd, maar ook wat de vervolgstap is.

#### Validation
- [x] Empty, error, success en warning states blijven duidelijk en coherent.
- [x] De flow blijft licht genoeg voor kennismaking en verhoogt de drempel niet onnodig.
- [x] Tekst blijft passend voor organisaties vanaf circa 200 medewerkers.

---

### Milestone 5 - Tighten Legal, Privacy And Legitimity Support
Dependency: Milestone 2 and Milestone 4

- [x] Uitgevoerd op 2026-04-14: trusthub, privacy, DPA en voorwaarden staan nu in een explicietere buyer-facing lijn.

#### Tasks
- [x] Privacy-, DPA- en voorwaardenpagina's gekoppeld aan de trusthub.
- [x] Een compacte publieke privacy/security answer layer toegevoegd op de trusthub.
- [x] Legitimiteit zichtbaar gemaakt met eerlijke signalen zoals Nederlandse dienst, EU-primary data, DPA, publieke contactroutes en geen trackingcookies.
- [x] Niet-gevalideerde of nog niet-formele signalen bewust niet toegevoegd als prominente trustclaim.
- [x] Legaltaal beter gepositioneerd als ondersteunende trustlaag voor kopers.

#### Definition of done
- [x] Juridische en trustlagen voelen als een samenhangend systeem.
- [x] Veel voorspelbare due-diligence-vragen worden publiek al opgevangen zonder salesfrictie.

#### Validation
- [x] Privacy-, DPA-, voorwaarden- en trusthubcopy spreken elkaar niet tegen.
- [x] Er zijn geen badges, certificeringen, klantlogo's of securityclaims toegevoegd zonder feitelijke basis.
- [x] Formele bedrijfsbasis wordt nog niet prominenter geclaimd dan de huidige repo ondersteunt.

---

### Milestone 6 - Add Trust Signal QA And Close The Prompt
Dependency: Milestone 3, Milestone 4 and Milestone 5

- [x] Uitgevoerd op 2026-04-14: regressiebescherming, planbestand en checklist zijn bijgewerkt voor deze tranche.

#### Tasks
- [x] Frontend marketing-positioning tests uitgebreid met trust-navigatie en trust-items.
- [x] Frontend preview-copy tests uitgebreid met trustpoints en demo-disclosure.
- [x] Backend paritytests uitgebreid op trusthub, previewtrust en report-trustnotities.
- [x] `TRUST_SIGNAL_PROGRAM_PLAN.md` toegevoegd als uitgevoerde source of truth.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor deze promptregel.

#### Definition of done
- [x] Zichtbare trust-signals zijn regressiebeschermd.
- [x] Het trust-signal traject is inhoudelijk en administratief afgerond in het promptsysteem.

#### Validation
- [x] `npm.cmd test -- --run lib/marketing-positioning.test.ts lib/report-preview-copy.test.ts`
- [x] `.\\.venv\\Scripts\\python.exe -m pytest tests/test_reporting_system_parity.py tests/test_retention_copy_parity.py`
- [x] `npm.cmd run lint`
- [x] `npm.cmd run build`

## 3. Execution Breakdown By Subsystem

### Marketing site
- [x] Header, footer, homepage en marketingpage-shells uitgebreid met trust- en legaldoorverwijzingen.
- [x] `site-content.ts` omgebouwd tot gedeelde buyer-facing trust-contentlaag.
- [x] Nieuwe publieke trusthub toegevoegd op `/vertrouwen`.

### Product positioning
- [x] ExitScan blijft zichtbaar de primaire entreepropositie.
- [x] RetentieScan blijft complementair en non-predictive.
- [x] Productpagina's profiteren van dezelfde trust-links en preview-uplift zonder productverwarring.

### Report and preview layer
- [x] Previewcopy uitgebreid met intended use, privacygrens, bewijsstatus en demo-disclosure.
- [x] Previewweergave toont nu een expliciete trustrail naast proof-notes.
- [x] Backend report trustnotes aangescherpt op groepsniveau en n-grenzen.

### Contact and buyer confidence
- [x] Contactflow communiceert nu duidelijker wat met een aanvraag gebeurt.
- [x] Success- en warningfeedback zijn professioneler en bruikbaarder gemaakt.
- [x] Trust, privacy en DPA zijn zichtbaar gekoppeld aan de contactflow.

### Legal and trust support
- [x] Privacy, DPA en voorwaarden verwijzen nu expliciet naar de trusthub.
- [x] Trusthub vangt een compacte publieke privacy/security answer layer op.
- [x] Alleen eerlijk aantoonbare legitimiteitsmarkers zijn buyer-facing toegevoegd.

### QA and governance
- [x] Frontend trust-tests uitgebreid.
- [x] Backend paritytests uitgebreid.
- [x] Deliverable-plan en prompt-checklist bijgewerkt als administratieve afsluiting.

## 4. Current Product Risks

- [x] Risico op te weinig zichtbare legitimiteit is verkleind, maar blijft deels afhankelijk van formele bedrijfsbasis buiten de repo.
- [x] Risico op trustgaten tussen site, rapport, demo, legal en contactflow is teruggedrongen door gedeelde trustcontent en tests.
- [x] Risico op voortijdige of onware trustclaims is beperkt doordat alleen repo-truth en bestaande legal basis zichtbaar zijn gemaakt.
- [x] Risico dat afwezigheid van basisinformatie twijfel oproept is verkleind via trusthub, trust quick links en legal alignment.
- [x] Risico dat het product inhoudelijk professioneel is maar zichtbaar te jong oogt is verkleind, maar nog niet volledig opgelost zonder latere boardroom- en saleslagen.

## 5. Open Questions

- [ ] Wanneer zijn formele bedrijfsgegevens definitief genoeg om prominenter publiek te tonen?
- [ ] Welke founder- of teamcredibility mag later publiek zichtbaar worden zonder het trust-signal traject te vermengen met founder-led sales?
- [ ] Wanneer is maildeliverability formeel genoeg afgerond om buyer-facing als explicieter operating signal te tonen?

## 6. Follow-up Ideas

- [ ] Gebruik `BOARDROOM_READINESS_PLAN.md` om de aangescherpte trustlaag door te trekken naar directie- en bestuursgeschikte output.
- [ ] Gebruik `FOUNDER_LED_SALES_NARRATIVE_PLAN.md` om bezwaren, demo-volgorde en vertrouwensverhaal in gesprekken te versterken.
- [ ] Bouw later een compact privacy/security answer pack uit zodra formele externe basis verder staat.
- [ ] Voeg echte klantproof pas toe zodra er pilots of case-evidence beschikbaar zijn.

## 7. Out of Scope For Now

- [x] Geen grote website-redesign.
- [x] Geen nieuwe productmodules, scoringwijzigingen of survey-uitbreidingen.
- [x] Geen badges, certificeringen, testimonials of klantlogo's zonder feitelijke basis.
- [x] Geen boardroom-herpositionering als hoofdtraject.
- [x] Geen brede SEO- of funneloptimalisatie buiten trust-signals.
- [x] Geen formele securitycertificeringsclaims zonder aantoonbare basis.

## 8. Defaults Chosen

- [x] ExitScan blijft de primaire entreepropositie; trust-signals mogen dat niet vertroebelen.
- [x] RetentieScan blijft complementair en houdt de strengste privacy- en bewijsstatusframing.
- [x] Trust wordt vooral zichtbaar gemaakt in bestaande buyer flows en output, niet alleen in juridische diepte.
- [x] `/vertrouwen` is toegevoegd als centrale publieke trustlaag naast privacy en DPA.
- [x] Alleen repo- of feitelijk aantoonbare signalen mogen publiek zichtbaar worden.
- [x] Formele legitimiteitsdata die nog niet rond is, wordt niet prominenter geclaimd.
- [x] Demo-output blijft expliciet illustratief maar gebruikt dezelfde managementstructuur en trustopbouw als live output.
- [x] Bestaande contact-API en productdefinities zijn hergebruikt; de uplift zit in content, presentatie, flow en regressiebescherming.
