# FOUNDER_LED_SALES_NARRATIVE_PLAN.md

## 1. Summary

Dit traject heeft het founder-led salesnarratief van Verisight aangescherpt op basis van de actuele repo-implementatie, zodat Lars Verisight niet meer vooral productmatig of improviserend hoeft uit te leggen, maar een vaste commerciële lijn krijgt voor discovery, demo en voorstel.

Uitgevoerde richting in deze tranche:

- ExitScan steviger vastgezet als primaire commerciële entreepropositie.
- RetentieScan explicieter neergezet als complementaire of specifieke route voor actieve-populatie vroegsignalering.
- Buyer-facing marketingcopy aangescherpt op managementvraag, routekeuze, bestuurlijke handoff en betaald eerste traject.
- Preview, dashboard en rapport dichter bij hetzelfde salesverhaal gebracht via een compactere boardroom- en sponsor-read.
- Een interne founder-led sales playbook en acceptance-checklist toegevoegd als vaste salesartefacten.
- Pricing- en contactcopy aangescherpt op eerste baseline, routekeuze en serieuze vervolgstap in plaats van vrijblijvende proef.

Belangrijkste opleveringen:

- [x] `docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md` toegevoegd als canonieke founder-led storyline, discovery-flow, demo-runbook, bezwaarstructuur en proposal spine.
- [x] `docs/reference/FOUNDER_LED_SALES_ACCEPTANCE_CHECKLIST.md` toegevoegd als handmatige reviewbasis voor discovery, demo, proposal en site parity.
- [x] `frontend/components/marketing/site-content.ts` aangescherpt op probleemopening, productladder, routekeuze, pricinglogica en bezwaren.
- [x] `frontend/components/marketing/contact-form.tsx` aangescherpt op managementvraag, eerste productroute en baseline-/vervolgframing.
- [x] `frontend/lib/report-preview-copy.ts` uitgebreid naar een explicietere boardroom- en demo-read met routekeuze, bestuurlijke handoff en productspecifieke demo-order.
- [x] Preview-, dashboard- en reportlagen aangescherpt rond compacte bestuurlijke handoff voor sponsor, MT en directie.
- [x] Relevante frontend-tests uitgebreid voor founder-led positionering en preview parity.

Status 2026-04-15:

- Uitgevoerd in deze ronde:
  - founder-led sales playbook vastgelegd in repo
  - buyer-facing routecopy aangescherpt voor ExitScan, RetentieScan en combinatie
  - pricing-FAQ uitgebreid met betaald baseline-/geen gratis pilot-framing
  - contactflow succes- en intakecopy aangescherpt op eerste route en vervolgstap
  - previewcopy en previewweergave aangescherpt op boardroom-read en demo-volgorde
  - dashboard- en report-content aangepast op compacte bestuurlijke handoff
  - frontend-regressietests uitgebreid
- Bewust niet volledig uitgevoerd in deze ronde:
  - geen groot website-redesign
  - geen CRM- of outbound-automatisering
  - geen aparte sales enablement-suite buiten de nieuwe playbook/checklist
  - geen nieuw pricingprogramma buiten buyer-facing founder-led aanscherping
  - geen volledige boardroom-herpositionering als zelfstandig traject

## 2. Milestones

### Milestone 0 - Freeze Current Founder-Led Sales Baseline
Dependency: none

- [x] Uitgevoerd op 2026-04-15: huidige founder-led salesgap gereconstrueerd uit site, preview, pricing, contactflow, rapportoutput en externe salesalignment.

#### Tasks
- [x] Huidige verhaalvolgorde gereconstrueerd over homepage, productpagina's, preview, aanpak, tarieven, contactflow en voorbeeldoutput.
- [x] Vastgelegd waar het bestaande verhaal te product-led, te trust-led of te diffuus opende.
- [x] ExitScan-, RetentieScan-, combinatie- en Baseline/Live-framing in kaart gebracht.
- [x] Bestaande buyer-facing bezwaren verzameld uit pricing FAQ, trustcopy, productcopy en externe salesnotities.

#### Definition of done
- [x] Er lag een repo-gebaseerd startbeeld van het huidige founder-led salesverhaal.
- [x] De belangrijkste gaten tussen huidige copy en een herhaalbaar commercieel gesprek waren expliciet.
- [x] Productgaten en narratieve salesgaten waren van elkaar onderscheiden.

#### Validation
- [x] Observaties kwamen uit marketingcopy, report preview, rapportoutput, strategie en externe salesreferenties.
- [x] ExitScan bleef zichtbaar de primaire entreepropositie; RetentieScan bleef complementair.

---

### Milestone 1 - Define The Founder-Led Narrative Contract
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-15: één canonieke founder-led saleslijn vastgelegd als reporeferentie.

