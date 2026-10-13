# Loep Behoud als alternatief voor het grote jaarlijkse MTO

Datum: 2026-10-11
Status: besluiten Lars 11-10 via keuzeformulier plus vier aanpassingen, ontwerp akkoord. Te plannen. **Niet bouwen vóór de polijstronde (`feature/polijstronde`) op main staat.**
Bronnen: marktonderzoek 11-10 (sectie 2), beslissingslog `C:\Users\larsh\CLAUDE.md` (propositiebesluit A, rapport zonder begeleiding, prijsstaffel, richtingvraag), `backend/products/retention/definition.py`.

## 1. Besluit

Route (a), als herpositionering en niet als nieuw product. Loep Behoud wordt verkocht als **alternatief voor het grote jaarlijkse MTO**. De naam blijft Loep Behoud. De vragenlijst, de scoring en de rapportlogica blijven gelijk.

| Keuze | Besluit |
|---|---|
| Route | (a) Behoud positioneren als alternatief voor het MTO, niet hernoemen tot MTO |
| Naam | "Loep Behoud" blijft. Het categoriewoord "medewerkersonderzoek" komt naast de naam. "MTO" alleen in lopende tekst en voor vindbaarheid |
| Inhoud | Vragenlijst blijft zoals hij is. Geen nieuwe onderwerpen |
| Cultuurbeeld | Nu uit het aanbod, met een doorverwijzing naar Loep Behoud. De code blijft. Later de kandidaat voor een brede MTO-variant met de nieuwe rapportlaag, na de eerste klanten |

Voorbeeld van de kernregel: "Loep Behoud · het korte medewerkersonderzoek. Een alternatief voor het grote jaarlijkse MTO."

## 2. Waarom (samenvatting marktonderzoek 11-10)

- **Kopers begroten een MTO, geen behoudsscan.** Een MTO is een terugkerende post (jaarlijks of om de twee jaar) met een bekend woord. Voor een behoudsscan moet je eerst de categorie uitleggen.
- **Het pijnpunt dat kopers het vaakst noemen is opvolging.** Volgens Newcom, Teampeak en Effectory leidt meten zonder zichtbare actie tot cynisme en lagere respons bij de volgende meting. De verdieping, richtingvraag, werkvragen en besluitpagina van Loep zijn daar het antwoord op.
- **Marktband:** doe-het-zelftools €800-3.500 per meting, bureautrajecten €15-25k bij 100-500 medewerkers, enterprise-platforms vanaf ongeveer $20k per jaar. De staffel van Loep valt ertussen. Dit is achtergrond voor Lars, **geen klantcopy** (zie 4.3).
- **Gat dat we eerlijk benoemen:** gevestigde partijen (Effectory, Integron, Culture Amp, Great Place to Work) verkopen een benchmark. Loep heeft geen normdata.
- **OR:** een MTO waarin werkdruk wordt gemeten valt in de gangbare lezing onder art. 27 lid 1 sub d WOR (psychosociale arbeidsbelasting), dus instemming is vaak nodig. Dat is een interpretatie, geen harde regel.
- **Waarom niet (b) of (c):** (b) vraagt per nieuw onderwerp een verdiepingsset, een richtingset, vertaalvragen en een stresstestronde, en geeft drie overlappende producten. (c) laat de koper die op "MTO" zoekt en ervoor begroot liggen, terwijl de site hem nu actief wegstuurt ("Is Loep Behoud gewoon een MTO? Nee.").

## 3. Positionering

- **Belofte:** een groot MTO meet veel en eindigt vaak in een rapport zonder vervolg. Loep Behoud meet wat telt voor of mensen blijven, en zegt waar je begint. Die belofte wordt gedragen door wat het rapport echt doet: verdieping, richtingvraag, werkvragen en besluitpagina. Geen belofte die het rapport niet waarmaakt.
- **Alleen Loep Behoud.** Loep Vertrek en Loep Start krijgen geen MTO-claim. Loep Start wordt nog niet actief verkocht (polijstronde par. 6).
- **Blijft gelijk:** de homepage-h1 ("Wacht niet tot vertrek het signaal is"), de prijsstaffel, de propositie zonder bespreking (besluit A) en "Werkbeeld" als naam van de totaalscore (polijstronde par. 2).

## 4. Copyregels (vast te pinnen in een guardtest)

