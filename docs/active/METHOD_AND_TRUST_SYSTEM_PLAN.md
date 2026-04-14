# METHOD_AND_TRUST_SYSTEM_PLAN.md

## 1. Summary

Dit traject heeft de methodiek-, claims- en trustlaag van Verisight aangescherpt tot een samenhangend systeem over reference docs, productdefinities, dashboarduitleg, rapportcopy, websitecopy, legal pagina's en regressietests.

Uitgevoerde richting in deze tranche:

- ExitScan en RetentieScan scherper en consistenter gepositioneerd zonder productverwarring.
- Een gedeeld trustcontract vastgezet over wat het product wel is, niet is, hoe je de output leest, welke privacygrens geldt en welke bewijsstatus nu verdedigbaar is.
- Trust zichtbaarder gemaakt in dashboard, rapport, website, pricing, aanpak, privacy en DPA.
- Buyer-facing trust-signals concreter gemaakt zonder onzekere claims te verharden.
- Regressiebescherming toegevoegd voor diagnose-, predictor- en persoonsgerichte taal.

Belangrijkste opleveringen:

- [x] `docs/reference/METHODOLOGY.md` herbouwd tot platformbreed methode- en trustkader
- [x] `docs/reference/TRUST_AND_CLAIMS_MATRIX.md` toegevoegd als vaste claims- en reviewmatrix
- [x] frontend scan-definities uitgebreid met vaste trustvelden
- [x] backend productdefinities en report-methodology uitgebreid met hetzelfde trustcontract
- [x] dashboard methodologiekaart uitgebreid naar methode + trust + leeswijzer
- [x] product-, pricing-, aanpak-, privacy- en DPA-copy aangescherpt op dezelfde grenzen
- [x] preview- en paritytests uitgebreid op trust- en bewijsstatuscopy

Status 2026-04-14:

- Uitgevoerd in deze ronde:
  - reference-laag samengebracht rond een platformbreed methodiekdocument
  - claims- en trustmatrix toegevoegd voor buyer-facing lagen
  - frontend en backend op hetzelfde trustcontract gebracht
  - rapportmethodologie uitgebreid met trust-, interpretatie- en claimsgrensblokken
  - trust-signals en legal pagina's aangescherpt op groepsniveau, minimale n en bewijsstatus
  - regressietests uitgebreid en groen bevestigd
- Bewust niet uitgevoerd in deze ronde:
  - geen scoring-herontwerp
  - geen nieuwe survey-items
  - geen nieuwe productmodules
  - geen boardroom- of founder-led salesverhaal
  - geen formele externe validatieclaim boven huidige repo-basis

## 2. Milestones

### Milestone 0 - Freeze Current Method And Trust Baseline
Dependency: none

- [x] Uitgevoerd op 2026-04-14: huidige methode- en trustlaag vastgelegd op basis van repo-docs, report-content, marketingcopy, legal pagina's en tests.

#### Tasks
- [x] Huidige methode- en trustcontract repo-breed gereconstrueerd.
- [x] Per product vastgelegd wat expliciet wel wordt gezegd, wat impliciet wordt gesuggereerd en waar de lagen verschilden.
- [x] Asymmetrie tussen ExitScan-docs en RetentieScan-docs vastgesteld.
- [x] Bestaande testdekking op claims, privacy en non-predictive taal in kaart gebracht.

#### Definition of done
- [x] Er lag een scherp startbeeld van de huidige methodiek-, claims- en trustlaag.
- [x] De belangrijkste inconsistenties en lacunes waren herleidbaar per laag.

#### Validation
- [x] Observaties kwamen uit `docs/strategy`, `docs/reference`, `docs/active`, `backend/products/*`, `backend/report.py`, `frontend/lib/products/*`, `frontend/components/marketing/site-content.ts` en paritytests.

---

### Milestone 1 - Define The Verisight Method And Trust Contract
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-14: een vast trustcontract ingevoerd voor website, dashboard, rapport en legal.

