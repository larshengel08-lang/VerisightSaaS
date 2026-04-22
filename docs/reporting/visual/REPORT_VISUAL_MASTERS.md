# Report Visual Masters

## Korte samenvatting

Dit document definieert de vier actieve master families voor Verisight-rapporten: `Cover / Intro`, `Executive Read`, `Analytical Insight` en `Action / Route`. De masters zijn visuele families, geen architectuur op zichzelf. Ze helpen de canon leesbaar, premium en productized uitvoeren, zonder section order, methodologie of producttruth zelfstandig te veranderen. ExitScan is de eerste volledig gemapte recipe. Toekomstige rapporten mogen de masters erven waar productlogica dat toelaat.

## Doel

Het doel van deze masters is:

- de actieve blueprint omzetten naar concrete governance-regels
- herhaalbare visuele families vastleggen voor latere implementatie
- voorkomen dat elke pagina een nieuw block-systeem of containerlogica uitvindt
- hiërarchie laten komen uit spacing, typography, alignment en rhythm in plaats van uit stapeling van losse boxen

## Huidige baseline of canon

Deze masterlaag bouwt op:

- `docs/reporting/REPORT_STRUCTURE_CANON.md`
- `docs/reporting/REPORT_METHODOLOGY_CANON.md`
- `docs/reporting/visual/REPORT_VISUAL_POLICY.md`
- `docs/reporting/visual/REPORT_VISUAL_BLUEPRINT_ACTIVE.html`
- `docs/reporting/visual/REPORT_VISUAL_TOKENS.css`
- `docs/reporting/visual/REPORT_VISUAL_PROOFS.css`

## Belangrijkste beslissingen

- Er zijn precies vier actieve visual master families.
- De masters zijn visuele families en geen zelfstandige report architecture.
- Huidige ExitScan-pagina’s worden op deze masters gemapt zonder de recipe te wijzigen.
- Toekomstige productlijnen mogen de masters hergebruiken waar productlogica dat toelaat.
- Het systeem moet editorial en premium aanvoelen, maar tegelijk productized genoeg blijven voor hergebruik binnen Verisight.
- De huidige rapportflow moet minder voelen als “te veel content in aparte blokken” en meer als een geritmeerde, geleide managementlezing.

## Structuur / regels

### Master families

De vier actieve families zijn:

1. `Cover / Intro`
2. `Executive Read`
3. `Analytical Insight`
4. `Action / Route`

### ExitScan mapping

De huidige ExitScan recipe mapt zo op de master families:

- `P1 Cover` -> `Cover / Intro`
- `P2 Respons` -> `Cover / Intro`
- `P3 Bestuurlijke handoff` -> `Executive Read`
- `P4 Frictiescore & verdeling van het vertrekbeeld` -> `Analytical Insight`
- `P5 Signalen in samenhang` -> `Analytical Insight`
- `P6 Drivers & prioriteitenbeeld` -> `Analytical Insight`
- `P7 SDT Basisbehoeften` -> `Analytical Insight`
- `P8 Organisatiefactoren` -> `Analytical Insight`
- `P9 Eerste route & actie` -> `Action / Route`
- `P10 Methodiek / leeswijzer` -> `Executive Read`
- `Appendix B Technische verantwoording` -> `Executive Read` appendix variant, geen vijfde actieve master

### RetentieScan mapping

De actieve RetentieScan recipe erft dezelfde families, maar met een productspecifieke page recipe:

- `P1 Cover` -> `Cover / Intro`
- `P2 Respons` -> `Cover / Intro`
- `P3 Bestuurlijke handoff` -> `Executive Read`
- `P4 Retentiesignaal / groepsduiding` -> `Analytical Insight`
- `P5 Signalen in samenhang` -> `Analytical Insight`
- `P6 Drivers & prioriteitenbeeld` -> `Analytical Insight`
- `P7 Onderliggende laag / explanatory layer` -> `Analytical Insight`
- `P8 Organisatiefactoren / factor layer` -> `Analytical Insight`
- `P9 Eerste route & actie` -> `Action / Route`
- `P10 Methodiek / leeswijzer` -> `Executive Read`
- `Appendix A Segmentanalyse` -> `Executive Read` appendix variant, geen vijfde actieve master
- `Appendix B Technische verantwoording` -> `Executive Read` appendix variant, geen vijfde actieve master

### Future inheritance

Toekomstige report types mogen deze masters erven waar productlogica dat toelaat:

- `Cover / Intro` voor context, response/read-quality en rustige opening
- `Executive Read` voor bestuurlijke samenvatting, leeswijzer en trustlagen
- `Analytical Insight` voor scoreduiding, drivers, synthese en onderliggende methodische managementlagen
- `Action / Route` voor eerste route, eigenaar, first step en reviewmoment

Regel:

- hergebruik de master family waar mogelijk
- dwing geen identieke paginering af
- voeg geen nieuwe master family toe zonder expliciete governancebeslissing

### Overkoepelende compositieregel

De actieve compositieregel is:

- eerst ritme, dan container

Daarmee geldt:

- hierarchy komt eerst uit spacing
- daarna uit typography
- daarna uit alignment
- daarna uit rhythm en repeated page-chrome
- pas daarna uit cards of boxes

Repeated containers zijn dus ondersteunend en niet leidend. Het doel is om “te veel content in aparte blokken” terug te brengen. Dat gebeurt door:

- meerdere korte losse cards samen te trekken in één geordende paginaflow
- how-read en why-it-matters als ritmische strips te gebruiken in plaats van telkens nieuwe boxen
- chart, table of action surface alleen in te zetten waar echte parallelle of datagedreven content daarom vraagt

## Cover / Intro

### Purpose

`Cover / Intro` opent rustig, premium en oriënterend. Deze family zet context, product, periode, read quality en eerste leesdiscipline neer zonder meteen in analyseblokken of technische rechtvaardiging te schieten.

### Dominant zones

- titelstage
- context of metadata row
- één hoofdanker zoals product badge, meta-strip of read-quality kerncijfer

### Secondary zones

- compacte executive support cards
- response explanation
- ondersteunende metadata

### Spacing logic

- veel top- en ademruimte rond het titelanker
- duidelijke scheiding tussen orientatie, metadata en eerste read-quality laag
- response-uitleg in compacte clusters, niet in een reeks losse kleine cards

### Box/card usage rules

- cards alleen voor parallelle executive samenvattingen of een echte data-rail
- geen card-stapeling voor elk metadata-item
- response interpretation liever in ritmische tekstblokken naast of onder de kernvisual dan als herhaalde boxen

### Typography rhythm

- één dominante title moment
- sans-led headlines
- serif/italic alleen als accent of nuance
- metadata en labels klein, rustig en consequent

### Do

- gebruik whitespace om opening en tempo te bepalen
- laat read quality ondersteunend maar expliciet zijn
- houd de cover calm, premium en direct leesbaar

### Don’t

- maak van de cover een KPI-dump
- stapel uitleg in te veel losse cards
- trek methodologische disclaimers naar de opening als dominante laag

## Executive Read

### Purpose

`Executive Read` vertaalt analyse naar bestuurlijke taal. Deze family draagt handoff, methodiek / leeswijzer en compacte trustlagen. Het moet scherp, compact en beslisbaar lezen.

### Dominant zones

- executive headline of handoff
- korte managementvertaling
- expliciete not-to-conclude of trust note waar relevant

### Secondary zones

- ondersteunende exposure- of trustblokken
- compact contextblok
- rustige microcopy voor leesdiscipline

### Spacing logic

- korte, duidelijke vertical rhythm
- sterke page head
- compacte columns of sequenced blocks met veel alignment discipline
- liever één paginaflow met duidelijke tussenruimte dan vier losse blokdozen

### Box/card usage rules

- cards spaarzaam en alleen als parallelle executive points echt gelijkwaardig zijn
- trust notes en non-claims bij voorkeur als strip, inset of calm surface
- geen container voor elk afzonderlijk executive statement

### Typography rhythm

- headline eerst
- explanatory subline direct eronder
- korte labels voor bestuurlijke ankers
- italic alleen voor nuance, niet als hoofdstructuur

### Do

- laat de pagina lezen als boardroom handoff
- gebruik ritme en uitlijning voor orde
- hou trust zichtbaar maar ondergeschikt

### Don’t

- maak van de handoff een dashboard met vier gelijke tegels
- laat leeswijzer voelen als juridische bijlage
- dupliceer eigenaarschap of actie hier als dat later in `Action / Route` expliciet terugkomt

## Analytical Insight

### Purpose

`Analytical Insight` draagt scoreduiding, syntheses, drivers en onderliggende methodische managementlagen. Dit is de zwaarste family, maar moet nog steeds geordend en premium lezen.

### Dominant zones

- chart of analytic anchor
- tabel of synthesis block
- topfactor- of topline-detail

### Secondary zones

