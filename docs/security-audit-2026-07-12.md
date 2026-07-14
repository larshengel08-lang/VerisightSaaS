# Security-audit Loep-platform — 2026-07-12

**Scope:** volledige adversariële audit. Next.js frontend (Vercel), FastAPI backend (Railway), Supabase Postgres/Auth.
**Methode:** vijf parallelle sporen, elke bevinding geverifieerd tegen de echte code (geen theoretische findings). De zwaarste bevindingen zijn onafhankelijk door de hoofdauditor tegen de exacte regels bevestigd.
**Vorige audit:** 2026-07-03 (opnieuw nagelopen — zie herverificatie).
**Status fixes (branch `security/audit-2026-07-12`, gepusht → origin):**
- **L1/L2** — gecommit (Vercel env-dumps + `.tmp/`-boom untracked, `.gitignore`-glob gehard).
- **M1** — gecommit + 4 tests (contact-requests admin-gate).
- **M5** — gecommit (signup e-mail-enumeratie dicht).
- **L3** — gecommit (progress-nudge timing-safe token-compare).
- **L5** — gecommit (verbruikt `token_hash` uit de URL gestript na verifyOtp).
- **L8** — gecommit (`set search_path = public` op de 4 SECURITY DEFINER-helpers).
- **L10** — gecommit + 4 tests (open-redirect guard `safeInternalPath` op auth/callback + qa-login).
- **M4 (deels)** — gecommit (honeypot op élk contact-pad, ook de Supabase-fallback).
- **M7** — gecommit (open-tekst-sanitizers gelijk + eerlijker rapport-label).
- **L7** — **al afgehandeld, geen fix nodig**: `_openai_available = False` staat hardcoded uit (backend/main.py:116) met comment dat herinschakelen toestemming + DPA vereist.
- **L9** — gefixt door de parallelle sessie (`connect-src` leidt de backend-host af uit `NEXT_PUBLIC_API_URL`).
- **H2** — code + SQL klaar (RPC-guard → `is_verisight_admin_user`).
- **H1** — **code + migratie klaar** (`migrations/2026_07_13_lock_individual_data_to_operator.sql`): gevoelige reads via service-role (open-antwoorden, campagne-beheer, resend-reminders); add-respondents-insert via nieuwe service-role server-action; de 6 department/tellingen-reads blijven via de respondents-column-grant. **Vondst tijdens implementatie:** `campaign_stats` is een `security_invoker`-view die `survey_responses` joint en óók via de service-role wordt gelezen → een volledige `survey_responses`-revoke zou het klant-dashboard breken. Opgelost met een column-grant op alléén de aggregatiekolommen (`id, respondent_id, risk_score, risk_band`); alle ruwe antwoorden/open tekst/scoredetails + respondent-PII (token/email/role_level/exit_month/salary) gaan dicht. **Residu:** per-respondent `risk_band` (afgeleide risicoband, geen naam/tekst/antwoorden) blijft leesbaar. **Optionele hardening** om óók dat te verbergen: `campaign_stats` herschrijven naar een security-definer view met multi-rol tenancy-predicate (klant/operator/service-role) — vereist live Supabase-verificatie, aparte beslissing.
- **H3** — live geverifieerd geen risico (LOW, alleen bron-opschoning).
- tsc **133 = baseline**, testsuite **65 falend = baseline (0 nieuwe regressies)**, 8 nieuwe tests groen.
- **Go-live H1/H2:** (1) push + Vercel-deploy frontend, (2) daarna de revoke-migratie in Supabase draaien, (3) verifieer: klant-JWT kan geen `survey_responses`/respondent-PII meer via PostgREST lezen én operator-schermen (open-antwoorden, beheer, add-respondents) blijven werken.
- **Nog open (code, vereist edge/infra of live-verificatie):** M2 (survey ballot-stuffing — echte fix = CAPTCHA/edge-WAF, niet in-memory), M4-rest (XFF-trust rate-limit-key — proxy-specifiek, hoort bij edge/WAF), M6 (CSP `unsafe-inline` → nonce — defense-in-depth, geen actief XSS-punt gevonden; vereist live verificatie incl. ingelogde schermen), campaign_stats definer-view-hardening (H1-residu, live Supabase-test).
- **Nog open (jouw config/infra):** M3 (auth-rate-limiter → Vercel Firewall / Supabase Auth), L4 (wachtwoordbeleid Supabase Auth), L6 (retentie/purge-job → scheduler).
- **Low, bewust overgeslagen:** L11 (action_center wordt uitgefaseerd), L12 (member-rol nu ongebruikt).

