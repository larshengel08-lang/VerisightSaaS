# Assisted Self-Service Customer Operation Validation

## Korte samenvatting

De huidige `main`-basis is bruikbaar genoeg om assisted self-service gecontroleerd uit te voeren, vooral op importguardrails, launchgating, response-thresholds en expliciete ownership-afbakening. De grootste resterende frictie zit nu minder in ontbrekende productfundamenten en meer in operationele discipline: intakekwaliteit, klant-owner duidelijkheid, activatie-opvolging, bevestiging van eerste managementgebruik en een validatie/demo-basis die niet overal even robuust herhaalbaar is.

Het beeld is dus niet "nog veel product bouwen", maar "de assisted operating cadence harder maken". Alleen als dezelfde frictie later herhaaldelijk in echte klantobservaties terugkomt, is versimpelend productwerk logisch.

## Welke klant- en operatieflows zijn beoordeeld

- Import van respondenten via bestaande backendflow en huidige klantinput-specificatie.
- Launchdiscipline via huidige import-QA, launch confirmation, communicatiepreview en reminderinstellingen.
- Reminderlogica en reminderrechten binnen de huidige guided self-service flow.
- Dashboardgebruik op home- en campaignniveau, inclusief threshold-based vrijgave van output.
- First-next-step begrip via huidige campaign- en dashboardguidance.
- Ownership tussen klant en Verisight via klantrollen, kritieke acties, activation flow en operating-discipline lagen.
- Semireele demo-/fixturebasis via de bestaande demo scenario orchestrator.

## Wat al sterk genoeg werkt in assisted self-service

- Import is productmatig al behoorlijk scherp begrensd. De backendflow accepteert gecontroleerde imports, ondersteunt dry-run validatie en blokkeert duplicaten zonder persist.
- Launch wordt niet lichtzinnig vrijgegeven. Startdatum, communicatiepreview, reminderinstellingen en expliciete launchbevestiging vormen samen een duidelijke release-gate.
- De thresholdlogica is helder en consistent: onder 5 responses geen dashboardread, tussen 5 en 9 alleen compacte/indicatieve read, vanaf 10 pas eerste patroonduiding en first-next-step ruimte.
- Ownership is niet impliciet gelaten. `owner`, `member` en `viewer` zijn functioneel onderscheiden en uitvoerkritieke acties blijven bewust bij de klant owner.
- Dashboardcopy en operating layers proberen al netjes te scheiden tussen "wat nu leesbaar is", "wat nog indicatief is" en "wat de eerste vervolgstap wordt".
- De assisted waarheid blijft productmatig intact: Verisight beheert setup, importkwaliteit, invite/reminder-discipline en bounded release, terwijl de klant vooral leest, duidt en bevestigt.

## Waar nog echte frictie zit

- Import werkt technisch, maar blijft sterk afhankelijk van goede implementation intake. Zonder vooraf scherp route-, metadata- en managementdoelbegrip wordt de flow snel administratief in plaats van vanzelfsprekend.
- Launchdiscipline is inhoudelijk goed, maar telt veel expliciete bevestigingen. Voor operators is dat verdedigbaar; voor klanten kan het voelen als meerdere kleine gates in plaats van een begrijpelijke "klaar om live te gaan"-stap.
- Remindercontrole is bewust begrensd en preset-based. Dat beschermt kwaliteit, maar maakt de ervaring minder intuitief voor klanten die "self-service" horen en vervolgens weinig timingvrijheid blijken te hebben.
- Dashboardgebruik is guardrail-sterk, maar de betekenis van fasen als "deels zichtbaar", "dashboard actief", "first value" en "eerste vervolgstap" vraagt nog uitleg. Dit lijkt nu eerder begeleid leeswerk dan vanzelfsprekende zelfbediening.
- Ownership tussen klant en Verisight is expliciet, maar nog kwetsbaar in de praktijk: klant owner, activatie, eerste managementgebruik en follow-up vragen allemaal actieve bevestiging. Zonder strakke supportcadence blijft dat procesmatig broos.

## Indeling van frictie

