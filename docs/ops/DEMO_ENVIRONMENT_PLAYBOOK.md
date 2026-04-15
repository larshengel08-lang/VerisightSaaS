# Demo Environment Playbook

Interne handleiding voor het kiezen, resetten en gebruiken van Verisight demo- en sampleomgevingen.
Laatste update: 2026-04-15

## Basisregel

- Gebruik buyer-facing sample-output voor publieke proof.
- Gebruik internal sales demo voor live dashboard-uitleg.
- Gebruik QA/live-fixtures alleen voor functionele checks.
- Gebruik validation-sandbox alleen voor methodische dummy-runs.

## Snelle keuze

### 1. Buyer vraagt om een eerste indruk of wil voorbeeldoutput zien

- Gebruik de website-preview of de actieve voorbeeldrapporten.
- Start met ExitScan.
- Laat RetentieScan alleen zien als de buyer-vraag expliciet over actieve-populatie behoud gaat.

### 2. Buyer wil een live dashboarddemo zien

- Gebruik `sales_demo_exit` als standaard eerste live-demo.
- Gebruik `sales_demo_retention` alleen na of naast ExitScan wanneer behoud de expliciete managementvraag is.

### 3. Je wilt flows, tokens, reminders of archive testen

- Gebruik `qa_exit_live_test`.
- Gebruik `qa_retention_demo` voor retention-fixtures, trend en metadata checks.

### 4. Je wilt RetentieScan validatie of dummy follow-up datasets draaien

- Gebruik `validation_retention_pilot`.

## Standaard commands

```bash
python manage_demo_environment.py list
python manage_demo_environment.py run sales_demo_exit
python manage_demo_environment.py run sales_demo_retention
python manage_demo_environment.py run qa_exit_live_test
python manage_demo_environment.py run qa_retention_demo
python manage_demo_environment.py run validation_retention_pilot
```

## Aanbevolen demo-volgorde

### Eerste verkoopgesprek

1. Laat de buyer-facing ExitScan sample of preview zien.
2. Leg de managementstructuur en claimsgrens uit.
3. Schakel pas naar `sales_demo_exit` als live campaign states of dashboarduitleg helpt.
4. Laat RetentieScan pas zien als de buyer ook expliciet een behoudsvraag heeft.

### Onboarding of vroege klantgesprekken

1. Start met de route die verkocht is.
2. Gebruik de internal sales demo om campaignstatus, thresholds en managementread toe te lichten.
3. Gebruik buyer-facing sample-output als fallback wanneer live-demo onhandig is.

## Do not use

- Gebruik `qa_exit_live_test` niet als standaard salesdemo.
- Gebruik `validation_retention_pilot` niet voor buyer-facing gesprekken.
- Gebruik legacy `*_35_fictief.pdf` niet als actieve showcase.
- Gebruik de internal sales demo niet als vervanging van de publieke voorbeeldrapporten.

## Wat je expliciet zegt

- ExitScan is meestal de eerste route.
- RetentieScan is complementair en verification-first.
- Demo's gebruiken fictieve data.
- Detailweergave start vanaf 5 responses.
- Steviger patroonbeeld start vanaf 10 responses.
- Demo-output helpt prioriteren en uitleggen, maar claimt geen diagnose, predictor of causale zekerheid.

## Fallbacks

- Als live demo niet stabiel of passend is, ga terug naar:
  - productspecifieke preview
  - actieve voorbeeld-pdf
- Als retention-trend te vroeg of te complex voelt, houd RetentieScan bij de verification-first managementlaag en niet bij een te zwaar trendverhaal.