> **Disclaimer:** dit is een AI-ondersteunde scan, geen vervanging voor een professionele pentest. Voor een systeem met inloggegevens + persoonsgegevens richting schaal: laat dit t.z.t. door een gekwalificeerd securitybureau toetsen. Gebruik dit als eerste laag.

---

## TL;DR

De architectuur is fundamenteel gezond: geen enkel gelekt live-secret in de git-history, alle 2026-07-03-fixes zijn nog intact, CORS is netjes gescoped, survey-submit is mass-assignment-safe, en de admin-token-guards zijn fail-closed en timing-safe.

Kernprobleem: de RLS-isolatie **tussen** tenants klopt, maar de rol-scheiding **binnen** een tenant niet. Elk org-lid (owner/member/viewer) kan via PostgREST de ruwe individuele antwoorden lezen én de operator-API-sleutel ophalen — buiten de aggregatielaag (n≥5/n≥10) om. Dat breekt de anonimiteitsbelofte aan medewerkers. Plus één deploy-afhankelijk cross-tenant risico (schema-drift) dat alleen tegen de live database is af te vinken.

**Rolcontext (Lars, 2026-07-12):** klant-HR krijgt in principe de **owner**-rol; de viewer-rol wordt nu niet gebruikt. Dit lost H1/H2 niet op — owner passeert álle rol-checks. De juiste grens is klant (elke rol) vs. Loep-operator (service-role). Zie de discussie onder H1/H2.

---

## Herverificatie vorige audit (2026-07-03) — alles nog intact ✅

| Fix (2026-07-03) | Status | Bewijs |
|---|---|---|
| `contact_requests` RLS aan + `revoke all from anon, authenticated` | ✅ intact | `supabase/schema.sql:1179-1180` |
| `require_backend_admin_token` hmac.compare_digest + fail-closed prod | ✅ intact | `backend/runtime.py:34-46` |
| `/api/internal/telemetry` timingSafeEqual + fail-closed | ✅ intact | `frontend/app/api/internal/telemetry/route.ts:13-23` |
| `campaign_stats` view `security_invoker = true` | ✅ intact (beide definities) | `schema.sql:2441` + `migrations/2026_06_17_add_closes_at.sql:14` |
| Survey-submit: UUID-token, tenant server-side, strikte Pydantic | ✅ intact | `backend/main.py:1618-1624`, `backend/schemas.py:338-406` |

---

## HIGH

### H1 — `is_org_member`-rol kan ruwe individuele antwoorden lezen → de-anonimisering (AVG)
- **Severity:** High (latent; wordt live zodra een klant-HR-login met org-rol bestaat)
- **Bestand:** `supabase/schema.sql:1418-1426` (respondents SELECT), `:1442-1452` (survey_responses SELECT); helper `is_org_member` `:1186-1197`
- **Bevestigd:** door hoofdauditor, direct tegen de regels.

Beide SELECT-policies gebruiken `is_org_member()`, dat álle rollen (owner/member/viewer) insluit. De n≥5/n≥10-drempels zitten alleen in de Python-rapportrenderer en de Next.js view-models — niet in de datalaag. De frontend leest via de anon-key + JWT van de gebruiker, dus PostgREST is de echte datalaag en RLS de enige poort.

