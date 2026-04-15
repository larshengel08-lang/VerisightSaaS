# Account And Billing Model Readiness Planmodus Prompt

```text
Analyseer deze codebase, productstructuur, pricingrichting en strategiedocumentatie en maak een uitvoerbaar planbestand `ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md` voor account-, plan- en billinggereedheid binnen Verisight.

Belangrijk:
- `ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- bouw nog geen Stripe, abonnementen of billingflows; definieer eerst het model en de readiness-eisen
- baseer je plan op de huidige implementatie, niet op algemene SaaS-billingpatronen

Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [docs/prompts/PRICING_AND_PACKAGING_PROGRAM_PLANMODE_PROMPT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PRICING_AND_PACKAGING_PROGRAM_PLANMODE_PROMPT.md)

Scope:
- accountmodel
- organisatie- en gebruikerslogica
- plan- en package-eenheden
- billing readiness
- provisioningimpact
- grenzen tussen assisted verkoop en latere self-service billing

Doel:
Maak een plan om account- en billinglogica eerst inhoudelijk scherp te krijgen, zodat:
- latere Stripe- of subscriptionbouw niet prematuur of verkeerd wordt ingezet
- accountstructuur past bij het echte product- en klantmodel
- plan-, seat- of usage-denken alleen wordt ingevoerd waar het echt logisch is
- provisioning en billing later op een stabiele basis kunnen landen

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige organisatie- en gebruikersstructuur
2. welke accounteenheid logisch is
3. welke plan- of pakketeenheid logisch is
4. of seats, usage of campaigns billing-eenheden zouden moeten zijn
5. welke assisted uitzonderingen eerst blijven bestaan
6. wat provisioning later zou moeten doen
7. welke billingkeuzes nu nog te vroeg zijn
8. welke readiness-voorwaarden eerst moeten gelden
9. welke risico's er zijn als Stripe te vroeg wordt toegevoegd

Vereisten voor `ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md`:
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
- risico op te vroege billingautomatisering
- risico op verkeerd accountmodel
- risico op mismatch tussen pricing en technische provisioning
- risico op self-service verwachtingen die het product nog niet kan dragen

Structuur van `ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md`:
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
- maak alleen `ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
