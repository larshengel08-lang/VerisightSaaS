# Verisight — Roadmap

*Levend document. Update bij elke faseovergang.*
*Laatste update: 2026-04-07*

---

## Fases

### ✅ Fase 0 — Fundament
- [x] Strategie, einddoel en MVP uitgewerkt
- [x] Dashboard gebouwd (Next.js + Supabase)
- [x] ExitScan survey gebouwd (FastAPI + Jinja2)
- [x] Multi-tenant architectuur (RLS) ingericht
- [x] Owner/viewer rolmodel werkend
- [x] Interne user testing gestart

---

### 🔄 Fase 1 — Stabiliseer (nu)

**Doel:** Iemand buiten Lars kan de volledige flow doorlopen zonder hulp of bugs.

**Tech:**
- [ ] Alle bugs uit interne testing fixen
- [ ] Campagnetype-veld toevoegen (`historical` / `live`) aan campaigns-schema
- [ ] Survey-proxy op localhost:3000 stabiel maken (cookie-forwarding)
- [ ] Visuele issues oplossen (UI-review)

**Marketing (parallel):**
- [ ] LinkedIn-gewoonte starten: 1 post/week over HR-uitstroom
- [ ] Rudimentaire landingspagina (1 pagina, geen CMS nodig)

**Exit-criterium:** volledige flow werkt foutloos voor een externe testpersoon.

---

### 📋 Fase 2 — Externe pilot (gratis)

**Doel:** Validatie door echte HR-manager bij een echt bedrijf.

**Aanpak:**
- 1-2 bedrijven uit netwerk benaderen
- Geen pitch, geen geld — "mag ik dit bij jullie testen?"
- Lars doet alles: maillijst ontvangen, campagne aanmaken, rapport opleveren
- Feedback verzamelen: wat mist? wat klopt niet? wat verrast positief?

**Deliverable:** werkend rapport + ingevulde feedbackvragen

**Exit-criterium:** klant begrijpt de uitkomst zonder toelichting van Lars.

---

### 💶 Fase 3 — Eerste betaalde pilot

**Doel:** Betalend bewijs van waarde.

**Aanpak:**
- Zelfde werkwijze als fase 2, maar met trajectprijs
- Trajectprijs vastgesteld: €1.750 (200-400 mw) / €2.250 (400-700 mw) / €2.950 (700-1.000 mw)
- Maakt het serieus voor beide partijen; dekt tijdsinvestering
- Gebruik om tijdsinvestering vs. prijs te valideren

**Exit-criterium:** klant betaalt, is tevreden, en zou het aanbevelen.

---

### ⚙️ Fase 4 — Productize de delivery

**Doel:** Alles wat Lars handmatig deed, zit in het product.

**Tech:**
- [ ] Klant kan maillijst uploaden (CSV of integratie)
- [ ] Automatische survey-uitnodigingen via Resend
- [ ] Rapport automatisch gegenereerd zonder handmatige stap
- [ ] Minimale self-service flow voor org-aanmaak en campagnestart

**Exit-criterium:** Lars kan een nieuw bedrijf onboarden in < 30 minuten zonder handmatig werk.

---

### 🚀 Fase 5 — Self-service SaaS

**Doel:** Klant doorloopt volledige onboarding zonder Lars.

**Tech:**
- [ ] Org self-signup
- [ ] User-uitnodiging door klant zelf
- [ ] Stripe-integratie (trajectprijs + live-abonnement)
- [ ] Live campagne-modus

**Marketing:**
- [ ] SEO-content strategie
- [ ] Publieke landingspagina met pricing
- [ ] Inbound leads via content

---

## Technische schuld — bewust uitgesteld

| Item | Reden voor uitstel | Wanneer oppakken |
|------|-------------------|-----------------|
| Stripe-integratie | Geen betalende klant | Fase 4-5 |
| Self-service onboarding | Hybride werkt nu | Fase 4 |
| MTO-module | Scope: ExitScan eerst | Na fase 3 |
| Onboarding survey | Scope | Na fase 3 |
| Publieke API | Geen use case nog | SaaS-fase |

---

## Architectuur — nu bewaken

| Principe | Waarom nu al |
|---------|-------------|
| Campagnetype-veld (`historical`/`live`) | Pricing-model vereist dit; kleine wijziging nu |
| Geen hardcoded org IDs | Blokkeert later multi-tenant self-service |
| Geen admin-only shortcuts in schema | Vereist refactor bij self-service |
| Billing-anker per campagne (historisch) / per org (live) | Basis voor Stripe-structuur later |