1. **"MTO" is nooit een productnaam.** Niet "Loep MTO", niet "het Loep-MTO", niet "MTO" in een kop als naam van het product. Wel in lopende tekst, FAQ, metadata, JSON-LD en `llms.txt`.
2. **Geen claim die vervanging of volledigheid belooft.** Niet "vervangt je MTO", niet "volledig MTO", niet "alles wat een MTO meet". Wel "een alternatief voor het grote jaarlijkse MTO".
3. **Geen prijs per medewerker in klantcopy.** De site, `llms.txt`, JSON-LD en Loep_Docs noemen alleen de vaste bedragen van de staffel. Geen "€X per medewerker", geen "per persoon", ook niet als rekenvoorbeeld. Een bedrag per medewerker verschilt per trede (€23-35, €11-30, €7-17) en schept verwarring met licentiemodellen. Het rekenvoorbeeld "zo'n €30 per medewerker bij 150 medewerkers" in de tarievensectie van `/producten` gaat eruit (correctie 12-10: de spec zei eerst ten onrechte dat het al weg was); de vergelijking met een uitbesteed traject blijft. De guardtest houdt het zo. Toegestaan blijven zinnen zonder bedrag, zoals "Geen licenties per medewerker" en "Per afdeling, nooit per persoon".
4. **"Kort" alleen onderbouwd met de echte invultijd.** De invultijd komt uit dezelfde bron die de polijstronde vastlegt voor de vragenlijst (polijstronde par. 4). De MTO-copy neemt het getal uit die bron over, en hardcodet het niet opnieuw als het in code kan. Geen aantal vragen of stellingen. Geen superlatief ("de kortste", "razendsnel", "slechts").
5. **Geen benchmarkclaim.** Ook geen "vergelijk met de markt" of "branchegemiddelde". Toegestaan: "We vergelijken je niet met een gemiddelde. We laten zien waar jij begint." De zin over vergelijken met je eigen vorige meting komt pas als plan 3c live is.
6. **Huisregels:** je/jij, geen em- of en-dashes, geen "begeleid", geen HR-jargon (copy-toon), eerlijkheid als argument en niet als disclaimer.

## 5. Eerlijkheidsgrens: wanneer een groot MTO beter past

Het bestaande blok "Wanneer past een breed MTO beter?" op `/producten` blijft, en wordt herschreven tot een eerlijke keuzehulp. Kies een groot MTO als je:
- een **benchmark** met andere organisaties of je branche nodig hebt;
- onderwerpen wilt meten die Loep Behoud niet meet, zoals **communicatie als eigen onderwerp, de fysieke werkplek en veiligheid of ongewenst gedrag**. Niet "arbeidsomstandigheden": werkdruk valt wettelijk onder arbeidsomstandigheden, en Behoud meet werkdruk (besluit Lars 13-10). Geen derde reden zoals een intern beheerd meetritme (besluit Lars 13-10). Niet "informatie": die komt in Behoud voor als verdiepingsoptie ("Ik mis informatie, context of overdracht") en als richtingoptie (`deepening.py`).

Organisatiegrootte is geen reden: de staffel biedt 1.000 of meer medewerkers op aanvraag aan.

Deze lijst moet kloppen met de vragenlijst. Controleer bij de bouw dat geen genoemd onderwerp er toch in zit en dat geen gemeten onderwerp als "ontbreekt" wordt genoemd: tegen de stellingen, `backend/scoring_config.py` en de verdiepings- en richtingopties in `deepening.py`.

## 6. Surfaces

Alleen copy en routering. Geen wijziging aan vragenlijst, scoring, rapportlogica of database. **Inventariseer bij de bouw opnieuw op de gemergde main**, want de polijstronde verandert dezelfde bestanden. De lijst hieronder komt van main `6b5d3b7f`.

### 6.1 Publieke site
- `frontend/components/marketing/site-content.ts`: de FAQ "Is Loep Behoud gewoon een MTO? Nee…" (r. ~405) draait om naar "Is Loep Behoud een MTO?" met het alternatief-antwoord. Ook "Is Loep Behoud een MTO-vervanger?" (r. ~370) en de zinnen "geen brede MTO" / "geen … MTO-light" (r. ~319, ~363) worden in lijn gebracht, als ze gerenderd worden.
- `frontend/components/marketing/producten-content.tsx`: het categoriewoord bij de sectie Behoud, de regel "Je wilt een eerste keuze, geen breed MTO-project" (r. ~69), en het blok "Wanneer past een breed MTO beter?" (r. ~418, zie sectie 5).
- Homepage (`home-page-content.tsx`): het categoriewoord bij de Behoud-scankaart. De h1 blijft. Andere homepagepunten alleen als de polijstronde (taak 13b) er niet al iets mee doet.
- Metadata, OG en JSON-LD van de homepage en `/producten`, plus de FAQPage-JSON-LD op `/producten`: "medewerkersonderzoek" en "MTO" voor vindbaarheid, binnen regels 4.1 tot en met 4.5. De paginatitel van de homepage blijft.
- `frontend/public/llms.txt`: Loep Behoud beschreven als alternatief voor het grote jaarlijkse MTO. Cultuurbeeld eruit.

### 6.2 Product- en dashboardcopy

