# WAVE_03_SUITE_TRUST_PROOF_AND_OUTPUT_ALIGNMENT.md

## 1. Title

Align suite trust, proof, and output framing so the public site, sample-proof layer, and bounded follow-on products all describe the same evidence model without overstating what is publicly demonstrated.

## 2. Korte Summary

Deze wave volgt direct op:

- [WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md)

Na `WAVE_02` leest de suite commercieel al core-first. De resterende suite-normalisatiegap zit nu vooral in:

- trusttaal
- publieke prooflaag
- hoe sample-output en bounded follow-on output zich tot elkaar verhouden

De huidige parityrealiteit is:

- `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` hebben formele output parity
- de publieke sample-proof laag blijft echter bewust anchored op `ExitScan` en `RetentieScan`

Die asymmetrie is verdedigbaar, maar moet buyer-facing en in docs explicieter dezelfde taal spreken.

Status:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed wave after green completion: `WAVE_04_SUITE_NORMALIZATION_CLOSEOUT.md`

Huidige implementatie-uitkomst:

- [frontend/lib/report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts) maakt nu explicieter dat publieke deliverable-proof bewust core-first op `ExitScan` en `RetentieScan` blijft, terwijl bounded follow-on routes publiek vooral via productpagina en trustlaag worden gekaderd.
- [frontend/lib/sample-showcase-assets.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/sample-showcase-assets.ts) contracteert de portfolio-preview nu explicieter als teaser naar de kernroute-sample-rapporten in plaats van impliciete aparte follow-on sample-proof.
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts) en [frontend/public/llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt) vertellen nu dezelfde evidencewaarheid over core proof en bounded follow-on output.
- Relevante regressies zijn meegetrokken in [frontend/lib/report-preview-copy.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.test.ts) en [frontend/lib/sample-showcase-assets.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/sample-showcase-assets.test.ts).
- Validatie is groen:
  - `cmd /c npm test` -> `99 passed`
  - `cmd /c npm run build` -> groen
  - `cmd /c npx next typegen` -> groen
  - `cmd /c npx tsc --noEmit` -> groen

---

## 3. Why This Wave Now

De suite kan pas formeel genormaliseerd sluiten als de publieke evidence- en trustlaag niet rijker of vager verkoopt dan de huidige outputlaag werkelijk draagt.

Huidige repo-indicatie:

- [frontend/lib/report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts) positioneert de publieke previewlaag nog vooral rond de kernroutes
- [frontend/lib/sample-showcase-assets.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/sample-showcase-assets.ts) houdt de actieve pdf-prooflaag bewust bij `ExitScan` en `RetentieScan`
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts) en [frontend/app/vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx) moeten explicieter uitleggen hoe bounded follow-on output zich verhoudt tot die core prooflaag
- [frontend/public/llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt) moet dezelfde suite-evidencewaarheid compact samenvatten

---

## 4. Planned User Outcome

Na deze wave is publiek duidelijk:

- dat de suite meerdere volwassen producten heeft
- dat publieke deliverable-proof bewust core-first op `ExitScan` en `RetentieScan` blijft
- dat bounded follow-on routes wel formele output hebben, maar niet automatisch een aparte publieke samplebibliotheek nodig hebben
- dat trust, proof en outputgrenzen over de hele site hetzelfde vertellen

---

## 5. Scope In

- trustcopy op suiteniveau
- sample-proof framing
- rapport-/previewuitleg voor de portfolio- en trustlaag
- llms/public evidence samenvatting
- regressies rond report preview en sample proof

## 6. Scope Out

- nieuwe samplebestanden
- nieuwe proof formats
- pricing- of funnelaanpassingen
- nieuwe productscope

---

## 7. Dependencies

- [POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md)
- [WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md)
- [WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md)

---

## 8. Key Changes

- public trust copy makes the proof model more explicit
- portfolio preview clarifies that public sample-proof remains core-first
- sample-showcase registry and tests encode the intended asymmetry more explicitly
- llms/public summary reflects the same trust and proof boundaries

---

## 9. Belangrijke Interfaces / Contracts

### 9.1 Core Proof Contract

Publieke deliverable-proof blijft bewust anchored op:

- `ExitScan`
- `RetentieScan`

### 9.2 Follow-On Output Contract

Follow-on routes mogen:

- buyer-facing live zijn
- paritywaardige formele output hebben

maar hoeven niet automatisch:

- een eigen publieke sample-pdf
- een rijkere publieke prooflaag

te krijgen.

### 9.3 Suite Trust Alignment Contract

Trustpagina, previewlaag, sample registry en llms/public summary moeten exact dezelfde evidencewaarheid vertellen.

---

## 10. Primary Code Surfaces

- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/app/vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx)
- [frontend/lib/report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- [frontend/lib/sample-showcase-assets.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/sample-showcase-assets.ts)
- [frontend/public/llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt)
- [frontend/lib/report-preview-copy.test.ts](/C:/Users\\larsh\\Desktop\\Business\\Verisight\\frontend\\lib\\report-preview-copy.test.ts)
- [frontend/lib/sample-showcase-assets.test.ts](/C:/Users\\larsh\\Desktop\\Business\\Verisight\\frontend\\lib\\sample-showcase-assets.test.ts)

---

## 11. Work Breakdown

### Track 1 - Trust And Preview Alignment

Tasks:

- [x] Trustcopy explicieter maken over de core sample-proof anchors.
- [x] Portfolio previewlaag explicieter maken over bounded follow-on output.
- [x] Buyer-facing taal gelijk trekken tussen trust, proof en output.

Definition of done:

- [x] Trust en preview vertellen dezelfde evidencewaarheid.

### Track 2 - Sample Proof Registry Alignment

Tasks:

- [x] Sample-showcase registry scherper contracteren rond core-first proof.
- [x] Tests explicieter maken dat actieve pdf-proof bewust bij de kernroutes blijft.
- [x] llms/public summary gelijk trekken met die bewijslogica.

Definition of done:

- [x] De publieke prooflaag is expliciet, bounded en intern consistent.

### Track 3 - Validation Closeout

Tasks:

- [x] Relevante regressies draaien.
- [x] Build, typegen en tsc draaien.
- [x] Docs synchroon bijwerken met de feitelijke uitkomst.

Definition of done:

- [x] Trust/proof/output alignment is groen afgesloten.

---

## 12. Testplan

- [x] `cmd /c npm test`
- [x] `cmd /c npm run build`
- [x] `cmd /c npx next typegen`
- [x] `cmd /c npx tsc --noEmit`

---

## 13. Assumptions / Defaults

- Follow-on parity vereist niet automatisch follow-on sample-pdf parity.
- Core proof blijft bewust sample-first op `ExitScan` en `RetentieScan`.
- Trustcopy moet deze asymmetrie uitleggen, niet verbergen.

---

## 14. Acceptance

### Product acceptance
- [x] Trust, proof en output voelen suitebreed coherent.

### Codebase acceptance
- [x] Preview-, sample- en trustlagen spreken dezelfde evidence-taal.

### Runtime acceptance
- [x] Buyer-facing claims overschrijden de huidige outputlaag niet.

### QA acceptance
- [x] Relevante regressies en buildgates zijn groen.

### Documentation acceptance
- [x] Dit document is synchroon bijgewerkt met de feitelijke uitkomst.

---

## 15. Exit Gate

Deze wave is klaar wanneer:

- [x] core proof anchors expliciet zijn gemaakt
- [x] bounded follow-on output eerlijk is gepositioneerd
- [x] trust, preview, llms en sample registry hetzelfde verhaal vertellen
- [x] regressies en buildgates groen zijn
