# Beveiliging vóór de eerste klant: implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De klant kan via PostgREST geen per-respondent risicoscore meer lezen (alleen geaggregeerde cijfers per meting), en elke mislukte rapportgeneratie komt getagd in Sentry terwijl de klant een vaste, nette melding ziet.

**Spec:** `docs/superpowers/specs/2026-10-08-beveiliging-voor-eerste-klant.md`

**Architecture:**
- Deel 1 (database): `campaign_stats` blijft een `security_invoker`-view, zodat zichtbaarheid van metingen en de respondenttellingen precies blijven wat de bestaande RLS op `campaigns`/`respondents` nu doet (ook als productie afwijkt van `schema.sql`, wat eerder gebeurde). Alleen de vier risicokolommen komen voortaan uit een nieuwe `security definer`-functie `campaign_risk_summary(uuid)` die zelf de tenancy afdwingt en uitsluitend aggregaten teruggeeft. Daardoor kan het kolomrecht van `authenticated` op `survey_responses` volledig weg.
- Deel 2 (Sentry): één module `backend/observability.py` met de Sentry-init (zonder lokale variabelen, request-body of headers) en één helper die een mislukte rapportgeneratie meldt met tags `campaign_id`, `scan_type` en `report_route`. De rapportroutes gooien een eigen exceptie (`ReportGenerationFailed`) die een exception-handler omzet in een 500 met vaste tekst. Zo maakt de FastAPI-integratie er géén tweede event van.
- Frontend: de rapportproxy logt elke fout (de frontend-Sentry staat uit, dus Vercel-logs) en geeft bij een onbereikbare backend een nette 502; de downloadknop toont de vaste backendmelding als hoofdzin zonder technische regel.

**Tech Stack:** Postgres 15 (Supabase), FastAPI 0.141, sentry-sdk 2.69, Next.js (App Router), vitest, pytest.

---

## Context die je moet weten

- **Waarom de spec-richting (één security-definer-view) níet gekozen is.** `campaign_stats` is op vier plekken een *toegangspoort*: `open-antwoorden/page.tsx` en `beheer-data.ts` lezen eerst `campaign_stats` met de user-client en lezen daarna open antwoorden met de **service-role**. Als de view-tenancy ook maar iets ruimer wordt dan de huidige RLS, lekt via die service-role-reads data van andere organisaties. Bovendien staat in `supabase/schema.sql` voor `campaigns` alleen `is_org_member` (geen operatorpolicy), en productie is in het verleden van `schema.sql` afgeweken. Door de view `security_invoker` te laten en alleen de risico-aggregatie achter een functie te zetten, blijft rij-zichtbaarheid per constructie gelijk en hoeft de functie alleen "minstens zo ruim als de huidige RLS, nooit ruimer dan lid of operator" te zijn.
- **Waarom de spec-premisse over Sentry deels niet klopt.** `sentry-sdk` 2.69 (`integrations/starlette.py`, `_sentry_patched_exception_handler`) meldt een `HTTPException` met status 5xx wél, en een onafgehandelde exceptie ook. Wat er nu misgaat: die events hebben geen tags, sturen standaard lokale variabelen mee (`include_local_variables=True`, in de renderer zitten daar open antwoorden en organisatienamen in), en de ruwe fout gaat naar de klant. Daarom: eigen exceptie + handler (géén `status_code`-attribuut, dus de integratie meldt hem niet), en init zonder lokale variabelen.
- **`schema.sql` is niet in één keer te laden** op een lege database (regel 216 wijzigt `survey_responses` vóór die bestaat). Twee keer laden werkt: de tweede keer foutloos. Dat is getest op 8-10.
- **`schema.sql` loopt achter op productie:** de view mist daar `closed_at` en `closes_at` (toegevoegd door `migrations/2026_06_17_add_closes_at.sql`). Deze ronde trekt dat gelijk.
- **Python 3.11** zoals Railway: geen backslash of geneste aanhalingstekens van hetzelfde type in f-string-expressies (PEP 701). `tests/test_python311_syntax_guard.py` bewaakt dat.
- **Parallelle sessie** werkt in `backend/main.py` aan de survey-submit. Raak in `backend/main.py` alleen de Sentry-init bovenaan, de rapportroutes en één exception-handler aan.
- **Commit altijd met paden:** `git commit -m "..." -- <pad> <pad>`. Nooit kaal `git stash`. Elke commit eindigt met `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Copy:** Nederlands, je/jij, Loep als onderwerp, geen em-dash of en-dash, geen jargon.

### Baselines (gemeten op main `91ecfd14` in deze worktree, 8-10)

- Backend `pytest tests`: **25 failed / 1816 passed / 11 skipped**. Faalset per testnaam: `C:\Users\larsh\AppData\Local\Temp\claude\C--Users-larsh-Desktop-Business\d2a3f990-03d2-4988-986f-e570359d6598\scratchpad\pytest-baseline-fails.txt`.
- Frontend `npx tsc --noEmit`: **131** errors.
- Frontend `npx vitest run`: **47 failed / 1844 passed**. Faalset: `...\scratchpad\vitest-baseline-fails.txt`.
- Gate na elke taak: geen enkele testnaam die op de baseline groen was, mag falen; tsc blijft 131.

Commando's (vanuit de worktree-root `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\beveiliging`):

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -p no:cacheprovider
cd frontend && npx tsc --noEmit 2>&1 | grep -c "error TS"
cd frontend && npx vitest run
```

---

## Bestandsoverzicht

| Bestand | Rol |
|---|---|
| Create `migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql` | De migratie: functie, view, rechten. Additief en idempotent. |
| Modify `supabase/schema.sql` | Spiegel: functie vóór de view, view met `closed_at`/`closes_at`, kolomrecht weg. |
| Create `migrations/checks/2026_10_08_campaign_stats_gedrag.sql` | Gedragsscript, alleen lokaal in Docker. Voor/na-vergelijking per rol. |
| Create `migrations/checks/2026_10_08_campaign_stats_controle.sql` | Alleen-lezen controlequery voor Lars op productie. |
| Create `tests/test_campaign_stats_migration.py` | Statische contracttests op migratie en schema-spiegel (pytest, geen database). |
| Create `backend/observability.py` | Sentry-opties, init, `ReportGenerationFailed`, `report_generation_failed()`. |
| Modify `backend/main.py` | Init via observability; rapportroutes melden via de helper; één exception-handler. |
| Modify `requirements.txt` | `sentry-sdk[fastapi]>=2.0.0,<3` (bovengrens; tests leunen op SDK-gedrag). |
| Create `tests/test_report_failure_sentry.py` | Eén event per mislukte generatie, tags, geen PII, nette melding; 410/422 geen event. |
| Modify `frontend/app/api/campaigns/[id]/report/route.ts` | Fouten loggen, onbereikbare backend wordt nette 502. |
| Create `frontend/app/api/campaigns/[id]/report/route.failures.test.ts` | Gedragstests van de proxy met gemockte afhankelijkheden. |
| Modify `frontend/lib/report-download-error.ts` (+ test) | `reportFailureMessage()` herkent de vaste backendmelding. |
| Modify `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx` | Toont die melding als hoofdzin, zonder technische regel. |
| Create `docs/superpowers/plans/2026-10-08-beveiliging-voor-eerste-klant-uitvoering.md` | Verslag. |

---

## Deel 1: risicoscore per respondent dicht

### Task 1: Migratie en schema-spiegel

**Files:**
- Create: `migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql`
- Modify: `supabase/schema.sql` (kolomrecht rond regel 1470-1475; view rond regel 2462-2490)
- Test: `tests/test_campaign_stats_migration.py`

- [ ] **Step 1: Schrijf de falende contracttest**

Maak `tests/test_campaign_stats_migration.py`:

