# Loep Behoud als MTO-alternatief: implementatieplan

> **Voor agents:** VERPLICHTE SUB-SKILL: gebruik superpowers:subagent-driven-development (aanbevolen) of superpowers:executing-plans om dit plan taak voor taak uit te voeren. Stappen gebruiken checkboxes (`- [ ]`).

**Doel:** Loep Behoud verkopen als "het korte medewerkersonderzoek. Een alternatief voor het grote jaarlijkse MTO." Loep Cultuurbeeld gaat uit het aanbod. Alleen copy en routering; vragenlijst, scoring en rapportlogica blijven gelijk.

**Spec:** `docs/superpowers/specs/2026-10-11-behoud-als-mto-alternatief-design.md` (akkoord Lars 11-10). Bij twijfel wint de spec.

**Architectuur:** Een nieuwe copy-guard (vitest) pint eerst de regels uit spec par. 4 vast. Daarna gaat de copy om op site, metadata, `llms.txt` en de dashboard-methodiekkaart. De contactfunnel stuurt brede vragen naar Loep Behoud en verbergt Cultuurbeeld als optie, terwijl oude leads leesbaar blijven. `/producten/cultuurbeeld` krijgt een 308. De backend-copy gaat mee voor consistentie, en een pytest bewijst dat het live rapport geen "MTO" bevat. Buiten de repo komt er een OR-notitie in `Loep_Docs/`.

**Stack:** Next.js (frontend, vitest, tsc), FastAPI-backend (pytest), losse HTML in `Loep_Docs/`.

---

## Harde regels voor elke taak

- **Startvoorwaarde:** `feature/polijstronde` staat op main. Staat hij er niet, stop en meld dat aan Lars. Begin niet op een oudere main.
- **Niet mergen en niet pushen.** Alleen committen op de featurebranch.
- **Regelnummers en citaten in dit plan komen van main `6b5d3b7f`**, dus van vóór de polijstronde. Zoek elke plek op met de genoemde zoekterm, niet op regelnummer. Is een tekst door de polijstronde al veranderd, pas dan de nieuwe tekst aan volgens dezelfde regel, en noem het verschil in het verslag.
- **Klantcopy:** je/jij, geen em- of en-dashes (— –), geen "begeleid", geen HR-jargon, geen bedrag per medewerker, "MTO" nooit als productnaam (spec par. 4).
- **Werkmap:** worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\behoud-mto`, branch `feature/behoud-mto-alternatief`. Python: `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe`. Frontendcommando's vanuit `frontend/` in de worktree.
- **Commitregel:** elk commitbericht eindigt met `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

### Taak 0: Worktree, baselines en herinventarisatie

**Bestanden:** geen codewijziging. Uitvoer in de scratchpad en in het verslag (`docs/superpowers/plans/2026-10-11-behoud-als-mto-alternatief-uitvoering.md`).

- [ ] **Stap 1: Controleer de startvoorwaarde**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight && git log --oneline main | grep -i "polijstronde" | head -3
```
Verwacht: een merge-commit van `feature/polijstronde`. Zie je die niet: STOP en meld aan Lars "polijstronde staat nog niet op main".

- [ ] **Stap 2: Maak de worktree**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight && git worktree add .worktrees/behoud-mto -b feature/behoud-mto-alternatief main
cmd //c mklink /J ".worktrees\\behoud-mto\\frontend\\node_modules" "frontend\\node_modules"
```
Let op: verwijder deze junction later alleen met `cmd //c rmdir .worktrees\behoud-mto\frontend\node_modules`, **zonder `/s`**. `rmdir /s` leegt het doel (gotcha van 11-9). Is `frontend/node_modules` in de hoofdmap leeg, draai daar dan eerst `npm install` en zet daarna `package-lock.json` terug met `git checkout -- frontend/package-lock.json`.

- [ ] **Stap 3: Leg de baselines vast (vóór elke wijziging)**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/behoud-mto/frontend
S=/c/Users/larsh/AppData/Local/Temp/claude/behoud-mto && mkdir -p $S
npx tsc --noEmit 2>&1 | grep -c "error TS" > $S/tsc-voor.txt
npx vitest run --reporter=json --outputFile=$S/vitest-voor.json > /dev/null 2>&1
cd .. && /c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR)" | sed 's/ - .*//' | sort > $S/pytest-voor.txt
```
Maak een hulpscript `$S/vitest_faalset.py`:

```python
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
namen = sorted(
    f"{r['name'].split('frontend')[-1].replace(chr(92), '/')} :: {a['fullName']}"
    for r in data["testResults"] for a in r["assertionResults"] if a["status"] == "failed"
)
print("\n".join(namen))
```
en draai `python $S/vitest_faalset.py $S/vitest-voor.json > $S/vitest-voor.txt`. Noteer in het verslag de aantallen tsc, vitest-falend en pytest-falend.

- [ ] **Stap 4: Herinventariseer op de gemergde main**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/behoud-mto
grep -rn "MTO\|medewerkersonderzoek\|Cultuurbeeld\|cultuurbeeld\|Culture Assessment\|per medewerker\|p\.p\." frontend/components/marketing frontend/app frontend/lib frontend/public/llms.txt --include=*.ts --include=*.tsx --include=*.txt | grep -v "\.test\.\|action-center\|/products/culture_assessment/"
grep -rn "MTO" backend/products/retention backend/report_html.py
```
Zet de uitkomst in het verslag, gesorteerd op: (a) gerenderd voor bezoeker of klant, (b) alleen operator of beheer, (c) dode export of ongerouteerd. Een plek is "gerenderd" als hij geïmporteerd wordt door een pagina of component die een bezoeker of ingelogde klant ziet. Controleer dat met `grep -rln "<exportnaam>" frontend/app frontend/components frontend/lib | grep -v test`.

- [ ] **Stap 5: Zoek de invultijdbron van de polijstronde**

```bash
grep -rn "invite_duration\|survey_duration\|duration:" backend/products/retention/definition.py frontend/components/marketing/producten-content.tsx frontend/lib | grep -iv test | head
```
Noteer in het verslag welke bron de polijstronde als enige waarheid heeft gemaakt, en welke waarde Loep Behoud daar heeft (bijvoorbeeld "± 8 minuten"). Elke invultijd in deze ronde komt uit die bron. Kan de copy de waarde niet uit code halen (losse HTML, `llms.txt`), dan neem je dezelfde tekst letterlijk over.

