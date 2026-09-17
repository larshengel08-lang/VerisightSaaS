# Klantsuite 2a: levenscyclus en drempels: uitvoeringsverslag

Datum: 2026-09-17
Branch: `feature/klantsuite-2a` (worktree `.worktrees/klantsuite-2a`), vanaf main `e0a95df8`. Niet gemerged, niet gepusht.
Plan: `docs/superpowers/plans/2026-09-16-klantsuite-2a-levenscyclus.md`
Spec: `docs/superpowers/specs/2026-09-16-klantsuite-design.md`, alleen blok D (par. 4) en blok E (par. 5). Van blok G en H is niets gebouwd.

Uitgevoerd via subagent-driven-development: per taak één verse implementatie-subagent, daarna een spec-review en een codekwaliteitsreview. Elke bevinding ging terug naar dezelfde implementer en kreeg een herreview. Na taak 8 volgde een review van de hele branch; die leverde nog vijf fixcommits op. Taak 0 en 9 heeft de coördinator zelf gedaan.

## Wat er nu werkt

- **Stap 1 van de wizard** vraagt startdatum, sluitdatum (standaard start + 21, min + 7, max + 90), herinnering (3, 5, 7 dagen of geen) en aantal deelnemers, met een toelichting per veld en per scan. De checkbox "Link getest" is weg. Fouten zijn Nederlands, in de browser én op de server. Minimaal 10 deelnemers, 5 per afdeling.
- **Terug naar stap 1** kan tot aan de lancering; na herladen opent de wizard op stap 1 met de opgeslagen waarden.
- **"Ja, verstuurd"** opent een eigen dialoog met de gevolgen, en zegt het als er nog niets gekopieerd is.
- **De tijdlijn** (start, herinnering, sluitdatum, met datums) staat op elke kaart van een lopende meting en gedimd in stap 3.
- **"Meting sluiten"** staat op elke lopende meting en opent één dialoog: boven de drempel "staat het rapport klaar", onder de drempel de keuze "Twee weken verlengen" of "Toch sluiten", na drie keer verlengen alleen nog sluiten.
- **Verlengen** zet de sluitdatum op max(vandaag, sluitdatum) + 14, maximaal drie keer, geteld via auditevents.
- **Herinnering overslaan** is een echte actie. De herinneringskaart verschijnt pas op de herinneringsdag en biedt onderwerp en bericht apart, elk met een eigen kopieerknop.
- **Gesloten onder de drempel** is een eindtoestand met een mailknop naar Loep.
- **Uitnodiging en herinnering** zijn ondertekend met de organisatienaam en noemen de scannaam niet meer.
- **Het beheerformulier** vult per afdeling het aantal medewerkers en anders het aantal in de doelgroep voor.

## Baselines

| Meting | Voor (main `e0a95df8`) | Na (`de7a8547`) |
|---|---|---|
| `npx tsc --noEmit` | 133 | 133 |
| `npx vitest run` falende tests | 61 | 60 |
| `npx vitest run` geslaagde tests | 1177 | 1332 |
| `npm run build` | exit 1 zonder `RESEND_API_KEY` (omgeving) | exit 0 met dummy `RESEND_API_KEY` |

Faalset per testnaam vergeleken (`diff baseline-fails.txt final-fails.txt`):

```
43d42
< lib/dashboard/dashboard-state-resolver.test.ts > resolveDashboardState State 0 — no campaign
```

Precies de test die het plan voorspelde (herschreven in taak 5). Geen enkele `>`-regel: nul nieuwe falende tests. `app/(dashboard)/beheer/health/page.test.ts` laadt in beide runs niet (bekende wisselvalligheid) en staat in beide lijsten.

**Build.** `frontend/.env.local` bevat geen `RESEND_API_KEY`. Zonder die sleutel breekt `npm run build` af op `/api/internal/progress-nudge` ("Missing API key"); dat is op main hetzelfde. Met `RESEND_API_KEY=re_dummy_build_only` in de omgeving (niet in een bestand) slaagt de build.

## Commits (24)

