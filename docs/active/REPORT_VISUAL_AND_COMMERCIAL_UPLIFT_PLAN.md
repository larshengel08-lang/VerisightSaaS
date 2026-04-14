# REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md

## 1. Summary

Dit plan ververst het reporting-traject naar de volgende echte repo-gap: maak de **werkelijke Verisight-rapporten** visueel sterker, commercieler, bestuurlijker leesbaar en duidelijker action-oriented, zonder methodisch harder te claimen dan de implementatie draagt.

De hoofdrichting is:

- de echte PDF-output moet dichter bij de kwaliteit van dashboard en marketing-preview komen
- ExitScan moet voelen als het primaire boardroom-product voor vertrekduiding
- RetentieScan moet complementair blijven als vroegsignaal voor behoud op groepsniveau
- visuele hierarchie, commerciele overtuigingskracht en methodische betrouwbaarheid moeten elkaar versterken
- rapport, dashboard, preview en productcopy moeten hetzelfde managementverhaal vertellen

Belangrijkste repo-observaties:

- de inhoudelijke rapportlaag was al aangescherpt, maar de visuele en commerciele uplift liep nog achter op dashboard en preview
- de huidige PDF-engine in `backend/report.py` is functioneel sterk, maar was nog te tabel- en documentgedreven
- de marketing-preview verkocht een sterkere report experience dan de echte output leverde
- ExitScan en RetentieScan zijn inhoudelijk beter gescheiden, maar visueel nog te veel dezelfde report-mal
- de methodologische nuance is beter geworden, maar stond in de rapportflow nog te vroeg of te zwaar in beeld ten opzichte van de bestuurlijke hoofdboodschap

Status 2026-04-14:

- Uitgevoerd in deze ronde:
  - echte rapportoutput voorzien van executive shell, highlight cards, trust-notes, productspecifieke themakleuren en scherpere actionability
  - managementsamenvatting en signaalpagina voor ExitScan en RetentieScan productspecifieker gemaakt
  - previewlaag gekoppeld aan een typed preview/report contract zodat preview en rapport dezelfde managementtaal gebruiken
  - gerichte parity- en smoke-tests toegevoegd voor report contracts, preview-copy en PDF-generatie
  - buyer-facing copy rond preview/output aangescherpt waar dat direct paritywinst opleverde
  - handmatige acceptance-checklist toegevoegd in `docs/reference/REPORT_VISUAL_AND_COMMERCIAL_ACCEPTANCE_CHECKLIST.md`
- Validatie in deze ronde:
  - frontend tests groen
  - frontend lint groen
  - frontend build groen
  - backend parity- en PDF-smoke-checks groen via lokale SQLite testengine
- Bewust niet volledig uitgevoerd in deze ronde:
  - geen volledige herschrijving van alle referentiedocs in `docs/reference`
  - geen migratie weg van ReportLab
  - geen complete website-redesign buiten de preview- en product-outputlaag

---

## 2. Milestones

### Milestone 0 - Freeze Current Report Baseline And Gap Map
Dependency: none

- [x] Uitgevoerd op 2026-04-14: baseline, report-vs-preview gap en scopegrenzen repo-gebaseerd vastgelegd; dit planbestand is de source of truth voor de uitvoering geworden.

#### Tasks
- [x] Leg de huidige echte rapportbeleving vast op basis van de repo:
  - PDF-cover
  - management summary
  - methodologiepagina
  - middenpagina's
  - hypothesen en vervolgstappen
- [x] Vergelijk de echte PDF-output expliciet met:
  - dashboard decision layer
  - productpagina's
  - `PreviewSlider` / marketing-preview
- [x] Documenteer per product waar de grootste drift zit in:
  - visuele hierarchie
  - commerciele kracht
  - boardroom-readiness
  - methodische framing
- [x] Bevestig wat in scope blijft:
  - report engine
  - productcontent modules
  - parity met dashboard/preview
  en wat niet:
  - nieuwe scoringmodellen
  - survey redesign
  - volledige website-redesign

#### Definition of done
- [x] Er is een controleerbaar baselinebeeld van de huidige rapportbeleving.
- [x] De grootste kloof tussen dashboard/preview en echte PDF is expliciet gemaakt.
- [x] De uplift is scherp afgebakend als report-first traject.

#### Validation
- [x] Elke hoofdobservatie is herleidbaar naar actuele repo-bestanden.
- [x] ExitScan-primair en RetentieScan-complementair zijn in de baseline zichtbaar meegenomen.

### Milestone 1 - Report Visual System And Boardroom Shell
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-14: boardroom-first cover en managementshell toegevoegd met productspecifieke themakleuren, executive hero, highlight cards en trust-notes in de echte PDF-engine.

