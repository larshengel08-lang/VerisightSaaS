## Action Center Stronger Action Quality

### Doel
Deze fase verdiept de authored actielaag zodat routes minder op generieke tekst en meer op echte managementinterventies leunen.

De kern:
- `currentStep`, `nextStep`, `expectedEffect` blijven de canonieke authored velden
- de productlaag definieert nu explicieter wat een goede stap en een goed effect is
- open routebesluiten moeten een geloofwaardige voortgangslijn tonen

### Productgrens
Wel:
- sterkere kwaliteitsregels voor authored actievelden
- betere guidance in de admin-write-surface
- compacter en consistenter zichtbaar actieframe in Action Center

Niet:
- tasklists
- meerdere parallelle steps
- nieuwe managerinput
- workflowuitbreiding

### Canonieke actieregels

#### CurrentStep
- moet een concrete lopende managementhandeling beschrijven
- hoort te lezen als interventie, niet als observatie of vraag
- mag niet alleen een outcome-label of abstracte status zijn

#### NextStep
- is de eerstvolgende bounded stap na `currentStep`
- hoort alleen zichtbaar te blijven bij open routebesluiten
- moet verschillen van `currentStep`, tenzij het product expliciet een vervolgcheck zonder koerscorrectie projecteert

#### ExpectedEffect
- beschrijft wat deze stap zichtbaar moet maken
- hoort als effect te lezen, niet als extra taak
- blijft verplicht voor open routebesluiten

### Kwaliteitsprojectie
Deze fase introduceert een kleine gedeelde presentatielaag:
- `actionQuality`
- `actionGuidance`

#### ActionQuality
Geeft per authored decision aan of de actielaag:
- concrete staptaal heeft
- een logisch vervolg toont
- een echt effect beschrijft

Deze laag is intern productmatig en wordt niet als score naar eindgebruikers gevisualiseerd.

#### ActionGuidance
Korte interne guidance voor de beheer-editor:
- wanneer een stap te vaag is
- wanneer `expectedEffect` als taak leest
- wanneer `nextStep` te veel op `currentStep` lijkt

### Zichtbaar gedrag
Action Center-detail moet daardoor sneller voelen als:
- dit loopt nu
- dit volgt daarna
- dit moet het opleveren

Landing blijft compact:
- `Stap`
- eventueel impliciet vervolg via decision-context

### Succescriteria
Geslaagd als:
- minder authored stappen op observatie- of vraagtaal leunen
- `expectedEffect` minder vaak een tweede taakzin is
- `currentStep` en `nextStep` beter als kleine voortgangslijn voelen
- managers nog steeds niets extra’s hoeven in te voeren
