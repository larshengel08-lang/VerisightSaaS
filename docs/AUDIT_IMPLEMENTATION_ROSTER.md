# Verisight Audit Implementation Roster

Dit is het samengevoegde resterende actieoverzicht op basis van de audits voor livegang, reliability, maintainability, performance en commerciële gereedheid.

| Onderwerp | Status | Aanbevolen actie | Hoe implementeren |
|---|---|---|---|
| Supabase hardening live zetten | Moet nog | SQL patch uitvoeren en verifiëren | Run [live_hardening_patch.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/live_hardening_patch.sql), controleer `organization_secrets`, redeploy backend/frontend |
| Kritieke backend integration tests | Gestart | Testdekking uitbreiden op businesskritische flows | Eerste set staat nu in [test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py); volgende stap is negatieve paden toevoegen |
| API-key auth eindbeeld | Nog open | Op termijn af van tenant `x-api-key` richting server/session-based backend auth | Eerst secrets server-only, daarna routes laten vertrouwen op server-issued context in plaats van tenant secret in header |
| PDF performance | Deel gefixt | Rapporten cachen of vooraf genereren | Trigger op nieuwe response of handmatige refresh, opgeslagen PDF uit server/object storage serveren |
| Invite schaalbaarheid | Nog open | Async queue voor bulkmail | Invite batch in jobqueue zetten, request direct laten afronden met accepted-status |
| Stats efficiëntie | Deels gefixt | Meer aggregatie naar SQL verplaatsen | Completion, bandverdeling en segment-aggregatie server-side querymatig opbouwen |
| Backend monolieten | Nog open | `main.py`, `report.py`, `scoring.py` opsplitsen | Eerst `main.py` splitsen in services, daarna report data builders en scoring submodules |
| E2E bescherming | Nog open | End-to-end smoke flows toevoegen | Admin -> import -> submit -> dashboard -> PDF, plus invite/reset flow |
| Eerste prooflaag voor sales | Nog open | Echte case/quote toevoegen zodra beschikbaar | Na eerste klant of pilot een kleine proofsectie op site en in one-pager |

## Aanbevolen implementatievolgorde

1. Supabase SQL patch live uitvoeren
2. Redeploy backend en frontend
3. Smoke test op live omgeving
4. Negatieve integration tests toevoegen
5. E2E flows toevoegen
6. PDF caching
7. Async invite queue
8. Backend-auth verder vereenvoudigen