- [ ] **Stap 6: Commit niets.** Ga door naar Taak 1.

---

### Taak 1: Copy-guard (eerst falend)

**Bestanden:**
- Maken: `frontend/lib/behoud-mto-alternatief.guard.test.ts`

- [ ] **Stap 1: Schrijf de guard**

Gebruik dezelfde opbouw als `frontend/lib/site-ronde-besluit-a.guard.test.ts` (ROOT via `import.meta.url`, Fail Loud bij een ontbrekend bestand, JSX-spaties normaliseren). Neem de lijst gerenderde bestanden over uit die guard (`EXPLICIT_FILES` plus `components/marketing/*` plus de top-level HTML in `public/`). Staat er na de polijstronde een bestand bij of af, volg dan die guard.

```ts
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Loep Behoud als alternatief voor het grote jaarlijkse MTO (besluit Lars
 * 11-10-2026). Spec: docs/superpowers/specs/2026-10-11-behoud-als-mto-alternatief-design.md,
 * par. 4. Deze guard leest de bron van elk gerenderd marketingbestand plus de
 * dashboard-methodiekkaart van Loep Behoud.
 */
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const MARKETING_DIR = 'components/marketing'

const EXPLICIT_FILES = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/opengraph-image.tsx',
  'app/producten/page.tsx',
  'app/producten/[slug]/page.tsx',
  'app/kennismaking/page.tsx',
  'app/vertrouwen/page.tsx',
  'app/pilot/page.tsx',
  'lib/site-meta.ts',
  'lib/pricing.ts',
  'public/llms.txt',
]

// Klantzichtbaar in het dashboard (MethodologyCard in campaigns/[id]/page-helpers.tsx).
const DASHBOARD_FILES = ['lib/products/retention/definition.ts']

function marketingFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, MARKETING_DIR))
    .filter((name) => /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
    .map((name) => `${MARKETING_DIR}/${name}`)
    .sort()
}

function publicHtmlFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, 'public'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.html?$/i.test(entry.name))
    .map((entry) => `public/${entry.name}`)
    .sort()
}

const RENDERED_FILES = [...marketingFiles(), ...publicHtmlFiles(), ...EXPLICIT_FILES, ...DASHBOARD_FILES]

function read(rel: string): string {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) throw new Error(`Gerenderd bestand ontbreekt: ${rel}`)
  return fs
    .readFileSync(full, 'utf8')
    .replace(/\{\s*['"] ['"]\s*\}/g, ' ')
    .replace(/\s+/g, ' ')
}

/** Zinnen (grof) waarin MTO of medewerkersonderzoek voorkomt. */
function mtoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|['"`]\s*,\s*['"`]/).filter((s) => /\bMTO\b|medewerkersonderzoek/i.test(s))
}

const FORBIDDEN: Array<[string, RegExp]> = [
  ['MTO als productnaam', /\bLoep[\s-]?MTO\b|\bhet Loep-MTO\b/i],
  ['vervangingsclaim', /vervangt\s+(je|jouw|het|uw)\s+MTO/i],
  ['volledigheidsclaim', /\bvolledig(e)?\s+MTO\b|alles wat een MTO meet/i],
  ['oude afwijzing', /geen brede MTO\b|geen breed MTO-project|MTO-light|Is Loep Behoud gewoon een MTO/i],
  // Alleen claims dat Loep zelf vergelijkt. "Wil je je scores vergelijken met andere
  // organisaties, dan past een groot MTO beter" is de eerlijke grens en mag.
  ['benchmarkclaim', /branchegemiddelde|branchevergelijking|benchmarkscore|normscore|\b(Loep|we|wij|het rapport)\s+vergelijk\w*\s+(je\s+)?met\s+(de markt|andere organisaties|je branche)/i],
  [
    'bedrag per medewerker',
    /€\s?\d[\d.,]*[^.;]{0,60}\b(per medewerker|p\.p\.|per persoon)\b|\b(per medewerker|p\.p\.|per persoon)\b[^.;]{0,60}€\s?\d/i,
  ],
]

describe('Loep Behoud als MTO-alternatief: copyregels', () => {
  for (const rel of RENDERED_FILES) {
    it(`${rel} volgt de copyregels`, () => {
      const text = read(rel)
      for (const [naam, patroon] of FORBIDDEN) {
        const hit = text.match(patroon)
        expect(hit?.[0] ?? null, `${naam} in ${rel}`).toBeNull()
      }
      for (const zin of mtoSentences(text)) {
        expect(zin, `aantal vragen naast MTO in ${rel}`).not.toMatch(/\b\d+\s*(vragen|stellingen)\b/i)
        expect(zin, `superlatief naast MTO in ${rel}`).not.toMatch(/\b(de kortste|razendsnel|slechts|maar \d+ minuten)\b/i)
      }
    })
  }

  it('de positionering staat op /producten en in de FAQ', () => {
    const producten = read('components/marketing/producten-content.tsx')
    expect(producten).toContain('Een alternatief voor het grote jaarlijkse MTO')
    expect(producten).toContain('Het korte medewerkersonderzoek')
    const faq = read('components/marketing/site-content.ts')
    expect(faq).toContain('Is Loep Behoud een MTO?')
  })

  it('de keuzehulp noemt grootte niet als reden voor een groot MTO', () => {
    const producten = read('components/marketing/producten-content.tsx')
    expect(producten).not.toMatch(/1\.000 of meer medewerkers[^']{0,40}MTO|MTO[^']{0,80}1\.000/i)
  })
})
```

- [ ] **Stap 2: Draai de guard en zie hem falen**

Run: `npx vitest run lib/behoud-mto-alternatief.guard.test.ts`
Verwacht: FAIL. Minstens "oude afwijzing" in `site-content.ts`, `producten-content.tsx` en `lib/products/retention/definition.ts`, en de positioneringstest. Valt een patroon op tekst die niets met deze ronde te maken heeft (bijvoorbeeld een bedrag per medewerker dat Lars ooit bewust heeft toegestaan), stop dan en leg het voor. Verzwak het patroon niet stilletjes.

- [ ] **Stap 3: Commit (falende guard bewust op de branch)**

```bash
git add frontend/lib/behoud-mto-alternatief.guard.test.ts
git commit -m "test(guard): copyregels Loep Behoud als MTO-alternatief

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Taak 2: Site-copy (FAQ, /producten, homepagekaart)