#### Tasks
- [x] Vaste blokken gedefinieerd voor:
  - wat het product wel is
  - wat het product niet is
  - hoe je de output leest
  - welke privacygrens geldt
  - welke bewijsstatus nu verdedigbaar is
- [x] Gedeelde guardrails gescheiden van productspecifieke guardrails.
- [x] Vaste claim- en terminologielogica verankerd in reference docs en productdefinitions.
- [x] Bevestigd dat er geen externe API-wijziging nodig was.

#### Definition of done
- [x] Er is een decision-complete trustcontract voor site, rapport, dashboard en legal.
- [x] ExitScan en RetentieScan hebben elk een duidelijk eigen claim- en leesgrenskader.

#### Validation
- [x] Contract sluit aan op `STRATEGY.md`, externe claimsdoc van 2026-04-10, `RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md` en huidige report-/marketingimplementatie.

---

### Milestone 2 - Rebuild The Reference Layer Into One Trust System
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: de referentielaag is opnieuw opgebouwd als blijvende methode- en trustbasis.

#### Tasks
- [x] `docs/reference/METHODOLOGY.md` herbouwd tot platformbreed document voor beide producten.
- [x] RetentieScan-claim- en interpretatieregels uit actieve docs doorvertaald naar blijvende reference-laag.
- [x] `docs/reference/TRUST_AND_CLAIMS_MATRIX.md` toegevoegd als claims- en reviewmatrix.
- [x] Privacy- en trustdisclosures in gewone taal vastgelegd voor buyer-facing gebruik.

#### Definition of done
- [x] De documentlaag heeft weer een duurzame methodiek- en trustbasis.
- [x] Copywriters en implementers kunnen vanuit de repo-reference laag dezelfde claimgrenzen afleiden.

#### Validation
- [x] Repo-reference docs botsen niet meer met de actieve RetentieScan-validatiedocs.
- [x] Externe docs blijven referentie; de repo-reference laag is inhoudelijk leidend.

---

### Milestone 3 - Standardize Product And Report Trust Interfaces
Dependency: Milestone 1 and Milestone 2

- [x] Uitgevoerd op 2026-04-14: frontend- en backend-productlagen delen nu hetzelfde trustcontract.

#### Tasks
- [x] Frontend scan-definities uitgebreid met vaste trustvelden.
- [x] Backend productdefinities uitgebreid met hetzelfde contract.
- [x] Report methodology payloads uitgebreid met trust-, interpretatie- en claimsgrensrijen.
- [x] Trust-notes voor ExitScan en RetentieScan specifieker gemaakt.
- [x] Report preview copy en dashboard methodologiekaart in dezelfde lijn gebracht.

#### Definition of done
- [x] Publieke productinterfaces en report payloads dragen dezelfde truststructuur.
- [x] Inhoudelijke drift tussen frontend-definities, report-content en marketingcopy is teruggedrongen.

#### Validation
- [x] `frontend/lib/products/*`, `backend/products/*/definition.py`, `backend/products/*/report_content.py`, `frontend/lib/report-preview-copy.ts` en `backend/report.py` gebruiken nu hetzelfde contract.

---

### Milestone 4 - Integrate Trust Into Website And Legal Narrative
Dependency: Milestone 3

- [x] Uitgevoerd op 2026-04-14: trust is buyer-facing sterker verweven in product-, pricing-, aanpak- en legal copy.

#### Tasks
- [x] ExitScan- en RetentieScan-productpagina's aangescherpt op diagnose-/predictorgrenzen en leeswijzers.
- [x] Trust-signals concreter gemaakt in `site-content.ts`.
- [x] Aanpak- en tarievenpagina's explicieter gemaakt over trust, claimsgrenzen en productvolwassenheid.
- [x] Privacy- en DPA-pagina's inhoudelijk dichter bij het productverhaal gebracht.
- [x] RetentieScan-trust herschreven als professioneel ontwerpbesluit in plaats van losse juridische terughoudendheid.