```python
"""Contract van migratie 2026_10_08 (campaign_stats zonder respondentscores).

Statisch: leest de SQL-bestanden. Het echte gedrag (rechten, tenancy,
byte-gelijke uitvoer) bewijst migrations/checks/2026_10_08_campaign_stats_gedrag.sql
in een wegwerp-Postgres."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIE = ROOT / "migrations" / "2026_10_08_campaign_stats_zonder_respondentscores.sql"
SCHEMA = ROOT / "supabase" / "schema.sql"


def _sql(path: Path) -> str:
    # Commentaar eruit, zodat een zin in de toelichting een test niet laat slagen.
    text = path.read_text(encoding="utf-8")
    return re.sub(r"--[^\n]*", "", text).lower()


def _view_body(sql: str) -> str:
    start = sql.index("create or replace view public.campaign_stats")
    return sql[start : sql.index(";", start)]


def test_migratie_bestaat_en_heeft_security_definer_functie():
    sql = _sql(MIGRATIE)
    assert "create or replace function public.campaign_risk_summary(target_campaign_id uuid)" in sql
    functie = sql[sql.index("create or replace function public.campaign_risk_summary") :]
    functie = functie[: functie.index("$$;") ]
    assert "security definer" in functie
    assert "set search_path = public" in functie
    assert "public.is_org_member(c.organization_id)" in functie
    assert "public.is_verisight_admin_user()" in functie
    assert "current_setting('role', true)" in functie


def test_functie_niet_uitvoerbaar_voor_public_en_anon():
    sql = _sql(MIGRATIE)
    assert "revoke all on function public.campaign_risk_summary(uuid) from public, anon;" in sql
    assert "grant execute on function public.campaign_risk_summary(uuid) to authenticated, service_role;" in sql


def test_view_blijft_security_invoker_en_leest_survey_responses_niet_meer():
    for path in (MIGRATIE, SCHEMA):
        body = _view_body(_sql(path))
        assert "security_invoker = true" in body, path
        assert "survey_responses" not in body, path
        assert "public.campaign_risk_summary(" in body, path
        assert "c.closed_at" in body and "c.closes_at" in body, path


def test_view_kolomvolgorde_gelijk_aan_productie():
    """create or replace view weigert een andere volgorde; productie heeft de
    kolommen uit migrations/2026_06_17_add_closes_at.sql."""
    verwacht = [
        "campaign_id", "campaign_name", "scan_type", "organization_id", "is_active",
        "created_at", "closed_at", "closes_at", "total_invited", "total_completed",
        "completion_rate_pct", "avg_risk_score", "band_high", "band_medium", "band_low",
    ]
    for path in (MIGRATIE, SCHEMA):
        body = _view_body(_sql(path))
        select = body[body.index("select") : body.index("from (")]
        posities = [select.index(kolom) for kolom in verwacht]
        assert posities == sorted(posities), path


def test_kolomrecht_op_survey_responses_is_weg():
    for path in (MIGRATIE, SCHEMA):
        sql = _sql(path)
        assert "revoke select on public.survey_responses from anon, authenticated;" in sql, path
        assert not re.search(r"grant\s+select\s*\([^)]*\)\s*on\s+public\.survey_responses", sql), path
        assert not re.search(r"grant\s+select\s+on\s+public\.survey_responses\s+to\s+(anon|authenticated)", sql), path


def test_anon_leest_campaign_stats_niet():
    for path in (MIGRATIE, SCHEMA):
        assert "revoke select on public.campaign_stats from anon;" in _sql(path), path


def test_functie_staat_in_schema_voor_de_view():
    sql = _sql(SCHEMA)
    assert sql.index("create or replace function public.campaign_risk_summary") < sql.index(
        "create or replace view public.campaign_stats"
    )


def test_migratie_bevat_geen_drop_view():
    """create or replace houdt grants en afhankelijkheden; een drop zou dat niet."""
    assert "drop view" not in _sql(MIGRATIE)
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_campaign_stats_migration.py -q -p no:cacheprovider`
Expected: FAIL (migratiebestand bestaat niet).

- [ ] **Step 3: Schrijf de migratie**

Maak `migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql` met precies deze inhoud:

```sql
-- Migration: risicoscore per respondent niet meer leesbaar voor de klant
-- Datum: 2026-10-08 (spec docs/superpowers/specs/2026-10-08-beveiliging-voor-eerste-klant.md, punt 1)
-- Uitvoeren in: Supabase Dashboard -> SQL Editor, als postgres. Additief en
-- idempotent: opnieuw draaien verandert niets. Volgorde ten opzichte van een
-- Railway- of Vercel-deploy maakt niet uit: geen code leest survey_responses
-- met de rechten van een klant, en de view houdt dezelfde kolommen.
--
-- Achtergrond: na de audit van 13-7 had authenticated nog een kolomrecht op
-- survey_responses (id, respondent_id, risk_score, risk_band), omdat de view
-- campaign_stats met de rechten van de aanroeper draait en die kolommen joint.
-- Elk lid van een organisatie kon daardoor via PostgREST per respondent de
-- risicoscore lezen, buiten elke drempel om. Besluit (a) van 13-7: de klant ziet
-- nooit individuele antwoorden.
--
-- Oplossing: de view blijft security_invoker, zodat welke metingen iemand ziet
-- en de respondenttellingen precies blijven wat de RLS op campaigns en
-- respondents nu bepaalt. Alleen de vier risicokolommen komen uit een security-
-- definer-functie die zelf de tenancy afdwingt en uitsluitend aggregaten per
-- meting teruggeeft. Daarna kan het kolomrecht op survey_responses weg.

-- 1. Aggregatie per meting achter een security-definer-functie.
-- Bevoegd: lid van de organisatie van de meting, de Loep-operator, of een
-- verbinding die geen klantrol is (service-role, directe databaseverbinding).
-- Een klantrol herkennen we aan zowel de JWT-rol als de databaserol
-- (current_setting('role') is de SET ROLE van PostgREST, ook binnen een
-- security-definer-functie). Allebei moeten zeggen "geen klant" voordat de
-- tenancycheck vervalt. Wie niet bevoegd is, krijgt dezelfde uitkomst als bij
-- een meting zonder antwoorden (leeg gemiddelde, nul per band): de functie
-- verraadt niets.
-- Een SQL-functie met security definer wordt door Postgres nooit ge-inlined,
-- dus de rechten van de eigenaar gelden altijd.
create or replace function public.campaign_risk_summary(target_campaign_id uuid)
returns table (
  avg_risk_score numeric,
  band_high      bigint,
  band_medium    bigint,
  band_low       bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    round(avg(sr.risk_score)::numeric, 2),
    count(sr.id) filter (where sr.risk_band = 'HOOG'),
    count(sr.id) filter (where sr.risk_band = 'MIDDEN'),
    count(sr.id) filter (where sr.risk_band = 'LAAG')
  from public.campaigns c
  join public.respondents      r  on r.campaign_id    = c.id
  join public.survey_responses sr on sr.respondent_id = r.id
  where c.id = target_campaign_id
    and (
      (
        coalesce(auth.role(), '') not in ('anon', 'authenticated')
        and coalesce(current_setting('role', true), '') not in ('anon', 'authenticated')
      )
      or public.is_verisight_admin_user()
      or public.is_org_member(c.organization_id)
    );
$$;

revoke all on function public.campaign_risk_summary(uuid) from public, anon;
grant execute on function public.campaign_risk_summary(uuid) to authenticated, service_role;

-- 2. campaign_stats: zelfde kolommen in dezelfde volgorde als in productie
-- (migrations/2026_06_17_add_closes_at.sql), zelfde rekenregels. De
-- respondenttellingen gebeuren eerst per meting in een subquery, zodat de
-- functie één keer per meting draait en niet één keer per respondent.
create or replace view public.campaign_stats with (security_invoker = true) as
select
  s.campaign_id,
  s.campaign_name,
  s.scan_type,
  s.organization_id,
  s.is_active,
  s.created_at,
  s.closed_at,
  s.closes_at,
  s.total_invited,
  s.total_completed,
  s.completion_rate_pct,
  rs.avg_risk_score,
  rs.band_high,
  rs.band_medium,
  rs.band_low
from (
  select
    c.id                                                as campaign_id,
    c.name                                              as campaign_name,
    c.scan_type,
    c.organization_id,
    c.is_active,
    c.created_at,
    c.closed_at,
    c.closes_at,
    count(r.id)                                         as total_invited,
    count(r.id) filter (where r.completed)              as total_completed,
    round(
      count(r.id) filter (where r.completed)::numeric
      / nullif(count(r.id), 0) * 100, 1
    )                                                   as completion_rate_pct
  from public.campaigns c
  left join public.respondents r on r.campaign_id = c.id
  group by
    c.id, c.name, c.scan_type, c.organization_id, c.is_active,
    c.created_at, c.closed_at, c.closes_at
) s
cross join lateral public.campaign_risk_summary(s.campaign_id) rs;

-- anon heeft hier niets te zoeken (geen enkele lezer in de code is anon).
revoke select on public.campaign_stats from anon;

-- 3. survey_responses: geen enkele kolom meer leesbaar voor anon of authenticated.
-- Een revoke op tabelniveau neemt ook de kolomrechten mee; de tweede regel maakt
-- dat expliciet. De operator leest via de service-role.
revoke select on public.survey_responses from anon, authenticated;
revoke select (id, respondent_id, risk_score, risk_band) on public.survey_responses from anon, authenticated;
```

- [ ] **Step 4: Spiegel in `supabase/schema.sql`**

(a) Vervang het blok rond regel 1470-1475:

```sql
-- survey_responses: alleen de aggregatiekolommen die de campaign_stats-view nodig heeft
-- (die view is security_invoker=true en joint survey_responses). Ruwe antwoorden/open tekst
-- gaan dicht. Residu: per-respondent risk_score/risk_band (afgeleid) blijft leesbaar.
revoke select on public.survey_responses from anon, authenticated;
grant  select (id, respondent_id, risk_score, risk_band)
  on public.survey_responses to authenticated;
```