**Scenario:** een ingelogde klant-HR (owner) opent devtools en draait `supabase.from('survey_responses').select('*, respondents(*)')`. RLS staat het toe. Hij krijgt elke individuele rij: `open_text_raw`, alle ruwe antwoorden, `submitted_at`, plus via de join `respondents.email` / `department` / `role_level`. In managed-mode is `respondents.email` gevuld → naam gekoppeld aan individuele antwoorden + open tekst. Bij kleine afdelingen = de-anonimisering van medewerkers door hun eigen management.

**Fix (architectonisch, niet een rolwissel):** `revoke all on public.respondents, public.survey_responses from anon, authenticated` (zoals bij `contact_requests`) en alle klant-reads die individuele data raken via de FastAPI-backend routeren, die als enige de drempels toepast. Klant leest dan nog alleen `campaign_stats` + backend-rapporten. Dit is meteen de self-service-veilige richting.

### H2 — `is_org_member`-rol kan de operator-API-sleutel ophalen → privilege-escalatie
- **Severity:** High
- **Bestand:** `supabase/schema.sql:1258-1284` (RPC `get_org_api_key_for_current_user`), grant `:1284`
- **Bevestigd:** door hoofdauditor, direct.

De RPC is `security definer`, enige guard is `is_org_member(target_org_id)` (`:1267`, viewers/owners slagen), en `grant execute ... to authenticated` (`:1284`). De tabel `organization_secrets` zelf is correct dicht (RLS aan, geen policy = deny-all, `:1151`) — de RPC is het gat.

**Scenario:** klant draait `supabase.rpc('get_org_api_key_for_current_user', { target_org_id })` en krijgt de ruwe `api_key`. Dat is de `x-api-key` die de publieke Railway-backend accepteert (`_get_org_by_api_key`, `backend/main.py:1583`). Daarmee kan hij campagnes aanmaken, respondenten importeren, `GET /api/campaigns/{id}/respondents` (ruwe respondent-metadata + survey-tokens). Niet cross-tenant (guard voorkomt andermans sleutel), maar breekt de anonimiteit/read-only-grens.

**Fix:** in dezelfde beweging als H1 — als de klant-boundary op service-role gaat, wordt de RPC voor klanten overbodig / achter de operator gezet. Zolang klanten wél een operator-rol houden, is dit inherent aan het self-service-model en moet de backend zelf per-endpoint aggregeren i.p.v. ruwe rijen teruggeven.

### H1/H2 — implementatie-inventaris (voor de bouw-sessie, besluit = optie a)

Read-only geïnventariseerd. Doel: klant (elke rol, incl. owner) leest **nooit** individuele respondent-data; alleen de Loep-operator (service-role / rechtstreeks Supabase). Geen voorwaardelijke/klant-facing escape hatch bouwen.

**SQL-laag (de eigenlijke poort — app-selects begrenzen het gat niet):**
- `revoke select on public.respondents, public.survey_responses from anon, authenticated`. **Let op: `revoke all` breekt de browser-side insert** in `components/dashboard/add-respondents-form.tsx:176` (managed-mode respondent toevoegen). Dus óf alleen `select` revoken (insert-grant + `org_managers_can_insert_respondents`-policy behouden), óf die insert eerst naar een server-action verplaatsen. `revoke select` is de kleinste veilige stap.
- H2: `get_org_api_key_for_current_user` (`schema.sql:1267`) guard van `is_org_member` → **`is_verisight_admin_user()`** (owner=member helpt niet). **Verifieer** dat de klant-rapportdownload dan via de service-role-fallback in `frontend/lib/organization-secrets.ts:29` blijft werken (niet via de RPC), anders breken PDF-downloads voor de klant.

**Frontend-leesplekken van `respondents`/`survey_responses`:**

