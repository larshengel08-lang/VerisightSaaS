# Werkstroom B — Engagement Survey / MTO: enterprise-basis

**Doel:** een enterprise-grade MTO-product bouwen dat naadloos in het Loep-platform past.
**Status:** achtergrond — raakt stream A (ExitScan/RetentionScan) niet
**Eigenaar:** Lars

---

## Strategische context

Engagement Survey / MTO is de grote budgetlijn bij HR-afdelingen. Het is de jaarlijkse
medewerkerstevredenheidsmeting die bij veel organisaties de kern van het HR-jaarprogramma is.

Loep's positionering hier: niet een generieke MTO-tool, maar een MTO die:
- Werkt met hetzelfde SDT-raamwerk als ExitScan en RetentionScan (één taal over de lifecycle)
- Directe koppeling heeft met de Action Center-structuur
- Manager-dashboards als first-class feature heeft (niet HR-only)
- Privacy-first is (GDPR, privacy floors, geen individuele scores)
- Schaalbaar is voor enterprise MKB (200–5.000 medewerkers)

---

## Wat Perceptyx doet (referentie, niet te kopiëren)

- Jaarlijkse engagement survey + pulse + lifecycle als één platform
- AI/NLP op open tekst (wij doen dit niet — GDPR)
- Benchmarks uit 600+ enterprise-klanten
- Manager-nudges via Humu-acquisitie
- Consulting layer bovenop de data

**Waar Loep beter kan:**
- Actie-opvolging als kern van het product (niet add-on)
- SDT als consistent theoretisch fundament
- Toegankelijk voor MKB zonder enterprise-implementatietraject
- GDPR-native

---

## Productdefinitie (v1 scope)

### Wat het moet kunnen

1. **Meting configureren**
   - Vragenset op basis van SDT + 6 org-factoren (zelfde als ExitScan/RetentionScan)
   - Aanvullende open vraag (geanonimiseerd, geen AI-analyse)
   - Campagneduur instelbaar (typisch 2–4 weken)
   - Meerdere afdelingen / segmenten

2. **Data verzamelen**
   - Zelfde respondentflow als bestaande scans (token-based, anoniem)
   - Privacy floor: min. n=5 voor detailweergave, min. n=3 voor segmentdetail

3. **Dashboard**
   - Overal-score (betrokkenheidsscore 1–10)
   - Factor-ranking (6 org-factoren + SDT-dimensies)
   - Afdeling-vergelijking (als n per afdeling ≥ 5)
   - Trend vs. vorige meting (als vorige campagne beschikbaar)
   - Manager-view: elke manager ziet alleen zijn eigen afdeling

4. **Rapport**
   - Executive summary (zelfde structuur als ExitScan PDF)
   - Factoranalyse per afdeling
   - Top 3 focusvragen voor managementbespreking

5. **Action Center-koppeling**
   - Acties kunnen worden gekoppeld aan factoren/thema's uit de MTO
   - Reviewmoment plant 3-6 maanden voor volgende meting
   - Outcome-loop: "bij vorige meting scoorde werkdruk 4.2, nu 5.8, jullie acties hingen hieraan"

### Wat v1 NIET doet
- Geen AI/NLP op open tekst
- Geen externe benchmarks (intern tijdreeks is voldoende voor v1)
- Geen 360-feedback
- Geen custom vragensets door klant zelf
- Geen multi-language
- Geen mobile app

---

## Technische aanpak

### Nieuw scan_type
Voeg `engagement` toe aan het bestaande `scan_type` enum in:
- `supabase/schema.sql` (via migration)
- `backend/models.py`
- `frontend/lib/types.ts`

### Backend
Nieuwe module: `backend/products/engagement/`
- `definition.py` — vragenset (SDT + org-factoren + open vraag)
- `scoring.py` — betrokkenheidsscore berekenen (gewogen gemiddelde SDT + org)
- `report_content.py` — PDF-structuur

Hergebruik maximaal van bestaande scoring-infrastructuur uit `backend/products/exit/`.

### Frontend
- Nieuwe tab/sectie in bestaande campaign-detailpagina
- Manager-dashboard: nieuwe route `app/(dashboard)/manager/[id]/page.tsx`
- Afdeling-vergelijking: nieuwe visualisatiecomponent

### Database
- Geen nieuwe tabellen nodig: `campaigns`, `respondents`, `survey_responses` zijn generiek genoeg
- Nieuwe migration voor `scan_type = 'engagement'` en eventuele engagement-specifieke velden

---

## Mijlpalen

| Mijlpaal | Wat | Wanneer |
|----------|-----|---------|
| M1 | Productdefinitie + vragenset vastgesteld | Voor start bouw |
| M2 | Backend scoring + definition klaar | Week 1-2 |
| M3 | Survey-flow werkt end-to-end | Week 2-3 |
| M4 | Dashboard basisview klaar | Week 3-4 |
| M5 | Manager-dashboard v1 | Week 4-5 |
| M6 | PDF-rapport klaar | Week 5-6 |
| M7 | Action Center-koppeling | Week 6-7 |
| M8 | Eerste interne testrun | Week 7-8 |

---

## Codex-instructies voor deze werkstroom

Begin elke sessie op stream B met:

> "Je werkt aan Werkstroom B (Engagement Survey / MTO).
> Lees AGENTS.md en docs/work/stream-b-engagement.md.
> Raak geen bestanden aan die bij stream A horen
> (exit/, retention/, exit-dashboard-visuals.tsx, factor-table.tsx).
> De huidige taak is: [specifieke taak]."