| Taak | Commits |
|---|---|
| 1 Drempels | `4cfe373e` |
| 2 Stap 1 met sluitdatum en herinnering | `f8c7bf33`, fixes `1ba403f3`, `871320f3` |
| 3 Terug naar stap 1, lanceerdialoog | `b334e443`, fix `5134d94a` |
| 4 Tijdlijn | `aacbd2f0`, fix `41f7b96e` |
| 5 Sluiten, verlengen, overslaan | `fbb1b6cb`, fix `bd31fc97` |
| 6 Herinneringskaart | `98e9adde`, fixes `557a1420`, `5b1639e7` |
| 7 Ondertekening | `034b9341`, fix `1b0da9bd` |
| 8 Beheerformulier | `b538753d`, fix `af44ffa0` |
| Review hele branch | `e363be1b`, `cd84199b`, `f7eca584`, `f5a0c7cf`, `87e75970` |
| Browsercheck | `de7a8547` |
| 9 Documenten | deze commit |

Het plan verwachtte negen commits; het zijn er 24 omdat elke reviewbevinding een eigen fixcommit kreeg.

## Afwijkingen van het plan

1. **Rapportdrempel per scan in plaats van een vaste 10.** De tijdlijnregel, de sluitdialoog en de eindtoestand gebruiken `getResponseActivationThresholds(scanType).insightMin`: 10, maar 30 voor culture_assessment. De spec schrijft "10", maar voor culture_assessment zou het rapport bij 10 tot 29 nooit komen terwijl het scherm het belooft. De drempel van 10 deelnemers bij het uitnodigen is wél vast (zie "Bewust niet gedaan").
2. **Stap 1 zit op slot na lancering of sluiting** (`saveLaunchSetupAction`, `saveSegmentDepartmentsAction`). Het plan had geen server-side slot; een server action is een publiek POST-endpoint, dus een eigenaar kon de sluitdatum op een lopende meting herschrijven en de verleng-limiet omzeilen.
3. **Een opgeslagen startdatum in het verleden blijft geldig.** De wizard opent altijd op stap 1 en wees elke datum vóór vandaag af. Wie gisteren stap 1 opsloeg maar nog niet op "Ja, verstuurd" klikte, moest dan een onware startdatum invullen. `validateSchedule` accepteert nu precies de opgeslagen datum, en eist daarbij een sluitdatum ná vandaag.
4. **`confirmLaunchAction` controleert stap 1 opnieuw**, is idempotent en kan niet twee keer tegelijk schrijven. De oude "Sla eerst stap 1 op"-check kon nooit afgaan (een trigger maakt het delivery record altijd aan), en een oud tabblad kon een meting starten met een lege of verlopen planning, waarna stap 1 op slot zat.
5. **De tijdlijn volgt dezelfde herinneringsregel als de kaart** (`isReminderHandled` in het nieuwe `lib/dashboard/reminder-event.ts`, afgeleid van `isReminderDue`; `reminder-due.ts` zelf is niet aangeraakt). Anders kon de kaart "Vandaag: stuur de herinnering" tonen terwijl de tijdlijn "Verstuurd op" zei. Een startdatum in de toekomst heet "Uitnodiging gepland".
6. **Verlengen faalt luid.** Een mislukte telling laat de pagina falen (zoals `statsError`), en als het auditevent na het verschuiven van de datum mislukt, zet de actie de datum terug. Anders telde de verlenging niet mee en bleef de knop staan.
7. **Kopiëren meldt een geweigerd klembord**, op de herinneringskaart én in de wizard. De plancode liet bij een fout toch "Gekopieerd ✓" zien en ontgrendelde de bevestigknop. Nu pas na een geslaagde kopie, of na een handmatige Ctrl+C met het hele veld geselecteerd. De herinnering vraagt dat onderwerp én bericht gekopieerd zijn, en zonder surveylink verschijnt een melding in plaats van een bewerkbare tekst.
8. **Toelichting bij de sluitdatum herschreven.** De spec zegt "Na deze datum kan niemand meer invullen", maar niets dwingt de sluitdatum af: de backend kijkt alleen naar `is_active`, er is geen cron. Nu: "Op deze datum vraagt Loep je de meting te sluiten of te verlengen. Drie weken is gebruikelijk; verlengen kan met twee weken per keer."
9. **Stap 2 bouwt de uitnodiging opnieuw op** als de afdelingslinks na "Terug naar stap 1" veranderen, met een melding als eigen tekst is vervangen. Zonder dit bleven dode afdelingslinks in de tekst staan.
10. **Plancode met een zelfreferentiële guard.** Het docstring van `ConfirmDialog` bevatte `browser-confirm()`, wat de eigen `confirm(`-guardtest liet falen; alleen het commentaar is herschreven.
11. **Sluitdialoog telt met `MAX_EXTENSIONS`** in plaats van het woord "drie".
12. **Commitattributie.** Eén commit van een Sonnet-subagent had een andere Co-Authored-By-regel; de berichten zijn herschreven met `git filter-branch --msg-filter` (alleen de berichten, de bestanden zijn identiek, de branch was nooit gepusht). Daardoor wijken de SHA's vanaf taak 3 af van wat subagents in hun rapporten noemden.