door:

```sql
-- survey_responses: geen enkele kolom leesbaar voor anon of authenticated (2026-10-08).
-- campaign_stats haalt de risico-aggregatie uit public.campaign_risk_summary (security
-- definer, eigen tenancycheck), dus de klant heeft geen kolomrecht meer nodig.
revoke select on public.survey_responses from anon, authenticated;
revoke select (id, respondent_id, risk_score, risk_band) on public.survey_responses from anon, authenticated;
```

Pas ook de commentaarregel erboven (rond regel 1468, "campaign_stats + het backend-rapport") niet inhoudelijk aan; die blijft kloppen.

(b) Vervang het hele `VIEW: campaign_stats`-blok (vanaf de kop `-- VIEW: campaign_stats` tot en met de `group by`-regel met puntkomma) door: dezelfde kop, een commentaarregel `-- Gelijk aan migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql.`, en daarna letterlijk de secties 1 en 2 uit de migratie (functie, `revoke`/`grant` op de functie, de view, `revoke select on public.campaign_stats from anon;`). Het commentaar boven de view over `security_invoker` mag blijven. Sectie 3 van de migratie staat in (a) al op zijn plek.

- [ ] **Step 5: Draai de contracttest**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_campaign_stats_migration.py -q -p no:cacheprovider`
Expected: 8 passed.

- [ ] **Step 6: Zie dat geen bestaande test op de oude grant leunt**

Run: `grep -rn "risk_score, risk_band" tests/ frontend/lib frontend/app --include=*.py --include=*.ts | grep -v node_modules`
Als een test de oude `grant select (id, respondent_id, risk_score, risk_band)` pint: bijwerken naar de nieuwe stand en dat in je rapport noemen.

- [ ] **Step 7: Commit**

```bash
git add migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql tests/test_campaign_stats_migration.py
git commit -m "feat(db): campaign_stats haalt risico-aggregatie uit security-definer-functie; kolomrecht op survey_responses weg

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql supabase/schema.sql tests/test_campaign_stats_migration.py
```

---

### Task 2: Gedragsscript in een wegwerp-Postgres

**Files:**
- Create: `migrations/checks/2026_10_08_campaign_stats_gedrag.sql`

Doel: in een wegwerp-Postgres met het échte schema (`supabase/schema.sql`) bewijzen dat (a) een klant geen rij of kolom van `survey_responses` meer leest, (b) `campaign_stats` voor elke rol byte-gelijk is aan vóór de migratie, (c) organisatie B niets van A ziet, en (d) de functie niets lekt bij directe aanroep.

**Toestand "vóór" nabootsen.** Na Task 1 bevat `schema.sql` al de nieuwe toestand. Het script zet daarom eerst de productietoestand terug door `migrations/2026_06_17_add_closes_at.sql` (oude view met `closed_at`/`closes_at`) en `migrations/2026_07_13_lock_individual_data_to_operator.sql` (het oude kolomrecht) opnieuw te draaien. Dat is precies wat productie nu heeft. Daarna seed, snapshot "voor", nieuwe migratie (als `postgres`, zoals in de SQL Editor), snapshot "na", vergelijken, en de migratie nog een keer (idempotentie).

- [ ] **Step 1: Schrijf het script**

Maak `migrations/checks/2026_10_08_campaign_stats_gedrag.sql`. Header en vaste opbouw (vul de seed en de gevallen aan volgens de lijst hieronder; elke `\gset`-snapshot gebruikt dezelfde vorm):

```sql
-- ALLEEN LOKAAL, NOOIT TEGEN PRODUCTIE.
-- Gedragscontrole voor migratie 2026_10_08_campaign_stats_zonder_respondentscores.sql
-- in een wegwerp-Postgres met het echte schema. Dit script draait schema, oude
-- migraties en seeddata en hoort nooit in Supabase Dashboard of op een gedeelde
-- database.
--
-- Draaien (Git Bash, vanuit de repo-root; MSYS_NO_PATHCONV voorkomt dat Git Bash
-- /repo omzet naar een Windows-pad):
--   export MSYS_NO_PATHCONV=1
--   docker run -d --rm --name loep-stats-check -e POSTGRES_PASSWORD=wegwerp \
--     -v "$(pwd -W):/repo:ro" public.ecr.aws/supabase/postgres:15.8.1.085
--   (wachten tot: docker exec loep-stats-check pg_isready -U postgres -h localhost)
--   # schema.sql laadt pas in twee rondes (regel 216 wijzigt survey_responses
--   # voordat die bestaat); de tweede ronde moet foutloos zijn.
--   docker exec loep-stats-check psql -U postgres -h localhost -d postgres -q -f /repo/supabase/schema.sql
--   docker exec loep-stats-check psql -U postgres -h localhost -d postgres -q -v ON_ERROR_STOP=1 -f /repo/supabase/schema.sql
--   docker exec loep-stats-check psql -U supabase_admin -h localhost -d postgres -v ON_ERROR_STOP=1 \
--     -f /repo/migrations/checks/2026_10_08_campaign_stats_gedrag.sql
--   docker stop loep-stats-check
-- Slaagt alles, dan eindigt de uitvoer met "ALLE GEVALLEN ZOALS VERWACHT";
-- anders stopt het script met een fout die het afwijkende geval noemt.

\set ON_ERROR_STOP 1
\pset tuples_only on
\pset format unaligned

-- 1. Productietoestand van vandaag: oude view en het kolomrecht van 13-7.
set role postgres;
\i /repo/migrations/2026_06_17_add_closes_at.sql
\i /repo/migrations/2026_07_13_lock_individual_data_to_operator.sql
reset role;
```

Een identiteit aannemen gebeurt altijd zo (zet de oude losse claims én de json-vorm, zodat elke versie van `auth.uid()`/`auth.role()` in het image werkt):

```sql
begin;
select set_config('request.jwt.claim.sub',  '<uuid>', true),
       set_config('request.jwt.claim.role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true);
set local role authenticated;
select coalesce(json_agg(cs order by cs.campaign_id)::text, '[]') as uit from public.campaign_stats cs \gset voor_aowner_
commit;
```

Een verwachte permissiefout test je met een `do`-blok dat `insufficient_privilege` vangt en anders een exceptie gooit:

```sql
begin;
select set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true),
       set_config('request.jwt.claim.sub', '<uuid>', true),
       set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
do $$
begin
  perform risk_band from public.survey_responses limit 1;
  raise exception 'GEVAL lid A: survey_responses.risk_band is nog leesbaar';
exception when insufficient_privilege then
  null;  -- verwacht
end $$;
commit;
```

Vergelijken met psql-variabelen:

```sql
select (:'voor_aowner_uit' = :'na_aowner_uit') as gelijk \gset cmp_aowner_
\if :cmp_aowner_gelijk
\else
  \echo 'GEVAL lid A: campaign_stats wijkt af na de migratie'
  \echo :'voor_aowner_uit'
  \echo :'na_aowner_uit'
  select 1/0;
