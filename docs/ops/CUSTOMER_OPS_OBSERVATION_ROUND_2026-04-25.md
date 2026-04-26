# Customer Ops Observation Round op current main

## Korte samenvatting

Deze ronde is bewust observatie op de huidige `main`-realiteit gebleven. Er is geen nieuwe buildscope geopend. Het observatiebeeld is nu sterker dan in de vorige ronde, omdat current `main` live is bekeken met bestaande testaccounts op een echte Supabase-sessie en niet alleen via fixtures, tests en codelezing.

De hoofdconclusie blijft: `main` haalt al merkbaar frictie weg in dashboard/home begrip, read-first landing en bounded campaigncontext, maar nog niet genoeg rond drie terugkerende punten:

- wie in de praktijk de echte klant owner is
- wanneer activatie echt als vrijgave telt
- wanneer first-management-use echt bevestigd is

De terugkerende frictie voelt op current `main` vooral als verwachtings-, onboarding- en supportfrictie, met een kleinere maar echte productfrictie op de `no-access` campaignroute.

## Welke doorlopen zijn geobserveerd

- Doorloop 1: live current-main `admin/owner-beheer` sessie met `retentiescan-live-admin@verisight.test` op `http://localhost:3000/dashboard` en `http://localhost:3000/campaigns/f0b83566-cfc6-4c07-bf6d-222ed5557296`.
  - Type: live geobserveerd op current `main`, maar geen echte klant.
  - Wat ging vanzelf goed: dashboard landt duidelijk in beheer/overviewmodus; campaigndetail toont meteen productcontext, responsstatus, `EERSTE EIGENAAR` en `PDF-rapport`.
  - Waar ontstond twijfel: de uitvoer- en vervolgstaplaag zat niet direct open op de campaign, maar achter de ingeklapte disclosure `Campagnestatus en uitvoercontrole`.
  - Waar was hulp nodig: om `Herinnering`, `Archiveer campaign` en `Volgende stap` echt te zien moest die disclosure actief worden opengeklapt.
  - Eerste duiding: voor beheergebruik is current `main` bruikbaar, maar de eerstvolgende uitvoeractie is nog niet vanzelfsprekend zichtbaar op het eerste scherm.

- Doorloop 2: live current-main read-first klantdoorloop met `retentiescan-live-member@verisight.test` en `retentiescan-live-viewer@verisight.test` op dezelfde dashboard- en campaignroutes.
  - Type: live geobserveerd op current `main`, maar geen echte klant.
  - Wat ging vanzelf goed: dashboard home is compact en duidelijk; `Eerste managementoverview` en `Open belangrijkste campaign` landen direct; campaigndetail toont productuitleg, responsstatus, `EERSTE EIGENAAR` en `PDF-rapport`.
  - Waar ontstond twijfel: de pagina maakt niet expliciet genoeg wat de ingelogde gebruiker zelf is in relatie tot de ownerrol. De gebruiker ziet wel `EERSTE EIGENAAR HR development-owner`, maar niet scherp genoeg of hij zelf owner, member of viewer is en welke vervolgstap dan van hem wordt verwacht.
  - Waar was hulp nodig: om te onderscheiden of dit product- of permissiegedrag was, was aanvullende lezing van `frontend/lib/customer-permissions.ts` nodig.
  - Eerste duiding: current `main` helpt al sterk op read-first begrip, maar laat nog verwachting open tussen "ik kan lezen" en "ik ben verantwoordelijk voor de volgende klantactie".

- Doorloop 3: live current-main `no-access` sessie met `retentiescan-live-noaccess@verisight.test` op dezelfde dashboard- en campaignroutes.
  - Type: live geobserveerd op current `main`, maar geen echte klant.
  - Wat ging vanzelf goed: dashboard home toont een nette wacht-/voorbereidingsstaat met `Jouw dashboard wordt voorbereid` en zonder valse managementclaim.
  - Waar ontstond twijfel: de directe campaignroute landde niet in een expliciete denied- of 404-staat, maar bleef hangen op `LADEN Campaign state wordt opgebouwd`.
  - Waar was hulp nodig: extra wachttijd bevestigde dat dit geen kortstondige load was maar een terugkerende staat.
  - Eerste duiding: dit voelt als echte productfrictie, omdat de gebruiker op een campaignpad niet scherp krijgt of hij geen toegang heeft, moet wachten, of in een foutstaat zit.

