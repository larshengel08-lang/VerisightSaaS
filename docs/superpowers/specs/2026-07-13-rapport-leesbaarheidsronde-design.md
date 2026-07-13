# Rapport-leesbaarheidsronde — ontwerp

**Datum:** 2026-07-13
**Status:** goedgekeurd door Lars (brainstorm; keuzes A / A-ruim / A / A / A + titelhiërarchie-punt)
**Aanleiding:** eerste-lezer-feedback van Lars + ChatGPT-review in drie rollen (MT-lid / HR-manager / sceptische manager). Rode draad: de inhoud is goed, maar het rapport legt zichzelf niet uit, en de agenda staat vóór het bewijs waar hij naar verwijst.
**Scope:** `backend/report_html.py`, `backend/report_css.py`, samples. Alle drie WeasyPrint-rapporten (exit, retention, onboarding). Geen datalaag-, scoring- of survey-wijzigingen.

De zes directe copy-fixes uit dezelfde feedbackronde (dubbel "vraagt aandacht", Gemiddelde score-label, item→stelling, eNPS in samples, voetregel, segmentconclusie-noemer) zijn al gedaan in commit `826c131a` en vallen buiten deze spec.

## Niet-doelen

- Géén bespreekscript of uitgeschreven vergaderdraaiboek — de begeleide managementbespreking blijft het product. Het "Zo gebruik je dit rapport"-blok (§5) beschrijft de leesroute en het beoogde besluit, niet de gespreksvoering.
- Geen nieuwe analyse of interpretatie; de uitleg-laag (§2) legt bestaande metingen uit, claimt niets nieuws.
- Geen wijziging aan de zes copy-fixes van `826c131a`.
- Survey-vragen en verdiepingssets blijven ongewijzigd (§3 raakt alleen het rapport-label).

## 1. Gespreksagenda naar het slot

De sectie "Eerste managementspoor / Gespreksagenda" verhuist in alle drie renderers van positie 4 (vóór de verdieping) naar direct vóór de appendix. Nieuwe volgorde (retention, alle secties aanwezig): cover → 01 Bestuurlijke read (+gebruiksblok+responsbasis) → 02 Behoudscontext → 03 Overzichtsprofiel → 04 Verdieping (+vervolg) → 05 Werkbeleving → 06 Werkgeversaanbeveling (indien gemeten) → 07 Segmentanalyse → 08 Open toelichtingen → **09 Gespreksagenda** → 10 Appendix → 11 Methodiek. Exit en onboarding volgen dezelfde beweging (hun eigen contextsecties blijven op hun plek).

De hoofdstuknummering is afgeleid (bestaande `_ChapterCounter`), dus de verplaatsing is een kwestie van de `s += _eerste_managementspoor(...)`-aanroep (inclusief de opbouw van de waarom-regels en de verrijkte managementvraag ervóór) later in de sectiereeks zetten. Let op: de variabelen die de agenda voedt (`deep_agg`, `sorted_f`, `priority_fkeys`, `oim`, `fim`) zijn eerder in de renderer al beschikbaar — verplaatsing verandert geen berekeningen.

De twee navy ankers (segmentconclusie 07, agenda 09) komen dichter bij elkaar; dat is acceptabel — de agenda is bewust de finale van het leesdeel.

## 2. Zelfuitleg-laag per sectie

Elke sectie opent (direct onder de nieuwe paginatitel, §6) met een uitlegalinea van **minimaal 2 à 4 zinnen — meer mag**, in heldere, begrijpelijke taal. Uitleg is een vertrouwensdrager, geen disclaimer: toon is uitleggend en zelfverzekerd. Per sectie (retention als voorbeeld; exit/onboarding krijgen inhoudelijk gelijkwaardige varianten in hun eigen termen):