- how-read strip
- why-it-matters strip
- supporting quotes, prior signals, explanatory captions

### Spacing logic

- analytische pagina’s werken met vaste header, intro-strip en dan pas contentcanvas
- de grootste zone krijgt de meeste ruimte, de rest haakt ritmisch aan
- losse subcontent liever aan een hoofdcanvas koppelen dan als aparte blokkolom laten zweven

### Box/card usage rules

- surfaces voor charts, tabellen en factor/detail cards zijn toegestaan
- repeated containers voor elk micro-inzicht zijn niet toegestaan
- quotes, SDT-uitleg of factoruitleg hoeven niet elk een eigen card als spacing, alignment of striplogica het beter oplost

### Typography rhythm

- paginatitel
- korte how-read / why-it-matters laag
- analytic anchor
- supportive labels en captions in vaste ritmes

### Do

- laat de analytic anchor dominant blijven
- groepeer context om het hoofdbeeld heen in plaats van eronder als losse stapel
- gebruik alignment en white space om orde en rust te houden

### Don’t

- knip één samenhangend analytisch verhaal op in te veel losstaande containers
- geef elke subzone dezelfde visuele luidheid
- laat charts, quotes en context concurreren om hoofdgewicht

## Action / Route

### Purpose

`Action / Route` zet interpretatie om naar managementroute. Deze family moet concreet, eigenaarschap-gericht en strak gestructureerd zijn.

### Dominant zones

- priority header of route header
- owner / first step / review row
- eerste actie- of hypotheselaag

### Secondary zones

- route table
- action cards
- compacte verificatie- of rationale copy

### Spacing logic

- eerst één duidelijke priority-bar of route-anchor
- daarna een compacte set vervolgblokken
- liever één sterke header + één vervolgstructuur dan meerdere gelijke actie-secties

### Box/card usage rules

- cards zijn hier functioneel geschikt voor parallelle hypotheses of acties
- route-header mag één duidelijke surface zijn
- vermijd extra subcards binnen een actiecard

### Typography rhythm

- priority first
- daarna owner / step / review in strak ritme
- actiekaarten of routetabel met consistente numbering en labels

### Do

- maak duidelijk wat nu eerst gebeurt
- laat route ownership maar op één plek expliciet landen
- gebruik surfaces om beslisroute te structureren, niet om alles te verpakken

### Don’t

- dupliceer route, eigenaar en eerste stap over meerdere pagina’s
- laat actiekaarten op zichzelf staan zonder een duidelijke priority anchor
- maak van route een decoratieve timeline zonder bruikbare managementvolgorde

## Productspecifieke verschillen

### ExitScan

- ExitScan gebruikt alle vier master families expliciet.
- De analytische middenlaag van ExitScan mag rijker zijn omdat de recipe expliciet meer methodische tussenlagen draagt.
- De premium-editorial toon moet ExitScan helpen, niet omzetten in redesign of luxe om de luxe.

### RetentieScan

- RetentieScan mag dezelfde master families erven waar productlogica dat toelaat.
- RetentieScan hoeft niet dezelfde middenlaag-splitsing te hebben als ExitScan.
- Visual inheritance voor RetentieScan betekent: family reuse, niet recipe cloning.

## Guardrails

- Masters mogen de report architecture niet wijzigen.
- Gebruik spacing, typography, alignment en rhythm eerst; containers pas daarna.
- Laat surfaces functioneel zijn, niet default.
- Houd de visuele taal premium en editorial, maar nog steeds productized en herhaalbaar.
- Forceer RetentieScan niet in de ExitScan recipe.
- Gebruik de appendixvariant niet als impliciete vijfde actieve master family.

## Acceptance

Deze masterlaag is bruikbaar als:

- de vier families helder en concreet gedefinieerd zijn
- ExitScan pagina’s herkenbaar gemapt zijn zonder recipewijziging
- future inheritance mogelijk is zonder architectuurdwang
- de regels expliciet sturen weg van “te veel content in aparte blokken”
- hierarchy aantoonbaar uit spacing, typography, alignment en rhythm komt in plaats van uit repeated containers

## Assumptions / defaults

- `REPORT_VISUAL_BLUEPRINT_ACTIVE.html` blijft de primaire visuele referentie voor compositie zolang geen expliciete opvolger is goedgekeurd.
- Een appendixvariant mag op een bestaande family leunen zolang daar geen nieuwe actieve master family voor nodig is.
- Toekomstige report types erven eerst deze families en vragen pas daarna om een uitzondering.