#### Tasks
- [x] Ontwerp een gedeeld rapport-visual system voor de echte PDF-output:
  - cover hierarchy
  - executive cards
  - highlight callouts
  - emphasis kleuren
  - tabel- en kaartprioriteit
  - spacing- en ritmeregels
- [x] Leg vast welke elementen shared blijven en welke productspecifiek worden.
- [x] Maak van pagina 1 en 2 een boardroom-first shell:
  - kernboodschap eerst
  - bestuurlijke vraag daarna
  - methodische nuance ondersteunend
- [x] Reduceer table-first dominantie op cover en managementsamenvatting zonder informatieverlies.
- [x] Behoud de bestaande brandrichting, maar maak ExitScan en RetentieScan visueel duidelijker onderscheidbaar binnen hetzelfde systeem.

#### Definition of done
- [x] Er ligt een expliciet visual system voor de echte rapportoutput.
- [x] De eerste twee pagina's zijn ontworpen als managementingang, niet als analysetabel.
- [x] Productonderscheid is zichtbaar zonder de platformidentiteit te breken.

#### Validation
- [x] Een directielid kan de hoofdboodschap binnen 60 seconden pakken.
- [x] De uplift leest als premium en bestuurlijk bruikbaar, niet als decoratieve restyling.

### Milestone 2 - Management Summary And Executive Read Rebuild
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: managementsamenvattingen voor ExitScan en RetentieScan herbouwd rond executive framing, bestuurlijke leesvolgorde, trust framing en eerste managementactie.

#### Tasks
- [x] Herbouw de managementsamenvatting voor beide producten rond:
  - wat zie je nu
  - waarom is dat bestuurlijk relevant
  - wat is de eerste managementvraag
  - wat is de eerste logische stap
- [x] Maak ExitScan-pagina 1-2 expliciet vertrekgericht:
  - vertrekbeeld
  - topfactoren
  - werksignaal
  - eerdere signalering
- [x] Maak RetentieScan-pagina 1-2 expliciet behoudsgericht:
  - groepsbeeld
  - signaalprofiel
  - topfactoren
  - stay-intent / vertrekintentie / bevlogenheid
- [x] Verplaats methodologische nuance naar de juiste diepte:
  - kort en geruststellend vooraan
  - vollediger later in het rapport
- [x] Breng dashboard decision panels en report management summary op dezelfde taal en volgorde.

#### Definition of done
- [x] De executive read is productspecifiek, duidelijk en boardroom-ready.
- [x] Methodische nuance beschermt vertrouwen zonder de hoofdboodschap te verstoren.
- [x] Rapport en dashboard openen met dezelfde managementlogica.

#### Validation
- [x] ExitScan en RetentieScan voelen op pagina 1-2 direct anders aan.
- [x] De managementsamenvatting introduceert geen marketing-overclaim of methodische zwakte.

### Milestone 3 - Mid-Report Structure, Visual Hierarchy And Product Identity
Dependency: Milestone 2

- [x] Uitgevoerd op 2026-04-14: signaalpagina's en hypothesesectie herschikt met highlight cards, productspecifieke copy en minder monotone tabeldominantie.

#### Tasks
- [x] Herstructureer de middenpagina's zodat ze minder "survey-rapport" en meer "managementinstrument" lezen.
- [x] ExitScan-middenlaag moet volgen:
  - vertrekredenen en meespelende factoren
  - werksignalen
  - topfactoren
  - bewijs en duiding
- [x] RetentieScan-middenlaag moet volgen:
  - behoudssignalen in samenhang
  - topfactoren
  - trend en segmenten als gecontroleerde verdieping
  - open signalen als richting voor verificatie
- [x] Vervang waar mogelijk monotone tabellogica door gemixte presentatie:
  - compact overzicht
  - interpretatiecallout
  - visuele nadruk op wat telt
- [x] Maak segment deep dive, trends en open tekst duidelijk secundair aan de hoofdlijn.

#### Definition of done
- [x] De middenpagina's ondersteunen de executive read in plaats van die te verzwakken.
- [x] Elke productspecifieke rapportlijn heeft een duidelijke eigen identiteit.
- [x] Detaillagen verdringen de hoofdlijn niet meer.

#### Validation
- [x] Een lezer kan zonder uitleg zien wat hoofdboodschap is en wat verdieping is.
- [x] Segmenten, trends en open signalen ogen niet als causale verklaring.

### Milestone 4 - Actionability, Hypotheses And Closeout
Dependency: Milestone 3

- [x] Uitgevoerd op 2026-04-14: hypotheses scherper gemaakt met eerste eigenaar, eerste logische actie en productspecifieke managementrouting.

#### Tasks
- [x] Maak werkhypothesen scherper, korter en bestuurlijker bruikbaar.
- [x] Koppel elke topfactor aan:
  - een verificatievraag
  - een eigenaar
  - een 30-90 dagenactie
