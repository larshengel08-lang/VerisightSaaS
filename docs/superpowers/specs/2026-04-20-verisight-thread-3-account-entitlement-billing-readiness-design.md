# Thread 3: Begrensde Account-, Entitlement- En Billing-Readiness

## Korte samenvatting
Deze thread bepaalt onder welke voorwaarden Verisight later pas account-, entitlement- en billing-mechaniek verantwoord kan expliciteren. Het doel is niet om nu billing te bouwen, maar om bestuurlijk vast te leggen wat de dragende accounteenheid is, wat wel en niet entitlementwaardig kan worden, en wanneer billing logisch volgt op bewezen modelrealiteit.

De kern is: recurring motion moet eerst commercieel bewezen zijn en lifecycle-discipline moet bestuurlijk staan. Pas daarna mag Verisight begrensd bepalen welke contractgrenzen, toegangsgrenzen en facturatielogica expliciet gemaakt moeten worden. Billing is in deze thread dus afgeleid, niet leidend.

## Waarom thread 3 nu volgt op thread 2
Thread 1 heeft de route van first-buy naar guided recurring motion uitgewerkt. Thread 2 heeft lifecycle- en expansiondiscipline vastgelegd. Thread 3 volgt daarop, omdat account-, entitlement- en billingvragen pas zuiver beantwoord kunnen worden wanneer duidelijk is:
- welke routes first-buy zijn
- welke vervolgbewegingen echt recurring zijn
- wanneer expansion terecht is
- wie daarover besluit

Zonder die onderlaag zou thread 3 te vroeg verschuiven naar technische of juridische antwoorden op een commercieel nog onzuiver model.

## Relatie van deze thread tot de bredere SaaS-route
Thread 3 is onderdeel van de bredere route naar selectieve SaaS-readiness, maar nog steeds geen SaaS-conversie op zichzelf. Deze thread bepaalt eerst de modelgrenzen waarbinnen latere standaardisatie mogelijk wordt.

Dat betekent:
- wel accountgrens, entitlementgrens en billing-readiness bespreken
- niet checkout, self-service onboarding, planmatrix, seatmodel of usagemodel bouwen
- niet subscription-taal normaliseren zonder bewezen recurring realiteit

Thread 3 is dus de bestuurlijke brug tussen lifecycle-discipline en latere, begrensde systeemexplicitering.

## Waarom dit nu pas aan bod komt
Account, entitlement en billing horen nu pas op tafel te komen omdat ze alleen zinvol zijn als afgeleide van een bestaand commercieel en operationeel patroon.

Verisight moet daarom eerst weten:
- welke route wordt verkocht
- wanneer die route first-value levert
- wanneer die route tot management-use leidt
- wanneer vervolg herhaling, verdieping of verbreding is
- wanneer recurring meer is dan losse vervolgverkoop

Pas daarna kun je bestuurlijk zuiver beantwoorden wat de accounteenheid is, wat later entitlement kan worden en wanneer billing verantwoord volgt.

## Huidige modelwerkelijkheid
De huidige modelwerkelijkheid van Verisight is assisted, productized en manual-first. De commerciële contractlaag is al scherper dan de systeemlaag, maar dat is nu nog verdedigbaar.

Vandaag geldt:
- de organisatiecontext (`organization`) functioneert praktisch als klantgrens en v1-klantcontainer
- toegangsrollen zoals `owner`, `member` en `viewer` zijn toegangsrollen, geen seats
- een `campaign` is fulfillment- en operationele eenheid, geen billingeenheid
- pricing structureert eerste trajecten, vervolgvormen en begrensde vervolgconstructies, maar is nog geen planmodel
- handmatige facturatie is operationeel toegestaan, maar nog geen productwaarheid

De kernwerkelijkheid is dus: het model bestaat al impliciet, maar is nog niet bedoeld als volwaardige billinglaag.

## Account boundary
De bestuurlijke hoofdvraag van accountgrens is: wat is in deze fase de kleinste zinvolle economische en operationele klantunit?

