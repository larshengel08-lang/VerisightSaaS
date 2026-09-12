# Inventaris klant-onboarding-flow (stand 2026-09-11)

Feitelijke kaart van getekende offerte tot rapport, opgesteld als startpunt voor spoor 1 (self-service onboarding). Regelnummers verwijzen naar de bestanden op main van 11 september 2026. Dit document beschrijft wat er IS, niet wat er moet komen.

---

## (a) De flow als genummerde stappen

### 1. Lead-instroom (optioneel, niet vereist)
- **Wie:** systeem + operator
- **Code:** `frontend/app/api/contact/route.ts`, tabel `contact_requests` (`supabase/schema.sql:250`), werkbank `frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx`
- **Klant ziet:** publiek contactformulier. Geen koppeling naar org-creatie in code; de operator neemt de gegevens handmatig over.

### 2. Organisatie aanmaken (operator only)
- **Wie:** operator (`profiles.is_verisight_admin = true`)
- **Waar:** `/beheer` stap 1 → `frontend/components/dashboard/new-org-form.tsx`
- **Velden:** `name`, `slug` (genormaliseerd `a-z0-9-`, regel 17-22), `contact_email`; alle drie verplicht (regel 57-89)
- **Mechaniek:** directe client-side Supabase-insert op `organizations` (`new-org-form.tsx:34-36`). Poort = RLS `verisight_admins_can_insert_org` (`supabase/schema.sql:1344-1346`).
- **Trigger:** `ensure_organization_secret()` (`schema.sql:152-176`) maakt (a) een `organization_secrets`-rij met `api_key` en (b) zet de aanmakende operator als `org_members.role = 'owner'`. Daarom ziet `/beheer` orgs via de eigen memberships (`beheer/page.tsx:55-60`).
- **Scan-type/product:** niet per org. `organizations` heeft alleen naam/slug/contact_email/is_active (`schema.sql:14-21`); `scan_type` staat per campagne (`schema.sql:57`).
- **Klant ziet:** niets.

### 3. Campagne aanmaken (operator only)
- **Wie:** operator, `/beheer` stap 2 → `frontend/components/dashboard/new-campaign-form.tsx`
- **Velden:** organisatie (dropdown actieve orgs), `name` (verplicht), `scan_type` uit 7 producten (`lib/campaign-setup.ts:3-11`), `delivery_mode` baseline/live (live geblokkeerd voor pulse/team/onboarding/leadership/culture_assessment, `campaign-setup.ts:18-20`), `enabled_modules` (6 org-factoren; niet voor culture_assessment), checkbox "Rapporteren op afdelingsniveau" → `segment_departments`
- **`comms_mode` is hardgecodeerd `'self_send'`** (`new-campaign-form.tsx:34`), er is geen keuze meer (guard-test `beheer/new-campaign-form.guard.test.ts:21-29`)
- **Segmentlijst:** leeg laten = modus aan, klant vult zelf (regel 64-88); wel labels invullen = validatie ≥2, geen lege/dubbele slugs via `buildSegmentDepartments`
- **Insert:** direct client-side (regel 90-98); RLS `org_managers_can_insert_campaigns` (`schema.sql:1413-1415`)
- **`public_survey_token`** komt automatisch uit DB-default (`migrations/2026_06_09_add_public_survey_token.sql`)
- **`closes_at` wordt hier NIET gezet.**

