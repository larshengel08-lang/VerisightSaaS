# Site-ronde bij propositiebesluit A: de bespreking uit het aanbod

Datum: 2026-09-20
Status: akkoord Lars 2026-09-20, met de besluiten in par. 8
Hoort bij: besluit 2026-09-19 (optie A) en besluit 2026-09-11 (het rapport werkt zonder begeleiding)

## 1. Waar dit over gaat

Besluit A: €4.500 is meting, rapport en gespreksleidraad. De HR-manager van de klant leidt het MT-gesprek zelf, het rapport is haar script. Loep zit niet aan tafel.

De site verkoopt nu het omgekeerde. De inventaris van 20 september vond ruim tachtig treffers. Het gaat om meer dan de zin "begeleide managementbespreking": het woord **begeleid** draagt de hele positionering.

Drie dingen kloppen niet meer:

1. **De bespreking.** Op elke prijsplek, in de leveringslijst, in de veelgestelde vragen, in `llms.txt` en in de JSON-LD.
2. **"Geen zelfbedieningstool."** Sinds de klantsuite (plan 1, 2a, 2b) verstuurt de klant zelf de uitnodiging, volgt de respons, sluit de meting, downloadt het rapport en legt straks het besluit vast. Zinnen als "Loep doet de meting", "de klant beheert geen software" en "je hoeft niets zelf in te richten" zijn feitelijk onjuist geworden.
3. **"Geduid door HR-specialisten, geen geautomatiseerde software-output."** Dit staat op de homepage en is onwaar, ook los van besluit A: het rapport wordt volledig door de software opgebouwd. Dit is het soort claim dat een inkoper bij de eerste vraag doorprikt. Het moet weg, en het eerlijke verhaal is sterker: je ziet per onderwerp precies waarom iets bovenaan staat.

## 2. Het besluit dat eerst nodig is: wat is Loep nu?

De oude categorieregel was "Begeleide analyse · Geen zelfbedieningstool". Die kan niet blijven. Drie opties voor de nieuwe:

| | Eyebrow op de homepage | Titel in de browser en in Google |
|---|---|---|
| **1 (advies)** | Meting en rapport · Het gesprek voer je zelf | Loep · Medewerkersonderzoek dat zegt waar je begint |
| 2 | Een rapport dat het gesprek leidt | Loep · Het rapport dat je MT-gesprek leidt |
| 3 | Medewerkersonderzoek met een antwoord | Loep · Medewerkersonderzoek met een antwoord |

Besluit Lars 20-9: de eyebrow van optie 1, met een andere titel (zie par. 8 punt 1). De eyebrow zegt eerlijk wat je koopt en wat je zelf doet, en maakt van het ontbreken van de bespreking een keuze in plaats van een gemis. De titel houdt de kernboodschap van 6 september vast ("waar je maandag begint").

Wat Loep wél doet, en wat dus mag blijven staan: de intake, de meting klaarzetten met afdelingen en aantallen, de vragenlijst en de methode, het rapport, en bereikbaar zijn als iets niet werkt. Wat de klant doet: uitnodigen, de respons volgen, sluiten, het gesprek leiden, het besluit vastleggen.

## 3. Wanneer dit live mag

De afspraak van 11 september blijft: de site belooft niets wat het rapport nog niet waarmaakt.

- **Poort 3b.** Alles over "het rapport leidt het gesprek", de gespreksleidraad, de werkvragen en de besluitpagina mag live zodra plan 3b is gemerged en een koude leesronde gat B3 dicht verklaart.
- **Poort 3c.** De zin dat de vergelijking met meting 1 in het rapport staat, mag pas live na plan 3c.
- **Nu al.** De onware claim "geduid door HR-specialisten, geen geautomatiseerde software-output" kan er vandaag uit. Dat is geen propositiewijziging maar een correctie.

Voorstel: de hele ronde in één keer bouwen op een branch, mergen na poort 3b, met de vervolgmetingszin tijdelijk in een eerlijke tussenvorm (zie 4.3).

## 4. Nu en wordt, per live plek

Alleen plekken die echt renderen. Dode code staat in par. 5.

### 4.1 Metadata (`app/layout.tsx`, `app/page.tsx`)