- Ondersteunende semireele observatiegrond:
  - `sales_demo_exit` via `python manage_demo_environment.py run sales_demo_exit` plus sqlite-inspectie.
  - `sales_demo_retention` via `python manage_demo_environment.py run sales_demo_retention` plus sqlite-inspectie.
  - Gerichte verificatie via `python -m pytest tests/test_api_flows.py -k "implementation_smoke_flow or respondents_import"`, `python -m pytest tests/test_demo_environment_system.py` en `npx vitest run "app/(dashboard)/campaigns/[id]/actions.test.ts" "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/campaigns/[id]/page.route-shell.test.ts" "app/(dashboard)/dashboard/page.test.ts" "lib/ops-delivery.test.ts" "lib/client-onboarding.test.ts" "lib/response-activation.test.ts"`.

## Wat al goed genoeg werkt

- Dashboard home is op current `main` duidelijker read-first dan voorheen. `Eerste managementoverview`, `Campagneoverzicht` en `Open belangrijkste campaign` sturen direct naar de juiste eerste leesrichting.
- De bounded campaigncontext werkt goed genoeg: productnaam, samenvattend signaal, responsstatus, dashboardstatus en `PDF-rapport` zijn direct zichtbaar zonder dat een gebruiker eerst door een breed dashboard hoeft te zoeken.
- De `no-access` dashboard-home staat is inhoudelijk goed genoeg. De gebruiker krijgt daar geen misleidende schijn van actieve managementwaarde.
- Current `main` houdt managementread en uitvoerdiscipline al redelijk gescheiden. Dat helpt om geen nieuwe dashboardscope of analysegolf te suggereren.
- De copy rond assisted onboarding is sterk genoeg om self-serve misverwachting te dempen: dit voelt meer als begeleide vrijgave van dashboard en rapport dan als losse tool.

## Waar nog terugkerende frictie zit

- Ownerbegrip blijft te indirect. De campaign laat wel `EERSTE EIGENAAR` zien, maar maakt voor de ingelogde gebruiker niet scherp genoeg of hij zelf de owner is of alleen read-first toegang heeft.
- Activatie en vrijgave blijven als keten te impliciet: account actief, dashboard zichtbaar, campaign leesbaar en eerste managementgebruik bevestigd voelen nog niet als een enkel helder klantmoment.
- Op een leesbare campaign zit de eerstvolgende uitvoer- of reviewstap voor beheer niet direct open in beeld, maar achter een disclosure. Voor admin was die laag pas na extra interactie zichtbaar.
- Voor member en viewer is goed zichtbaar dat zij kunnen lezen, maar minder expliciet wat de eerstvolgende stap buiten lezen is en wie die dan hoort te dragen.
- De `no-access` campaignroute gaf live geen expliciete denied- of 404-staat, maar een blijvende laadstaat. Dat is terugkerende productfrictie op een plek waar helderheid juist cruciaal is.
- De semireele fixtures blijven zwakker dan de live current-main sessies voor owner-, activatie- en first-management-use observatie. Ze helpen voor state- en thresholdgedrag, maar niet genoeg voor gedragsfrictie.

## Indeling van frictie
- productissue
  - De live `no-access` campaignroute blijft hangen op `Campaign state wordt opgebouwd` in plaats van een expliciete geen-toegang- of 404-staat.
  - De eerstvolgende uitvoer- en reviewstap op een leesbare campaign is voor beheer niet direct zichtbaar op de eerste view, maar verstopt achter een disclosure.
- onboardingissue
  - De flow maakt nog niet scherp genoeg wie aan klantzijde de owner is, wie alleen read-first gebruiker is en wie de eerste vervolgstap hoort te bevestigen.
  - Activatie voelt nog als meerdere losse checkpoints in plaats van als een eenduidig vrijgavemoment dat onboarding bewust afhecht.