- [x] Maak ExitScan-closeout expliciet vertrekgericht:
  - managementgesprek
  - toetsing
  - eigenaarschap
  - opvolging in volgende exitbatch
- [x] Maak RetentieScan-closeout expliciet behoudsgericht:
  - validatie
  - prioritering
  - eerste interventie
  - vervolgmeting
- [x] Houd de methodische rem zichtbaar:
  - signalen en hypothesen
  - geen hard bewijs
  - geen schijnzekerheid

#### Definition of done
- [x] Het laatste deel van het rapport dwingt richting managementactie.
- [x] Hypothesen zijn toetsbaar en niet vaag-theoretisch.
- [x] Vervolgstappen laten geen interpretatiewerk meer liggen bij de uitvoerder.

#### Validation
- [x] HR en MT kunnen na lezing benoemen wat eerst gebeurt, door wie en waarom.
- [x] Het rapport sluit af als managementroute, niet als statisch analyse-document.

### Milestone 5 - Preview, Marketing And Trust Parity
Dependency: Milestone 4

- [x] Grotendeels uitgevoerd op 2026-04-14: preview-copy en product-outputtaal gelijkgetrokken via een typed contract; buyer-facing preview- en outputcopy aangescherpt. Referentiedocs buiten de directe reportlaag zijn bewust niet volledig herschreven in deze ronde.

#### Tasks
- [x] Trek de echte rapportstructuur gelijk met wat marketing-preview en productpagina's impliceren.
- [x] Verwijder preview- of productcopy die een rijkere report experience suggereert dan de echte output levert.
- [x] Laat de preview voortaan dezelfde productspecifieke reporttaal gebruiken als de echte rapporten.
- [x] Maak trust-signalen zichtbaar maar compact:
  - methodiek
  - privacy
  - interpretatiegrenzen
  - v1-status waar relevant
- [ ] Breng de referentiedocs en customer-facing report framing terug op dezelfde actuele v1-lijn.

#### Definition of done
- [x] Er is geen noemenswaardige drift meer tussen echte rapporten en wat de site of preview verkoopt.
- [x] Vertrouwen wordt zichtbaar versterkt zonder dat het rapport bureaucratisch gaat lezen.
- [x] De rapportexperience is commercieel scherper en eerlijker.

#### Validation
- [x] Een koper wordt niet verrast door verschil tussen preview en echte output.
- [x] Methodische betrouwbaarheid voelt hoger aan, niet zwaarder of defensiever.

### Milestone 6 - QA, Contracts And Acceptance
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-14: report contracts uitgebreid, paritychecks toegevoegd en gerichte PDF smoke-tests voor exit en retention ingebouwd.

#### Tasks
- [x] Breid de report-content contracts uit voor richer executive content:
  - executive headline / hero summary
  - productspecifieke highlight cards
  - trust note / methodology short note
  - section emphasis metadata waar nodig
- [x] Voeg parity-checks toe tussen:
  - backend report content
  - dashboard view models
  - preview content
  - marketingkritieke producttaal
- [x] Voeg acceptatiescenario's toe voor:
  - ExitScan met voldoende patroondata
  - ExitScan met indicatief beeld
  - RetentieScan met trend
  - RetentieScan met segment deep dive
  - minimale respons / beperkte detailweergave
- [x] Voeg handmatige reviewcheck toe voor:
  - boardroom-readiness
  - commerciele overtuigingskracht
  - methodische eerlijkheid
  - productonderscheid

#### Definition of done
- [x] De uplift is testbaar, reviewbaar en regressiebestendig.
- [x] Report, dashboard en preview kunnen niet ongemerkt uit elkaar gaan lopen.
- [x] Acceptatie is inhoudelijk, visueel, commercieel en methodisch tegelijk.

#### Validation
- [x] Beide producten slagen op dezelfde parity- en acceptancebasis.
- [x] Nieuwe wijzigingen in reportcopy of reportflow kunnen niet ongemerkt premium-, trust- of parityverlies veroorzaken.

---

## 3. Execution Breakdown By Subsystem

### Report Engine
- [x] Houd `backend/report.py` als kern, maar voeg shared report-primitives toe voor:
  - executive hero
  - highlight cards
  - emphasis blocks
  - compact trust notes
  - productspecifieke visual emphasis
- [x] Herorden pagina's en secties rond managementread, daarna verdieping.
- [x] Beperk table-first presentaties tot plekken waar tabellen echt de beste vorm zijn.

### Product Report Content Contracts
- [x] Breid de productspecifieke payloads uit in de report content modules voor rijkere executive input.
- [x] Laat ExitScan en RetentieScan elk eigen:
  - executive framing
  - signaalduiding
  - trust note
  - hypothesis framing
  - action framing
  krijgen.