#### Definition of done
- [x] Trust voelt op de website meer als onderdeel van productkwaliteit en volwassenheid.
- [x] Legal pagina's ondersteunen dezelfde kernboodschap als product- en pricingpagina's.

#### Validation
- [x] Productpagina's, aanpak, tarieven, privacy en DPA spreken elkaar niet tegen op claims, privacygrenzen en bewijsstatus.
- [x] ExitScan blijft zichtbaar de primaire entreepropositie.

---

### Milestone 5 - Add Trust And Claims QA Guardrails
Dependency: Milestone 3 and Milestone 4

- [x] Uitgevoerd op 2026-04-14: regressietests uitgebreid op trust-, bewijsstatus- en privacycopy.

#### Tasks
- [x] Frontend positioning- en previewtests uitgebreid.
- [x] Backend scoring- en reporting paritytests uitgebreid.
- [x] Retention copy paritytests uitgebreid op privacy/DPA-alignment.
- [x] Bestaande validation evidence guardrails intact gehouden.
- [x] Handmatige reviewchecklist vastgelegd in `TRUST_AND_CLAIMS_MATRIX.md`.

#### Definition of done
- [x] Methodiek- en trustdrift wordt actief bewaakt door tests en QA.
- [x] Toekomstige copy- of productwijzigingen kunnen minder makkelijk ongemerkt over de claimgrens gaan.

#### Validation
- [x] `npm.cmd test -- --run lib/marketing-positioning.test.ts lib/report-preview-copy.test.ts`
- [x] `.\\.venv\\Scripts\\python.exe -m pytest tests/test_scoring.py tests/test_reporting_system_parity.py tests/test_retention_copy_parity.py tests/test_report_generation_smoke.py tests/test_retention_validation.py`
- [x] `npm.cmd run lint`
- [x] `npm.cmd run build`

---

### Milestone 6 - Close The Prompt Trajectory
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-14: planbestand en checklist zijn bijgewerkt als administratieve afsluiting van deze tranche.

#### Tasks
- [x] `METHOD_AND_TRUST_SYSTEM_PLAN.md` toegevoegd onder `docs/active` als uitgevoerde source of truth.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor deze promptregel.
- [x] Vervolgafhankelijkheden voor `TRUST_SIGNAL`, `BOARDROOM_READINESS` en `FOUNDER_LED_SALES_NARRATIVE` impliciet vrijgemaakt door deze trustbasis.

#### Definition of done
- [x] Het method-and-trust traject is administratief en inhoudelijk afgesloten in het promptsysteem.
- [x] Vervolgtrajecten kunnen direct op deze trustbasis voortbouwen.

#### Validation
- [x] Checkliststatus voor `METHOD_AND_TRUST_SYSTEM_PLANMODE_PROMPT.md` staat op voltooid met datum en oplevernotitie.

## 3. Execution Breakdown By Subsystem

### Method reference layer
- [x] `METHODOLOGY.md` herbouwd van ExitScan-specifieke doc naar platformbreed methode- en trustkader.
- [x] `TRUST_AND_CLAIMS_MATRIX.md` toegevoegd als blijvende claims-, trust- en reviewmatrix.
- [x] RetentieScan-evidence en privacygrenzen beter gekoppeld aan de blijvende reference-laag.

### Public trust contract and interfaces
- [x] Frontend scan-definities uitgebreid met vaste trustelementen.
- [x] Backend productdefinities uitgebreid met hetzelfde trustcontract.
- [x] Geen nieuwe externe API-endpoints toegevoegd.
- [x] Geen wijziging aan response-opslag of scoring-wireformat nodig gehad.

### Website, pricing, process and legal layers
- [x] Productpagina's aangescherpt op methodische grenzen en trustcopy.
- [x] `site-content.ts` concreter gemaakt op trust-signals, privacy en claims.
- [x] Aanpak- en tarievenpagina's explicieter gemaakt over trust en leeswijzers.
- [x] Privacy- en DPA-copy dichter tegen het productverhaal aangezet.