#### Tasks
- [x] Canonieke storyline vastgelegd in `FOUNDER_LED_SALES_PLAYBOOK.md`.
- [x] Buyervarianten vastgelegd voor HR-manager, HR-directeur en MT/directie.
- [x] Claimladder en trustvolgorde vastgelegd.
- [x] Productladder vastgelegd voor ExitScan, RetentieScan, combinatie, Baseline en vervolglogica.
- [x] Richting vastgelegd dat trust reassurance is en niet de eerste verkoophaak.

#### Definition of done
- [x] Er is één decision-complete founder-led backbone voor gesprekken en demo's.
- [x] Productvolgorde, claimgrenzen en buyerframing liggen vast zonder open interpretatieruimte.
- [x] De verhaallijn sluit aan op pricing, trust, boardroom-read en echte productoutput.

#### Validation
- [x] Het contract botst niet met `STRATEGY.md`, `METHODOLOGY.md` of `TRUST_AND_CLAIMS_MATRIX.md`.
- [x] ExitScan blijft de standaard eerste commerciële instap.
- [x] RetentieScan schuift nergens op naar brede MTO of individuele predictor.

---

### Milestone 2 - Rebuild Discovery And Problem Opening
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: discovery-opening en routekeuzecopy aangescherpt in playbook, site-content en contactflow.

#### Tasks
- [x] Vaste discovery-opening vastgelegd vanuit buyer-pijn en managementconsequentie.
- [x] Discovery-volgorde vastgelegd in de playbook.
- [x] Routekeuze-copy aangescherpt in homepage-, productroute- en aanpakcontent.
- [x] Contactformulier aangescherpt op managementvraag in plaats van alleen productkeuze.
- [x] ExitScan explicieter gemaakt als wedge zonder RetentieScan te devalueren.

#### Definition of done
- [x] Lars kan Verisight openen met herkenbare pijn, heldere urgentie en logische routekeuze.
- [x] Discovery voelt minder als losse inventarisatie en meer als gecontroleerde toeleiding.
- [x] Probleemopening en verkoopopening lopen logisch in elkaar over.

#### Validation
- [x] De discovery-flow sluit aan op bestaande contactflow en CTA-routes.
- [x] Buyer-facing copy maakt duidelijker waarom ExitScan of RetentieScan de logische volgende stap is.
- [x] Openingscopy blijft commercieel scherp zonder diagnose-, causaliteits- of predictorclaim.

---

### Milestone 3 - Rebuild Product Narrative And Demo Flow
Dependency: Milestone 1 and Milestone 2

- [x] Uitgevoerd op 2026-04-15: demo- en productnarratief aangescherpt via previewcopy, previewweergave, productcopy en interne demo-runbook.

#### Tasks
- [x] Vaste demo-volgorde vastgelegd in de playbook.
- [x] Previewcopy aangescherpt op routekeuze, boardroom-read en productspecifieke demo-order.
- [x] Previewweergave uitgebreid met een expliciete bestuurlijke handoff.
- [x] Productbeschrijvingen, routecards en pricingcopy aangescherpt op primaire versus complementaire route.
- [x] Combinatie explicieter gekaderd als bewuste portfolioroute en niet als standaard upsell.

#### Definition of done
- [x] Er is een vaste demo-architectuur die discovery, productbelofte, trust en voorstel logisch verbindt.
- [x] Demo en buyer-facing copy vertellen hetzelfde kernverhaal over ExitScan, RetentieScan en combinatie.
- [x] Lars hoeft tijdens de demo minder ter plekke te beslissen wat eerst wordt getoond.

#### Validation
- [x] Preview gebruikt alleen bestaande of logisch afleidbare repo-assets.
- [x] ExitScan-preview voelt als primaire entree; RetentieScan-preview als complement of specifieke route.
- [x] Preview, productcopy en rapportoutput spreken elkaar niet tegen in managementbelofte of bewijsstatus.

---

### Milestone 4 - Build Objection Handling, Pricing Logic And Proposal Transition
Dependency: Milestone 2 and Milestone 3

- [x] Uitgevoerd op 2026-04-15: bezwaarstructuur, pricinglogica en proposal spine vastgelegd in de playbook en buyer-facing pricinglaag aangescherpt.

#### Tasks
- [x] Vaste bezwaarstructuur toegevoegd voor exitgesprekken, surveytools, MTO, predictor, individuele signalen, gratis pilot, combinatie en Baseline/Live.
- [x] Antwoordpatroon vastgelegd op erkenning, herframing, truthful claim en next step.
- [x] Proposal spine toegevoegd aan de playbook.
- [x] Pricing FAQ uitgebreid met betaald baseline-/geen gratis pilot-logica.
- [x] Contact- en pricingcopy aangescherpt op eerste traject en vervolgstap.

