# ACTION_CENTER_CANON

Last updated: 2026-04-26  
Status: active  
Source of truth: live `/beheer/klantlearnings` runtime, shared Action Center carrier contracts, dashboard boundary docs and follow-up ops cadence.

## Titel

Action Center Product Layer Canon

## Korte samenvatting

Deze canon legt Action Center vast als zelfstandige suiteproductlaag voor bounded follow-through. Action Center is geen buyer-facing dashboard, geen generieke customer-ops cockpit en geen nieuw commercieel productverhaal. Het is de admin-first laag waarin dossierstatus, assignment, reviewmoment en follow-upbesluit per live route expliciet blijven totdat een bounded uitkomst of bewuste stop zichtbaar is.

## Wat is geaudit

- [SOURCE_OF_TRUTH_CHARTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/SOURCE_OF_TRUTH_CHARTER.md)
- [CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md)
- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [PILOT_LEARNING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/PILOT_LEARNING_PLAYBOOK.md)
- [DASHBOARD_HOME_DECISION_LAUNCHER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/dashboard/DASHBOARD_HOME_DECISION_LAUNCHER.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/klantlearnings/page.tsx)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/dashboard/page.tsx)
- [action-center-shared-core.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-shared-core.ts)
- [action-center-mto.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-mto.ts)
- [action-center-exit.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-exit.ts)
- [action-center-shared-core.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-shared-core.test.ts)

## Belangrijkste bevindingen

- Action Center bestaat nu al als live gedeelde follow-through-laag op `/beheer/klantlearnings`.
- De gedeelde core is bewust smal: `follow_through`, dossier-first, reviewdruk zichtbaar, geen projectplanlaag en geen advisorylaag.
- Er zijn nu precies twee live consumers op deze laag: `MTO` en `ExitScan`.
- Dashboard en customer ops hebben al een andere, scherpere rol: dashboard is decision-first campaignread; customer ops is setup, activatie en deliverycontrole.

## Belangrijkste inconsistenties of risico's

- Zonder expliciete canon kan `/beheer/klantlearnings` te makkelijk alleen als learninglog of juist als brede ops-cockpit gelezen worden.
- Zonder grens met dashboard kan Action Center gaan lijken op een tweede managementdashboard.
- Zonder grens met customer ops kan follow-through vervagen in setup, activation of checkpointwerk.
- Zonder bounded consumer-regel kan elke nieuwe route impliciet als live adapter gaan gelden zonder governance of producttruth-signoff.

## Beslissingen / canonvoorstellen

### Wat Action Center is

Action Center is:

- een zelfstandige suiteproductlaag binnen de admin-first productstack
- de gedeelde follow-through- en closeoutlaag voor live routes met expliciete dossiersturing
- de plek waar `assignment`, `reviewmoment`, `owner`, `follow-upsignaal` en `bounded vervolgbesluit` bij elkaar blijven
- een multi-consumer surface met route-specifieke carriers boven dezelfde gedeelde core

Action Center opent pas echt zodra een traject niet alleen setup of eerste read vraagt, maar expliciete follow-through nodig heeft rond eigenaar, eerste stap, reviewdruk of closeoutbesluit.

### Wat Action Center niet is

Action Center is niet:

- het buyer-facing dashboard
- de primaire customer-ops setup- en activatielaag
- een generieke projectmanagementtool
- een brede advisory workspace
- een sales-, pricing- of suitepositioneringslaag
- een plek om nieuwe productclaims of maturityclaims te introduceren

### Verhouding tot dashboard

Dashboard blijft canoniek voor:

- campaignkeuze
- eerste managementread
- portfolio-overzicht
- rapport- en dashboardgebruik als managementinstrument

Action Center blijft canoniek voor:

- interne follow-through na of rond die read
- dossierstatus en reviewdruk
- bounded handoff naar vervolgrichting of closeout

Boundaryregel:

