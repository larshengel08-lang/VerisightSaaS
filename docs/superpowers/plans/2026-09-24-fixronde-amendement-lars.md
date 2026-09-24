# Amendement op de fixronde: besluiten Lars 24-9

Hoort bij `2026-09-24-fixronde-leesronde.md`, sectie "Wat Lars moet beslissen". Lars koos op 24-9 op elk punt het advies. Dit bestand zegt wat daardoor verandert in de bouw. Waar het plan zegt "blijft ongewijzigd, beslispunt voor Lars", geldt nu dit amendement.

## A1. Tijdsanker in de Vertrek-vertaalvragen: vervangen (beslispunt 1)

In `WORK_QUESTIONS` (`backend/products/shared/deepening.py`), alleen de `exit`-tekst, precies deze zinsdelen; de rest van elke vraag blijft letterlijk:

- "En toen de vertrekkers er nog werkten?" wordt "En in de periode waarin deze mensen vertrokken?" bij `ldd_feedback`, `ldd_escalation`, `ldd_availability`, `cud_safety`, `cud_conflict`, `cud_crossteam`, `wld_scope`, `wld_recovery`, `rcd_alignment`, `rcd_information`.
- `grd_criteria`: "Stond dat er al toen de vertrekkers er nog werkten?" wordt "Stond dat er al in de periode waarin deze mensen vertrokken?"
- `wld_peaks`: "Wie mocht dat zeggen toen de vertrekkers er nog werkten?" wordt "Wie mocht dat zeggen in de periode waarin deze mensen vertrokken?"
- `wld_friction`: "Wat ervan bestond al toen de vertrekkers er nog werkten?" wordt "Wat ervan bestond al in de periode waarin deze mensen vertrokken?"
- `rcd_expectations`: "Stonden ze er al toen de vertrekkers er nog werkten?" wordt "Stonden ze er al in de periode waarin deze mensen vertrokken?"

Eerst meten dat precies deze veertien sleutels de oude vorm dragen (het plan mat op `33920b49`). Guardtest: geen enkele `exit`-tekst bevat nog "toen de vertrekkers er nog werkten"; de `retention`-teksten zijn byte-identiek aan main. Werk de vertaalvragen-spec bij (`docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md`) met een regel "Amendement 24-9: tijdsanker Vertrek vervangen".

## A2. Aansturingshint alleen bij Loep Behoud (beslispunt 2)

"Deze vraag gaat ook over de leidinggevenden aan deze tafel. Beantwoord hem eerst voor je eigen team." verschijnt alleen nog bij `scan_type == "retention"`. Bij Loep Vertrek staat onder het leiderschapsonderwerp geen hint; de namenregel uit Taak 5 blijft. Test op beide scantypes.

## A3. Parkeerregel (beslispunt 4) en FAQ-teksten (beslispunt 7)

Akkoord zoals in het plan. Geen wijziging.

## A4. Bewaartermijn (beslispunt 8)

1. **Periodiek:** maandelijks automatisch via een Railway-cron. Leg in het verslag en in Taak 22 vast hoe Lars hem aanzet (schema, commando). Het aanzetten en de eerste `--apply` blijven bij Lars; in deze ronde nooit `--apply` tegen productie.
2. **Leads en leerdossiers:** `contact_requests` en de `pilot_learning_*`-tabellen vallen ook onder de opschoning, met als termijn twee jaar na het laatste contact (de laatste van de tijdstempels die de rij heeft; onderzoek welke er zijn). Leads die tot een organisatie hebben geleid: geen uitzondering in code, dezelfde termijn. Zelfde regels als voor metingen: dry-run standaard, één transactie per rij of per dossier, tweede run doet niets, tests op SQLite. Neem de aantallen mee in de alleen-lezen dry-run van Taak 19.
3. **Privacyverklaring** (`frontend/app/privacy/page.tsx`):
   - Sectie 5, na de bestaande alinea, nieuwe alinea: "Wat je via het contactformulier of in een kennismaking met Loep deelt, bewaart Loep tot uiterlijk twee jaar na het laatste contact. Volgt er een overeenkomst, dan gelden de termijnen hierboven."
   - Sectie 2: staat er nog geen categorie voor mensen die het contactformulier gebruiken, voeg dan toe: "**Contactpersonen:** naam, zakelijk e-mailadres, organisatie en wat je in je bericht schrijft." Staat er al iets, laat het staan en meld het.
4. **Verwerkersovereenkomst** (`frontend/app/dpa/page.tsx`), sectie 9, na de bestaande alinea: "Verwijderde gegevens kunnen nog korte tijd voorkomen in back-ups van de hostingpartij. Die back-ups worden volgens hun vaste termijn automatisch overschreven. Verwerker zet daaruit geen gegevens terug, behalve om een storing te herstellen."
5. Breid `frontend/lib/juridische-paginas.guard.test.ts` uit met deze zinnen (aanwezig, geen streepjes).
6. **Momentopname voor plan 3c:** niet in deze ronde bouwen. Zet in het verslag onder "Voor plan 3c" dat bij het sluiten van een meting een momentopname van de geaggregeerde cijfers bewaard moet worden, zodat vergelijken na de opschoning nog kan.

## Niet in deze ronde

- **Vertrekmaand in de Vertrek-vragenlijst (beslispunt 3):** Lars zei ja. Dat wordt een aparte vervolgtaak na de merge, omdat hij de vragenlijst en de submit raakt. Taak 6 bouwt zoals gepland (toont eerlijk dat de periode ontbreekt).