## Wat de reviews vonden

Per taak vonden de codekwaliteitsreviews echte defecten in plancode die de spec-review als "conform" had goedgekeurd:

- **Taak 1:** de self-send-config-route valideert bij elke PATCH het opgeslagen aantal. Een bestaande campagne met 5 tot 9 deelnemers kan daardoor niet meer bewerkt worden. Niet opgelost (zie hieronder).
- **Taak 2:** gisteren opgeslagen startdatum blokkeert (afwijking 3); geen slot na lancering (afwijking 2); de sluitdatum-update gaf stil succes bij 0 rijen onder RLS; een opgeslagen standaard-sluitdatum volgde de startdatum niet meer; een foutmelding in segmentmodus zei twee keer "Probeer opnieuw".
- **Taak 3:** de dialoog pakte bij elke herrender de focus terug, gaf de focus niet terug, had een vaste id, en "Terug naar stap 1" bleef klikbaar tijdens de lancering.
- **Taak 4:** tijdlijn en kaart spraken elkaar tegen over de herinnering; de rapportregel beloofde 10 bij culture_assessment; een toekomstige startdatum heette "verstuurd".
- **Taak 5:** genegeerde telfout, verlenging die niet meetelde na een mislukt auditevent, `run()` zonder try/catch (knoppen bleven uitgeschakeld), overslaan op een gesloten meting.
- **Taak 6:** valse kopieerbevestiging, de "geen surveylink"-tekst werd een bewerkbaar onderwerp, alleen het onderwerp kopiëren ontgrendelde de bevestiging, de kopieerstatus bleef staan na een nieuwe tekst.
- **Taak 7:** een afzendernaam van alleen spaties won van de organisatienaam.
- **Taak 8:** na een mislukte tweede schrijfactie kon opnieuw klikken een dubbele campagne maken.
- **Review hele branch:** afwijkingen 4, 8 en 9, plus de melding over vervangen tekst die te vroeg verdween.

## Browsercheck (17 september 2026)

Lokale frontend uit de worktree op `http://localhost:3000`, tegen productie-Supabase via de gekopieerde `.env.local`, ingelogd met een verse `--login-link`. Testklant eerst `--dry-run` (geslaagd), dan `--reset`. De seed lanceert campagne B op 13 september, dus dit was **dag 4 na de seed-lancering**: de herinnering stond op 18 september en de herinneringskaart was nog niet aan de beurt.

Schermafbeeldingen (headless Chromium via Playwright, mailadres gemaskeerd) staan in [`docs/testklant/klantsuite-2a/`](../../testklant/klantsuite-2a/). Ze zijn na een tweede reset opnieuw gemaakt, zodat ze de hele flow vanaf de uitgangssituatie tonen.

