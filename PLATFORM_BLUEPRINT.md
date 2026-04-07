# Platform Blueprint — Verloopinzichten Platform
**Versie 1.0 | Datum: April 2025**
**Status: Toekomstvisie — beschrijft de volledige productrichting**

> **v1-implementatie:** Zie `ARCHITECTURE.md` voor wat er nu staat en `ROADMAP.md` voor de fasering.
> Dit document beschrijft het einddoel. Niet alles hierin is gebouwd of gepland voor de komende fase.

---

## 1. PRODUCTVISIE & ARCHITECTUUR

### Positionering
Een professioneel B2B SaaS-platform dat HR Business Partners en organisaties voorziet
van betrouwbare, literatuur-onderbouwde inzichten in verloop, retentie en medewerkerstevredenheid.
Onderscheidend: wetenschappelijk gefundeerde meting + concrete actierichting per thema.

### Productlijn

```
PLATFORM
├── ExitScan        → vertrokken medewerkers (exit-interview vervanger)
├── RetentieScan    → actieve medewerkers (vroegtijdig risico signaleren)
└── [fase 2] PulseScan → periodieke meting (kwartaal/halfjaar)
```

### Gebruikersrollen
```
OPERATOR (HRBP / consultant)
├── Beheert meerdere klantorganisaties
├── Stuurt surveys uit namens klanten
├── Heeft masterdashboard (alle klanten)
└── Genereert rapporten per klant

KLANT (HR-manager / CHRO)
├── Heeft eigen afgeschermde dashboard
├── Ziet uitsluitend eigen organisatiedata
└── Kan rapporten downloaden

RESPONDENT (medewerker / ex-medewerker)
├── Ontvangt unieke survey-link via e-mail
├── Vult survey in zonder account/login
└── Geen toegang tot resultaten
```

---

## 2. EXITSCAN — VOLLEDIG SURVEY-INSTRUMENT

### Doel
Gestandaardiseerde meting van vertrekfactoren bij (ex-)medewerkers.
Vervangt het ongestructureerde exit-interview door een reproduceerbaar, valide instrument.

### Wetenschappelijk fundament
| Dimensie | Schaal | Bron |
|---|---|---|
| Autonomie, Verbinding, Competentie | Work-related Basic Need Satisfaction (W-BNS) | Deci et al. (2001); Van den Broeck et al. (2010) |
| Leiderschapskwaliteit | Leader-Member Exchange (LMX-7 adapted) | Graen & Uhl-Bien (1995) |
| Psychologische veiligheid | Psychological Safety Scale | Edmondson (1999) |
| Werkbeleving & cultuur | Organizational Climate (adapted) | O'Reilly & Chatman (1986) |
| Loopbaanontwikkeling | Career Development adapted | Greenhaus et al. (2010) |
| Compensatie | Job Satisfaction Survey (JSS) | Spector (1985) |
| Werkdruk & balans | Job Demands-Resources (JD-R) | Bakker & Demerouti (2007) |
| Rolhelderheid | Role Conflict & Ambiguity Scale | Rizzo, House & Lirtzman (1970) |
| Push-pull factoren | Unfolding Model of Turnover | Lee & Mitchell (1994); Mitchell & Lee (2001) |
| Preventability | Avoidable Turnover Framework | Holtom et al. (2008) |

### Vragenstructuur (totaal: ~38 items + open tekst, ~12-15 minuten)

---

#### MODULE A — VERTREKCONTEXT (niet gescoord, categorisch)

**A1. Exitcategorie** *(verplicht, enkelvoudige keuze)*
Wat is de voornaamste reden van jouw vertrek?
- [ ] Loopbaanstap — betere functie of groeikans elders
- [ ] Onvrede over mijn directe leidinggevende
- [ ] Onvrede over de organisatiecultuur
- [ ] Salaris of arbeidsvoorwaarden
- [ ] Onvoldoende groeimogelijkheden binnen de organisatie
- [ ] Werkdruk of burn-out
- [ ] Persoonlijke omstandigheden (verhuizing, gezin, gezondheid, mantelzorg)
- [ ] Pensioen
- [ ] Ondernemen / ZZP
- [ ] Anders

