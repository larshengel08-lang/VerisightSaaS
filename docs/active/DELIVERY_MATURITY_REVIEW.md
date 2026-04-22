# Verisight Delivery Maturity Review

## Korte samenvatting

De deliverylaag van Verisight staat inhoudelijk duidelijk sterker dan eerder. De keten van routekeuze, intake, launch, first value, report-to-action en closeout is inmiddels canoniek beschreven en in de delivery-spine zichtbaar gemaakt. Daardoor is het product niet meer vooral afhankelijk van losse operatoruitleg om van rapport naar eerste managementgebruik te komen.

De volgende volwassenheidsstap zit niet meer in productdefinitie, maar in operating discipline. Wat nog ontbreekt is een smallere, hardere laag voor operatorrollen, handoffmomenten, reviewritme, escalatieregels en bounded routegovernance. De kernvraag is niet meer of Verisight een route kan leveren, maar of een tweede operator die route even voorspelbaar, bestuurlijk leesbaar en zonder extra mondelinge context kan dragen.

## Waar de deliveryketen nu al sterk staat

De sterkste deliveryketen staat nu rond de assisted kernflow van `ExitScan` en `RetentieScan`. Daar is de volgorde van eerste route, implementation intake, import-QA, invite readiness, klantactivatie, first value, report delivery, eerste managementgebruik en follow-up inmiddels expliciet gemaakt in zowel documentlaag als delivery-spine. Dat is een wezenlijk sterker vertrekpunt dan een losse checklist of operatorgeheugen.

Ook de stap van rapport naar actie staat inhoudelijk al scherp. De gedeelde managementflow is duidelijk: wat speelt nu, waarom telt dit, wat eerst doen, wie is eerste eigenaar, welke eerste stap telt en wanneer reviewen we opnieuw. Daarmee is report-to-action niet langer alleen interpretatie, maar een expliciete handoff naar eigenaar, eerste stap en reviewmoment.

De exceptionlaag is eveneens steviger geworden. Open delivery-exceptions, checkpoint-exceptions, pending gates en learning-closeout blokkades zijn nu zichtbaar in een persistente delivery control. Daardoor is er al een serieuze basis voor bestuurlijke leesbaarheid van risico, herstelwerk en voortgang.

## Waar nog te veel impliciete kennis of ad-hoc zit

De grootste restzwakte zit niet meer in deliverystructuur, maar in deliverygedrag. De repo maakt lifecycle, checkpoints en blockers zichtbaar, maar minder scherp wie op welk moment bestuurlijk eigenaar is van de volgende stap. Daardoor blijft de route van signaal naar opvolging nog te vaak afhankelijk van de operator die het dossier al kent.

Vooral rond `eerste managementgebruik`, `follow_up_decided` en `learning_closed` zit nog veel handmatige interpretatie. De gates bestaan, maar de discipline eromheen is nog niet uitgewerkt tot een vast operating ritme met duidelijke aging, heropenregels, reviewgrenzen en escalatievolgorde. Daardoor is de kans kleiner geworden op chaos, maar nog niet klein genoeg voor herhaalbare bestuurlijke rust.

Ook het onderscheid tussen "inhoudelijk leverbaar", "operationeel vrijgegeven", "echt gebruikt" en "formeel gesloten" vraagt nog te vaak contextuitleg. De delivery-spine bevat deze statussen wel, maar nog niet altijd de minimale operatorartefacten die het oordeel overdraagbaar maken zonder extra mondelinge toelichting.

## Welke operatorflows expliciet moeten worden gemaakt

De eerste explicitering die nog nodig is, is de flow van commercieel akkoord naar echte deliverystart. De bounded commerce-laag maakt de releasegrens scherper, maar de operatorflow die zegt wie delivery vrijgeeft, op basis van welke checks en wat er gebeurt bij een onvolledige vrijgave, is nog niet als één compacte governanceflow vastgezet.

De tweede explicitering is de flow van report delivery naar bevestigd managementgebruik. Nu is duidelijk dat output en management use niet hetzelfde zijn, maar nog niet strak genoeg hoe Verisight vastlegt dat de eerste managementsessie echt heeft plaatsgevonden, wat daaruit kwam, wie de eigenaar werd en wanneer de review terugkomt.

De derde explicitering is de exceptionflow. Er is al exceptiontaal, maar nog geen volledig operatorpad per situatie:
- wie pakt `blocked`
- wie pakt `needs_operator_recovery`
- wanneer blijft iets bij de klant met `awaiting_client_input`
- wanneer wordt een extern probleem een bestuurlijke escalatie in plaats van alleen een open notitie

De vierde explicitering is de bounded vervolgflow. Na eerste managementgebruik moet expliciet worden vastgelegd of de route doorgaat als ritme, bounded vervolg, verdieping, extra sessie, pauze of stop. Nu bestaat die logica inhoudelijk wel, maar nog niet als vaste operatorbeslissing met herhaalbare uitkomstcategorieen.

## Welke review- en opvolgdiscipline nog ontbreekt

De ontbrekende discipline zit vooral in ritme en heropening. Er is wel een weekreviewgedachte en er zijn closeout-gates, maar nog geen strakke standaard die zegt welke open deliverypunten wekelijks moeten worden gezien, welke termijn nog gezond is per open gate en wanneer een dossier verplicht opnieuw bestuurlijk besproken moet worden.