- **Behoudscontext:** wat het behoudssignaal is (samenvattende groepsscore van werkfactoren en werkbeleving), wat de drempels betekenen (onder 5,0 kwetsbaar; 5,0–6,5 aandacht; vanaf 6,5 relatief sterk), dat het een gespreksstartpunt is en geen vertrekvoorspelling, en hoe blijfintentie/vertrekintentie/bevlogenheid zich tot elkaar verhouden (bestaande legendatekst gaat hierin op).
- **Overzichtsprofiel:** wat een factor is (thema van 3 stellingen), wat de banden betekenen, waarom de rangorde belangrijker is dan de absolute kleur.
- **Verdieping (per-factorpagina's, één keer op de eerste):** hoe de verdiepingsvraag ontstond (respondenten met lage scores op dit thema kregen automatisch een vervolgvraag over de reden), en dat de aantallen tellingen van gekozen antwoordopties zijn.
- **Gespreksrichting-blok:** respondenten kozen zelf welke richting het gesprek over dit thema het meest zou helpen — input van de groep, geen enquête-eis; de weging gebeurt in de bespreking (sluit aan op de al herschreven voetregel).
- **Werkbeleving (SDT):** waarom autonomie/competentie/verbondenheid naast de werkfactoren gemeten worden (basisbehoeften die bepalen hoe duurzaam iemand op zijn plek zit; werkfactoren alleen vertellen niet het hele verhaal).
- **Werkgeversaanbeveling (eNPS):** wat de score is (promotors minus criticasters, −100 tot +100) en hoe die zich verhoudt tot het overzichtsprofiel.
- **Segmentanalyse:** wat de tabel toont, waarom kleine groepen gebundeld worden, hoe de responskolom te lezen.
- **Open toelichtingen:** hoe deze geselecteerd zijn (ontvangstvolgorde, geanonimiseerd, geen inhoudelijke selectie of duiding).
- **Appendix:** wat de lezer hier kan controleren.
- **Gespreksagenda:** dat alles hiervoor de onderbouwing is en het gesprek hiér begint.

Plus: **bronregel onder de eerste managementvraag** op de openingspagina, bijv. "Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping." (alleen wanneer de vraag daadwerkelijk uit verdiepingsdata komt — bij de generieke fallbackvraag een neutrale variant "Gebaseerd op de laagst scorende factor.").

Implementatie: uitlegteksten als module-constanten of een kleine helper (`_sectie_intro(...)`) zodat de drie renderers dezelfde teksten delen waar de sectie gedeeld is; per-scan-varianten waar nodig (behoudscontext vs. vertrekcontext vs. checkpointoverzicht). Bestaande korte subtitels gaan op in de nieuwe alinea's (geen dubbele intro's).

## 3. Factorlabel "Groeiperspectief en erkenning" → "Groeiperspectief"

Eén regel in de labelmap van `report_html.py` (`"growth": "Groeiperspectief en erkenning"` → `"Groeiperspectief"`). De drie stellingen meten leren/groeien, investering in ontwikkeling en loopbaanperspectief — erkenning wordt niet gemeten en het oude label was daardoor niet verdedigbaar (ChatGPT-bevinding, door Lars bevestigd). Survey-config (`scoring_config.py`) en alle marketing-surfaces gebruiken al "Groeiperspectief"; dit maakt het rapport consistent. Tests die het oude label pinnen in lockstep bijwerken. Check ook de legacy `report.py`-labelmap alleen als die hetzelfde label bevat voor de drie WeasyPrint-scans (zo niet: niet aanraken).

## 4. Full-bleed chalk

De chalk-achtergrond verhuist van `body` (blok binnen de paginamarges) naar de pagina zelf: `@page { background: #F4F1EA; }` (WeasyPrint ondersteunt page-background). Het "zwevende blok"-effect verdwijnt; de hele binnenpagina is chalk. Cover blijft navy full-bleed zoals nu. Footer (`@bottom-left`/`@bottom-right`) blijft leesbaar (steel op chalk — contrast checken in de render). Witte kaarten (`.theme-card`, `.step` e.d.) en navy ankers behouden hun contrast; geen andere kleurwijzigingen.

## 5. "Zo gebruik je dit rapport"-blok op de openingspagina

Nieuw blok tussen de bestuurlijke read (why-panel) en de responsbasis-band, 4 à 6 zinnen (ruimer mag, §2-toon), met eigen mono-eyebrow ("Zo gebruik je dit rapport"). Inhoud:

1. Wat dit is: een groepsbeeld van de organisatie — geen beoordeling van personen of afdelingen.
2. Leesroute: eerst het beeld (context + profiel), dan de verdieping per thema, achteraan de gespreksagenda — dáár begint het gesprek.
3. Rol van de bespreking: dit rapport wordt besproken in een begeleide managementbespreking; het rapport levert de onderbouwing, de bespreking de keuzes.
4. Beoogd resultaat: aan het eind van de bespreking is er één prioriteit, een eigenaar en een vervolgmoment.

Zelfde blok (met scan-eigen bewoording waar nodig) in alle drie renderers. Dit adresseert expliciet het "weet ik wat er van mij verwacht wordt?"-punt uit de MT-rol van de review, én kondigt de verplaatste agenda (§1) aan zodat de lezer weet dat de opdracht achteraan staat.

## 6. Paginatitel-hiërarchie

Probleem (Lars): op pagina's zonder aparte h2 is het kleine mono-label (11px) de facto de paginatitel — kleiner dan gewone contentzinnen. Onlogisch.

Nieuw hoofdstukopener-patroon: **amber nummer (mono, ongewijzigd) → navy rule → paginatitel in kopstijl** (Inter Tight 800, ~20-22px, ingezet als de bestaande h2-stijl), zonder mono-uppercase-transform. De kleine mono-slabel vervalt als titeldrager:

- Secties die nu alleen een slabel hebben (Overzichtsprofiel, Segmentanalyse, Open toelichtingen, Appendix, Methodiek, Werkbeleving, Werkgeversaanbeveling, Responsbasis-band, Verdieping-pagina's): slabel-tekst wordt de grote titel (normale kapitalisatie: "Overzichtsprofiel", niet "OVERZICHTSPROFIEL").
- Secties met slabel + h2 (Gespreksagenda onder "Eerste managementspoor"; Behoudscontext met "Waar staat behoud onder druk?"): de h2 wordt dé titel; de oude slabel-tekst vervalt of wordt een klein mono-kicker bóven de titel als hij informatie toevoegt (bijv. "Eerste managementspoor" boven "Gespreksagenda" mag blijven als kicker). Geen dubbele koppen meer.
- **"— vervolg"-labels blijven klein mono** (bewust: vervolgpagina's zijn geen nieuwe hoofdstukken). Ook de vervolg-variant krijgt het factorlabel leesbaar, maar zonder groot titelgewicht.

Implementatie: `_ChapterCounter.opener()` krijgt de titel als hoofdargument en rendert het nieuwe patroon; de `slabel`-CSS-klasse blijft bestaan voor vervolg-labels en eventuele sub-labels. De hairline-lijn achter het oude slabel (`.slabel::after`) vervalt bij de nieuwe grote titel (de navy rule is al het lijnelement).

## Testen

- Sectievolgorde-test per scan-type: agenda-sectie ná stemmen/segment en vóór appendix (string-offset-vergelijking op de gerenderde HTML).
- Uitleg-laag: per sectie een assert op een kernfrase van de introtekst; bronregel-test voor de managementvraag (met en zonder verdiepingsdata).
- Label-test: "Groeiperspectief en erkenning" komt in geen gerenderd rapport meer voor; "Groeiperspectief" wel.
- Full-bleed: `@page`-regel bevat de chalk-achtergrond (CSS-test).
- Gebruiksblok: aanwezig op de openingspagina van alle drie scans, vóór de responsbasis.
- Titelhiërarchie: opener bevat de titel in de kopstijl-markup; geen mono-uppercase-slabel meer als enige kop op hoofdstukstarts.
- Bestaande design-tests in lockstep; volledige suite op de 25-failed baseline.

## Validatie

Samples regenereren; WeasyPrint-Docker 3× exit 0 / 0 warnings; volledige per-pagina raster-inspectie (de volgorde-, achtergrond- en titelwijzigingen raken élke pagina); paginatelling rapporteren (verwachting: +ca. 1 pagina door de ruimere uitleg-laag — acceptabel, dichtheid gaat vóór korte lengte per Lars' feedback). PDF's naar `frontend/public/examples/`. Railway-redeploy na push.
