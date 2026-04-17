# Scalability Gap Matrix

Last updated: 2026-04-17
Status: active

## Summary

Deze matrix vertaalt de schaalbaarheidsreview naar de echte knelpunten die eerst moeten worden opgelost.

Prioriteitsregels:

- `Nu`
  - blokkeert ritme, overdraagbaarheid of zichtbaarheid direct
- `Binnen 30 dagen`
  - moet worden opgepakt na eerste stabilisatie
- `Later`
  - pas relevant nadat de basis aantoonbaar werkt

## Gap matrix

| Bottleneck | Cause | Impact | Current workaround | Target state | Priority | Owner type | Fix-program step | Evidence status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pipeline-instrumentatie leeg | CRM en scorecard bestonden, maar waren nog niet als live systeem gehard | Commercieel ritme blijft op geheugen en losse notities draaien | Founder houdt context impliciet vast | Elke actieve lead staat in een live pipeline met volgende actie en datum | Nu | Founder | Wave 1 - Step 1.1 | Structureel voorbereid in CRM en scorecard; twee echte weekupdates nog nodig |
| Weekly cadence nog niet bewezen | Scorecard is ontworpen, maar nog niet aantoonbaar wekelijks gebruikt | Prioriteiten en capacity checks blijven reactief | Ad-hoc overzicht in hoofd of losse notities | Wekelijkse update van scorecard met vaste reviewagenda | Nu | Founder | Wave 1 - Step 1.2 | Scorecard en reviewlaag aangescherpt; drie volledige weekcycli nog nodig |
| Monthly governance te licht | Monthly review en capacity map zijn nog vooral sjablonen | Roadmap en werkelijkheid kunnen weer uit elkaar gaan lopen | Strategische keuzes blijven informeel | Maandreview wordt vaste reality check met decisions en capacity update | Nu | Founder | Wave 1 - Step 1.6 | Nog te bewijzen in eerste echte maandreview |
| Founder als centrale triage | Sales, delivery, proof en herstel lopen via dezelfde persoon | 2x volume of afwezigheid veroorzaakt vertraging en kwaliteitsverlies | Founder compenseert met extra contextwerk | Heldere operatorbeslissingen en escalatiecriteria per route | Nu | Founder + future operator | Wave 2 - Step 2.3 | Nog te bewijzen via delegated run en rolgrenzen |
| Deliverycheckpoints niet centraal zichtbaar | Intake, import, activation en report delivery zijn beschreven maar niet in een live board zichtbaar | Trajecten kunnen stilvallen zonder vroege signalering | Handmatige check via meerdere documenten | Een operationeel trajectoverzicht met checkpointstatus en risico | Nu | Ops / delivery owner | Wave 1 - Step 1.3 | Docs en reviewlaag zijn nu app-first; live campaign-evidence moet nog volgen |
| No throughput metrics | Geen structurele cycle-time, queue of defectmeting | Schaalproblemen worden te laat gezien | Incidenten pas achteraf bespreken | Minimaal metricsysteem voor leadflow en deliveryflow | Binnen 30 dagen | Founder + ops | Wave 2 - Step 2.1 | Nog open |
| Proof capture niet kernhard | Case proof capture is beschreven, maar nog niet gekoppeld aan deal- en deliveryritme | Bewijsopbouw blijft afhankelijk van discipline achteraf | Founder vult later aan | Proof checkpoint in proposal, livegang en first management use | Binnen 30 dagen | Founder + sales | Wave 2 - Step 2.2 | Nog open |
| Source-of-truth volgorde niet overal gelijk | Repo, roadmap, workbook, CRM en external docs hadden verschillende leidende formuleringen | Bij groei ontstaat verwarring over wat leidend is | Handmatige uitleg per situatie | Een source-of-truth charter met updatevolgorde per type informatie | Binnen 30 dagen | Founder | Wave 1 - Step 1.5 | Charter en gekoppelde docs zijn nu geharmoniseerd |
| WIP-limieten niet expliciet ingevuld | Capacity map had guardrails maar geen echte maxima | Overbelasting wordt pas zichtbaar als kwaliteit al daalt | Founder voelt spanning laat aan | Concrete maxima voor deals, implementaties en escalaties tegelijk | Binnen 30 dagen | Founder | Wave 1 - Step 1.4 | Maxima en thresholds zijn ingevuld; ritmisch gebruik moet nog bewezen worden |
| Delegatie niet getest | Nog geen uitgevoerde handoff-run door tweede operator | Overdraagbaarheid is theoretisch, niet bewezen | Vertrouwen op documentkwaliteit | Een begeleide sales-run en een begeleide delivery-run door ander persoon | Binnen 30 dagen | Founder + operator | Wave 2 - Step 2.4 | Nog open |
| Manual-first tooling zonder werkbord | Tooling ondersteunt invullen, niet live sturen | Teamswitching en handoffkosten blijven hoog | Verschillende losse werkbladen | Een compact live bord voor deal -> onboarding -> first value | Later | Founder + ops | Wave 3 - Step 3.1 | Pas later beoordelen op gemeten frictie |
| Automation-discussie kan te vroeg komen | Er is nog weinig harde ritmedata, maar wel veel templates | Kans op verkeerde automatisering van een fragiele route | Verleiding om tooling te bouwen "voor later" | Automation pas toestaan na zichtbaarheid, owner en metric-basis | Later | Founder + product | Wave 3 - Step 3.2 | Pas later beoordelen op business case |

## Immediate reading

De eerste verbeterlaag is geen nieuwe softwarelaag. De eerste verbeterlaag is:

- actiever gebruik van bestaande werkbladen
- `Verisight_CRM.xlsx` als primaire leadpipeline
- `CEO_WEEKLY_SCORECARD.xlsx` als wekelijkse reviewmirror
- live operatie zichtbaar maken
- beslisregels en maxima expliciet invullen
- delegatie testen

## Acceptance

Deze gap matrix is bruikbaar als:

- elke bottleneck een duidelijke oorzaak en target state heeft
- prioriteit en owner type concreet zijn
- de fix-program step zichtbaar maakt waar de bottleneck hoort
- de evidence status laat zien of iets al bewezen is of nog niet

## Assumptions and defaults

- `Nu` betekent: moet binnen de eerstvolgende 30 dagen opgestart worden.
- `Binnen 30 dagen` betekent: na de eerste stabilisatieslag, maar nog binnen hetzelfde kwartaal.
- `Later` betekent: niet eerder starten dan na bewezen ritme en zichtbaar lagere founder-frictie.