| # | Stap | Uitkomst |
|---|---|---|
| 1 | `/dashboard`, campagne B | ✅ "Campagne loopt", "6 van 30 ingevuld", tijdlijn met "Uitnodiging verstuurd 13 september 2026", "Herinnering 18 september 2026", "Meting sluit: Nog niet ingesteld", knop "Meting sluiten", geen herinneringstekst. (`01-dashboard-b-desktop.png`) |
| 2 | Sluitdialoog en verlengen op B | ✅ Tekst exact volgens spec; Escape sluit; focus op de veilige knop. Verlengen: 1 oktober, 15 oktober, 29 oktober. Vierde poging: "Je hebt de meting al 3 keer verlengd; verlengen kan niet meer." met alleen "Annuleren" en "Toch sluiten". (`02`, `03`) De eerste poging faalde met "Verlengen mislukt. Controleer je verbinding en probeer het opnieuw.": lokaal ontbrak `RESEND_API_KEY`, waardoor de actiemodule niet laadde. Omgevingsprobleem; met een dummysleutel werkte het. De klant zag wel een zichtbare fout. |
| 3 | Herinnering overslaan | ⏭️ Niet in de browser getest: op dag 4 is de herinnering nog niet aan de beurt, dus de kaart met "Geen herinnering versturen" verschijnt niet. Gedekt door de resolver- en actietests (`dashboard-actions.lifecycle.test.ts`). |
| 4 | Wizard campagne C, stap 1 | ✅ Toelichtingen bij alle velden, geen checkbox. Startdatum vandaag geeft sluitdatum 8 oktober (+21) en herinnering "Dat is op 22 september 2026". 3 deelnemers: "Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport." Gisteren: "Kies een startdatum vanaf vandaag." 30: stap 2 opent. (`04`, `05`) |
| 5 | Stap 2, terug, herladen | ✅ "Terug naar stap 1" behoudt de waarden; na herladen opent stap 1 met 17 september, 8 oktober, 5 dagen, 30. Uitnodiging eindigt op "Met vriendelijke groet,\nTEST Loep Testklant", zonder "(Loep Vertrek)". Stap 3 toont de gedimde tijdlijn met de drie datums en de regel over minimaal 10. (`06`) |
| 6 | "Ja, verstuurd" | ✅ Zonder kopiëren meldt de dialoog "Je hebt nog niets gekopieerd"; "Nog niet" sluit hem. Het klembord is in het browserpaneel en in headless Chromium geweigerd. Daarbij bleek de wizard de mislukte kopie niet te melden; opgelost in `de7a8547`, nu: "Kopiëren lukte niet. Selecteer de tekst en kopieer met Ctrl+C." (`06b`). Na bevestigen toont campagne C "Campagne loopt", "0 van 30 ingevuld", start 17 september, herinnering 22 september, sluit 8 oktober en "Meting sluiten". (`07`, `08`) |
| 7 | Campagne A | ✅ "Je rapport is beschikbaar" en "Rapport downloaden". ⚠️ De download geeft "Rapport kon niet worden gegenereerd (500)". Railway draait nog `4805e92d` (`/api/health` meldt geen `pdf_renderer`), dus nog niet op `e0a95df8`: omgevingsprobleem, geen fout van dit plan. |
| 8 | 375 px | ✅ `scrollWidth` 375 op dashboard, campagne B en campagne C; de sluitdialoog past (onderrand 796 op 812) en staat onderin beeld. De wizard zelf is op 375 px nog drie kolommen (blok H, plan 2b) en is hier niet beoordeeld. (`09`, `10`) |
| 9 | Console | ⚠️ Geen fouten uit deze branch. Wel steeds: de CSP blokkeert `va.vercel-scripts.com/v1/script.debug.js` (Vercel Analytics laadt in dev de debugversie; bestond al), plus de Resend-fout en de PDF-500 hierboven. |

Afgesloten met `--reset`: "11 tellingen van andere organisaties ongewijzigd". De testklant staat weer in de uitgangssituatie; een volgende check heeft een verse login-link nodig.

**Omgevingsvalkuilen, ook in `docs/testklant.md` gezet:**
- `.venv/Scripts/python.exe` mist `httpx`; `--reset` en `--login-link` breken daar af vóór er iets geschreven wordt. De systeem-Python (3.14) heeft het wel en is gebruikt. `--dry-run` werkt met de venv.
- `frontend/.env.local` mist `RESEND_API_KEY` (zie build en stap 2).

