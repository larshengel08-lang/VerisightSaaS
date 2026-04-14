# Client Onboarding And Adoption Program Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md` voor een volledige aanscherping van onboarding en adoptie bij Verisight.

Belangrijk:
- `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige adminflow, intake, respondentaanlevering, campaign setup, eerste rapportgebruik en klantadoptie
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [SETUP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/SETUP.md)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [Verisight_Onboarding_Procesflow_2026-04-10.docx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_Onboarding_Procesflow_2026-04-10.docx)

Scope:
- intake
- campaign setup
- respondentaanlevering
- adminflow
- klantuitleg
- eerste rapportgebruik
- adoptie na eerste oplevering

Doel:
Maak een plan om onboarding en adoptie voorspelbaarder en professioneler te maken, zodat:
- nieuwe klanten sneller goed starten
- minder uitleg ad hoc nodig is
- delivery en productgebruik beter op elkaar aansluiten
- eerste managementgebruik soepeler verloopt
- herhaalbaarheid toeneemt

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige onboardingflow
2. intake en datavoorwaarden
3. respondenttemplates en import
4. admin- en campaignflow
5. klantinstructies
6. rapportuitleg en eerste gebruik
7. frictiepunten voor klant en Verisight
8. Baseline versus Live onboardingverschillen
9. rol van demo en voorbeeldmateriaal
10. welke handmatige stappen nodig blijven
11. waar verwachtingen nu onduidelijk zijn
12. welke assets of checklists nodig zijn
13. hoe adoptie gemeten of herkend wordt
14. welke acceptancecriteria onboardingkwaliteit aantonen

Vereisten voor `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md`:
- breek het werk op in logische milestones en kleine subtaken
- geef afhankelijkheden aan
- geef per stap een definition of done
- voeg checkboxes toe
- voeg per milestone ook een validatiesectie toe
- voeg een aparte sectie toe:
  - Current Product Risks
  - Open Questions
  - Follow-up Ideas
  - Out of Scope For Now
  - Defaults Chosen

Neem in `Current Product Risks` expliciet mee:
- risico op onduidelijke onboarding
- risico op afhankelijkheid van Lars voor basale uitleg
- risico op fouten in respondentaanlevering
- risico op zwakke adoptie na eerste rapport
- risico op mismatch tussen wat verkocht is en wat geleverd voelt

Structuur van `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md`:
1. Summary
2. Milestones
3. Execution Breakdown By Subsystem
4. Current Product Risks
5. Open Questions
6. Follow-up Ideas
7. Out of Scope For Now
8. Defaults Chosen

Extra regels:
- wijzig nog geen code
- maak alleen `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
