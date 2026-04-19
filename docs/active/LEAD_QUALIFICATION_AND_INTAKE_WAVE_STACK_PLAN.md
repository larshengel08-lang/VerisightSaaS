# LEAD_QUALIFICATION_AND_INTAKE_WAVE_STACK_PLAN.md

## 1. Summary

Dit document zet de **uitvoerbare implementatie-wave stack** voor lead qualification en intake vast op basis van:

- [LEAD_QUALIFICATION_AND_INTAKE_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LEAD_QUALIFICATION_AND_INTAKE_IMPLEMENTATION_PLAN.md)

De kernbeslissing van deze stap is:

- qualification/intake krijgt nu een **gerichte operationele upgrade**
- die upgrade gebeurt in **kleine, gecontroleerde waves**
- de suite blijft daarbij expliciet **core-first**
- `ExitScan` blijft de default wedge
- `RetentieScan` blijft de enige situationeel primaire uitzondering
- `Combinatie` blijft een expliciet kleinere portfolioroute
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven bounded follow-on routes

Belangrijkste uitkomst uit de huidige codebase:

- de contactflow is al buyer-facing core-first geordend
- de publieke contactcopy zet de juiste suitehiërarchie al neer
- de daadwerkelijke qualificationlaag is nog niet als klein decisionsysteem uitgewerkt
- operatorhulp en handoff zijn al aanwezig, maar nog niet scherp genoeg rond eerste routekeuze

Daarom opent deze stack niet met nieuwe producten, nieuwe platformlagen of bredere commerce, maar met:

1. route narrowing and defaults
2. intake operator decision support
3. qualification-to-delivery handoff alignment
4. closeout and active suite baseline refresh

Deze stack bouwt nog niets. Ze zet alleen de toegestane qualification/intake-volgorde vast.

---

## 2. Why This Stack

De wavevolgorde is bewust zo gekozen:

- eerst moet de eerste routekeuze strakker worden
- daarna moet de operatorlaag duidelijker en consistenter worden
- daarna pas moet delivery-handoff harder aansluiten op qualification
- closeout mag pas wanneer qualification, intake en handoff als één coherent systeem groen zijn

Wat we dus expliciet **niet** doen:

- meteen pricing of billing verbreden
- follow-on routes vlak als eerste intake-optie behandelen
- de suitehiërarchie opnieuw openbreken
- een generieke sales- of CRM-laag introduceren

---

## 3. Locked Qualification And Intake Boundaries

Deze grenzen blijven tijdens alle waves hard staan:

- `ExitScan` blijft de default eerste route
- `RetentieScan` blijft de enige route die situationeel primair naast `ExitScan` mag staan
- `Combinatie` blijft alleen logisch als beide kernvragen echt bestaan
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven follow-on routes
- `nog-onzeker` mag bestaan, maar mag niet eindigen als vaag rustpunt
- geen nieuwe productactivatie
- geen brede billing/checkout-uitbreiding
- geen nieuwe platformlaag of CRM-abstractie

Deze track mag dus wel verbeteren:

- routeaanbeveling
- qualificationduiding
- intake-rust en intakeconsistente defaults
- operatorzichtbaarheid
- handoff van lead naar delivery
- acceptance discipline

Deze track mag niet verbeteren via:

- suiteverbreding
- productscopeverschuiving
- extra automation zonder directe qualificationreden

---

## 4. Wave Stack

### Wave 1 - Qualification Route Narrowing And Defaults

Goal:

- de eerste routekeuze scherper maken zonder de publieke suite te verbreden

Focus:

- `ExitScan` harder als default eerste route verankeren
- `RetentieScan` alleen laten landen als de intakevraag daar echt expliciet om vraagt
- `Combinatie` alleen als echte dubbelvraag laten staan
- follow-on routes duidelijker als bounded vervolgduiding behandelen
- `nog-onzeker` omzetten van passieve keuze naar routevernauwing

Key changes:

- route narrowing and defaults
- geen delivery-handofflogica als hoofdfocus
- geen pricing- of billingverbreding

Definition of done:

- de intakeflow heeft explicietere routehiërarchie en rustiger defaults
- follow-on routes lezen minder als vlakke eerste intakekeuze
- operator en prospect krijgen sneller een logischer eerste richting mee

---

### Wave 2 - Intake Operator Decision Support

Goal:

- operators beter helpen om de juiste eerste route, vervolgvorm en intakebeslissing te nemen

Focus:

- qualification-output explicieter maken
- operator summary, recommended route en reviewhints toevoegen
- `nog-onzeker` en follow-on keuzes beter uitleggen in de lead-opslaag
- routekeuze, timing en context strakker samen laten lezen

Key changes:

- operator decision support
- geen nieuwe commerce- of deliveryworkflow als hoofdfocus
- wel betere interne leesbaarheid en consistentie

Definition of done:

- operators zien sneller welke eerste route waarschijnlijk klopt
- qualification voelt meer als beslisondersteuning dan als losse notitietabel
- follow-on misrouting wordt zichtbaarder voordat delivery start

---

### Wave 3 - Qualification To Delivery Handoff Alignment

Goal:

- de handoff van qualification naar delivery readiness explicieter en betrouwbaarder maken

Focus:

- qualification-output koppelen aan handoff en intake readiness
- harde of halfharde reviewgates toevoegen waar nodig
- bounded commerce en delivery-start governance in lijn brengen met qualification
- voorkomen dat een lead te vroeg deliverystart-ready lijkt zonder routehelderheid

Key changes:

- qualification-to-delivery handoff alignment
- geen nieuwe delivery tooling als primaire scope
- wel scherpere operationele gate tussen qualification en start

Definition of done:

- qualification en delivery-start spreken dezelfde taal
- route-onzekerheid of follow-on twijfel kan niet meer stilletjes doorlekken naar deliverystart
- de ops- en handofflaag is consistenter voor de kernroutes

---

### Wave 4 - Lead Qualification And Intake Closeout

Goal:

- deze track formeel sluiten en de nieuwe suitebrede intakebaseline vastzetten

Focus:

- docs, code, tests en smoke volledig groen
- expliciet vastleggen wat nu beter gedisciplineerd is
- bevestigen dat de suitehiërarchie behouden is
- de volgende track alleen openen vanuit een nieuwe expliciete keuze

Key changes:

- closeout
- geen nieuwe productscope
- geen brede commercialization- of scale-up-uitbreiding

Definition of done:

- qualification/intake is als gecontroleerde track formeel gesloten
- de live suite heeft nu een duidelijkere eerste-route en intakebaseline
- een volgende implementatiekeuze kan starten vanuit een groen en stabiel decisionsysteem

---

## 5. Sequence Rules

- Altijd precies één actieve qualification/intake-wave tegelijk
- Pas na green close-out van de vorige wave mag de volgende openen
- Elke wave moet tegelijk opleveren:
  - productuitkomst
  - codewijziging
  - docs-update
  - tests
  - smoke-validatie
- Geen nieuwe suite- of productscope zonder directe qualificationreden
- Geen brede billing/checkout- of scale-upstap zolang deze track niet formeel is gesloten

---

## 6. Acceptance Standard Per Wave

Elke qualification/intake-wave moet expliciet langs deze lagen sluiten:

### Product acceptance
- De wave maakt de eerste routekeuze of handoff aantoonbaar scherper.
- De wave laat de core-first suitehiërarchie intact.

### Codebase acceptance
- De implementatie blijft klein en productgericht.
- Er schuift geen generieke platformlaag of CRM-abstractie mee.

### Runtime acceptance
- Publieke intake, operatorzichtbaarheid en delivery-handoff blijven coherent.
- Follow-on routes blijven bounded en niet-vlak in de eerste intake.

### QA acceptance
- Relevante regressies zijn groen.
- Er is een duidelijke smoke-route voor de wave-uitkomst.

### Documentation acceptance
- De wavedocumentatie blijft synchroon met implementatie en gating.

---

## 7. Recommended First Execution Order

De eerstvolgende toegestane stap is nu:

- `WAVE_01_QUALIFICATION_ROUTE_NARROWING_AND_DEFAULTS.md`

Nog niet toegestaan:

- direct delivery-handoff gates bouwen zonder qualificationnarrowing
- follow-on routeverbreding
- nieuwe productscope of platformlaag openen

---

## 8. Defaults Chosen

- `ExitScan` blijft de standaard eerste route.
- `RetentieScan` mag alleen primair landen bij een expliciet behouds-/vroegsignaalvraagstuk.
- `Combinatie` blijft alleen voor echte dubbelvragen.
- Follow-on routes blijven bounded vervolgkeuzes.
- `nog-onzeker` moet naar een echte routevernauwing leiden.
- De stack opent met route narrowing, niet met delivery- of commerceverbreding.

---

## 9. Next Allowed Step

De eerstvolgende toegestane stap is:

- `WAVE_01_QUALIFICATION_ROUTE_NARROWING_AND_DEFAULTS.md`