### 4. Klanttoegang uitnodigen (operator only)
- **Wie:** operator, `/beheer` stap 4 → `frontend/components/dashboard/invite-client-user-form.tsx` → `POST /api/org-invites`
- **Velden:** organisatie, naam contactpersoon (optioneel), e-mail (verplicht). **Rol is hardgecodeerd `'owner'`** (`invite-client-user-form.tsx:19`, met comment: viewer gaf verwarring omdat viewer geen launchacties mag)
- **Route-guards:** `requireAdminContext()` eist `is_verisight_admin` (`app/api/org-invites/invite-helpers.ts:29-51`); daarna `ensureManagerAccess()` eist owner/member-membership in die org (`invite-helpers.ts:53-67`)
- **Opslag:** upsert in `org_invites` op `(org_id,email)`, `accepted_at=null`, `invited_at=now` (`org-invites/route.ts:87-100`)
- **Activatielink:** `sendActivationLink()` (`invite-helpers.ts:141-171`): eerst `ensureAuthUserExists()` met service-role `admin.createUser({email_confirm:true})` (regel 108-139, reden: Supabase zou anders de niet-gerebrande "Confirm signup"-template sturen), daarna `signInWithOtp` met `emailRedirectTo = ${origin}/complete-account` op een client met `flowType: 'implicit'` (`lib/supabase/public.ts:13-29`)
- **Tweede mail:** gebrande welkomstmail via Resend (`org-invites/route.ts:126-135`, `lib/email-templates/welkom.ts`)
- **Rate limiting:** `RESEND_COOLDOWN_MINUTES = 10` (`invite-helpers.ts:15`), 429 bij resend binnen cooldown of Supabase-ratelimit
- **Klant ziet:** twee e-mails (magic link + welkom).

### 5. Account activeren (klant)
- **Waar:** `frontend/app/(auth)/complete-account/page.tsx`
- Leest `?token_hash` + `type` uit de query en wisselt in met `verifyOtp` (regel 51-71), stript het token daarna uit de URL (regel 68). Zonder sessie na 5 s → `/login?error=invite` (regel 23-25).
- Wachtwoord: 2× invoer, minimaal 8 tekens, alleen client-side gevalideerd (regel 93-101) → `updateUser({password})` → `/dashboard`
- Er is een "skip"-pad naar `/dashboard` zonder wachtwoord (regel 116-118).
- Daarna gewone login via `app/(auth)/login/page.tsx` (wachtwoord).

### 6. Membership materialiseren (systeem)
- `frontend/app/(dashboard)/layout.tsx:20` → `syncPendingOrgInvitesForUser` (`lib/supabase/sync-org-invites.ts`) → RPC `accept_org_invites_for_current_user()` (`schema.sql:1295-1329`): matcht op lowercase e-mail uit de JWT, insert/upsert in `org_members` met de rol uit de invite, zet `accepted_at`.
- Dus: membership ontstaat pas bij het eerste bezoek aan een dashboardroute, niet bij het accepteren van de mail.

### 7. Eerste dashboard + WelcomeGate (klant)
- `frontend/app/(dashboard)/dashboard/page.tsx`: `loadSuiteAccessContext`; `managerOnly` → `/action-center` (regel 23-24). Haalt één campagne op: `campaign_stats` `order created_at desc limit 1` (regel 26-33).
- `resolveDashboardState` (`lib/dashboard/dashboard-state-resolver.ts:104-260`), 6 states:

| state | trigger | CTA |
|---|---|---|
| `no_campaign` | geen campagne (regel 108-116) | geen; "Loep richt je campagne in" |
| `setup` | actief en `!(launchConfirmedAt && totalInvited>0)` (regel 157-172) | "Start de setup →" → `/campaigns/[id]/setup` |
| `running` | actief, gelanceerd, geen reminder/expiry (regel 248-259) | geen CTA, wel voortgang + reminder-tekst |
| `action` | `expired` (closesAt ≤ vandaag, 176-200), `reminder` (203-226), `sufficient_response` (229-245) | kopieer herinnering / campagne sluiten |
| `processing` | gesloten, rapport niet ready (140-153) | geen |
| `report_ready` | gesloten + drempel gehaald (123-137) | "Open rapport" |

- Bij `setup` rendert `WelcomeGate` (`components/dashboard/welcome-gate.tsx`): ballonnenanimatie + "Je eerste scan staat klaar" / "In drie stappen … ongeveer 5 minuten", knop "Begin met de setup". Gate-state in localStorage `loep_welcome_seen_<campaignId>` (regel 31-41).
- **Geen rolcheck**: viewer krijgt exact dezelfde gate en wizard te zien.

