# Openstaande Punten Autonoom Plan

> **Voor agentic workers:** focus op smalle, reviewbare slices vanaf `main`. Heropen de gelande dashboard-guided-execution-slice niet tenzij een echte blocker dat afdwingt.

**Doel:** de resterende open punten na landing van de dashboard-guided-execution-slice op `main` fase voor fase afwerken, zonder opnieuw in een brede design- of scopegolf te belanden.

**Architectuur:** behandel vervolgwerk als vijf aparte sporen: omgevingshygiëne, commerciële/strategische waarheid, publieke/commerciële promotie, operationele validatie en bredere suite-promotie. Elk spoor krijgt zijn eigen beslismoment, branch en definitie van gereed.

**Tech Stack:** Next.js, Supabase, Vercel, Python acceptance tooling, GitHub PR-flow, Excel-roadmaptracking.

---

## Uitgangspunt

Wat nu al staat:
- de dashboard-guided-execution-slice is schoon geland op `main`
- de nieuwe buyer-dashboardlijn is zichtbaar geverifieerd op preview
- de overview/navigatiecorrectie is geland
- de slice is inhoudelijk niet meer geblokkeerd

Wat expliciet nog niet mee is gepromoveerd:
- public/commercial
- pricing/sales/public-copy
- report/runtime
- bredere whole-line suitepromotie

Werkregel vanaf hier:
- nieuw werk start vanaf `main`
- dashboard-UI niet opnieuw openen zonder harde blocker
- bredere promoties alleen via aparte slices en aparte reviewbesluiten

---

## Fase 1: Omgevings- en Infra-Closeout

**Waarom eerst**
De dashboardslice zelf is inhoudelijk klaar, maar er staan nog losse omgevingsnotities open. Die moeten niet het vervolgwerk vertroebelen.

**Autonoom uitvoerbaar:** ja

**Doel**
De losse infrastructuurpunten expliciet afhechten, zodat ze niet blijven rondzingen als pseudo-productbugs.

**Open punten**
- lokale/runtime-omgevingen zonder volledige auth/Supabase-env
- Google Fonts-fetch in `frontend/app/layout.tsx`
- eventuele preview/CI-routeringscheck als extra zekerheid

**Aanpak**
1. Inventariseer exact welke env-vars lokaal, in preview en in CI nog ontbreken.
2. Scheid inhoudelijke productissues van omgevingsissues.
3. Los alleen de smalle infra-notities op die generiek nuttig zijn voor vervolgwerk.
4. Laat de dashboardslice ongemoeid als de oorzaak puur omgeving is.

**Definition of done**
- auth/Supabase-envstatus is duidelijk en reproduceerbaar
- Google Fonts-buildnuance is of opgelost, of expliciet als geaccepteerde infrastructuurnotitie vastgelegd
- er blijft geen verwarring meer bestaan tussen productbug en omgeving

**Aanbevolen branch**
- `codex/main-environment-closeout`

---

## Fase 2: Commerciële en Strategische Waarheid Herijken

**Waarom nu**
De productlaag is verder dan de commerciële en strategische documentatie. Dat risico wordt nu groter, omdat `main` de nieuwe dashboardbasis al bevat.

**Autonoom uitvoerbaar:** grotendeels ja

**Kernbevinding die al bekend is**
- `STRATEGY.md` leunt nog te sterk op ExitScan-first
- `PRICING_AND_PACKAGING_PROGRAM_PLAN.md` volgt nog te veel dezelfde hiërarchie
- dat botst met de huidige productwaarheid en portfolioverhoudingen

**Doel**
Eén strategisch/commercieel verhaal neerzetten dat klopt met:
- guided execution
- assisted self-service motion
- bounded portfolioverhoudingen
- gelijkwaardiger eerste routes waar productmatig passend

**Te herijken documenten**
- `C:\Users\larsh\Desktop\Business\Verisight\docs\strategy\STRATEGY.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\active\PRICING_AND_PACKAGING_PROGRAM_PLAN.md`
- eventuele afgeleide sales/public-copy inventarisaties

**Aanpak**
1. Maak een reviewbranch alleen voor strategie/pricing alignment.
2. Markeer alle passages die nog op ExitScan-first of ongelijkwaardige portfoliologica varen.
3. Schrijf een nieuwe canonieke lijn voor:
   - assisted self-service
   - first-buy routes
   - bounded follow-on producten
4. Trek pricing/packaging en strategietaal gelijk.
5. Maak pas daarna een aparte reviewbeslissing over publieke copy.

**Definition of done**
- strategie en pricing/packaging spreken dezelfde producttaal
- geen impliciete producthiërarchie meer die niet meer klopt
- nieuwe publieke/commerciële beslissingen kunnen hierop bouwen

**Aanbevolen branch**
- `codex/strategy-pricing-alignment`

---

## Fase 3: Public/Commercial Promotion Readiness

**Waarom apart**
Dit spoor is bewust niet meegesleept in de dashboardslice. Dat was terecht. Nu moet het zelfstandig beoordeeld worden.

**Autonoom uitvoerbaar:** ja

**Doel**
Bepalen welke public/commercial onderdelen schoon genoeg zijn voor promotie richting `main`, en welke nog niet.

**Scope**
- pricing/sales/public-copy
- homepage/public marketing lagen
- SEO/public tests

