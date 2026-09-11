# Rapport fix-ronde 1 (stresstest 2026-09-10)

Bron: `docs/rapport-stresstest-2026-09-10.md`. Regressiegate: `scripts/stresstest_report.py`
(uitvoer in `docs/stresstest/`, gitignored). Alleen pure fixes; ontwerpvragen
B5/B6/B7/B12/B17/B19/B18 zijn ronde 2 en buiten scope.

Baseline vóór deze ronde (worktree `fix/rapport-stresstest-ronde-1` op `9f6d704e`):
backend `25 failed, 550 passed, 5 skipped`; frontend tsc 133 errors.

Regels voor alle taken: geen em-dashes in klantcopy; gewone taal (geen jargon); Loep als
onderwerp, nooit "ik"; Fail Loud (geen stille degradatie, geen kale velden);
WeasyPrint-veilige CSS (geen `gap`, geen `var()`, geen `inset`); contract-tests die oude
copy pinnen in lockstep bijwerken; elke taak eigen commit.

Volgorde (afhankelijkheden): T1 B16 → T2 B15 → T3 B4 backend → T4 B4 frontend → T5 B10 →
T6 B1 → T7 B2 → T8 B3 → T9 B11.

## T1 (B16) Enkelvoud in `_deepening_chain`
`backend/report_html.py` `_deepening_chain`: dezelfde enkelvoudslogica als `_direction_chain`
("Van de 1 respondent met een verdieptrigger op X kreeg 1 de verdiepingsvraag; 1 beantwoordde
die."). Alle drie tellingen (triggered/offered/answered) apart. Tests in
`tests/test_deepening*`/`tests/test_report_*` die de oude zin pinnen bijwerken.

## T2 (B15) Bandlabel op de getoonde (afgeronde) waarde
Overal waar een score als `x.x/10` naast een bandlabel staat moet het label op de afgeronde
waarde (1 decimaal) berekend zijn: 6.45 toont "6.5/10" en moet "Relatief sterk" heten, nooit
"6.5 · Aandachtspunt". Aanpak: `_factor_label` en `_factor_color` (en `_rag_color` als die ook
op de drempels 5.0/6.5 zit) ronden intern eerst op 1 decimaal (`round(score, 1)`) voordat ze
vergelijken. Controleer ook `_band` en de bandlogica in `report_priority.py`/segment-blok/SDT-
rijen: alle plekken waar een `/10`-getal met een label wordt getoond. Regressietests: 6.45 →
relatief sterk, 4.95 → aandachtspunt, 6.44 → aandachtspunt.

## T3 (B4) Behoudssignaal en checkpointscore naar de gezondheidsschaal, backend
Besluit: het behoudssignaal (retention) en de checkpointscore (onboarding) worden overal
getoond op de gezondheidsschaal (hoog = goed), consistent met alle andere `/10`-scores en de
bandladder kwetsbaar <5,0 / aandachtspunt 5,0-6,5 / relatief sterk >=6,5. De opgeslagen
`risk_score` (risicoschaal, `11 - health`) blijft ongewijzigd in DB/API; de omzetting is een
weergavelaag: `health = 11 - avg_risk` (precedent: `signal_score` in het segmentblok, regel
~1823). Loep Vertrek (frictiescore, hoog = meer frictie) blijft ongewijzigd.

Raak in `backend/report_html.py`: (a) `_band(...)` voor retention/onboarding: neemt de
gezondheidswaarde en gebruikt de ladder <5,0 "Behoud onder druk"/"Onboardingbasis vraagt
aandacht", 5,0-6,5 "Behoud vraagt aandacht"/"Gemengd onboardingsbeeld", >=6,5
"Behoudsklimaat stabiel"/"Onboardingbasis stabiel"; (b) p.02-kernzin retention
("behoudssignaal x.x/10") en onboarding ("checkpointscore x.x/10"); (c)
`SECTION_INTROS["behoudscontext"]` en `["checkpointoverzicht"]`: uitleg klopt met hoog = goed;
(d) `_behoudscontext` Behoudssignaal-sigrow (score, kleur, note); (e)
`_checkpointoverzicht` (score, kleur, label); (f) methodiekpagina retention/onboarding als
die het signaal noemt; (g) cover-stats als daar een signaal staat; (h) alle andere plekken
waar `avg_risk` voor retention/onboarding gerenderd wordt (grep `avg_risk`, `retention_score`).
Ook `dashboard_signal_help` in `backend/products/retention/definition.py` en
`backend/products/onboarding/definition.py`: "Hogere score = sterker aandachtssignaal" moet
"hoger = beter" worden, in gewone taal.

Verifieer met `scripts/stresstest_report.py 04 05 20`: 04 (alles hoog) → behoudssignaal hoog
(>=6,5) en label stabiel/sterk; 05 (alles laag) → signaal laag (<5,0) en label onder
druk/kwetsbaar; 20 → checkpointscore consistent met de ladder. Tests die oude copy/polariteit
pinnen (`tests/test_report_html_design.py`, `test_pdf_redesign.py`, `test_report_leesbaarheid.py`,
`test_scoring.py` alleen als die renderoutput pint) in lockstep. Nieuwe tests: polariteit +
labelconsistentie op de grens.

## T4 (B4) Frontend-weergave van het signaal
Zelfde inversie in de app, alleen weergave, voor `scan_type` retention en onboarding:
- `frontend/lib/products/retention/definition.ts` en `onboarding/definition.ts` `signalHelp`:
  hoger = beter, gewone taal.
- Eén pure helper (bijv. `toDisplaySignalScore(scanType, riskScore)` in `lib/types.ts` of
  `lib/scan-definitions.ts`) die voor retention/onboarding `11 - risk` teruggeeft en anders de
  waarde ongewijzigd; unit-getest.
- Gebruik op elke plek waar `avg_risk_score`/`averageRiskScore` als getal aan de gebruiker
  wordt getoond: `app/(dashboard)/campaigns/[id]/page-helpers.tsx` (panel "Primair signaal" +
  de `Huidig ...: x.x /10`-zinnen), `app/(dashboard)/dashboard/home-launcher.ts` (metric), 
  `app/(dashboard)/beheer/page.tsx` (getal én kleurbanden: bij retention/onboarding hoog =
  groen). Interne logica (`deriveSignalProfile`, playbook-banden, sortering) blijft op de
  risicoschaal; daar niets wijzigen.
- `lib/marketing-positioning.test.ts` regels 148-149 pinnen de oude help-tekst → bijwerken.
Verificatie: tsc blijft 133; vitest faalset identiek aan baseline.

## T5 (B10) Cover-label loopt buiten de pagina
`backend/report_css.py` `.cmeta/.cmc/.cml/.cmv`: de derde coverstat ("Eerste aandachtspunt")
met lange factornamen ("Cultuur en psychologische veiligheid", "Rolhelderheid en
eigenaarschap", "Informatiedichtheid en werktempo") moet binnen de kolom afbreken. WeasyPrint-
veilig (geen `gap`/`var()`/`inset`); `display:table` met `table-layout:fixed; width:100%` en
`word-wrap:break-word`/`overflow-wrap`, kleinere `.cmv`-lettergrootte voor lange labels mag
(bijv. class `cmv-long` als de waarde > 18 tekens). Testen door een cover te renderen met die
drie labels en te asserten op de CSS/HTML; visuele check komt in de PDF-stap achteraf.

## T6 (B1) Kernzin Loep Vertrek noemt raster-startpunt als "laagst"
`render_exit_report_html` ~regel 2183: `"{_raster_primary_label} scoort het laagst ({score})"`
gebruikt `_raster_rows[0]`, maar het raster-startpunt is per ontwerp niet altijd de laagste
score (vertrekreden-weging, spreidings-/verdiepingsvlag). Ontkoppel de zin van die aanname:
noem het startpunt als "staat bovenaan"/"is het eerste gesprekspunt" met zijn score, en laat de
bestaande `_raster_attribution`-regel (al onder de gespreksopener) uitleggen waarom. Als de
strikt laagste factor een andere is dan het startpunt, mag de zin dat niet ontkennen.
Regressietest: scenario 08 (Groeiperspectief 4,50 lager dan startpunt Leiderschap 4,88):
de zin mag niet "scoort het laagst" zeggen over Leiderschap. De eerste tak (startpunt = ook
meest genoemde vertrekreden: "zowel de laagste factor als de meest genoemde vertrekreden")
zelfde correctie.

## T7 (B2) Gedegradeerde pagina twee bij n<10
Bij `has_pattern == False` (n<10) is `factor_avgs` leeg → `_raster_rows` leeg → cover
"Eerste aandachtspunt: —", kernzin "— scoort het laagst (&#x2014;)" (dubbele escaping:
`_score_str(None)` geeft een entiteit die `_h()` opnieuw escapet), kop "Waarom  bovenaan
staat" zonder onderwerp, lege Gespreksopener. Voor alle drie de renderers:
- Eén expliciete degraded-variant van p.02 (`_bestuurlijke_read` krijgt bijv. een
  `degraded_html`/`degraded=True`-pad of een aparte `_bestuurlijke_read_degraded`): kernzin in
  gewone taal die zegt wat wel en niet kan bij dit aantal (bijv. "Met 8 respondenten toont
  Loep nog geen factorprofiel: daarvoor zijn minimaal 10 antwoorden nodig. Wat wel zichtbaar
  is: de genoemde vertrekredenen (exit) / de behoudscontext (retention) / ... en de
  responsbasis."). Geen why-blok, geen "Waarom ... bovenaan staat", geen lege Gespreksopener;
  wel de responsbasis en het gebruiksblok waar zinvol.
- Cover: "Eerste aandachtspunt" wordt bij n<10 een eerlijke waarde ("Nog geen factorprofiel"
  of vergelijkbaar), nooit een streep.
- `_score_str(None)` mag nooit meer als literal `&#x2014;` in de output belanden: laat het
  een gewone tekst teruggeven die veilig door `_h()` kan ("n.b." of "geen score") en check
  alle aanroepen.
Regressietest: scenario 07 (exit n=8) en 18 (retention n=12 vlak, has_pattern True: mag
NIET degraded zijn, dient als negatieve controle) via het harnas + unittest op de degraded
kernzin (geen "—", geen "&#x2014;", geen "&amp;#x2014;", geen "scoort het laagst", geen
"Waarom  bovenaan").

## T8 (B3) Richtingblok verdwijnt stil bij n<10
`_trust_page(direction_active=bool(direction_agg))` belooft het blok "Wat er moet gebeuren",
maar `_wat_moet_gebeuren_block` rendert niets zonder raster-rijen (n<10). Fix:
- `direction_active` koppelen aan wat werkelijk gerenderd is: bereken de blok-HTML eerst en
  geef `direction_active=bool(blok_html)` door aan `_trust_page` (exit + retention).
- Bij n<10 (geen raster-rijen) het blok tóch tonen in een eigen degraded/`too_few`-vorm: de
  eyebrow + intro + één kaart/paragraaf met de keten over het hele rapport ("Van de 8
  respondenten kregen 8 de richtingvraag; 6 beantwoordden die, 2 sloegen over. Zonder
  factorprofiel (minimaal 10 antwoorden) is er nog geen startpunt om een richting aan te
  koppelen; de losse antwoorden zijn te weinig per onderwerp om te tonen."). Geen belofte over
  later gebruik. Totalen: som over `direction_agg` van offered/answered/skipped. Waar het
  raster bij n<10 nu helemaal niet rendert, moet het richtingblok ergens op de agendapagina of
  op p.02 verschijnen, met de bestaande `DIRECTION_BLOCK_EYEBROW`.
Regressietest: scenario 07 → het blok staat in de HTML met "6" en "8", methodiekpagina noemt
de Richtingvraag; scenario met n>=10 ongewijzigd.

## T9 (B11) "Hier hoeft volgens de meeste betrokkenen niets" bij 2 van 4
`direction_state` (`backend/products/shared/deepening.py`, regel ~840): `none_needed` bij
`counts[none]/n >= 0.5`. Bij 2 van 4 of 2 van 3 is "de meeste" onwaar. Fix: `none_needed`
alleen strikt boven de helft (`> 0.5`); bij exact de helft valt de staat door naar de gewone
clear/divided-logica (de niets-optie is dan gewoon de topkeuze of het is verdeeld). Controleer
dat `clear` de niets-optie niet als opdrachtvorm kan tonen (bestaande guard) en pas
`DIRECTION_HEAD_NONE_NEEDED`/p.02-regel niet aan tenzij nodig. Tests in
`tests/test_direction_*` bijwerken/aanvullen: 2/4 → niet none_needed; 3/4 → none_needed;
2/3 → niet none_needed. Scenario's 02, 04, 13 hercontroleren.

## Afsluiting (controller)
Volledige backend-suite (faalset byte-identiek aan baseline), tsc 133, harnas alle 20
scenario's + matrix "Na ronde 1" in het bevindingenrapport, 3 voorbeeldrapporten regenereren
(HTML + PDF via WeasyPrint-Docker, 0 warnings), cover + p.02 visueel, commit + push,
beslissingslog.
