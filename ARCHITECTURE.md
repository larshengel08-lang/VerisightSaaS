# Verisight — Technical Architecture
**Voor AI-assistenten, nieuwe developers en toekomstige referentie**
*Bijwerken bij elke significante architectuurwijziging.*

---

## 1. Systeem in één oogopslag

```
┌─────────────────────────────────────────────────────────────┐
│  GEBRUIKER                                                   │
│  HR-manager (viewer) of Verisight-medewerker (owner/member) │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS (browser)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND — Next.js 15 App Router                           │
│  Gehost: Vercel                                             │
│  URL: https://verisight.vercel.app (+ preview URLs)         │
│  Auth: Supabase SSR (@supabase/ssr)                        │
└──────────┬──────────────────────────┬───────────────────────┘
           │ REST API calls           │ Supabase JS client
           │ (NEXT_PUBLIC_API_URL)    │ (anon key, RLS)
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│  BACKEND — FastAPI   │   │  SUPABASE                        │
│  Gehost: Railway     │   │  - PostgreSQL database           │
│  Port: 8080          │   │  - Auth (email/password)         │
│  Scoring engine      │   │  - Row Level Security (RLS)      │
│  Survey formulieren  │   │  - Regio: EU (Frankfurt)         │
│  E-mail verzending   │   │                                  │
└──────────┬───────────┘   └──────────────────────────────────┘
           │ SQLAlchemy (DATABASE_URL)
           │ Supabase admin (SUPABASE_SERVICE_ROLE_KEY)
           ▼
┌─────────────────────────────────────────────────────────────┐
│  RESEND — Transactionele e-mail                             │
│  survey-uitnodigingen + HR-notificaties                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tech stack

| Laag | Technologie | Versie | Hosting |
|------|-------------|--------|---------|
| Frontend | Next.js (App Router) | 15.x | Vercel |
| Frontend taal | TypeScript + React | 19.x | — |
| Styling | Tailwind CSS | v4 | — |
| Grafieken | Recharts | 3.x | — |
| Monitoring | Sentry (`@sentry/nextjs`) | 8.x | — |
| Backend | FastAPI (Python) | 0.11x | Railway |
| Backend ORM | SQLAlchemy | 2.x | — |
| Database | PostgreSQL (via Supabase) | 15 | Supabase EU |
| Auth | Supabase Auth | — | Supabase |
| E-mail | Resend | — | SaaS |
| Survey HTML | Jinja2 templates | — | Railway |

---

## 3. Repository structuur

```
Verisight/
├── backend/
│   ├── main.py           # FastAPI app + ALLE API-endpoints
│   ├── models.py         # SQLAlchemy ORM-modellen
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── database.py       # DB-connectie (SQLAlchemy engine)
│   ├── scoring.py        # SDT + organisatiefactor scoringslogica
│   ├── email.py          # Resend e-mailmodule
│   └── report.py         # PDF-rapportgenerator (ReportLab)
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Landingspagina (public)
│   │   ├── (auth)/login/page.tsx       # Loginpagina
│   │   ├── auth/callback/route.ts      # Supabase auth callback
│   │   └── (dashboard)/               # Beschermde routes (middleware)
│   │       ├── layout.tsx              # Nav + role-check (owner/member/viewer)
│   │       ├── dashboard/page.tsx      # Campaigns overzicht
│   │       ├── campaigns/[id]/page.tsx # Campaign detail + respondenten
│   │       └── beheer/page.tsx         # Setup wizard (org + campaign aanmaken)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts   # Browser Supabase client (anon key)
│   │   │   └── server.ts   # Server Supabase client (cookies)
│   │   └── types.ts        # TypeScript interfaces + MemberRole type
│   ├── middleware.ts        # Auth-bewaking: redirect naar /login bij geen sessie
│   ├── sentry.server.config.ts
│   ├── sentry.client.config.ts
│   └── package.json
├── supabase/
│   └── schema.sql          # SINGLE SOURCE OF TRUTH voor het databaseschema
├── templates/
│   ├── survey.html         # Jinja2 survey-formulier (token-based, geen login)
│   └── complete.html       # Bedankpagina na invullen survey
├── .env.example            # Backend env vars template
├── PLATFORM_BLUEPRINT.md   # Product: survey-instrument, scoringsmodellen, aanbevelingen
├── ARCHITECTURE.md         # Dit bestand: technische architectuur
└── SETUP.md                # Lokale installatie + eerste gebruik
```

---

## 4. Rolmodel (kritisch te begrijpen)

### Rollen in `org_members` tabel

| Rol | Wie | Kan lezen | Kan schrijven | Kan uitnodigen |
|-----|-----|-----------|---------------|----------------|
| `owner` | Verisight-medewerker | ✅ alles | ✅ alles | ✅ |
| `member` | Verisight-medewerker | ✅ alles | ✅ alles | ✅ |
| `viewer` | HR-klant (read-only) | ✅ eigen org | ❌ | ❌ |

### Supabase RLS-functies

```sql
-- Gebruikt voor SELECT policies (viewer mag ook lezen):
is_org_member(org_id) → true als rol IN ('owner', 'member', 'viewer')