### Report and dashboard language
- [x] Dashboard methodology card uitgebreid met trust- en bewijsstatusblokken.
- [x] Report methodology-sectie uitgebreid met trust-, interpretatie- en claimsgrensrijen.
- [x] ExitScan-trustnote explicieter gemaakt op non-diagnostisch en niet-extern-gevalideerd.
- [x] RetentieScan-trustnote explicieter gemaakt op groepsniveau, non-predictive gebruik en v1-status.
- [x] Report preview copy op dezelfde trustlijn gebracht.

### Tests and QA
- [x] Frontend positioning tests aangepast.
- [x] Frontend preview-copy tests aangepast.
- [x] Backend parity- en methodology tests aangepast.
- [x] Retention privacy/copy paritytests aangepast.
- [x] Lint groen herbevestigd.
- [x] Frontend productiebuild groen herbevestigd.
- [x] Backend smoke-, parity- en validation tests groen herbevestigd.

## 4. Current Product Risks

- [x] Risico op overclaiming is verkleind, maar blijft vooral bij RetentieScan het belangrijkste inhoudelijke risico.
- [x] Risico op te diffuse trusttaal is teruggedrongen door concretere trust-signals en vaste trustblokken.
- [x] Risico dat website, rapport en legal elkaar tegenspreken is verkleind door contractpariteit en tests.
- [x] Risico op privacy- of securitytwijfel is verkleind door concretere privacy- en DPA-copy.
- [x] Risico dat methodieknuance commercieel verkeerd landt is verkleind door buyer-facing leeswijzers, maar blijft gevoelig bij toekomstige salescopy.

## 5. Open Questions

- [ ] Willen we in een vervolgtraject de bewijsstatus ook als compact zichtbaar trust-element op publieke productpagina's tonen?
- [ ] Willen we formele bedrijfs- en security-signals uitbreiden zodra KvK- en due-diligence-basis definitief rond is?
- [ ] Willen we later een aparte buyer-page bouwen die uitlegt hoe je Verisight-output leest?

## 6. Follow-up Ideas

- [ ] Gebruik `TRUST_SIGNAL_PROGRAM_PLAN.md` om op deze basis zichtbaar trust-design uit te bouwen.
- [ ] Gebruik `BOARDROOM_READINESS_PLAN.md` om deze trusttaal door te vertalen naar directie- en bestuurstaal.
- [ ] Bouw later een compacte privacy/security answer pack voor sales en due diligence.
- [ ] Gebruik echte pilotfeedback om buyer-facing trust-signals verder te ijken.

## 7. Out of Scope For Now

- [x] Geen scoring-herontwerp.
- [x] Geen nieuwe survey-items.
- [x] Geen nieuwe productmodules.
- [x] Geen boardroom-redesign of founder-led salesherbouw.
- [x] Geen formele externe validatieclaim boven huidige repo-bewijslaag.
- [x] Geen wijziging aan externe API-vormen, database-schema of campagneflow.

## 8. Defaults Chosen

- [x] ExitScan blijft het primaire product en de primaire entreepropositie.
- [x] RetentieScan blijft complementair en houdt de strengste privacy-, interpretatie- en evidencegrenzen.
- [x] Repo-truth blijft leidend boven externe docs.
- [x] Trust moet in de productervaring voelbaar zijn, niet alleen in juridische teksten.
- [x] Methodiek en trust worden geborgd als gedeeld contract over docs, marketing, dashboard, rapport en legal heen.
- [x] RetentieScan blijft buyer-facing non-predictive, group-level en verification-first.
- [x] ExitScan blijft buyer-facing interpretatief, patroongericht en non-diagnostisch.
- [x] De implementatie standaardiseert bestaande content- en payloadcontracten zonder nieuwe externe API.