Ook ontbreekt een smallere reviewlaag tussen "eerste managementsessie gehad" en "learning gesloten". Daar hoort minimaal tussen te zitten:
- is de eerste actie werkelijk gestart
- is de eigenaar nog bevestigd
- is reviewdatum gehaald of gemist
- leidt de uitkomst tot doorgaan, verdiepen, herhalen of stoppen

Zonder die discipline blijft follow-up te veel een notie en te weinig een bestuurlijk beslismoment. Dat is precies het punt waar delivery anders moet werken dan productontwikkeling: niet alleen kunnen opleveren, maar ook consequent kunnen teruglezen of de oplevering bestuurlijk landt.

## Welke deliveryverschillen per productrol moeten blijven

Voor `ExitScan` en `RetentieScan` horen de zwaarste deliveryregels te blijven gelden. Dit zijn de kernroutes die als eerste route kunnen openen en die het sterkst buyer-facing, reportmatig en bestuurlijk dragend zijn. Daar hoort formele routekeuze, expliciete intake, duidelijke report delivery, bevestigd eerste managementgebruik en vastgelegde follow-up standaard bij.

Voor `Onboarding 30-60-90`, `Pulse` en `Leadership Scan` moet de delivery bewust bounded blijven. Deze routes zijn inhoudelijk sterker geworden, maar niet bedoeld als tweede parallelle kernspine met eigen zware suite-expansie. Hun deliveryregels horen daarom anders te blijven:
- `Onboarding` blijft assisted en single-checkpoint, zonder journey-engine of meerstapsorchestratie
- `Pulse` blijft een compacte review- of hercheckroute en mag niet wegdrijven naar een herlabelde `RetentieScan ritmeroute`
- `Leadership Scan` blijft group-level only en mag deliverymatig niet gaan klinken als named-leader, 360 of performance-instrument

Dat betekent bestuurlijk: bounded routes vragen scherpere release- en vervolggrenzen dan kernroutes. Niet elke geslaagde bounded sessie hoort automatisch te leiden tot nieuwe productopening, extra workflow of impliciete suiteverbreding.

## Welke minimale delivery-artefacten of regels nog nodig zijn

Minimaal nodig is een expliciete operatorrolkaart. Niet op organisatieniveau breed, maar smal rond delivery: wie is delivery-owner, wie bevestigt management use, wie bewaakt follow-up, wie beoordeelt uitzonderingen en wie beslist over bounded vervolg of stop.

Daarnaast zijn vijf minimale artefacten of regels nodig:
- een vaste `delivery start review` voor de grens tussen commercieel akkoord en echte deliveryvrijgave
- een compacte `management use note` waarin eigenaar, eerste actie, reviewdatum en verwachte terugkoppeling verplicht worden vastgelegd
- een `follow-up decision` met vaste uitkomstcategorieen: doorgaan, bounded vervolg, verdieping, pauze of stop
- een `exception- en escalatieregelset` met eigenaar, responstermijn en opschalingsgrens per exceptiontype
- een `weekly delivery review` waarin open blockers, open follow-up en verouderde dossiers verplicht zichtbaar zijn

Aanvullend hoort er een simpele heropenregel bij: een dossier dat formeel verder staat maar geen reviewuitkomst, geen eigenaar of een verlopen vervolgdatum heeft, mag niet stilletjes als gezond blijven lezen.

## Wat nodig is voor herhaalbare report-to-action uitvoering

Een volwassen report-to-action-operating model voor Verisight ziet er als volgt uit:

Eerst wordt de route formeel vrijgegeven voor delivery. Daarna wordt first value niet alleen inhoudelijk, maar ook operationeel bevestigd. Vervolgens wordt output geleverd in de vorm die bij de route past: klassiek rapport voor kernroutes, bounded output voor niet-kernroutes. Daarna volgt een expliciet bevestigd eerste managementgebruik waarin drie dingen worden vastgelegd: eerste eigenaar, eerste toetsbare stap en reviewdatum.

Vanaf dat moment verschuift delivery van oplevering naar bestuurlijke opvolging. De route blijft open totdat een vervolguitkomst is gekozen en vastgelegd. Die uitkomst is niet impliciet, maar een formele keuze: herhalen, verdiepen, bounded vervolgen, stoppen of later heropenen. Exceptions blijven intussen niet in vrije tekst hangen, maar lopen via vaste eigenaars- en escalatieregels.

Dat model vraagt geen zware workflow-engine. Het vraagt wel dat Verisight de huidige delivery-spine aanvult met een smallere operating discipline voor rollen, review, aging en bounded routebeslissingen. Dan wordt report-to-action niet alleen inhoudelijk sterk, maar ook herhaalbaar als bestuurlijk stabiele deliveryroute.

## Aanbevolen volgende stap

Open geen nieuwe productscope, maar een korte hardening-wave voor het operating model achter delivery. Die wave moet zich beperken tot vijf onderwerpen: operatorrollen, delivery start review, management use vastlegging, exception- en escalatieregels en bounded vervolggovernance.

De juiste uitkomst van die volgende stap is niet meer productparity, maar overdraagbaarheid. Pas wanneer een tweede operator zonder extra mondelinge context dezelfde route, dezelfde escalaties en dezelfde follow-upbeslissingen kan dragen, functioneert Verisight niet alleen productmatig maar ook deliverymatig als herhaalbare bestuurlijke route.
