# Beslisronde na de polijstronde: implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Per taak een implementer, een spec-review en een codekwaliteitsreview.

**Goal:** De besluiten van Lars van 12-10 op het beslisoverzicht van de polijstronde doorvoeren (A1, A2, A3, A4, A5, A7, A8).

**Bron:** beslissingslog in `C:\Users\larsh\CLAUDE.md`, entry 2026-10-12, en "Wat Lars moet beslissen" in `docs/superpowers/plans/2026-10-09-polijstronde-uitvoering.md` (punten 1, 3, 11, 12, 13, 15, 23).

**Branch:** `feature/polijstronde-beslissingen` vanaf main `329cbba8`, worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\polijst-beslissingen`. Niet mergen, niet pushen.

## Harde regels

Gelden onverkort uit `docs/superpowers/plans/2026-10-09-polijstronde.md`, regels 15-68 (Python 3.11 zonder PEP 701 f-strings; copy in je/jij met Loep als onderwerp, geen em- of en-dash, geen jargon; nooit drempels, staffels of privacygates verlagen; klant ziet nooit individuele antwoorden; niets verzinnen; gate is de faalset per testnaam; nooit kaal `git stash`; `git commit -- <paden>`; alles committen vóór je stopt). Baselines op main `329cbba8` zijn gelijk aan de polijstronde: backend 24 falend, faalset `docs/superpowers/plans/polijstronde-backend-baseline-fails.txt`; tsc 131; vitest `docs/superpowers/plans/polijstronde-vitest-baseline-fails.txt` (47 stabiel plus 3 wisselvallig). De commando's en het renderrecept staan in dat plan; vervang daarin het worktreepad door `.worktrees/polijst-beslissingen`. Nooit pytest en een image-render tegelijk draaien. Testscenario's in tests renderen naar tmp via de fixture `stresstest_naar_tmp` (tests/conftest.py).

## Taken

| # | Taak | Besluit |
|---|---|---|
| 1 | Nieuwe werkvraag goedgekeurd; halve zin bij rangorde tegen kaart | A1, A7 |
| 2 | Afdelingstabel: label bij 5 tot 9 antwoorden; Vertrek-kolom toont de frictiescore | A4, A8 |
| 3 | Blijf- en vertrekintentie per afdeling (Loep Behoud) | A5 |
| 4 | Vaste uitzonderingen in de paginameting | A2 |
| 5 | Veertien Vertrek-werkvragen naar het uitstroomanker (na akkoord Lars op de tekst) | A3 |
| 6 | Voorbeeldrapporten, hero-afbeelding, eindmeting, verslag | |

Volgorde: 1, 2, 3 na elkaar (allemaal `backend/report_html.py`), dan 4, dan 5 zodra Lars de zinnen goedkeurde, dan 6.

### Taak 1 (A1, A7)

- **A1.** De werkvraagvariant `none_at_least_top` in `backend/products/shared/deepening.py` is goedgekeurd: haal de CONCEPT-markering weg en zet in zowel deze variant als de `split_none`-variant "Beide kan kloppen" om naar "Beide kunnen kloppen". Pas de content-pins (SHA's, vaste teksten) in `tests/test_work_questions_content.py` en verwante tests in lockstep aan.
- **A7.** Waar pagina twee (`_p02_startpunt_zin`) en de markeringsregel onder de rasterrij (`_tie_break_note`) zeggen dat de richtingvraag een gelijkspel besliste ("daar vragen meer mensen om verandering dan bij X ..."), komt er een halve zin achter als de richtingkaart van datzelfde onderwerp de verdeeld-staat met niets minstens zo groot als de grootste richting toont (zelfde poort als de kaart: `direction_none_at_least_top_shown` op `direction_state` met de getoonde score): `, al kiest daar een even grote of grotere groep ‘{niets}’` met `{niets}` de niets-tekst van de scan (Behoud "Niets, dit zit hier goed", Vertrek "Niets, dit zat hier goed"). Anders verandert er niets. Test beide kanten met synthetische invoer. Pagina twee moet op één A4 blijven (meet in Taak 6).

### Taak 2 (A4, A8)

- **A4.** In de afdelingstabel (`_segment_block`) toont de scorekolom bij afdelingen met 5 tot 9 antwoorden (onder `MIN_DISTRIBUTION_N`) geen cijfer meer. De cel krijgt in kleine grijze tekst `kleine afdeling`; de kolom Band ernaast draagt het label (al aanwezig). De restgroep volgt dezelfde regel op zijn eigen aantal. De intro wordt: "... bij kleine afdelingen (5 tot 9 antwoorden) staat in de score- en themakolom alleen een label, geen cijfer achter de komma ...". Verlaag nergens een drempel; voeg nergens een cijfer toe.
- **A8.** Bij Loep Vertrek toont de scorekolom de frictiescore zelf, op dezelfde schaal als pagina twee (gemiddelde risicoscore van de afdeling, hoger is slechter), met kop `Frictiescore` en kleur en band uit de frictiebanden (`_EXIT_BANDS`, `_band_key(..., "exit")`). De scan-zin in `SEGMENT_SCOREKOLOM` wordt: "De kolom Frictiescore is de frictiescore van {pagina 2}, per afdeling: hoger is slechter." Zoek alle plekken waar Vertrek een afdelingscijfer toont (tabel, navy conclusie, restgroepzin, staat 2, pagina twee) en toon daar dezelfde schaal; de selectie- en sorteerlogica (welke afdeling het laagst staat) blijft ongewijzigd. Retention en onboarding veranderen niet.

### Taak 3 (A5)

Loep Behoud toont blijf- en vertrekintentie per afdeling.
- **Data:** in `build_report_data` per afdeling met minstens `MIN_DISTRIBUTION_N` (10) antwoorden: aantal, gemiddelde blijfintentie (getoond via `_shown`), hoeveel daarvan onder de 5 op blijfintentie, hoeveel daarvan veel vertrekgedachten hebben (vertrekintentie vanaf 6,5, dezelfde grens als de zin op pagina twee). Afdelingen onder de 10 komen er niet in, ook niet gebundeld.
- **Blok** op de afdelingspagina onder de tabel, alleen Loep Behoud, alleen als er minstens één afdeling met 10 of meer antwoorden is: kop `Blijf- en vertrekintentie per afdeling`, één zin uitleg ("Alleen afdelingen met minstens 10 antwoorden, dezelfde grens als voor alle onderwerpen per afdeling."), tabel met Afdeling, Ingevuld, Blijfintentie (x.x/10 met label uit `_factor_label`), Veel vertrekgedachten (`k van n`). Gebruik bestaande tabelklassen; houd het blok bij elkaar (`no-break`).
- **Pagina twee:** `INTENTIE_DUIDING_KERN` zegt nu "dit rapport splitst ze niet per afdeling uit". Nieuw, met blok: "Blijf- en vertrekintentie zeggen hoe dringend behoud hier is, niet waarom, en ook niet wie er vertrekt. Per afdeling staan ze bij de afdelingen (pagina N), voor afdelingen met minstens 10 antwoorden." Zonder blok: "... Per afdeling staan ze alleen bij afdelingen met minstens 10 antwoorden; die zijn er in deze meting niet." De zin "Daarom begint het gesprek bij {startpunt} ..." blijft. Paginaverwijzing via een anker op het blok (elke href precies één id).
- **Privacy:** geen cijfers onder de 10; geen combinatie die een individu herleidbaar maakt (geen uitsplitsing binnen een afdeling).
- Werk de methodiekpagina bij als die zegt dat intenties niet per afdeling staan.

### Taak 4 (A2)

Leg de bekende dunne pagina's vast als uitzonderingen in de meting (`scripts/check_pdf_report.py` en/of `scripts/render_in_image.py`): een lijst met per uitzondering het scenario (voorvoegsel), het begin van de paginatekst en een ondergrens voor de vulling (gelijk aan de huidige meting: pagina 7 van 01/09/19 met 36/26/36%, de werkvragenpagina van 01/09/14 met 39/39/32%). Een uitzondering telt niet als bevinding zolang de vulling niet onder de ondergrens zakt; zakt hij wel, of verschijnt hij in een ander bestand, dan is het een bevinding. De uitvoer noemt de uitzondering bij naam (`OK ... uitzondering: werkvragenpagina, 39%`). Test met synthetische PDF's zoals `tests/test_check_pdf_links.py`. Documenteer de reden (R23, besluit Lars 12-10) in een commentaar.

### Taak 5 (A3)

Na akkoord van Lars op de veertien nieuwe zinnen: vervang in `backend/products/shared/deepening.py` de veertien Vertrek-werkvragen met "een jaar geleden" door de goedgekeurde tekst met `WERKVRAGEN_TIJDSANKER`; werk de guardtest (`tests/test_werkvragen_tijdsanker_guard.py`, nu ondergrens 15, wordt 29), `A1_SLOTEN`, de SHA-pin en `TERUGBLIK_VORMEN` bij.

### Taak 6

Voorbeeldrapporten opnieuw (alle drie, PDF's uit het productie-image in beide mappen), `scripts/render_hero_p02.py` opnieuw en de hero-afbeelding vervangen als de inhoud verandert (pagina twee verandert door A5), eindmeting in het productie-image (verwacht: geen bevindingen buiten de vastgelegde uitzonderingen), richtingstaten, volledige gates, browsercheck homepage alleen als de afbeelding veranderde, en een verslag `docs/superpowers/plans/2026-10-12-polijstronde-beslissingen-uitvoering.md` met per besluit wat er gebouwd is, wat de reviews vonden, metingen en wat nog open is.