Al veilig (service-role `createAdminClient`, blijven zoals ze zijn): `app/(dashboard)/action-center/page.tsx:250`, `lib/action-center-page-data.ts:258`, `lib/action-center-manager-results-notifications.ts:174,254`, en de API-routes (`action-center-manager-responses`, `action-center-review-rhythm`, `-route-actions/-closeouts/-reopens`, `organizations/[id]/route.ts`).

User-anon-client (RLS geldt → breken bij revoke → migreren naar `createAdminClient()` ná de bestaande campagne/lidmaatschaps-check die deze server-components toch al doen):
| Plek | Selecteert | Actie |
|---|---|---|
| `app/(dashboard)/dashboard/page.tsx:78` | `department` | alleen aggregatie → admin-client na check |
| `app/(dashboard)/campaigns/[id]/page.tsx:72` | `department` | idem |
| `app/(dashboard)/campaigns/[id]/setup/page.tsx:28` | `department` | idem |
| `app/(dashboard)/campaigns/[id]/setup/segment-actions.ts:51` | respondents | idem |
| `app/(dashboard)/campaigns/[id]/actions.ts:91` | respondents | idem |
| `app/(dashboard)/beheer/page.tsx:64` | count (head) | idem |
| `app/(dashboard)/beheer/get-beheer-page-data.ts:243` | count (head) | idem |
| `lib/managers-page-data.ts:339` | respondents | idem (check caller-client) |
| **`app/(dashboard)/campaigns/[id]/open-antwoorden/page.tsx:85,90`** | **`select('*')` incl. `open_text_raw`** | **GEVOELIG — per besluit (a) operator-only: gate op `is_verisight_admin` of uit klant-nav halen** |
| **`app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts:792,797`** | **`email`, `token`, scores** | **GEVOELIG — `email`/`token`-kolommen operator-only; klant krijgt hooguit geaggregeerde status** |

De 8 "department/count"-plekken zijn geen individuele data en mogen blijven (via service-role ná check). De 2 vetgedrukte plekken zijn de echte klant-lek en moeten per besluit (a) operator-only worden. Omvang totaal: ~8-10 bestanden + tests, ordegrootte een halve dag.

### H3 — Schema-drift: 4 tenant-tabellen zonder RLS in bepaalde SQL-artefacten (cross-tenant, deploy-afhankelijk) — LIVE BEVESTIGD GEEN RISICO
- **Severity:** was High → mogelijk Critical; **live geverifieerd: geen actueel risico** (zie onder). Blijft LOW als opschoning van de brondocumenten.
- **Bestanden:**
  - `supabase/schema.sql:2372` — `action_center_governance_interventions` aangemaakt, **nooit RLS in schema.sql**. RLS alleen in `supabase/action_center_constitution_adoption_readiness.sql:742`.
  - `supabase/billing_registry_patch.sql:1`, `proof_registry_patch.sql:1`, `suite_telemetry_events_patch.sql:1` — bare `create table`, géén RLS/policy/revoke. RLS alleen in `migrations/2026_04_27_add_real_usage_registry_tables.sql:93-155`.
- **Bevestigd:** codestaat door hoofdauditor bevestigd; live status onbekend.

Supabase geeft anon/authenticated standaard volledige CRUD op public-tabellen → RLS-uit = cross-tenant leesbaar/schrijfbaar.

**Scenario:** als prod is geprovisioneerd vanuit `schema.sql` zonder de constitution-patch, of vanuit een bare `*_patch.sql` zonder de 04-27-migratie, dumpt `GET /rest/v1/billing_registry?select=*` met de anon-key elke klant z'n contractstatus (`legal_customer_name`, `contract_state`), idem governance/case-proof/telemetry — over alle tenants.

**Eerste actie (feitelijk, geen discussie):** draai in de Supabase SQL Editor:
```sql
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('action_center_governance_interventions','billing_registry',
                  'case_proof_registry','suite_telemetry_events');
-- relrowsecurity = false  →  live cross-tenant lek, direct patchen
```
**Fix:** RLS-blok toevoegen aan `schema.sql` direct na regel 2424; de drie bare `*_patch.sql`-bestanden verwijderen (vervangen door de migratie) of de RLS-blokken eraan toevoegen.