### 8. Wizard stap 1: startdatum + aantallen/afdelingen (klant, owner/member)
- `components/dashboard/setup-wizard-card.tsx`; ook direct op `/campaigns/[id]/setup` (`app/(dashboard)/campaigns/[id]/setup/page.tsx`, redirect naar `/campaigns/[id]` als al gelanceerd, regel 43-45)
- **Niet-segmentmodus:** `launchDate` (date, `min=today`, regel 255-259) + `invitedCount` (number, min 1) + survey-link met "Test →" en een vrijblijvende checkbox "Link getest en werkt" (regel 350-377, wordt nergens gevalideerd)
- **Segmentmodus** (`segmentMode = Boolean(segmentDepartments)`, regel 85): rij per afdeling met naam + aantal + live linkpreview + "Kopieer link" (regel 272-333); start met 2 lege rijen (regel 103-111); automatisch opgeteld totaal (regel 125-127); verwachtingszin "minimaal 5 deelnemers per afdeling voor zichtbaarheid in het rapport" (regel 266-269)
- **Vergrendeling:** afdeling met ≥1 respondent → naam-input disabled + "🔒 naam vergrendeld" (regel 115-119, 311-315)
- **Client-validaties:** startdatum verplicht (regel 168), ≥2 afdelingen met naam (regel 177-180), of `invitedCount ≥ 1` (regel 199)
- **Server-validaties:**
  - `saveSegmentDepartmentsAction` (`setup/segment-actions.ts:40-91`): auth owner/member/admin (regel 17-38); haalt vergrendelde labels uit de DB (regel 50-58); `prepareSegmentDepartmentsUpdate` (`lib/self-send-comms.ts:151-186`) eist ≥2 afdelingen, `invited_count` integer ≥1, geen lege/dubbele labels, vergrendelde labels moeten ongewijzigd terugkomen; schrijft `campaigns.segment_departments` + de som naar `campaign_delivery_records.invited_count`
  - `saveLaunchSetupAction` (`setup/launch-setup-actions.ts:38-66`): datum-regex `YYYY-MM-DD`, `invitedCount ≥ 1`, upsert `campaign_delivery_records` op `campaign_id`
- **Foutgedrag:** nette inline melding bij `{ok:false}`; bij een DB-fout gooit `saveLaunchSetupAction` (regel 64) → geen inline melding maar een error-boundary. Partiële fout heeft een eigen tekst: "Afdelingen zijn opgeslagen, maar de startdatum niet …" (`setup-wizard-card.tsx:188-192`).

### 9. Wizard stap 2: uitnodigingstekst kopiëren + "verstuurd" bevestigen (klant)
- Onderwerp + body gegenereerd door `buildInviteBody` in de wizard zelf (`setup-wizard-card.tsx:41-66`), inclusief de surveylink en een scan-specifieke "waarom"-regel (`SCAN_WHY`, regel 29-33) en advies-tip (`SCAN_TIP`, regel 35-39). Beide velden zijn vrij editeerbaar (regel 439-461).
- In segmentmodus: expliciet "Er is bewust géén algemene link, gebruik de links uit stap 1" (regel 421-428).
- "Ja, verstuurd →" → `confirmLaunchAction` (`launch-setup-actions.ts:68-81`): zet `launch_confirmed_at`; gooit "Geen delivery record gevonden" als `count === 0`.
- **Stap 3 ("Volgen & rapport") is puur decoratief**: een slotje, geen interactie (`setup-wizard-card.tsx:481-491`). Er is dus geen wizard-stap voor reminderdag, sluitingsdatum of doelgroepdefinitie.

### 10. Versturen van de uitnodigingen (klant, buiten het product)
Geen enkel codepad verstuurt deelnemersmails in `self_send`; het platform slaat bewust geen deelnemer-e-mailadressen op (`new-campaign-form.tsx:30-33`, `lib/self-send-comms.ts:1-3`).

