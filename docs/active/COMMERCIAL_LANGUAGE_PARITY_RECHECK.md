# COMMERCIAL_LANGUAGE_PARITY_RECHECK.md

Last updated: 2026-04-18
Status: active
Source of truth: deze recheck normaliseert buyer-facing terminologie over marketing, pricing, preview en onboarding zonder de vastgezette ExitScan-architectuur of bredere productstatus te herdefinieren.

## Titel

Commercial Language Parity Recheck

## Korte samenvatting

De commerciële en buyer-facing taal is opnieuw gelijkgetrokken met de hardeningcanon. De belangrijkste fix is dat zichtbare routewoorden nu minder statusgedreven zijn: `baseline` en `ritmeroute` vervangen oude framing zoals `retrospectief`, `momentopname` en `live` waar die te veel als commerciële productstatus of los deliverable-label klonken. Daarnaast is `managementsamenvatting` in buyer-facing mirrors teruggebracht naar `bestuurlijke read` waar het anders te veel als losse openingspagina of generieke outputvorm werd gelezen.

## Wat is geaudit

- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx>)
- [client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- [sample-showcase-assets.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/sample-showcase-assets.ts)
- [seo-solution-pages.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/seo-solution-pages.ts)

## Belangrijkste bevindingen

- Buyer-facing outputlijsten en trustteksten gebruikten nog op meerdere plekken `managementsamenvatting` waar de canon inmiddels preciezer vraagt om `cover`, `responslaag` of `bestuurlijke read`.
- Pricing- en routecopy gebruikte nog statusachtige woorden zoals `live`, `retrospectief` en `momentopname` op plekken waar `baseline` en `ritmeroute` beter passen bij de huidige productrealiteit.
- Interne onboarding- en lifecycle-copy liepen daardoor deels achter op de recentere canon en pricinglaag.

## Belangrijkste inconsistenties of risico's

- De term `managementsamenvatting` blijft op sommige product- en methodiekplekken inhoudelijk verdedigbaar, maar werkt in buyer-facing mirrors snel als driftwoord als hij een aparte openingslaag suggereert.
- `ExitScan ritmeroute` en `RetentieScan ritmeroute` zijn in deze recheck commercieel-normaliserende labels; ze promoveren geen nieuwe repo-brede productstatus.
- Productspecifieke methodiektermen zoals Pulse-`momentopname` of ExitScan-frictiescore-uitleg zijn bewust niet generiek herschreven wanneer ze functioneel bij de productlogica horen.

## Beslissingen / canonvoorstellen

- In buyer-facing mirrors heeft `bestuurlijke read` de voorkeur boven `managementsamenvatting` wanneer het om de executive leeslaag gaat.
- Voor commerciële routeframing heeft `baseline` de voorkeur boven `retrospectief` of `momentopname` als label voor de eerste koop.
- Voor commerciële vervolgframing heeft `ritmeroute` de voorkeur boven `live` als label voor een doorlopende of herhaalde vervolgroute.
- Deze labels zijn paritytaal voor marketing en onboarding, geen repo-brede statuspromotie.

## Concrete wijzigingen

- ExitScan- en RetentieScan-service-output in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) herschreven naar `cover`, `responslaag` en `bestuurlijke read`.
- Pricinglabels en vervolgroutebenamingen in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx) genormaliseerd naar `baseline` en `ritmeroute`.
- ExitScan productdetail in [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx>) aangepast van `retrospectief/live` naar `baseline/ritmeroute`.
- Marketing- en trustcopy in [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts) genormaliseerd op `bestuurlijke read`, `ExitScan ritmeroute` en `RetentieScan ritmeroute`.
- Onboarding- en lifecyclecopy in [client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts) gelijkgetrokken met dezelfde routewoorden.
- Preview-, showcase- en SEO-copy in [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts), [sample-showcase-assets.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/sample-showcase-assets.ts) en [seo-solution-pages.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/seo-solution-pages.ts) aangepast op dezelfde buyer-facing taal.

## Validatie

- Gerichte frontend-tests voor marketing, onboarding en previewcopy zijn groen.
- De frontend-build is geslaagd na de sweep, inclusief de statische product-, pricing- en trustpagina's.

## Assumptions / defaults

- Deze stap verandert geen pricingbesluit, productstatus of portfolio-architectuur.
- `baseline` en `ritmeroute` zijn hier terminologie voor commerciële parity, niet voor backend- of database-types.
- Waar `managementsamenvatting` binnen methodische productuitleg inhoudelijk nodig bleef, is die term bewust niet overal verwijderd.

## Next gate

De beste volgende stap is een gerichte `document index and active-doc registration cleanup`, plus een laatste check of interne plan- en referentiedocs nog oude builder- of routewoorden gebruiken buiten de actieve canonlaag.