#### Definition of done
- [x] Lars kan voorspelbare bezwaren opvangen zonder terug te vallen op losse feature-uitleg.
- [x] De stap van gesprek naar betaald traject is serieuzer en minder vrijblijvend.
- [x] Pricing, proposal en vervolgroute vertellen dezelfde lijn als discovery en demo.

#### Validation
- [x] De bezwaarlaag botst niet met pricing FAQ, trustmatrix of methodologie.
- [x] Buyer-facing pricingcopy stuurt standaard naar een betaald eerste traject.
- [x] Baseline, Live, vervolgmeting en combinatie zijn commercieel logischer te onderscheiden.

---

### Milestone 5 - Define Sales Assets, Supporting Copy And Acceptance Criteria
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-15: interne salesassets, buyer-facing copy-aanpassingen en acceptance-checklist toegevoegd.

#### Tasks
- [x] Founder-led playbook toegevoegd als intern salesartefact.
- [x] Founder-led acceptance checklist toegevoegd voor handmatige review.
- [x] Buyer-facing copylagen aangescherpt in `site-content.ts`, `marketing-products.ts`, productpagina's, contactflow en previewcopy.
- [x] Dashboard-, report- en previewlagen dichter naar dezelfde compacte bestuurlijke handoff gebracht.
- [x] Frontend-tests uitgebreid op founder-led positioning en preview parity.

#### Definition of done
- [x] Het founder-led verhaal is niet alleen conceptueel, maar vertaald naar concrete repo-assets.
- [x] De uitvoerder heeft vaste artefacten voor talk track, discovery, demo, bezwaren en proposal.
- [x] Sitecopy, salescopy en gespreksflow zijn inhoudelijk consistenter geworden.

#### Validation
- [x] Homepage-, product-, pricing- en previewlagen ondersteunen hetzelfde kernverhaal.
- [x] Een buyer krijgt minder verschillende verhalen in gesprek, preview en pricingcopy.
- [x] Acceptance-criteria maken toetsbaar of het verhaal eenvoudiger, scherper en veiliger is.

---

### Milestone 6 - QA, Governance And Prompt-System Closure
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-15: tests, build, planbestand en prompt-checklist administratief afgesloten.

#### Tasks
- [x] Relevante frontend-tests gedraaid voor marketing-positioning, previewcopy en dashboard parity.
- [x] Relevante buildchecks gedraaid voor de aangepaste buyer-facing lagen.
- [x] `FOUNDER_LED_SALES_NARRATIVE_PLAN.md` toegevoegd onder `docs/active` als source of truth.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor deze promptregel.
- [x] Vervolgafhankelijkheden vastgelegd richting boardroom, sales enablement en pricing.

#### Definition of done
- [x] Het founder-led salestraject is inhoudelijk, administratief en regressietechnisch afsluitbaar.
- [x] Er is een duidelijke overdracht naar volgende commerciele trajecten zonder overlap.
- [x] Toekomstige wijzigingen kunnen het salesverhaal minder makkelijk los trekken van trust en productrealiteit.

#### Validation
- [x] Frontend checks groen bevestigd via `vitest` en `next build`.
- [x] Backend parity- en smokechecks groen bevestigd via `pytest`.
- [x] Checkliststatus bijgewerkt met datum en oplevernotitie.

## 3. Execution Breakdown By Subsystem

### Founder Narrative Backbone
- [x] `FOUNDER_LED_SALES_PLAYBOOK.md` vastgelegd als canonieke pitch, discovery-flow, demo-runbook, objection matrix en proposal spine.
- [x] ExitScan vastgezet als primaire commerciële entree.
- [x] RetentieScan vastgezet als complementaire of specifieke route voor actieve-populatie vroegsignalering.
- [x] Trust vastgezet als reassurance en claimsgrens, niet als eerste verkoophaak.

### Buyer-Facing Marketing Layers
- [x] `site-content.ts` aangescherpt op probleemframing, routekeuze, eerste baseline en betaalde eerste stap.
- [x] `marketing-products.ts` aangescherpt op compacte bestuurlijke handoff als onderdeel van de productbelofte.
- [x] Homepage-, producten-, aanpak- en tarievencopy deels aangescherpt waar die rechtstreeks op de founder-led lijn inhaken.
- [x] Pricing FAQ uitgebreid met expliciete paid-baseline framing.

### Contact, Demo And Preview
- [x] `contact-form.tsx` aangescherpt op managementvraag, routekeuze en vervolgstap.
- [x] `report-preview-copy.ts` uitgebreid op routekeuze, boardroom-read en demo-volgorde.
- [x] `preview-slider.tsx` uitgebreid met bestuurlijke handoff in de previewweergave.

