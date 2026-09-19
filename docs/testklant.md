# Vaste testklant op productie

Een afgebakende testorganisatie in de productiedatabase, zodat elke sessie zelf
kan inloggen en de klantflow in de browser kan controleren. Dat vervangt de
zin waar plannen tot nu toe op eindigden: "Lars checkt handmatig."

Script: [`scripts/seed_test_tenant.py`](../scripts/seed_test_tenant.py).
Aangemaakt op 13 september 2026.

---

## Wat er staat

| | |
|---|---|
| Organisatie | `TEST Loep Testklant`, slug `loep-testklant` |
| `org_id` | `a7dd316b-f858-5586-970c-5bbaede6d040` |
| Eigenaar | plus-adres van Lars, rol `owner` in `org_members` én in `org_invites` (`accepted_at` gezet) |
| Tweede lid | de Loep-operator, rol `owner`, zodat de organisatie in `/beheer` verschijnt |
| Zichtbaarheid | nergens op de publieke site; alle klantzichtbare namen beginnen met "TEST" |

Drie campagnes, alle `comms_mode = self_send` (het platform bewaart dus geen
deelnemer-e-mailadressen):

| | Campagne | `campaign_id` | Toestand |
|---|---|---|---|
| A | TEST Loep Behoud - gesloten met rapport | `12b958fb-ce46-5efa-a947-d5b6e1e09126` | gesloten, 18 afgeronde respondenten over drie afdelingen (TEST Zorg 12 uitgenodigd, TEST Kantoor 10, TEST Techniek 8), rapportdrempel gehaald |
| B | TEST Loep Behoud - lopend | `cf39a128-7184-553d-b844-1bd516826f3f` | actief, gelanceerd 4 dagen geleden, 30 uitgenodigd, 6 afgerond. Dit is de nieuwste campagne en dus degene die het dashboard toont |
| C | TEST Loep Vertrek - nog in te richten | `d13634c5-115c-51ea-b337-e933dbf74f0f` | actief, niet gelanceerd, leeg delivery record: de setup-wizard opent |

De id's liggen vast. Het script leidt ze af met `uuid5` uit een vaste
namespace, dus een `--reset` levert exact dezelfde id's en surveylinks op en
deze tabel veroudert niet.

## Inloggen

De inloggegevens staan in `frontend/.env.local`, dat gitignored is, onder
`TEST_OWNER_EMAIL` en `TEST_OWNER_PASSWORD`. Ze staan nergens anders: niet in
een gecommit bestand, niet in een logregel en niet in een schermafdruk.

Voor browserverificatie is er een tweede weg die geen wachtwoord nodig heeft:

```bash
.venv/Scripts/python.exe scripts/seed_test_tenant.py --login-link
```

Dat print een eenmalige, kortlevende URL naar `/complete-account?token_hash=…`.
Open die in de browser en de sessie staat. Dit is dezelfde route die de echte
activatiemail gebruikt. Het kale `action_link` van Supabase werkt hier niet: dat
landt op de Site URL, en de marketinghomepage laat geen sessie achter.

## Verversen

```bash
# Altijd eerst. Volledige seed tegen een wegwerp-SQLite, inclusief een echte
# rapportrender met controle op de verdiepings-, richting- en segmentblokken.
.venv/Scripts/python.exe scripts/seed_test_tenant.py --dry-run

# Verwijdert uitsluitend de rijen van de testorganisatie en zet ze opnieuw.
.venv/Scripts/python.exe scripts/seed_test_tenant.py --reset
```

Zonder vlag is het script idempotent: bestaat de testorganisatie al, dan
verandert er niets en meldt het dat.

Een `--reset` zet het wachtwoord van het auth-account opnieuw, en Supabase
trekt daarbij bestaande sessies in. Haal daarna dus een verse `--login-link`
op; een browsertabblad dat nog openstond valt terug op `/login`.

Waarom dit veilig is tegen de productiedatabase:

* Elke `delete` en `update` is gescoped op de organisatie met slug
  `loep-testklant`. Alles onder `organizations` cascadeert, dus één gescopede
  `delete` ruimt campagnes, delivery records, checkpoints, respondenten,
  responses, memberships, invites en het org-secret op. Geen `truncate`.
