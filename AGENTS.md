# Loep — Agent Brief

Lees dit bestand volledig voordat je iets doet. Dit is de leidende context voor alle werk in deze repo.

---

## Wat is Loep?

Loep is een people-insights platform voor HR en directie van Nederlandse MKB-organisaties (200–1.000 medewerkers). Het helpt organisaties signalen over vertrek, behoud en betrokkenheid omzetten naar bestuurlijke besluiten en aantoonbare opvolging.

**Kernproducten (commercieel actief):**
- **ExitScan** — uitstroomsurvey met factoranalyse, frictiescore en managementrapport
- **RetentionScan** — behoudsrisicoscan met signaalwaarde, SDT-scores en managementrapport

**In de codebase aanwezig maar commercieel geparkeerd:**
TeamScan, Leadership Assessment, Onboarding Survey, Culture Assessment, Pulse.
Raak deze producten niet aan tenzij expliciet gevraagd.

**In ontwikkeling (achtergrond, aparte werkstroom):**
Engagement Survey / MTO — enterprise-grade, wordt apart gebouwd zonder de ExitScan/RetentionScan flow te raken.

---

## Stack

| Laag | Technologie |
|------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI (Python), SQLAlchemy 2.0 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Charts | Recharts |
| PDF | ReportLab (Python, backend) |
| Email | Resend |
| Hosting | Vercel (frontend), Railway (backend) |
| Errors | Sentry |

**Frontend root:** `frontend/`
**Backend root:** `backend/`
**Database schema:** `supabase/schema.sql` + `migrations/`

---

## Architectuurprincipes — niet onderhandelen

1. **Multi-tenant vanaf dag 1** — elke organisatie is een eigen tenant. RLS in Supabase is leidend voor data-isolatie. Schrijf nooit een query die over tenant-grenzen kan lekken.
2. **Fail loud, never fake** — toon een zichtbare fout boven een stille fallback. Geen placeholder-data, geen "het lijkt te werken"-state die eigenlijk broken is.
3. **GDPR by design** — geen OpenAI of externe AI op persoonsdata of open tekstantwoorden. Privacy floors zijn hard: geen data tonen onder n=5, geen segmentdetail onder n=3.
4. **Modulair** — elke scanproduct is losstaand toevoegbaar. Geen cross-product dependencies in scoringslogica.
5. **Geen individuele voorspellingen** — Loep rapporteert op groepsniveau. Nooit een risicoscore op persoonsniveau berekenen of tonen.

---

## Fase en focus

**Huidige fase:** pre-eerste betalende klant.

**Wat nu prioriteit heeft:**
- ExitScan en RetentionScan: dashboard, PDF, Action Center compleet en bugvrij
- Engagement Survey / MTO: enterprise-architectuur opbouwen (aparte branch, raakt kernproducten niet)

**Wat expliciet buiten scope is:**
- Self-service onboarding uitbreiden
- Nieuwe marketing- of SEO-features
- Stripe / betalingsintegratie
- Publieke API
- Brede platformvernieuwing of V2-architectuur

---

## Actieve werkstromen

### Werkstroom A — ExitScan + RetentionScan: voltooien
**Doel:** beide producten zijn compleet, bugvrij en toonbaar zonder apologie.
**Bestanden:** `frontend/`, `backend/products/exit/`, `backend/products/retention/`
**Lopende taken:** zie `docs/work/stream-a-exit-retention.md`

### Werkstroom B — Engagement Survey / MTO: enterprise-basis
**Doel:** een enterprise-grade MTO-product bouwen dat later naadloos in het platform past.
**Bestanden:** `backend/products/engagement/` (nieuw), `frontend/` (nieuwe routes, raken stream A niet)
**Lopende taken:** zie `docs/work/stream-b-engagement.md`

---

## Bestandsstructuur — belangrijkste locaties

```
frontend/
  app/(dashboard)/campaigns/[id]/page.tsx   ← campaign detailpagina (groot bestand)
  app/(dashboard)/dashboard/                ← overzichtspagina
  app/(dashboard)/action-center/            ← action center
  components/dashboard/                     ← alle dashboard-componenten
    exit-dashboard-visuals.tsx              ← Recharts charts voor ExitScan
    factor-table.tsx                        ← factortabel met score-balken
    dashboard-primitives.tsx                ← DashboardSection, DashboardHero
    management-read-primitives.tsx          ← management read kaarten
  lib/
    products/exit/                          ← exit-specifieke helpers
    products/retention/                     ← retention-specifieke helpers
    management-language.ts                  ← RISK_COLORS, bandlabels, presentatie
    types.ts                                ← FACTOR_LABELS, ScanType

backend/
  products/exit/
    definition.py                           ← surveyvragen en structuur
    scoring.py                              ← scoringslogica
    report_content.py                       ← PDF-inhoud
  products/retention/                       ← zelfde structuur
  main.py                                   ← FastAPI endpoints

supabase/
  schema.sql                                ← hoofdschema met RLS
```

---

## Codestandaarden

- **TypeScript strict** — geen `any`, geen type-assertions tenzij echt noodzakelijk
- **Server components by default** in Next.js — alleen `'use client'` waar interactiviteit vereist is
- **Geen nieuwe dependencies** zonder expliciete vraag — gebruik wat al aanwezig is
- **Geen hardcoded tenant-IDs of org-IDs** in queries
- **Nederlandstalige UI-teksten** — het platform is NL-first
- **Foutafhandeling zichtbaar** — geen lege catch-blokken, geen stille failures

---

## Wat je niet mag doen zonder expliciete instructie

- Betalingslogica toevoegen
- OpenAI of andere externe AI aanroepen op gebruikersdata
- Schema-migraties uitvoeren (vertel wat je wilt migreren, voer het niet zelf uit)
- Productie-environment variabelen aanpassen
- De RLS-policies in Supabase omzeilen of uitschakelen
- Individuele risicoscores berekenen of tonen op persoonsniveau
- Geparkeerde producten (TeamScan, Leadership, Pulse etc.) aanpassen zonder expliciete vraag