**Live-check (Lars, 2026-07-12) — afgerond:** query gedraaid, geen afkapping (bevestigd, geen 4e rij). `billing_registry`, `case_proof_registry`, `suite_telemetry_events` → alle drie `relrowsecurity = true` (veilig). `action_center_governance_interventions` **komt niet voor** in `pg_class` — de tabel bestaat simpelweg nog niet op de live database (nooit aangemaakt, dus ook geen RLS-gat om te misbruiken). H3 is dus geen actueel risico. Blijft wel de moeite van het opschonen waard: mocht iemand ooit `schema.sql` los (zonder de constitution-patch) tegen een verse database draaien, ontstaat de tabel dan alsnog zonder RLS. Fix (RLS-blok toevoegen aan `schema.sql`, bare `*_patch.sql`-bestanden vervangen) kan dus rustig meegenomen worden in de hardening-ronde, geen spoed.

---

## MEDIUM

### M1 — `contact-requests` PATCH: confused deputy, elke ingelogde user kan lead-PII lezen/wijzigen
- **Bestand:** `frontend/app/api/contact-requests/[id]/route.ts:8-29` + `frontend/middleware.ts:119`
- **Bevestigd:** door hoofdauditor, direct.

De route checkt alléén dat de server `BACKEND_ADMIN_TOKEN` heeft, plakt die erop en forward't — geen caller-autorisatie. Middleware eist voor `/api/*` alleen dát er een sessie is, geen rol. Elke ingelogde user (ook een klant op willekeurige tenant) kan `PATCH /api/contact-requests/<uuid>`; de backend voert het uit onder admin-gezag en geeft het volledige lead-record terug (naam, work_email, org, ops-pipeline). Exact de tabel die 2026-07-03 werd dichtgezet. Gemitigeerd: geldige sessie nodig + UUID's niet te enumereren → Medium.
**Fix:** `is_verisight_admin === true` afdwingen vóór forwarden (zoals `frontend/app/api/action-center/workspace-members/route.ts:29-38`), anders 403. Rol-onafhankelijk, geïsoleerde fix.

### M2 — Open-survey ballot-stuffing: single-fill triviaal te omzeilen
- **Bestand:** `backend/main.py:1126-1228` (`open_survey_start`), `:1328-1502` (`submit_survey`), `backend/self_send.py:15-19`

De open self_send-link maakt bij elke POST een nieuwe anonieme respondent. Enige replay-guard is `dedup_key_hash`, maar `dedup_key` is client-supplied + optioneel — weglaten slaat de dedup-check over (`:1191 if dedup_hash:`). Geen rate limit, IP-cap of CAPTCHA. Iemand met de link kan ongelimiteerd respondenten aanmaken en de uitkomsten skewen → corrumpeert de rapportdeliverable. Personal-token (managed-invite) flow is wél veilig (409 op `completed`, `:1338-1339`).
**Fix:** per-IP/window rate limiting op `/survey/open/*/start` en `/survey/submit`; overweeg lichte proof-of-work/CAPTCHA en/of cap respondenten vs. `invited_count`.

### M3 — Auth-rate-limiter is cosmetisch + XFF-spoofbaar
- **Bestand:** `frontend/middleware.ts:59-77` (key op `:62`)
- **Bevestigd:** door hoofdauditor.

Limiter vuurt alleen op GET-pageloads van `/login`,`/signup`,`/auth`. De echte credential-calls (`signInWithPassword`, `resetPasswordForEmail`, `signUp`) gaan client-side rechtstreeks naar Supabase en passeren de middleware nooit. Keyt bovendien op de linker (client-gecontroleerde) `x-forwarded-for`-waarde → per request verse bucket. State is per-instance in-memory. Bescherming leunt volledig op Supabase's eigen server-side limieten.
**Fix:** throttlen op een echt chokepoint (Vercel Firewall / Supabase Auth-instellingen), keyen op de vertrouwde rechter-XFF-hop, of de misleidende in-memory-limiter verwijderen (Fail-Loud: geen control shippen die stil niets doet).