\endif
```

**Seed (als `supabase_admin`, vóór de snapshots).** Gebruik vaste uuid's. Let op: de trigger `handle_new_org` leest `auth.uid()` zonder null-check; zet daarom bij het invoegen van organisaties de claims van de operator (`set_config('request.jwt.claim.sub', <operator>, true)` in een transactie). Kijk in `supabase/schema.sql` welke verplichte kolommen `auth.users`-afhankelijke tabellen, `organizations`, `campaigns`, `respondents` en `survey_responses` hebben en vul die; laat optionele kolommen leeg.
- Gebruikers in `auth.users` + `public.profiles`: `lidA_owner` (owner van A), `lidA_member` (member van A), `lidB_owner` (owner van B), `operator` (`is_verisight_admin = true`, géén lid), `buitenstaander` (geen lidmaatschap).
- Organisatie A: meting A1 (retention) met 6 respondenten, 5 `completed`, 5 `survey_responses` met `risk_score` 3.2, 4.8, 5.5, 6.1, 7.9 en banden LAAG, MIDDEN, MIDDEN, HOOG, HOOG; meting A2 (exit) zonder respondenten (lege-paden: `avg_risk_score` null, banden 0).
- Organisatie B: meting B1 (exit) met 3 respondenten, 3 responses, banden HOOG, LAAG, LAAG.

**Gevallen (allemaal verplicht):**
1. Snapshot "voor" van `select ... from campaign_stats` (vorm hierboven) voor: `lidA_owner`, `lidA_member`, `lidB_owner`, `operator` (als authenticated), `buitenstaander`, `service_role` (`set local role service_role` + claims-rol `service_role`), en directe verbinding (geen `set role`, geen claims, als `postgres`).
2. Snapshot "voor" voor `anon` (`set local role anon` + claims-rol `anon`): verwacht `[]`.
3. Toon in de uitvoer de "voor"-snapshot van `lidA_owner` en controleer expliciet de verwachte getallen: A1 `total_invited` 6, `total_completed` 5, `completion_rate_pct` 83.3, `avg_risk_score` 5.50, `band_high` 2, `band_medium` 2, `band_low` 1; A2 `total_invited` 0, `avg_risk_score` null, banden 0; geen B1. (Zo test het script niet alleen gelijkheid, maar ook dat de seed klopt.)
4. Draai de migratie als `postgres`: `set role postgres; \i /repo/migrations/2026_10_08_campaign_stats_zonder_respondentscores.sql; reset role;`.
5. Snapshot "na" voor dezelfde rollen als in 1; elk moet **byte-gelijk** zijn aan "voor".
6. `anon` op `campaign_stats` na de migratie: permissiefout (`insufficient_privilege`).
7. `lidA_owner`, `lidA_member`, `operator` (als authenticated) en `anon`: `select risk_band`, `select risk_score`, `select id` en `select count(*)` op `survey_responses` geven elk een permissiefout.
8. `service_role` leest `survey_responses` nog wel (count = 8).
9. Directe functieaanroep `select * from public.campaign_risk_summary('<B1>')` als `lidA_owner`: `avg_risk_score` null en alle banden 0. Idem `buitenstaander` op A1.
10. `anon` roept `public.campaign_risk_summary('<A1>')` aan: permissiefout.
11. Databaserol `authenticated` **zonder** claims: `campaign_risk_summary('<A1>')` geeft null/0 (geen ontsnapping via ontbrekende claims).
12. Databaserol `authenticated` met claims-rol `service_role`: `campaign_risk_summary('<A1>')` geeft null/0 (de databaserol telt mee).
13. `operator` (authenticated, geen lid) op `campaign_risk_summary('<A1>')`: echte cijfers (avg 5.50), want operator mag alles.
14. Eigenschappen: `select prosecdef, proconfig from pg_proc where oid = 'public.campaign_risk_summary(uuid)'::regprocedure` geeft `true` en `{search_path=public}`; `select reloptions from pg_class where oid = 'public.campaign_stats'::regclass` bevat `security_invoker=true`; `has_function_privilege('anon', 'public.campaign_risk_summary(uuid)', 'execute')` is false.
15. Idempotentie: draai de migratie nog een keer als `postgres` en neem opnieuw de snapshot van `lidA_owner`: gelijk aan "voor".
16. Laatste regel: `\echo 'ALLE GEVALLEN ZOALS VERWACHT'`.

- [ ] **Step 2: Draai het script en zie het slagen**

Voer de commando's uit de header uit. Expected: laatste regel `ALLE GEVALLEN ZOALS VERWACHT`, exitcode 0. Bewaar de volledige uitvoer in de scratchpad (`...\scratchpad\gedrag-campaign-stats.log`); het verslag citeert de snapshotregels van `lidA_owner` voor en na.

- [ ] **Step 3: Bewijs dat het script een fout echt vangt**

Maak tijdelijk (niet committen) een kopie van de migratie zonder de twee `revoke select ... survey_responses`-regels, laat het script die kopie draaien (pas het `\i`-pad tijdelijk aan in een kopie van het script in de scratchpad), en zie dat het faalt op geval 7. Noteer de foutregel in je rapport. Gooi beide kopieën weg.

- [ ] **Step 4: Commit**

```bash
git add migrations/checks/2026_10_08_campaign_stats_gedrag.sql
git commit -m "test(db): gedragsscript campaign_stats voor en na in wegwerp-Postgres met echt schema

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- migrations/checks/2026_10_08_campaign_stats_gedrag.sql
```

Als je in deze taak een fout in de migratie of de schema-spiegel vindt: fix die in hetzelfde bestand, draai de contracttest van Task 1 opnieuw en commit de fix apart met een eigen bericht.

---

### Task 3: Alleen-lezen controlequery voor Lars

**Files:**
- Create: `migrations/checks/2026_10_08_campaign_stats_controle.sql`

- [ ] **Step 1: Schrijf de controlequery**

```sql
-- Controle voor migratie 2026_10_08_campaign_stats_zonder_respondentscores.sql.
-- Veilig op productie: alleen-lezen. Draai in Supabase Dashboard -> SQL Editor.
--
-- Blok A draai je VOOR en NA de migratie: beide keren moet dezelfde
-- vingerafdruk uitkomen (de SQL Editor draait als postgres en ziet alle metingen).
-- Blok B draai je NA de migratie: elke regel moet "ok" tonen.
-- Blok C draai je NA de migratie: dezelfde cijfers als de testklant in het
-- dashboard, en de laatste opdracht moet falen met "permission denied".

-- Blok A: vingerafdruk van campaign_stats
select count(*) as metingen,
       md5(coalesce(json_agg(cs order by cs.campaign_id)::text, '')) as vingerafdruk
from public.campaign_stats cs;

-- Blok B: rechten en eigenschappen
select controle, case when goed then 'ok' else 'AFWIJKING' end as uitkomst
from (
  select 'anon en authenticated lezen geen enkele kolom van survey_responses' as controle,
         not exists (
           select 1
           from (values ('anon'), ('authenticated')) v(rol)
           cross join pg_attribute a
           where a.attrelid = 'public.survey_responses'::regclass
             and a.attnum > 0 and not a.attisdropped
             and has_column_privilege(v.rol, 'public.survey_responses', a.attname, 'SELECT')
         ) as goed
  union all
  select 'campaign_risk_summary is security definer met search_path=public',
         exists (select 1 from pg_proc
                 where oid = 'public.campaign_risk_summary(uuid)'::regprocedure
                   and prosecdef and proconfig @> array['search_path=public'])
  union all
  select 'anon mag campaign_risk_summary niet uitvoeren',
         not has_function_privilege('anon', 'public.campaign_risk_summary(uuid)', 'execute')
  union all
  select 'authenticated mag campaign_risk_summary uitvoeren',
         has_function_privilege('authenticated', 'public.campaign_risk_summary(uuid)', 'execute')
  union all
  select 'campaign_stats draait nog met de rechten van de aanroeper',
         exists (select 1 from pg_class
                 where oid = 'public.campaign_stats'::regclass
                   and reloptions @> array['security_invoker=true'])
  union all
  select 'campaign_stats leest survey_responses niet meer rechtstreeks',
         position('survey_responses' in pg_get_viewdef('public.campaign_stats'::regclass)) = 0
  union all
  select 'anon leest campaign_stats niet',
         not has_table_privilege('anon', 'public.campaign_stats', 'SELECT')
) c;

-- Blok C: als eigenaar van de testklant (wordt teruggedraaid, verandert niets)
begin;
select set_config('request.jwt.claims',
         json_build_object('sub', m.user_id, 'role', 'authenticated')::text, true)
from public.org_members m
join public.organizations o on o.id = m.org_id
where o.slug = 'loep-testklant' and m.role = 'owner'
limit 1;
set local role authenticated;
select campaign_id, campaign_name, total_invited, total_completed,
       avg_risk_score, band_high, band_medium, band_low
from public.campaign_stats
order by created_at;
-- Verwacht: alleen de drie testklantmetingen, met dezelfde aantallen als het dashboard.
select risk_band from public.survey_responses limit 1;
-- Verwacht: ERROR: permission denied for table survey_responses
rollback;
```

- [ ] **Step 2: Draai Blok A, B en C in de wegwerp-Postgres**

Hergebruik de container uit Task 2 (of start hem opnieuw volgens de header daar). Laad schema twee keer, zet de oude toestand (`06_17` en `07_13` als `postgres`), seed met het seed-deel van het gedragsscript, en draai Blok A. Draai de migratie, draai Blok A opnieuw (zelfde vingerafdruk), Blok B (alles `ok`) en Blok C (pas voor de proef de slug-filter aan naar organisatie A of voeg een organisatie met slug `loep-testklant` toe aan de seed; verwacht alleen metingen van die organisatie en een permissiefout op de laatste select). Noteer de uitkomsten voor het verslag. Draai Blok B ook vóór de migratie en zie dat de eerste en zesde regel `AFWIJKING` tonen (zo weet je dat de controle iets meet).

- [ ] **Step 3: Commit**

```bash
git add migrations/checks/2026_10_08_campaign_stats_controle.sql
git commit -m "docs(db): alleen-lezen controlequery campaign_stats voor productie

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- migrations/checks/2026_10_08_campaign_stats_controle.sql
```

---

## Deel 2: een mislukte rapportdownload wordt gezien

### Task 4: `backend/observability.py` met privacyvriendelijke Sentry-init

**Files:**
- Create: `backend/observability.py`
- Modify: `backend/main.py:20-40` (Sentry-init bovenaan)
- Modify: `requirements.txt:47`
- Test: `tests/test_report_failure_sentry.py` (eerste deel)

- [ ] **Step 1: Schrijf de falende tests**

Maak `tests/test_report_failure_sentry.py`:

```python
"""Mislukte rapportgeneratie komt precies één keer in Sentry, getagd, zonder
persoonsgegevens, en de klant krijgt een vaste melding (spec 2026-10-08, punt 2).

De tests zetten Sentry aan met een vangende transport en de echte FastAPI-
integratie, zodat ook een tweede event van de integratie zelf zou opvallen."""
from __future__ import annotations

