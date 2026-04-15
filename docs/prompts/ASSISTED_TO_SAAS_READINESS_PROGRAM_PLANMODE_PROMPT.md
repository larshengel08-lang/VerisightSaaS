# Assisted To SaaS Readiness Program Planmodus Prompt

```text
Analyseer deze codebase, productstructuur, operationele flows en strategiedocumentatie en maak een uitvoerbaar planbestand `ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md` voor de overgang van het huidige assisted/productized Verisight-model naar verantwoorde SaaS-readiness.

Belangrijk:
- `ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige assisted werkwijze, productstructuur, operationele afhankelijkheden en schaalgrenzen
- baseer je plan op de huidige implementatie, niet op algemene SaaS-aannames

Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [frontend/app/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [docs/reference/METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)

Scope:
- assisted versus self-service grens
- productgereedheid
- operationele gereedheid
- commerciële gereedheid
- demo-, onboarding- en deliveryvereisten
- voorwaarden voor latere billing/self-service

Doel:
Maak een plan om vast te leggen wat eerst waar moet zijn voordat Verisight verantwoord richting SaaS kan bewegen, zodat:
- te vroege self-service-ambities worden voorkomen
- assisted workflows niet onnodig verward raken
- packaging, onboarding en delivery eerst schaalbaar worden
- latere SaaS-keuzes voortbouwen op echte product- en klantrealiteit

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige assisted productvorm
2. welke onderdelen nu al SaaS-achtig zijn
3. welke onderdelen nog handmatig of founder-dependent zijn
4. welke schaalrisico's eerst opgelost moeten worden
5. welke capabilities eerst productized moeten zijn
6. welke capabilities pas later self-service mogen worden
7. hoe pricing, onboarding en demo readiness hierin samenkomen
8. welke false-SaaS-signalen nu vermeden moeten worden
9. welke acceptance gates nodig zijn voor een volgende SaaS-stap

Vereisten voor `ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md`:
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
- risico op te vroege SaaS-framing
- risico op operationele overbelasting
- risico op self-service zonder voldoende trust of packaging
- risico op productverwarring tussen assisted en future SaaS-vorm

Structuur van `ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md`:
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
- maak alleen `ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
