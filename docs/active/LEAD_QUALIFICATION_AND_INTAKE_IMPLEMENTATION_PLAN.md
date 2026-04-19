# LEAD_QUALIFICATION_AND_INTAKE_IMPLEMENTATION_PLAN.md

## 1. Summary

Dit document is de uitvoerbare source of truth voor de eerstvolgende implementatiefase na de formeel gesloten post-parity suite-normalisatie.

De kernsituatie is nu:

- de suite is productmatig paritywaardig
- de suite is buyer-facing en commercieel genormaliseerd als `core-first`
- `ExitScan` is expliciet de default wedge
- `RetentieScan` is expliciet de enige situationeel primaire uitzondering
- `Combinatie` is expliciet een portfolioroute
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` zijn expliciet bounded follow-on routes

Daardoor verschuift de eerstvolgende implementatievraag van:

- "welk product bouwen we nu?"

naar:

- "hoe zorgen we dat prospects consistenter naar de juiste eerste route worden geleid en dat qualification/intake dezelfde suitehiërarchie afdwingt?"

Dit document opent daarom:

- lead qualification and intake implementation

En opent niet:

- nieuwe producten
- nieuwe platformlagen
- scale-up werk
- bredere billing/checkout uitbreiding
- nieuwe paritytracks

Status:

- Plan status: completed
- Active source of truth after approval: dit document
- Build permission: not started
- Next allowed step: `LEAD_QUALIFICATION_AND_INTAKE_WAVE_STACK_PLAN.md`

---

## 2. Why This Track Now

De huidige suite is nu scherp genoeg dat de grootste resterende commerciële frictie waarschijnlijk niet in productbreedte zit, maar in:

- de kwaliteit van eerste routekeuze
- hoe `nog-onzeker` wordt afgehandeld
- hoe follow-on routes vroeg in intake worden begrensd
- hoe qualification en delivery-handoff beter op elkaar aansluiten

De huidige codebase laat dat ook zien:

- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) is nu al core-first geordend, maar kwalificeert nog niet dieper per route
- [contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx) zet de juiste suite-logica neer, maar de daadwerkelijke intake-output en operatorhulp kunnen nog scherper
- de suite kent al `ContactRequest`, lead-ops en bounded commerce-statussen, maar qualification is nog niet als klein decision system uitgewerkt

Dus:

- normalisatie sloot de suiteboodschap
- deze track moet nu de suitekeuze en intakekwaliteit operationeel aanscherpen

---

## 3. Objective

Doel van deze track:

- de eerste routekeuze scherper maken
- intake rustiger en consistenter laten verlopen
- follow-on routes alleen laten landen wanneer hun entry-voorwaarden echt kloppen
- operators beter helpen de juiste eerste route, vervolgvorm en handoff te kiezen

Gewenste uitkomst:

- minder vlakke routekeuze
- minder vroege follow-on misrouting
- helderdere handoff van lead naar intake en delivery

---

## 4. Scope In

- qualification logic
- intake-copy en intake-hulp
- route recommendation / route narrowing
- operator visibility voor qualification
- handoff richting delivery readiness
- tests, docs en acceptance voor deze qualificationlaag

## 5. Scope Out

- nieuwe productlijnen
- nieuwe routeactivatie
- billing/checkout verbreding
- pricing-herschrijving buiten qualification-impact
- nieuwe enterprise- of platformlagen

---

## 6. Core Questions To Answer

Deze track moet expliciet antwoord geven op:

1. Hoe herkennen we eerder of `ExitScan` de juiste eerste route is?
2. Wanneer mag `RetentieScan` primair worden in intake?
3. Wanneer is `Combinatie` echt logisch, en wanneer nog niet?
4. Hoe dwingen we af dat `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` pas landen na een bestaand signaal of eerste route?
5. Hoe maken we `nog-onzeker` nuttig zonder dat het een vaag eindstation wordt?
6. Welke qualification-output heeft een operator nodig om sneller en consistenter te handelen?
7. Welke intake- en acceptancegates moeten groen zijn voordat delivery start?

---

## 7. Proposed Execution Order

De eerstvolgende veilige volgorde is:

1. `LEAD_QUALIFICATION_AND_INTAKE_WAVE_STACK_PLAN.md`
2. `WAVE_01_QUALIFICATION_ROUTE_NARROWING_AND_DEFAULTS.md`
3. `WAVE_02_INTAKE_OPERATOR_DECISION_SUPPORT.md`
4. `WAVE_03_QUALIFICATION_TO_DELIVERY_HANDOFF_ALIGNMENT.md`
5. `WAVE_04_LEAD_QUALIFICATION_AND_INTAKE_CLOSEOUT.md`

Dat betekent:

- eerst de wave-stack en acceptance logica vastzetten
- daarna pas gecontroleerde implementatie-waves

---

## 8. Defaults Chosen

- `ExitScan` blijft default wedge tenzij qualification expliciet iets anders onderbouwt.
- `RetentieScan` blijft de enige situationeel primaire uitzondering.
- `Combinatie` blijft alleen logisch als beide kernvragen echt bestaan.
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven bounded follow-on routes en mogen niet als vlakke eerste keuze worden behandeld.
- `nog-onzeker` blijft toegestaan, maar moet naar een echte routebeslissing leiden.
- De eerstvolgende fase is qualification/intake implementation, niet verdere productuitbreiding.

---

## 9. Acceptance

### Product acceptance
- [x] Dit document maakt duidelijk waarom qualification/intake nu de logische volgende implementatietrack is.

### Codebase acceptance
- [x] Het plan sluit aan op de huidige suite- en leadflow-realiteit in de codebase.

### Runtime acceptance
- [x] De bestaande suitehiërarchie blijft leidend.

### QA acceptance
- [x] Het document maakt duidelijk dat ook deze track wave- en gate-based moet worden uitgevoerd.

### Documentation acceptance
- [x] Dit document kan direct dienen als startpunt voor de qualification/intake wave stack.

---

## 10. Next Allowed Step

Na dit document mag nu openen:

- `LEAD_QUALIFICATION_AND_INTAKE_WAVE_STACK_PLAN.md`