* Het script telt vóór en na de transactie elf categorieën rijen van alle
  andere organisaties. Wijkt er één af, dan rolt de transactie terug en stopt
  het script met een foutmelding.
* `auth.users` groeit met hoogstens één rij, en alleen voor het testadres.
* Er worden geen migraties gedraaid en geen RLS-regels of policies aangepast.

Het script schrijft met de `postgres`-rol, om dezelfde reden waarom de
bestaande operator-paden de service-role gebruiken: `survey_responses` en
`respondents` zijn sinds migratie 2026_07_13 op kolomniveau dichtgezet voor
`authenticated`, en alleen een Loep-operator mag een organisatie aanmaken.

Twee dingen die het script bewust doet zoals productie dat doet:

* De organisatie wordt aangemaakt met `request.jwt.claims` op de operator. De
  trigger `handle_new_org` leest `auth.uid()` zonder null-guard; zonder claim
  faalt de insert. Met de claim gedraagt de insert zich precies als een
  aanmaak via `/beheer`, inclusief het operator-lidmaatschap en het org-secret.
* Campagne C houdt het lege delivery record dat de trigger
  `on_campaign_created` aanmaakt. Een campagne zónder delivery record bestaat
  in productie niet, dus die toestand nabootsen zou een testfixture opleveren
  die de werkelijkheid niet dekt.

## Bekend omgevingsprobleem: rapport-PDF geeft 500

De PDF-download werkt vandaag niet, en dat ligt niet aan de seed. De
productiedatabase mist de kolom `survey_responses.direction_response`; de
migratie `migrations/2026_09_07_add_direction_response.sql` is nooit gedraaid.
De live backend draait wél de code die die kolom verwacht, dus élke query die
een `SurveyResponse` laadt faalt:

```
column "direction_response" does not exist
```

Gevolg voor de klantflow: `GET /api/campaigns/<id>/report` geeft 500 en
`/api/campaigns/<id>/stats` geeft 503. Dit raakt niet alleen de testklant maar
iedere campagne. Zodra de migratie gedraaid is, werkt de download en schrijft
een `--reset` ook de richtingantwoorden weg, waarna het rapportblok "Wat er
moet gebeuren" vult. Het script detecteert de kolom en meldt het ontbreken
expliciet in plaats van stil door te gaan.

## Checklist: browsercheck na een klantzichtbare wijziging

Doe dit zelf, in plaats van de wijziging door te geven ter handmatige controle.

1. Haal een sessie op met `--login-link` en open die URL in de browser.
2. `/dashboard` toont in de kop "TEST Loep Testklant" (niet het maildomein),
   campagne B als hoofdkaart met de campagnenaam en "6 van 30 ingevuld", de
   tijdlijn (start, herinnering, sluitdatum) en de knop "Meting sluiten". Tot
   vijf dagen na de seed-lancering heet de kaart "Campagne loopt" en staat er
   geen herinneringstekst; daarna "Vandaag: stuur de herinnering" met
   onderwerp en bericht apart kopieerbaar en "Geen herinnering versturen". B
   heeft na een reset geen sluitdatum ("Nog niet ingesteld"). Onder de kaart
   staat "Al je metingen" met B (Loopt), C (Nog in te richten) en A (Rapport
   beschikbaar), elk klikbaar, en daaronder "Klaar voor een vervolgmeting?"
   met een mailto naar hallo@getloep.nl. De sidebar toont onder "Afgesloten"
   de naam van A met "Gesloten sep 2026".
3. `/campaigns/12b958fb-ce46-5efa-a947-d5b6e1e09126` toont "Je rapport is
   beschikbaar" en één knop "Rapport downloaden" (geen "Open rapport" die
   naar zichzelf linkt). De link bovenaan heet "Alle metingen". Lokaal zonder
   draaiende backend geeft downloaden "Het rapport kon niet worden opgehaald
   (fout 500)"; dat is de omgeving, niet de code.