**Bestanden:**
- Wijzigen: `frontend/components/marketing/site-content.ts` (zoek `Is Loep Behoud gewoon een MTO`, `export const pricingFaqs`, `export const approachRoutes`)
- Wijzigen: `frontend/components/marketing/producten-content.tsx` (zoek `id: 'loep-behoud'` en `function MtoComparisonSection`)
- Wijzigen: `frontend/components/marketing/home-page-content.tsx` (zoek `title: 'Loep Behoud'` in `routeCards`)

- [ ] **Stap 1: FAQ omdraaien**

In `faqs` in `site-content.ts` wordt het paar `'Is Loep Behoud gewoon een MTO?'` vervangen door:

```ts
  [
    'Is Loep Behoud een MTO?',
    'Het is een alternatief voor het grote jaarlijkse MTO. Een groot MTO meet alles en eindigt vaak in een rapport waar niemand mee verder komt. Loep Behoud meet wat telt voor of mensen blijven, laat zien wat je mensen daar zelf over zeggen, en zegt waar je begint. Wil je je scores vergelijken met andere organisaties, dan past een groot MTO beter.',
  ],
```
De FAQPage-JSON-LD (`faqSchema`) wordt uit `faqs` opgebouwd. Controleer dat met `grep -n "faqSchema" -A10 frontend/components/marketing/site-content.ts`. Is hij los geschreven, pas hem dan ook aan.

- [ ] **Stap 2: Dode exports met oude MTO-copy verwijderen (verify-before-delete)**

```bash
for e in pricingFaqs approachRoutes; do echo "== $e"; grep -rn "\b$e\b" frontend/app frontend/components frontend/lib | grep -v "site-content.ts:"; done
```
Heeft een export 0 importeurs buiten tests, verwijder dan de hele export. `pricingFaqs` bevat "Wanneer kies je voor Loep Culture Assessment?", "MTO-light" en "Is Loep Behoud een MTO-vervanger? Nee". In het blok van `approachRoutes` staat "geen brede MTO". Een test die zo'n export importeert, wordt bijgewerkt: haal de import en de assert weg en noem dat in het verslag. Heeft een export wél een gerenderde importeur, verwijder hem dan niet. Herschrijf in dat geval alleen de MTO-zinnen volgens spec par. 4.

- [ ] **Stap 3: /producten, sectie Loep Behoud**

In het object met `id: 'loep-behoud'`:

```ts
    eyebrow: 'Het korte medewerkersonderzoek',
    title: 'Loep Behoud',
    lead: 'Een alternatief voor het grote jaarlijkse MTO. Loep laat zien waar behoud onder druk staat, vóór uitstroom zichtbaar wordt, en het rapport brengt je MT tot één eerste keuze.',
```
Heeft de polijstronde `lead` veranderd, zet dan "Een alternatief voor het grote jaarlijkse MTO." vóór de nieuwe lead. Vervang de `when`-regel `'Je wilt een eerste keuze, geen breed MTO-project'` door:

```ts
      'Je wilt na je onderzoek weten waar je begint, niet alleen hoe je scoort',
```
Het veld `duration` blijft de invultijd uit de bron van Taak 0 stap 5. Zo staat "kort" naast de echte invultijd. Controleer dat de kaart `eyebrow` en `duration` echt rendert: zoek in hetzelfde bestand op `.eyebrow` en `.duration`.

- [ ] **Stap 4: /producten, keuzehulp herschrijven**

In `MtoComparisonSection`:

```tsx
  const mtoFits = [
    'Je wilt je scores vergelijken met andere organisaties of je branche (een benchmark)',
    'Je wilt onderwerpen meten die Loep Behoud niet meet, zoals communicatie en informatie, arbeidsomstandigheden of ongewenst gedrag',
    'Je wilt een vast meetritme dat een intern team zelf beheert in een eigen platform',
  ] as const
  const loepFits = [
    'Je wilt weten waar het wringt bij de mensen die je wilt houden, en waarom volgens henzelf',
    'Je wilt een antwoord waar je MT mee aan tafel kan, geen dashboard om te beheren',
    'Je wilt na de meting een besluit: wat, wie en wanneer',
  ] as const
```
Kop: `Wanneer past een groot MTO beter?`. Intro (vervangt "Een Loep-scan vervangt geen breed medewerkersonderzoek…"):

```tsx
              Loep Behoud is een alternatief voor het grote jaarlijkse MTO, geen kopie ervan. Het meet minder
              onderwerpen en zegt daardoor scherper waar je begint. Soms heb je iets anders nodig.
```
Kop van de rechterkolom: `Kies Loep Behoud als`.

**Controle tegen de vragenlijst (spec par. 5):** de onderwerpen in `mtoFits` mogen niet in de vragenlijst zitten. Draai:

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -c "
from backend.products.retention.definition import get_definition
d=get_definition(); import json
txt=json.dumps(d, ensure_ascii=False).lower()
for w in ['communicatie','informatie','arbeidsomstandigheden','ongewenst','intimidatie','pesten']: print(w, w in txt)
"
```
Verwacht: alles `False`. Is iets `True`, haal dat onderwerp dan uit `mtoFits` en noem het in het verslag.

- [ ] **Stap 5: Homepage, scankaart Loep Behoud**

In `routeCards` blijft `eyebrow: 'Behoud onder druk'`, omdat de drie eyebrows één set probleemlabels vormen. De `body` wordt:

```ts
    body: 'Het korte medewerkersonderzoek: waar het wringt bij de mensen die je wilt houden, waarom volgens henzelf, en waar je begint. Een alternatief voor het grote jaarlijkse MTO.',
