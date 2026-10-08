# Twee beveiligingspunten vóór de eerste klant

Datum: 2026-10-08
Status: opdracht Lars 8-10 ("doe 1 t/m 3", punt 3). Te plannen en te bouwen.
Bron: `docs/security-audit-2026-07-12.md` (residu na H1) en de beslissingslog van 13-7.

## 1. Risicoscore per respondent niet meer leesbaar voor de klant

**Nu.** De view `campaign_stats` draait met de rechten van de aanroeper (`security_invoker = true`) en joint `survey_responses`. Daarom kreeg de rol `authenticated` op 13-7 een kolomrecht op `survey_responses (id, respondent_id, risk_score, risk_band)`. Gevolg: elk lid van een organisatie kan via PostgREST per respondent de risicoscore en risicoband lezen, buiten elke drempel om. Bij een kleine afdeling is die rij aan een persoon te koppelen. Dat botst met besluit (a) van 13-7: de klant ziet nooit individuele antwoorden.

**Gewenst.** De klant leest alleen geaggregeerde cijfers per meting. Geen enkele rol buiten operator en service-role leest nog een rij of kolom uit `survey_responses`.

**Richting** (de plansessie kiest en onderbouwt, of beargumenteert een beter alternatief):
- Trek het kolomrecht van `authenticated` op `survey_responses` in.
- Lever wat `campaign_stats` nu levert via een `security definer`-view of -functie, met `set search_path = public`, die zelf de tenancy afdwingt: alleen metingen van organisaties waarvan de aanroeper lid is, of alles voor `is_verisight_admin_user()`. Gebruik de bestaande helpers (`is_org_member`, `is_verisight_admin_user`).
- Inventariseer eerst elke lezer van `campaign_stats` en van `survey_responses` in frontend en backend (ook service-role-paden), en houd hun uitvoer byte-gelijk. Het klantdashboard, `/reports`, de beheerschermen en de rapportgeneratie moeten precies hetzelfde blijven tonen.
- Een migratie in `migrations/`, additief en idempotent, met een alleen-lezen controlequery die Lars na het draaien uitvoert. Spiegel de wijziging in `supabase/schema.sql`.

**Bewijs dat het werkt** (verplicht, niet alleen tests op SQLite):
- In een wegwerp-Postgres met het echte schema: als `authenticated` met de claims van lid van organisatie A geeft `select risk_band from survey_responses` een permissiefout; `campaign_stats` geeft voor organisatie A dezelfde cijfers als vóór de wijziging en voor organisatie B niets.
- Een SQL-gedragsscript in `migrations/checks/` met die gevallen, zoals bij de bewaartermijn (`migrations/checks/2026_09_24_data_retention_gedrag.sql`).
- Na de merge en de migratie toetst de hoofdsessie het op productie met de testklant: een klantsessie kan via PostgREST geen `survey_responses` meer lezen, het dashboard toont dezelfde aantallen.

## 2. Een mislukte rapportdownload wordt gezien

**Nu.** De rapportroutes in `backend/main.py` vangen elke fout en geven `HTTPException(500, detail=f"Exportgeneratie mislukt: {e}")`. Twee gevolgen:
- Sentry ziet het niet: de FastAPI-integratie meldt een afgehandelde `HTTPException` niet. Een klant die geen rapport krijgt, valt bij Loep niet op. Tussen 25-9 en 4-10 merkte niemand dat elke deploy faalde.
- De ruwe foutmelding gaat naar de klant, met mogelijk interne details.

**Gewenst.**
- Elke mislukte rapportgeneratie (500) komt in Sentry als event met de foutmelding en de stacktrace, getagd met `campaign_id` en `scan_type`. Geen respondentgegevens, geen organisatienaam en geen open tekst in het event.
- De klant krijgt een vaste, begrijpelijke melding in gewone taal, zonder interne details, met de vermelding dat Loep een melding heeft gekregen. De frontend toont die melding ook echt bij de downloadknop. Een 410 na opschoning en een 422 houden hun eigen eerlijke melding en worden niet als fout gemeld.
- Controleer ook de frontendroute die de download doorgeeft: een fout daar mag niet stil verdwijnen.
- Tests: een gesimuleerde renderfout levert precies één Sentry-event op, met de juiste tags en zonder persoonsgegevens, plus de nette melding aan de klant.

## Niet in deze ronde

De uptime-monitor (handmatig, Lars) en de overige open punten uit de audit van juli (M2, M3, M4, M6, lage punten).