**A2. Stay-intent** *(verplicht, 5-punt)*
Had je bij een andere aanpak van de organisatie kunnen blijven?
`Zeker niet — Waarschijnlijk niet — Misschien — Waarschijnlijk wel — Ja, zeker`

**A3. Eerdere signalering** *(verplicht, 3-keuze)*
Heb je je vertrekintenties eerder kenbaar gemaakt aan je leidinggevende of HR?
`Ja — Gedeeltelijk — Nee`

---

#### MODULE B — SDT: ZELFDETERMINATE BASISBEHOEFTEN
*(Gebaseerd op W-BNS, Van den Broeck et al., 2010 — 12 items, Likert 1–5)*
*Antwoordschaal: 1 = Helemaal mee oneens · 5 = Helemaal mee eens*
*(R) = reverse-coded item, onzichtbaar voor respondent*

**Autonomie** — mate van ervaren zeggenschap en eigen regie
- B1. In mijn werk kon ik mijn eigen keuzes maken.
- B2. Ik voelde me vrij om mijn werkwijze zelf te bepalen.
- B3. Er was ruimte voor mijn eigen initiatief en inbreng.
- B4. Ik moest werken op een manier die mij werd opgelegd. *(R)*

**Verbinding** — gevoel van erbij horen en oprechte collegiale relaties
- B5. Ik voelde me echt verbonden met mijn directe collega's.
- B6. Ik had het gevoel dat mijn collega's oprecht om mij gaven.
- B7. Ik voelde me thuis in mijn team.
- B8. Ik had het gevoel er niet echt bij te horen. *(R)*

**Competentie** — gevoel van bekwaamheid en groei
- B9. Ik voelde me bekwaam in mijn werk.
- B10. Mijn werk gaf me de kans om te laten zien wat ik kon.
- B11. Mijn werk daagde me op een positieve manier uit.
- B12. Ik had regelmatig het gevoel tekort te schieten. *(R)*

---