import json
from typing import Any

import pytest
import sentry_sdk
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sentry_sdk.transport import Transport

from backend import observability


class _Vanger(Transport):
    def __init__(self, options: dict[str, Any] | None = None) -> None:
        super().__init__(options)
        self.events: list[dict[str, Any]] = []

    def capture_envelope(self, envelope) -> None:  # type: ignore[override]
        for item in envelope.items:
            if item.type == "event":
                self.events.append(item.payload.json)


@pytest.fixture()
def sentry_vanger():
    vanger = _Vanger()
    observability.init_sentry(
        dsn="https://publiek@sentry.invalid/1",
        environment="test",
        transport=vanger,
        traces_sample_rate=0.0,
    )
    # De integratie patcht Starlette-klassen; een al gebouwde middleware-stack
    # van eerdere tests moet opnieuw opgebouwd worden.
    from backend.main import app

    app.middleware_stack = None
    try:
        yield vanger
    finally:
        sentry_sdk.flush()
        sentry_sdk.get_client().close()
        sentry_sdk.init(dsn=None)
        app.middleware_stack = None


def test_sentry_opties_sturen_geen_lokale_variabelen_body_of_pii():
    opties = observability.sentry_options(dsn="https://publiek@sentry.invalid/1", environment="test")
    assert opties["send_default_pii"] is False
    assert opties["include_local_variables"] is False
    assert opties["max_request_body_size"] == "never"
    assert opties["before_send"] is observability.strip_request_details


def test_strip_request_details_houdt_alleen_methode_en_pad():
    event = {
        "request": {
            "method": "GET",
            "url": "https://api.test/api/campaigns/abc/report",
            "query_string": "format=pdf",
            "headers": {"x-api-key": "geheim", "cookie": "sessie"},
            "cookies": {"sessie": "x"},
            "data": {"open_text": "tekst"},
            "env": {"REMOTE_ADDR": "1.2.3.4"},
        }
    }
    uit = observability.strip_request_details(event, {})
    assert uit["request"] == {"method": "GET", "url": "https://api.test/api/campaigns/abc/report"}


def test_controle_integratie_is_actief(sentry_vanger):
    """Zonder dit bewijs zou 'precies één event' ook slagen als de integratie
    in deze testrun niet actief was."""
    los = FastAPI()

    @los.get("/kapot")
    async def kapot():
        raise HTTPException(status_code=500, detail="x")

    with TestClient(los) as c:
        assert c.get("/kapot").status_code == 500
    sentry_sdk.flush()
    assert len(sentry_vanger.events) == 1
```

- [ ] **Step 2: Draai en zie falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_failure_sentry.py -q -p no:cacheprovider`
Expected: FAIL (`backend.observability` bestaat niet).

- [ ] **Step 3: Schrijf `backend/observability.py`**

```python
"""Sentry voor de backend: init zonder persoonsgegevens, en één plek die een
mislukte rapportgeneratie meldt (spec 2026-10-08, punt 2).

Privacy: geen lokale variabelen (in de rapportrenderer staan daar open
antwoorden en organisatienamen in), geen request-body, geen headers of cookies
(x-api-key en x-admin-token zijn sleutels). Een event bevat alleen de fout, de
stacktrace, de methode en het pad.
"""
from __future__ import annotations

import logging
from typing import Any

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

logger = logging.getLogger("loep.report")

# De frontend herkent de melding aan deze openingszin
# (frontend/lib/report-download-error.ts, REPORT_FAILED_PREFIX).
REPORT_FAILED_PREFIX = "Het rapport kon niet worden gemaakt."
REPORT_FAILED_REPORTED = (
    REPORT_FAILED_PREFIX
    + " Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging."
    + " Je hoeft verder niets te doen. Probeer het later gerust opnieuw."
)
# Zonder Sentry (geen DSN) kan Loep niet beloven dat er een melding is.
REPORT_FAILED_UNREPORTED = (
    REPORT_FAILED_PREFIX
    + " Probeer het later opnieuw. Lukt het dan nog niet, mail dan naar hallo@getloep.nl."
)


def strip_request_details(event: dict[str, Any], hint: dict[str, Any]) -> dict[str, Any]:
    """before_send: van het request blijven alleen methode en url (zonder query) over."""
    request = event.get("request")
    if isinstance(request, dict):
        event["request"] = {key: request[key] for key in ("method", "url") if key in request}
    return event


def sentry_options(*, dsn: str, environment: str) -> dict[str, Any]:
    return {
        "dsn": dsn,
        "integrations": [FastApiIntegration(), SqlalchemyIntegration()],
        "traces_sample_rate": 0.2,
        "environment": environment,
        "send_default_pii": False,
        "include_local_variables": False,
        "max_request_body_size": "never",
        "before_send": strip_request_details,
    }


def init_sentry(*, dsn: str, environment: str, **overrides: Any) -> None:
    sentry_sdk.init(**{**sentry_options(dsn=dsn, environment=environment), **overrides})


class ReportGenerationFailed(Exception):
    """Rapportgeneratie mislukt en is al gemeld. De handler in backend/main.py
    maakt er een 500 met vaste tekst van. Bewust zonder status_code-attribuut:
    dan meldt de FastAPI-integratie hem niet nog een keer."""

    def __init__(self, *, reported: bool) -> None:
        self.reported = reported
        super().__init__(REPORT_FAILED_REPORTED if reported else REPORT_FAILED_UNREPORTED)

    @property
    def detail(self) -> str:
        return REPORT_FAILED_REPORTED if self.reported else REPORT_FAILED_UNREPORTED


def report_generation_failed(
    exc: BaseException, *, campaign_id: str, scan_type: str | None, route: str
) -> ReportGenerationFailed:
    """Meldt de fout bij Sentry (tags, geen persoonsgegevens) en geeft de
    exceptie terug die de route moet gooien: `raise report_generation_failed(...) from exc`."""
    logger.error(
        "Rapportgeneratie mislukt (campaign_id=%s, scan_type=%s, route=%s): %r",
        campaign_id,
        scan_type,
        route,
        exc,
    )
    with sentry_sdk.new_scope() as scope:
        scope.set_tag("campaign_id", campaign_id)
        scope.set_tag("scan_type", scan_type or "onbekend")
        scope.set_tag("report_route", route)
        event_id = scope.capture_exception(exc)
    return ReportGenerationFailed(reported=event_id is not None)
```

Controleer na het schrijven met de geïnstalleerde SDK dat `Scope.capture_exception` bestaat en een event-id teruggeeft (`python -c "import sentry_sdk; help(sentry_sdk.Scope.capture_exception)"`). Bestaat hij niet in deze vorm, gebruik dan binnen de `with` `event_id = sentry_sdk.capture_exception(exc)`; de tests in Task 5 bewijzen welke vorm de tags meeneemt.

- [ ] **Step 4: Gebruik de init in `backend/main.py`**

Vervang regels 25-40 (de `import sentry_sdk`, de twee integratie-imports en het `if _SENTRY_DSN:`-blok) door:

```python
import sentry_sdk

from backend.observability import ReportGenerationFailed, init_sentry, report_generation_failed

_SENTRY_DSN = os.getenv("SENTRY_DSN")
if _SENTRY_DSN:
    init_sentry(dsn=_SENTRY_DSN, environment=os.getenv("ENVIRONMENT", "production"))
```

Laat `from openpyxl import load_workbook` staan (die stond ertussen; zet hem direct onder `import sentry_sdk` of waar hij hoort in de importvolgorde). `sentry_sdk` blijft geïmporteerd omdat andere plekken in `main.py` `sentry_sdk.capture_message`/`capture_exception` gebruiken. Controleer met `grep -n "FastApiIntegration\|SqlalchemyIntegration" backend/main.py` dat er geen ongebruikte import overblijft.

- [ ] **Step 5: Bovengrens op sentry-sdk**

In `requirements.txt` regel 47: `sentry-sdk[fastapi]>=2.0.0` wordt `sentry-sdk[fastapi]>=2.0.0,<3`. Reden (in je rapport, niet in het bestand): de tests leunen op het gedrag van de 2.x-integratie, en een onbegrensde pin brak Railway op 4-10.