```
De h1 en de paginatitel blijven.

- [ ] **Stap 6: Guard en bestaande tests**

Run: `npx vitest run lib/behoud-mto-alternatief.guard.test.ts lib/marketing-positioning.test.ts lib/marketing-portfolio-cleanup.test.ts lib/site-ronde-besluit-a.guard.test.ts`
Verwacht: de guard is groen voor `site-content.ts`, `producten-content.tsx` en `home-page-content.tsx`. Hij kan nog falen op `lib/products/retention/definition.ts` (Taak 4) en op `public/llms.txt` (Taak 3). De andere drie bestanden staan op dezelfde faalset als in de baseline. Een test die de oude FAQ-tekst letterlijk pint, werk je in lockstep bij, en je noemt hem in het verslag.

- [ ] **Stap 7: Commit**

```bash
git add frontend/components/marketing frontend/lib/*.test.ts
git commit -m "feat(site): Loep Behoud als het korte medewerkersonderzoek, alternatief voor het grote jaarlijkse MTO

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Taak 3: Metadata, JSON-LD en llms.txt

**Bestanden:**
- Wijzigen: `frontend/lib/site-meta.ts` (zoek `SITE_DESCRIPTION`, `HOME_SCHEMA_DESCRIPTION`)
- Wijzigen: `frontend/app/producten/page.tsx` (zoek `description`)
- Wijzigen: `frontend/public/llms.txt` (zoek `Loep Behoud`)

- [ ] **Stap 1: Metadata**

Lees de huidige `SITE_DESCRIPTION`, `HOME_SCHEMA_DESCRIPTION` en de `description` van `/producten`. Voeg in elk de zinsnede "een alternatief voor het grote jaarlijkse MTO" toe, op de plek waar Loep Behoud wordt genoemd, of als slotzin als Behoud niet apart wordt genoemd. Een `description` blijft onder 160 tekens. Wordt hij langer, kort dan een bestaande bijzin in. Verander de titels niet (spec par. 11). Geen bedrag, geen aantal vragen.

- [ ] **Stap 2: llms.txt**

Zet direct onder de bestaande beschrijving van Loep Behoud deze regel:

```
  Het korte medewerkersonderzoek: een alternatief voor het grote jaarlijkse MTO. Geen benchmark met andere
  organisaties; het rapport zegt waar jouw organisatie begint. Invultijd: <waarde uit Taak 0 stap 5>.
```
Vervang `<waarde uit Taak 0 stap 5>` door de letterlijke tekst uit de invultijdbron, bijvoorbeeld "± 8 minuten". Laat dit niet als placeholder staan. Controleer met `grep -n "Cultuurbeeld\|Culture" frontend/public/llms.txt` dat Cultuurbeeld er niet in staat. Verwacht: 0 regels.

- [ ] **Stap 3: Tests**

Run: `npx vitest run lib/behoud-mto-alternatief.guard.test.ts lib/seo-conversion.test.ts lib/marketing-flow.test.ts`
Verwacht: de guard is groen voor de bestanden van deze taak. `seo-conversion` en `marketing-flow` staan op de baseline-faalset. Een assert op de letterlijke oude description werk je in lockstep bij.

- [ ] **Stap 4: Commit**

```bash
git add frontend/lib/site-meta.ts frontend/app/producten/page.tsx frontend/public/llms.txt frontend/lib/*.test.ts
git commit -m "feat(seo): MTO-alternatief in metadata en llms.txt, titels ongewijzigd

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Taak 4: Dashboard-methodiekkaart en backendconsistentie

**Bestanden:**
- Wijzigen: `frontend/lib/products/retention/definition.ts` (`methodologyText`, `whatItIsNotText`)
- Wijzigen: `backend/products/retention/definition.py` (`trust_contract.what_it_is_not`)
- Wijzigen: `backend/products/retention/report_content.py` (zoek `geen brede MTO`)
- Maken: `tests/test_behoud_mto_live_rapport.py`

- [ ] **Stap 1: Schrijf de falende pytest**

```python
"""Het live rapport van Loep Behoud noemt nergens een MTO (spec 2026-10-11, par. 6.2).

De zinnen "geen brede MTO" in retention/report_content.py en het backend-
trust-contract worden alleen door de oude ReportLab-route gebruikt. Deze test
pint dat het live rapport (report_html.py) er niets van overneemt, en dat de
backendbron zelf de nieuwe formulering gebruikt.
"""
from pathlib import Path

from backend.products.retention import report_content
from backend.products.retention.definition import get_definition
from backend.report_html import render_retention_report_html
from tests.test_report_distribution import _min_retention_data


def test_live_behoud_rapport_bevat_geen_mto():
    html = render_retention_report_html(_min_retention_data())
    assert "MTO" not in html


def test_report_html_bron_noemt_geen_mto():
    bron = Path("backend/report_html.py").read_text(encoding="utf-8")
    assert "MTO" not in bron


def test_backendbron_zegt_geen_breed_mto_met_benchmark():
    tekst = get_definition()["trust_contract"]["what_it_is_not"]
    assert "geen brede MTO" not in tekst.lower()
    assert tekst.startswith("Geen breed MTO met benchmark")
    bron = Path(report_content.__file__).read_text(encoding="utf-8")
    assert "geen brede MTO" not in bron
```

- [ ] **Stap 2: Draai hem en zie hem falen**

Run (vanuit de worktree-root): `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_behoud_mto_live_rapport.py -v`
Verwacht: de eerste twee slagen (het live rapport noemt geen MTO), de derde faalt. Faalt de eerste of de tweede ook: STOP. De premisse uit spec 6.2 klopt dan niet, en het rapport moet wél mee. Leg dat aan Lars voor.

- [ ] **Stap 3: Backend aanpassen**

In `backend/products/retention/definition.py`:

```python
        "what_it_is_not": (
            "Geen breed MTO met benchmark, geen individuele voorspeller, geen performance-instrument en geen "
            "selectie- of interventietool op persoonsniveau."
        ),
```
In `backend/products/retention/report_content.py`:
- `"Het rapport is geen brede MTO, "` wordt `"Het rapport is geen breed MTO met benchmark, "`
- `"De methodiek is compact en nadrukkelijk geen brede MTO of diagnostisch instrument; "` wordt `"De methodiek is compact en nadrukkelijk geen breed MTO met benchmark en geen diagnostisch instrument; "`

- [ ] **Stap 4: Frontend-dashboardtekst aanpassen**

In `frontend/lib/products/retention/definition.ts`:
- in `methodologyText`: `'Verisight maakt zichtbaar'` wordt `'Loep maakt zichtbaar'`, en `'Loep Behoud is geen brede MTO en geen individuele voorspeller'` wordt `'Loep Behoud is geen breed MTO met benchmark en geen individuele voorspeller'`;
- `whatItIsNotText`: dezelfde tekst als de backend `what_it_is_not` hierboven.

Heeft de polijstronde deze teksten al veranderd ("Werkbeeld" enz.), pas dan alleen de MTO-zinsnede en "Verisight" aan.

- [ ] **Stap 5: Tests**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_behoud_mto_live_rapport.py -v
cd frontend && npx vitest run lib/behoud-mto-alternatief.guard.test.ts
grep -rn "geen brede MTO\|Geen brede MTO" ../tests frontend/lib frontend/app --include=*.py --include=*.ts | grep -v node_modules
```
Verwacht: pytest 3 passed. De guard is volledig groen (alle bestanden). De grep vindt nog hooguit pulse-definities en `seo-solution-pages.ts`/`sample-showcase-assets.ts` (Taak 4 stap 6). Een bestaande test die de oude zin pint, werk je in lockstep bij.

- [ ] **Stap 6: Ongerenderde copy (spec 6.3)**

Voor `frontend/lib/seo-solution-pages.ts`, `frontend/lib/sample-showcase-assets.ts`, `frontend/lib/products/pulse/definition.ts` en `backend/products/pulse/definition.py`: controleer met `grep -rln` op hun exports of ze een gerenderde importeur hebben (zie de definitie in Taak 0 stap 4). Zonder gerenderde importeur blijven ze staan, en je noemt ze in het verslag. Met een gerenderde importeur: pas dan de MTO-zin aan zoals in stap 3.

- [ ] **Stap 7: Commit**

```bash
git add backend/products/retention frontend/lib/products/retention tests/test_behoud_mto_live_rapport.py
git commit -m "feat(behoud): methodiekkaart en trust-contract zonder 'geen brede MTO', live rapport gepind

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Taak 5: Read-only productiecheck Cultuurbeeld (gate voor Taak 6 en 7)

**Bestanden:** geen repowijziging. Script in de scratchpad, uitkomst in het verslag.

- [ ] **Stap 1: Zoek de kolommen op**

```bash
grep -n "class ContactRequest" -A40 backend/models.py | grep -n "route\|qualified"
grep -n "class Campaign\b" -A30 backend/models.py | grep -n "scan_type\|is_active\|closed_at"
```

- [ ] **Stap 2: Schrijf het telscript** (`$S/cultuurbeeld_telling.py`, buiten de repo)

```python
"""Alleen-lezen telling van Cultuurbeeld-campagnes en -leads op productie.

Toont alleen aantallen, geen namen, e-mailadressen of vrije tekst.
"""
import os
from pathlib import Path

from sqlalchemy import create_engine, text

env = Path(r"C:\Users\larsh\Desktop\Business\Verisight\.env").read_text(encoding="utf-8")
url = next(l.split("=", 1)[1].strip().strip('"') for l in env.splitlines() if l.startswith("DATABASE_URL="))
if url.startswith("postgresql://"):
    url = "postgresql+psycopg2://" + url[len("postgresql://"):]
engine = create_engine(url)
with engine.connect() as conn:
    conn.execute(text("SET TRANSACTION READ ONLY"))
    print("campagnes:")
    for row in conn.execute(text(
        "select is_active, (closed_at is not null) as gesloten, count(*) "
        "from campaigns where scan_type = 'culture_assessment' group by 1, 2"
    )):
        print("  ", dict(row._mapping))
    print("leads:")
    for row in conn.execute(text(
        "select route_interest, count(*) from contact_requests "
        "where route_interest ilike '%cultu%' group by 1"
    )):
        print("  ", dict(row._mapping))
    conn.rollback()
```
Heeft `contact_requests` een tweede routekolom (bijvoorbeeld `qualified_route`), voeg dan een derde query toe met dezelfde vorm. Toon nooit andere kolommen dan de tellingen.

- [ ] **Stap 3: Draai het**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe $S/cultuurbeeld_telling.py`
Zet de uitkomst (alleen aantallen) in het verslag.

- [ ] **Stap 4: Beslis**

- Is er een campagne met `is_active = true` en zonder `closed_at`? **STOP met Taak 6 en 7.** Meld aan Lars: "Er loopt nog een Cultuurbeeld-meting op productie (N stuks). De redirect en het verbergen wachten op je besluit." Taak 8 en 9 kunnen wel door.
- Anders: ga door. Gesloten campagnes en oude leads blijven werken via Taak 6 stap 3 (labels) en via de code die blijft staan.
- Lukt de verbinding niet (verlopen wachtwoord, geen `.env`): STOP met Taak 6 en 7 en meld dat. Ga niet door op aanname.

---

### Taak 6: Contactfunnel: Cultuurbeeld verbergen, brede vraag naar Behoud, labels leesbaar

**Bestanden:**
- Wijzigen: `frontend/lib/contact-funnel.ts` (`CONTACT_ROUTE_OPTIONS`, `LEGACY_HIDDEN_CONTACT_ROUTE_OPTIONS`, `CULTURE_ASSESSMENT_KEYWORDS`, `getContactQualificationGuidance`)
- Wijzigen: `frontend/app/api/contact/route.ts` (`CONTACT_ROUTE_LABELS`)
- Wijzigen: `frontend/components/dashboard/lead-ops-table.tsx` (`QUALIFIED_ROUTE_OPTIONS`)
- Test: `frontend/lib/contact-funnel.test.ts`, nieuw `frontend/lib/cultuurbeeld-uit-aanbod.test.ts`

- [ ] **Stap 1: Schrijf de falende tests**

`frontend/lib/cultuurbeeld-uit-aanbod.test.ts`:

```ts
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CONTACT_ROUTE_OPTIONS,
  getContactQualificationGuidance,
  getContactRouteLabel,
  normalizeContactRouteInterest,
} from '@/lib/contact-funnel'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

describe('Cultuurbeeld uit het aanbod (spec 2026-10-11, par. 7)', () => {
  it('een bezoeker kan Cultuurbeeld niet meer kiezen', () => {
    expect(CONTACT_ROUTE_OPTIONS.map((o) => o.value)).not.toContain('culture_assessment')
  })

  it('een oude lead met de Cultuurbeeld-sleutel blijft geldig en leesbaar', () => {
    expect(normalizeContactRouteInterest('culture_assessment')).toBe('culture_assessment')
    expect(getContactRouteLabel('culture_assessment')).toBe('Loep Cultuurbeeld')
  })

  it('de leadmail toont een leesbaar label, geen ruwe sleutel', () => {
    const bron = fs.readFileSync(`${ROOT}app/api/contact/route.ts`, 'utf8')
    expect(bron).toMatch(/culture_assessment:\s*'Loep Cultuurbeeld'/)
  })

  it('het beheer-leadoverzicht toont een leesbaar label', () => {
    const bron = fs.readFileSync(`${ROOT}components/dashboard/lead-ops-table.tsx`, 'utf8')
    expect(bron).toMatch(/value:\s*'culture_assessment',\s*label:\s*'Loep Cultuurbeeld'/)
  })

  it('een brede vraag over betrokkenheid landt op Loep Behoud', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'nog-onzeker',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'We willen een medewerkersonderzoek naar tevredenheid, betrokkenheid en werkbeleving.',
    })
    expect(guidance.recommendedCoreRoute).toBe('retentiescan')
  })

  it('een oude lead die expliciet Cultuurbeeld koos, houdt die route', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'culture_assessment',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'Brede cultuur- en engagementbaseline.',
    })
    expect(guidance.recommendedCoreRoute).toBe('culture_assessment')
  })
})
```
Zoek eerst de echte functiesignatuur op met `grep -n "export function getContactQualificationGuidance" -A8 frontend/lib/contact-funnel.ts`. Wijkt de invoer af, pas dan de test aan, niet de functie.

- [ ] **Stap 2: Zie ze falen**

Run: `npx vitest run lib/cultuurbeeld-uit-aanbod.test.ts`
Verwacht: FAIL op "kan niet meer kiezen", het label, de leadmail, het beheerlabel en de brede vraag. "Houdt die route" slaagt al.

- [ ] **Stap 3: Implementeer**

In `contact-funnel.ts`: verplaats het object met `value: 'culture_assessment'` uit `CONTACT_ROUTE_OPTIONS` naar `LEGACY_HIDDEN_CONTACT_ROUTE_OPTIONS`, met deze inhoud:

```ts
  {
    value: 'culture_assessment',
    label: 'Loep Cultuurbeeld',
    description: 'Verborgen route voor oude Cultuurbeeld-leads; Cultuurbeeld is sinds 11-10-2026 uit het aanbod.',
    firstStepLabel: 'Loep Cultuurbeeld Baseline',
  },
```
Voeg `'medewerkersonderzoek'` toe aan `CULTURE_ASSESSMENT_KEYWORDS`. Voeg geen los `'mto'` toe: `includesAnyKeyword` matcht op substrings. Controleer dat met `grep -n "function includesAnyKeyword" -A4`.

Vervang in `getContactQualificationGuidance` de laatste `else if` van de routekeuze:

```ts
  } else if (normalizedRoute === 'culture_assessment') {
    recommendedCoreRoute = 'culture_assessment'
  } else if (hasCultureAssessmentSignal && !hasExitSignal) {
    // Besluit Lars 11-10-2026: een brede vraag (cultuur, betrokkenheid,
    // tevredenheid, medewerkersonderzoek) landt op Loep Behoud, het alternatief
    // voor het grote jaarlijkse MTO. Alleen oude leads die zelf Cultuurbeeld
    // kozen, houden die route.
    recommendedCoreRoute = 'retentiescan'
  }
```
In `app/api/contact/route.ts`, `CONTACT_ROUTE_LABELS`: voeg `culture_assessment: 'Loep Cultuurbeeld',` toe. In `lead-ops-table.tsx`, `QUALIFIED_ROUTE_OPTIONS`: label `'Loep Culture Assessment'` wordt `'Loep Cultuurbeeld'`. De optie blijft, want de operator kan een oude lead nog bevestigen.

- [ ] **Stap 4: Bestaande tests in lockstep**

In `frontend/lib/contact-funnel.test.ts` wordt `expect(getContactRouteLabel('culture_assessment')).toBe('Loep Culture Assessment')` nu `'Loep Cultuurbeeld'`. Draai:

`npx vitest run lib/contact-funnel.test.ts lib/contact-qualification.test.ts lib/contact-commerce.test.ts lib/cultuurbeeld-uit-aanbod.test.ts`
Verwacht: de nieuwe test 6 passed, de rest op de baseline-faalset. Een test die `CONTACT_ROUTE_OPTIONS` telt of `culture_assessment` als formulieroptie verwacht, werk je bij en noem je in het verslag. `guidance.detail` voor `retention_primary` blijft ongewijzigd; die tekst is alleen voor de operator.

- [ ] **Stap 5: Commit**

```bash
git add frontend/lib/contact-funnel.ts frontend/app/api/contact/route.ts frontend/components/dashboard/lead-ops-table.tsx frontend/lib/*.test.ts
git commit -m "feat(contact): Cultuurbeeld niet meer kiesbaar, brede vraag naar Loep Behoud, oude leads leesbaar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Taak 7: Redirect /producten/cultuurbeeld en zichtbaarheid

**Bestanden:**
- Wijzigen: `frontend/next.config.ts` (zoek `Loep Cultuurbeeld blijft bewust`)
- Maken: `frontend/lib/cultuurbeeld-redirect.test.ts`

- [ ] **Stap 1: Schrijf de falende test**

```ts
import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config'

describe('Cultuurbeeld-redirect (spec 2026-10-11, par. 7.2)', () => {
  it('/producten/cultuurbeeld gaat met een 308 naar Loep Behoud', async () => {
    const redirects = await nextConfig.redirects!()
    expect(redirects).toContainEqual({
      source: '/producten/cultuurbeeld',
      destination: '/producten#loep-behoud',
      permanent: true,
    })
  })
})
```
Faalt de import van `next.config.ts` in vitest (bijvoorbeeld door een wrapper of een import alleen voor de buildomgeving)? Lees dan de bron en test met
`expect(bron).toMatch(/source:\s*'\/producten\/cultuurbeeld',\s*destination:\s*'\/producten#loep-behoud',\s*permanent:\s*true/)`.
Noem in het verslag welke vorm je gebruikt.

- [ ] **Stap 2: Zie hem falen**

Run: `npx vitest run lib/cultuurbeeld-redirect.test.ts` → FAIL.

- [ ] **Stap 3: Implementeer**

Vervang in `next.config.ts` de commentaarregel `// Loep Cultuurbeeld blijft bewust een eigen (stille) pagina en redirect NIET.` door:

```ts
      // Loep Cultuurbeeld is sinds 11-10-2026 uit het aanbod (spec behoud-als-mto-alternatief).
      // De code blijft staan; bestaande campagnes en rapporten werken door.
      { source: '/producten/cultuurbeeld', destination: '/producten#loep-behoud', permanent: true },
```
Controleer dat het anker `loep-behoud` nog bestaat: `grep -n "id: 'loep-behoud'" frontend/components/marketing/producten-content.tsx`.

- [ ] **Stap 4: Overige zichtbaarheid**

```bash
grep -rn "cultuurbeeld\|Cultuurbeeld\|culture_assessment" frontend/app/sitemap.ts frontend/public/llms.txt frontend/app/layout.tsx frontend/app/page.tsx frontend/lib/site-meta.ts frontend/components/marketing frontend/app/pilot frontend/app/vertrouwen frontend/app/kennismaking
```
Verwacht: alleen `solutions-dropdown.tsx` (filtert Cultuurbeeld er al uit) en eventueel `producten/[slug]` (dormant achter de redirect). Een link naar `/producten/cultuurbeeld` op een gerenderde pagina vervang je door `/producten#loep-behoud`. De pagina-, metadata- en OG-code van Cultuurbeeld in `app/producten/[slug]/` blijft staan (spec 7.3). `lib/seo-conversion.test.ts` test die metadata direct en blijft dus slagen.

- [ ] **Stap 5: Tests en commit**

Run: `npx vitest run lib/cultuurbeeld-redirect.test.ts lib/seo-conversion.test.ts` (de redirecttest is groen, seo-conversion staat op de baseline-faalset).

```bash
git add frontend/next.config.ts frontend/lib/cultuurbeeld-redirect.test.ts
git commit -m "feat(site): /producten/cultuurbeeld 308 naar Loep Behoud, code blijft

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Taak 8: OR-notitie, intakevraag en Loep_Docs in lijn (buiten de repo)

**Bestanden** (map `C:\Users\larsh\Desktop\Business\Loep_Docs\`, geen git):
- Maken: `or-notitie.html`
- Wijzigen: `intake-formulier.html`, `one-pager.html`, `sales-pitch.html`, `faq.html`, `methodische-verantwoording.html`, `harde-getallen.html`, `offerte-template.html`

- [ ] **Stap 1: Verzamel de getallen uit de code (niet uit de spec)**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight
grep -n "MIN_SEGMENT_N\s*=\|MIN_DISTRIBUTION_N\s*=\|MIN_RESPONSES\|REPORT_MIN" backend/scoring_config.py backend/report_html.py | head
grep -n "twee jaar\|24 maanden\|retention_months" frontend/app/privacy/page.tsx backend/data_retention.py | head
```
Noteer: de minimale respons voor een rapport, het minimum per afdeling, de bewaartermijn, en de invultijd uit Taak 0 stap 5.

- [ ] **Stap 2: Maak `or-notitie.html`**

Kopieer `<head>` en `<style>` uit `one-pager.html` (Loep-huisstijl). Inhoud, je/jij, geen em-dashes. Vul de getallen uit stap 1 letterlijk in. Laat geen `[...]` staan.

```html
<h1>Loep Behoud: informatie voor de ondernemingsraad</h1>
<p class="lead">Deze notitie beschrijft wat Loep Behoud vraagt, hoe de antwoorden worden beschermd en wat er met de uitkomst gebeurt. Bedoeld om met je OR te bespreken vóór de meting start.</p>

<h2>Wat we vragen</h2>
<ul>
  <li>Hoe medewerkers hun werk beleven: ruimte om zelf keuzes te maken, je werk goed kunnen doen, en de band met collega's.</li>
  <li>Zes werkonderwerpen: leiderschap, cultuur en veiligheid, groeiperspectief, beloning, werkdruk en rolhelderheid.</li>
  <li>Bevlogenheid, of mensen willen blijven, of ze overwegen te vertrekken, en of ze de organisatie zouden aanraden.</li>
  <li>Bij een lage score op een onderwerp: één meerkeuzevraag naar de reden. Iedereen krijgt één meerkeuzevraag over wat er zou moeten gebeuren.</li>
  <li>Eén open vraag.</li>
</ul>
<p>Invullen duurt <!-- waarde uit Taak 0 stap 5 -->.</p>

<h2>Werkdruk en instemming</h2>
<p>De vragenlijst meet werkdruk. Een onderzoek naar psychosociale arbeidsbelasting valt volgens de gangbare lezing onder artikel 27 lid 1 sub d van de Wet op de ondernemingsraden. Bespreek daarom met je OR of instemming nodig is. Deze notitie is geen juridisch advies.</p>

<h2>Anonimiteit</h2>
<ul>
  <li>Loep rapporteert alleen per groep, nooit per persoon.</li>
  <li>Een rapport komt er pas vanaf <!-- minimum respons --> ingevulde vragenlijsten. Een afdeling verschijnt pas vanaf <!-- minimum per afdeling --> antwoorden.</li>
  <li>Herkende namen in open antwoorden haalt Loep automatisch weg.</li>
  <li>Je organisatie verstuurt de uitnodigingen zelf. Loep ontvangt geen namen of e-mailadressen van deelnemers.</li>
</ul>

<h2>Bewaren</h2>
<p>De antwoorden worden uiterlijk <!-- bewaartermijn --> na het sluiten van de meting verwijderd.</p>

<h2>Wat er met de uitkomst gebeurt</h2>
<p>Het rapport laat zien waar het wringt, wat medewerkers daar zelf over zeggen, en waar het MT begint. Het MT legt vast wat het besluit, wie het oppakt en wanneer. Deel de uitkomst ook met je medewerkers: meten zonder terugkoppeling werkt averechts.</p>
```
Vervang elk `<!-- ... -->` door de waarde uit stap 1 en verwijder het commentaar. Controleer de factornamen tegen `FACTOR_LABELS_NL` en `_fl(...)` voor retention in `backend/report_html.py`. De namen in de notitie moeten de namen zijn die de klant in het rapport ziet.

- [ ] **Stap 3: Intakevraag**

Voeg in `intake-formulier.html`, bij de praktische vragen, toe: "Is de OR geïnformeerd, of is instemming geregeld? (OR-notitie meesturen)". In `offerte-template.html`, bij "Aan de slag" of de voorbereiding: "Bespreek de meting met je OR; de OR-notitie helpt daarbij."

- [ ] **Stap 4: Loep_Docs in lijn**

```bash
cd /c/Users/larsh/Desktop/Business/Loep_Docs && grep -n "Cultuurbeeld\|Culture\|MTO\|per medewerker\|p\.p\.\|per persoon\|—\|–" one-pager.html sales-pitch.html faq.html methodische-verantwoording.html harde-getallen.html offerte-template.html
```
Per treffer: Cultuurbeeld eruit; een bedrag per medewerker eruit (zinnen zonder bedrag mogen); "geen MTO"-afwijzingen herschrijven naar de alternatief-positionering; bij Loep Behoud in `one-pager.html` en `sales-pitch.html` de regel "Het korte medewerkersonderzoek. Een alternatief voor het grote jaarlijkse MTO." toevoegen. Neem in `faq.html` de FAQ uit Taak 2 stap 1 over. Raak de prijsstaffel niet aan.

- [ ] **Stap 5: PDF-exports**

Bestaan `Loep onepager.pdf` en `Loep methodische verantwoording.pdf`, exporteer ze dan opnieuw:

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="C:\\Users\\larsh\\Desktop\\Business\\Loep_Docs\\Loep onepager.pdf" "file:///C:/Users/larsh/Desktop/Business/Loep_Docs/one-pager.html"
```
Doe hetzelfde voor `methodische-verantwoording.html`. Exporteer ook `or-notitie.html` naar `Loep OR-notitie.pdf`. Ontbreekt Edge of Chrome, zet de export dan in het verslag als actie voor Lars.

- [ ] **Stap 6: Geen commit** (buiten de repo). Noem de gewijzigde bestanden in het verslag.

---

### Taak 9: Eindverificatie, browsercheck, verslag

**Bestanden:**
- Maken: `docs/superpowers/plans/2026-10-11-behoud-als-mto-alternatief-uitvoering.md`

- [ ] **Stap 1: Gates met faalset-diff**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/behoud-mto/frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"            # moet gelijk zijn aan tsc-voor.txt
npx vitest run --reporter=json --outputFile=$S/vitest-na.json > /dev/null 2>&1
python $S/vitest_faalset.py $S/vitest-na.json > $S/vitest-na.txt
diff $S/vitest-voor.txt $S/vitest-na.txt              # alleen verdwenen regels toegestaan
cd .. && /c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR)" | sed 's/ - .*//' | sort > $S/pytest-na.txt
diff $S/pytest-voor.txt $S/pytest-na.txt               # leeg
cd frontend && RESEND_API_KEY=dummy npm run build
```
Verwacht: tsc gelijk, vitest geen nieuwe falende test, pytest identieke faalset, build groen. Een nieuwe falende test is een regressie: oplossen, niet wegverklaren. Noemt de diff een test die eerder faalde en nu slaagt, zet dat in het verslag.

- [ ] **Stap 2: Browsercheck (publiek)**

Start de dev-server van de worktree (een `launch.json`-entry op poort 3100 met `cwd` naar de worktree-frontend). Controleer:
- `/`: de scankaart van Loep Behoud toont "Het korte medewerkersonderzoek… Een alternatief voor het grote jaarlijkse MTO." De h1 is ongewijzigd.
- `/producten#loep-behoud`: eyebrow, lead, de invultijd naast "kort", de keuzehulp "Wanneer past een groot MTO beter?" en de FAQ "Is Loep Behoud een MTO?". Op desktop en op 375 px, en `document.documentElement.scrollWidth === 375`.
- `/producten/cultuurbeeld` geeft 308 naar `/producten#loep-behoud` (`curl -sI http://localhost:3100/producten/cultuurbeeld`).
- `/kennismaking`: Cultuurbeeld staat niet meer in de keuzelijst.
- Console zonder fouten.

