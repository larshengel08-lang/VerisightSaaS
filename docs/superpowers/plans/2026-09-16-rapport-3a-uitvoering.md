# Plan 3a: uitvoeringsverslag

Plan: `docs/superpowers/plans/2026-09-16-rapport-3a-mtvel.md`. Spec: `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` (onderdelen 1, 2, 6, 7 en de responsnoemer; alle afwijkingen staan daar onder "Afwijkingen bij plan 3a"). Branch `feature/rapport-3a`, worktree `.worktrees/rapport-3a`. Uitgevoerd 17-19 september 2026 via subagent-driven-development: per taak één implementer, daarna een spec-compliance-review en een codekwaliteitsreview, met herreviews tot beide akkoord waren. Niet gemerged, niet gepusht.

## Baselines

| | Voor (4da661f1) | Na (HEAD) |
|---|---|---|
| Backend | 25 failed / 1115 passed / 5 skipped | 25 failed / 1393 passed / 11 skipped |
| Faalset | `plan3a-baseline-failset.txt` | identiek per testnaam (`diff` leeg) |
| Python 3.11-guard | groen | groen (venv is 3.11.9, gelijk aan Railway) |
| Nieuwe tests | | +278 |

De zes extra skips zijn PDF-tests met `requires_weasyprint`/`requires_pymupdf`: lokaal geen GTK. Ze zijn tijdens de fixrondes via een Docker-shim gedraaid (12 van 13 groen; `test_pdf_heeft_geen_pagina_onder_veertig_procent[exit]` faalt op p.3 van zijn eigen fixture, 38%).

## Matrix (21 stresstest-scenario's)

| Vraag | Na ronde 2 | Na plan 3a |
|---|---|---|
| Q1 antwoord op p.02 | 19✓/2~/0✗ | 19✓/2~/0✗ |
| Q2 startpunt | 19✓/2~/0✗ | 19✓/2~/0✗ |
| Q3 wat moet gebeuren | 10✓/9~/2✗ | 10✓/10~/1✗ |
| Q4 holle pagina's | 0✓/0~/21✗ | 21✓/0~/0✗ |
| Q5 tegenspraak | 12✓/7~/2✗ | 19✓/2~/0✗ |
| Q6 overclaim | 16✓/3~/2✗ | 17✓/3~/1✗ |

Details, de kop van pagina twee per scenario en de bevindingentabel: `docs/rapport-stresstest-2026-09-10.md`, secties "Na plan 3a", "Fixronde na de WeasyPrint-render", "Fixronde 2" en "Fixronde 3".

Resterende kruisjes: Q3 op 20 (Loep Start heeft nog geen verdieping/richtingvraag, v1.1) en Q6 op 07 (werkbeleving en eNPS verschijnen ook onder de tien antwoorden; B20 deels).

## PDF-validatie (WeasyPrint-Docker)

- Alle 21 scenario's en de drie voorbeelden: exit 0, 0 warnings, 0 em-dashes in de tekstlaag.
- `scripts/check_pdf_report.py` (nieuw, taak 6): OK op alle 21 scenario's, op het voorbeeld Loep Behoud en op het voorbeeld Loep Start. **Voorbeeld Loep Vertrek: NIET OK op één bevinding**, de appendixstaart (p.13, 36%, grens 40%). Zie "Besluit voor Lars".
- Pagina's: Loep Vertrek 15, Loep Behoud 17, Loep Start 11.
- Herhaalde tabelkop bij een geforceerde paginabreuk (ronde 2 punt c): bewezen op een kopie van 06 (ranglijst, afdelingstabel, drempeltabel).

## Afwijkingen van het plan, en waarom

Alle afwijkingen staan uitgebreid in de spec. De belangrijkste:

1. **Omgeving.** Main stond op `e0a95df8`, niet op `f28b0a7d`. Plan, spec en koude leesronde stonden untracked in de hoofdmap en zijn in de baselinecommit meegenomen.
2. **Meetdatums (taak 1).** `closed_at` is een UTC-timestamp; het plan pinde een test die de UTC-dag toonde (een meting die om 00:30 sluit kreeg de dag ervoor). Nu omgerekend naar Nederlandse tijd met een eigen zomertijdregel, omdat `tzdata` toen niet in het venv of op Railway stond.
3. **Blok 2 en de kop (taak 2, 3).** Planzinnen die onwaar konden zijn, zijn aangepast: "Ook de blijfintentie" na "Geen onderwerp scoort kwetsbaar" wordt "Wel is"; "niet vastgelegd" bij een te laag vastgelegd aantal wordt een neutrale zin; een gelijkspel over meer dan vijf vertrekredenen wordt niet meer afgekapt; de noemer van een vertrekreden is wie een reden gaf; gedeelde laagste scores met telwoord en komma's in plaats van "A en B en C" (labels bevatten zelf "en"); verschillen op getoonde scores ("0,1 punt", niet "0,02 punt" tussen 4.9 en 5.0).
4. **Pagina twee (taak 4, 5, 6).** Het gebruiksblok bleef tot taak 5 in het leidraadslot (twee tests pinden de leesroute); elke leidraadbelofte hangt aan de gate van de sectie zelf; Loep Start beloofde drempels die zijn methodiekpagina niet had (na taak 11 opgelost).
5. **Eén startpuntverhaal (taak 7).** Eén gate (`_segment_startpunt`) in plaats van een tweede kopie; Loep Start leest het startpunt uit één bron; de brugzin kreeg een derde variant, is bandbewust en kwalificeert net als het navy blok; de restgroepnoemer telt nu afdelingen zonder respons mee (was 6/8 = 75%, is 6/14 = 43%).
6. **Paginavulling (taak 8).** De tweekolomsappendix spaarde geen pagina en maakte de staart leger; teruggedraaid. Werkbeleving twee kolommen alleen als er per kaart iets te halveren valt.
7. **Tellingen en drempels (taak 9-11).** Anders-blok strenger dan het plan (staffel op teksten, vloer van 2, niets zonder teksten); vaste tellingsvorm met noemerlabel dat zegt wie de noemer is; niet-sluitende ketens zichtbaar gedegradeerd in plaats van een harde fout (versiedrift is bereikbaar en een harde fout breekt een klantdownload); drempeltabel volgt per rij de sectie die hij beschrijft.
8. **Taalronde (taak 13).** De plantabel schreef "Geen uitspraken over oorzaken" en "geen advies over maatregelen" voor; dat sprak de vertrekreden en het blok "Wat er moet gebeuren" tegen. Nu: "Loep stelt zelf geen oorzaken vast: de redenen in dit rapport komen van je mensen" en "Geen kant-en-klaar actieplan: wat er gebeurt, beslist het MT". **Lars: bekijk deze formulering.**
9. **Taak 14 in delen en drie fixrondes.** De Docker-engine was twee dagen onbereikbaar; taken 5-13 zijn daarom op HTML en een Chromium-benadering gevalideerd, niet op een echte PDF. De eerste echte render (deel B) liet zien dat `check_pdf_report.py` op geen enkel bestand OK gaf: werkbeleving viel rechts van het vel (20 van 21 scenario's), pagina twee liep over in 10 van 24 renders, losse pagina's met alleen de segmentconclusie, en het controlescript zelf vergeleek hoofdlettergevoelig en mat daardoor niets. Die zijn in drie fixrondes opgelost, telkens gemeten op echte renders.
10. **Na-fixes buiten de letter van het plan.** Het overzichtsprofiel noemde één laagste onderwerp bij een gedeelde laagste score; Loep Vertrek noemde de hoofdredentelling "als vertrekreden genoemd" (Beloning stond 18× als meespelend maar 0 in de kolom); Loep Start noemde een gedeelde laagste "tweede laagste score"; de verdiepingsketen gebruikte "wie hier laag scoorde" voor een andere regel dan "onder de 5".

## Wat de reviews vonden

Elke taak kreeg een spec- en een codekwaliteitsreview; vrijwel elke codekwaliteitsreview vond iets dat anders in een klant-PDF was beland. Een greep:

- Taak 1: sluitdatum een dag te vroeg (UTC-dag).
- Taak 2: "Ook de blijfintentie" na "Geen onderwerp scoort kwetsbaar"; gelijkspel afgekapt op vijf redenen.
- Taak 3: een onderwerp tegelijk "laagste" en "hoogste" bij een vlak profiel; Loep Start "0,0 punt" als regressie van de eigen fix.
- Taak 4: spreidingscel "0 van de 45" als reden voor het startpunt; de vertrekreden drie keer met hetzelfde getal op p.02.
- Taak 5: leidraad beloofde toelichtingen op een pagina die "Te weinig verdiepingsantwoorden" zegt.
- Taak 6: het controlescript zei OK als alle paginaverwijzingen leeg renderden, en een module-import zonder requirement kon de hele testcollectie (en daarmee de faalset-gate) omleggen.
- Taak 7: brugzin "springt eruit / neem als tweede punt" bij een relatief sterk thema; restgroepnoemer 75% i.p.v. 43%.
- Taak 9: Anders-blok met privacybelofte terwijl niemand iets schreef.
- Taak 10: noemerlabel fout in 29 cellen over 15 scenario's ("27 van de 62 bij wie dit het laagst scoorde" drie regels boven "76 hadden dit als laagste").
- Taak 11/12: driftmelding die mensen "zonder vraag" noemde die wel antwoordden.
- Eindreview: dezelfde "laag" voor twee regels in één rapport; anonimiseringslabel dat "locaties" beloofde die de anonymizer niet weghaalt.

## Bewust niet gedaan

- Werkvragen, besluitpagina, `campaign_decisions`, vervolgmeting: plan 3b/3c.
- Loep Start-verdiepingsset (v1.1).
- `generated_at` gebruikt nog de UTC-dag (zelfde randgeval als de sluitdatum; alleen de datum op de cover).
- "n=60"/"(n=17)" in appendix en afdelingsblokken, en "Frictiescore" op p.02 van Loep Vertrek: nog jargon, raakt meer dan één plek.
- Observatie 5 (verdiepingsonderwerpen zonder verdiepingsdata verschijnen met alleen hun stellingen) en observatie 7a (enkelvoud bij een gelijkspel in de relatiekaart van Loep Vertrek).
- Twee negatieve marges in de CSS (`.sec.seg-status`, `.sec.flow.verd.verd-eerste`) zijn gemeten en werken, maar hangen af van de marge van het blok ervoor.
- `_nl_tijd` (eigen zomertijdregel) kan na de merge met main vervangen worden door `ZoneInfo`, want klantsuite-2b zette `tzdata` in `requirements.txt`.
- Na de merge bestaan drie manieren waarop een onbekende optiesleutel wordt afgehandeld (KeyError, ruwe sleutel, KeyError); vandaag onbereikbaar, kies één lijn bij de eerste optie-hernoeming.

## Koude leesronde light (voorbeeldrapport Loep Behoud, 17 pagina's)

Gelezen als HR-manager zonder uitleg, tegen de drie blokkerende gaten uit `docs/rapport-koude-leesronde-2026-09-16.md`:

- **B1, blijfintentie onbenoemd: dicht.** De kop op p.02 zegt nu "Ook de blijfintentie is kwetsbaar: 3.9/10, 25 van de 39 zitten onder de 5", en de cijferrij zet hem als eerste cel met "kwetsbaar punt". Rest: op p.03 staat bij Blijfintentie nog geen bandlabel (de drie andere signalen hebben er een), en op p.04 krijgt de blijfintentiestrook geen duidingszin terwijl de twee strooken eronder er wel een krijgen.
- **B2, twee startpunten die elkaar niet kennen: dicht.** De brugzin staat op p.02 en onder de ranglijst: "Organisatiebreed begint het gesprek bij Groeiperspectief. Bij Operations springt Werkdruk en herstelruimte eruit (4.9/10); bespreek dat voor die afdeling na het startpunt." Het afdelingsblok heet "Waar het per afdeling begint" en de cover "Waar het gesprek begint".
- **B3, geen brug van keuze naar besluit: open, zoals gepland (plan 3b).** Het besluitblok is nog drie invulregels; bij werkdruk staat "Geen eenduidige richting" zonder koppeling aan de meest gekozen toelichting op p.07 ("Er is te weinig ruimte om te herstellen", 50%), terwijl de grootste richtinggroep (30%) daar precies op aansluit.

Wat verder opviel: p.02 is nu echt het MT-vel (kop, cijfers met oordeel, waarom, opener, 45-minutenleidraad met paginanummers, meetgegevens met datums); elke telling heeft een noemer; de drempeltabel legt elke drempel uit. Kleine rest: p.17 is een dun laatste vel met twee uitlegblokken; het besluitblok op p.13 zegt "Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is", wat zonder plan 3c vaag blijft.

## Besluit voor Lars

1. **Appendixstaart Loep Vertrek (36%, grens 40%).** Binnen de regels niet eerlijk te halen. Mag een staartpagina van de appendix een uitzondering op de vullingsregel zijn? Nu staat er geen uitzondering en is `MIN_FILL` 0,40.
2. **Formulering "Wat dit rapport niet doet"** (zie afwijking 8).

## Na merge

- **Railway-redeploy nodig**: alle wijzigingen zitten in de Python-rapportcode. Geen DB-migratie.
- De stellingteksten B4 en B12 in `backend/products/{exit,retention}/definition.py` zijn typografisch aangepast (dubbele punt i.p.v. streepje, trema); lopende metingen tonen na de redeploy die nieuwe tekst.
- Vercel deployt de geregenereerde voorbeeld-PDF's in `frontend/public/examples/`.
- Proefmerge met main (53 commits verder, incl. klantsuite-2b): geen conflicten.
