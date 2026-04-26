# Verisight Content Operating System

Intern referentiedocument voor de canonieke contentlaag van Verisight over site, SEO, sample-proof, trust, sales en latere reservecontent.
Laatste update: 2026-04-15

## Doel

Dit document legt vast hoe Verisight content als systeem ordent in plaats van als losse marketing- of salesassets.

De commerciële first-buy waarheid en routehiërarchie worden niet zelfstandig in dit document vastgelegd; dit systeemdoc volgt de actieve canon.
Gebruik het als eerste referentie voor:

- buyer-facing websitecopy
- SEO-ingangen en solution pages
- sample-output, trustproof en salesproof
- routekeuze en surface ownership
- terminologie-, claims- en proof-review
- hergebruik over site, pricing, trust en sales
- growth-gates voor latere contentuitbreiding

## Wat dit document wel en niet is

### Wel

- de systeemlaag boven website, sample, trust en sales
- de contentkaart van huidige repo-surfaces
- de governancevolgorde voor buyer-facing content
- de grens tussen actieve content en latere reservecontent

### Niet

- een vervanger van productmethodiek, trust- of evidencetaxonomie
- een brede contentstrategie voor publicatievolume
- een blog- of thought-leadershipplan
- een portfolioherontwerp

## Source-of-truth volgorde

Gebruik bij spanning deze volgorde:

1. `docs/strategy/STRATEGY.md`
2. `docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md`
3. `docs/active/COMMERCIAL_AND_ONBOARDING_SIGNOFF.md`
4. `docs/active/PACKAGING_AND_ROUTE_LOGIC.md`
5. `docs/active/PRODUCT_LANGUAGE_CANON.md`
6. `docs/active/COMMERCIAL_LANGUAGE_PARITY_RECHECK.md`
7. `docs/reference/TRUST_AND_CLAIMS_MATRIX.md`
8. `docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md`
9. `docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md`
10. `docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md`
11. `frontend/lib/content-operating-system.ts`
12. buyer-facing registries zoals `site-content.ts`, `marketing-products.ts`, `seo-solution-pages.ts` en `sample-showcase-assets.ts`

Belangrijke interpretatie:

- `site-content.ts` is een implementatiecontainer en geen hoogste beslislaag.
- De content operating system-laag bouwt voort op portfolio-architectuur als expliciete upstream laag en hoort die keuzes niet opnieuw te openen.
- Bij spanning wint product- en proofwaarheid altijd van contentverleiding.

## Canoniek contentmodel

Verisight gebruikt nu zes vaste contentlagen.

### 1. Route content

- Doel: snelle keuze tussen ExitScan, RetentieScan en de combinatieroute.
- Voorbeelden: home-routeblokken, producten-overzicht, solution-page openingen.
- Hoofdtaak: buyer helpen bepalen welke managementvraag eerst telt.
- Hoofdgrens: geen overbelasting met pricing, trust of brede proof boven de vouw.

### 2. Proof content

- Doel: laten zien wat management daadwerkelijk terugkrijgt.
- Voorbeelden: sample-output, preview, showcase-ingangen, deliverable-proof.
- Hoofdtaak: productfit en deliverable-geloofwaardigheid versterken.
- Hoofdgrens: sample-proof blijft `deliverable_proof` en ondersteunend `trust_proof`, niet case-proof.

### 3. Trust content

- Doel: due diligence, claimsgrenzen, privacybasis en rapportlezing publiek toetsbaar maken.
- Voorbeelden: trusthub, privacy, DPA, trustcards, claimsmatrix.
- Hoofdtaak: reassurance en verificatie.
- Hoofdgrens: trust blijft niet de eerste pitch en opent geen parallelle awarenessfunnel.

### 4. Conversion content

- Doel: route-aware handoff naar kennismaking, pricing en aanpak.
- Voorbeelden: inline contactpanelen, CTA-architectuur, pricingintro, aanpakhubs.
- Hoofdtaak: buyer momentum behouden na route- en proofbegrip.
- Hoofdgrens: conversie mag producttaxonomie of claimsgrenzen niet vervormen.

### 5. Sales enablement content

- Doel: dezelfde route-, trust- en proofframing overdraagbaar maken buiten de site.
- Voorbeelden: one-pagers, comparison matrix, objection matrix, proposal spines.
- Hoofdtaak: gesprek, follow-up en voorstel in dezelfde taal laten blijven als de site.
- Hoofdgrens: salesassets mogen geen extra beloftes of bewijsniveaus introduceren.

### 6. Reserved growth content

- Doel: latere uitbreiding na portfolio-architectuur en eerste tractie.
- Voorbeelden: approved case-proof surfaces, lifecycle-content, beperkte objection-led thought pieces.
- Hoofdtaak: gecontroleerde groei zonder terminologische of commerciële drift.
- Hoofdgrens: geen brede blog, kennisbank of contentmachine in v1.

## Buyer-facing surface ownership

### Home