### 11. Respondenten vullen in (systeem)
- `/survey/open/{public_survey_token}` → Next-proxy (`app/survey/open/[token]/route.ts`) → FastAPI `backend/main.py:1070-1139`. Controles: token bestaat, `is_active`, runtime-lock per product.
- **Afdelingskeuze door de respondent:** als de campagne segmenten heeft en er geen geldige `?afd=`-slug is, toont `templates/survey-intro.html:202-210` een radiogroep "Bij welke afdeling werk je?" (verplicht) met de tekst "minimaal 5 personen per groep".
- `POST /survey/open/{token}/start` (`main.py:1142-1244`): in segmentmodus 422 "Kies eerst je afdeling" bij onbekende/ontbrekende slug (Fail Loud, regel 1190-1202); dedup via `dedup_key_hash` → 409 bij tweede invulling; maakt anonieme respondent met alleen `department`, 90-dagen-token; 303 naar `/survey/{respondent.token}`.

### 12. Campagne loopt / herinnering (klant)
- `running` → `components/dashboard/running-state-card.tsx`: voortgangsbalk, mini-tijdlijn, en een editeerbaar herinneringsblok.
- Reminderdag: `reminder_config` wordt nooit in de klantwizard gezet; `normalizeReminderConfig` geeft de default `enabled: true, firstReminderAfterDays: 5, maxReminderCount: 2` (`lib/launch-controls.ts:88-97`). `isReminderDue` = `launch_date + 5 dagen ≤ vandaag` en nog geen `send_reminders`-auditevent op/na die datum (`lib/dashboard/reminder-due.ts:11-25`).
- Flow: "Kopieer herinneringstekst" → "Ik heb de herinnering verstuurd" → `confirmReminderSentAction` (`dashboard/dashboard-actions.ts:69-90`), schrijft alleen een auditevent; permissie `send_reminders` = owner only (`lib/customer-permissions.ts:11-16`).
- **Operator-nudge:** `POST /api/internal/progress-nudge` (`app/api/internal/progress-nudge/route.ts`), service-role + `x-admin-token`, mailt `organizations.contact_email` bij 25–75 % respons met dagelijkse dedup via auditevent. Staat niet in `frontend/vercel.json` (daar staat alleen `/api/action-center-follow-through-mails`, `0 7 * * *`) → moet handmatig/extern getriggerd worden.

### 13. Campagne sluiten (klant owner, of operator)
- `closeCampaignAction` (`dashboard/dashboard-actions.ts:98-181`): permissie `review_launch` = owner only; zet `is_active=false` + `closed_at`, schrijft auditevent `delivery_lifecycle_changed`; UI met `confirm()` in `components/dashboard/dashboard-state-actions.tsx:37-49`.
- `closes_at` (de geplande sluitdatum die de `expired`-state aanzet) is alleen operator-instelbaar via `/beheer/campagnes` → `beheer/campagnes/set-closes-at-action.ts:11-17` (harde `is_verisight_admin`-check).

### 14. Rapport (operator)
- `report_ready` CTA → `/campaigns/[id]`. Daar: `isAdmin ? <PdfDownloadButton/> : "Je rapport is in voorbereiding. Loep neemt contact met je op om de vervolgstap te bespreken."` (`app/(dashboard)/campaigns/[id]/page.tsx:174-189`).
- `/reports` (`app/(dashboard)/reports/page.tsx`) is een besprekingsplanner, geen downloadpagina: knop "Plan bespreking" → Calendly of `mailto:hallo@getloep.nl` (regel 23-51).
- De API kan het wel: `canDownloadCampaignReport` staat pdf toe voor elke rol met `view_report` (= owner/member/viewer) (`app/api/campaigns/[id]/report/permissions.ts:8-34`). Er is alleen geen klant-UI die die route aanroept.
- Sleutelpad: `getOrganizationApiKey` probeert eerst de RPC `get_org_api_key_for_current_user` (die alleen Loep-beheerders toestaat, `schema.sql:1265-1291`), en valt bij exception terug op de service-role `organization_secrets` en daarna op legacy `organizations.api_key` (`lib/organization-secrets.ts:20-67`). Bij 401/403 van de backend schakelt de route over op `/api/internal/...` met `BACKEND_ADMIN_TOKEN` (`report/route.ts:67-97`).

---

