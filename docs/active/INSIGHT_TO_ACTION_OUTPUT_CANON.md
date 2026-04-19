# INSIGHT_TO_ACTION_OUTPUT_CANON

Last updated: 2026-04-19
Status: active
Source of truth: this canon defines the stable output shape for the Insight-to-Action Generator across report and dashboard.

## Titel

Insight-to-Action Generator - Output Canon

## Korte samenvatting

Deze canon beschrijft hoe de generatoroutput eruit moet zien, hoe compact elk onderdeel blijft en welke taalgrenzen gelden. De generator is alleen bruikbaar als de vorm stabiel, management-gericht en methodisch proportioneel blijft.

## Wat is geaudit

- `docs/active/INSIGHT_TO_ACTION_GENERATOR_DESIGN.md`
- `docs/active/INSIGHT_TO_ACTION_BOUNDARY_NOTES.md`
- `docs/active/REPORT_STRUCTURE_CANON.md`
- `docs/active/PRODUCT_LANGUAGE_CANON.md`
- `backend/products/exit/report_content.py`
- `backend/products/retention/report_content.py`
- `frontend/lib/products/exit/dashboard.ts`
- `frontend/lib/products/retention/dashboard.ts`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/components/dashboard/action-playbook-list.tsx`

## Belangrijkste bevindingen

- De gewenste output is klein genoeg om in bestaande report- en dashboardslots te passen.
- De grootste kwaliteitshefboom zit in selectie en formulering, niet in meer volume.
- Output moet in report en dashboard dezelfde blokken tonen, ook als de onderliggende tekst niet volledig identiek is.

## Belangrijkste risico's

- Te veel tekst maakt de generator een tweede rapport in plaats van een bridge-to-action.
- Te weinig expliciete labels maakt het lastig om management direct te laten zien wat prioriteit, verificatie, actie en follow-up is.
- Te harde werkwoorden kunnen de bounded status van de output ondergraven.

## Beslissingen / canonvoorstellen

### 1. Vaste outputblokken

De generator levert exact deze vier blokken:

1. `3 managementprioriteiten`
2. `5 verificatievragen`
3. `3 mogelijke eerste acties`
4. `30-60-90 follow-up`

### 2. Schema

```text
insight_to_action:
  management_priorities: [
    { title, body, source_anchor? },
    { title, body, source_anchor? },
    { title, body, source_anchor? }
  ]
  verification_questions: [string, string, string, string, string]
  possible_first_actions: [
    { title, body, source_anchor? },
    { title, body, source_anchor? },
    { title, body, source_anchor? }
  ]
  follow_up_30_60_90: [
    { window: "30 dagen", title, body },
    { window: "60 dagen", title, body },
    { window: "90 dagen", title, body }
  ]
  guardrail_note?: string
```

### 3. Priority rules

- Prioriteiten zijn managementprioriteiten, geen root causes.
- Elke prioriteit heeft:
  - een korte titel
  - een bounded body van 1-2 zinnen
- Prioriteitstitels gebruiken neutrale framing zoals:
  - `Prioriteit 1`
  - `Eerst afbakenen`
  - `Beleg eigenaar en review`
- Vermijd titels die causaliteit of impact suggereren.

### 4. Verification question rules

- Vragen moeten echt als vraag eindigen.
- Vragen moeten verificatie of afbakening helpen, niet oplossing suggereren.
- Vragen blijven op groeps- of managementniveau.
- Maximaal 140-160 tekens per vraag in dashboardweergave; report mag iets ruimer zijn maar moet compact blijven.

### 5. Possible first action rules

- Label expliciet als `mogelijke eerste acties`, nooit als `aanbevolen interventies`.
- Acties moeten klein, toetsbaar en bounded zijn.
- Acties beginnen bij voorkeur met werkwoorden als:
  - `Plan`
  - `Kies`
  - `Toets`
  - `Maak expliciet`
  - `Beleg`
- Vermijd werkwoorden of formuleringen als:
  - `Los op`
  - `Voorkom`
  - `Garandeer`
  - `Verbeter zeker`
  - `Transformeer`

### 6. 30-60-90 rules

- `30 dagen` = eerste toets, keuze of explicitering
- `60 dagen` = review van uitvoering en eerste signalen van beweging
- `90 dagen` = herweging: doorgaan, verbreden, vervolgmeting of stoppen
- Deze structuur is:
  - een opvolgritme
  - geen effectgarantie
  - geen projectplan

### 7. Guardrail note

- Een optionele guardrail note is toegestaan wanneer het bronbeeld indicatief of expliciet verification-first moet blijven.
- De guardrail note moet kort zijn en nooit het hoofdblok domineren.

### 8. Render rules

- Report:
  - render als compacte subsectie binnen de bestaande route/actie-laag
  - geen extra pagina
  - geen wijziging van ExitScan page-order
- Dashboard:
  - render in de bestaande route-sectie
  - plaats na de timeline / follow-through context en voor de "na de eerste managementsessie" verdieping

## Concrete wijzigingen

- Nieuwe outputcanon toegevoegd: `docs/active/INSIGHT_TO_ACTION_OUTPUT_CANON.md`
- Vaste shape en copy rules vastgelegd voor report en dashboard
- Werkwoord- en claimgrenzen expliciet gemaakt voor generatoroutput

## Validatie

- De outputvorm past binnen de bestaande route-sectie in dashboard en report.
- De vorm versterkt managementbruikbaarheid zonder de rapportarchitectuur te wijzigen.
- De copy rules houden de feature expliciet onder de huidige claims- en methodiekgrens.

## Assumptions / defaults

- `source_anchor` blijft optioneel en vooral intern bruikbaar voor testbaarheid of debugbaarheid.
- Report en dashboard mogen verschillende lengtevarianten van hetzelfde blok tonen zolang shape en guardrails gelijk blijven.
- `guardrail_note` hoeft niet altijd zichtbaar te zijn, maar moet technisch ondersteund worden.

## Next gate

Implementation plan vastleggen met trigger moment, input mapping, storage/render strategy, types, helper modules en testdekking voor MVP.
