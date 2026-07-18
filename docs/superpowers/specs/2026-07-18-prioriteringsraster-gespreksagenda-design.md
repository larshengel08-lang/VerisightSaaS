# Prioriteringsraster gespreksagenda (Loep Vertrek + Loep Behoud)

**Datum:** 2026-07-18
**Status:** Ontwerp goedgekeurd in brainstorm; wacht op spec-review Lars
**Scope:** PDF-rapportlaag, alleen `backend/` Python-rapportcode. Geen DB-migratie, geen survey-wijziging, geen frontend.

## 1. Doel en context

De gespreksagenda-pagina (slotpositie, voor de appendix) toont nu feitelijk de 2 laagst
scorende thema's. Het afwegingswerk (waarom deze twee, wat woog mee) doet Lars live in de
begeleide bespreking. Deze pagina wordt herbouwd tot een prioriteringsraster: alle 6
organisatiefactoren zichtbaar gerangschikt op navolgbare signalen, zodat de pagina het
denkwerk toont in plaats van alleen de uitkomst. De agenda-elementen (gespreksopener,
invulregels, trustline) integreren in de nieuwe pagina; de losse kaarten "Primair thema" en
"Tweede aandachtspunt" vervallen. Bouwsteen richting het latere assisted-SaaS-model.

Kernkeuzes uit de brainstorm:

- Agenda integreert in het raster (geen apart blok ervoor of ernaast).
- Signalen zichtbaar, geen samengesteld prioriteitscijfer (schijnprecisie-principe).
- Rangorde: score als basis + spreiding en verdiepingssignaal, uitsluitend als
  doorslag bij vrijwel gelijke scores. Gespreksrichting-data alleen als toelichting in de
  opener, niet in de rangorde. Geen vaste relevantie-gewichten (`_RETENTION_RELEVANCE`
  blijft ongebruikt).
- Gesorteerd zonder rangnummers 1-6; gelijkspel eerlijk gelabeld.
- Per signaal degraderen bij kleine n (geen alles-of-niets-drempel voor de pagina).
- Een gedeelde pagina voor MT-lezer en begeleider; geen aparte facilitator-laag.
- Scope v1: Loep Vertrek + Loep Behoud. Loep Start volgt bij verdiepingsset v1.1 (par. 10).

## 2. Paginastructuur

Van boven naar beneden, vervangt de huidige `_eerste_managementspoor`-sectie voor exit en
retention op dezelfde slotpositie (hoofdstuknummer via `_ChapterCounter`, ongewijzigd):

1. **Kop**: kicker "Prioritering & gespreksagenda", titel **"Waar begint het gesprek?"**
   (kopstijl zoals de overige paginatitels).
2. **Intro** (vaste copy, in `SECTION_INTROS`-stijl):
   > "Dit overzicht weegt alle zes factoren tegen elkaar af op drie zichtbare signalen: de
   > gemiddelde score, de spreiding tussen respondenten en wat respondenten in de verdieping
   > als toelichting kozen. De volgorde is daarmee navolgbaar: je ziet per factor wat
   > meewoog. De bespreking beslist; dit raster structureert."
3. **Signaaltabel**: 6 rijen (alle organisatiefactoren), gesorteerd volgens par. 3.
   Kolommen:
   - **Factor**: canoniek label via bestaande `_fl(fk, scan_type)`. Een nieuwe of verkorte
     labelset is verboden ("Compensatie" e.d. mogen nergens verschijnen).
   - **Score**: gemiddelde via bestaande `_score_str` (punt als decimaalteken, consistent
     met de rest van het rapport), bandkleur via `_factor_color` (gedempte RAG-set).
   - **Spreiding**: `distribution_svg` op segmentblok-formaat (200x22) + telregel
     "{x} van {n} onder de 5". Onder n=10: vaste degraded-tekst "spreiding vanaf 10
     responses" (strip en telregel beide weg; een gedeelde staffel, par. 5).
   - **Verdieping**: een van de vijf vaste celstaten uit par. 6.
   - **Agenda**: alleen gevuld waar er iets te zeggen valt: **"Startpunt"** (rij 1),
     **"Tweede punt"** (rij 2), en het gelijkspel-label **"vrijwel gelijk aan
     {factorlabel}"** (factornaam voluit; verwijzen naar rangnummers zoals "nr. 2" is
     verboden, er bestaat geen nummering).
   - Top-2 rijen gerenderd als navy rijen met amber accenten (het navy anker van de
     huidige agenda verhuist de tabel in).