| Plek | Nu | Wordt |
|---|---|---|
| Titel (3×) | Loep \| Begeleide analyse van behoud, vertrek en onboarding | Loep \| Zie waar behoud onder druk staat, voordat mensen gaan |
| Beschrijving (layout, 2×) | ... weet waar je begint. Begeleide scan met rapport en gesprek inbegrepen. | ... weet waar je begint. Meting en rapport; het gesprek met je MT voer je zelf, met het rapport als leidraad. |
| Beschrijving (home) | ... Begeleide scan voor HR en management, rapport en gesprek inbegrepen. | ... Voor HR en management: een meting en een rapport dat je MT-gesprek leidt. |
| JSON-LD (home r.21) | Begeleide scan van behoud, vertrek en onboarding voor HR en management: ... | Meting van behoud, vertrek en onboarding voor HR en management: ... |

### 4.2 Homepage (`components/marketing/home-page-content.tsx`)

| Regel | Nu | Wordt |
|---|---|---|
| 734 | Begeleide retentie-analyse | Meting en rapport · Het gesprek voer je zelf |
| 1761 | Begeleide analyse · Geen zelfbedieningstool | Meting en rapport · Het gesprek voer je zelf |
| 581 | Loep meet niet alleen. Loep begeleidt management naar één eerste keuze. | Loep meet niet alleen. Het rapport brengt je MT tot één eerste keuze. |
| 948 | ... Daarna bespreken we het samen met je MT en leggen we vast: wat, wie, wanneer. | ... Daarna leid jij het gesprek met je MT, met het rapport als leidraad, en leggen jullie vast: wat, wie, wanneer. |
| 330 (mock) | Bespreking ingepland | Besluit vastgelegd |
| 1730 | Managementbespreking standaard inbegrepen | Gespreksleidraad en besluitpagina in elk rapport |
| 1819-1841 | Foto van Lars, "Oprichter & HR-specialist", quote "Ik duid elke scan zelf. Geen dashboard, maar een gesprek dat tot een keuze leidt." | Het hele fotoblok weg. De trustsectie wordt weer één kolom, zoals op 17 juni. De foto blijft op `/kennismaking`. |
| 1892-1895 | Loep gebruikt gevalideerde vragenlijsten, geduid door HR-specialisten, geen geautomatiseerde software-output. Elke rapportage is contextgebonden en wordt begeleid met een managementbespreking. | Loep gebruikt gevalideerde vragenlijsten. Het rapport laat per onderwerp zien waarom het bovenaan staat, dus geen cijfer dat je maar moet geloven. De vertaling naar jullie situatie maak je zelf, met de werkvragen in het rapport. |

### 4.3 Producten en prijs (`components/marketing/producten-content.tsx`)

| Regel | Nu | Wordt |
|---|---|---|
| 16 | Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst) | Meting klaarzetten: vragenlijst, afdelingen en de uitnodigingstekst die je zelf verstuurt |
| 17 | Respons monitoren op campagneniveau | Je volgt de respons in je eigen omgeving en sluit of verlengt zelf |
| 19 | Begeleide managementbespreking (60–90 min) | Gespreksleidraad van 45 minuten en een besluitpagina in het rapport |
| 20 | Vervolgstap vastgelegd | Besluit vastleggen in je omgeving |
| 29 | Wij brengen vertrekpatronen scherp in beeld en begeleiden je naar één duidelijke managementkeuze. | Loep brengt vertrekpatronen scherp in beeld, en het rapport brengt je MT tot één duidelijke keuze. |
| 138 | ... Daarna bespreken we het samen. Geen software om te beheren. ... | ... Daarna leid jij het gesprek met je MT; het rapport is je leidraad. ... |
| 177 | Eén begeleide route, ongeacht de scan. | Eén vaste route, ongeacht de scan. |
| 300 | ... een volledig traject, van intake tot en met de begeleide managementbespreking. | ... een volledig traject, van intake tot en met het rapport met gespreksleidraad. |
| 306-307 | ... zo'n €30 per medewerker, inclusief de bespreking. | ... zo'n €30 per medewerker. |
| 316 | Eenmalig en alles inbegrepen: inrichting, uitvoering, managementrapport en begeleide bespreking. | Eenmalig en alles inbegrepen: inrichting, meting, rapport met gespreksleidraad en besluitpagina. |
| 325-326 | ... de vergelijking met je eerste meting nemen we door in een compacte bespreking. | Tot 3c: "... het rapport van je tweede meting leg je naast het eerste." Na 3c: "... het rapport laat zien wat er sinds je eerste meting is veranderd." |
| 365 | Je wilt duiding en een managementbespreking, geen zelfbeheer | Je wilt een antwoord waar je MT mee aan tafel kan, geen dashboard om te beheren |