### M4 — Contact-form rate-limit XFF-spoofbaar + fallback-pad zonder honeypot/limiet
- **Bestand:** `backend/main.py:369-388` (`_get_client_ip`), `frontend/app/api/contact/route.ts:196-234` (Supabase-fallback)

Zelfde XFF-linkerwaarde-probleem als M3 → onbeperkte contact-spam/notificatiemails. Honeypot + rate-limit zitten alleen op het backend-pad; het Supabase-fallbackpad (bij backend 404/5xx/timeout) slaat de lead op en mailt zónder honeypot of limiet. (Mails zelf zijn HTML-escaped JSON naar Resend — geen header/HTML-injectie, dat deel is veilig.)
**Fix:** rate-limit-key uit vertrouwde XFF-hop; honeypot + limiet ook op het frontend-fallbackpad.

### M5 — Open self-signup + e-mail-enumeratie via ruwe foutmelding
- **Bestand:** `frontend/app/(auth)/signup/page.tsx:31-42`

`/signup` is publiek en roept `supabase.auth.signUp` met de anon-key aan — iedereen kan auth-accounts aanmaken ondanks het invite-only model. Regel 40 doet `setError(error.message)` (ruwe Supabase-fout) → "User already registered" = account-bestaat-orakel. Login/forgot-password doen dit correct generiek; signup is de uitzondering.
**Fix:** publieke `/signup` uitschakelen/gaten (invite-only), of minimaal de foutmelding genericeren + Supabase "Confirm email" aanzetten.

### M6 — CSP `script-src 'unsafe-inline'` in productie
- **Bestand:** `frontend/next.config.ts:45`

CSP is aanwezig + afgedwongen (goed), `'unsafe-eval'` correct alleen-dev. Maar `'unsafe-inline'` op `script-src` in prod neutraliseert de belangrijkste XSS-bescherming — elke geïnjecteerde inline-`<script>` draait. Geen nonce/hash. Architectuur-hardening (geen actief injectiepunt gevonden).
**Fix:** nonce-gebaseerde CSP (Next.js per-request nonces via middleware) en `'unsafe-inline'` uit `script-src`.

### M7 — Open-tekst-anonimisering is best-effort regex + twee divergente sanitizers
- **Bestand:** `backend/scoring.py:69-82` (opslag), `frontend/lib/.../open-answers-view-model.ts:30-37` (weergave)

Open tekst wordt vóór opslag geanonimiseerd (goed, `main.py:1438`), maar de patronen strippen alleen e-mail, NL-telefoon, een hoofdletter-naam-heuristiek en postcodes. Zelf-identificerende tekst ("ik ben de enige [functie] op [afdeling]…") wordt letterlijk opgeslagen + getoond. Het label "Geanonimiseerd — namen en contactgegevens verwijderd" overbelooft. Frontend gebruikt bovendien een zwakkere, andere sanitizer (geen naam-redactie). Met H1 ligt de ruwe quote sowieso open.
**Fix:** de twee sanitizers gelijktrekken (frontend hergebruikt backend-patronen) én het label verzachten naar "automatisch/best-effort", of een menselijke reviewgate vóór quotes.

---

## LOW (hardening / hygiëne)