## (b) Rollen × rechten

`org_members.role ∈ {owner, member, viewer}` (`schema.sql:29-39`); `profiles.is_verisight_admin` is een aparte vlag (`schema.sql:2049-2053`); Action Center heeft een eigen tabel `action_center_workspace_members` (`schema.sql:2097-2114`).

| Recht | verisight_admin | owner | member | viewer | manager_assignee |
|---|---|---|---|---|---|
| Organisatie aanmaken (RLS) | ✅ `schema.sql:1344` | ❌ | ❌ | ❌ | ❌ |
| Organisatie updaten/verwijderen (RLS) | via service-role API | ✅ `schema.sql:1348,1359` | ❌ | ❌ | ❌ |
| `/beheer` (operator-UI) | ✅ | ❌ redirect `/dashboard` (`beheer/page.tsx:51-53`) | ❌ | ❌ | ❌ |
| Campagne insert/update (RLS `is_org_manager`) | — | ✅ | ✅ | ❌ | ❌ |
| Campagne aanmaken in de UI | ✅ `/beheer` | geen UI | geen UI | geen UI | ❌ |
| Org-invite versturen (`/api/org-invites`) | ✅ (+ owner/member-membership vereist) | ❌ (403: alleen beheerders) | ❌ | ❌ | ❌ |
| Invites lezen/schrijven (RLS) | — | ✅ | ✅ | ❌ | ❌ |
| Membership insert (RLS) | — | ✅ | ✅ (kan `owner` toekennen, L12) | ❌ | ❌ |
| Wizard zien | ✅ | ✅ | ✅ | ✅ (bug) | ❌ |
| `saveLaunchSetupAction` / `saveSegmentDepartmentsAction` | ✅ | ✅ | ✅ | ❌ "Niet gemachtigd" | ❌ |
| `confirmLaunchAction` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `confirmReminderSentAction` (`send_reminders`) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `closeCampaignAction` (`review_launch`) | ✅ | ✅ | ❌ | ❌ | ❌ |
| CSV-import / send-invites API | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/campaigns/[id]/launch-config`, `/self-send-config` | ✅ | ✅ | ✅ | ❌ 403 | ❌ |
| Dashboard/campagnedetail lezen | ✅ | ✅ | ✅ | ✅ | ❌ `SuiteAccessDenied` |
| Rapport downloaden (API) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Rapport downloaden (UI-knop) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Segment-CSV export | ✅ | ✅ (`review_launch`) | ❌ | ❌ | ❌ |
| `closes_at` zetten | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/beheer/managers` (AC-toewijzing) | ✅ | ✅ (`canManageActionCenterAssignments`, `lib/suite-access.ts:113-114`) | ❌ | ❌ | ❌ |
| Individuele respondent-/antwoorddata | via service-role | geblokkeerd op grant-niveau | idem | idem | idem |

Individuele data: `revoke select on survey_responses from authenticated` met alleen `(id, respondent_id, risk_score, risk_band)` terug, en `respondents` beperkt tot `(id, campaign_id, department, completed, completed_at, sent_at, opened_at)` (`schema.sql:1473-1480`, migratie `2026_07_13_lock_individual_data_to_operator.sql`).

Wat een viewer feitelijk kan: inloggen, dashboard/campagnedetail/`/reports` lezen, de wizard-UI zien en elke knop indrukken, waarna elke schrijfactie faalt met "Niet gemachtigd." (`launch-setup-actions.ts:33-35`, `segment-actions.ts:35-37`). Dat is precies de reden die in `invite-client-user-form.tsx:16-19` staat om de rol op `owner` vast te zetten.

---

## (c) Handmatige operator-/Lars-stappen (buiten klant-selfservice)

