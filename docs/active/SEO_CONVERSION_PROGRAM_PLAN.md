# SEO Conversion Program Plan

## 1. Summary

Dit traject maakt van de huidige Verisight-site een compacte maar veel scherpere SEO- en conversielaag, gebaseerd op de actuele repo-waarheid: ExitScan blijft de primaire organische wedge, RetentieScan blijft complementair en specifiek, en organisch verkeer moet landen op pagina's die ook commercieel overtuigen.

Repo-observaties die dit plan sturen:

- website-, funnel-, pricing- en showcase-trajecten zijn afgerond en vormen nu de commerciële basis
- `SEO_CONVERSION_PROGRAM_PLANMODE_PROMPT.md` stond nog open in `PROMPT_CHECKLIST.xlsx`
- de huidige site heeft al sterke money pages en route-aware lead capture, maar nog een dunne SEO-surface
- metadata en crawl/index-logica waren deels goed, maar nog niet volledig consistent
- voorbeeldrapporten zijn sterke proof, maar mogen geen betere SEO-landingspunten worden dan de HTML-pagina's
- de huidige CTA-flow stuurde veel verkeer terug naar `/#kennismaking`, wat voor organische landingen commercieel niet altijd de sterkste handoff is

Beslissingen voor deze tranche:

- compacte uitbreiding, geen brede contentmachine
- inline route-aware kennismakingsform op key money pages
- bestaande backend leadcontracten blijven leidend; geen nieuw CRM- of analyticsplatform
- maximaal drie nieuwe intent-led SEO-landingspagina's, direct gekoppeld aan ExitScan of RetentieScan
- publieke voorbeeld-pdf's blijven toegankelijk als prooflaag, maar worden niet als primaire indexeerbare SEO-eindpunten behandeld

Uitvoeringsnotitie 2026-04-15:

- dit plan is in repo uitgevoerd en geldt als source of truth
- validatie is uitgevoerd via tests, lint, build en statische metadata/indexability/CTA-checks
- er is geen live productiecontrole of Search Console-validatie gedaan in deze tranche

## 2. Milestones

### Milestone 1 - Freeze Current SEO And Conversion Baseline
Dependency: none

#### Tasks
- [x] Leg per indexeerbare HTML-route de vaste commerciële en SEO-rol vast voor `/`, `/producten`, `/producten/exitscan`, `/producten/retentiescan`, `/producten/combinatie`, `/aanpak`, `/tarieven` en `/vertrouwen`.
- [x] Leg per route de primaire zoekintentie vast: merk, productkeuze, vertrekduiding, behoudsvroegsignalering, pricing, aanpak of due diligence.
- [x] Leg de huidige technische baseline vast voor metadata, canonical tags, structured data, sitemap, robots, redirects en publieke assets.
- [x] Leg de huidige conversiebaseline vast voor CTA-richting, form-hand-off, sample-proof, pricing-proof en trust-proof.
- [x] Markeer expliciet de huidige repo-spanningen: generieke homepage-title, supportpagina's met verouderde `/og-image.png`-verwijzingen, verouderde `llms.txt`, publieke pdf-proof zonder expliciete noindex-strategie en de huidige terugverwijzing van product-CTA's naar de homepageform.

#### Definition of done
- [x] Er ligt één controleerbaar startbeeld van de huidige SEO- en conversielaag.
- [x] Elke bestaande indexeerbare route heeft één duidelijke SEO- en conversierol.
- [x] De belangrijkste technische en commerciële zwaktes zijn expliciet genoeg om zonder nieuwe ontdekkingstocht uit te voeren.

#### Validation
- [x] Bevindingen zijn herleidbaar naar actuele routes, metadata en marketingcomponenten in de repo.
- [x] ExitScan staat zichtbaar vast als primaire organische wedge.
- [x] Geen baselineconclusie leunt op aannames buiten repo en huidige prompt-/roadmapstatus.

### Milestone 2 - Rebuild Existing Money Pages As The Primary SEO + Conversion Layer
Dependency: Milestone 1

