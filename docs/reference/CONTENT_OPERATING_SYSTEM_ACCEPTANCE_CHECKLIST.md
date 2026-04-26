# Content Operating System Acceptance Checklist

Gebruik deze checklist wanneer contentgovernance, buyer-facing routing, sample-proof, trustcontent of sales parity verandert.
Laatste update: 2026-04-15

## System Read

- [ ] Er is een expliciet contentmodel met route, proof, trust, conversion, sales enablement en reserved growth.
- [ ] `docs/reference/CONTENT_OPERATING_SYSTEM.md` en `frontend/lib/content-operating-system.ts` noemen dezelfde contentlagen en defaults.
- [ ] ExitScan staat expliciet als default contentwedge en RetentieScan leest als volwaardige eerste route bij een expliciete actieve behoudsvraag, zonder de verification-first grens te verliezen.
- [ ] Portfolio-architectuur blijft expliciet als upstream dependency zichtbaar en wordt in deze tranche niet opnieuw geopend.

## Surface Ownership

- [ ] Home draagt routekeuze, teaser-proof en kennismaking, maar niet alle proof, trust en pricing tegelijk.
- [ ] Productdetail blijft de primaire plek voor deliverable-proof en route-aware leadcapture.
- [ ] Oplossingspagina's blijven compacte productingangen en geen kennisbank of bloglaag.
- [ ] Tarieven blijft packaging-first en opent geen nieuwe producttaxonomie.
- [ ] Vertrouwen blijft due diligence en reassurance en geen parallelle awarenessfunnel.

## Proof And Sales Parity

- [ ] Sample-output blijft `deliverable_proof` en ondersteunend `trust_proof`.
- [ ] Publieke proof blijft sample-first totdat approved case-proof bestaat.
- [ ] Salesassets gebruiken dezelfde product-, trust- en proofframing als de site.
- [ ] Geen buyer-facing content verkoopt sample-, validation- of case-evidence harder dan de huidige evidence-tiering draagt.

## Governance And Reuse

- [ ] Nieuwe buyer-facing content volgt de reviewketen strategy -> terminology -> trust/claims -> proof/evidence -> surface fit -> parity/tests.
- [ ] Productkern, pricingframing, trustuitleg en objection snippets worden hergebruikt zonder terminologische drift.
- [ ] Internal demo content, learningdossiers, case-candidates en technische helpertermen komen niet ongefilterd buyer-facing terecht.
- [ ] Relevante tests, planfiles en checklists worden mee ververst wanneer pricing, productvolgorde, trust, sample-output of routing verandert.

## Growth Control

- [ ] Thought leadership blijft later-fase reservecontent en geen actief v1-programma.
- [ ] Approved case-proof, lifecycle-content en beperkte thematic assets zijn als latere uitbreidingen benoemd, niet als huidige verplichting.
- [ ] Brede blog, kennisbank en topical SEO-clusters blijven bewust buiten scope.
- [ ] Contentgroei blijft gekoppeld aan product-, proof- en portfolio-maturiteit.

## Closure

- [ ] `docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md` blijft de source of truth voor deze tranche.
- [ ] `PROMPT_CHECKLIST.xlsx` weerspiegelt de feitelijke repo-uitvoering.
- [ ] De roadmap is opnieuw gesynchroniseerd wanneer checkliststatus is veranderd.
