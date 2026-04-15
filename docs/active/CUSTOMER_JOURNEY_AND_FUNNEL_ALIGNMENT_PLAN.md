# CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md

Status: uitgevoerd in repo  
Last updated: 2026-04-15  
Source of truth: dit bestand is leidend voor deze tranche.

## 1. Summary

Dit traject maakt van de huidige Verisight-klantreis een consistentere funnel van eerste interesse naar eerste productwaarde, gebaseerd op de actuele repo-implementatie in marketingsite, contactflow, sales-assets, setupwizard, dashboard en voorbeeldoutput.

Repo-defaults die bewust zijn aangehouden:

- ExitScan blijft de primaire wedge
- RetentieScan blijft complementair en verification-first
- Combinatie blijft secundair en alleen logisch als tweede route
- `Plan kennismaking` blijft de primaire CTA
- `Aanpak` blijft de buyer-facing handofflaag voor intake, uitvoering, livegang en eerste waarde

## 2. Milestones

### Milestone 1 - Freeze Current Journey Baseline And Funnel Truth
Dependency: none

#### Tasks
- [x] De huidige journey vastgelegd van homepage naar contactformulier, leadopslag, interne opvolging, setup, campaign livegang, dashboard en rapport.
- [x] Per stap expliciet benoemd wat al publiek zichtbaar is, wat alleen intern bestaat en wat nu volledig ontbreekt.
- [x] De huidige rol per pagina vastgezet: Home, Producten, productdetail, Tarieven, Aanpak, Vertrouwen.
- [x] De huidige handoffpunten vastgelegd tussen marketing, contact, beheer, campaign-operatie en managementoutput.
- [x] De huidige first-value thresholds expliciet gekoppeld aan repo-waarheid: detailweergave vanaf 5 responses, patroonanalyse vanaf 10, rapport en dashboard als eerste waarde.

#### Definition of done
- [x] Er ligt één controleerbaar repo-gebaseerd funnelbeeld van interesse tot eerste waarde.
- [x] De verschillen tussen publieke buyer flow en interne deliveryflow zijn expliciet benoemd.
- [x] De grootste frictiepunten en verwachtingsgaten zijn herleidbaar naar actuele implementatie.

#### Validation
- [x] Observaties zijn terug te voeren op actuele bestanden in marketingsite, contact API, backend leadflow, beheer en dashboard.
- [x] ExitScan is zichtbaar de default eerste route en RetentieScan de complementaire route.
- [x] Geen funnelconclusie leunt op aannames buiten de repo.

### Milestone 2 - Rebuild The Buyer-Facing Funnel Architecture Around Route, Proof And Next Step
Dependency: Milestone 1

#### Tasks
- [x] Voor elke publieke pagina één vaste conversion role vastgelegd: routekeuze, routeverdieping, kooprust, due diligence of handoff naar gesprek.
- [x] De CTA-architectuur herordend naar één primaire uitkomst: kennismaking met routecontext, niet losse generieke CTA-herhaling.
- [x] Vastgelegd dat ExitScan-productlagen de default eerste funnelroute blijven en dat RetentieScan alleen primair wordt bij expliciete actieve-populatievraag.
- [x] De combinatie expliciet secundair gehouden: wel zichtbaar, maar nooit als standaard eerste funnelkeuze.
- [x] Op Home, productdetail en Tarieven een expliciete “wat gebeurt na dit gesprek”-laag toegevoegd of aangescherpt.
- [x] `Aanpak` aangewezen als de canonieke buyer-facing handoffpagina voor intake, uitvoering, livegang en eerste output.
- [x] `Vertrouwen` en voorbeeldrapporten in de funnel gehouden als reassurance- en prooflaag, niet als aparte parallelle routes.

#### Definition of done
- [x] Elke kernpagina heeft één duidelijke taak in de funnel.
- [x] De route van productkeuze naar gesprek voelt lineairer en minder impliciet.
- [x] Proof, pricing en trust ondersteunen dezelfde routevolgorde.

#### Validation
- [x] Een buyer kan vanaf Home in maximaal drie inhoudelijke stappen bij een geloofwaardige kennismaking uitkomen.
- [x] De funnel blijft ExitScan-first zonder RetentieScan te degraderen tot feature.
- [x] Geen pagina verkoopt een vervolgstap die delivery of product nu niet dragen.

### Milestone 3 - Make Contact, Intake And Proposal Handoffs Decision-Ready
Dependency: Milestone 2