4. **Legenda** (vaste copy, direct onder de tabel):
   > "Het blokje in de spreidingsbalk markeert het groepsgemiddelde; de telling eronder
   > toont hoeveel respondenten deze factor onder de 5 scoren."
5. **Uitlegregel** (vaste copy, amber left-border blok; het hart van de pagina, gepind met
   een contract-test zodat inkorten een rode test geeft). Retention-variant:
   > "Hoe deze volgorde tot stand komt: gesorteerd op score. Bij vrijwel gelijke scores
   > (verschil kleiner dan 0,3) geven grote spreiding of een gedeelde toelichting uit de
   > verdieping de doorslag. Spreiding tonen we vanaf 10 responses; verdiepingsduiding
   > vanaf 8 beantwoorders per factor."

   Exit-variant: identiek, maar de eerste zin luidt "gesorteerd op score, waarbij ook
   meeweegt hoe vaak een factor als vertrekreden is genoemd."
6. **Navy slotblok**: gespreksopener (bestaande logica ongewijzigd: direction-scenario,
   anders verrijkte vraag, anders fallback-menuvraag `_mgmt_q`) + de drie invulregels
   Prioriteit / Eigenaar / Vervolgmoment met de bestaande hints (45-90 dagen cadans).
7. **Trustline** (bestaande copy ongewijzigd): "Nog niet besluiten of een verdieping of
   kortere vervolgmeting nodig is: dat volgt uit het gesprek."

## 3. Rangschikkingsregel

Deterministisch, geen samengesteld cijfer op de pagina. Pure functie (par. 7).

1. **Basisscore** per factor:
   - Retention: de factorscore.
   - Exit: factorscore minus `0.4 x` het aantal keer dat de factor als vertrekreden is
     genoemd (exact de bestaande `_select_priority_factors`-formule, ongewijzigd).
2. **Twee binaire vlaggen**, beide uit bestaande metingen:
   - **Spreidingsvlag**: aandeel respondenten met factorscore < 5.0 is >=
     `SPREAD_FLAG_MIN_SHARE` (0.30) EN n >= `MIN_DISTRIBUTION_N` (10). Onder n=10 bestaat
     de vlag niet. De 5.0-grens is de bestaande "kwetsbaar punt"-bandgrens, geen nieuw
     getal.
   - **Verdiepingsvlag**: `agenda_enrichment` vuurt voor deze factor (bestaande staffel:
     n>=8 beantwoorders, top >= 50%, top >= 4, voorsprong >= 2, top niet `*_other`).
     Geen eigen drempel.
3. **Vlaggen werken uitsluitend binnen de gelijkspel-marge.** Sort-key (oplopend):
   `(basisscore - PRIORITY_TIE_MARGIN als >= 1 vlag anders basisscore, basisscore,
   -aantal_vlaggen, canoniek factorlabel alfabetisch)`.
   Effect: een gevlagde factor passeert een niet-gevlagde alleen bij scoreverschil
   **strikt kleiner dan 0,3**. Vlaggen stapelen niet (twee vlaggen geven dezelfde bump als
   een); het aantal vlaggen is alleen tiebreaker als beide factoren gevlagd en vrijwel
   gelijk zijn. Laatste tiebreaker: alfabetisch op canoniek factorlabel, zodat twee runs
   van hetzelfde rapport altijd dezelfde volgorde geven.