#### Tasks
- [x] Maak `/producten/exitscan` de primaire non-brand money page voor commerciële SEO rond vertrekduiding en verloopanalyse.
- [x] Positioneer `/producten/retentiescan` als specifieke non-brand landingspagina voor behoudsvraagstukken en vroegsignalering, zonder MTO- of predictorframing.
- [x] Houd `/` merk- en routegedreven; optimaliseer deze pagina op merk + portfolio + routekeuze, niet als breed generieke keyword-pagina.
- [x] Houd `/producten` als routekiezer en vergelijkingslaag; niet als sterkste individuele SEO-doelpagina.
- [x] Houd `/tarieven` als kooprust-pagina voor bezoekers met hoge intent en `/aanpak` als voorspelbaar handoff-/implementatiepad.
- [x] Houd `/vertrouwen` indexeerbaar als due-diligence pagina voor trust-, privacy- en methodiekvragen die commerciële twijfel wegnemen.
- [x] Scherp titles, descriptions, H1/H2-hiërarchie, introcopy en interne links per bestaande route aan op één primaire intent en één primaire vervolgstap.
- [x] Maak metadata-consistentie leidend: elke indexeerbare pagina krijgt unieke title, description, canonical, OG en Twitter metadata die dezelfde route en producttaal volgen.

#### Definition of done
- [x] Elke bestaande money page heeft een expliciete primaire zoekintentie en een expliciete conversietaak.
- [x] De huidige kernpagina's kunnen organisch verkeer opvangen zonder direct productverwarring of funnel-lek.
- [x] Metadata en on-page hiërarchie vertellen hetzelfde verhaal als pricing, showcase en trust.

#### Validation
- [x] `/producten/exitscan` leest als primaire SEO- en commerciële landingspagina voor ExitScan.
- [x] `/producten/retentiescan` leest als gerichte aanvullende route, niet als lichtere variant van ExitScan.
- [x] `/tarieven`, `/aanpak` en `/vertrouwen` versterken productconversie in plaats van een parallel informatief pad te openen.

### Milestone 3 - Add A Compact Intent-Led Landing Layer Without Building A Content Machine
Dependency: Milestone 2

#### Tasks
- [x] Gebruik de bestaande `/oplossingen/[slug]` namespace voor precies drie intent-led landingspagina's:
- [x] `/oplossingen/verloop-analyse` als ExitScan-gedreven pagina voor organisaties die vertrekpatronen en verloop bestuurlijk willen duiden.
- [x] `/oplossingen/exitgesprekken-analyse` als ExitScan-gedreven pagina voor organisaties die al exitgesprekken doen maar nog geen vergelijkbaar managementbeeld hebben.
- [x] `/oplossingen/medewerkersbehoud-analyse` als RetentieScan-gedreven pagina voor organisaties die eerder willen zien waar behoud onder druk staat.
- [x] Maak deze pagina's commercial-intent bridge pages: geen blogartikelen, geen thought leadership, geen brede kennisbank, maar routepagina's die direct doorsturen naar productbegrip, proof en kennismaking.
- [x] Laat elke oplossingspagina één vaste route volgen: intentprobleem, waarom bestaande aanpak tekortschiet, welke productroute logisch is, welke output je krijgt, proof, trust, inline kennismakingsform.
- [x] Laat ExitScan-oplossingspagina's altijd doorverwijzen naar `/producten/exitscan`; laat de behoudspagina altijd doorverwijzen naar `/producten/retentiescan`.
- [x] Beperk combinatie expliciet tot ondersteunende interne links; geen aparte primaire SEO-oplossingspagina voor combinatie in deze tranche.
- [x] Pas het huidige legacy redirectgedrag van `/oplossingen/[slug]` aan zodat alleen de drie gekozen intentslugs echte landingspagina's renderen; productslugs mogen blijven redirecten naar `/producten/[slug]`, onbekende slugs geven 404.

#### Definition of done
- [x] Verisight heeft een compacte extra SEO-laag die direct aansluit op bestaande producten en funnel.
- [x] Nieuwe SEO-landingen voegen intentdekking toe zonder een losse contentoperating-system laag te suggereren.
- [x] ExitScan krijgt meer organisch bereik zonder dat RetentieScan of combinatie de primaire wedge vertroebelen.

#### Validation
- [x] De drie nieuwe oplossingspagina's hebben elk een duidelijke primaire route en duidelijke producthandoff.
- [x] Geen nieuwe pagina voelt als blog, kennisbank of generieke contenthub.
- [x] Geen nieuwe landingspagina verkoopt een productbelofte die huidige output, pricing of trustlaag niet dragen.

