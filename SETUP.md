# Verisight — Installatiegids

Twee diensten draaien samen:
- **Backend** — FastAPI (Python) op poort `8000`: scoring engine + survey-formulieren
- **Frontend** — Next.js 15 op poort `3000`: operator-dashboard

---

## Vereisten

| Tool | Versie | Downloaden |
|------|--------|------------|
| Python | 3.11+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Git | — | https://git-scm.com |

---

## Stap 1 — Supabase project aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account
2. Klik **New project** → kies een naam (bijv. `Verisight`) en regio (EU)
3. Wacht tot het project actief is (~1 minuut)

### Database-schema uitvoeren

1. Ga naar **SQL Editor** in je Supabase-dashboard
2. Klik **New query**
3. Kopieer de volledige inhoud van `supabase/schema.sql` in het editor-venster
4. Klik **Run** — je ziet: *Success. No rows returned*

### Eerste gebruiker aanmaken

1. Ga naar **Authentication → Users**
2. Klik **Add user → Create new user**
3. Vul je e-mailadres en een wachtwoord in
4. Klik **Create user**

### API-sleutels ophalen

Ga naar **Project Settings → API** en noteer:

| Variabele | Waar te vinden |
|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (bijv. `https://abcd1234.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` sleutel |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` sleutel (geheim!) |

### Database-URL ophalen

Ga naar **Project Settings → Database → URI** en kopieer de verbindingsstring (Session mode, poort 5432):

```
postgresql://postgres.[project-ref]:[jouw-wachtwoord]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

---

## Stap 2 — Backend instellen (FastAPI)

```bash
cd Verisight
```

### Omgevingsvariabelen

```bash
cp .env.example .env
```

Open `.env` en vul in:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[wachtwoord]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key
SUPABASE_URL=https://jouw-project-id.supabase.co
OPENAI_API_KEY=sk-...           # Optioneel: alleen voor open tekst analyse
FRONTEND_URL=http://localhost:3000
```

### Python-omgeving

```bash
python -m venv .venv

# Windows:
.venv\Scripts\activate

# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### Backend starten

**Windows:**
```bash
start_backend.bat
```

**Mac/Linux:**
```bash
uvicorn backend.main:app --reload --port 8000
```

Controleer: open [http://localhost:8000/docs](http://localhost:8000/docs) — je ziet de Swagger UI.

---

## Stap 3 — Frontend instellen (Next.js)

```bash
cd frontend
```

### Omgevingsvariabelen

```bash
cp .env.local.example .env.local
```

Open `frontend/.env.local` en vul in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-public-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Dependencies installeren

```bash
npm install
```

### Frontend starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — je wordt doorgestuurd naar de loginpagina.

---

## Stap 4 — Eerste keer inloggen

1. Ga naar [http://localhost:3000/login](http://localhost:3000/login)
2. Log in met de gebruiker die je aanmaakte in Supabase Authentication
3. Je ziet de lege Campaigns-pagina

---

## Stap 5 — Eerste organisatie en campaign aanmaken

1. Klik op **Beheer** in de navigatiebalk
2. Maak een organisatie aan (naam + e-mailadres)
3. Maak een campaign aan (kies organisatie, geef naam, kies type: ExitScan of RetentieScan)
4. Voeg respondenten toe: kies het aantal, optioneel afdeling + niveau + salaris
5. Kopieer de gegenereerde survey-links — stuur deze naar medewerkers

---

## Testdata genereren (optioneel)

```bash
# Vanuit de root van het project:
python generate_testdata.py
```

Dit genereert 20 synthetische exit-responses (5 profielen) voor de eerste campaign in de database.

---

## Beide diensten tegelijk starten

Open twee terminals:

**Terminal 1 — Backend:**
```bash
cd Verisight
.venv\Scripts\activate   # Windows
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd Verisight/frontend
npm run dev
```

---

## Productie-deployment (optioneel)

### Backend → Railway

1. Maak een account op [railway.app](https://railway.app)
2. **New project → Deploy from GitHub repo**
3. Stel de omgevingsvariabelen in (DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)
4. Railway detecteert automatisch `requirements.txt` en gebruikt `uvicorn`
5. Noteer de Railway-URL (bijv. `https://Verisight-backend.railway.app`)

### Frontend → Vercel

1. Maak een account op [vercel.com](https://vercel.com)
2. **Add New → Project → Import Git Repository**
3. Stel de omgevingsvariabelen in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` → jouw Railway-URL
4. Vercel deployt automatisch bij elke push naar `main`

### Supabase CORS instellen

In Supabase → **Authentication → URL Configuration**:
- **Site URL**: jouw Vercel-URL (bijv. `https://Verisight.vercel.app`)
- **Redirect URLs**: `https://Verisight.vercel.app/**`

---

## Bestandsstructuur

```
Verisight/
├── backend/
│   ├── main.py           # FastAPI app + endpoints
│   ├── scoring.py        # SDT + org factor scoring engine
│   ├── report.py         # PDF-rapport generator (ReportLab)
│   └── database.py       # SQLAlchemy connectie
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/ # Loginpagina
│   │   ├── (dashboard)/  # Beschermde pagina's
│   │   │   ├── page.tsx          # Campaigns overzicht
│   │   │   ├── campaigns/[id]/   # Campaign detail
│   │   │   └── beheer/           # Beheer (org/campaign/respondenten)
│   │   └── auth/callback/        # Supabase auth callback
│   ├── components/
│   │   ├── dashboard/    # Dashboard-componenten
│   │   └── ui/           # Herbruikbare UI-componenten
│   ├── lib/
│   │   ├── supabase/     # Supabase client (browser + server)
│   │   └── types.ts      # TypeScript interfaces + constanten
│   └── middleware.ts     # Auth-bewaking op elke route
├── supabase/
│   └── schema.sql        # Volledige databasedefinitie
├── templates/            # Jinja2 survey-sjablonen (FastAPI)
├── generate_testdata.py  # Synthetische testdata (20 responses)
├── .env.example          # Backend omgevingsvariabelen template
└── SETUP.md              # Dit bestand
```

---

## Problemen oplossen

### "supabase.auth.getUser() returned null"
→ Controleer of de middleware draait (`frontend/middleware.ts` bestaat)
→ Controleer of `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` correct zijn ingesteld

### "relation 'campaign_stats' does not exist"
→ Het SQL-schema is nog niet uitgevoerd in Supabase → zie Stap 1

### "CORS error" bij PDF-download
→ Voeg de frontend-URL toe aan `FRONTEND_URL` in `.env` en herstart de backend

### Backend: "Table 'respondents' doesn't exist"
→ De backend gebruikt nu Supabase PostgreSQL — zorg dat `DATABASE_URL` verwijst naar de Supabase-database (niet naar de oude SQLite)

### Survey-link werkt niet
→ De links verwijzen naar `http://localhost:8000/survey/{token}` — in productie moet `NEXT_PUBLIC_API_URL` de Railway-URL zijn