**Correctie na inventarisatie (11-10):** het live rapport van Loep Behoud (`backend/report_html.py`) gebruikt `retention/report_content.py` en het backend-trust-contract niet. De voorbeeldrapporten bevatten 0 keer "MTO". De zinnen "geen brede MTO" in de backend staan alleen in de oude ReportLab-route (`backend/report.py`), die Loep Behoud niet meer rendert. Klantzichtbaar is wél de methodiekkaart op de campagnepagina in het dashboard.

- **Klantzichtbaar, moet mee:** `frontend/lib/products/retention/definition.ts`. Die wordt getoond door `MethodologyCard` in `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx` (velden `methodologyText` en `whatItIsNotText`). "Geen brede MTO" wordt "geen breed MTO met benchmark". "Verisight maakt zichtbaar" wordt "Loep maakt zichtbaar".
- **Consistentie, niet klantzichtbaar:** `backend/products/retention/definition.py` (`trust_contract.what_it_is_not`) en `backend/products/retention/report_content.py` (r. ~146 en ~298). Dezelfde wijziging, zodat de backend niet terugpraat als de oude route ooit weer gebruikt wordt. Er hoeven geen voorbeeldrapporten opnieuw gegenereerd te worden. Een guardtest bewijst dat het live rapport geen "MTO" bevat.

### 6.3 Ongerenderde copy
`frontend/lib/seo-solution-pages.ts`, `frontend/lib/sample-showcase-assets.ts`, `frontend/lib/products/pulse/definition.ts` en `backend/products/pulse/definition.py` noemen ook "geen brede MTO". Verify-before-touch: aanpassen alleen als de tekst ergens voor een klant of crawler zichtbaar wordt. Anders laten staan en in het uitvoeringsverslag noemen.

## 7. Cultuurbeeld uit het aanbod

### 7.1 Eerst een read-only controle op productie (gate)
Vóór de redirect wordt gebouwd, draait de bouwsessie alleen-lezend tegen productie:
- het aantal campagnes met `scan_type = 'culture_assessment'`, met status (lopend, gesloten);
- het aantal leads in `contact_requests` met een Cultuurbeeld-route-interest (`culture_assessment` of de label- of sleutelvariant die de contactroute gebruikt, eerst opzoeken in `CONTACT_ROUTE_OPTIONS` en `CONTACT_ROUTE_LABELS`).

Geen schrijfactie. Alleen tellingen in het verslag, geen namen, e-mailadressen of vrije tekst. Zijn er **lopende** Cultuurbeeld-campagnes, dan stopt de bouw van sectie 7 en legt de sessie dat aan Lars voor. Gesloten campagnes en oude leads blokkeren niet: daarvoor geldt 7.3.

### 7.2 Redirect en zichtbaarheid
- `/producten/cultuurbeeld` krijgt een **308 naar `/producten#loep-behoud`** in `next.config.ts`, net als de andere oude productpagina's. Controleer het echte anker op de gemergde main.
- Weg uit: sitemap, `llms.txt`, nav en solutions-dropdown, homepage-JSON-LD als hij er nog in staat, de keuzelijst in het contactformulier (`CONTACT_ROUTE_OPTIONS`), en de route-inferentie in `frontend/lib/contact-funnel.ts` (r. ~407). Een brede vraag over cultuur, betrokkenheid of werkbeleving wordt dan herkend als Loep Behoud.
- De OG-afbeelding van Cultuurbeeld (`producten/[slug]/opengraph-image.tsx`) mag blijven. Hij is na de redirect onbereikbaar.

### 7.3 Wat blijft (bestaande data leesbaar)
- **De code blijft staan:** product, definitie, dashboard, ReportLab-rapport, registry, `scan_type`, rapportroutes en de beheer-campagneflow. Een bestaande Cultuurbeeld-campagne blijft werken en haar rapport blijft downloadbaar.
- **Oude leadlabels blijven leesbaar in beheer.** `CONTACT_ROUTE_LABELS` (`frontend/app/api/contact/route.ts`), de labelweergave in `components/dashboard/lead-ops-table.tsx` en eventuele andere labelmaps houden de Cultuurbeeld-sleutel en tonen hem als "Loep Cultuurbeeld". Alleen de optie verdwijnt uit wat een bezoeker kan kiezen. Een test pint dat een lead met de oude sleutel een leesbaar label krijgt, en geen ruwe sleutel of "onbekend".
- **Nieuwe Cultuurbeeld-campagnes:** of de aanmaakflow in beheer Cultuurbeeld nog aanbiedt, verandert niet in deze ronde. Lars maakt organisaties en campagnes zelf aan.

## 8. OR-notitie (nieuw document)