### Milestone 4 - Rebuild Conversion Handoffs For Organic Landing Traffic
Dependency: Milestone 2 and Milestone 3

#### Tasks
- [x] Behoud het bestaande backend leadcontract en het bestaande route-aware formuliercontract; geen nieuwe velden of afwijkende leadstructuren in deze tranche.
- [x] Plaats dezelfde route-aware kennismakingsformule inline op de belangrijkste money pages: `/producten/exitscan`, `/producten/retentiescan`, `/tarieven` en de drie nieuwe `/oplossingen/*`-pagina's.
- [x] Laat homepage-contact bestaan als centrale merkentry, maar maak het niet langer de enige inhoudelijke leadcapture-locatie voor organisch verkeer.
- [x] Geef elke inline form-plaatsing een vaste `defaultRouteInterest` en unieke `cta_source`, zodat organisch verkeer op landingspaginaniveau meetbaar en opvolgbaar blijft binnen het bestaande leadmodel.
- [x] Houd `/producten/combinatie`, `/producten` en `/vertrouwen` CTA-gedreven zonder inline form; deze pagina's ondersteunen routekeuze, due diligence en portfolio-uitleg, maar zijn niet de primaire leadcapture-doelpagina's.
- [x] Zorg dat sample-proof nooit los komt te staan van next-step copy: elke sample-entry op SEO- en money pages krijgt in dezelfde viewport of sectie een duidelijke route-CTA of inline kennismakingsform.
- [x] Voorkom dat pricing, trust of pdf-proof de eerste route verdringen: organisch verkeer moet eerst product-fit snappen en pas daarna proof of due diligence openen.

#### Definition of done
- [x] Organisch verkeer hoeft niet meer via een extra homepage-omweg naar eerste leadcapture.
- [x] Bestaande route-aware leadopslag blijft intact.
- [x] Proof, trust en pricing ondersteunen nu de conversiestap van de landingspagina zelf.

#### Validation
- [x] Een bezoeker op `/producten/exitscan` kan zonder homepage-omweg een route-aware aanvraag indienen.
- [x] Een bezoeker op `/oplossingen/medewerkersbehoud-analyse` komt met `route_interest=retentiescan` en page-specifieke `cta_source` binnen.
- [x] Sample-output blijft openbaar bruikbaar, maar staat niet los van de primaire commerciële vervolgstap.

### Milestone 5 - Tighten Technical SEO, Crawl Strategy, Regression Safety And Prompt Closure
Dependency: Milestone 4

#### Tasks
- [x] Maak crawl- en indexlogica expliciet voor publieke voorbeeld-pdf's: openbaar toegankelijk houden, maar niet behandelen als primaire indexeerbare landingspunten.
- [x] Voeg voor buyer-facing pdf-assets onder `/examples/` een expliciete noindex-strategie toe via headers of equivalent runtime-gedrag; laat ze wel publiek downloadbaar blijven.
- [x] Sluit technische consistentiegaten: homepage metadata aanscherpen, verouderde OG-image referenties vervangen door bestaande assets of route-based OG images, `llms.txt` bijwerken naar huidige product-/pricingwaarheid.
- [x] Update sitemap zodat alle indexeerbare HTML-routes zijn opgenomen en niet-indexeerbare assets of pdf's dat niet zijn.
- [x] Houd `robots.txt` compact en publiek, met blijvende blokkade voor auth-, dashboard- en API-routes.
- [x] Voeg regressiebescherming toe voor metadata, sitemap, canonical routes, inline form-plaatsingen, route-aware CTA-bronnen en publieke/non-indexeerbare proof-assets.
- [x] Werk `PROMPT_CHECKLIST.xlsx` bij zodat deze prompt als voltooid wordt gemarkeerd met korte repo-waarheidsnotitie en datum.

#### Definition of done
- [x] De SEO-laag is technisch consistent met de commerciële routing.
- [x] Crawlbare HTML-routes en publieke proof-assets hebben elk de juiste indexeerlogica.
- [x] Toekomstige websitewijzigingen kunnen minder makkelijk SEO- of conversiedrift veroorzaken.

