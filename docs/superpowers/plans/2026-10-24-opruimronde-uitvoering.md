# Opruimronde (groep C): uitvoering

Branch `chore/opruimronde` vanaf main `a58fa33a`, worktree `.worktrees/opruimronde`.
Niet gemerged, niet gepusht. Bron: `2026-10-12-polijstronde-beslissingen-uitvoering.md`
(groep C) en `2026-10-09-polijstronde-uitvoering.md` (beslispunten 10, 14, 19, 21).

## Wat

| # | Onderdeel | Commit |
|---|-----------|--------|
| 1 | Kop "Appendix" heet "Bijlage" in alle drie de renderers; CSS-commentaren die in de HTML meereizen ook; `scripts/check_pdf_report.py` herkent de staart van de bijlage aan "NN Bijlage" (anders viel de vaste uitzondering stil weg) | `b78adb5f` |
| 2 | Terugkoppelhint in "Besluit vastleggen" noemt afdelingen alleen als het rapport ze toont. Nieuwe helper `reportShowsDepartments` (zelfde regel als `_department_segment_rows`: minstens twee afdelingen met elk minstens 5 ingevulde vragenlijsten), gevoed met ingevulde vragenlijsten per afdeling op de campagnepagina | `357297d8` |
| 3 | Respondentteksten: bedankpagina neutraal ook voor vertrekkers; stapbalk en kop allebei "Korte verduidelijking"; startpagina en vragenlijst beloven allebei "vertrouwelijk verwerkt en alleen als groepsbeeld gerapporteerd"; hulptekst bij het open antwoord zonder "anoniem"/"geanonimiseerd" | `0809f9da` |
| 4 | Dode code weg: `SuitePreviewSection` + `suiteSignalMetrics` en de helpers die alleen daarin hingen, `hero-motion-dashboard.tsx`, parameter `review_when` (nooit gelezen) met de drie teksten | `81a6d9f5` |
| 5 | Code-vangnet mailafzender op `hallo@getloep.nl` (`backend/email.py`, `frontend/app/api/contact/route.ts` verpakt; `frontend/lib/email.ts` kaal); `SUPABASE_TEMPLATE_SETUP.md` bijgewerkt (afzender, Site URL, redirects, onderwerpregel) | `9ad92c30` |
| - | Voorbeeldrapporten (HTML) geregenereerd | `3ef6f1bb` |

## Keuzes

- **Onderdeel 2.** `segment_departments` alleen zou niet de regel van het rapport volgen: een meting
  met afdelingen kan in het rapport zonder tabel staan (minder dan twee afdelingen met 5 ingevuld).
  De helper telt alleen ingevulde vragenlijsten (kolom `completed`, al leesbaar voor `authenticated`
  sinds de migratie van 13-7). Kleine afwijking die blijft: het rapport telt respondenten met een
  ingevulde vragenlijst én een berekende score; een ingevulde vragenlijst zonder score (randgeval)
  telt in het dashboard wel mee.
- **Onderdeel 3.** Ook de hulpteksten bij het open antwoord beloofden anonimiteit ("anoniem bewaard",
  Vertrek en Start "geanonimiseerd opgeslagen"). `anonymize_text` vangt alleen volledige namen en
  contactgegevens, dus die zeggen nu "vertrouwelijk bewaard" plus "Herkende namen haalt Loep er
  automatisch uit". De mails (`Vertrouwelijk`) waren al in lijn.
- **Onderdeel 4.** De dode sectie gebruikte vijf helpers die nergens anders hingen; die zijn mee
  verwijderd (anders nieuwe ongebruikte code). `homepage-besluit-a.test.ts` pinde de zin "Daarna leid
  jij het gesprek met je MT, met het rapport als leidraad, ..." die alleen in het dode blok stond
  (regel 969 op main, binnen 918-1609). Bezoekers lazen hem nooit. De assert wijst nu naar de live zin
  met dezelfde belofte uit stap 3 van de werkwijze. Dat is geen verzwakking: de oude assert mat
  dode tekst.
- **Onderdeel 1.** De V12-test verbood het woord "bijlage" in het hele rapport (toen de sectie nog
  Appendix heette, om niet naar een niet-bestaande bijlage te verwijzen). Nu eist hij dat het woord
  precies één keer staat (de kop) en "appendix" nergens. De scenariotitel in die test zei "met
  appendix" en lekte als campagnenaam in het rapport; die heet nu "alle onderwerpen".

## Gates

| Gate | Uitkomst |
|------|----------|
| Backend pytest | 24 failed, 2772 passed, 11 skipped; FAILED/ERROR-namen identiek aan `polijstronde-backend-baseline-fails.txt` (diff leeg) |
| Python 3.11-guard | groen (niet in de faalset) |
| Frontend tsc | 131 = baseline |
| Frontend vitest | 47 falend vóór en na, faalset per testnaam identiek (baseline vooraf op deze worktree gemeten). Totaal 2018 vóór en na: +6 nieuwe/vernoemde tests, -6 vervallen (3 per-bestand-guards over het verwijderde `hero-motion-dashboard.tsx`, 3 vernoemd) |
| `npm run build` (dummy-env) | geslaagd |
| Rapporten HTML | `stresstest_report.py` (35 HTML), `render_besluit_max.py`, `generate_voorbeeldrapport.py exit/retention/onboarding`: alle geslaagd. "appendix" komt in geen enkel gegenereerd rapport voor. De drie voorbeelden verschillen van main alleen in de kop en twee CSS-commentaren |
| Render in productie-image | **niet gedaan**: Docker-engine draaide niet (`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`, twee keer gecontroleerd). Niet zelf herstart, volgens opdracht |
| Hero-uitsnede p.02 | niet nodig: pagina twee verandert niet (alleen de laatste sectie heeft een andere kop) |

## Bewust niet gedaan

- **PDF's.** Geen render in het image, dus geen nieuwe voorbeeld-PDF's in `docs/examples/` en
  `frontend/public/examples/`; die tonen nog "Appendix". Paginatallen en de meting (0 bevindingen,
  0 warnings, 0 streepjes) zijn niet gecontroleerd. Verwachting: gelijk, want "Bijlage" is korter
  dan "Appendix" en er verandert verder niets in de opmaak. Te doen zodra Docker draait:
  `docker build -q -t loep-backend:opruim .`, render met `scripts/render_in_image.py`, PDF's
  kopiëren.
- **Andere verisight-adressen** (gemeld, niet aangepast): EMAIL_FROM-fallback in
  `frontend/lib/action-center-follow-through-mail-delivery.ts`, organizer-fallback in
  `frontend/app/api/action-center-review-invites/invite-helpers.ts`, ICS-UID-host in
  `frontend/lib/action-center-review-invite-ics.ts`. `privacy@verisight.nl` komt buiten `docs/`
  nergens meer voor.
- **Legacy `backend/report.py`** (ReportLab, alleen nog voor team/leadership/culture_assessment)
  noemt nog "Appendix A/B": niet een van de drie scans, dus buiten deze ronde.
- **Exit `survey_intro`** zegt "Je antwoorden helpen de organisatie beter te worden"; dat klopt ook
  voor vertrekkers, dus ongewijzigd.
- `railway.toml` en `railway.cron.toml` niet aangeraakt.

## Na merge

- Railway-redeploy "Loep main" (rapportkop, respondentteksten in `templates/` en de
  productdefinities, mailafzender-vangnet). Geen migratie.
- Vercel deployt automatisch (dashboard-terugkoppelhint, homepage zonder dode code, contact-vangnet).
- PDF's renderen in het productie-image en de drie voorbeeld-PDF's vervangen (zie boven).