Voor Verisight is het antwoord voorlopig:
- de primaire accounteenheid blijft de organisatie waarop een route wordt verkocht en geleverd
- de accounteenheid is niet hetzelfde als elke individuele gebruiker
- de accounteenheid is ook nog geen aparte billing-holding boven meerdere organisaties

Dat betekent:
- een route contracteert voorlopig tegen een organisatiecontext
- multi-org billing blijft een latere uitzondering, geen vroege default
- producttoegang en managementgebruik mogen niet worden gelezen alsof er al een uitgewerkt accountportfolio bovenop ligt

Bestuurlijke regel: eerst een heldere v1-accounteenheid, pas later uitzonderingen.

## Entitlement boundary
Entitlement mag pas ontstaan waar een commerciële contractgrens daadwerkelijk beschermd moet worden. Het is dus niet hetzelfde als toegang en ook niet hetzelfde als pricingcopy.

In deze fase geldt:
- toegang bepaalt wie iets kan zien of gebruiken
- entitlement bepaalt later pas wat contractueel binnen een route of vervolgvorm valt
- pricing bepaalt vandaag de verkoopstructuur, niet automatisch de productgrens

Later kan entitlement wel gaan over:
- welke routevorm contractueel is gekocht
- welke begrensde vervolgconstructie binnen de afgesproken leveringsomvang valt
- welke routegebonden uitbreiding wel of niet binnen het bestaande contract past

Entitlement gaat niet over:
- losse viewers
- responses
- seat-aantallen
- algemene producttoegang

Daarom moet nu worden bewaakt:
- rollen zijn geen seats
- campaigns zijn geen licenties
- responses zijn geen usage-units
- vervolgvormen zijn niet automatisch entitlement-objecten

Bestuurlijke regel: entitlement wordt pas relevant wanneer contractgrens en operating uitzonderingen dat aantoonbaar vereisen.

## Billing-readiness
Billing-readiness betekent in deze fase niet: “we kunnen facturen automatiseren”. Het betekent: “het onderliggende model is stabiel genoeg dat billing later een afgeleide capability kan worden.”

Billing-readiness vraagt daarom minimaal:
- bewezen recurring motion per relevante route
- stabiele lifecycle-uitkomsten
- heldere accountgrens
- duidelijke scheiding tussen toegang, entitlement en fulfillment
- beperkte uitzonderingsdruk in pricing en vervolglogica

Bestuurlijke statuslogica:
- `rood`: recurring is nog incidenteel, dealmatig of uitzonderingsgedreven
- `niet groen`: lifecycle-uitkomsten zijn nog niet zuiver, accountgrens schuift nog of contractgrenzen zijn nog te diffuus
- `pas voorzichtig groen`: recurring, lifecycle-uitkomsten, accountgrens en contractgrenzen zijn stabiel genoeg dat billing iets bestaands formaliseert in plaats van iets onrijps te forceren

Billing is dus pas logisch wanneer het bestaande model iets te formaliseren heeft. Als het model nog beweegt, fixeert billing vooral ruis.

Bestuurlijke regel: billing volgt op bewezen modelrealiteit. Checkout is geen go-to-market strategie.

## Wat billing nu wel en niet is
Billing is nu wel:
- een latere afgeleide capability
- een bestuurlijke readinessvraag
- een modeltoets op contractgrenzen en uitzonderingsdruk

Billing is nu niet:
- een groeimotor
- een vroege transformatielaag
- een reden om planmatrix, seats of usagedenken te introduceren
- een argument om assisted waarheid naar self-service te duwen

Wat vandaag geoorloofd is, is handmatige facturatie binnen een assisted model. Wat niet geoorloofd is, is doen alsof die handmatige praktijk al een productrijp billingmodel bewijst.

## Operating truth en uitzonderingen
De operating truth moet voorrang houden op modelzuiverheid op papier. Dat betekent dat assisted uitzonderingen tijdelijk toegestaan blijven zolang zij zichtbaar, begrensd en bestuurlijk verklaarbaar zijn.