#### Tasks
- [x] De contactflow omgebouwd van generiek intakeformulier naar route-aware lead capture.
- [x] `ContactForm`, `/api/contact`, backend `ContactRequestCreate`, `ContactRequestResponse`, `ContactRequestRead` en het `ContactRequest` model uitgebreid met:
  - `route_interest`
  - `cta_source`
  - `desired_timing`
- [x] Vaste defaults gekozen:
  - `route_interest` expliciet gekozen waar mogelijk, anders inferred vanuit herkomstpagina
  - `cta_source` automatisch uit CTA-herkomst of routepagina
  - `desired_timing` als compacte buyer-facing keuze, niet als open intakeveld
- [x] De successtate van het contactformulier uitgebreid met een concrete next-step confirmation:
  - reactie binnen 1 werkdag
  - eerste route-inschatting
  - wat gevraagd wordt in het gesprek
  - wat nog niet gebeurt in deze stap
- [x] De interne leadlijst in beheer uitgebreid zodat routecontext, timing en CTA-herkomst zichtbaar zijn voor eerste opvolging.
- [x] De contactnotificatie-mail dezelfde context laten meesturen.
- [x] De proposal- en intake-overgang in salesdocs gealigend op dezelfde routecontext, zodat eerste opvolging direct kan landen op ExitScan Baseline, RetentieScan Baseline of een bewuste combinatieroute.

#### Definition of done
- [x] Een nieuwe lead komt niet meer contextloos binnen.
- [x] De eerste opvolging is direct productspecifiek en timing-aware.
- [x] Contact, intake en voorstel volgen dezelfde routekeuze als de website.

#### Validation
- [x] Frontend en backend leadcontracten blijven consistent.
- [x] Een lead vanaf `/producten/exitscan`, `/producten/retentiescan` en `/tarieven` komt met de juiste context binnen.
- [x] De buyer-successstate maakt duidelijk wat de eerstvolgende stap is en wat nog niet.

### Milestone 4 - Translate Assisted Delivery Into A Buyer-Facing First-Value Journey
Dependency: Milestone 3

#### Tasks
- [x] De huidige assisted setupflow vertaald naar buyer-facing taal zonder self-service te suggereren.
- [x] `Aanpak` uitgebreid met een expliciete volgorde:
  - kennismaking
  - intake en databasis
  - campaign setup en uitnodigingen
  - eerste responsopbouw
  - dashboard en rapport
  - eerste managementgesprek
- [x] Vastgelegd dat Verisight de uitvoerende partij blijft in setup, respondentimport en uitnodigingen; de buyer hoeft geen toolbeheer te doen.
- [x] De first-value belofte expliciet gekoppeld aan echte productdrempels:
  - eerste zichtbare signalen na eerste responses
  - voorzichtige lezing bij lage n
  - stevig patroonbeeld vanaf voldoende respons
- [x] Dashboard empty states, low-response states en closed-campaign states gecontroleerd en buyer-facing gealigend met de pre-sale belofte.
- [x] Eén compacte buyer-facing sectie toegevoegd die uitlegt wat een klant tussen akkoord en eerste rapport concreet mag verwachten.
- [x] Vastgelegd dat in deze tranche geen losse nieuwe onboarding-pagina nodig is; `Aanpak`, contact-successstate en dashboardstates vormen samen de handofflaag.

#### Definition of done
- [x] De assisted deliveryflow voelt publiek voorspelbaar en professioneel.
- [x] De buyer weet vóór aankoop beter wat intake, livegang en eerste waarde betekenen.
- [x] Eerste waarde wordt niet te vroeg of te hard beloofd.

#### Validation
- [x] Buyer-facing copy botst niet met de echte setupwizard of campaign-operatie.
- [x] Dashboard- en rapportstates bevestigen de verkochte journey in plaats van die te ondergraven.
- [x] Geen laag suggereert no-touch onboarding, directe live monitoring of gegarandeerd snelle inzichten zonder responsbasis.

### Milestone 5 - Add Funnel QA, Metrics, Acceptance And Prompt Closure
Dependency: Milestone 4

#### Tasks
- [x] Een funnel acceptance checklist toegevoegd voor:
  - routekeuze
  - CTA-consistentie
  - contacthandoff
  - intakeverwachting
  - first-value verwachting
  - productonderscheid