#### MODULE C — ORGANISATIEFACTOREN
*(18 items, 6 thema's × 3 items, Likert 1–5)*
*Antwoordschaal: 1 = Helemaal mee oneens · 5 = Helemaal mee eens*

**C1. Leiderschap** *(LMX-7 adapted, Graen & Uhl-Bien 1995)*
- C1a. Mijn leidinggevende gaf me voldoende ondersteuning en sturing.
- C1b. Ik werd eerlijk en respectvol behandeld door mijn leidinggevende.
- C1c. Mijn leidinggevende erkende en waardeerde mijn bijdrage.

**C2. Cultuur & Psychologische Veiligheid** *(Edmondson 1999; O'Reilly & Chatman 1986)*
- C2a. Ik kon op het werk mezelf zijn.
- C2b. Er was een sfeer van vertrouwen en openheid.
- C2c. Ik voelde me vrij om mijn mening of zorgen te uiten zonder negatieve gevolgen.

**C3. Groei & Ontwikkeling** *(Greenhaus et al. 2010)*
- C3a. Er waren voldoende mogelijkheden om te groeien in mijn functie.
- C3b. De organisatie investeerde in mijn professionele ontwikkeling.
- C3c. Mijn loopbaanperspectief was helder en realistisch.

**C4. Compensatie** *(Spector JSS 1985)*
- C4a. Mijn salaris was in lijn met de markt en mijn bijdrage.
- C4b. De secundaire arbeidsvoorwaarden waren aantrekkelijk.
- C4c. Ik voelde me eerlijk beloond ten opzichte van collega's in vergelijkbare functies.

**C5. Werkdruk & Balans** *(JD-R model, Bakker & Demerouti 2007)*
- C5a. Mijn werkdruk was over het algemeen beheersbaar.
- C5b. Ik had voldoende ruimte om werk en privéleven te combineren.
- C5c. De verwachtingen rondom beschikbaarheid en bereikbaarheid waren redelijk.

**C6. Rolhelderheid** *(Rizzo, House & Lirtzman 1970)*
- C6a. Mijn taken en verantwoordelijkheden waren duidelijk omschreven.
- C6b. Ik wist wat er van mij verwacht werd in mijn rol.
- C6c. Er was weinig sprake van tegenstrijdige of onduidelijke verwachtingen.

---

#### MODULE D — PULL-FACTOREN
*(3 items, Likert 1–5 — meten externe aantrekkingskracht)*
*Antwoordschaal: 1 = Helemaal mee oneens · 5 = Helemaal mee eens*

- D1. Mijn vertrek werd voornamelijk ingegeven door een aantrekkelijke externe kans.
- D2. Ik had al een concreet aanbod elders voordat ik besloot te vertrekken.
- D3. Als de externe situatie er niet was geweest, was ik waarschijnlijk gebleven.

---

#### MODULE E — OPEN TOELICHTING *(optioneel)*

**E1.** Wat wil je meegeven aan de organisatie? Is er iets wat je wilt toelichten dat niet in
de bovenstaande vragen aan bod is gekomen?
*(Vrij tekstveld — wordt geanonimiseerd voor AI-analyse)*

---

### Volgorde in survey-interface
```
1. Welkomstscherm (doel, anonimiteit, ~12 min)
2. Module A — Context (3 items)
3. Module B — SDT (12 items, gegroepeerd per dimensie)
4. Module C — Organisatiefactoren (18 items, gegroepeerd per thema)
5. Module D — Pull-factoren (3 items)
6. Module E — Open tekst (optioneel)
7. Bedankscherm
```

---

## 3. RETENTIESCAN — SURVEY-INSTRUMENT

### Doel
Vroegtijdig signaleren van retentierisico bij actieve medewerkers.
Identificeert knelpunten voordat een medewerker actief op zoek gaat.

### Wetenschappelijk fundament (aanvullend op ExitScan)
| Dimensie | Schaal | Bron |
|---|---|---|
| Bevlogenheid | UWES-3 (ultra-short) | Schaufeli et al. (2006) |
| Verloopintentie | Michigan Org. Assessment Questionnaire | Cammann et al. (1983) |
| SDT + Org factoren | Zelfde als ExitScan (present tense) | Zie ExitScan |

### Vragenstructuur (~35 items, ~10 minuten)

**Module R-A: SDT** — identiek aan ExitScan B1-B12, aangepast naar tegenwoordige tijd

**Module R-B: Organisatiefactoren** — identiek aan ExitScan C1-C6, tegenwoordige tijd

**Module R-C: Bevlogenheid** *(UWES-3, Schaufeli et al. 2006)*
*Antwoordschaal: 1 = Nooit · 5 = Altijd*
- R-C1. Op mijn werk bruis ik van energie. *(Vitaliteit)*
- R-C2. Ik ben enthousiast over mijn baan. *(Toewijding)*
- R-C3. Ik ga helemaal op in mijn werk. *(Absorptie)*

**Module R-D: Verloopintentie** *(Cammann et al. 1983)*
*Antwoordschaal: 1 = Helemaal mee oneens · 5 = Helemaal mee eens*
- R-D1. Ik denk er serieus aan om mijn baan op te geven.
- R-D2. Ik ben actief op zoek naar een andere baan.

**Module R-E: Open tekst** *(optioneel)*
Wat zou jouw werksituatie significant verbeteren?

---

## 4. SCORINGSMODEL

### 4.1 SDT Scoring (ExitScan & RetentieScan)

```
Stap 1: Reverse-coding
  Items B4, B8, B12 → score = 6 - ruwe_score

Stap 2: Dimensie-gemiddelde (1–5 schaal)
  Autonomie   = gemiddelde(B1, B2, B3, B4_r)
  Verbinding  = gemiddelde(B5, B6, B7, B8_r)
  Competentie = gemiddelde(B9, B10, B11, B12_r)

Stap 3: Schaling naar 1–10
  score_10 = (score_5 - 1) / 4 × 9 + 1

Interpretatiebandbreedtes (gebaseerd op SDT-literatuur normen):
  1.0 – 4.9  → Significant tekort    🔴 URGENT
  5.0 – 6.4  → Matig — aandacht      🟠 HOOG
  6.5 – 7.9  → Voldoende             🟡 MIDDEN
  8.0 – 10.0 → Sterk                 🟢 GOED
```

### 4.2 Organisatiefactor Scoring

```
Per thema (C1–C6):
  score_5   = gemiddelde van 3 items
  score_10  = (score_5 - 1) / 4 × 9 + 1

Zelfde interpretatiebandbreedtes als SDT.
Thema's zijn onafhankelijk — geen overkoepelend gemiddelde.
```

### 4.3 Retentierisico Score (RetentieScan)

```
Gewogen formule (empirische gewichten Gallup 2023):
  Leiderschap      × 2.5
  Cultuur          × 1.5
  Groei            × 1.5
  Werkdruk         × 1.0  (geïnverteerd: hoge werkdrukscore = laag risico)
  Compensatie      × 1.0

Risicoscore = (10 - gewogen_gemiddelde) × 10
Schaal: 0–100%

  70–100%  → HOOG RISICO    🔴
  40–69%   → MEDIUM RISICO  🟠
  0–39%    → LAAG RISICO    🟢

Aanvullend bij RetentieScan:
  Verloopintentiescore = gemiddelde(R-D1, R-D2) × 2   [0–10]
  Bevlogenheidsscore   = gemiddelde(R-C1, R-C2, R-C3) × 2  [0–10]
```

### 4.4 Preventability Algorithm (ExitScan)

```
STAP 1 — Basisclassificatie op exitcategorie:
  NIET-REDBAAR (92% confidence):
    Persoonlijke omstandigheden, Pensioen

  GEMENGD (start 50/50):
    Loopbaanstap, Ondernemen/ZZP, Anders

  REDBAAR (start 80% confidence):
    Onvrede leidinggevende, Onvrede cultuur,
    Salaris, Groeimogelijkheden, Werkdruk/burn-out

STAP 2 — Pull-factor correctie:
  Pull-score = gemiddelde(D1, D2, D3) → 1–5
  Als pull_score ≥ 4.0 EN categorie = REDBAAR:
    → downgrade naar DEELS REDBAAR
    → confidence -15%

STAP 3 — Stay-intent kalibratie:
  Stay-intent schaal: Zeker niet(1) → Ja zeker(5)
  confidence += (stay_intent - 3) × 8   (bereik: -16 tot +16)

STAP 4 — SDT contextualisering:
  SDT_gemiddelde = (autonomie + verbinding + competentie) / 3
  Als SDT_gemiddelde < 5.0 EN classificatie = GEMENGD:
    → upgrade naar REDBAAR

UITKOMST:
  REDBAAR      → intern veroorzaakt, had voorkomen kunnen worden
  DEELS REDBAAR → mix van intern en extern
  NIET-REDBAAR → extern/situationeel, niet te voorkomen

Confidence: min(95%, berekend%)
```

### 4.5 Replacement Cost Calculator

```
Gebaseerd op SHRM (2022) & Josh Bersin Institute:

  Uitvoerend / Operationeel:     salaris × 0.50
  Professioneel / Specialist:    salaris × 1.00
  Senior Professional / Expert:  salaris × 1.50
  Management:                    salaris × 2.00
  Senior Management / Director:  salaris × 2.50
  C-Level / Directie:            salaris × 3.00

Kostencomponenten (ter referentie in rapport):
  - Werving & selectie (vacature, bureau, tijd)
  - Onboarding & inwerkperiode (3–6 mnd productiviteitsverlies)
  - Kennisoverdracht & continuïteitsverlies
  - Impact op teamdynamiek en overige medewerkers
```

---

## 5. ANALYSEMODEL — PATROONHERKENNING

### 5.1 Individueel niveau (per exitanalyse)

```
OUTPUT per analyse:
├── SDT Profiel          (3 scores + interpretatiebanden)
├── Org Factor Ranking   (6 thema's, laag → hoog)
├── Top 3 Knelpunten     (laagst scorende factoren)
├── Preventability       (REDBAAR / DEELS / NIET + %)
├── Replacement Cost     (€ bedrag + onderbouwing)
├── Push/Pull Balans     (visueel: intern vs. extern)
└── Aanbevelingen        (zie §6, geselecteerd op scores)
```

### 5.2 Organisatieniveau (aggregaat, min. n=5 voor publicatie)

```
DASHBOARD METRICS:
├── Preventability Rate     → % vermijdbare exits (benchmark: sector)
├── SDT Organisatiescore    → gemiddelde per dimensie over tijd
├── Exit Reden Distributie  → push / pull / situationeel verdeling
├── Knelpunt Heatmap        → org factoren per afdeling
├── Risico Cohorten         → welke afdelingen/functies/tenure scoren laag
├── Verloop Trend           → maandelijks verlooppatroon
└── Totale Replacement Cost → financiële impact YTD
```

### 5.3 Patroonregels (automatisch gegenereerde inzichten)

```python
# Managementpatroon
if leiderschap_score < 5.5 AND n_exits >= 3 AND same_department:
    alert: "Leiderschapspatroon gedetecteerd in [afdeling]"
    urgentie: HOOG

# Cultuurpatroon
if cultuur_score < 5.0 AND psychveiligheid_items_avg < 5.0:
    alert: "Cultuur- en veiligheidsprobleem in kaart gebracht"

# Vroeg verloop
if tenure_years < 1.0 AND n_exits >= 2:
    alert: "Vroeg verloop patroon — mogelijke onboarding of fit-probleem"

# Compensatiepatroon
if compensatie_score < 5.0 AND pull_score >= 4.0:
    alert: "Salarisgerelateerd verloop — marktconformiteitscheck aanbevolen"

# SDT Organisatiebreed
if sdt_autonomie_org_avg < 5.5:
    alert: "Organisatiebrede autonomietekort — management stijl evalueren"
```

---

## 6. AANBEVELINGSMATRIX

*Per thema, per urgentieniveau — concrete HR-acties*

### Leiderschap
| Score | Urgentie | Acties |
|---|---|---|
| < 5.0 | 🔴 URGENT | 360° feedback direct leidinggevende · Individueel coachingtraject · Exit-patroon rapporteren aan MT · Team pulse-meting na vertrek |
| 5.0–6.4 | 🟠 HOOG | Stay-interviews met teamleden · Leiderschapsontwikkelingsprogramma · Check-in frequentie verhogen |
| 6.5–7.9 | 🟡 MIDDEN | Kwartaalgesprekken versterken · Feedbackcultuur stimuleren |
| ≥ 8.0 | 🟢 GOED | Borgen — identificeer en deel best practices |

### Cultuur & Psychologische Veiligheid
| Score | Urgentie | Acties |
|---|---|---|
| < 5.0 | 🔴 URGENT | Psychologische veiligheidsaudit (Edmondson-scan) · Inclusie & belonging assessment · Extern gefaciliteerde teamretrospective |
| 5.0–6.4 | 🟠 HOOG | Anonieme medewerkerspuls · Leiderschapstraining op inclusief leiderschap · Waarden-alignment sessie |
| 6.5–7.9 | 🟡 MIDDEN | Periodieke teamdialoog · Cultuurambassadeurs aanstellen |
| ≥ 8.0 | 🟢 GOED | Borgen en versterken — deel succesverhalen |

### Groei & Ontwikkeling
| Score | Urgentie | Acties |
|---|---|---|
| < 5.0 | 🔴 URGENT | Individueel ontwikkelplan direct heroverwegen · Intern mobiliteitsgesprek · Mentoring of sponsorship koppelen |
| 5.0–6.4 | 🟠 HOOG | Leerbudget en -aanbod evalueren · Loopbaangesprekken structureren · Transparantie over doorgroeipad |
| 6.5–7.9 | 🟡 MIDDEN | Kwartaalse groeicheck · Stretch-assignments aanbieden |
| ≥ 8.0 | 🟢 GOED | Borgen — gebruik als retentieargument in arbeidsmarktcommunicatie |

### Compensatie
| Score | Urgentie | Acties |
|---|---|---|
| < 5.0 | 🔴 URGENT | Marktconformiteitsanalyse uitvoeren · Total rewards communicatie verbeteren · Beloningsstructuur heroverwegen |
| 5.0–6.4 | 🟠 HOOG | Benchmarkonderzoek (salarissurvey) · Secundaire arbeidsvoorwaarden evalueren |
| 6.5–7.9 | 🟡 MIDDEN | Transparantie over beloningsbeleid vergroten |
| ≥ 8.0 | 🟢 GOED | Inzetten als recruitmentargument |

### Werkdruk & Balans
| Score | Urgentie | Acties |
|---|---|---|
| < 5.0 | 🔴 URGENT | Capaciteitsanalyse team · Prioriteiten review met management · Verzuimrisico monitoren · Werkdruk bespreekbaar maken via check-ins |
| 5.0–6.4 | 🟠 HOOG | Hybride werkbeleid evalueren · Verwachtingsmanagement rondom bereikbaarheid |
| 6.5–7.9 | 🟡 MIDDEN | Periodiek werkdrukgesprek in teamoverleg |
| ≥ 8.0 | 🟢 GOED | Borgen — benoem in employer branding |

### Rolhelderheid
| Score | Urgentie | Acties |
|---|---|---|
| < 5.0 | 🔴 URGENT | Functiebeschrijving actualiseren · RACI-sessie met team · Verwachtingsalignment leidinggevende-medewerker |
| 5.0–6.4 | 🟠 HOOG | Onboardingproces versterken · Regelmatige check-ins over rolinvulling |
| 6.5–7.9 | 🟡 MIDDEN | Periodieke roleval uatie in beoordelingscyclus |
| ≥ 8.0 | 🟢 GOED | Borgen |

### SDT-dimensies (aanvullend op org-factoren)

**Autonomie < 5.0:**
→ Management stijl evalueren op micro-management signalen
→ Beslissingsbevoegdheden expliciet beleggen
→ Vertrouwensgebaseerd leiderschap trainen

**Verbinding < 5.0:**
→ Teamcohesie activiteiten (niet verplicht, wel faciliterend)
→ Buddy/peer-systeem bij onboarding
→ Informele verbindingsmomenten structureren

**Competentie < 5.0:**
→ Erkenning en waardering cultuur versterken
→ Taakverrijking en stretch-opdrachten
→ Frequentere positieve feedback trainen bij leidinggevenden

---

## 7. RAPPORTSTRUCTUUR

### ExitScan Rapport (per analyse, downloadbaar als PDF)

```
PAGINA 1 — Executive Summary
├── Medewerkerinfo (geanonimiseerd: ID, afdeling, tenure, niveau)
├── Replacement Cost (prominent, rood)
├── Preventability Verdict (REDBAAR / DEELS / NIET + %)
├── Top 3 Knelpunten (met scores)
└── Urgentie-indicator (URGENT / HOOG / MIDDEN / LAAG)

PAGINA 2 — SDT Analyse
├── Staafdiagram: 3 dimensies (scores + drempelwaarden)
├── Interpretatie per dimensie (2–3 zinnen)
└── Vergelijking met organisatiegemiddelde (indien beschikbaar)

PAGINA 3 — Organisatiefactoren
├── Radardiagram: 6 thema's
├── Gerangschikte lijst: laag → hoog
├── Top 3 sterktes + Top 3 aandachtspunten
└── Push/Pull balans (intern vs. extern)

PAGINA 4 — Preventability & Context
├── Exitcategorie + stay-intent
├── Preventability algoritme uitkomst + onderbouwing
└── Eerdere signalering (ja/nee/gedeeltelijk)

PAGINA 5 — Concrete Aanbevelingen
├── Per thema (gefilterd op scores < 6.5)
├── Prioritering: URGENT → HOOG → MIDDEN
└── Quick wins vs. structurele interventies

PAGINA 6 — Financiële Impact
├── Replacement cost berekening (salaris × multiplier)
├── Kostencategorieën (werving, onboarding, kennisverlies)
└── Kosten van inactie (bij herhalend patroon: extrapolatie)
```

### Organisatiedashboard (klant — live)

```
SECTIE 1 — Overzicht
├── KPIs: totaal exits, % redbaar, totale cost, gem. SDT
├── Trend: verloop per kwartaal
└── Benchmark: (fase 2 — sectorvergelijking)

SECTIE 2 — SDT Organisatietrend
├── Lijndiagram: SDT-scores over tijd
└── Heatmap: SDT per afdeling

SECTIE 3 — Knelpunt Analyse
├── Org factoren ranking (alle exits gecombineerd)
├── Patroonalerts (automatisch gegenereerd)
└── Afdelingsfilter

SECTIE 4 — Exit Reden Verdeling
├── Push / Pull / Situationeel verdeling
├── Exitcategorie breakdown
└── Stay-intent verdeling

SECTIE 5 — Financieel
├── Replacement cost YTD
├── Cost per afdeling
└── Kosten-per-exitcategorie

SECTIE 6 — Individuele Analyses
└── Tabel met alle analyses (klikbaar → detail)
```

### Operator Masterdashboard (HRBP — live)

```
├── Alle klantorganisaties (kaartjes met KPIs)
├── Campagnebeheer (uitgestuurde surveys per klant)
├── Responsrate tracker
├── Nieuwe analyse starten
└── Rapporten genereren en versturen
```

---

## 8. EXIT REDEN TAXONOMIE (literatuur-onderbouwd)

*Gebaseerd op Mitchell & Lee (2001) push-pull model + Holtom et al. (2008)*

### Push-factoren (intern — potentieel vermijdbaar)
| Code | Categorie | Primaire meting |
|---|---|---|
| P1 | Leiderschapsfalen | C1 + SDT Autonomie/Verbinding |
| P2 | Cultuur & klimaat | C2 + SDT Verbinding |
| P3 | Ontwikkelingsgebrek | C3 + SDT Competentie |
| P4 | Beloningsonvrede | C4 |
| P5 | Overbelasting / burn-out | C5 + SDT Autonomie |
| P6 | Rolproblemen | C6 + SDT Autonomie |

### Pull-factoren (extern — beperkt vermijdbaar)
| Code | Categorie | Primaire meting |
|---|---|---|
| PL1 | Carrièresprong | D1-D3 hoog + exitcat. Loopbaanstap |
| PL2 | Salarisverhoging extern | D1-D3 hoog + exitcat. Salaris |
| PL3 | Sectorswitch | D-module |

### Situationeel (niet vermijdbaar)
| Code | Categorie |
|---|---|
| S1 | Persoonlijke omstandigheden |
| S2 | Pensioen / levensloopkeuze |
| S3 | Ondernemerschap / ZZP |

---

## 9. KWALITEITSBORGING & METHODOLOGISCHE VERANTWOORDING

### Schaalbetrouwbaarheid (streefdoelen)
- SDT per dimensie (4 items): Cronbach's α ≥ 0.75 (acceptabel voor 4 items)
- Org-factoren per thema (3 items): α ≥ 0.70
- Validatieplan: calibratieset van 30+ analyses met HRBP-beoordeling (zie audit rapport §3)

### Minimale steekproefgrootte voor organisatierapportage
- Individueel rapport: n=1 (altijd beschikbaar)
- Thema-gemiddelden dashboard: n≥5 (anonimiteitsdrempel)
- Afdelingsfilter: n≥3 per afdeling

### Transparantieverplichtingen richting klant
- Scoringslogica beschikbaar als bijlage in rapport
- Literatuurverwijzingen opgenomen
- Reverse-coding onzichtbaar voor respondent, zichtbaar in technische documentatie
- AI-gebruik: alleen voor kwalitatieve verrijking open tekst, niet voor kernscores

---

## 10. VOLGENDE ONTWIKKELSTAPPEN

```
FASE 1 — Fundament (prioriteit)
├── Supabase database schema (analyses, orgs, campaigns, respondents)
├── FastAPI backend (bestaande Python-logica hergebruikt)
├── Survey-pagina (token-gebaseerde URL, geen login)
└── Persistente opslag + operator dashboard

FASE 2 — Multi-tenancy
├── Supabase Auth (operator + klant rollen)
├── Row Level Security per organisatie
├── Klant-dashboard (read-only)
└── Campagnebeheer (surveys uitsturen)

FASE 3 — Distributie & Rapportage
├── E-mail distributie (Resend)
├── Respons-tracking
├── PDF-rapport generatie (reportlab / WeasyPrint)
└── Hosting (Railway + Vercel)

FASE 4 — Intelligentie
├── Patroondetectie algoritmen
├── Benchmarking database (sectorgemiddelden)
├── RetentieScan volledig uitgebouwd
└── PulseScan (periodieke meting)
```

---

*Blueprint v1.0 — Verisight / Verloopinzichten Platform*
*Alle schalen gebaseerd op gepubliceerde, peer-reviewed instrumenten.*
*Zie literatuurverwijzingen per sectie voor bronnen.*
