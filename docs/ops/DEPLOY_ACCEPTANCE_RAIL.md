# Verisight Deploy Acceptance Rail

Deze rail test de bestaande deploy, niet alleen local code.

## Scripts

In [frontend/package.json](/C:/Users/larsh/Desktop/Business/Verisight/frontend/package.json):

- `npm run acceptance:bootstrap`
- `npm run acceptance:recurring`
- `npm run acceptance:cleanup`

## Bootstrap lane

Bootstrap draait niet op elke recurring run.

Gebruik bootstrap alleen:

- de eerste keer
- na auth-, invite- of org-membership-wijzigingen
- na deploy- of configwijzigingen die activatie raken

Bootstrap doet:

- acceptance-admin user klaarzetten
- acceptance-klant user klaarzetten
- acceptance-org aanmaken of hergebruiken
- memberships koppelen
- admin- en klantlogin browsermatig valideren

## Recurring lane

Recurring draait per run een verse campaign in de vaste acceptance-org.

Artifacts:

- `run-manifest.json`
- `preflight.json`
- `import-preview.json`
- `import-result.json`
- `stats.json`
- `snapshots.json`
- `lane-verdict.json`
- `audit.md`
- screenshots
- provider evidence JSON
- optioneel sink evidence JSON
- report PDF + SHA-256

## Evidence semantics

- `provider-log = bewijs van verzending`
- `sink-capture = bewijs van technische ontvangst + exacte mailbody`
- `echte mailboxdeliverability = buiten scope`

Zonder sink-capture kan de eindstatus niet hoger uitkomen dan `production ready met beperkingen`.

## Cleanup policy

- geslaagde recurring runs worden direct na artifact-capture opgeschoond
- mislukte recurring runs blijven maximaal 7 dagen bestaan
- na 7 dagen moeten ze worden opgeschoond, tenzij expliciet vastgelegd als onderzoekshold

## Vereiste env

Zie [frontend/.env.local.example](/C:/Users/larsh/Desktop/Business/Verisight/frontend/.env.local.example) voor:

- deploy URLs
- Supabase service-role
- backend admin token
- Resend API key
- acceptance accounts
- optionele sink-config