- dashboard toont wat nu gelezen of geopend moet worden
- Action Center toont wat intern nog vastgelegd, beoordeeld of gesloten moet worden
- dashboard mag Action Center niet vervangen als eigenaar-, review- of closurelaag
- Action Center mag dashboard niet vervangen als buyer- of managementread

### Verhouding tot customer ops

Customer ops blijft canoniek voor:

- organisatie- en campaignsetup
- respondentimport en activatie
- delivery exceptions en checkpointbevestigingen
- operator next steps tijdens assisted uitvoering

Action Center blijft canoniek voor:

- learningdossiers met expliciete follow-through
- first action, reviewmoment en follow-upbesluit
- routegebonden closeout en learning handoff

Beslisregel:

- gaat het om setup, launch, activation of delivery checkpoint? Gebruik customer ops
- gaat het om dossier, eigenaar, reviewdruk of bounded vervolgbesluit? Gebruik Action Center

### Live consumers en governance

De huidige live consumers zijn:

- `MTO` als carrier met `hr_central`, `department_only` en zichtbare reviewdruk
- `ExitScan` als carrier met `exit_only`, `explicit_named_owner` en verplichte follow-upreview

Governanceregel:

- nieuwe live consumers zijn pas toegestaan zodra de route al echt live is
- de route een expliciete carriercontractlaag heeft
- de gedeelde core bounded blijft tot `follow_through`
- andere toekomstige adapters expliciet inactief blijven tot aparte canon- en runtimebeslissing

`RetentieScan` en andere toekomstige adapters zijn dus niet impliciet live doordat Action Center nu bestaat.

### Assignments, reviews en follow-up moeten bounded blijven

Action Center-assignments zijn:

- klein
- expliciet eigenaar-gebonden
- direct gekoppeld aan een dossier
- bedoeld voor eerste stap, reviewvoorbereiding, handoff of closure

Action Center-reviewmomenten zijn:

- expliciet per dossier
- standaard binnen 10 werkdagen of eerder in bestaand managementoverleg
- een follow-throughcontrole, geen nieuw analysetraject

Action Center-follow-up blijft open totdat ten minste een van deze bounded uitkomsten expliciet is vastgelegd:

- managementactie-uitkomst
- bounded next route
- bewuste stopreden

Een open dossier zonder eigenaar, eerste stap of reviewmoment moet zichtbaar blijven als signaal en mag niet stilzwijgend verdwijnen in notities, mail of losse meetings.

### Commerciele en taalgrens

Action Center-taal blijft internal-first:

- `shared follow-through`
- `dossier-first`
- `reviewdruk`
- `bounded vervolg`
- `closeout`

Niet canoniseren in deze fase:

- nieuwe suiteclaims
- pricinglogica
- salescopy
- sitecopy
- buyer-facing value-framing voor Action Center als commercieel product

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [ACTION_CENTER_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ACTION_CENTER_CANON.md)
- Action Center expliciet vastgelegd als zelfstandige suiteproductlaag in plaats van impliciete learningpagina
- De boundary met dashboard en customer ops expliciet gemaakt
- Governance voor live consumers, assignments, reviews en follow-up bounded vastgezet

## Validatie

- De canon volgt de huidige live runtime in `frontend/lib/action-center-*.ts` en `/beheer/klantlearnings`.
- De canon introduceert geen nieuwe route, geen nieuwe adapter en geen nieuwe buyer-facing claim.
- De dashboardgrens volgt de bestaande decision-launcher waarheid.
- De opsgrens volgt de bestaande onboarding-, delivery- en follow-upcadence.

## Assumptions / defaults

- `/beheer/klantlearnings` blijft de huidige Action Center-surface totdat een latere repo-beslissing het pad of label wijzigt.
- `MTO` en `ExitScan` zijn de enige live consumers die nu canoniek benoemd mogen worden.
- Action Center blijft admin-first totdat latere canon expliciet een andere audience of permissionlaag opent.

## Next gate

Ops- en boundarydocumenten laten aansluiten op deze canon en daarna pas overwegen of extra live consumers dezelfde productlaag mogen gebruiken.