De lead van Loep Behoud en Loep Start in dezelfde lijst (niet in de inventaris geciteerd) krijgt dezelfde behandeling als regel 29.

### 4.4 Gedeelde content die rendert (`components/marketing/site-content.ts`)

| Export en regel | Nu | Wordt |
|---|---|---|
| `trustHubAnswerCards` r.272 | Een begeleide dienst: Loep voert de scan uit, levert een managementrapport met prioriteiten en begeleidt HR en management naar één eerste keuze. Geen platform om zelf te beheren. | Een meting en een rapport. Loep zet de meting klaar, jij verstuurt hem, en het rapport zegt waar je begint en leidt je MT-gesprek. Geen licentie, geen platform dat je moet inrichten. |
| `included` r.397 | Begeleide managementbespreking van 60–90 minuten | Gespreksleidraad en besluitpagina in het rapport |
| `pricingCards` r.531, 543, 555 | Begeleide managementbespreking (60–90 min) | Gespreksleidraad en besluitpagina in het rapport |
| `pricingCards` r.551 | ... en een begeleide managementbespreking. | ... en een rapport dat je MT-gesprek leidt. |

### 4.5 `public/llms.txt`

| Regel | Nu | Wordt |
|---|---|---|
| 9-10 | Elke scan is begeleid: Loep doet de meting en de analyse, de klant beheert geen software. | Loep zet de meting klaar en levert het rapport; de klant verstuurt de uitnodiging zelf en leidt zelf het gesprek met het management, met het rapport als leidraad. |
| 27-29 | ... als volledig traject: uitvoering, managementrapport en begeleide managementbespreking. | ... als volledig traject: inrichting, meting en rapport met gespreksleidraad en besluitpagina. Geen bespreking door Loep. |
| 30-32 | ... inclusief een compacte bespreking waarin de vergelijking met de eerste meting wordt doorgenomen. | Tot 3c: "... dezelfde meting opnieuw op de bestaande inrichting." Na 3c de zin over wat er veranderd is. |

### 4.6 `/pilot` (`app/pilot/page.tsx`)

De pilotpagina belooft op zes plekken een bespreking (r.107, 110, 194, 220, 262) en noemt begeleiding (r.92). Twee wegen:

- **a (advies).** De pilot volgt het product: geen bespreking, wel de vraag om feedback op het rapport én op hoe het MT-gesprek ermee liep. "Management beschikbaar voor de bespreking" wordt "Je MT bespreekt het rapport zelf en deelt achteraf hoe dat ging."
- b. De pilot houdt een bespreking als uitzondering, expliciet gelabeld als pilotvoorwaarde.

Weg a is consistent met besluit A en levert precies de feedback op die nu het meest waard is.

## 5. Dode code: weghalen, niet herschrijven

Deze plekken renderen niet meer en bevatten samen ongeveer de helft van de treffers. Herschrijven is weggegooid werk; laten staan vervuilt elke volgende grep. Verify-before-delete, zoals in juni.

- `components/marketing/aanpak-content.tsx` en `app/aanpak/page.tsx`: `/aanpak` verwijst sinds 4 juli door naar `/producten`.
- `components/marketing/tarieven-content.tsx` en `app/tarieven/page.tsx`: `/tarieven` verwijst sinds 17 juni door.
- In `app/producten/[slug]/page.tsx` de detailpagina's van Vertrek, Behoud en Start (r.438-793): verwijzen sinds 17 juni door. **Cultuurbeeld blijft** (r.211-371) en krijgt dezelfde nu-wordt als par. 4.3: "Begeleide directie-read sessie (60–90 min)" is dezelfde belofte in een ander jasje. Besluit voor Lars: geldt besluit A ook voor Cultuurbeeld (€6.500)? Advies: ja, anders bestaat er één product waarvoor je wel aan tafel moet.
- Zes exports in `site-content.ts` zonder gerenderde gebruiker: `customerLifecycleStages`, `faqs`, `homepageComparisonRows`, `homepageProductRoutes`, `outcomeCards`, `trustSignalHighlights`. `approachSteps` heeft één importer; nagaan of dat de dode `/aanpak` is.

## 6. Loep_Docs