Eén pagina in `Loep_Docs/` (buiten de repo, `C:\Users\larsh\Desktop\Business\Loep_Docs\`), zelfstandige HTML in Loep-huisstijl, zoals de offerte- en factuurtemplates. Voor de HR-manager om aan de OR te geven. Inhoud, alleen feiten over de meting:
- welke onderwerpen worden gevraagd (de zes werkonderwerpen, werkbeleving, bevlogenheid, blijf- en vertrekintentie, aanbevelingsvraag, één open vraag), plus de verdieping en de richtingvraag;
- de invultijd uit dezelfde bron als regel 4.4;
- anonimiteit en drempels: rapportage per groep, afdelingen pas vanaf de bestaande minimumaantallen, namen in open antwoorden automatisch verwijderd voor zover herkend, Loep ontvangt geen namen of e-mailadressen van respondenten;
- de bewaartermijn: twee jaar na het sluiten van de meting;
- de zin dat werkdruk wordt gemeten, en dat de OR daarom vaak instemmingsrecht heeft (art. 27 lid 1 sub d WOR). **Geen juridisch advies**: geen "u bent verplicht", wel "bespreek met je OR of instemming nodig is".

Alle getallen in de notitie (drempels, invultijd, bewaartermijn) worden bij de bouw gecontroleerd tegen de code en de juridische pagina's, niet uit deze spec overgenomen.

In de intake (offerte-template of intakechecklist in `Loep_Docs/`) komt de vraag "Is de OR geïnformeerd, of is instemming geregeld?".

## 9. Loep_Docs in lijn

One-pager, pitch, FAQ en verantwoording in `Loep_Docs/`: Loep Behoud met het categoriewoord en de alternatief-zin, Cultuurbeeld eruit, geen prijs per medewerker (regel 4.3). Exporteer PDF-versies opnieuw waar die bestaan.

## 10. Beslissingslog

Na de merge komt er een entry in `C:\Users\larsh\CLAUDE.md` met: de route (a) als herpositionering, de copyregels 4.1 tot en met 4.5, en dat Cultuurbeeld de kandidaat is voor een brede MTO-variant met de nieuwe rapportlaag, na de eerste klanten.

## 11. Niet in scope

- Nieuwe onderwerpen in de vragenlijst (communicatie, tevredenheid).
- Normdata of een benchmark.
- Een naamswijziging van Loep Behoud.
- Wijzigingen aan rapportlogica, vragenlijst, scoring of database (alleen de copy uit 6.2).
- Het verwijderen van Cultuurbeeld-code.
- De zin over vergelijken met de vorige meting (komt met plan 3c).
- De homepage-h1 en de paginatitel.

## 12. Volgorde en verificatie

1. **Pas bouwen als `feature/polijstronde` op main staat.** Die raakt dezelfde bestanden (`site-content.ts`, `producten-content.tsx`, `retention/definition.py`, `retention/report_content.py`, privacyverklaring). De bouw start van de gemergde main.
2. **Vóór de go-live-check.** Deze ronde gaat mee in de go-live-check, niet erna.
3. **Gates:** tsc en vitest gelijk aan de baseline van de gemergde main, met faalset-diff. Pytest gelijk aan de baseline met identieke faalset. Productiebuild groen.
4. **Nieuwe tests:**
   - guardtest copyregels: geen "MTO" als productnaam, geen vervangings- of volledigheidsclaim, geen prijs per medewerker (een eurobedrag in dezelfde zin als "per medewerker", "p.p." of "per persoon"; zinnen zonder bedrag zoals "Geen licenties per medewerker" en "nooit per persoon" mogen) op de publieke marketingsurfaces en in `llms.txt`, geen benchmarkclaim, geen "geen brede MTO" meer op gerenderde surfaces;
   - redirecttest: `/producten/cultuurbeeld` geeft 308 naar het Behoud-anker;
   - de leadlabeltest uit 7.3;
   - de contact-funnel-inferentie: een brede cultuurvraag landt op Loep Behoud.
5. **Rapport:** het live rapport verandert niet (zie 6.2). Bewijs dat met een test die een Behoud-voorbeeldrapport via `report_html.py` rendert en controleert dat er geen "MTO" in de tekst staat. Er hoeven geen voorbeeldrapporten opnieuw gegenereerd te worden.
6. **Browsercheck** van home, `/producten` (desktop en 375 px) en de redirect. Ook de methodiekkaart op de campagnepagina van testklant A (dashboard), volgens `docs/testklant.md`.
7. **Backendversie:** de backendwijzigingen uit 6.2 zijn niet klantzichtbaar, maar gaan wel mee in een Railway-deploy van "Loep main", zodat code en productie gelijk lopen. De go-live-check draait op die backendversie: controleer vooraf met `GET /api/health` dat de live git-sha de merge-commit van deze ronde bevat. Vercel deployt de frontend, inclusief de dashboardkaart.
8. **Niet mergen of pushen** zonder akkoord van Lars.
