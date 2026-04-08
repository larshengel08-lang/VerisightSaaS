# Verisight — Strategie & Beslissingen

*Levend document. Update bij elke businessbeslissing.*
*Laatste update: 2026-04-08*

---

## Wat we bouwen

HR-inzichtenplatform voor MKB. Breed inzetbaar, niet branchespecifiek.

**Eerste module:** ExitScan — uitstroomsurvey uitsturen, uitkomsten consolideren, rapporteren en toelichten.

**Toekomstige modules:** Onboarding survey, MTO (medewerkerstevredenheid), en meer.

---

## Fase

**Nu:** Post user testing (intern) / pre-revenue
**Aanpak:** Route A — eerste klant nú, eerlijke framing (early access). Propositie matcht het product, niet ernaar toe.

**Volgende mijlpaal:** Eerste externe pilot → eerste betalende klant

---

## Doelgroep

**Primair:** Organisaties met 200–1.000 medewerkers met een professionele HR-functie.

**Randgeval:** Organisaties van 100–200 medewerkers kunnen deelnemen mits zij aantoonbaar ≥15 exits in de afgelopen 12 maanden verwachten. Verisight bespreekt haalbaarheid actief vóór contractering.

**Reden ondergrens 200:** Bij minder dan ~200 medewerkers zijn er structureel te weinig exits voor een betekenisvolle analyse (n-minimum van 10 is dan moeilijk haalbaar bij realistische responsrates).

**Beslisser:** HR-manager of directeur met HR-verantwoordelijkheid. CFO is medebeslist bij budget.
**Gebruiker:** HR-manager (operationeel), directie (rapport/debrief).

---

## Businessmodel

### Nu — hybride
- Lars doet setup en uitvoering
- HR-manager van klant kan resultaten bekijken (viewer-rol)
- Early access: eerste 1-2 klanten gereduceerde prijs in ruil voor feedback

### Later — self-service SaaS
- Klant maakt eigen account en organisatie aan
- Klant nodigt eigen teamleden uit
- Klant beheert eigen campagnes

---

## Pricing (vastgesteld v1)

### Trajectprijs per organisatieomvang
| Organisatie | Prijs (excl. btw) | Typisch verloop |
|-------------|-------------------|-----------------|
| 200–400 mw | €1.750 | ~20–40 exits/jaar |
| 400–700 mw | €2.250 | ~40–70 exits/jaar |
| 700–1.000 mw | €2.950 | ~70–100 exits/jaar |

**Onderbouwing:**
- Tijdskost: 4–6 uur per traject × marktconforme tarief ≈ €1.200–€2.400
- Waardevlak: <15% van gemiddelde vervangingskosten één medewerker (€15k–€25k)
- Beide ankerpunten convergeren naar bovenstaand tarief per tier

**Add-on:** Live online toelichting (60 min, time-boxed, geen actieplan) → +€350

### Billing-anker
- Historische ExitScan: **per campagne** (eenmalig)
- Toekomstige live module: **per organisatie per maand** (abonnement)

---

## Propositie — kernpunten

**Wat Verisight is:** Gestandaardiseerde, wetenschappelijk onderbouwde ExitScan die organisaties helpt patronen in vertrek te begrijpen, los van incidenten en individuele verhalen.

**Wat inbegrepen is:**
- Exitscan over ex-medewerkers afgelopen 12 maanden
- Anonieme survey + 2 automatische herinneringen
- Realtime dashboard (voortgang & respons)
- Eindrapport: kernpatronen, vertrekredenen, SDT-scores, betrouwbaarheidsduiding, aanbevelingen op basis van arbeidspsychologische kaders
- Transparante datakwaliteitsrapportage

**Randvoorwaarden:**
- Minimaal 10 respondenten vereist voor betekenisvolle analyse
- Responsverhoging is gedeelde verantwoordelijkheid: Verisight verzorgt professionele uitnodiging + 2 herinneringen; organisatie verzorgt interne communicatie

**Wat Verisight níet is:** Consultancy, implementatie van verbeteracties, individuele opvolging, garantie op representativiteit.

**Herhaling:** Jaarlijks of op aanvraag herhaalbaar. Geen verplichting — klant bepaalt tempo.

---

## Beslissingslog

| Datum | Beslissing | Reden |
|-------|-----------|-------|
| 2026-04-07 | Campagnetype historisch vs. live als apart veld in schema | Pricing-model vereist dit onderscheid |
| 2026-04-07 | Billing-anker: trajectprijs = per campagne, live = per org/maand | Past bij hybride model en toekomstige Stripe-integratie |
| 2026-04-07 | Geen self-service onboarding bouwen voor eerste klant | Focus op waarde valideren |
| 2026-04-08 | Doelgroep ondergrens verhoogd van 100 naar 200 medewerkers | <200 mw → structureel te weinig exits voor n≥10 |
| 2026-04-08 | Trajectprijs vastgesteld: €1.750/€2.250/€2.950 op org-omvang | Twee ankerpunten (tijdskost + waarde) convergeren hier |
| 2026-04-08 | Live toelichting: optionele add-on €350, niet kern van propositie | Schaalbaarheid; waarde zit in rapport, niet in uitleg |
| 2026-04-08 | Route A gekozen: eerste klant nu, eerlijke framing | Interpretatiekaders bestaan nog niet; belofte matcht product |

---

## Buiten scope (nu)

- Self-service onboarding
- Stripe / betalingsintegratie
- MTO-module
- Onboarding survey-module
- Publieke API
- Interactieve demo-pagina (Loom-video + voorbeeldrapport volstaat in fase 1-2)