#### Validation
- [x] Sitemap bevat alle bedoelde HTML-landingspagina's en geen pdf-proofroutes.
- [x] Publieke voorbeeld-pdf's blijven bereikbaar maar zijn niet bedoeld als indexeerbare landingspagina's.
- [x] Tests beschermen titles, canonicals, OG/Twitter metadata, CTA-flow, inline form-presence en `/oplossingen/*` routegedrag.
- [x] `PROMPT_CHECKLIST.xlsx` weerspiegelt de uitgevoerde planprompt en `SEO_CONVERSION_PROGRAM_PLAN.md` staat als source of truth vast.

## 3. Execution Breakdown By Subsystem

### Information architecture and page roles
- Home blijft merk- en routepagina.
- `/producten/exitscan` wordt primaire organische productlandingspagina.
- `/producten/retentiescan` blijft specifieke aanvullende productlandingspagina.
- `/producten` blijft vergelijkings- en routekiezer.
- `/aanpak`, `/tarieven` en `/vertrouwen` blijven ondersteunende high-intent pagina's.
- Nieuwe SEO-dekking blijft beperkt tot drie intent-led `/oplossingen/*`-routes.

### Public interfaces, routes and page contracts
- Nieuwe publieke HTML-routes:
- `/oplossingen/verloop-analyse`
- `/oplossingen/exitgesprekken-analyse`
- `/oplossingen/medewerkersbehoud-analyse`
- Bestaande `/oplossingen/[slug]` redirectlogica verandert naar mixed behavior:
- de drie intentslugs renderen echte SEO-pagina's
- productslugs redirecten naar `/producten/[slug]`
- onbekende slugs geven 404
- Bestaande contact-API en backend-contracten blijven ongewijzigd.
- `ContactForm` wordt hergebruikt met page-specifieke defaults; geen nieuw backend schema.

### Metadata, structured data and crawl/index logic
- Layout-level `Organization` schema blijft bestaan.
- Productpagina's behouden `Service` + `WebPage` + `BreadcrumbList`.
- Ondersteunende pagina's en nieuwe oplossingspagina's gebruiken `WebPage` + `BreadcrumbList`; geen nieuwe inflated schema types.
- FAQ schema alleen waar zichtbare FAQ-content werkelijk op de pagina staat.
- Alle indexeerbare HTML-pagina's krijgen unieke title/description/canonical/OG/Twitter pariteit.
- `/examples/*.pdf` blijft publiek maar krijgt expliciet noindex/noarchive gedrag.
- `llms.txt` wordt gealigneerd op huidige ExitScan-first, RetentieScan-complementair, actuele pricingankers en huidige publieke route-architectuur.

### Conversion architecture
- Inline kennismakingsform op:
- `/producten/exitscan`
- `/producten/retentiescan`
- `/tarieven`
- `/oplossingen/verloop-analyse`
- `/oplossingen/exitgesprekken-analyse`
- `/oplossingen/medewerkersbehoud-analyse`
- Geen inline form op:
- `/`
- `/producten`
- `/producten/combinatie`
- `/aanpak`
- `/vertrouwen`
- Elke formplaatsing gebruikt vaste routecontext en unieke `cta_source`.
- Proof- en pricingblokken moeten altijd binnen dezelfde leeslijn een duidelijke route-CTA of inline form hebben.

### Internal linking and proof distribution
- Home linkt primair naar ExitScan, RetentieScan, tarieven, aanpak en vertrouwen.
- Oplossingspagina's linken primair naar hun productdetailpagina, tarieven, aanpak en vertrouwen.
- Productdetailpagina's linken door naar pricing, aanpak en relevante sample-output.
- Vertrouwen ondersteunt due diligence en linkt terug naar productroutes; het wordt geen parallelle funnel.
- Voorbeeldrapporten blijven deliverable-proof en geen primaire organische bestemmingen.

### Measurement and acceptance
- Geen nieuwe derde analytics-stack in deze tranche.
- Bestaande leadcontext blijft de v1-meetbasis:
- `route_interest`
- `cta_source`
- `desired_timing`
- Nieuwe page-level `cta_source` waarden worden toegevoegd voor alle inline organic forms.
- Acceptatie focust op landing-to-form, routekwaliteit van leads, metadata-consistentie en crawlgedrag.