1. **Organisatie aanmaken**: `/beheer` (RLS admin-only). Bijeffect: Lars wordt `owner` van elke klant-org (`schema.sql:163-167`).
2. **Campagne aanmaken** incl. productkeuze, route (baseline/live), surveymodules en de aan/uit-knop voor afdelingsrapportage: `/beheer`. Geen klant-UI.
3. **Segment-modus aanzetten** (de checkbox); alleen de lijst zelf is klant-selfservice (spec `docs/superpowers/specs/2026-07-12-klant-afdelingsbeheer-design.md` §1).
4. **Klantgebruiker uitnodigen**: `/beheer`; API weigert niet-admins.
5. **Sluitdatum (`closes_at`) vastleggen**: `/beheer/campagnes` + `set-closes-at-action.ts`.
6. **Rapport downloaden en naar de klant brengen**: alleen de admin ziet `PdfDownloadButton`; de klant krijgt "Loep neemt contact met je op".
7. **Managementbespreking plannen**: Calendly/mailto, buiten het product (`reports/page.tsx:23-26`).
8. **Voortgangsnudge triggeren**: `POST /api/internal/progress-nudge` met `INTERNAL_ADMIN_TOKEN`; geen cron geconfigureerd.
9. **CSV-import + platformverzending**: alleen voor oude `managed`-campagnes; `/beheer` stap 3 (`beheer/page.tsx:261-337`, expliciet gelabeld "alleen bestaande managed-campagnes").
10. **Organisatie archiveren/verwijderen**: service-role API `app/api/organizations/[id]/route.ts` (incl. opruimen van verweesde auth-accounts, regel 228-254).
11. **Migraties uitvoeren**: alle `migrations/*.sql` zijn "Uitvoeren in: Supabase Dashboard → SQL Editor"; er is geen migratierunner.
12. **Rollen wijzigen na uitnodiging**: geen UI; alleen via nieuwe invite of SQL.
13. **Afdeling met responses hernoemen/verwijderen**: bewust onmogelijk, "behalve via SQL" (spec §"Wat bewust niet in deze ronde").
14. **Campagne heropenen/verlengen**: geen werkende actie (zie gaten).
15. **Action-Center-managers toewijzen**: `/beheer/managers` (draait op service-role, `beheer/managers/page.tsx:43-44`).
16. **Backend-redeploy verifiëren**: `docs/eerste-klant-audit-2026-07-13.md:60`.

---

## (d) Gaten en bugs in deze flow

**Rollen / toegang**
1. **Viewer ziet de volledige wizard maar kan niets**: geen rolcheck in `dashboard/page.tsx:141-154`, `campaigns/[id]/page.tsx:151-164` of `welcome-gate.tsx`; de server actions weigeren pas bij submit. Reden vastgelegd in `invite-client-user-form.tsx:16-19`; "workaround" is de hardcoded owner-rol (test `invite-client-user-form.test.ts:5-12`).
2. **Elke uitgenodigde klant wordt org `owner`** → mag via RLS de organisatie updaten en verwijderen (`schema.sql:1348-1368`) en campagnes aanmaken/wijzigen. Er is geen lichtere klantrol in gebruik.
3. **L12: `member` kan `owner` toekennen** binnen de eigen tenant (`org_managers_can_insert_membership`, `schema.sql:1379-1381`); bewust overgeslagen in `docs/security-audit-2026-07-12.md:193,25`.
4. **`member` inconsistent**: `is_org_manager` geeft member volledige RLS-schrijfrechten, maar `lib/customer-permissions.ts:11-16` verbiedt member elke launchactie, terwijl `launch-setup-actions.ts:33`, `segment-actions.ts:35`, `launch-config/route.ts:70` en `self-send-config/route.ts:62` member wel toelaten. Twee verschillende rechtenmodellen naast elkaar.
5. **M5 (open): `/signup` is publiek** met de anon-key en geeft ruwe Supabase-fouten (e-mail-enumeratie): `docs/security-audit-2026-07-12.md:158-162`.
6. **L4: wachtwoordbeleid alleen client-side** (`complete-account/page.tsx:98-101`); "skip" laat een account zonder wachtwoord door naar het dashboard.