4. **Vergelijkingsoperator vastgelegd**: vrijwel gelijk betekent
   `abs(delta) < PRIORITY_TIE_MARGIN`, **strikt**. Voorbeeld als verplichte testcase:
   5.1 vs 5.4 is exact 0,3 verschil en is dus GEEN gelijkspel en wordt NIET geflipt.
   Een `<=`-implementatie wijkt aantoonbaar van de spec af.
5. **Gelijkspel-label** (weergave, los van de sortering): twee aangrenzende factoren met
   `abs(delta) < 0.3` EN identieke vlaggenset krijgen op de laagst geplaatste rij het label
   "vrijwel gelijk aan {factorlabel erboven}". Klein scoreverschil en geen doorslaggevend
   signaalverschil: dan kiest de bespreking, en dat zegt de pagina.
6. **SDT-filter**: `rank_factors` filtert als eerste stap op `ORG_FACTOR_KEYS`.
   Motivering: `factor_averages` bevat ook SDT-dimensies (autonomy/competence/relatedness);
   zonder filter kon "Verdieping - Autonomie" als lege pagina renderen (bugfix 2026-07-13
   in `_select_priority_factors`). Die fix verhuist mee en krijgt een guard-test.

### Zichtbaarheids-invariant (kernbelofte)

De tiebreak gebruikt uitsluitend signalen die op de pagina zichtbaar zijn, met dezelfde
staffels als de weergave. Concreet: spreidingsvlag en spreidingsweergave delen de
n>=10-staffel; de verdiepingsvlag bestaat alleen als de verrijkingsstaffel haalt, en dan
toont de verdiepingskolom de telling. Vlag- en weergavedrempels mogen nooit onafhankelijk
van elkaar wijzigen. Elke rij waarvan de positie door een tiebreaker is bepaald, draagt een
zichtbaar signaal; elk onbeslist gelijkspel draagt het label. Dit is een geteste invariant
(par. 9, test 2), geen implementatiedetail.

## 4. Doorwerking in de rest van het rapport

Voor exit en retention vervangt de `rank_factors`-volgorde elke bestaande
`_select_priority_factors`-aanroep:

- p.02 "Eerste managementvraag" (`_short_mgmt_q`) gebruikt de startpunt-factor van het
  raster.
- De selectie welke factoren een verdiepingspagina krijgen (top-3) volgt dezelfde
  rangorde.
- Het raster zelf.

Een waarheid, geen twee rangordes in een rapport. Onboarding (Loep Start) raakt niets en
behoudt `_select_priority_factors` + `_eerste_managementspoor` (par. 10).

## 5. Constanten en staffels

| Constante | Waarde | Status |
|---|---|---|
| `PRIORITY_TIE_MARGIN` | 0.3, vergelijking strikt `<` | **nieuw** (in `report_priority.py`) |
| `SPREAD_FLAG_MIN_SHARE` | 0.30, vergelijking `>=` | **nieuw** (enige echt nieuwe drempel in dit ontwerp) |
| Spreidings-bandgrens | score < 5.0 | bestaand (kwetsbaar punt-grens `_factor_label`) |
| `MIN_DISTRIBUTION_N` | 10 | bestaand (`report_distribution.py`) |
| Spreek-staffel verdieping | n >= 5 beantwoorders: pas vanaf 5 beantwoorders mag de cel over de antwoorden spreken (staat 1/2); daaronder staat 3 | bestaand (deepening-rapportstaffel) |
| Verrijkingsstaffel | n>=8, top>=50%, top>=4, marge>=2, niet `*_other` | bestaand (`agenda_enrichment`) |
| Exit-vertrekredengewicht | 0.4 per vermelding | bestaand (`_select_priority_factors`) |

Er komen geen andere nieuwe drempels. Kolom telt (telling-staffel), opener duidt
(verrijkingsstaffel): twee bestaande staffels voor twee verschillende handelingen.

## 6. Verdiepingskolom: vijf vaste celstaten

Vaste copy, geen vrije formulering per renderer. Volgorde van evaluatie per factor:

| # | Conditie (op `deepening_agg[fk]`) | Celtekst |
|---|---|---|
| 1 | `answered >= 5` en verrijkingsstaffel haalt | `{x} van {n} kozen: "{optietekst}"` |
| 2 | `answered >= 5`, verrijkingsstaffel haalt niet | `geen toelichting gekozen door een duidelijke meerderheid` |
| 3 | `answered < 5` en `offered > 0` | `te weinig beantwoorders voor duiding` |
| 4 | `offered == 0` en `triggered > 0` | `niet aangeboden: maximum aantal verdiepingen per respondent bereikt` |
| 5 | `triggered == 0` | `geen verdieping aangeboden: score boven de drempel` |

Klantentaal, geen systeemvocabulaire ("getriggerd", "cap", "staffel" zijn verboden in
celteksten). De verdiepingsvlag (par. 3) kan alleen bestaan in staat 1.

**Campagne-gate**: als `_deepening_campaign_active` false is (historische rapporten van
voor de verdiepingsfeature), vervalt de verdiepingskolom in zijn geheel en komt er een
vaste regel onder de tabel:
> "In deze meting waren geen verdiepingsvragen actief; de volgorde volgt score en
> spreiding."
De intro (par. 2.2) heeft in die variant een eigen, eveneens gepinde copy: "drie zichtbare
signalen: de gemiddelde score, de spreiding tussen respondenten en wat respondenten in de
verdieping als toelichting kozen" wordt "twee zichtbare signalen: de gemiddelde score en de
spreiding tussen respondenten". Geen lege kolom vol streepjes; wel gedisclosed (fail-loud).

## 7. Architectuur

- **Nieuw, pure module `backend/report_priority.py`**: de twee nieuwe constanten +
  `rank_factors(scan_type, factor_avgs, factor_resp_scores, deepening_agg,
  exit_reason_counts) -> list[dict]`. Per factor: key, canoniek label, score,
  spreidingsdata (n, aantal onder 5.0, vlag), verdiepingsstaat (1-5) + topkeuze/telling,
  agenda-rol (startpunt / tweede / geen), gelijkspel-label-doel (factor-key of None).
  Geen I/O, geen rendering, los unit-testbaar (patroon `_department_factor_rows`).
- **Renderer**: nieuwe gedeelde helper `_prioriteringsraster(...)` in `report_html.py`
  (tabel + legenda + uitlegregel + navy slotblok). Exit- en retention-renderers roepen die
  aan op de huidige agenda-plek. De opener-logica verhuist ongewijzigd mee.
- **Data**: alles bestaat al in `build_report_data` (`factor_avgs`, `factor_resp_scores`,
  `deepening_agg` incl. campagne-gate, `exit_code_counts`). Geen nieuwe dataplumbing.
- **CSS**: nieuwe classes in `report_css.py` volgens de WeasyPrint-beperkingen: geen
  `var()`, geen `gap`, geen `inset`; directe hex-interpolatie vanuit Python (conform fix
  2026-07-05).
- **`_eerste_managementspoor` blijft bestaan, alleen voor Loep Start** en is gemarkeerd
  als tijdelijk (par. 10).

## 8. Copy- en eerlijkheidsregels

- Canonieke factorlabels via `_fl`; guard-test dat "Compensatie" nergens voorkomt.
- Scores via `_score_str` (punt als decimaalteken), nergens eigen formatting.
- **Geen em-dashes** in alle nieuwe copy (vaste rapportbrede eis; expliciet zodat de
  implementer niet hoeft te raden).
- De uitlegregel (par. 2.5), legenda (par. 2.4), intro (par. 2.2), celstaten (par. 6) en
  het gelijkspel-label zijn letterlijke, gepinde copy met contract-tests.
- Geen rangnummers, nergens: niet in de tabel, niet in labels, niet in verwijzingen.
- Geen samengesteld prioriteitscijfer, ook niet intern zichtbaar gemaakt (de sort-key is
  implementatie, wordt nooit gerenderd).

## 9. Teststrategie

