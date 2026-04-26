# ASSISTED_SAAS_OPERATING_CONTRACT.md

Last updated: 2026-04-26
Status: active
Source of truth: current `main` runtime, `suite-access.ts`, Action Center manager hardening, customer ops docs and the live commercial track.

## 1. Summary

Dit contract legt vast hoe Verisight operationeel werkt als assisted SaaS.

De kernwaarheid is:

- één suite
- één authlaag
- één klantgrens per organisatie
- meerdere bounded productlijnen binnen diezelfde suite
- assisted activatie, support en handoff blijven voorlopig de verkochte en leverbare norm

Verisight is dus niet:

- een no-touch self-serve platform
- een billing-first SaaS
- een seat- of subscription-engine

Verisight is nu wél:

- een herhaalbare assisted suite-operatie
- waarin provisioning, activatie, dashboardgebruik, rapportgebruik en Action Center follow-through via vaste operator- en klantrollen lopen

## 2. Operating truth

### Organisatie als tenantgrens

De huidige runtimegrens is:

- `organizations` = klantgrens / tenantgrens
- `org_members` = insight- en klantrollen
- `campaigns` = fulfillment-units per productroute
- `campaign_delivery_records` = delivery- en readinesscontrol
- `action_center_workspace_members` = bounded follow-through toegang

Daarmee bestaat de suite nu operationeel uit:

- organisatie
- gebruikers
- productroutes / campaigns
- suite-shell
- dashboard / reports
- Action Center

### Eén auth, twee modulefamilies

De suite gebruikt één authsysteem voor alle persona’s:

- Verisight admin
- klant owner
- klant member
- klant viewer
- manager assignee

Binnen diezelfde login bestaan twee modulefamilies:

- insights:
  - dashboard
  - campaigns
  - reports
- follow-through:
  - Action Center

### Assisted default

De operationele default blijft:

- leadcapture assisted
- routekeuze assisted
- organization setup assisted
- campaign setup assisted
- productactivatie assisted
- first value en first management use assisted

Semi-self-service is alleen toegestaan waar dat de assisted route ondersteunt:

- inloggen
- dashboard lezen
- rapport gebruiken
- Action Center bounded opvolgen

## 3. Operating roles

### Verisight admin

- beheert klantsetup, uitzonderingen en operatorrecovery
- mag alle modules zien
- bewaakt activatie, support en follow-through

### Klant owner

- primaire klantverantwoordelijke binnen de suite
- ziet insights + reports + Action Center
- mag manager assignments voor Action Center aanbrengen
- blijft eigenaar van vrijgave, first management use en bounded vervolgkeuzes

### Klant member / viewer

- volgt bestaande insighttruth
- leest dashboard en rapport volgens rol
- kan Action Center zien waar dat binnen de suite-shell wordt toegestaan

### Manager assignee

- logt in via dezelfde suite-auth
- ziet alleen Action Center
- werkt alleen binnen toegewezen department- of item-scope
- is follow-through actor en geen insight-consumer

## 4. Operational boundaries

### Wat nu operationeel waar is

- de suite-shell is gedeeld
- dashboard en Action Center leven in dezelfde omgeving
- reports zijn een aparte insightsmodule binnen diezelfde shell
- manager-toegang wordt capability-based begrensd
- denied states en redirects schermen insights expliciet af voor manager-only persona’s

### Wat nog bewust niet bestaat

- aparte billing accounts
- subscriptions of plans in runtime
- seatlogica
- geautomatiseerde org self-provisioning
- klantgestuurde productactivatie zonder operatorcontrole
- generieke workflowautomation buiten bounded follow-through

## 5. Assisted SaaS defaults

De vaste defaults zijn:

- organization-first
- route-aware campaign-first
- owner-governed activation
- dashboard first-read
- report as management handoff
- Action Center als bounded follow-through
- operatorreview vóór brede automation

## 6. Handoffs

Assisted SaaS werkt nu via deze harde handoffketen:

1. contact en kwalificatie
2. routekeuze
3. organization en campaign setup
4. import en launch readiness
5. klantactivatie
6. first value
7. first management use
8. Action Center follow-through
9. learning / next route / closeout

## 7. Guardrails

Niet claimen of bouwen alsof Verisight al:

- no-touch onboarding draagt
- billing-driven SaaS is
- een brede employee operations suite is
- een onbeperkte taskmanager is
- een fully self-serve enterprise product is

## 8. Validation

- Dit contract volgt de live suite-shell op `main`.
- Dit contract volgt `suite-access.ts` en manager-only Action Center hardening.
- Dit contract volgt de huidige opsdocs rond onboarding, ownership, pilot en deliveryrecords.

## 9. Next step

Gebruik dit contract als basis voor:

- `SO-1` workspace-, account- en provisioningmodel
- `SO-2` product activation en entitlements
- `SO-3` lifecycle en handoffdiscipline