-- Gebruikt voor INSERT/UPDATE policies (viewer mag NIET schrijven):
is_org_manager(org_id) → true als rol IN ('owner', 'member')
```

### Frontend role-check (layout.tsx)

```tsx
const isAdmin = memberships.some(m => m.role === 'owner' || m.role === 'member')
// isAdmin = false → viewer: geen "Setup" nav, geen "+ Nieuwe campaign" knop
```

---

## 5. Datamodel (kernentiteiten)

```
organizations
  id (uuid, PK)
  name
  contact_email
  created_at

org_members
  id (uuid, PK)
  org_id → organizations.id
  user_id → auth.users.id
  role: 'owner' | 'member' | 'viewer'

campaigns
  id (uuid, PK)
  org_id → organizations.id
  name
  scan_type: 'exit' | 'retention'
  status: 'draft' | 'active' | 'closed'
  created_at

respondents
  id (uuid, PK)
  campaign_id → campaigns.id
  token (uuid, uniek — gebruikt in survey-URL)
  department
  level
  salary
  sent_at (timestamp — wanneer uitnodiging verstuurd)
  completed_at (timestamp — wanneer survey ingevuld)

analyses
  id (uuid, PK)
  respondent_id → respondents.id
  campaign_id → campaigns.id
  org_id → organizations.id
  raw_answers (jsonb)
  scores (jsonb — SDT + org-factoren)
  preventability
  replacement_cost
  created_at
```

---

## 6. API-endpoints (backend/main.py)

### Survey (public — geen auth)
| Method | Path | Omschrijving |
|--------|------|-------------|
| GET | `/survey/{token}` | Toont survey-formulier (HTML) |
| POST | `/survey/{token}` | Slaat survey-antwoorden op + scoring |

### Campagnebeheer (vereist `Authorization: Bearer <service_role_key>` vanuit frontend server)
| Method | Path | Omschrijving |
|--------|------|-------------|
| GET | `/api/campaigns` | Lijst van alle campaigns |
| POST | `/api/campaigns` | Nieuwe campaign aanmaken |
| GET | `/api/campaigns/{id}` | Campaign detail + stats |
| GET | `/api/campaigns/{id}/respondents` | Respondenten met status |
| POST | `/api/campaigns/{id}/respondents` | Respondenten toevoegen |
| POST | `/api/campaigns/{id}/send-invites` | E-mailuitnodigingen verzenden |

### Organisaties
| Method | Path | Omschrijving |
|--------|------|-------------|
| GET | `/api/organizations` | Lijst van organisaties |
| POST | `/api/organizations` | Nieuwe organisatie |

### Analyses
| Method | Path | Omschrijving |
|--------|------|-------------|
| GET | `/api/campaigns/{id}/analyses` | Alle analyses voor een campaign |
| GET | `/api/analyses/{id}` | Individuele analyse detail |

---

## 7. Omgevingsvariabelen

### Backend (.env op root / Railway variabelen)

| Variabele | Verplicht | Omschrijving |
|-----------|-----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase, session mode port 5432) |
| `SUPABASE_URL` | ✅ | `https://<project-id>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Geheime admin-sleutel (omzeilt RLS) |
| `RESEND_API_KEY` | ✅ prod | API-sleutel voor e-mail (zonder: alleen gelogd, niet verstuurd) |
| `EMAIL_FROM` | ⬜ | Afzendernaam, bijv. `Verisight <noreply@verisight.nl>` |
| `FRONTEND_URL` | ⬜ | Gebruikt in CORS + e-maillinks (default: `http://localhost:3000`) |
| `BACKEND_URL` | ⬜ | Gebruikt in survey-links in e-mails (default: `http://localhost:8000`) |
| `OPENAI_API_KEY` | ⬜ | Optioneel: open tekst analyse |

### Frontend (Vercel / .env.local)