**comms_mode / teksten**
7. **DB-default `comms_mode = 'managed'`** (`schema.sql:59`, `migrations/2026_06_13_add_self_send_mode.sql`). Alleen `new-campaign-form.tsx:34` zet `self_send`. Een campagne die via SQL, script of legacy is aangemaakt blijft `managed` → `isSelfSend` is false → de handmatige `invited_count` wordt genegeerd en de noemer valt terug op `count(respondents)` (`dashboard/page.tsx:92-104`, `campaigns/[id]/page.tsx:86-93`).
8. **De herinneringstekst die de klant kopieert is managed-copy zonder link.** `buildParticipantCommunicationPreview` (`lib/launch-controls.ts:180-204`) produceert "Op {datum} opent Loep de vragenlijst … je ontvangt dan een persoonlijke uitnodiging" + "Loep verzorgt de uitnodiging, verzending en verwerking", ondertekend met de default `senderName = 'Loep'` (`launch-controls.ts:65,81`), en bevat geen surveylink. Dit is de tekst in `RunningStateCard` en in de reminder-CTA. De correcte self-send-templates met link (`buildInviteTemplate`/`buildReminderTemplate`, `lib/self-send-comms.ts:238-274`) worden alleen gebruikt in `self-send-setup-panel.tsx`, en dat panel leeft op `/campaigns/[id]/beheer`, dat admin-only is (`campaigns/[id]/beheer/page.tsx:46-48`).
9. Zonder `launch_date` wordt in die tekst "Nog niet gepland" ingevuld (`launch-controls.ts:168-171`).

**Drempels en aantallen**
10. **`MIN_INVITED_COUNT = 5`** (`lib/self-send-comms.ts:4`, gebruikt in `self-send-config/route.ts:92-97`) versus minimaal 1 in de wizard (`launch-setup-actions.ts:47`, `prepareSegmentDepartmentsUpdate` regel 158). Twee verschillende ondergrenzen voor hetzelfde veld.
11. **`MIN_SEGMENT_N = 5`** (`backend/scoring_config.py:54`) en **`MIN_DISTRIBUTION_N = 10`** (`backend/report_distribution.py:40`) worden nergens in de wizard afgedwongen, alleen als tekstregel "minimaal 5 deelnemers per afdeling" (`setup-wizard-card.tsx:266-269`) en in de survey-intro (`templates/survey-intro.html:205`). De klant kan 8 afdelingen van 2 invoeren; het rapport poolt die dan stil onder "Overige afdelingen" (`backend/report_html.py:1998-2030`).
12. **Rapport-noemer wijkt af van dashboard-noemer:** het rapport gebruikt `n_invited = len(respondents)` (`backend/report_html.py:2106`, ook `backend/report.py:6362`), dus voor `self_send` = gestarte respondenten, niet de wizard-`invited_count`. Per afdeling wel de wizard-aantallen (`_enrich_segment_rows_with_invited`, `report_html.py:1981-1991`).
13. `self_send`-`invited_count` blijft wijzigbaar na responses; bewust besluit (`docs/eerste-klant-audit-2026-07-13.md:67`).

**Wizard / state machine**
14. **Stap 3 van de wizard is een placeholder**; er is geen klantstap voor reminderdag, sluitdatum of doelgroepdefinitie. Doelgroep = alleen "aantal deelnemers" (+ afdelingsnamen).
15. **Reminder-instellingen zijn niet klant-instelbaar**: de 5-dagen/2× default komt uit `normalizeReminderConfig` (`launch-controls.ts:88-97`); de enige UI die `reminder_config` schrijft is `/api/campaigns/[id]/launch-config`, aangeroepen vanuit het admin-only routebeheer.
16. **Secundaire acties zijn dode tekst**: "Campagne verlengen", "Sluiten zonder rapport", "Geen herinnering versturen" worden gerenderd als niet-klikbare `<span>` (`components/dashboard/dashboard-state-card.tsx:64-71`, met comment "intentionally non-interactive … no backing field yet").
17. **`closesAt`, stale comment**: de resolver documenteert "Not sourced yet … always null today" (`dashboard-state-resolver.ts:39`), maar beide pagina's leveren `closes_at` wel aan (`dashboard/page.tsx:124`, `campaigns/[id]/page.tsx:116`). Omdat alleen de operator `closes_at` kan zetten, blijft het label voor een pure selfservice-klant "Sluitdatum: nog niet gepland" en vuurt `expired` nooit (`buildCloseDateLabel`, regel 84-88).
18. **Dashboard toont maar één campagne** (`limit(1)`, `dashboard/page.tsx:26-33`); een klant met meerdere campagnes ziet alleen de nieuwste state.
19. **WelcomeGate zit in localStorage** → de ballonnen-intro komt terug op een andere browser/device.
20. **`saveLaunchSetupAction` gooit i.p.v. te returnen** bij een DB-fout (`launch-setup-actions.ts:64`, en `confirmLaunchAction` regel 78-79) → error-boundary in plaats van inline melding.
21. **Half-doorgevoerde opslag** mogelijk: afdelingen opgeslagen, startdatum niet (`setup-wizard-card.tsx:182-193`).
22. **Self_send + ontbrekende `invited_count`**: `launched` vereist `totalInvited > 0` (`dashboard-state-resolver.ts:157`); is `launch_confirmed_at` gezet maar `invited_count` null, dan blijft de campagne visueel in `setup` hangen.