Tien documenten noemen de bespreking of de begeleiding: offerte-template, factuur-template, pilotbevestiging, one-pager, sales-pitch, faq, intake-formulier, methodische-verantwoording, harde-getallen, en het reviewdocument van 6 september (dat laatste is historie en blijft zoals het is).

De offerte en de pilotbevestiging zijn contractueel: daar mag na besluit A geen bespreking meer in staan, en de vervolgmeting staat er nu in als "inclusief compacte bespreking (45-60 min)". Die definitie van 9 juli vervalt.

## 7. Tests

Verschillende contract-tests pinnen de huidige copy (o.a. `marketing-flow.test.ts`, `marketing-portfolio-cleanup.test.ts`, `seo-conversion.test`). Die gaan in lockstep mee. Nieuw: een guard die in gerenderde marketingbestanden "begeleide managementbespreking", "bespreking inbegrepen" en "geduid door HR-specialisten" verbiedt, zodat de belofte niet terugsluipt.

Baselines: tsc 133, vitest 59 falend; gate is de faalset per testnaam.

## 8. Besluiten Lars, 20 september 2026

1. **Categorieregel.** Eyebrow: "Meting en rapport · Het gesprek voer je zelf". Paginatitel: **"Loep | Zie waar behoud onder druk staat, voordat mensen gaan"**. De titel uit par. 2 en par. 4.1 ("Medewerkersonderzoek dat zegt waar je begint") is afgewezen: hij beschrijft het product en zet niet aan tot kopen. Bedrijven kopen dit om geld te besparen doordat ze zien waar behoud onder druk staat. De beschrijving draagt het geldanker: "Eén vertrokken medewerker vervangen kost al snel tienduizenden euro's. Loep laat zien waar behoud onder druk staat, waarom volgens je mensen zelf, en waar je begint. Meting en rapport; het gesprek voer je zelf." Grens blijft: geen uitkomstbelofte ("minder verloop", "bespaar op verloop").
2. **De onware methodeclaim is er al uit** (`967ede3a`, 20-9). Bij de ronde vervalt in die alinea niets meer; wel komt de zin over de werkvragen erbij zodra 3b live is.
3. **`/pilot`: weg a.** De pilot volgt het product. Geen bespreking; wel feedback op het rapport en op hoe het MT-gesprek ermee liep.
4. **Besluit A geldt ook voor Loep Cultuurbeeld.** "Begeleide directie-read sessie (60–90 min)" vervalt.
5. **Prijs: staffel op organisatiegrootte, geen prijs per medewerker.**

| Organisatie | Eerste scan | Vervolgmeting |
|---|---|---|
| Tot 150 medewerkers | €3.500 | €950 |
| 150 tot 400 medewerkers | €4.500 | €1.250 |
| 400 tot 1.000 medewerkers | €6.900 | €1.750 |

Alle bedragen excl. btw. Waarom een staffel: de waarde schaalt met de organisatie (meer mensen, meer vertrekkosten op het spel), de kosten van Loep niet. Waarom niet per medewerker: het past alleen bij Loep Behoud (Vertrek meet vertrekkers, Start nieuwe mensen), het ondergraaft "geen licenties per medewerker", en het maakt het bedrag onvoorspelbaar voor de koper. De onderste trede is geen korting omdat de bespreking wegvalt, maar een andere logica: kleinere organisatie, kleiner belang. Zo moet het ook op de site staan. €6.900 en niet €6.500, want dat is de prijs van Cultuurbeeld.

Gevolgen voor de ronde:
- Par. 4.3: waar nu "Elke scan kost €4.500 excl. btw" staat, komt de staffel. De zin "Bij een organisatie van 150 medewerkers komt een scan neer op zo'n €30 per medewerker" blijft waar in de middelste trede (150 × €30 = €4.500) en mag blijven, zonder "inclusief de bespreking".
- "Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons achteraf" blijft en wordt belangrijker.
- `pricingCards`, de JSON-LD-prijzen (`Offer`/`priceSpecification`), `llms.txt`, de veelgestelde vragen en de Loep_Docs (offerte-template, one-pager, sales-pitch, faq, harde-getallen) krijgen dezelfde drie treden. Eén bron in de code (`site-content.ts`), geen losse bedragen in componenten.
- Loep Vertrek bij kleine organisaties: de bestaande verwachtingsregel ("Patroonanalyse vraagt minimaal 10 respondenten ...") blijft staan bij de onderste trede.
- Organisaties boven 1.000 medewerkers: "op aanvraag", geen bedrag.
