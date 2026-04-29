## Action Center Richer Review Decisions

### Doel
Deze fase verdiept `review decisions` zonder nieuwe managerinput of bredere workflow. De kern is:
- authored decisions blijven de canonieke write-path
- reviewbesluiten krijgen sterkere beslisregels per `decision`
- zichtbare Action Center-semantiek gaat minder op losse vrije tekst leunen

### Productgrens
Wel:
- sterkere beslisregels rond `doorgaan`, `bijstellen`, `afronden`, `stoppen`
- decision-specifieke zichtbare semantics in detail en history
- interne admin-begeleiding in de bestaande beheer-write-surface

Niet:
- nieuwe managerinteractie
- uitbreiding naar task management
- brede statusmachine
- auditlog of extra reviewworkflow

### Canonieke beslissingstypen
De bestaande authored `decision`-set blijft canoniek:
- `doorgaan`
- `bijstellen`
- `afronden`
- `stoppen`

Deze fase voegt geen extra decision-values toe. In plaats daarvan krijgt elke value een vaste productregel:

#### Doorgaan
- huidige stap blijft inhoudelijk geldig
- `nextStep` mag leeg zijn of hetzelfde spoor volgen
- `nextCheck` moet bevestigen wat nog moet blijken voordat de route weer reviewt

#### Bijstellen
- de review heeft expliciet een koerscorrectie opgeleverd
- `nextStep` moet aanwezig zijn en inhoudelijk verschillen van alleen een herhaling van de huidige stap
- `observationSnapshot` moet gevuld zijn, zodat zichtbaar is wat de bijstelling triggerde

#### Afronden
- de route kan inhoudelijk sluiten
- `nextStep` hoort leeg te zijn
- `nextCheck` hoort leeg te zijn
- zichtbare semantics moeten dit als sluitbesluit tonen, niet als open vervolg

#### Stoppen
- de route wordt bewust beëindigd
- `nextStep` hoort leeg te zijn
- `nextCheck` hoort leeg te zijn
- de stopreden moet zichtbaar blijven in `decisionReason`

### Canonieke projectielaag
Deze fase introduceert een kleine gedeelde presentatielaag bovenop bestaande authored truth:
- `decisionSummary`
- `decisionGuidance`
- `nextCheckVisibility`

Dit zijn expliciet geen losse component-heuristieken. Ze worden uit authored decision-truth geprojecteerd.

#### DecisionSummary
Korte zichtbare samenvatting van de beslisrichting:
- doorgaan = huidige spoor loopt door
- bijstellen = koerscorrectie nodig
- afronden = route inhoudelijk klaar
- stoppen = route bewust beëindigd

#### DecisionGuidance
Korte, decision-gebonden UI-hulp in de admin write-surface:
- welke velden nu verplicht of logisch zijn
- welke velden juist niet meer horen te vullen

#### NextCheckVisibility
Vaste zichtbaarheidregel:
- alleen tonen als het besluit nog open vervolg heeft
- dus wel bij `doorgaan` en `bijstellen`
- niet bij `afronden` en `stoppen`

### Action Center detail
Detailweergave moet hierdoor sterker en consistenter worden:
- `Laatste beslissing` blijft
- `Waarom dit besluit` blijft
- `Volgende toets` verdwijnt automatisch bij afsluitende besluiten
- detail maakt zichtbaar of het besluit een open vervolg of sluiting betekent

### Decision history
Decision history blijft compact, maar volgt nu dezelfde regels:
- afsluitende entries tonen geen synthetische next check
- bijstelentries tonen expliciet dat het om koerscorrectie gaat
- doorloopentries blijven zichtbaar als voortzettingsbesluit

### Beheer-write-surface
De bestaande authored decision-editor blijft de enige write-surface.
Deze fase scherpt hem aan met:
- decision-specifieke guidance
- decision-specifieke validatie
- duidelijker gedrag rond open versus afsluitende besluiten

### Succescriteria
Geslaagd als:
- authored review decisions inhoudelijk consistenter worden ingevuld
- Action Center minder open velden toont die niet bij het besluittype passen
- afsluitende besluiten duidelijker als sluiting voelen
- bijstelbesluiten zichtbaarder koerscorrectie tonen
- managers nog steeds read-only blijven