- [ ] **Step 6: Draai de tests**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_failure_sentry.py tests/test_python311_syntax_guard.py -q -p no:cacheprovider`
Expected: alle tests in deze twee bestanden groen.

- [ ] **Step 7: Commit**

```bash
git add backend/observability.py tests/test_report_failure_sentry.py
git commit -m "feat(sentry): init zonder lokale variabelen, body of headers; helper voor mislukte rapportgeneratie

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- backend/observability.py backend/main.py requirements.txt tests/test_report_failure_sentry.py
```

---

### Task 5: Rapportroutes melden via de helper

**Files:**
- Modify: `backend/main.py` (`_pdf_of_410`, `download_report`, `download_report_internal`, `report_html_preview`, `report_html_pdf`, plus één exception-handler naast de bestaande DB-handlers rond regel 682-695)
- Test: `tests/test_report_failure_sentry.py` (tweede deel)

- [ ] **Step 1: Voeg de falende routetests toe**

Voeg toe aan `tests/test_report_failure_sentry.py`:

```python
from datetime import datetime, timezone
from unittest.mock import patch

from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse

GEHEIME_ORG = "Bosman Vertrouwelijk BV"
GEHEIME_METING = "Behoud Q3 Bosman Geheim"
GEHEIME_TEKST = "Mijn leidinggevende Jan Jansen negeert mij al maanden"
API_KEY = "sleutel-die-nooit-in-sentry-mag"


def _meting(db: Session, *, scan_type: str = "retention") -> str:
    org = Organization(name=GEHEIME_ORG, slug="org-sentry", contact_email="hr@bosman.nl")
    db.add(org)
    db.flush()
    db.add(OrganizationSecret(org_id=org.id, api_key=API_KEY))
    camp = Campaign(organization=org, name=GEHEIME_METING, scan_type=scan_type, is_active=False,
                    closed_at=datetime(2026, 9, 1, tzinfo=timezone.utc))
    db.add(camp)
    db.commit()
    return camp.id


def _renderfout(*args, **kwargs):
    # Bewust zonder persoonsgegevens: de fout zelf mag in Sentry.
    raise RuntimeError("weasyprint: lettertype ontbreekt")


def _alle_events_tekst(vanger) -> str:
    sentry_sdk.flush()
    return json.dumps(vanger.events, default=str)


def _assert_een_schoon_event(vanger, *, campaign_id: str, scan_type: str, route: str) -> dict:
    tekst = _alle_events_tekst(vanger)
    assert len(vanger.events) == 1, tekst
    event = vanger.events[0]
    assert event["tags"]["campaign_id"] == campaign_id
    assert event["tags"]["scan_type"] == scan_type
    assert event["tags"]["report_route"] == route
    assert "lettertype ontbreekt" in tekst  # de foutmelding zit erin
    assert event["exception"]["values"][-1]["stacktrace"]["frames"]  # en de stacktrace
    for verboden in (GEHEIME_ORG, GEHEIME_METING, GEHEIME_TEKST, API_KEY, "hr@bosman.nl"):
        assert verboden not in tekst, verboden
    for frame in event["exception"]["values"][-1]["stacktrace"]["frames"]:
        assert "vars" not in frame
    return event


def test_klantroute_pdf_meldt_precies_een_event_en_geeft_vaste_melding(client, db_session, sentry_vanger):
    cid = _meting(db_session)
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": API_KEY})
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    assert "lettertype" not in res.text and cid not in res.text
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="retention", route="klant_pdf")


def test_interne_route_pdf_meldt_precies_een_event(client, db_session, sentry_vanger):
    cid = _meting(db_session, scan_type="exit")
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/internal/campaigns/{cid}/report")
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="exit", route="intern_pdf")


def test_segmentexport_meldt_precies_een_event(client, db_session, sentry_vanger):
    cid = _meting(db_session, scan_type="culture_assessment")
    with patch("backend.report.generate_culture_assessment_segment_summary_export", side_effect=_renderfout):
        res = client.get(f"/api/internal/campaigns/{cid}/report?format=segment_summary")
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="culture_assessment", route="intern_segment")


def test_html_preview_en_html_pdf_melden_ook(client, db_session, sentry_vanger):
    cid = _meting(db_session)
    with patch("backend.report_html.build_report_data", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report-preview")
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="retention", route="html_preview")
    sentry_vanger.events.clear()
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report-html")
    assert res.status_code == 500
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="retention", route="html_pdf")


def test_zonder_sentry_belooft_de_melding_geen_melding(client, db_session):
    cid = _meting(db_session)
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": API_KEY})
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_UNREPORTED}


def test_410_na_opschoning_is_geen_fout_in_sentry(client, db_session, sentry_vanger):
    from sqlalchemy import text

    db_session.execute(text("alter table campaigns add column data_purged_at timestamp"))
    cid = _meting(db_session)
    db_session.execute(text("update campaigns set data_purged_at = :ts where id = :id"),
                       {"ts": datetime(2027, 1, 2, 3, 0), "id": cid})
    db_session.commit()
    res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": API_KEY})
    assert res.status_code == 410
    assert "verwijderd" in res.json()["detail"]
    sentry_sdk.flush()
    assert sentry_vanger.events == []


def test_422_onbekend_product_is_geen_fout_in_sentry(client, db_session, sentry_vanger):
    from backend import main as backend_main

    cid = _meting(db_session)
    with patch.object(backend_main, "_get_report_unavailable_product_name", return_value="Loep Proef"):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": API_KEY})
    assert res.status_code == 422
    sentry_sdk.flush()
    assert sentry_vanger.events == []


def test_422_segmentexport_valueerror_is_geen_fout_in_sentry(client, db_session, sentry_vanger):
    cid = _meting(db_session, scan_type="culture_assessment")
    with patch("backend.report.generate_culture_assessment_segment_summary_export",
               side_effect=ValueError("Te weinig respondenten voor een segmentexport.")):
        res = client.get(f"/api/internal/campaigns/{cid}/report?format=segment_summary")
    assert res.status_code == 422
    sentry_sdk.flush()
    assert sentry_vanger.events == []
```

`Respondent` en `SurveyResponse` zijn geïmporteerd voor als je een meting met een open antwoord wilt seeden zodat `GEHEIME_TEKST` echt in de database staat: doe dat in `_meting` (een respondent met `completed=True` en een `SurveyResponse` met `open_text_raw=GEHEIME_TEKST`; kijk in `backend/models.py` welke kolommen verplicht zijn). Zo bewijst de PII-check iets. Haal de import weg als het niet lukt en noem dat in je rapport.

Controleer vooraf in `backend/main.py` of de admin-token-routes (`/report-preview`, `/report-html`, `/api/internal/...`) zonder `x-admin-token` werken in de testomgeving (`_IS_PRODUCTION` en `require_backend_admin_token`); `tests/test_data_retention_report.py` roept de interne route ook zonder header aan, dus dat hoort te werken.

- [ ] **Step 2: Draai en zie de nieuwe routetests falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_failure_sentry.py -q -p no:cacheprovider`
Expected: de routetests falen (ruwe melding of "Internal Server Error", en/of 2 events of 0 tags). Noteer in je rapport hoeveel events de oude code per test gaf: dat is het bewijs voor de premisse in "Context".

- [ ] **Step 3: Exception-handler**

Voeg in `backend/main.py` direct na `db_general_error_handler` (rond regel 695) toe:

```python
@app.exception_handler(ReportGenerationFailed)
async def report_generation_failed_handler(request: Request, exc: ReportGenerationFailed):
    # Al gemeld in report_generation_failed(); de klant krijgt alleen de vaste tekst.
    return JSONResponse(status_code=500, content={"detail": exc.detail})
```

- [ ] **Step 4: `_pdf_of_410` meldt**

Vervang `_pdf_of_410` door:

```python
def _pdf_of_410(campaign_id: str, db: Session, *, scan_type: str | None, route: str) -> tuple[bytes, str]:
    """_generate_report_pdf voor de PDF-routes. Landt de opschoning tussen de
    controle in de route en de generatie, dan alsnog een 410 in plaats van een
    500 (_generate_report_pdf controleert zelf opnieuw). Elke andere fout gaat
    naar Sentry en wordt een 500 met vaste tekst (spec 2026-10-08, punt 2).
    Databasefouten blijven bij de bestaande 503-handlers."""
    try:
        return _generate_report_pdf(campaign_id, db)
    except ReportDataPurged as exc:
        raise _gone(exc) from exc
    except SQLAlchemyError:
        raise
    except Exception as exc:
        raise report_generation_failed(exc, campaign_id=campaign_id, scan_type=scan_type, route=route) from exc
```

En in de twee routes:
- `download_report`: `export_bytes, design = _pdf_of_410(campaign_id, db, scan_type=campaign.scan_type, route="klant_pdf")`
- `download_report_internal`: `... route="intern_pdf")`

- [ ] **Step 5: Segmentexport**

In beide routes de regel

```python
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Exportgeneratie mislukt: {e}")
```

