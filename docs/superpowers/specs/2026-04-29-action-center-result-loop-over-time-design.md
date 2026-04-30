## Action Center Result Loop Over Time

### Doel
Deze fase maakt zichtbaar hoe een route zich over meerdere reviewmomenten ontwikkelt.

De kern:
- de bestaande `decisionHistory` blijft de canonieke bron
- de productlaag projecteert daar nu een compacte `resultProgression` uit
- detail laat daardoor niet alleen de laatste stand zien, maar ook de opeenvolging van stap -> observatie -> besluit -> vervolg

### Productgrens
Wel:
- gedeelde result-progressie uit canonieke decision history
- rijkere detailweergave van meerdere reviewmomenten
- compacte, rustige landing zonder extra workflow

Niet:
- auditlog
- extra managerinput
- generieke eventtimeline
- nieuwe statussen of decision-typen

### Canonieke projectieregel
`resultProgression` is geen aparte authored truth.

Het is een gedeelde projectie uit `decisionHistory`, met per entry:
- `resultEntryId`
- `recordedAt`
- `currentStep`
- `observation`
- `decision`
- `followThrough`

#### Ordering
- detail toont de progressie chronologisch oud -> nieuw
- de nieuwste entry blijft wel de bron voor `latestDecision` en de bestaande actuele result-loop

#### FollowThrough
`followThrough` komt primair uit:
- `nextStepSnapshot`
- anders `nextCheck`
- anders `expectedEffectSnapshot`

Daardoor blijft zichtbaar wat uit een besluit logisch volgde, ook als niet elk historisch moment exact dezelfde velden droeg.

### Surfacegedrag
#### Landing
- blijft compact
- toont geen volledige progression feed
- mag hooguit de laatste actuele result-loop en laatste beslissing blijven samenvatten

#### Detail
- krijgt een expliciete sectie `Resultaat over tijd`
- elke entry toont compact:
  - wat liep
  - wat zagen we
  - wat besloten we
  - wat volgde daarna

### Succescriteria
Geslaagd als:
- authored routes met meerdere reviewmomenten als echte voortgangslijn leesbaar worden
- resultaat niet alleen in de laatste update blijft hangen
- detail inhoudelijk rijker voelt zonder logboekdrukte
- landing rustig blijft
