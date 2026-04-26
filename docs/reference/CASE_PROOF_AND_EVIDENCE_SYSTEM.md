# Verisight Case Proof And Evidence System

Intern referentiedocument voor de canonieke case-proof- en evidencelaag van Verisight.
Laatste update: 2026-04-15

## Doel

Dit document legt vast hoe Verisight bewijs ordent tussen deliverable-proof, trustproof, validatie, case-opbouw en referentiegebruik.

Commerciële first-buy truth en routehiërarchie worden niet zelfstandig in dit document bepaald; daarvoor winnen de actieve strategy-, pricing- en signoff-docs.

Gebruik het als eerste referentie voor:

- evidence-tiers en claimgrenzen
- scheiding tussen sample-output, demo, validatie en klantbewijs
- case-candidate capture vanuit pilots en vroege klanten
- approvalflow voor buyer-facing case-proof
- surface-keuzes voor site, sales, pricing, trust, demo en follow-up

## Source-of-truth volgorde

Gebruik bij spanning deze volgorde:

1. `docs/strategy/STRATEGY.md`
2. `docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md`
3. `docs/active/COMMERCIAL_AND_ONBOARDING_SIGNOFF.md`
4. `docs/reference/TRUST_AND_CLAIMS_MATRIX.md`
5. `docs/reference/METHODOLOGY.md`
6. `docs/active/PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md`
7. `docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md`
8. dit document
9. `frontend/lib/case-proof-evidence.ts`

## Baseline van de huidige repo

De huidige buyer-facing prooflaag bestaat in de repo uit:

- sample-output als deliverable-proof
- trustcopy en methodische claimgrenzen als trustproof
- product- en validatiedocs als validation evidence
- internal-only learningdossiers als bron voor toekomstige case-opbouw

Wat nu nog niet bestaat als buyer-facing waarheid:

- named testimonials
- publieke outcome claims op echte klanten
- logo use
- named references
- ROI-verhalen

## Canonieke evidence-taxonomie

### `deliverable_proof`

- Intended use: laat zien hoe dashboard, rapport en managementstructuur eruitzien.
- Buyer use: site, pricing, trust en sales mogen dit gebruiken als output-preview.
- Approval rule: geen klanttoestemming nodig zolang de asset volledig fictief en expliciet illustratief blijft.
- Verboden gebruik: niet verkopen als echte klantuitkomst, effectbewijs of marktbewijs.

### `trust_proof`

- Intended use: laat zien hoe privacy, methodiek, n-grenzen, rapportlezing en productgrenzen zijn ingericht.
- Buyer use: trustpagina, due diligence, objection handling.
- Approval rule: intern claims- en parity-review.
- Verboden gebruik: trustproof mag geen verborgen outcome claim bevatten.

### `validation_evidence`

- Intended use: methodische validatie, measurement QA en evidence over wat een model wel en niet draagt.
- Buyer use: vooral intern, trust-ondersteunend of in zorgvuldige sales context.
- Approval rule: alleen gebruiken binnen de bestaande validation- en claimsdocs.
- Verboden gebruik: synthetische, dummy- of showcase-data tellen nooit als market evidence.

### `case_candidate`

- Intended use: internal-only tussenlaag voor ruwe case-opbouw vanuit pilots en vroege klanten.
- Buyer use: niet publiek; hoogstens intern voor voorstelvoorbereiding.
- Approval rule: moet provenance, claimbare observaties, supporting artifacts en context bevatten.
- Verboden gebruik: case-candidates mogen niet rechtstreeks naar site, pricing of named salesproof.

### `approved_case_proof`

- Intended use: buyer-safe mini-case, anonieme case, outcome summary of quote card met expliciete basis.
- Buyer use: sales, follow-up en later eventueel site, zolang de format- en approvalregels gevolgd zijn.
- Approval rule: `draft -> internal_review -> claim_check -> customer_permission -> approved`.
- Verboden gebruik: geen named quote, logo, ROI-claim of resultaatclaim zonder expliciete toestemming en basis.

### `reference_ready`

- Intended use: zorgvuldig voorbereide referentie-inzet voor warme deals en due diligence.
- Buyer use: alleen in directe salescontext en nooit als generieke publieke claim.
- Approval rule: approved case-proof plus expliciete reference-permission.
- Verboden gebruik: reference-ready betekent niet automatisch publiek of named marketingmateriaal.

## Canonieke proofformats

Verisight gebruikt hiervoor vaste formats:

- mini-case
- anonieme case
- quote card
- reference note
- outcome summary
- objection-proof snippet

Per format gelden deze minimumregels:

- er is een expliciete evidence-tier
- er is een vastgelegde claim boundary
- er is een toestemmingstatus
- er is een approvalstatus
- er is herleidbare supporting context in de learninglaag

## Buyer surface matrix

### Site

- Huidige default: `deliverable_proof` plus `trust_proof`
- Pas later toevoegen: `approved_case_proof`
- Niet toegestaan: `case_candidate`, `reference_ready`

### Sales

- Toegestaan: `deliverable_proof`, `trust_proof`, `approved_case_proof`, `reference_ready`
- Voorwaardelijk: `validation_evidence` alleen als claimgrens expliciet mee wordt verteld
- Niet toegestaan: ruwe case-candidates als bewijsclaim

### Demo

- Toegestaan: demo- en samplematerialen als gecontroleerde illustratie
- Verplichting: expliciet scheiden van klantbewijs
- Niet toegestaan: demo-output framen als case-proof

### Pricing

- Huidige default: `deliverable_proof` plus `trust_proof`
- Later toegestaan: compacte `approved_case_proof` als pricing-proof
- Niet toegestaan: unnamed of unapproved case anecdotes

### Trust

- Huidige default: `trust_proof` plus `deliverable_proof`
- Later toegestaan: alleen evidence-tier-correcte cases
- Niet toegestaan: validation of sample-output als marktbewijs verkopen

### Follow-up

- Toegestaan: `approved_case_proof`, `reference_ready`, `trust_proof`
- Doel: buyer helpen van interesse naar vervolgstap zonder overclaiming

## Productspecifieke defaults

- ExitScan blijft de default publieke case-anchor in generieke proofflows.
- RetentieScan kan een geldige eerste evidence-route zijn wanneer de actieve behoudsvraag primair is, maar blijft verification-first en bewijstechnisch strenger.
- De eerste publieke prooflaag groeit anoniem of minimaal herleidbaar.
- Named proof is nooit de default.

## Approval en refresh governance

Gebruik deze approvalvolgorde:

1. `draft`
2. `internal_review`
3. `claim_check`
4. `customer_permission`
5. `approved`

Refresh en review zijn verplicht wanneer:

- buyer-facing copy de bewijslaag raakt
- nieuwe outcome claims worden toegevoegd
- named proof of references worden overwogen
- sample-output, trustcopy of salesassets andere evidence-tiers gaan suggereren

## Guardrails

- Sample-output blijft deliverable-proof en trustproof, niet case-proof.
- Synthetische, dummy- en showcase-data tellen nooit als market evidence.
- Internal-only lessons worden pas buyer-facing na expliciete evidence- en claimreview.
- ExitScan blijft de default eerste publieke case-anchor in generieke buyer-flows.
- RetentieScan krijgt pas een eigen publieke case-anchor zodra daar echte bewijsbasis voor is; tot die tijd blijft die route verification-first en vraaggestuurd.
- Named testimonials, logo use en ROI-verhalen zijn verboden zonder expliciete basis en toestemming.