vervangen door (met `route="klant_segment"` in `download_report` en `route="intern_segment"` in `download_report_internal`):

```python
        except Exception as e:
            raise report_generation_failed(
                e, campaign_id=campaign_id, scan_type=campaign.scan_type, route="intern_segment"
            ) from e
```

De `except ValueError`-tak (422) erboven blijft ongewijzigd en blijft vóór deze tak staan. (De klantroute weigert `segment_summary` al met 403 bovenaan; laat die code staan, alleen de melding gaat via de helper.)

- [ ] **Step 6: HTML-preview en HTML-PDF**

In `report_html_preview`: `raise HTTPException(status_code=500, detail=f"HTML-rapport generatie mislukt: {e}")` wordt

```python
        raise report_generation_failed(
            e, campaign_id=campaign_id, scan_type=campaign.scan_type, route="html_preview"
        ) from e
```

In `report_html_pdf`: `raise HTTPException(status_code=500, detail=f"WeasyPrint PDF generatie mislukt: {e}")` wordt hetzelfde met `route="html_pdf"`. De `except ValueError`-takken (422) blijven.

- [ ] **Step 7: Geen ruwe rapportfout meer naar buiten**

Run: `grep -n "Exportgeneratie mislukt\|generatie mislukt: {e}" backend/main.py`
Expected: geen treffers.

- [ ] **Step 8: Draai de tests**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_failure_sentry.py tests/test_report_generation_fallback.py tests/test_data_retention_report.py tests/test_culture_assessment_route_contract.py tests/test_api_flows.py tests/test_python311_syntax_guard.py -q -p no:cacheprovider`
Expected: `test_report_failure_sentry.py` volledig groen; de andere bestanden geen nieuwe failures ten opzichte van de baseline-faalset. Als een bestaande test de oude tekst `Exportgeneratie mislukt` pint, werk hem bij naar `REPORT_FAILED_PREFIX` en noem dat.

- [ ] **Step 9: Commit**

```bash
git add backend/main.py tests/test_report_failure_sentry.py
git commit -m "fix(rapport): mislukte rapportgeneratie gaat getagd naar Sentry; klant krijgt vaste melding

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- backend/main.py tests/test_report_failure_sentry.py
```

---

### Task 6: Rapportproxy laat geen fout stil verdwijnen

**Files:**
- Modify: `frontend/app/api/campaigns/[id]/report/route.ts`
- Create: `frontend/app/api/campaigns/[id]/report/route.failures.test.ts`

De frontend-Sentry staat uit (`frontend/sentry.server.config.ts` exporteert niets). Een fout in de proxy moet dus minstens in de Vercel-logs staan, en een onbereikbare backend mag geen kale 500 van Next geven. Log alleen het campagne-id en de status, nooit de organisatiesleutel of de campagnenaam.

- [ ] **Step 1: Schrijf de falende tests**

Maak `frontend/app/api/campaigns/[id]/report/route.failures.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

function tabel(data: unknown) {
  const q: Record<string, unknown> = {}
  q.select = () => q
  q.eq = () => q
  q.maybeSingle = async () => ({ data, error: null })
  q.single = async () => ({ data, error: null })
  return q
}

const supabase = {
  auth: { getUser: async () => ({ data: { user: { id: 'gebruiker-1' } } }) },
  from: (t: string) =>
    t === 'profiles'
      ? tabel({ is_verisight_admin: false })
      : t === 'campaigns'
        ? tabel({ organization_id: 'org-1', name: 'Geheime meting', scan_type: 'retention' })
        : tabel({ role: 'owner' }),
}

vi.mock('@/lib/supabase/server', () => ({ createClient: async () => supabase }))
vi.mock('@/lib/organization-secrets', () => ({ getOrganizationApiKey: async () => 'org-sleutel-geheim' }))
vi.mock('@/lib/server-env', () => ({ getBackendApiUrl: () => 'https://backend.test' }))

import { GET } from './route'

const ctx = { params: Promise.resolve({ id: 'meting-123' }) }
const verzoek = () => new Request('https://app.test/api/campaigns/meting-123/report')

let fout: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  fout = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  fout.mockRestore()
})

function gelogd(): string {
  return JSON.stringify(fout.mock.calls)
}

describe('rapportproxy: fouten verdwijnen niet stil', () => {
  it('logt de mislukte eerste poging en valt terug op de interne route', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(new Response('%PDF', { status: 200, headers: { 'content-type': 'application/pdf' } }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(gelogd()).toContain('[rapportproxy]')
    expect(gelogd()).toContain('meting-123')
    expect(gelogd()).toContain('ECONNRESET')
    expect(gelogd()).not.toContain('org-sleutel-geheim')
    expect(gelogd()).not.toContain('Geheime meting')
  })

  it('geeft een nette 502 als de backend helemaal niet bereikbaar is', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ENOTFOUND backend.test')))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({
      detail: 'De rapportserver is nu niet bereikbaar. Probeer het later opnieuw.',
    })
    expect(gelogd()).toContain('ENOTFOUND')
    expect(gelogd()).not.toContain('org-sleutel-geheim')
  })

  it('logt een 5xx van de backend en geeft de backendmelding door', async () => {
    const backendBody = JSON.stringify({
      detail: 'Het rapport kon niet worden gemaakt. Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging. Je hoeft verder niets te doen. Probeer het later gerust opnieuw.',
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(backendBody, { status: 500 })))

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(500)
    expect((await res.json()).detail).toBe(backendBody)
    expect(gelogd()).toContain('500')
    expect(gelogd()).toContain('meting-123')
  })

  it('logt een 410 of 422 niet als fout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'weg' }), { status: 410 })),
    )

    const res = await GET(verzoek(), ctx)

    expect(res.status).toBe(410)
    expect(fout).not.toHaveBeenCalled()
  })
})
```

Controleer vooraf in `permissions.ts` dat `canDownloadCampaignReport({ format: 'pdf', scanType: 'retention', isVerisightAdmin: false, membershipRole: 'owner' })` `true` geeft; anders past de mock de rol aan.

- [ ] **Step 2: Draai en zie falen**

Run (vanuit `frontend/`): `npx vitest run "app/api/campaigns/[id]/report/route.failures.test.ts"`
Expected: test 1 faalt (geen log), test 2 faalt (onafgehandelde rejectie in plaats van 502), test 3 faalt (geen log). Test 4 kan al slagen.

- [ ] **Step 3: Pas `route.ts` aan**

Voeg boven `export async function GET` toe:

```ts
const BACKEND_ONBEREIKBAAR = 'De rapportserver is nu niet bereikbaar. Probeer het later opnieuw.'

// De frontend-Sentry staat uit; deze regels landen in de Vercel-logs. Alleen
// het campagne-id en de fout, nooit de organisatiesleutel of de campagnenaam.
function logProxyFout(campaignId: string, stap: string, fout: unknown) {
  const melding = fout instanceof Error ? fout.message : String(fout)
  console.error(`[rapportproxy] ${stap}`, { campaignId, fout: melding })
}
```

Vervang het blok vanaf `let backendResponse: globalThis.Response | null = null` tot en met de `if (!backendResponse) { ... }`-check door:

```ts
  let backendResponse: globalThis.Response | null = null

  try {
    if (format === 'segment_summary') {
      backendResponse = await fetchInternalReport()
    } else {
      try {
        const apiKey = await getOrganizationApiKey(campaign.organization_id, { supabase })
        backendResponse = await fetch(backendUrl, {
          headers: {
            'x-api-key': apiKey,
          },
          cache: 'no-store',
        })

        if (backendResponse.status === 401 || backendResponse.status === 403) {
          backendResponse = await fetchInternalReport()
        }
      } catch (error) {
        logProxyFout(id, 'eerste poging via de organisatiesleutel mislukt, terugval op de interne route', error)
        backendResponse = await fetchInternalReport()
      }
    }
  } catch (error) {
    logProxyFout(id, 'backend niet bereikbaar', error)
    return NextResponse.json({ detail: BACKEND_ONBEREIKBAAR }, { status: 502 })
  }

  if (!backendResponse) {
    logProxyFout(id, 'geen antwoord van de backend', 'leeg antwoord')
    return NextResponse.json({ detail: 'Rapportproxy kon niet worden gestart.' }, { status: 502 })
  }
```

En in de `if (!backendResponse.ok)`-tak, direct na `const detail = await backendResponse.text()`:

```ts
    if (backendResponse.status >= 500) {
      logProxyFout(id, `backend gaf status ${backendResponse.status}`, detail.slice(0, 300))
    }