### Dashboard And Report Support
- [x] ExitScan-dashboard aangescherpt op bestuurlijke relevantie, watchout en handoff-taal.
- [x] RetentieScan-dashboard aangescherpt op bestuurlijke relevantie, watchout en handoff-taal.
- [x] Campaign-detailcopy aangescherpt op senior decision read.
- [x] Backend report-content en PDF-engine uitgebreid met aparte bestuurlijke handoff-pagina en sponsor/directie-framing.

### QA And Acceptance
- [x] `FOUNDER_LED_SALES_ACCEPTANCE_CHECKLIST.md` toegevoegd als handmatige reviewbasis.
- [x] Frontend positioning- en previewtests uitgebreid voor founder-led salesframing.
- [x] Frontend build en backend parity-/smokechecks afgerond en bevestigd.

## 4. Current Product Risks

- [x] Risico op te diffuus founder-verhaal is verkleind door vaste pitch-, discovery- en demo-artefacten.
- [x] Risico op productverwarring is verkleind door sterkere ExitScan-eerst logica en scherpere combinatieframing.
- [x] Risico op te theoretische of te feature-gedreven uitleg is verkleind door probleem- en managementvraagframing in buyer-facing copy.
- [x] Risico op onveilige commerciële claims blijft bewaakt via trust- en claimsgrenzen in playbook, preview en pricingcopy.
- [x] Risico dat demo en site verschillende verhalen vertellen is verkleind via preview, productcopy en acceptance-checklist.
- [x] Risico dat trust het verhaal vertraagt blijft bestaan, maar trust is nu sterker gepositioneerd als reassurance in plaats van openingshaak.
- [x] Risico dat pricing en voorstel te vrijblijvend blijven is verkleind via expliciete paid-baseline framing.
- [x] Risico dat RetentieScan commercieel te zwaar voelt is verkleind, maar blijft afhankelijk van echte buyerfeedback.

## 5. Open Questions

- [ ] Willen we later aparte founder-led varianten voor inbound gesprekken versus outbound outreach, of blijft één uniforme kernlijn leidend?
- [ ] Willen we later een compacte boardroom one-pager als afgeleide van deze lijn, of valt dat volledig onder `BOARDROOM_READINESS_PLAN.md`?
- [ ] Willen we na eerste echte klantgesprekken de objection matrix op echte bezwaarpatronen herijken?
- [ ] Willen we de betaald-baseline framing later nog explicieter in homepage hero en CTA-copy trekken?

## 6. Follow-up Ideas

- [ ] Gebruik `BOARDROOM_READINESS_PLAN.md` om de founderlijn door te trekken naar directie- en bestuursgeschikte output en besluittaal.
- [ ] Gebruik `SALES_ENABLEMENT_SYSTEM_PLAN.md` om de founder-led lijn uit te bouwen naar bredere salesassets en teamhergebruik.
- [ ] Gebruik `PRICING_AND_PACKAGING_PROGRAM_PLAN.md` om prijslogica, Baseline/Live en combinatieverpakking verder te verscherpen.
- [ ] Gebruik `SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md` om demo- en voorbeeldoutput nog sterker verkoopbaar te maken.
- [ ] Gebruik echte buyer- en pilotfeedback om discovery-openingen, bezwaren en proposalframing verder te ijken.

## 7. Out of Scope For Now

- [x] Geen backend-, scoring- of surveyherontwerp.
- [x] Geen volledige boardroom-herpositionering als zelfstandig traject.
- [x] Geen groot website-redesign of funnelherbouw.
- [x] Geen CRM-, outbound- of mailautomatiseringsexecutie.
- [x] Geen case-proof, testimonials of klantlogo-claims zonder feitelijke basis.
- [x] Geen pricingprogramma buiten wat nodig is om het founder-led verhaal logisch te maken.
- [x] Geen verandering aan trust- en claimsgrenzen die al in de repo zijn vastgezet.

## 8. Defaults Chosen

- [x] ExitScan blijft de primaire commerciële entreepropositie.
- [x] RetentieScan blijft complementair, tenzij de buyer-vraag expliciet om actieve-populatie vroegsignalering draait.
- [x] De combinatie wordt alleen verkocht wanneer beide managementvragen echt bestaan; niet als standaard bundel.
- [x] Het founder-led verhaal opent met managementvraag en routekeuze, niet met productinventaris of trustuitleg.
- [x] Trust wordt gebruikt als geloofwaardigheidslaag en bezwaaropvang, niet als eerste commerciële pitch.
- [x] Baseline blijft de standaard eerste commerciële stap; Live en ritme zijn vervolglogica.
- [x] Het eerste aanbod wordt standaard als betaald, afgebakend traject gepositioneerd.
- [x] Claims blijven commercieel scherp, maar nooit harder dan de huidige methodiek-, privacy- en bewijsbasis draagt.
- [x] Repo-truth blijft leidend boven externe salesdocs; externe docs blijven alignment-input.
