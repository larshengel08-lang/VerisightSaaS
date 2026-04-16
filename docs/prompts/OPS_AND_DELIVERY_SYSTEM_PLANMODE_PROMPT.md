# Ops And Delivery System Planmodus Prompt

```text
Analyseer deze codebase volledig en maak een uitvoerbaar planbestand `OPS_AND_DELIVERY_SYSTEM_PLAN.md` voor een volledige aanscherping van het operations- en deliverysysteem van Verisight.

Belangrijk:
- `OPS_AND_DELIVERY_SYSTEM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- maak nog geen ander planbestand aan
- baseer je plan op de huidige repo-implementatie, niet op algemene aannames
- ExitScan is het primaire product
- RetentieScan is complementair aan ExitScan
- claims mogen commercieel scherp zijn, maar niet onwaar
- operations en delivery moeten herhaalbaar, professioneel en schaalbaar genoeg worden zonder de assisted kwaliteit te verliezen
- interne overdracht, checklisting, livegang en foutopvang moeten scherper worden
- het doel is minder improvisatie, minder kennis in hoofden en meer betrouwbaar ritme

Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [PROMPT_CHECKLIST.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_CHECKLIST.xlsx)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md)
- [IMPLEMENTATION_READINESS_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/IMPLEMENTATION_READINESS_PROGRAM_PLAN.md)
- [PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md)
- [DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md)
- [docs/ops/SETUP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/SETUP.md)
- [docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [docs/ops/ONBOARDING_ACCEPTANCE_CHECKLIST.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ONBOARDING_ACCEPTANCE_CHECKLIST.md)
- [docs/ops/PILOT_LEARNING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/PILOT_LEARNING_PLAYBOOK.md)
- [docs/ops/DEMO_ENVIRONMENT_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/DEMO_ENVIRONMENT_PLAYBOOK.md)
- [frontend/app/(dashboard)/beheer/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx)
- [frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/components/dashboard/add-respondents-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/add-respondents-form.tsx)
- [frontend/components/dashboard/invite-client-user-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/invite-client-user-form.tsx)
- [frontend/components/dashboard/preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx)
- [frontend/components/dashboard/pilot-learning-workbench.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/pilot-learning-workbench.tsx)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- [frontend/lib/implementation-readiness.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/implementation-readiness.ts)
- [frontend/lib/pilot-learning.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/pilot-learning.ts)
- [frontend/lib/ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [frontend/app/api/contact/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/contact/route.ts)
- [frontend/app/api/contact-requests/[id]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/contact-requests/[id]/route.ts)
- [frontend/app/api/campaign-delivery/[id]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery/[id]/route.ts)
- [frontend/app/api/campaign-delivery-checkpoints/[id]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery-checkpoints/[id]/route.ts)
- [frontend/app/api/org-invites/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/org-invites/route.ts)
- [frontend/app/api/campaigns/[id]/respondents/import/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaigns/[id]/respondents/import/route.ts)
- [frontend/app/api/campaigns/[id]/respondents/send-invites/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaigns/[id]/respondents/send-invites/route.ts)
- [frontend/app/api/learning-dossiers/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/learning-dossiers/route.ts)
- [frontend/app/api/learning-dossiers/[id]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/learning-dossiers/[id]/route.ts)
- [frontend/app/api/learning-checkpoints/[id]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/learning-checkpoints/[id]/route.ts)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [supabase/schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- [demo_environment.py](/C:/Users/larsh/Desktop/Business/Verisight/demo_environment.py)
- [manage_demo_environment.py](/C:/Users/larsh/Desktop/Business/Verisight/manage_demo_environment.py)
- [AUDIT_IMPLEMENTATION_ROSTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/AUDIT_IMPLEMENTATION_ROSTER.md)

Scope:
- lead capture en sales-to-delivery handoff
- implementation intake en setup
- respondentimport, inviteflow en klantactivatie
- livegang, acceptance en foutopvang
- rapportoplevering en eerste managementread
- learning capture, nazorg en vervolgroute
- interne rolverdeling, checklisting en schaalbare ritmes
- wat manual-first mag blijven en wat nu structureler moet worden

Doel:
Maak een plan om operations en delivery als één samenhangend systeem scherper te maken, zodat:
- het traject van aanvraag tot eerste managementwaarde voorspelbaarder wordt
- minder kennis in hoofden blijft zitten
- minder improvisatie nodig is in overdrachten en livegang
- foutopvang en recovery helderder worden
- assisted kwaliteit behouden blijft terwijl de uitvoering herhaalbaarder wordt

Wat expliciet beoordeeld en meegenomen moet worden:
1. de echte repo-flow van lead naar delivery en nazorg
2. verschillen tussen verkochte flow, productflow en interne ops-flow
3. huidige bron van waarheid per stap
4. waar statuses, eigenaarschap en acceptance nog impliciet zijn
5. waar localStorage, handwerk of losse notities nog te veel gewicht dragen
6. hoe launch readiness, first-value readiness en adoption readiness zich tot elkaar verhouden
7. hoe learning capture terug landt in operations
8. waar demo, sample en echte klantdelivery uit elkaar moeten blijven
9. welke fouten nu veilig worden opgevangen en welke nog niet
10. welke minimale ops-artefacten, checklists en ritmes nog ontbreken
11. welke delen later mogen automatiseren en welke nu bewust manual-first moeten blijven
12. welke security- of datarisico's rond ops-documenten, tokens, invites en externe artefacten aandacht vragen
13. welke tests en smoke-runs echt operationele volwassenheid aantonen
14. welke repo-drift, path-drift of plan-drift eerst rechtgetrokken moet worden

Vereisten voor `OPS_AND_DELIVERY_SYSTEM_PLAN.md`:
- breek het werk op in logische milestones en kleine subtaken
- geef afhankelijkheden aan
- geef per stap een definition of done
- voeg checkboxes toe
- voeg per milestone een validatiesectie toe
- voeg aparte secties toe:
  - Current Product Risks
  - Open Questions
  - Follow-up Ideas
  - Out of Scope For Now
  - Defaults Chosen

Extra regels:
- wijzig nog geen code
- maak alleen `OPS_AND_DELIVERY_SYSTEM_PLAN.md`
- houd het plan uitvoerbaar en milestone-voor-milestone inzetbaar
- wees kritisch op echte repo-gaten, niet alleen op cosmetische verbeteringen
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