- productissue: De flow gebruikt meerdere begrippen en lagen om van setup naar eerste managementactie te gaan. Dat is logisch vanuit governance, maar kan voor klanten cognitief zwaar blijven voordat echte managementwaarde zichtbaar wordt. Launch- en dashboardstaten zijn goed afgeschermd, maar nog niet helemaal samengevouwen tot een eenduidige klantread over "wat kan ik nu veilig doen".
- onboardingissue: Goede intake blijft cruciaal: gekozen route, timing, doelgroep, metadata en eerste managementdoel moeten vooraf scherp zijn, anders landt frictie later onterecht in import of dashboard. De rol van de klant owner moet vooraf harder worden gezet; anders voelt owner-only gedrag later als beperking in plaats van bewuste governance.
- supportissue: Activatiemail, eerste dashboardtoegang, eerste rapportread en eerste managementgebruik vragen nog duidelijke menselijke opvolging.
- verwachtingsissue: "Assisted self-service" kan te snel als "vrij self-serve" worden opgevat, terwijl de huidige waarheid duidelijk assisted blijft. Klanten kunnen meer vrijheid verwachten rond reminders, launch en uitvoerkritieke acties dan de huidige productgrenzen bewust toestaan.

## Wat dit betekent voor volgende fases

De volgende fase hoeft geen brede productherbouw te zijn. Eerst moet customer-ops-hardening scherper maken of de bestaande assisted operating cadence reproduceerbaar genoeg is:

- intake discipline
- klant-owner explicitering
- activatie-opvolging
- first-management-use bevestiging
- follow-up closure
- betrouwbare demo- en validatiefixtures

Later productwerk is pas logisch als echte observaties blijven laten zien dat klanten ondanks goede onboarding en support structureel verdwalen in launchstatus, first-next-step of ownership.

## Verificatie en observatiegrond

Echt of semireeel doorlopen in deze draad:

- `python -m pytest tests/test_api_flows.py -k "respondent_import or implementation_smoke_flow"`
  - bevestigt create -> import -> optioneel invites -> submit -> stats -> report op de huidige `main`-basis
- `python manage_demo_environment.py list`
  - bevestigt de huidige canonieke demo- en fixturelagen
- `python manage_demo_environment.py run sales_demo_exit`
  - bevestigt serieel dat de gedeelde ExitScan sales demo opnieuw kan worden opgebouwd
- `python manage_demo_environment.py run sales_demo_retention`
  - bevestigt serieel dat ook de retention demo op dezelfde lokale sqlite-flow kan worden opgebouwd
- lokale sqlite-inspectie van `verisight-sales-demo`
  - bevestigde zowel ExitScan- als RetentieScan-demo campaigns met actieve en gesloten staten en verschillende invited/completed/pending verhoudingen
- eerdere parallelle validatieruns tegen gedeelde demo-orgs
  - veroorzaakten een misleidend beeld over slug-collision en ontbrekende observeerbaarheid; dat bleek een validatiemethode-issue, geen bewezen productissue in de seriele demo seedflow
- `npx vitest run "app/(dashboard)/campaigns/[id]/actions.test.ts" "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/campaigns/[id]/page.route-shell.test.ts" "app/(dashboard)/dashboard/page.test.ts" "lib/ops-delivery.test.ts" "lib/client-onboarding.test.ts" "lib/response-activation.test.ts"`
  - bevestigt de huidige contracten voor dashboardstaten, ownership, reminderrechten, delivery governance en onboardingthresholds

Afgeleid uit bestaande tests/acceptance en broncode, niet live waargenomen in een ingelogde klantdashboardsessie:

- daadwerkelijke visuele frictie tijdens klantnavigatie in een echte authenticated campaign
- hoe soepel first-next-step door een echte klant zonder begeleiding wordt begrepen
- hoe vaak owner/member/viewer-onderscheid in echte klantteams tot misverstanden leidt
- of activation follow-up en first-management-use in echte klantoperatie consistent genoeg worden vastgelegd

Geen valse zekerheid:

- Er is in deze draad geen echte klantobservatie of live authenticated dashboardsessie gedaan.
- Het oordeel over dashboardgebruik, ownershipfrictie en first-next-step begrip is daarom deels contractmatig en semireeel, niet volledig gedragsevident uit live klantgebruik.

## Git-status

- branch: `codex/customer-operation-validation`
- commit: nog niet vastgelegd in commit ten tijde van deze validatie
- pushstatus: nog niet gepusht
- PR-status: geen PR geopend

## Oordeel

- bruikbaar validatiebeeld

## Aanbevolen volgende stap

Voer geen brede nieuwe buildwave uit. Gebruik dit beeld eerst voor een smalle customer-ops-hardening pass buiten dashboardscope:

- maak de intake- en ownerverwachting explicieter in onboarding en support
- leg activation en first-management-use strakker operationeel vast
- maak de demo-/fixturelaag betrouwbaar genoeg voor herhaalbare operatorvalidatie

Pas als echte klantobservaties daarna laten zien dat mensen ondanks goede begeleiding nog steeds op dezelfde punten vastlopen, is een gerichte productsimplificatie van launch/ownership/first-next-step logisch.