```

De bestaande sourcetest in `route.test.ts` ("routes governed culture segment export ...") verwacht `if (format === 'segment_summary')` en `fetch(backendInternalUrl`; beide blijven in de code staan.

- [ ] **Step 4: Draai de tests**

Run (vanuit `frontend/`): `npx vitest run "app/api/campaigns/[id]/report/"`
Expected: alle tests in beide bestanden groen.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/api/campaigns/[id]/report/route.failures.test.ts"
git commit -m "fix(rapportproxy): fouten worden gelogd en een onbereikbare backend geeft een nette 502

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- "frontend/app/api/campaigns/[id]/report/route.ts" "frontend/app/api/campaigns/[id]/report/route.failures.test.ts"
```

---

### Task 7: Downloadknop toont de vaste melding

**Files:**
- Modify: `frontend/lib/report-download-error.ts`
- Modify: `frontend/lib/report-download-error.test.ts`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx`

- [ ] **Step 1: Schrijf de falende tests**

Voeg toe aan `frontend/lib/report-download-error.test.ts` (importeer `reportFailureMessage` naast de bestaande imports, en `readFileSync` uit `node:fs`):

```ts
describe('reportFailureMessage (vaste 500-melding van de backend)', () => {
  const gemeld =
    'Het rapport kon niet worden gemaakt. Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging. Je hoeft verder niets te doen. Probeer het later gerust opnieuw.'

  it('neemt de backendzin over uit de geneste FastAPI-body', () => {
    expect(reportFailureMessage(500, JSON.stringify({ detail: gemeld }))).toBe(gemeld)
  })

  it('geeft null bij een andere status, ook met dezelfde zin', () => {
    expect(reportFailureMessage(502, JSON.stringify({ detail: gemeld }))).toBeNull()
  })

  it('geeft null bij een andere 500-melding: dan blijft de technische regel zichtbaar', () => {
    expect(reportFailureMessage(500, 'Internal Server Error')).toBeNull()
    expect(reportFailureMessage(500, null)).toBeNull()
  })

  it('geeft null bij een onverwacht lange tekst met hetzelfde begin', () => {
    expect(reportFailureMessage(500, `Het rapport kon niet worden gemaakt. ${'x'.repeat(400)}`)).toBeNull()
  })

  it('herkent precies de zinnen die de backend stuurt', () => {
    const backend = readFileSync(new URL('../../backend/observability.py', import.meta.url), 'utf8')
    expect(backend).toContain('REPORT_FAILED_PREFIX = "Het rapport kon niet worden gemaakt."')
    expect(backend).toContain('Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging.')
  })

  it('gebruikt nergens een em-dash of en-dash', () => {
    expect(gemeld).not.toMatch(/[\u2013\u2014]/)
  })
})
```

Maak ook een sourceguard in hetzelfde bestand:

```ts
describe('downloadknop gebruikt de vaste melding', () => {
  it('toont reportFailureMessage als hoofdzin zonder technische regel', () => {
    const knop = readFileSync(
      new URL('../app/(dashboard)/campaigns/[id]/pdf-download-button.tsx', import.meta.url),
      'utf8',
    )
    expect(knop).toContain('reportFailureMessage(response.status, rawDetail)')
  })
})
```

- [ ] **Step 2: Draai en zie falen**

Run (vanuit `frontend/`): `npx vitest run lib/report-download-error.test.ts`
Expected: FAIL (`reportFailureMessage` bestaat niet).

- [ ] **Step 3: Implementeer de helper**

Voeg in `frontend/lib/report-download-error.ts` na `purgedDownloadMessage` toe:

```ts
/** Begin van de vaste 500-melding van de backend (backend/observability.py, REPORT_FAILED_PREFIX). */
const REPORT_FAILED_PREFIX = 'Het rapport kon niet worden gemaakt.'

/**
 * Bij een mislukte rapportgeneratie stuurt de backend een vaste zin die zegt
 * of Loep een melding heeft gekregen. Die zin is dan de hoofdmelding; een
 * technische regel eronder zou hem alleen herhalen. Null als het geen
 * herkende melding is: dan blijven downloadErrorMessage plus de technische
 * melding gelden (Fail Loud bij een onbekende fout).
 */
export function reportFailureMessage(status: number, detail: unknown): string | null {
  if (status !== 500) return null
  const value = unwrapDetail(detail)
  if (value === null || !value.startsWith(REPORT_FAILED_PREFIX)) return null
  if (value.length > MAX_TECHNICAL_DETAIL_LENGTH) return null
  return value
}
```

- [ ] **Step 4: Gebruik hem in de knop**

In `pdf-download-button.tsx`: importeer `reportFailureMessage` naast de andere drie, en vervang

```tsx
        const purgedMessage = purgedDownloadMessage(response.status, rawDetail)
        setError(
          purgedMessage
            ? { message: purgedMessage, technical: null }
```

door

```tsx
        // 500 bij een mislukte rapportgeneratie: de vaste backendzin zegt al
        // wat er gebeurt en of Loep een melding kreeg; geen technische regel.
        const knownMessage =
          purgedDownloadMessage(response.status, rawDetail) ??
          reportFailureMessage(response.status, rawDetail)
        setError(
          knownMessage
            ? { message: knownMessage, technical: null }
```

Pas het commentaar boven de oude regel aan zodat het beide gevallen noemt.

- [ ] **Step 5: Draai de tests en tsc**

Run (vanuit `frontend/`): `npx vitest run lib/report-download-error.test.ts && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: tests groen; tsc 131.

- [ ] **Step 6: Commit**

```bash
git commit -m "fix(rapportknop): toont de vaste melding van de backend bij een mislukte rapportgeneratie

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- frontend/lib/report-download-error.ts frontend/lib/report-download-error.test.ts "frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx"
```

---

## Afronding (controller)

### Task 8: Volledige gate, browsercheck en verslag

- [ ] **Step 1: Volledige suites en faalset-vergelijking**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -p no:cacheprovider -rf > <scratchpad>/pytest-na.log 2>&1
grep "^FAILED" <scratchpad>/pytest-na.log | sed 's/ - .*//' | sort > <scratchpad>/pytest-na-fails.txt
diff <scratchpad>/pytest-baseline-fails.txt <scratchpad>/pytest-na-fails.txt
cd frontend && npx tsc --noEmit 2>&1 | grep -c "error TS"
cd frontend && npx vitest run --reporter=json --outputFile=<scratchpad>/vitest-na.json
```
Expected: lege `diff`; tsc 131; vitest-faalset identiek aan de baseline (zelfde extractie als voor de baseline).

- [ ] **Step 2: Frontend-build**

```bash
cd frontend && RESEND_API_KEY=dummy NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npm run build
```
Expected: build groen. Daarna `git status` schoon (geen `package-lock.json`-wijziging; anders `git checkout -- package-lock.json`).

- [ ] **Step 3: Gedragsscript opnieuw op de eindstand**

Draai Task 2 nog één keer op de eindstand van de branch. Expected: `ALLE GEVALLEN ZOALS VERWACHT`.

- [ ] **Step 4: Browsercheck downloadmelding (lokaal)**

Start de backend lokaal tegen een wegwerp-SQLite en de frontend op een vrije poort is te zwaar (de frontend heeft Supabase-auth nodig). Daarom: render de knop niet, maar bewijs de keten met de tests van Task 6 en 7. Noteer in het verslag dat de visuele check van de melding bij de knop na de deploy door de hoofdsessie op de testklant gebeurt (door tijdelijk geen rapport te kunnen maken is lastig op productie; de hoofdsessie beslist of dat nodig is).

- [ ] **Step 5: Verslag**

Schrijf `docs/superpowers/plans/2026-10-08-beveiliging-voor-eerste-klant-uitvoering.md` met:
1. Per taak: commits, wat de spec-review en de codekwaliteitsreview vonden, wat daarmee gedaan is.
2. **Lezers van `campaign_stats` en `survey_responses`**: tabel met bestand:regel, client (user-client onder RLS of service-role), wat er gelezen wordt, en waarom de uitvoer gelijk blijft (user-client: byte-gelijk bewezen per rol in het gedragsscript; service-role: ziet alles voor en na, ook bewezen; backend: leest via SQLAlchemy met een directe verbinding, raakt de view niet).
3. De voor/na-snapshot van `lidA_owner` uit het gedragsscript, letterlijk.
4. Faalset-vergelijking (backend, tsc, vitest) met de getallen.
5. **Wat Lars moet doen**: migratie draaien (Blok A van de controlequery vóór en na, Blok B en C na), Railway-redeploy voor de Sentry-wijziging, en de volgorde met reden.
6. Wat bewust niet gedaan is en waarom (anon krijgt nu een fout in plaats van een lege lijst op `campaign_stats`; beheer/campagnes gebruikt een kale link en toont bij een fout de JSON-melding, alleen voor de operator; frontend-Sentry blijft uit).

- [ ] **Step 6: Commit het verslag**

```bash
git commit -m "docs: uitvoeringsverslag beveiliging voor eerste klant

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- docs/superpowers/plans/2026-10-08-beveiliging-voor-eerste-klant-uitvoering.md
```