| Variabele | Verplicht | Omschrijving |
|-----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Publieke anon-sleutel (veilig in browser) |
| `NEXT_PUBLIC_API_URL` | ✅ | Railway backend URL |
| `SENTRY_DSN` | ⬜ | Optioneel: error monitoring |

---

## 8. Authenticatiestroom

```
1. Gebruiker → /login → Supabase email/password login
2. Supabase → 302 redirect → /auth/callback?code=...
3. /auth/callback/route.ts → exchangeCodeForSession() → cookie gezet
4. middleware.ts → controleert cookie op ELKE request naar /(dashboard)/*
5. Geen geldig cookie → redirect naar /login
```

**Belangrijk:** Supabase gebruikt HTTP-only cookies via `@supabase/ssr`.
De `anon key` zit in de browser, maar RLS zorgt dat elke query beperkt is tot de eigen organisatie.

---

## 9. Survey-stroom (respondent — geen account vereist)

```
1. Verisight maakt respondent aan → token (uuid) wordt gegenereerd
2. POST /api/campaigns/{id}/send-invites → Resend verstuurt e-mail
3. E-mail bevat: https://<BACKEND_URL>/survey/{token}
4. Respondent klikt link → FastAPI serveert survey.html (Jinja2)
5. Respondent vult in → POST /survey/{token}
6. Backend: scoring → opslaan in analyses tabel
7. Backend: send_hr_notification() → e-mail naar HR-beheerder
8. Respondent → doorgestuurd naar complete.html
```

---

## 10. CORS-configuratie (backend/main.py)

```python
app.add_middleware(CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Dekt alle Vercel preview-URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Let op:** `allow_origin_regex` is vereist omdat Vercel voor elke branch/PR een unieke preview-URL genereert.

---

## 11. Deployment-quirks (geleerde lessen)

### Vercel (frontend)
- Hobby plan: deployer's git-committer e-mail **moet overeenkomen** met het GitHub-account.
- Fix: `git config --global user.email "larshengel08@hotmail.com"`
- Als build mislukt door missing package: voeg toe aan `frontend/package.json` dependencies.
- `@sentry/nextjs` config: gebruik **camelCase** (`sendDefaultPii`, niet `send_default_pii`).

### Railway (backend)
- Draait op poort `8080` (Railway default) — niet 8000 zoals lokaal.
- Environment variables: wijzigingen zijn pas actief na klikken **"Apply N changes"**.
- Logs: gebruik `print(flush=True)` voor direct zichtbare output in Railway logs.
- `Procfile` bepaalt het startcommando.

### Supabase
- RLS moet actief zijn op alle tabellen — schema.sql bevat alle policies.
- `is_org_member()` en `is_org_manager()` zijn custom functies, gedefinieerd in schema.sql.
- Viewer-rol toevoegen: `UPDATE org_members SET role = 'viewer' WHERE user_id = '<uuid>';`

---

## 12. Operating model (GTM-context)

**Verisight is een Hybrid Managed model** — niet self-serve.

- Verisight-medewerkers (owner/member) zetten alles op voor de klant
- HR-klanten krijgen een viewer-account en bekijken alleen de resultaten
- Geen self-onboarding, geen credit card, geen trial
- Eerste product: **ExitScan** (exit-interview vervanger)
- Vervolgstap: **RetentieScan** (voor actieve medewerkers)

Dit heeft directe implicaties voor de UI:
- Viewers zien geen "Setup" nav, geen "+ Nieuwe campaign" knop
- Leeg-scherm voor viewer: "Jouw ExitScan wordt opgezet — jouw begeleider regelt dit voor je"
- Dashboard mockup op landingspagina toont thema's, geen individuele risicoscores

---

## 13. Bestanden die je NOOIT zomaar wijzigt

| Bestand | Reden |
|---------|-------|
| `supabase/schema.sql` | Single source of truth voor DB — wijzig altijd via SQL Editor in Supabase, update dan dit bestand |
| `backend/scoring.py` | Wetenschappelijk onderbouwde scoringslogica — zie PLATFORM_BLUEPRINT.md §4 voor formules |
| `frontend/middleware.ts` | Auth-bewaking — een fout hier maakt alle pagina's publiek toegankelijk |
| `.env` / `.env.local` | Nooit committen naar git |

---

*Verisight · Architectuurdocument v1.0 · April 2026*
*Bijwerken bij: nieuwe endpoints, gewijzigd rolmodel, nieuwe services, deployment-wijzigingen.*