Toegestane operating truth in deze fase:
- operator-owned setup en provisioning
- handmatige facturatie
- route-specifieke uitzonderingen mits expliciet beoordeeld
- guided vervolgconstructies zonder billingautomatisering

Niet toegestaan:
- structurele uitzonderingen die het onderliggende model onleesbaar maken
- impliciete afwijkingen die later als billing- of entitlementregel zouden moeten gelden
- uitzonderingen die ontstaan omdat pricing, lifecycle en delivery niet goed genoeg zijn uitgewerkt

Daarnaast geldt:
- offertetekst, contracttaal en buyer-facing taal mogen de assisted operating truth niet vooruitlopen
- Verisight mag geen subscription- of self-servicebeeld verkopen dat delivery nog niet draagt
- formele taal mag dus nooit verder zijn dan de werkelijke leveringsrealiteit

Bestuurlijke regel: uitzonderingen zijn tijdelijk verdedigbaar; onzichtbare uitzonderingen zijn bestuurlijk onaanvaardbaar.

## Ownermodel en besluitverantwoordelijkheid
Account-, entitlement- en billing-readiness vragen expliciet ownership. Zonder eigenaarschap worden modelkeuzes te vroeg technisch of te laat commercieel gemaakt.

Het ownermodel is:
- `commercial owner`: bewaakt of pricing, vervolglogica en contractstructuur nog binnen het bestuurlijke model passen
- `delivery owner`: bewaakt of operating uitzonderingen tijdelijk en uitlegbaar blijven
- `finance or contract owner`: bewaakt of facturatiepraktijk, offertevorm en juridische taal nog passen bij de werkelijke leveringsvorm
- `portfolio decision owner`: besluit wanneer account- of entitlementvragen niet langer route-specifiek zijn, maar portfolio-breed moeten worden vastgelegd

Bestuurlijke regels:
- accountgrens wordt niet impliciet aangepast in sales of delivery
- entitlementvragen worden niet opgelost via copy alleen
- billing-readiness wordt pas positief beoordeeld als commercial, delivery en contractverantwoordelijkheid hetzelfde model erkennen
- checkout of self-service billing mag niet worden verkend zonder expliciete portfolio-beslissing

## Gates en preconditions
Thread 3 mag alleen richting uitvoerbare vervolgstappen bewegen als de volgende preconditions aantoonbaar gelden:
- thread 1 staat: first-buy en guided recurring motion zijn commercieel uitgewerkt
- thread 2 staat: lifecycle-states, reviewmomenten en expansiondiscipline zijn bestuurlijk vastgelegd
- recurring is zichtbaar als patroon, niet als losse uitzonderingsverkoop
- support routes en `Combinatie` zijn begrensd
- operating uitzonderingen zijn zichtbaar en verklaarbaar

Pas dan kunnen de kernvragen van thread 3 zuiver worden beantwoord:
- wat is de v1-accounteenheid
- wat kan later entitlementwaardig worden
- wanneer wordt billing-readiness bestuurlijk groen

## Metrics en signalen
Deze thread moet worden gestuurd op signalen die laten zien of modelgrenzen stabiel genoeg worden voor latere formalisering.

Belangrijke signalen voor accountgrens:
- percentage deals waarbij een organisatiegrens volstaat zonder workaround
- aantal accountstructuur-uitzonderingen per kwartaal
- aantal gevallen waarin meerdere organisaties onder een deal vallen zonder heldere beslisregel
- percentage trajecten met expliciete sponsor, owner en leveringsgrens

Belangrijke signalen voor entitlementdruk:
- aantal gevallen waarin access en contractgrens door elkaar lopen
- aantal handmatige correcties op wat wel of niet binnen een route valt
- aantal vervolgdeals dat buiten de standaard route- of begrensde vervolglogica valt
- aantal uitzonderingen waarbij rollen onbedoeld als seats worden behandeld