**Rapport & notificatie**
23. **Rapport-gereed-mail kan niet werken**: `closeCampaignAction` zoekt `org_members` met rollen `['owner','admin','hr_manager']`; `admin`/`hr_manager` bestaan niet in de check-constraint (`schema.sql:36`); en leest daarna `profiles.email`, een kolom die niet in `supabase/schema.sql` of enige migratie voorkomt (`dashboard-actions.ts:142-160`). Alles staat in een `try/catch` met `console.error` → stille no-op. Onzeker: de productie-DB kan een out-of-band kolom hebben; in de repo bestaat die niet.
24. **De klant kan het rapport niet downloaden in het product** (punt 14 in de flow). De API staat het toe, de UI biedt het niet.
25. **Service-role-fallback voor de rapportsleutel** is altijd actief voor klantpaden, omdat de RPC voor niet-admins per definitie `raise exception` doet (`schema.sql:1276-1278` ↔ `lib/organization-secrets.ts:20-29`). De `try/catch` maskeert ook echte fouten.
26. **Openstaande rapportblockers** uit `docs/eerste-klant-audit-2026-07-13.md:15-35`: B1 eNPS leest de verkeerde sleutel, B2 segmentanalyse-polariteit omgekeerd, B3 behoudscontext-duiding tegenstrijdig. Statusnoot regel 11: "de rapportblockers (spoor 1/2) staan nog open". (NB: mogelijk inmiddels achterhaald door de stresstest-rondes van september; opnieuw checken.)

**Overig**
27. **`backend/segments.py::build_segment_departments` wordt in de aanmaakflow niet aangeroepen** (docstring regel 23-31); de TS-kopie in `lib/self-send-comms.ts:94-117` is de enige validatie op het admin-pad, en de slugify-regels staan in twee talen los van elkaar (`self-send-comms.ts:90-93`).
28. **L3/L5/L8** uit de security-audit: `progress-nudge` gebruikt inmiddels `timingSafeEqual` (`route.ts:9-14`, L3 dus gefixt); L5 `replaceState` is toegevoegd (`complete-account/page.tsx:68`); L8 `set search_path` staat er nu op `is_org_member`/`is_org_manager`/`is_verisight_admin_user` (`schema.sql:1195,1211,1256`).
29. **Niet verifieerbaar in de repo** (`docs/eerste-klant-audit-2026-07-13.md:81-86`): of de migraties `2026_07_11_*` en `2026_07_03_*` op productie zijn gedraaid, en of de live backend de laatste rapportcode draait. Dat raakt direct of segment-selfservice (`segment_departments`, `invited_count`) live werkt.
30. `app/(dashboard)/dashboard/home-launcher.ts` / `cockpit-index.ts` lijken niet meer gebruikt door `dashboard/page.tsx` (alleen nog een verwijzing in een comment in `lib/dashboard/report-library.ts:5`); onzeker, niet uitputtend getraceerd.
