# Action Center manager capability contract

## Doel
Volwassen suite-toegang voor twee modulefamilies binnen één login:

- insights: dashboard, campaigns, reports
- follow-through: Action Center

## Persona's

### Verisight admin
- ziet dashboard, campaigns, reports en Action Center
- mag assignments beheren
- mag denied flows en pilotdata controleren

### Klant owner
- ziet dashboard, campaigns, reports en Action Center
- mag managers aan afdelingen koppelen
- blijft de klantverantwoordelijke voor insightread en vrijgavemoment

### Klant member / viewer
- houdt bestaande insighttruth
- kan Action Center meelezen voor zover de shared shell dat toelaat
- krijgt geen manager-only afscherming

### Manager assignee
- logt in via dezelfde suite-auth
- landt direct op `/action-center`
- ziet alleen toegewezen department-scopes
- ziet geen `/dashboard`, `/reports` of `/campaigns/[id]`

## Capabilitylaag
Nieuwe capability-as naast `org_members`:

- tabel: `public.action_center_workspace_members`
- scope types:
  - `org`
  - `department`
  - `item`
- access roles:
  - `hr_owner`
  - `hr_member`
  - `manager_assignee`

## Routecontract

### HR / klant
- `/dashboard` toegestaan
- `/reports` toegestaan
- `/campaigns/[id]` toegestaan volgens bestaande klanttruth
- `/action-center` toegestaan

### Manager assignee
- `/action-center` toegestaan
- `/dashboard` redirect naar `/action-center`
- `/reports` expliciete denied state
- `/campaigns/[id]` expliciete denied state

## Department backbone
- departmenttruth komt uit `respondents.department`
- Action Center groepeert live follow-through daarom eerst per department-scope
- als departmentdata ontbreekt, valt de scope bounded terug op campaignniveau

## Bewuste grens
Manager-only toegang opent geen survey-consumptie.
De manager is in deze fase een follow-through actor, geen insight-consumer.