Belangrijke signalen voor billing-readiness:
- aandeel vervolgdeals dat nog handmatige uitzonderingsfacturatie vraagt
- percentage deals met standaardiseerbare facturatielogica
- afwijkingsgraad tussen verkochte route en factureerbare realiteit
- aandeel recurring-vormen dat stabiel genoeg is voor latere billingformalisering

Belangrijke signalen voor no-go bewaking:
- aantal buyer-facing uitingen met plan-, seat- of checkoutframing
- aantal self-serviceverwachtingen die niet door delivery worden gedragen
- aantal gevallen waarin handmatige facturatie als productvolwassen billing wordt gelezen

## Account-, entitlement- en billing-stopregels
- Stop elke poging om billing voorop te zetten als recurring nog niet commercieel bewezen is.
- Stop elke verschuiving van toegangsrollen naar seatdenken zonder expliciete modelbeslissing.
- Stop elk gebruik van campaigns, responses of users als usage- of billingdriver zonder bewezen noodzaak.
- Stop elke checkout- of self-serviceframing zolang assisted levering de werkelijke operating truth is.
- Stop elke juridische of buyer-facing taal die meer billingvolwassenheid suggereert dan het model draagt.
- Stop elke uitbreiding naar multi-org billing zonder expliciete uitzonderingstoets.
- Stop elke entitlementoplossing die eigenlijk een pricing-, lifecycle- of deliveryprobleem maskeert.

## Expliciet nog niet bouwen of beloven
- Geen Stripe-first billing.
- Geen checkout-first flow.
- Geen planmatrix als commercieel kernverhaal.
- Geen seat-based pricing als default.
- Geen usage billing als default.
- Geen zichtbare factuur- of betaalstatus in het product als vroege kern.
- Geen self-service org-creatie of self-serve provisioning.
- Geen billing-API's of abonnementslogica als vroege standaard.
- Geen framing alsof Verisight al subscription-native is.

## Beslisvragen
- Welke accounteenheid is voorlopig klein genoeg om bestuurbaar te blijven en groot genoeg om commercieel te kloppen?
- Welke contractgrenzen vragen later echt entitlement, en welke blijven voorlopig verkoopstructuur?
- Welke recurring-vormen zijn stabiel genoeg om later billingwaardig te worden?
- Welke operating uitzonderingen zijn tijdelijk verdedigbaar en welke signaleren modelschuld?
- Wanneer rechtvaardigt multi-org klantgedrag een aparte accountabstractie?
- Wanneer wordt handmatige facturatie een rem in plaats van een acceptabele waarheid?
- Welke buyer-facing taal moet actief verboden blijven tot readiness groen is?

## Aanbevolen volgorde van besluiten
1. Bevestig de v1-accounteenheid.
2. Bevestig dat rollen toegang blijven en geen seats worden.
3. Leg vast welke routegrenzen, vervolgvormen en aanvullende routegebonden uitbreidingen later entitlement kunnen raken.
4. Leg vast welke operating uitzonderingen tijdelijk zijn toegestaan.
5. Definieer de minimale billing-readiness criteria.
6. Definieer de no-go's voor checkout, self-service en billingframing.
7. Kies de kernmetrics die modelstabiliteit en uitzonderingsdruk zichtbaar maken.
8. Beslis pas daarna of een latere implementatiedraad überhaupt gerechtvaardigd is.

## Next step na deze thread
Na deze thread is pas de vraag aan de orde of er een begrensde implementatiedraad nodig is voor een klein deel van account-, entitlement- of billinglogica. Dat is geen automatische volgende stap.

De uitkomst van thread 3 kan dus ook zijn: nog niet bouwen.

Een vervolgdraad is pas zinvol wanneer:
- thread 1 en 2 bestuurlijk staan
- de preconditions van thread 3 aantoonbaar gehaald zijn
- no-go's rond checkout, self-service en planframing schoon blijven
- billing echt een afgeleide capability blijkt, niet een nieuw stuurmodel
- de modelrealiteit stabiel genoeg is om een begrensde implementatiedraad te rechtvaardigen