- supportissue
  - First-management-use blijft in de praktijk een support- of opsbevestiging en is niet live waarneembaar als vanzelfsprekende productafronding.
  - Bij twijfel over owner, activatie of vervolgstap blijft menselijke begeleiding nog nodig om de route correct te duiden.
- verwachtingsissue
  - `EERSTE EIGENAAR` wordt wel getoond, maar zonder voldoende expliciete koppeling aan de ingelogde gebruiker en zijn eigen rol.
  - Een gebruiker kan te snel denken dat zicht op dashboard of campaign gelijkstaat aan volledig vrijgegeven managementgebruik, terwijl de flow feitelijk nog begeleid en begrensd is.

## Wat dit betekent voor customer-ops-hardening

- Customer-ops-hardening kan nu gericht verder zonder nieuwe productwave.
- De hoogste opbrengst zit nu in strakker operationeel expliciteren:
  - leg per klantdoorloop expliciet vast wie owner is
  - bevestig expliciet wanneer activatie als echte vrijgave telt
  - bevestig first-management-use als: wie keek, welke vraag stond centraal, wat is de eerstvolgende stap, wanneer is het reviewmoment
- Gebruik hiervoor liever intake-, handoff- en opvolgdiscipline dan nieuwe dashboardlagen.
- Voeg alleen een minieme observatiehulp toe als werknotitieformat voor deze vier punten, niet als nieuwe productinterface.

## Wat dit betekent voor eventueel later productwerk

- Later productwerk lijkt nu pas zinvol als dezelfde frictie ook in echte klantobservaties terugkomt nadat customer-ops deze punten explicieter begeleidt.
- Het meest waarschijnlijke latere productwerk is klein en gericht:
  - scherpere denied-state op `no-access` campaignniveau
  - explicietere rol-/ownerduiding voor ingelogde klanten
  - zichtbaardere first-next-step op de leesbare campaign zonder nieuwe dashboardscope te openen
- Dit is nog niet de eerstvolgende stap. Eerst observeren, daarna pas gericht kiezen.

## Verificatie en observatiegrond

- Echt live geobserveerd in deze draad:
  - current-main runtime op `http://localhost:3000`
  - `retentiescan-live-admin@verisight.test` op dashboard en campaigndetail
  - `retentiescan-live-member@verisight.test` op dashboard en campaigndetail
  - `retentiescan-live-viewer@verisight.test` op dashboard en campaigndetail
  - `retentiescan-live-noaccess@verisight.test` op dashboard en campaigndetail
- Semireeel geobserveerd in deze draad:
  - `sales_demo_exit`
  - `sales_demo_retention`
  - sqlite-inspectie van de seeded demo-org
  - gerichte backend- en frontend-tests rond import, activation, dashboardreadiness, onboarding en delivery governance
- Afgeleid in plaats van live waargenomen:
  - of echte klantteams dezelfde owner- en activatieverwarring ervaren als deze testaccounts
  - hoe vaak first-management-use in echte klantoperatie nog supportverkeer oproept
  - of customer-ops-explicitering zonder productaanpassing al voldoende is in echte doorlopen
- Geen valse zekerheid:
  - er is in deze draad geen echte klant live geobserveerd
  - de live observaties zijn gedaan met bestaande testaccounts op current `main`
  - first-management-use is in deze ronde niet live bevestigd als afgerond klantmoment, maar alleen indirect beoordeeld via UI, deliverylogica en tests

## Git-status
- branch: `codex/customer-ops-observation-round`
- commit: nog niet geactualiseerd na deze notitie-update
- pushstatus: lokaal voor op `origin/main`, nog niet gepusht
- PR-status: geen PR geopend

## Oordeel
- bruikbaar observatiebeeld

## Aanbevolen volgende stap

Voer nu 1-2 echte geobserveerde klantdoorlopen uit op current `main` met exact dezelfde lens:

- ownerrol en verantwoordelijkheidsbegrip
- activatiestap en moment van vrijgave
- first-management-use begrip
- first-next-step duidelijkheid
- dashboard/home begrip
- campagne- en uitvoercontext

Gebruik die ronde alleen om te beslissen of customer-ops-hardening al genoeg is, of dat later klein en gericht productwerk nodig blijft. Open nog steeds geen nieuwe dashboard- of designwave.
