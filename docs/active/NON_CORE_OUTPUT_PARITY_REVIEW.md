# NON_CORE_OUTPUT_PARITY_REVIEW

Last updated: 2026-04-22  
Status: active  
Source of truth: product language canon, report structure canon, method signoff, metric hardening signoff and onboarding 5-readiness signoff.

## Titel

Non-core Output And Dashboard Parity Hardening - Review

## Korte samenvatting

TeamScan, Onboarding 30-60-90, Pulse en Leadership Scan zijn opnieuw getoetst op bounded taal, outputgrenzen en handofflogica. De grootste actieve drift zat in fallbacktaal die nog te snel naar `bredere diagnose` verwees waar `bredere duiding` preciezer en veiliger is.

## Wat is geaudit

- [backend/products/team/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/report_content.py)
- [backend/products/onboarding/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/report_content.py)
- [backend/products/leadership/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/report_content.py)
- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/products/onboarding/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts)
- [frontend/lib/products/pulse/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/dashboard.ts)
- [frontend/lib/products/leadership/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)

## Belangrijkste bevindingen

- De non-core lijnen zijn inhoudelijk al goed begrensd en claimen weinig dat de huidige productrealiteit niet draagt.
- `Bredere diagnose` was nog een terugkerende fallbackterm in TeamScan, Onboarding, Pulse en Leadership.
- De productspecifieke executive labels in reportcontent liepen nog achter op de nieuwere handofftaal.

## Belangrijkste inconsistenties of risico's

- Fallbacktaal als `bredere diagnose` kan bounded routes onbedoeld zwaarder of diagnostischer laten klinken dan bedoeld.
- Niet alle oudere reference- of archive-docs zijn onderdeel van deze outputreview; daar kan historische taal nog blijven bestaan.

## Beslissingen / canonvoorstellen

- Voor bounded routes heeft `bredere duiding` de voorkeur boven `bredere diagnose` wanneer de tekst verwijst naar een terugschakelroute.
- Productspecifieke executive labels zijn:
  - TeamScan: `Lokale handoff`
  - Onboarding 30-60-90: `Bestuurlijke handoff`
  - Leadership Scan: `Management-handoff`
- Pulse blijft een bounded reviewlaag en geen diagnostische vervolgmachine.

## Concrete wijzigingen

- TeamScan paritycopy aangescherpt in [backend/products/team/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/report_content.py) en [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- Onboarding fallbacktaal genormaliseerd in [frontend/lib/products/onboarding/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts)
- Leadership fallbacktaal genormaliseerd in [frontend/lib/products/leadership/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- Pulse fallbacktaal genormaliseerd in [frontend/lib/products/pulse/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/dashboard.ts)

## Validatie

- De non-core output verwijst nu consistenter naar bounded verificatie, bounded review en terugschakelen naar bredere duiding.
- Geen van deze wijzigingen maakt de non-core lijnen buyer-facing groter of productstatusrijker.

## Assumptions / defaults

- `Bredere duiding` is hier route- en interpretatietaal, geen nieuw productlabel.
- No-go claims zoals `geen brede diagnose` blijven staan waar ze productgrenzen expliciet bewaken.

## Next gate

Non-core dashboard parity matrix and historical canon boundary cleanup.