- [x] Regressiebescherming toegevoegd voor marketingflow, route-CTA’s, contact contracten en routecontext.
- [x] Lichte funnelinstrumentatie gedefinieerd zonder nieuwe zware analytics-stack:
  - route-page to contact start
  - contact submit
  - lead with route context
  - lead to active campaign
  - active campaign to first report
- [x] Vastgelegd dat v1 eerst werkt met interne funnelwaarheid via contact requests en campaign stats, niet met een groot extern analyticsprogramma.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLANMODE_PROMPT.md`.
- [x] Dit planbestand vastgelegd als source of truth voor latere implementatie en opvolgende funnel-/SEO-beslissingen.

#### Definition of done
- [x] Funnelalignment is inhoudelijk en regressietechnisch reviewbaar.
- [x] Toekomstige wijzigingen kunnen minder makkelijk weer losse marketing-sales-delivery-overgangen veroorzaken.
- [x] De promptadministratie sluit na uitvoering aan op de echte repo-status.

#### Validation
- [x] Frontend tests beschermen CTA-volgorde, routevolgorde en contact-entry points.
- [x] Backend tests beschermen de uitgebreide contact request- en leadopslagcontracten.
- [x] Praktische walkthrough bevestigt ten minste deze scenario’s:
  - ExitScan-first buyer
  - RetentieScan-first buyer
  - combinatie pas na tweede routevraag
  - lage-respons campaign
  - eerste rapport beschikbaar

## 3. Execution Breakdown By Subsystem

### Public website and page roles
- [x] Home blijft de ingang voor snelle routekeuze, deliverable-proof en gesprek.
- [x] Productdetail blijft de primaire plek voor routeverdieping en voorbeeldrapporten.
- [x] Tarieven blijft kooprust geven via eerste trajecten en logische vervolgvormen.
- [x] Aanpak is de canonieke handofflaag voor intake, uitvoering, livegang en eerste waarde.
- [x] Vertrouwen blijft due-diligence ondersteuning en geen parallelle funnel.

### CTA and route architecture
- [x] Primaire CTA blijft `Plan kennismaking`; geen self-serve checkout en geen kalenderembed in deze tranche.
- [x] CTA’s zijn route-aware via herkomstcontext.
- [x] ExitScan blijft de default eerste CTA-context wanneer geen expliciete route gekozen is.
- [x] RetentieScan krijgt alleen primair gewicht wanneer de actieve behoudsvraag expliciet is.
- [x] Combinatie blijft secundair en nooit de standaard contactinsteek.

### Contact and lead contract
- [x] Marketingformulier, frontend API en backend leadmodel kregen routecontext en timingcontext.
- [x] Admin leadlijst toont dezelfde context als het buyerformulier.
- [x] Interne notificatiemail volgt hetzelfde contract.
- [x] De eerste opvolging wordt daarmee direct route- en fasegericht.

### Sales and intake handoff
- [x] Sales follow-up en proposal-overgang zijn direct gekoppeld aan de routecontext uit de funnel.
- [x] ExitScan leads landen standaard op ExitScan Baseline.
- [x] RetentieScan leads landen alleen op RetentieScan Baseline bij expliciete behoudsvraag.
- [x] Combinatie blijft alleen logisch wanneer twee managementvragen echt bestaan.
- [x] Geen gratis pilot als standaard vervolgstap.

### Delivery and first-value alignment
- [x] Assisted setup blijft de verkochte waarheid.
- [x] Buyer-facing copy legt uit dat Verisight organisatie, campaign, import en inviteflow begeleidt.
- [x] First-value messaging is gekoppeld aan echte response- en rapportdrempels.
- [x] Dashboardstates en rapportbelofte zijn in dezelfde journeytaal gebracht.

### Metrics and validation
- [x] V1 meet funnelgezondheid primair via interne lead- en campaigndata.
- [x] Geen aparte SEO- of demandgen metrics in dit traject.
- [x] Regressietests richten zich op CTA-flow, routecontext, contactcontract en first-value-copy.
- [x] Handmatige acceptance richt zich op complete funnelverhalen, niet alleen losse paginacopy.

## 4. Current Product Risks

- Live production browserchecks zijn in deze tranche niet uitgevoerd; runtime-checks zijn lokaal op de devserver gedaan.
- Er is geen nieuwe externe analytics- of eventstack toegevoegd; metrics zijn alleen als v1-definitie vastgelegd.
- De tranche voegt geen nieuwe onboarding-pagina toe; de handoff blijft bewust verdeeld over `Aanpak`, contact-successstate en bestaande dashboardstates.

## 5. Open Questions

- [ ] Willen we na deze tranche een echte post-submit bedankpagina toevoegen, of blijft een rijke inline successtate voldoende?
- [ ] Willen we later alsnog een aparte onboarding- of livegangpagina, of blijft `Aanpak` structureel de buyer-facing handofflaag?
- [ ] Willen we de eerste follow-up mail later ook als repo-asset expliciet beheren?
- [ ] Willen we na eerste live funneldata nog een tweede tranche voor proposal- en response-time optimalisatie?

## 6. Follow-up Ideas

- Gebruik dit plan daarna als randvoorwaarde voor `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLANMODE_PROMPT.md`.
- Gebruik dit plan daarna als input voor `IMPLEMENTATION_READINESS_PROGRAM_PLANMODE_PROMPT.md`.
- Gebruik dit plan daarna als basis voor `SEO_CONVERSION_PROGRAM_PLANMODE_PROMPT.md`, pas nadat de nieuwe funnel stabiel is.
- Voeg later een case-proof laag toe zodra echte klantcases de overgang van contact naar eerste waarde geloofwaardig kunnen ondersteunen.
- Overweeg later een compacte “wat gebeurt na akkoord” buyer asset voor proposals en handoffmails.

## 7. Out of Scope For Now

- [x] Geen self-service onboarding of checkout.
- [x] Geen Stripe, subscriptionlogica of plans/seats-model.
- [x] Geen kalender- of meeting-tool als primaire CTA.
- [x] Geen nieuw CRM of outbound-automatiseringssysteem.
- [x] Geen groot SEO-programma.
- [x] Geen nieuwe productfamilies buiten ExitScan, RetentieScan en combinatie.
- [x] Geen verzonnen case proof, ROI-claims of testimoniallaag.
- [x] Geen herbouw van scoring, methodiek of report engine buiten funnel- en handoffalignment.

## 8. Defaults Chosen

- [x] `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLANMODE_PROMPT.md` blijft de leidende prompt voor dit traject.
- [x] `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md` is de source of truth.
- [x] ExitScan blijft de default eerste route in de funnel.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Combinatie blijft secundair en alleen inhoudelijk logisch als tweede route.
- [x] `Plan kennismaking` blijft de primaire CTA; geen self-serve booking in deze tranche.
- [x] `Aanpak` is de canonieke buyer-facing handoffpagina voor intake, livegang en eerste waarde.
- [x] Contactflow is uitgebreid met routecontext, CTA-herkomst en compacte timingcontext.
- [x] Funnelmetrics blijven in v1 licht en intern; geen zware externe analytics-stack als voorwaarde.
- [x] `PROMPT_CHECKLIST.xlsx` is na uitvoering bijgewerkt.

## 9. Validation Run

- [x] `python -m pytest tests/test_api_flows.py -q`
- [x] `npm.cmd test -- marketing-flow.test.ts`
- [x] `npm.cmd exec tsc -- --noEmit`
- [x] `npm.cmd run lint -- .`
- [x] `npm.cmd run build`
- [x] Lokale runtime-checks op devserver voor:
  - `/`
  - `/producten`
  - `/producten/exitscan`
  - `/producten/retentiescan`
  - `/producten/combinatie`
  - `/tarieven`
  - `/aanpak`
- [x] Contactformulier runtime-check bevestigt zichtbaarheid van routekeuze, timing en handoff-copy.

## 10. Files That Carry This Tranche

- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
- [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/contact/route.ts)
- [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [email.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/email.py)
- [contact_request.html](/C:/Users/larsh/Desktop/Business/Verisight/templates/emails/contact_request.html)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
- [producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
- [producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [aanpak/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/aanpak/page.tsx)
- [contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)
- [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [marketing-page-shell.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/marketing-page-shell.tsx)
- [marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)
- [test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)
- [CUSTOMER_JOURNEY_FUNNEL_ACCEPTANCE_CHECKLIST.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/CUSTOMER_JOURNEY_FUNNEL_ACCEPTANCE_CHECKLIST.md)
- [SALES_PRODUCT_DECISION_TREE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SALES_PRODUCT_DECISION_TREE.md)
- [SALES_PROPOSAL_SPINES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SALES_PROPOSAL_SPINES.md)
- [PROMPT_CHECKLIST.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_CHECKLIST.xlsx)
