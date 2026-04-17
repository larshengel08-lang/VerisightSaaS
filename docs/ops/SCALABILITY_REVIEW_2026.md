# Scalability Review 2026

Last updated: 2026-04-17
Status: active

## Summary

Deze review toetst of Verisight's processen, systemen en werkwijze nu al schaalbaar zijn voor de komende 90 dagen binnen een founder-led lean fase.

Kernconclusie:

- Verisight is bestuurlijk en documentair veel volwassener dan eerder.
- Verisight is nog niet operationeel schaalbaar voorbij een kleine, strak begeleide founder-led throughput.
- De huidige laag is geschikt voor:
  - 1-3 gecontroleerde commerciële trajecten tegelijk
  - beperkte assisted onboarding
  - bewuste delivery onder directe founderregie
- De huidige laag is nog niet sterk genoeg voor:
  - 2x volume zonder extra ritme en zichtbaarheid
  - delegatie naar een tweede operator zonder overdrachtsverlies
  - 2 weken lagere founder-beschikbaarheid zonder merkbare kwaliteitsdaling

## Review scope and evidence

Scope:

- repo-operating docs
- roadmap- en auditlaag
- `Docs_External` voor sales-, operations- en CRM-bewijs
- huidige Excel- en templatewerkbladen

Gebruikte bewijsbronnen:

- [CEO_GROWTH_SYSTEM_2026.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/CEO_GROWTH_SYSTEM_2026.md)
- [CEO_OPERATING_CADENCE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CEO_OPERATING_CADENCE.md)
- [OUTBOUND_OPERATING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/OUTBOUND_OPERATING_PLAYBOOK.md)
- [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [OPS_DELIVERY_FAILURE_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/OPS_DELIVERY_FAILURE_MATRIX.md)
- [FOUNDER_CAPACITY_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/FOUNDER_CAPACITY_MAP.md)
- [DECISION_LOG.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/DECISION_LOG.md)
- [EXTERNAL_DOCS_REGISTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/EXTERNAL_DOCS_REGISTER.md)
- [Verisight_CRM.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_CRM.xlsx)
- [Verisight_Prospectlijst_2026-04-10.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_Prospectlijst_2026-04-10.xlsx)
- [Verisight_Onboarding_Procesflow_2026-04-11.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_Onboarding_Procesflow_2026-04-11.xlsx)
- [CEO_WEEKLY_SCORECARD.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CEO_WEEKLY_SCORECARD.xlsx)

Belangrijke beperking van deze review:

- Er is wel operationele structuur, maar nog weinig ingevulde live data in CRM en scorecard.
- Daardoor is dit een strenge review op schaalbaarheid van het systeem zelf, niet een bevestiging dat het ritme al consequent wordt uitgevoerd.

## Domain verdicts

| Domain | Score (0-10) | Verdict | Why |
| --- | --- | --- | --- |
| Commercial scalability | 4 | Rood | ICP, outbounddiscipline en pricingroute zijn expliciet, maar CRM-pipeline en wekelijkse dealregistratie zijn nog leeg en daardoor niet aantoonbaar ritmisch. |
| Delivery scalability | 6 | Geel | Onboardingroute, inputspec en failure matrix zijn sterk beschreven, maar echte throughput-, queue- en checkpointdata ontbreken nog. |
| Governance scalability | 4 | Rood | CEO-cadans, scorecard en reviewdocs bestaan, maar ingevulde scorecards en maandreviews ontbreken en de decision log is nog erg dun. |
| Source-of-truth scalability | 5 | Geel | Repo, roadmap, Excel en external docs zijn beter geordend dan eerst, maar de leidende volgorde verschilt nog per document en blijft kwetsbaar onder druk. |
| Operational tooling scalability | 4 | Rood | Er zijn goede formats, maar weinig actieve operationele meetpunten, bijna geen throughputdata en nog veel manual-first coördinatie. |
| Founder dependency scalability | 3 | Rood | Veel routes vereisen nog foundertriage, founderherstel en founderprioritering, ondanks betere documentatie. |

## Evidence highlights by domain

### 1. Commercial scalability — Rood

Positief:

- outboundroute is expliciet vastgelegd in [OUTBOUND_OPERATING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/OUTBOUND_OPERATING_PLAYBOOK.md)
- prospectlijst bevat 16 seed prospects met ICP-fit en volgende actie
- commerciële richting, eerste kooproute en pricingdiscipline zijn bestuurlijk helder

Zwak:

- [Verisight_CRM.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_CRM.xlsx) bevat momenteel alleen headers en geen actieve pipelinehistorie
- tabbladen `Deals` en `Weekly Scorecard` in [CEO_WEEKLY_SCORECARD.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CEO_WEEKLY_SCORECARD.xlsx) zijn nog leeg
- bezwaarcaptatie, dealcycle en proposaldoorstroming zijn beschreven maar nog niet aantoonbaar gemeten

Oordeel:

- commercieel speelboek: sterk
- commercieel ritme: nog niet hard genoeg ingebed

### 2. Delivery scalability — Geel

Positief:

- assisted onboardingroute is duidelijk en passend bij de huidige productrealiteit
- [CLIENT_INPUT_SPEC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_INPUT_SPEC.md) en de onboarding-procesflow maken input- en scanperioderisico expliciet
- [OPS_DELIVERY_FAILURE_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/OPS_DELIVERY_FAILURE_MATRIX.md) benoemt herstelpaden beter dan voorheen

Zwak:

- er is nog geen zichtbaar, ingevuld operationsboard met echte doorlooptijden, WIP of checkpointstatus per traject
- first-management-use, report delivery en exception-status zijn conceptueel goed, maar niet zichtbaar aangetoond in een actuele live caseload
- delegatie naar een tweede operator is nog onvoldoende bewezen

Oordeel:

- route is overdraagbaarder dan eerst
- delivery blijft nog te afhankelijk van zorgvuldige handmatige regie

### 3. Governance scalability — Rood

Positief:

- week-, maand- en kwartaalritme zijn goed ontworpen
- decision log, capacity map en phase review sluiten logisch op elkaar aan

Zwak:

- [MONTHLY_PHASE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/MONTHLY_PHASE_REVIEW.md) is nog sjabloon, geen gebruikt bestuursdocument
- [DECISION_LOG.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/DECISION_LOG.md) bevat nu 3 kernbesluiten, maar nog geen doorlopende bestuurlijke historie
- [FOUNDER_CAPACITY_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/FOUNDER_CAPACITY_MAP.md) heeft duidelijke guardrails, maar nog geen ingevulde maxima of actuele belasting

Oordeel:

- governance design: sterk
- governance execution: nog vroeg en fragiel

### 4. Source-of-truth scalability — Geel

Positief:

- external docs register voorkomt dat `Docs_External` ongemerkt een tweede waarheid wordt
- roadmap heeft nu zowel `.md` als `.xlsx`
- checklist is geaudit en niet meer blind leidend

Zwak:

- source-of-truth volgorde verschilt nog tussen [DOCUMENT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/DOCUMENT_INDEX.md), [EXTERNAL_DOCS_REGISTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/EXTERNAL_DOCS_REGISTER.md) en de ops README
- CRM, scorecard, roadmap workbook en external docs zijn bruikbare werklagen, maar er is nog geen harde opsregel wie wanneer het primaire systeem bijwerkt
- drukte of personeelsuitbreiding zou deze bronlagen snel weer uit elkaar kunnen trekken

Oordeel:

- basis is goed genoeg voor nu
- nog niet sterk genoeg voor multi-operator discipline zonder extra afspraken

### 5. Operational tooling scalability — Rood

Positief:

- er zijn goede formats voor prospecting, onboarding, respondentimport en scorecarding
- het systeem kiest terecht voor manual-first in plaats van premature automation

Zwak:

- tooling is vooral template-first, niet dashboard-first
- doorlooptijd, wachtrijen, defectfrequentie en escalaties worden nog niet systematisch bijgehouden in een actief operationeel register
- er is nog geen centraal werkbord waarin sales, onboarding, delivery en proof capture samen zichtbaar zijn

Oordeel:

- huidige tooling ondersteunt disciplinering
- huidige tooling stuurt nog onvoldoende op throughput

### 6. Founder dependency scalability — Rood

Positief:

- afhankelijkheid is benoemd en niet ontkend
- capacity map en command window geven duidelijke intentie om focus te bewaken

Zwak:

- veel routes vereisen nog foundertriage:
  - ICP-fit
  - dealprioritering
  - proposalrouting
  - deliveryherstel
  - eerste managementduiding
- 2 weken lagere founder-beschikbaarheid zou waarschijnlijk leiden tot:
  - stillere pipeline
  - tragere handoffs
  - meer pending uitzonderingen
  - minder expliciete next steps

Oordeel:

- founder dependency is momenteel het grootste schaalrisico

## Top 10 scalability risks

1. `Lege pipeline-instrumentatie`
   - Playbook bestaat, maar CRM en scorecard laten nog geen echt ritme zien.
2. `Founder als centrale triage-laag`
   - Sales, delivery en herstel blijven te sterk bij één persoon samenkomen.
3. `Geen actieve throughputmeting`
   - Cycle time, defect rate en queue load zijn nog nauwelijks zichtbaar.
4. `Governance vooral ontworpen, nog niet bewezen`
   - Scorecard en monthly review zijn nog onvoldoende in gebruik.
5. `Deliverycheckpoints nog niet operationeel afgedwongen`
   - Goede taal, maar te weinig actieve controle.
6. `Source-of-truth volgorde nog niet hard genoeg`
   - Repo, Excel en external docs kunnen onder druk weer naast elkaar gaan sturen.
7. `Proof capture nog niet in het kernritme verankerd`
   - Risico dat bewijsopbouw weer achteraf gebeurt.
8. `Geen duidelijke owner-laag naast founder`
   - Taken zijn beschreven, maar niet als rolpakket verdeeld.
9. `Manual-first zonder zichtbare WIP-limieten`
   - Handmatig werk is acceptabel, maar alleen als wachtrijen en maxima zichtbaar zijn.
10. `Schaalbare overdracht nog niet getest`
   - Er is nog geen bewijs dat een tweede operator dezelfde kwaliteit haalt.

## Five highest-leverage improvements

1. Maak de scorecard en CRM deze maand actief leidend voor pipeline- en trajectritme.
2. Voeg een centraal operationsboard toe voor intake, import, activation, report delivery en first management use.
3. Vul de founder capacity map met echte maxima, geen lege placeholders.
4. Leg één harde source-of-truth regelset vast voor repo, Excel, CRM en external docs.
5. Test een echte delegated run op minimaal één commercieel en één deliverytraject.

## Acceptance

Deze review is pas geslaagd als:

- de 6 domeinen onderbouwd groen/geel/rood zijn beoordeeld
- de top 10 risico's concreet genoeg zijn om te prioriteren
- de grootste founder dependency niet impliciet blijft
- de vervolgwaves gericht zijn op stabiliseren, niet op blind automatiseren

## Assumptions and defaults

- Verisight blijft de komende 90 dagen founder-led lean.
- ExitScan blijft de primaire entree.
- Dit rapport beoordeelt schaalbaarheid binnen de huidige bedrijfsvorm, niet enterprise readiness.
- Lege operationele werkbladen tellen in deze review als negatief bewijs voor ritmediscipline.
