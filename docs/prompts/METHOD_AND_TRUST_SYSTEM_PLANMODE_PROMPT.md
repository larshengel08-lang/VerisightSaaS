# Method And Trust System Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `METHOD_AND_TRUST_SYSTEM_PLAN.md` voor een volledige aanscherping van methodiek, claimsgrenzen en trustlaag binnen Verisight.

Belangrijk:
- `METHOD_AND_TRUST_SYSTEM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige methodologie, claims, privacy/trustcopy, rapportnuance en buyer-facing geloofwaardigheid
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [EXTERNAL_DOCS_ALIGNMENT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/EXTERNAL_DOCS_ALIGNMENT.md)
- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)
- [retentiescan-privacy-notes.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/retentiescan-privacy-notes.md)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [Verisight_Commerciele_Claims_2026-04-10.docx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/01_Strategie_En_Planning/Verisight_Commerciele_Claims_2026-04-10.docx)

Scope:
- methodologie
- commerciële claims
- privacy- en trustcopy
- website en rapportnuance
- ExitScan en RetentieScan claimsgrenzen
- buyer-facing vertrouwen
- security/trust disclosures waar relevant

Doel:
Maak een plan om Verisight methodisch en commercieel geloofwaardiger te maken, zodat:
- claims scherper maar verdedigbaar blijven
- trust en nuance niet versnipperd zijn
- website, rapport en sales dezelfde grenzen bewaken
- kopers sneller zien dat het product professioneel en betrouwbaar is
- methodiek en trust niet als rem maar als versterking werken

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige methodologische taal
2. claims op site en in rapporten
3. privacy- en trustcopy
4. interpretatiegrenzen
5. verschillen tussen ExitScan en RetentieScan
6. hoe onzekerheid of nuance nu wordt uitgelegd
7. welke buyer-bezwaren voorspelbaar zijn
8. waar trust te impliciet blijft
9. waar trustcopy te juridisch of te zwak is
10. wat methodisch echt verdedigbaar is
11. wat commercieel op het randje maar nog veilig is
12. welke standaard trustblokken nodig zijn
13. welke artefacten of pagina's trust moeten dragen
14. welke QA-checks claimsgrenzen moeten bewaken

Vereisten voor `METHOD_AND_TRUST_SYSTEM_PLAN.md`:
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
- risico op overclaiming
- risico op te voorzichtige of te diffuse trusttaal
- risico dat website, rapport en sales elkaar tegenspreken
- risico op privacy- of securitytwijfel bij kopers
- risico dat methodieknuance commercieel verkeerd landt

Structuur van `METHOD_AND_TRUST_SYSTEM_PLAN.md`:
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
- maak alleen `METHOD_AND_TRUST_SYSTEM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
