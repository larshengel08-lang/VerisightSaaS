# Vervolgronde na de fixronde: vertrekmaand en zes keuzes

Datum: 2026-10-07
Status: besluiten Lars 24-9 (vertrekmaand) en 7-10 (zes keuzes), alle op advies. Nog te plannen en te bouwen.
Bron: `docs/superpowers/plans/2026-09-24-fixronde-leesronde-uitvoering.md`, sectie "Wat Lars moet beslissen" (punt 1, 2, 3, 5, 6, 8b) en het amendement `2026-09-24-fixronde-amendement-lars.md` ("Niet in deze ronde").

## 1. Vertrekmaand in de vragenlijst van Loep Vertrek

- Eén optionele vraag in de Vertrek-vragenlijst: "In welke maand ben je vertrokken, of vertrek je?" Maand en jaar kiezen, plus de keuze "Zeg ik liever niet". Overslaan mag.
- Opslag in de bestaande kolom `respondents.exit_month`, geen migratie. Gebruik de bestaande normalisatie (`_normalize_exit_month` in `backend/main.py`); de server valideert de waarde en weigert een ongeldige maand (422), niet stil.
- Alleen bij Loep Vertrek. Loep Behoud en Loep Start veranderen niet.
- Taak 6 van de fixronde (`_uitstroomperiode` in `backend/report_html.py`) leest deze maanden al; die toont nu eerlijk dat de periode ontbreekt.

## 2. Uitstroomperiode alleen als de randmaanden niet herleidbaar zijn

De periode ("maart tot augustus") verschijnt alleen als de vroegste én de laatste maand elk minstens twee personen hebben. Anders laat het rapport de periode weg en zegt waarom, in gewone taal en zonder te noemen hoeveel mensen in welke maand vertrokken. De bestaande grens van vijf bekende maanden blijft daarbovenop gelden. Pas de docstring van `_uitstroomperiode` aan: die beloofde bescherming die de grens van vijf alleen niet gaf.

## 3. "Niets, dit zit hier goed" telt niet mee bij het bepalen van een eenduidige richting

De staat van het richtingblok ("Geen eenduidige richting" tegenover een duidelijke richting) wordt bepaald op de stemmen van wie iets wil. Het aantal niets-stemmen wordt apart gemeld. Dit verandert een staffel: draai de stresstest (`scripts/stresstest_report.py`) en beschrijf in het verslag welke scenario's van staat wisselen en waarom. De bestaande drempels (vloer 3, meerderheid, voorsprong 2) gelden op de inhoudelijke stemmen. Een groep waarin bijna iedereen "niets" kiest, blijft de staat `none_needed` of `split_none` houden zoals nu; alleen de verdeeld-beslissing tussen routes verandert.

## 4. Geen "hierboven" meer na een mogelijke paginabreuk

Waar de weging of de goedgekeurde verdeeld-zin naar de richtingkaart verwijst met "hierboven", wordt dat "bij 'Wat er moet gebeuren'". Zoek alle varianten, ook "boven" in de copy van de richtingstaten in `backend/products/shared/deepening.py`. Laat verwijzingen staan die op dezelfde pagina blijven en dat ook aantoonbaar doen.

## 5. Omvangvakken zonder overlap

Labels uit één bron (`frontend/lib/pricing.ts`): "Minder dan 150 medewerkers", "150 tot 400 medewerkers", "400 tot 1.000 medewerkers", "1.000 of meer medewerkers". "Tot" betekent tot en zonder die grens. Werk alles mee bij wat de labels toont: /producten, de OfferCatalog-JSON-LD, `llms.txt`, het contactformulier en de opgeslagen waarde (oude waarden moeten leesbaar blijven, zoals in Taak 13 van de fixronde). Tests in lockstep.

## 6. Besluittekst in het dashboard begrensd op wat de PDF toont

De besluitvelden in het dashboard krijgen dezelfde grens als de PDF (`BESLUIT_TEKST_MAX`, nu 240), met een zichtbare teller. Haal de grens uit één bron of pin met een test dat frontend (`DECISION_LIMITS` in `frontend/lib/dashboard/campaign-decision.ts`) en backend gelijk zijn. Bestaande langere besluiten blijven leesbaar en worden niet afgekapt opgeslagen; het rapport toont ze zoals nu, met melding.

## 7. Gebruiksgegevens zonder meting na twee jaar weg

Rijen in `suite_telemetry_events` en `case_proof_registry` zonder `campaign_id` worden twee jaar na aanmaken opgeschoond, in `backend/data_retention.py`, met dezelfde regels als de rest: dry-run standaard, één transactie per eenheid, tweede run doet niets, tests op SQLite, en de aantallen in de samenvatting. Bewijs van toestemming voor gepubliceerde cases bewaart Loep buiten de database (punt 8a van het verslag); dat hoeft niet gebouwd te worden.

## Niet in deze ronde

Loep Start, plan 3c, en de overige kandidaten uit de leesronde.