- Primaire vraag: welke managementvraag telt nu eerst?
- Mag dragen: routekeuze, premium proof teaser, centrale kennismakingsingang.
- Mag niet dragen: volledige trustlaag, volledige pricinglaag of alle proof tegelijk.

### Producten

- Primaire vraag: welke route past inhoudelijk het best?
- Mag dragen: chooser-first portfolio-overview en productonderscheid.
- Mag niet dragen: complete demo-flow, volledige pricinguitleg of brede due diligence.

### Productdetail

- Primaire vraag: wat levert deze route concreet op?
- Mag dragen: deliverable-proof, route-aware leadcapture, productfit en productspecifieke trustgrenzen.
- Mag niet dragen: parallelle portfolio- of bloglaag.

### Oplossingen

- Primaire vraag: welke bestaande productroute past bij deze scherpe intent?
- Mag dragen: compacte intent-ingang, producthandoff, inline form.
- Mag niet dragen: losse kennisbank, contenthub of thought-leadership vervanger.

### Tarieven

- Primaire vraag: wat is het eerste traject en wat volgt logisch daarna?
- Mag dragen: pricingankers, package-hierarchie, ondersteunend deliverable-proof.
- Mag niet dragen: nieuwe producttaxonomie of losse featurematrix.

### Aanpak

- Primaire vraag: hoe loopt het traject van akkoord naar eerste managementwaarde?
- Mag dragen: proceszekerheid, ownership, handoff en eerste waarde.
- Mag niet dragen: primaire productkeuze of volledige prooflaag.

### Vertrouwen

- Primaire vraag: wat kan een buyer publiek verifieren over methodiek, privacy en rapportlezing?
- Mag dragen: trusthub, claimsgrenzen, privacybasis en ondersteunende sample-proof.
- Mag niet dragen: eerste pitch of parallelle awarenessroute.

## Reviewketen voor nieuwe buyer-facing content

Nieuwe of gewijzigde buyer-facing content gaat in deze volgorde langs review:

1. strategy and portfolio fit
2. terminology fit
3. trust and claims fit
4. proof and evidence fit
5. surface fit
6. parity and tests

Praktische betekenis:

- klopt de content nog met de huidige first-buy truth: ExitScan als default, RetentieScan als volwaardige eerste route bij een expliciete actieve behoudsvraag, en de assisted productvorm daaronder?
- gebruikt de content canonieke product- en outputtaal?
- claimt de content niets dat trust-, methodiek- of privacydocs niet dragen?
- gebruikt de content sample, validation of case-proof op de juiste evidence-tier?
- staat de content op een surface die deze buyer-vraag hoort te dragen?
- moeten docs, tests, sample-output of checklists mee verversen?

## Hergebruikspatronen

Deze blokken mogen repo-breed worden hergebruikt mits de reviewketen intact blijft:

- productkern
- pricingframing
- trustuitleg
- sample-proof
- objections en comparison snippets
- route-aware CTA-framing

Deze assets mogen niet rechtstreeks buyer-facing worden hergebruikt zonder vertaling of approval:

- internal-only demo content
- learningdossiers
- case-candidates
- technische enum- of helpertermen
- validationdetails zonder juiste trust- of evidenceframing

## Growth gates

### Later toegestaan

- approved case-proof surfaces
- lifecycle- en expansion-content
- beperkte objection-led of theme-led assets met duidelijke productkoppeling
- compacte thought-leadership reserve als buyer-vragen en proofbasis dat echt dragen

### Bewust nog niet

- brede blog
- kennisbank
- grote topical SEO-clusters
- publicatiecadans als doel op zich
- losse social/distribution machine zonder repo-gedreven core
- contentverbreding naar toekomstige proposities voordat portfolio-architectuur expliciet is aangescherpt

## Update- en refresh governance

Herzie deze content operating system-laag wanneer:

- productvolgorde of portfolioframing verandert
- pricing of package-hierarchie verandert
- sample-output of evidence-tiering verandert
- trust- of claimsgrenzen veranderen
- solution pages of buyer-facing routing inhoudelijk verschuiven

Werk dan minimaal mee:

- de relevante active planfile
- deze referentiedoc
- eventuele acceptance checklists
- typed registries en tests
- `PROMPT_CHECKLIST.xlsx` wanneer een tranche administratief wordt gesloten

## Guardrails

- ExitScan blijft de default content-, SEO- en saleswedge in generieke buyer-flows.
- RetentieScan blijft een volwaardige first-buy route wanneer de actieve behoudsvraag primair is, en blijft verification-first in claims en proof.
- Combinatie blijft een portfolioroute en geen derde contentzwaartepunt.
- Sample-output blijft publieke proofdefault tot approved case-proof echt bestaat.
- Trust blijft reassurance en due diligence, niet de eerste pitch.
- Thought leadership blijft later-fase reservecontent.
- Content mag commercieel scherp zijn, maar nooit sneller lopen dan productwaarheid, proofstatus of terminologiecontracten.