- [ ] **Stap 3: Browsercheck (dashboard)**

Volg `docs/testklant.md` (inloggen via `scripts/seed_test_tenant.py --login-link`). Open de campagnepagina van testklant A. De methodiekkaart zegt "geen breed MTO met benchmark" en "Loep maakt zichtbaar", zonder "Verisight". Dit draait tegen de lokale frontend met de productie-Supabase van de testklant. Raak geen data aan.

- [ ] **Stap 4: Verslag**

Schrijf `docs/superpowers/plans/2026-10-11-behoud-als-mto-alternatief-uitvoering.md` met:
- de baselines en het resultaat van de diffs;
- de herinventarisatie (Taak 0 stap 4) en welke plekken bewust bleven staan;
- de invultijdbron;
- de productietelling (alleen aantallen) en het besluit;
- de tests die in lockstep zijn bijgewerkt, met reden;
- de Loep_Docs-wijzigingen en de PDF-exports;
- een sectie "Wat Lars moet beslissen" voor alles wat is gestopt of afwijkt;
- **"Na de merge"**: Railway-deploy van "Loep main" (backendconsistentie, niet klantzichtbaar), Vercel deployt de frontend, en de go-live-check draait op de backendversie met deze merge-commit (`GET /api/health`, live git-sha).

- [ ] **Stap 5: Commit van het verslag**

```bash
git add docs/superpowers/plans/2026-10-11-behoud-als-mto-alternatief-uitvoering.md
git commit -m "docs: uitvoeringsverslag Loep Behoud als MTO-alternatief

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Stap 6: Niet mergen, niet pushen.** Meld aan de hoofdsessie dat de branch klaarstaat voor controle.