| # | Bevinding | Bestand |
|---|---|---|
| L1 | Gecommitte Vercel-env-bestanden (géén live secret erin; OIDC verlopen, service-role leeg) + `.gitignore` mist `.env.*`-glob | `frontend/.env.production.inspect`, `.env.vercel.production`, `.gitignore` |
| L2 | Gecommit test-wachtwoord `Verisight!Acceptance123` + machine-env-dump (demo-key, publiek) | `.acceptance-runtime/guided-self-serve.json` |
| L3 | `progress-nudge` niet-timing-safe tokenvergelijking (`===`) | `frontend/app/api/internal/progress-nudge/route.ts:30` |
| L4 | Wachtwoordbeleid alleen client-side (`length < 8`) — server-side via Supabase Auth | `complete-account/`, `reset-password/`, `signup/` |
| L5 | `token_hash` blijft in browser-history op `/complete-account` (geen `replaceState` na `verifyOtp`) | `frontend/app/(auth)/complete-account/page.tsx` |
| L6 | Geen dataretentie/purge-job — responses + managed-flow-emails blijven onbeperkt (AVG-opslagbeperking) | `backend/main.py` |
| L7 | LLM open-tekst-verrijking spreekt de 2026-04-09-beslissing "geen geautomatiseerde analyse" tegen | `backend/main.py:1438-1440` |
| L8 | SECURITY DEFINER-helpers zonder `set search_path` (`is_org_member/manager/owner`, `is_verisight_admin_user`) | `supabase/schema.sql:1186,1201,2054,1245` |
| L9 | CSP `connect-src` stale Railway-host (wijkt af van `NEXT_PUBLIC_API_URL`) | `frontend/next.config.ts:43` |
| L10 | `getSafeNextPath` open-redirect via `//evil.com` (alleen dev-bereikbaar); `auth/callback` `next`-param ongevalideerd | `frontend/app/dev/qa-login/route.ts:62-70`, `frontend/app/auth/callback/route.ts:30` |
| L11 | `action_center_route_relations` viewer-leesbaar via `is_org_member` (lage gevoeligheid) | `supabase/schema.sql:1810` |
| L12 | `member` kan `owner` toekennen binnen eigen tenant (within-tenant; member nu ongebruikt) | `supabase/schema.sql:1370` |

---

## Expliciet gecheckt en veilig ✅

- **Git-history:** geen live secret ooit gecommit (service-role, Resend `re_`, Stripe `sk_live`, SMTP/Zoho, Sentry auth-token, `postgres://…:pw@` — allemaal afwezig; `BACKEND_ADMIN_TOKEN` alleen als `test-token`/placeholder).
- **Service-role isolatie:** `frontend/lib/supabase/admin.ts` heeft `import 'server-only'`; elke call-site autoriseert org-lidmaatschap vóór gebruik (organizations PATCH/DELETE, workspace-members, respondents import, send-invites, report, org-invites).
- **CORS:** `backend/main.py:270` gescoped op `FRONTEND_URL` + localhost + expliciete extra origins; geen `allow_origins=["*"]` met credentials.
- **Foutafhandeling:** generieke 503/`unexpected_error`; geen stacktraces naar clients; geen `debug=True`.
- **Sentry:** frontend disabled, backend `send_default_pii=False`, geen tokens/antwoorden verzonden.
- **`/dev/qa-login`:** dubbel-gated (`NODE_ENV==development` én localhost) → 404 in prod.
- **`?afd=`-department-injectie:** `resolve_department` (`backend/segments.py:49-56`) matcht exact op eigen campagne-departments; onbekend → Fail-Loud 422.
- **Deepening/direction JSONB:** server hervalideert client-triggers (422 op mismatch), `other_text` cap 200 + anonymize; geen arbitraire JSON naar opslag.
- **Mass-assignment survey-submit:** strikte Pydantic (`schemas.py:338-406`), kolommen expliciet gemapt, scores server-derived.
- **Rapport-aggregatiedrempels:** n≥10 aggregate, n≥5 segment/quotes, deepening-staffels correct in de **weergavelaag** (het lek zit in de datalaag, niet de renderer).
- **PDF-rapport:** open tekst/quotes ge-escaped via `html.escape` vóór WeasyPrint — geen stored-HTML-injectie.
- **`organization_secrets` tabel:** RLS aan, geen policy = deny-all (alleen via de RPC bereikbaar — zie H2).
- **Salary:** `annual_salary_eur` verwijderd na scoring (`main.py:1472-1473`); self_send-open-flow slaat geen deelnemer-PII op.
- **`dedup_key_hash`:** SHA-256 van random client-UUID, niet afgeleid van e-mail → geen de-anon-vector.

