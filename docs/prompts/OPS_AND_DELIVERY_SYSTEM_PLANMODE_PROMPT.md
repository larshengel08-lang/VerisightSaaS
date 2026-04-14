# Ops And Delivery System Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `OPS_AND_DELIVERY_SYSTEM_PLAN.md` voor een volledige aanscherping van het operations- en deliverysysteem van Verisight.

Belangrijk:
- `OPS_AND_DELIVERY_SYSTEM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige operationele flow van lead naar delivery, inclusief setup, invites, monitoring, rapportage en nazorg
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [SETUP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/SETUP.md)
- [SUPABASE_LIVE_HARDENING_CHECKLIST.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/SUPABASE_LIVE_HARDENING_CHECKLIST.md)
- [Verisight_CRM.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_CRM.xlsx)

Scope:
- operations
- delivery
- overdrachten
- monitoring
- rapportoplevering
- nazorg
- schaalbaarheid van uitvoering

Doel:
Maak een plan om operations en delivery beter te structureren, zodat:
- het traject van akkoord tot oplevering voorspelbaarder wordt
- minder operationele fouten of losse eindjes ontstaan
- Lars minder hoeft te improviseren
- groei later minder chaos veroorzaakt
- gevoelige operationele informatie beter wordt beheerd

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige deliveryflow
2. lead naar kickoff-overdracht
3. campaign setup en inviteflow
4. monitoring en responstracking
5. rapportoplevering
6. nazorg en vervolgoverdracht
7. rol van CRM en ops-documenten
8. waar huidige flow fragiel is
9. welke delen nu nog te persoonsafhankelijk zijn
10. welke standaardisering later loont
11. welke data of tools gevoelig zijn
12. welke minimale ops-artefacten nodig zijn
13. wat nu nog bewust handmatig mag blijven
14. welke acceptancecriteria operationele volwassenheid aantonen

Vereisten voor `OPS_AND_DELIVERY_SYSTEM_PLAN.md`:
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
- risico op operationele chaos bij eerste groei
- risico op persoonsafhankelijk deliverywerk
- risico op losse overdrachten
- risico op gevoelige data in ongeschikte documenten
- risico op verschil tussen verkochte flow en leverbare flow

Structuur van `OPS_AND_DELIVERY_SYSTEM_PLAN.md`:
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
- maak alleen `OPS_AND_DELIVERY_SYSTEM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
