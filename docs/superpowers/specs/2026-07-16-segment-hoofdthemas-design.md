# Mini-spec: Hoofdthema's per afdeling in de segmentanalyse

**Datum:** 2026-07-16
**Status:** AKKOORD (Lars, 16-7-2026) — met twee aanpassingen verwerkt in §3.1;
de drie open vragen zijn beantwoord in §5. Doel: af vóór 24 augustus
(voorbeeldrapport dat Gerianne doorbladert toont dan hoofdthema's per afdeling).
**Aanleiding:** feedback Lars op voorbeeldrapport_retentiescan.pdf (besproken 16-7-2026):
de segmentanalyse toont nu alleen respons + één samenvattend cijfer + band per
afdeling. Lars wil per afdeling zichtbaar **welk thema daar het laagst scoort**,
niet alleen één totaalcijfer.

---

## 1. Wat er nu is

`_segment_block` (backend/report_html.py) toont per kwalificerende afdeling
(n ≥ MIN_SEGMENT_N = 5, minimaal 2 afdelingen, max 8 rijen, rest gepoold als
"Overige afdelingen"):

| kolom | inhoud |
|---|---|
| Afdeling | naam (pooled rij niet vet) |
| n | `ingevuld/uitgenodigd` + % (noemer uit `segment_departments`) |
| Score | gemiddeld behoudssignaal (health-schaal, 11 − risk) |
| Band | kwetsbaar punt / aandachtspunt / relatief sterk |
| Spreiding | stippenstrip vanaf n ≥ 10 (MIN_DISTRIBUTION_N); pooled nooit |

Plus een navy-anchor "Startpunt voor de bespreking" voor de laagst scorende
niet-gepoolde afdeling.

**Beschikbare data (geen schema-wijziging nodig):** per respondent bestaan
`org_raw` (itemantwoorden) en `department`. `_per_respondent_factor_scores`
berekent al individuele factorscores (1–10) per respondent; die hoeven alleen
per afdeling gegroepeerd te worden.

## 2. Doel

Per afdeling het gesprek kunnen richten: niet alleen "Sales scoort 4.4", maar
"bij Sales zit de druk vooral op werkdruk en herstelruimte". Groepsniveau,
geen ranking, geen oordeel — consistent met de bestaande segment-intro.

## 3. Voorstel

### 3.1 Staffelontwerp (eerlijkheid eerst)

De bestaande privacy- en betrouwbaarheidsstaffels blijven leidend; de
factorlaag krijgt een eigen trap die daarop aansluit:

| n per afdeling | wat tonen we op factorniveau |
|---|---|
| < 5 | niets (afdeling staat sowieso niet in de tabel; gepoold) |
| 5–9 | alleen het **laagste thema**: factorlabel + **bandlabel, géén decimale score** ("Werkbelasting · kwetsbaar punt"), met het vaste caveat-patroon "gesprekshaakje, geen conclusie" |
| ≥ 10 | volledige factoruitsplitsing: alle 6 organisatiefactoren met score + bandkleur, laagste bovenaan |

> **Aanpassing Lars (16-7):** bij 5–9 geen decimale score. (a) Consistent met de
> verdiepingsstaffel (5–9 alleen aantallen, pas vanaf 10 percentages): een score
> met één decimaal bij n=5 is schijnprecisie — één respondent verschuift hem in
> z'n eentje een vol punt. (b) Herleidbaarheid: bij een team van 5 dat de
> leidinggevende kent is "werkdruk scoort hier 3.2" gevoeliger dan "werkdruk
> vraagt hier als eerste aandacht". Het label stuurt het gesprek net zo goed.

Aanvullende regels:

- **Per-factor-n-gate:** een factorscore per afdeling telt alleen mee als
  ≥ MIN_SEGMENT_N respondenten in die afdeling die factor daadwerkelijk
  hebben beantwoord (ontbrekende items → respondent telt niet mee voor die
  factor). Haalt een factor die drempel niet, dan wordt hij weggelaten met
  een eerlijke regel ("1 thema niet beoordeelbaar: te weinig antwoorden") —
  geen stil gat.
- **Edge-regel laagste thema onder voorbehoud (aanpassing Lars 16-7):** haalt
  één of meer factoren de gate niet, dan verschijnt de meldregel hierboven
  áltijd naast het laagste-thema-veld — anders toont het blok stilzwijgend de
  op-één-na-laagste factor als "laagste thema" wanneer uitgerekend de laagst
  scorende factor is weggelaten. De lezer weet zo dat het getoonde laagste
  thema onder voorbehoud is. Zeldzame edge (survey-items zijn in de praktijk
  verplicht), maar exact de fail-loud-lijn.
- **"Overige afdelingen" (pooled) krijgt nooit een factorlaag** — zelfde
  argument als bij de spreidingsstrip: samengestelde restgroep, duiding is
  betekenisloos en suggereert een groep die niet bestaat.
- **Gelijkspel laagste thema:** deterministisch laagste score, bij exacte
  gelijkheid alfabetisch op factorlabel. Bij 5–9 tonen we er maar één; de
  tweede verschijnt vanzelf in de volledige uitsplitsing vanaf n ≥ 10.
- **Geen vergelijkingsclaims tussen afdelingen op factorniveau** ("Sales
  scoort lager op werkdruk dan Support") — de lezer mag zelf kijken, het
  rapport claimt het niet. Zelfde lijn als "geen ranking of oordeel".

### 3.2 Presentatie (v1, PDF)

1. **Extra kolom "Laagste thema"** in de bestaande segmenttabel (alle
   rijen n ≥ 5): factorlabel in de bandkleur — bij rij-n 5–9 met bandlabel
   (zonder score), bij rij-n ≥ 10 met score; bij de pooled rij een
   mono-label "niet getoond: samengestelde restgroep". Dit is de kern van
   de feature en blijft compact.
2. **Factoruitsplitsing per afdeling** als subblokken onder de tabel, alleen
   voor afdelingen met n ≥ 10: kleine tabel (factorlabel, score, bandlabel)
   in dezelfde stijl als de itemtabellen, laagste eerst. Max 8 afdelingen
   bestaat al; bij veel kwalificerende afdelingen kan dit een tweede pagina
   worden — acceptabel, de segmentanalyse is dan ook echt rijker.
3. **Navy-anchor verrijken:** de bestaande "Startpunt voor de bespreking"
   noemt straks ook het laagste thema van die afdeling, mits n ≥ 5 voor die
   factor — met dezelfde staffel als de kolom. Bij rij-n 5–9 zónder score:
   "Marketing heeft de laagste score (4.4/10; 5 van de 8 uitgenodigden
   vulden in). De druk zit daar vooral op werkdruk en herstelruimte
   (kwetsbaar punt)." Bij rij-n ≥ 10 mét score. Zelfde
   noemer-eerst-principe als nu. (De afdelingsscore zelf, 4.4/10, staat al
   in de bestaande tabel en blijft — de staffel geldt voor de factorlaag.)
4. **Sectie-intro (`SECTION_INTROS["segmentanalyse"]`) uitbreiden** met één
   zin die uitlegt wat het laagste thema is en wat de staffel doet — de
   zelfuitleg-laag is een vertrouwensdrager.

### 3.3 Scope

- Alle drie scans (segmentblok is scanbreed identiek); factorlabels via de
  bestaande product-specifieke `_fl(fk, scan_type)` — vereist dat
  `_segment_block` voortaan `scan_type` meekrijgt (nu bewust parameterloos;
  dat besluit wordt hiermee teruggedraaid, gedocumenteerd in de docstring).
- Alleen de 6 organisatiefactoren (`ORG_FACTOR_KEYS`); SDT-dimensies niet
  (zelfde filter als `_select_priority_factors`, bug 2026-07-13).
- Alleen rapportlaag; dashboard-weergave is een aparte, latere taak.

### 3.4 Datalaag (implementatieschets)

In `build_report_data`: naast `signal_score` ook de per-respondent
factorscores + afdeling doorgeven aan een nieuwe pure helper
`_department_factor_rows(respondents) -> dict[dept, list[tuple[fk, score, n]]]`,
met dezelfde kwalificatieregels als `_department_segment_rows`. Pure functie,
geen DB, geen schema-wijziging, los testbaar.

## 4. Testplan

- Staffel: n=4 → geen factorlaag; n=5–9 → alleen laagste thema (label +
  bandlabel, expliciet GEEN decimale factorscore in de output) + caveat;
  n=10 → volledige uitsplitsing mét scores.
- Edge-regel: laagst scorende factor haalt de gate niet → meldregel
  "niet beoordeelbaar" aanwezig naast het laagste-thema-veld.
- Per-factor-gate: afdeling n=6 waarvan 3 respondenten een factor misten →
  die factor weggelaten mét meldregel.
- Pooled rij: nooit een factorlaag.
- Gelijkspel: twee factoren op exact dezelfde laagste score → alfabetisch.
- Navy-anchor: thema alleen genoemd als de factor-n-gate haalt.
- Guard: geen SDT-dimensie als thema.

## 5. Open vragen — beantwoord door Lars (16-7-2026)

1. **Volledige uitsplitsing bij n ≥ 10: alle 6 factoren.** Top-3 zou een
   redactionele keuze van Loep zijn; de sterke factoren zijn net zo waardevol
   in het gesprek ("wat werkt hier al", zelfde functie als "Relatief sterk"
   op de bestuurlijke read).
2. **Drempel op 10, niet conservatiever.** 10 is al de patroonanalyse- én
   spreidingsdrempel; een derde magisch getal introduceert uitlegplicht
   zonder principiële basis. De 5–9-laag is met aanpassing 1 al voorzichtiger.
3. **Kolom + subblokken, beide.** De kolom bedient de MT-lezer die alleen de
   tabel scant, de subblokken de HR-lezer die doorleest. Kolom toont bij 5–9
   label + band, bij ≥ 10 label + score.

## 6. Buiten scope

- Dashboard-weergave van segment-hoofdthema's.
- Trend/vergelijking tussen metingen per afdeling.
- Verdiepingsvragen-aggregatie per afdeling (n wordt daar vrijwel altijd te
  klein; expliciet niet doen om schijnprecisie te vermijden).