---

## Kerndiscussie — de klant-databoundary

De rolcorrectie (HR = owner) verandert de fix van H1/H2. Beperken tot `is_org_manager` helpt niet: owner ís een manager. De echte grens is **klant (elke rol) vs. Loep-operator (service-role)**.

De partij tegen wie je de individuele data afschermt is de HR/management zelf — precies de org-owner. Zolang de n-drempels alleen in de renderer/view-models zitten en niet in de datalaag, breekt élke klant-HR-login met een org-rol de anonimiteitsbelofte. De klant heeft de anon-key (browser) + eigen JWT, dus de nette dashboard-UI redt je niet.

**Aanbeveling:** haal client-toegang tot `respondents` + `survey_responses` weg (`revoke`) en route alle klant-reads die individuele data raken via de aggregerende FastAPI-backend. Doen vóór de eerste klant-HR-login. Nu, pre-eerste-klant met alleen operator-accounts, is de live impact laag — het wordt een echte High zodra een externe HR een login krijgt.

**Rolmodel-inconsistentie — al opgelost (2026-07-11):** `InviteClientUserForm` zette klant-uitnodigingen eerder default op `viewer`; inmiddels aangepast naar altijd `owner` (viewer-keuze helemaal verwijderd uit het formulier, zie git-historie rond `3c816984`). Dit maakt H1/H2 niet erger qua mechaniek (owner kon dit toch al via `is_org_member`), maar wél eerder relevant: met "owner" als vaste default is elke nieuwe klant-uitnodiging nu automatisch de rol die tegen de anonimiteitsbelofte in kan.

**Besluit klant-databoundary (Lars, 2026-07-12):** optie (a) — klant/HR hoeft nooit individuele responses te zien; Loep (operator) wel. Geen product-feature nodig voor een "escape hatch" — zodra individuele data alleen via de service-role-backend loopt, heeft Loep daar als operator sowieso toegang toe (rechtstreeks in Supabase indien nodig, bv. bij een geschil), de klant niet. Dit bevestigt de aanbevolen fix hierboven zonder extra scope: volledige `revoke` + service-role-migratie, geen gedeeltelijke/voorwaardelijke toegang bouwen.

---

## Aanbevolen volgorde

1. ~~**Nu, feitelijk:** draai de `pg_class`-query (H3).~~ **Afgerond (2026-07-12): geen live risico.** Alle 4 tabellen gecontroleerd; 3 hebben RLS aan, de 4e (`action_center_governance_interventions`) bestaat live nog niet. H3 is nu een LOW-hardeningspunt, geen High meer.
2. **Vóór eerste klant-HR-login:** beslis + implementeer de klant-databoundary (H1/H2) — individuele tabellen achter de service-role backend. **Besluit gevallen (zie Kerndiscussie): klant ziet nooit individuele data, alleen Loep-operator.** Nog te implementeren — branch `security-audit-fixes`, inventarisatie klaar (~8-10 bestanden, ordegrootte halve dag).
3. **Losse fixes wanneer je eraan toe bent:** M1 (contact-requests-gate) en M5 (signup) — **geïmplementeerd + getest op branch `security-audit-fixes`, nog niet gecommit/gepusht.** L1/L2 (env-bestanden untracken + `.gitignore`-glob) — al gerealiseerd op `main`. Nog open: M3/M4 (XFF).
4. **Hardening-ronde later:** M6 (CSP-nonce), M7 (sanitizers), H3 (bronbestanden-opschoning), L3–L12.
