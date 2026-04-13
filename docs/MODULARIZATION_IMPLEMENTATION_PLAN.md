# Modularisatieplan Verisight

Dit plan volgt de eerdere modularisatie-audit en zet per hotspot de voorkeursrichting en veilige uitvoervolgorde neer.

## 1. backend/main.py

- Probleem:
  - route-definities, auth-checks, runtime-config, importhelpers en contactbeveiliging zitten door elkaar
- Richting:
  - `runtime.py` voor productieconfig en admin-token checks
  - later: aparte route/service-modules voor survey, campaigns, respondents en contact
- Eerste stap:
  - runtime-helpers uit `main.py` halen

## 2. backend/report.py

- Probleem:
  - rapportdata, layout en vaste methodiekcopy zitten te dicht op elkaar
- Richting:
  - `report_content.py` voor vaste factoruitleg en bronverwijzingen
  - later: data builders en renderer verder scheiden
- Eerste stap:
  - vaste rapportcopy uit `report.py` halen

## 3. backend/scoring.py

- Probleem:
  - constants, labels en aanbevelingen staan tussen pure logica
- Richting:
  - `scoring_config.py` voor constants, labels en recommendations
  - `scoring.py` zoveel mogelijk pure functies houden
- Eerste stap:
  - configdata uit `scoring.py` halen

## 4. frontend/components/dashboard/add-respondents-form.tsx

- Probleem:
  - één component bevat shared types, parsing, mode-state en netwerkgedrag
- Richting:
  - `add-respondents-form.shared.ts` voor types, parsing en vaste opties
  - later: aparte manual/upload subcomponents of hooks
- Eerste stap:
  - shared types en parsing uit component halen

## 5. frontend/app/(dashboard)/beheer/page.tsx

- Probleem:
  - server-side dataloading en renderlogica zitten in dezelfde pagina
- Richting:
  - `get-beheer-page-data.ts` voor dataverzameling en afgeleide status
  - pagina focust daarna op rendering
- Eerste stap:
  - data-loader extraheren

## 6. frontend/app/api/org-invites/route.ts

- Probleem:
  - admin-check, origin-resolving, cooldown-logica en send-flow zitten in één route
- Richting:
  - `invite-helpers.ts` voor de helperlogica
  - route blijft dun
- Eerste stap:
  - helperfuncties extraheren

## 7. backend/email.py

- Probleem:
  - grote runtime-HTML-strings en contenttransport zaten door elkaar
- Status:
  - eerste modularisatieslag al uitgevoerd
  - templates staan nu los onder `templates/emails`
- Vervolg:
  - later eventueel subjectregels en gedeelde partials centraliseren

## Aanbevolen uitvoervolgorde

1. `email.py` afronden en schoonhouden
2. `scoring.py` config uit logica halen
3. `report.py` vaste content uit generator halen
4. `route.ts` helpers extraheren
5. `page.tsx` dataloading extraheren
6. `add-respondents-form.tsx` shared layer maken
7. `main.py` daarna verder opdelen zonder live routes te forceren