## Bewust niet gedaan

1. **De sluitdatum wordt niet afgedwongen.** Na de sluitdatum kunnen respondenten gewoon blijven invullen tot de klant sluit; het dashboard vraagt dan om te sluiten of te verlengen. Echt afdwingen is een backendwijziging (survey-endpoints of een cron) en viel buiten dit plan. De toelichting is daarom eerlijk gemaakt (afwijking 8). **Beslissing voor Lars.**
2. **Lopende metingen zonder sluitdatum** (zoals campagne B, en elke meting van vóór deze branch). Die tonen "Nog niet ingesteld". De enige weg voor de klant is verlengen onder de drempel, wat vandaag + 14 zet en als verlenging telt; boven de drempel is er geen knop om een sluitdatum te zetten. Voor nieuwe metingen komt dit niet voor. De operator kan via `beheer/campagnes` een sluitdatum zetten (zonder 7-90-grens en zonder teller).
3. **Bestaande campagnes met 5 tot 9 uitgenodigden** kunnen in het operatorpaneel (self-send-config) niet meer worden opgeslagen, ook niet voor alleen de afzendernaam: de route valideert het opgeslagen aantal bij elke wijziging. Dat gedrag bestond al; alleen de drempel ging van 5 naar 10.
4. **De uitnodigingsdrempel van 10 is voor elke scan gelijk.** Bij culture_assessment is de rapportdrempel 30; 10 tot 29 uitnodigen wordt geaccepteerd en de melding noemt 10.
5. **Rechtenmodel niet gelijkgetrokken.** Dashboardpagina's en de nieuwe acties (sluiten, verlengen, overslaan) zijn voor eigenaar of operator; `saveLaunchSetupAction`, `confirmLaunchAction` en `saveSegmentDepartmentsAction` staan ook `member` toe. Dat was al zo; RLS staat een member die velden toch al toe.
6. **Operator die geen lid is van de organisatie.** De schrijfpolicies vragen `is_org_manager`; een operator zonder lidmaatschap krijgt bij sluiten of verlengen "niet gevonden of niet toegankelijk". Op de testklant is de operator lid.
7. **"Je organisatie" als stille terugval.** Als de organisatienaam niet geladen kan worden, staat er "je organisatie" in onderwerp, openingszin en ondertekening. Dat was al zo; het nette alternatief (een expliciete "niet beschikbaar"-toestand) raakt vijf aanroepers.
8. **Herinneringskaart vroeg in de nacht.** Alle "vandaag"-vergelijkingen gebruiken UTC, zoals de rest van de code; de kaart verschijnt om 02:00 (winter 01:00) Nederlandse tijd.
9. **`ReadOnlyStateCard` toont bij "Gesloten zonder rapport" de tekst "Mail Loep." zonder mailknop**, en de lopende kaart toont de sluitdatum twee keer (bij de voortgangsbalk en in de tijdlijn).
10. **Het `generating`-pad** van de verwerkingstoestand is onbereikbaar geworden (zelfde drempel) maar niet verwijderd.
11. **Tests zijn grotendeels source-guards.** Er is geen testing-library of jsdom; gedrag van dialogen en kopieerknoppen is alleen in de browser gecontroleerd.
12. **Blok G en H** (plan 2b): meerdere metingen op het dashboard, `/reports`-noemer, `/help`, organisatienaam in de kop (toont nu "Hotmail"), activatiepagina (toont nog managed-copy), responsive wizard, em-dash-sweep.

## Wat Lars moet weten

- **Niets is gemerged of gepusht.** Merge en push doe jij, of een afrondsessie.
- **Geen migratie nodig**; alle velden bestonden al.
- **Railway staat nog op `4805e92d`**: de PDF-download op productie faalt tot de redeploy van `e0a95df8`.
- **Beslissen:** sluitdatum afdwingen in de backend of niet (punt 1 hierboven), en hoe om te gaan met lopende metingen zonder sluitdatum (punt 2).