4. `/reports` toont campagne A onder "Beschikbaar nu" met "18 van 30 ingevuld
   (60%)" en de andere twee onder "Nog niet beschikbaar" (open lijst) met
   "Loopt" en "Nog in te richten"; de namen linken naar de meting.
5. `/campaigns/d13634c5-115c-51ea-b337-e933dbf74f0f/setup` opent de wizard bij
   stap 1 met een lege startdatum, sluitdatum en herinnering (standaard 5
   dagen), een werkende survey-link en de toelichting bij "Aantal deelnemers".
   3 deelnemers wordt geweigerd met de melding over minimaal 10. De
   toelichting bij de sluitdatum belooft dat niemand daarna nog kan invullen
   (de backend dwingt dat af). Na opslaan eindigt de uitnodiging in stap 2 met
   "Invullen kan tot en met [sluitdatum]". Op 375 px staan de drie stappen
   onder elkaar en is `scrollWidth` 375. Wie stap 1 opslaat schrijft naar de
   testklant; reset daarna.
6. Controleer de console op fouten en bekijk de pagina ook op 375 px breed als
   je layout hebt aangeraakt.
7. Raakte je de rapportgeneratie, draai dan eerst
   `scripts/seed_test_tenant.py --dry-run`: die rendert campagne A met de
   echte rapportgenerator en faalt hard als een blok verdwijnt.
8. `/help` toont de drie stappen, de drempels (10 en 5) met de uitleg, en het
   contactblok met hallo@getloep.nl. "Hulp" staat in de sidebar en in het
   mobiele menu; dat menu toont ook het accountblok en "Uitloggen".
9. De activatiepagina (`--login-link`) en `/login` staan in het Loep-ontwerp:
   "Kies een wachtwoord" met de drie stappen ernaast, en "Log in bij Loep".
   `/login?error=invite` toont de melding over een verlopen activatielink.
10. Na de Railway-redeploy: zet via `/beheer/campagnes` de sluitdatum van B
    op gisteren en open de survey-link van B; de statuspagina zegt "Deze
    meting is gesloten. Bedankt voor je interesse." Zet de datum daarna terug
    (of reset de testklant). Op de sluitdag zelf staat de kaart nog op
    "Campagne loopt"; pas de dag erna vraagt Loep te sluiten of te verlengen.

Twee omgevingsvalkuilen (gezien op 17 september 2026):

- De `.venv` in de repo-root mist `httpx`; `--reset` en `--login-link` breken
  daar af vóór er iets geschreven wordt. De systeem-Python heeft het wel:
  `python scripts/seed_test_tenant.py --reset`. `--dry-run` werkt met beide.
- `frontend/.env.local` heeft geen `RESEND_API_KEY`. Lokaal laadt de module
  met de dashboardacties dan niet ("Verlengen mislukt"), en `npm run build`
  breekt af. Voor een lokale check volstaat een dummywaarde; er gaat dan geen
  mail uit.

Schermafdrukken van de uitgangssituatie staan in
[`docs/testklant/`](testklant/). Ze zijn gemaakt op 13 september 2026 en
bevatten geen inloggegevens.

## Hoe de data tot stand komt

Geen enkele score is verzonnen. Het script bouwt ruwe likert-antwoorden met de
generatoren uit `scripts/stresstest_report.py` en laat de echte scoringketen de
rest doen: `compute_sdt_scores`, `compute_org_scores`, `compute_retention_risk`
en `compute_retention_supplemental_scores`. Welke verdiepingsvragen een
respondent krijgt (`compute_deepening_offers`) en op welke factor de
richtingvraag valt (`compute_direction_factor`) komen uit dezelfde
productielogica die de survey gebruikt.

Het factorprofiel van campagne A zet groeiperspectief en werkdruk bewust laag,
zodat het rapport een startpunt én een tweede punt heeft en beide genoeg
beantwoorders houden voor de verdiepings- en richtingdrempels. De overslagkans
op de verdieping staat op 5 procent in plaats van de 12 procent die het
stresstestharnas gebruikt, anders blijft de startpuntfactor onder
`DEEPENING_MIN_N` (8) en toont het raster "te weinig beantwoorders voor
duiding". Dat is een dataconditie van de generator, geen ingreep in de
rapportlogica.