## 4. Current Product Risks

- SEO-risico: de site heeft nu nog te weinig intent-oppervlak buiten de bestaande money pages, waardoor non-brand bereik beperkt blijft.
- SEO-risico: publieke pdf-proof kan de verkeerde entrypointlaag worden als indexlogica niet expliciet wordt begrensd.
- Conversierisico: organisch verkeer op product- of pricingpagina's verliest momentum door de huidige terugstap naar de homepageform.
- Conversierisico: proof en trust zijn sterk, maar kunnen zonder strakke CTA-plaatsing nog te veel als zijpad functioneren.
- Copy-risico: verbreding van SEO-copy kan de huidige scherpe producthiërarchie beschadigen als ExitScan, RetentieScan en combinatie te gelijkwaardig gaan klinken.
- Positioneringsrisico: RetentieScan kan in SEO-context te snel richting MTO- of predictor-taal glijden als intentpagina's niet streng begrensd blijven.
- Landingsrisico: verkeer kan op te algemene of te due-diligence-achtige pagina's landen terwijl de sterkste commerciële route juist via productdetail of intent-led solution pages loopt.
- Productproof-risico: sterke voorbeeldoutput wordt commercieel onvoldoende benut als HTML-routes niet duidelijk beter converteren dan pdf-openingen.

## 5. Open Questions

- Search Console- en live querydata zitten niet in de repo; de eerste implementatie gebruikt daarom repo- en intentlogica als default, niet bewezen queryvolumes.
- Als `verloop-analyse` en `exitgesprekken-analyse` live te sterk kannibaliseren, wordt één van beide later teruggebracht of samengevoegd; de eerste implementatie houdt ze bewust klein en commercieel.
- Als inline forms op money pages duidelijk beter converteren, kan later ook `/aanpak` worden overwogen als extra leadcapture-pagina; in deze tranche blijft die CTA-gedreven.

## 6. Follow-up Ideas

- Voeg na deze tranche Search Console- en leadkwaliteitsevaluatie toe per route en per `cta_source`.
- Voeg later een tweede compacte ExitScan-intentlaag toe rond managementrapportage of uitstroomduiding als echte querydata daar aanleiding voor geeft.
- Overweeg later een beperkte case-proof laag zodra echte klantcases beschikbaar zijn; niet eerder.
- Gebruik deze SEO-laag later als input voor `CONTENT_OPERATING_SYSTEM_PLANMODE_PROMPT.md`, pas nadat de eerste organische landingsstructuur commercieel stabiel is.

## 7. Out of Scope For Now

- Geen brede blog, kennisbank of thought-leadership machine.
- Geen contentcluster buiten ExitScan/RetentieScan-gerichte intentpagina's.
- Geen nieuwe productfamilies of portfolio-uitbreiding.
- Geen derde analytics-stack, cookiebanner of marketing automation-platform.
- Geen self-service booking, checkout of SaaS-billinglogica.
- Geen combinatie-gedreven SEO-hoofdroute.
- Geen ROI-, benchmark- of case-proofclaims zonder echte basis.
- Geen herbouw van backend leadschema's of admin leadstructuur.

## 8. Defaults Chosen

- `SEO_CONVERSION_PROGRAM_PLANMODE_PROMPT.md` is de leidende prompt voor dit traject.
- `SEO_CONVERSION_PROGRAM_PLAN.md` wordt de source of truth.
- ExitScan blijft de primaire organische en commerciële wedge.
- RetentieScan blijft complementair en gericht op expliciete behoudsintentie.
- De SEO-tranche blijft compact: bestaande money pages plus precies drie intent-led oplossingspagina's.
- Lead capture wordt verspreid naar key money pages via dezelfde route-aware formcomponent; backendcontracten blijven gelijk.
- Publieke voorbeeld-pdf's blijven toegankelijk als prooflaag maar worden niet als primaire indexeerbare bestemmingen behandeld.
- `/vertrouwen` blijft indexeerbaar als due-diligence supportpagina.
- Geen nieuwe externe analytics-stack in v1; page-level leadcontext blijft de meetbasis.
- `PROMPT_CHECKLIST.xlsx` is bijgewerkt met datum, status en korte repo-waarheidsnotitie.