**Aanpak**
1. Trek een aparte main-afgeleide branch voor public/commercial readiness.
2. Inventariseer huidige failing tests en baselines.
3. Scheid:
   - echte regressies
   - verouderde verwachtingen
   - copy/positionering die eerst strategische herijking nodig heeft
4. Los alleen de minimale blockers op om deze laag reviewbaar te maken.
5. Neem pas promotiebesluit als de testlaag weer groen is.

**Definition of done**
- pricing/sales/public-copy tests groen
- geen strategische drift meer t.o.v. herijkte docs
- public/commercial promotie kan als eigen slice worden beoordeeld

**Aanbevolen branch**
- `codex/public-commercial-main-readiness`

---

## Fase 4: Werkelijke Klantoperatie Bewijzen

**Waarom dit geen pure codefase is**
De assisted self-service beweging is technisch ver genoeg. Nu moet bewezen worden waar echte klanten nog vastlopen.

**Autonoom uitvoerbaar:** gedeeltelijk

**Wat kan autonoom**
- testscript opstellen
- walkthroughs voorbereiden
- meetpunten definiëren
- observatiekader en intakeformat maken

**Wat niet volledig autonoom kan**
- echte klantdoorlopen zonder echte gebruikers of interne operatorinput

**Doel**
Zichtbaar maken waar de frictie nog zit in:
- import
- launch
- reminders
- dashboardgebruik
- first-next-step begrip

**Aanpak**
1. Maak een compact validatieprotocol voor echte klantdoorlopen.
2. Definieer per stap:
   - succescriterium
   - vastloopindicator
   - benodigde operatorinterventie
3. Gebruik 2-3 echte of semireële doorlopen.
4. Categoriseer uitkomst in:
   - productissue
   - onboardingissue
   - supportissue
   - verwachtingsissue
5. Prioriteer alleen patronen, geen incidenten.

**Definition of done**
- duidelijk overzicht van echte klantfricties
- onderscheid tussen product, ops en communicatie
- input voor customer ops-hardening

**Aanbevolen branch / spoor**
- geen codebranch als dat niet nodig is
- wel een aparte reviewnotitie of validatiedoc

---

## Fase 5: Customer Operations Hardening

**Waarom dit nu relevant is**
Als productuitvoering meer assisted self-service wordt, moet de operationele schil scherper worden.

**Autonoom uitvoerbaar:** grotendeels ja

**Doel**
Heldere eigenaarschap- en follow-upstructuur neerzetten tussen Verisight en klant.

**Scope**
- onboarding adoption
- lifecycle / expansion
- ownership mapping
- follow-up flows na activatie

**Aanpak**
1. Beschrijf per lifecyclefase wie eigenaar is:
   - Verisight
   - klant
   - gedeeld
2. Definieer standaard follow-upmomenten na:
   - setup
   - import
   - launch
   - dashboardactivatie
   - eerste managementread
3. Maak escalation rules:
   - wanneer customer success
   - wanneer product
   - wanneer sales/commercial
4. Leg dit vast als operatorspeelboek, niet als losse kennis.

**Definition of done**
- lifecycle en ownership zijn expliciet
- onboarding en expansie zijn niet meer impliciet persoonsafhankelijk
- assisted self-service wordt ook operationeel draagbaar

**Aanbevolen branch**
- `codex/customer-ops-hardening`

---

## Fase 6: Report/Runtime en Whole-Line Promotion Later

**Waarom bewust later**
Dit spoor was expliciet te breed en te risicovol om mee te slepen in de dashboardslice. Dat blijft zo totdat de contract- en acceptancebasis schoon is.

**Autonoom uitvoerbaar:** ja, als reviewtraject

**Doel**
Eerlijk vaststellen wanneer bredere promotie wél kan.

**Gating**
- `pytest -q` schoon
- acceptance schoon
- API-flow schoon
- report/runtime schoon

**Aanpak**
1. Maak een aparte readiness review op report/runtime en bredere suiteonderdelen.
2. Los alleen echte blockers op die nodig zijn voor een nieuw promotiebesluit.
3. Neem pas daarna een nieuw whole-line promotiebesluit.

**Definition of done**
- brede suite-promotie is óf expliciet nog niet klaar
- óf klaar met onderbouwde, schone gating

**Aanbevolen branch**
- `codex/report-runtime-main-readiness`

---

## Aanbevolen Uitvoervolgorde

1. Fase 1: omgevings- en infra-closeout
2. Fase 2: commerciële en strategische waarheid herijken
3. Fase 3: public/commercial promotion readiness
4. Fase 4: werkelijke klantoperatie bewijzen
5. Fase 5: customer operations hardening
6. Fase 6: report/runtime en whole-line promotion later

---

## Beslisregels

- Als iets de gelande dashboardslice niet inhoudelijk raakt: niet heropenen.
- Als iets omgevingsgebonden is: als infra behandelen, niet als productscope.
- Als iets public/commercial is: niet stiekem onder dashboardwerk laten vallen.
- Als iets echte klantinput vraagt: eerst validatiekader, dan pas conclusies.
- Als een spoor geen schone definitie van gereed heeft: niet starten.

---

## Kort Bestuurlijk Oordeel

Verisight staat nu technisch en UX-matig sterk genoeg op `main` voor de dashboard-guided-execution basis. De open punten zitten vooral in volwassenmaking:
- omgeving opruimen
- strategie/commercial gelijk trekken
- echte klantoperatie bewijzen
- customer ops formaliseren
- bredere promoties pas later en gecontroleerd