- [x] Belangrijke interfacewijziging:
  - de backend report-content contracten leveren nu expliciet: `executive_title`, `executive_intro`, `highlight_cards`, `trust_note_title`, `trust_note` en productspecifieke signal framing.

### Dashboard And Preview Parity
- [x] Laat de report executive layer aansluiten op de bestaande dashboard hero en decision panels.
- [x] Verlaag drift tussen `PreviewSlider` en echte report-output.
- [x] Belangrijke interfacewijziging:
  - er is nu een gedeeld typed preview/report contract via `frontend/lib/report-preview-copy.ts` zodat previewlabels en rapportlabels niet meer los evolueren.

### Testing And Acceptance
- [x] Voeg backend-tests toe voor section presence en payload contracts.
- [x] Voeg parity-tests toe voor terminologie en ordering tussen report, dashboard en preview.
- [x] Voeg PDF smoke-scenarios toe voor beide producten en belangrijkste datastaten.
- [x] Voeg een vaste handmatige acceptance-checklist toe voor HR-read, MT-read en directie-read in `docs/reference/REPORT_VISUAL_AND_COMMERCIAL_ACCEPTANCE_CHECKLIST.md`.

---

## 4. Current Product Risks

- [x] Interpretatierisico: sterkere visuals kunnen onbedoeld meer zekerheid suggereren dan de methodiek toelaat.
- [x] Methodologisch risico: oudere referentiedocs en v1-beperkingen kunnen nog botsen met de huidige productframing.
- [x] Risico op generieke rapportage: shared engine kan productspecifieke identiteit blijven afvlakken.
- [x] Risico op te zwakke managementsamenvatting: de huidige echte PDF bleef te documentair en te weinig besluitgericht.
- [x] Risico dat rapport en dashboard verschillende verhalen vertellen: dashboard voelde al moderner en scherper dan het echte rapport.
- [x] Commercieel risico: de marketing-preview verkocht een premium-ervaring die de echte PDF nog niet volledig waarmaakte.
- [x] Trust-risico: te veel methodologie vooraan remde commerciele impact; te weinig nuance schaadde geloofwaardigheid.

---

## 5. Open Questions

- [x] Geen blocking open questions voor uitvoering; de defaults hieronder maakten het traject beslisbaar.
- [ ] Latere productvraag: willen we na deze uplift ook een HTML/on-screen reportvariant naast PDF?
- [ ] Latere productvraag: willen we later board-deck exports of one-page executive exports toevoegen?
- [ ] Latere productvraag: willen we voorbeeldrapporten als sales/showcase-asset apart productiseren?

---

## 6. Follow-up Ideas

- [ ] Bouw later een echte sample-output library op basis van de nieuwe report contracts.
- [ ] Voeg later een boardroom one-pager toe als afgeleide van de executive reportlaag.
- [ ] Overweeg later een interactieve report-preview die direct uit echte payloads rendert.
- [ ] Gebruik latere klantcases om commerciele proof blocks in rapport of sample-output te versterken.

---

## 7. Out of Scope For Now

- [x] Nieuwe scoringlogica, nieuwe survey-items of methodologische herweging.
- [x] Volledige rewrite van de report engine weg van ReportLab.
- [x] Volledige website-redesign buiten noodzakelijke preview/product-parity.
- [x] Nieuwe producten of verbreding van portfolio-architectuur.
- [x] Nieuwe benchmark- of predictive claims.
- [x] Grote dashboard-herbouw buiten report-parity of kleine alignment-aanpassingen.

---

## 8. Defaults Chosen

- [x] Dit plan gebruikt `REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md` als source of truth voor deze uplift-tranche.
- [x] ExitScan blijft het primaire boardroom-product; RetentieScan blijft complementair.
- [x] De echte reportoutput is leidend; preview en marketing moeten daarop aansluiten, niet andersom.
- [x] De backend report engine blijft bestaan; we verbeteren structuur, contracts en visual hierarchy binnen die architectuur.
- [x] Methodologische nuance blijft zichtbaar, maar compacter op de executive pagina's en vollediger later in het rapport.
- [x] ExitScan krijgt de sterkste nadruk op vertrekbeeld, werksignaal en bestuurlijke beinvloedbaarheid.
- [x] RetentieScan krijgt de sterkste nadruk op vroegsignaal, verificatie en 30-90 dagenopvolging.
- [x] Segment deep dive en trends blijven ondersteunend, niet leidend.
- [x] De uitvoeringsvolgorde is:
- [x] 1. baseline en gap map
- [x] 2. visual system en executive shell
- [x] 3. management summary rebuild
- [x] 4. middenpagina's en productidentiteit
- [x] 5. actionability en closeout
- [x] 6. preview/marketing/trust parity
- [x] 7. QA, contracts en acceptance