1. **Unit-tests `rank_factors`**: basisvolgorde; exact-0,3-edge (5.1 vs 5.4: geen flip,
   geen label); vlag flipt alleen binnen de marge (5.4 met vlag passeert 5.2, niet 5.0);
   vlaggen stapelen niet; alfabetische slotvolgorde deterministisch; SDT-guard (geen
   SDT-dimensie in het raster, ook niet als autonomy de laagste score heeft);
   exit-vertrekredengewicht; spreidingsvlag-gates (n>=10 en >=30%); verdiepingsvlag
   exact gelijk aan `agenda_enrichment`-uitkomst.
2. **Navolgbaarheids-invariant** (eigen test, kernbelofte): property-achtig over meerdere
   geconstrueerde datasets: als een factor hoger staat dan zijn pure score-volgorde
   rechtvaardigt, draagt die rij een zichtbaar signaal (vlag in spreidings- of
   verdiepingskolom); als een gelijkspel onbeslist bleef, is het label aanwezig. Plus een
   rendertest dat het zichtbare element echt in de HTML-rij staat.
3. **Renderer-contracttests**: uitlegregel-copy letterlijk gepind (beide varianten);
   vijf celstaten letterlijk gepind; legenda aanwezig; canonieke labels; `_score_str`;
   geen em-dashes in nieuwe copy; campagne-gate-variant (kolom weg + disclosure-regel);
   spreiding degraded onder n=10.
4. **Consistentietest rapportbreed**: p.02-managementvraagfactor == raster-startpunt;
   verdiepingspagina-selectie volgt dezelfde rangorde.
5. **Lockstep-updates bestaande tests** (verwacht werk, geen regressie; o.a.
   `test_mgmt_q_enriched_when_gates_pass`,
   `test_managementspoor_eigenaarschap_is_blank_not_ai_suggested` en de
   agenda-structuurtests in de design-testsuite). De implementer werkt deze bij naar de
   nieuwe paginastructuur.
6. **Opleveringsverificatie**: volledige backend-suite op de 25-failed-baseline met
   byte-identieke faalset (stash-diff); beide voorbeeldrapporten (Vertrek + Behoud)
   geregenereerd; WeasyPrint-Docker 0 warnings; rasterpagina visueel gecontroleerd op
   beide; Railway-redeploy nodig na merge.

## 10. Buiten scope en follow-ups

- **Loep Start**: behoudt tijdelijk `_eerste_managementspoor`. Expliciete
  acceptatie-eis van de Loep Start-verdiepingsset v1.1: Start migreert dan naar het
  raster en `_eerste_managementspoor` wordt verwijderd. Geen tweede permanente
  agenda-implementatie.
- Gespreksrichting-data in de rangorde (nu alleen toelichting in de opener): heroverwegen
  na 2-3 campagnes met echte direction-data.
- Verdeling-strips bij intentievragen: blijft geparkeerd (eerdere beslissing).
- Kalibratie `SPREAD_FLAG_MIN_SHARE` (0.30): heroverwegen zodra meerdere echte campagnes
  data geven; wijziging vereist een spec-update, niet alleen een code-edit.

## 11. Beslissingenlog brainstorm (2026-07-18)

- Agenda integreert in het raster (Lars ontevreden met huidige top-2-pagina).
- Signalen zichtbaar zonder composietcijfer; tiers en kwadrantplot afgewezen.
- Signalen: score (basis) + spreiding + verdieping; direction alleen als toelichting;
  `_RETENTION_RELEVANCE` bewust ongebruikt (aannames, geen metingen).
- Gesorteerd + gelijkspel eerlijk; drempel vast en gedocumenteerd (strikt < 0,3),
  in een zin uitlegbaar op de pagina zelf.
- Per signaal degraderen; scope Vertrek + Behoud; een gedeelde pagina.
- Structuurvariant A (signaaltabel) gekozen boven kwadrantplot (B) en factorkaarten (C).
- Kolomkop "Agenda" (niet "Weging"); klantentaal in celstaten; geen rangnummer-verwijzingen.
- Kolom telt / opener duidt: twee bestaande staffels, geen nieuwe drempels behalve
  `SPREAD_FLAG_MIN_SHARE`.
