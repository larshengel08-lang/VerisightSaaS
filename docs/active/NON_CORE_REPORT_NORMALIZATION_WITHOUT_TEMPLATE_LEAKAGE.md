# Titel

Non-core rapportnormalisatie zonder template leakage

## Korte samenvatting

De huidige non-core lijn is niet vooral te zwak, maar te uniform geworden. Onboarding en Leadership hebben in hun parity-opbouw zichtbaar discipline gewonnen, maar zijn tegelijk te dicht tegen een gedeelde core-achtige report-shell aan gaan liggen. Daardoor verschuift de nadruk te snel van productspecifieke managementvraag naar een generieke factor- en handoffstructuur.

De grootste correctie is daarom niet: meer parity. De grootste correctie is: scherpere differentiatie binnen een gedeelde non-core canonlaag. Die laag moet wel executive rails, quality discipline en visuele basisregels delen, maar mag productspecifieke managementarchitectuur, signaallabels en shell-zwaarte niet meer gladstrijken.

Onboarding moet leesbaar worden als bounded peer-grade checkpointread. Leadership moet leesbaar worden als compacte bounded support-route rond managementcontext. Pulse moet expliciet dashboard-first en review-first blijven. ExitScan en RetentieScan blijven hier alleen referentie voor discipline, niet voor shell-overerving.

## Waar template leakage nu zit

De scherpste actieve leakage zit niet in grove productnaam-copy, maar in boundarytaal en shellgedrag. In Onboarding verwijzen embedded definities, dashboardcopy en reportcontent nog herhaaldelijk naar `retentievoorspeller`, `retentie-uitkomst` en `brede retentieclaim`. Dat zijn weliswaar negaties, maar ze laten de route nog steeds lezen in verhouding tot RetentieScan in plaats van vanuit haar eigen managementvraag.

Leadership toont minder directe leakage in productkernwoorden, maar de route leunt nog sterk op dezelfde paritylogica als Onboarding: rijkere managementhandoff, eigenaar, actie, reviewgrens en formele reportlaag in dezelfde algemene shell. Dat maakt Leadership sneller leesbaar als verkapte peer-route dan als bounded support-route.

De zwaarste architectonische leakage zit in de report-engine. `backend/report.py` gebruikt voor non-core output een gedeelde rebrand-shell voor executive, factoranalyse, risicolaag en methodiek. Daardoor erven Onboarding en Leadership niet alleen discipline, maar ook een te uniforme paginalogica. In de dashboardlaag doet hetzelfde probleem zich milder voor via één gedeeld `DashboardViewModel` met hetzelfde ritme van `topSummaryCards`, `managementBlocks`, `profileCards`, `primaryQuestion`, `nextStep` en `followThroughCards`.

## Welke managementvraag per product leidend moet zijn

Onboarding moet expliciet gestuurd worden door deze vraag: waar stokt de vroege landing in dit ene checkpoint van de eerste 30-60-90 dagen? Dat vraagt een shell waarin landing, steun, rolduidelijkheid, teaminbedding en kleine correctie centraal staan, niet een shell waarin het product eerst moet bewijzen dat het geen retentielogica is.

Leadership moet expliciet gestuurd worden door deze vraag: welke managementcontext blokkeert of ondersteunt een al zichtbaar people-signaal? Dat vraagt een shell die managementcontext, eerste managementcorrectie en bounded verificatie voorop zet. Niet de factorstructuur, maar de managementcontext-read moet de opening en volgorde bepalen.

Pulse moet expliciet gestuurd worden door deze vraag: welke compacte review- of herijkingsvraag vraagt nu direct aandacht? Pulse is geen verkort rapport, maar een managementreview op een cycle. De kern is daarom: review nu, kleine correctie, bounded hercheck. Elke latere formele output moet die compacte vraag volgen en niet een core-achtige rapportboog.

## Waar de huidige pagina-architectuur te uniform is

De grootste uniformiteit zit in de stap van productparity naar formele output. Onboarding en Leadership hebben hun formele reportlaag gekregen via een gedeelde report-engine-shell die executive opening, analyseblokken en methodiek in een bijna generieke volgorde plaatst. Dat maakt de routes consistenter, maar ook vlakker dan productmatig wenselijk is.

Ook de parity-waves hebben de architectuur subtiel dezelfde kant op geduwd. In zowel Onboarding als Leadership lag de expliciete ambitie op `management depth parity`, `report parity` en `formal output parity`. Dat heeft boundedheid goed bewaakt, maar heeft onvoldoende onderscheid gemaakt tussen peer-zwaarte, bounded peer-zwaarte en bounded support-zwaarte.

In de dashboardlaag ontstaat dezelfde drift door één gedeelde blokgrammatica. Dat model is nuttig voor discipline, maar onvoldoende voor differentiatie. Als elk non-core product dezelfde reeks summarycards, managementblokken, profielkaart, hoofdvraag, volgende stap en follow-through krijgt, dan verschilt vooral de copy en niet de managementarchitectuur.

## Waar visual weight niet klopt met productrol

Onboarding oogt nu te snel als mini-peer-report. Dat komt niet doordat het product te zwaar claimt, maar doordat de combinatie van highlight-cards, boardroom-cards, signaalpagina en formele methodieklaag te veel op een verkleinde core-route lijkt. Voor een bounded checkpointread is dat te veel shell en te weinig lifecycle-specifieke focus.

Leadership heeft een nog scherper visual-weightprobleem. De inhoud is bounded, maar de vorm suggereert sneller een verborgen peer-product. Voor een bounded support-route is een volle executive shell met meerdere managementcards, factoranalyse en formele vervolglaag te zwaar. Leadership moet compacter, rustiger en ondersteunender lezen dan Onboarding.

Pulse is momenteel het best beschermd omdat de PDF-route bewust `422` blijft en de output dashboard-first is. Het risico zit hier vooruit: als Pulse later een openingslaag of PDF krijgt via dezelfde non-core shell, dan schuift het product visueel te snel op naar quasi-peer of mini-RetentieScan. Dat moet vooraf worden geblokkeerd.

## Wat wel gedeeld moet blijven

Gedeeld moeten blijven: shared executive rails. Dat betekent een herkenbare lijn van managementread naar eerste vraag, eerste eigenaar, eerste stap en reviewmoment. Die rails helpen over de suite heen om managementoverdracht vergelijkbaar en professioneel te houden.

Gedeeld moeten blijven: shared quality discipline. Drempels, privacygrenzen, bounded claims, suppressionregels, methodische voorzichtigheid en scheiding tussen hoofdread en technische nuance moeten niet per product opnieuw worden uitgevonden.

Gedeeld moeten blijven: shared visual tokens. Ritme, spacing, typografiehiërarchie, rust in surfaces, chartdiscipline en nette appendix-/methodiekafbakening mogen suitebreed gelijk blijven. Die laag gaat over volwassenheid en leesdiscipline, niet over productspecifieke waarheid.

Niet gedeeld moeten worden: signaallabels, primaire managementvraag, openingsvolgorde, blokzwaarte en de mate waarin een route als peer-grade, bounded peer-grade of bounded support-grade leest.

## Wat expliciet productspecifiek moet worden

Onboarding moet expliciet productspecifiek blijven in taal en architectuur. Termen die per direct uit de actieve Onboarding-laag moeten verdwijnen of herschreven moeten worden zijn: `retentievoorspeller`, `retentie-uitkomst` en `brede retentieclaim`. Die moeten worden vervangen door onboarding-eigen grensentaal zoals `geen uitkomstmodel voor latere landing`, `geen volledige journey-read` en `geen cohort- of trendclaim`.

Leadership moet expliciet productspecifiek blijven als managementcontext-route. Daar is minder directe opschoning nodig in actieve runtimecopy, maar de blokkeringslijst moet expliciet worden gemaakt: `RetentieScan`, `retentiesignaal`, `frictiesignaal`, `vertrekbeeld`, named-leader-framing, 360-framing en performanceframing horen niet in de productheadline of signaallaag thuis. Leadership moet openen vanuit managementcontext, niet vanuit een generieke signaal- of parityshell.

Pulse moet expliciet productspecifiek blijven als compacte reviewroute. Het product mag geen reporttaal, geen quasi-peer openingsboog en geen bredere interventie-architectuur erven. Pulse moet daarom expliciet gekoppeld blijven aan `reviewroute`, `bounded hercheck`, `vorige vergelijkbare Pulse` en `repeat motion`, en niet aan volledige rapportfamilies.

## Voorstel voor Onboarding-shell

De Onboarding-shell moet lezen als bounded peer-grade product. Dat betekent: rustige checkpointopening, compacte read-quality, lifecycle-specifieke checkpoint-handoff, een beperkte laag met vroege landingsfrictie of borgsignalen, en daarna direct een kleine correctie- of borgroute. Het product mag managementwaardig zijn, maar niet aanvoelen als een kleine ExitScan of RetentieScan.

De kernblokken voor Onboarding moeten zijn: checkpointcontext, checkpoint-handoff, vroege landingsvraag, eerste borg- of correctiespoor, eigenaar, en volgend checkpoint als reviewgrens. Factoren blijven ondersteunend. Zij mogen niet de shell dicteren.

Visueel moet Onboarding rustiger en meer lifecycle-specifiek lezen: minder executive card-gewicht, minder formele analytische massa, minder volle signaalpagina en meer nadruk op checkpoint, landing en begrensde vervolgactie. Onboarding moet bounded peer-grade voelen: serieus, maar niet zwaar.

## Voorstel voor Leadership-shell

De Leadership-shell moet lezen als bounded support-route. Dat betekent: compacte managementcontext-opening, één duidelijke management-handoff, beperkte contextduiding, eerste managementcorrectie of verificatie, eigenaar en reviewgrens. Alles wat lijkt op een volledige peer-shell moet hier worden teruggedrongen.

Leadership moet niet openen als rapport over het signaal zelf, maar als rapport over de managementcontext rond een al zichtbaar signaal. Daarmee verschuift de architectuur van signaal-naar-factor-naar-actie naar context-naar-duiding-naar-correctie. Dat is een wezenlijk ander ritme dan Onboarding en zeker anders dan Exit/Retentie.

Visueel moet Leadership compacter, stiller en minder analytisch luid worden. Minder kaartdichtheid, minder quasi-boardroommassa en minder volwaardige insight-shell. Leadership moet voelen als een specialistische support-read die helpt kiezen waar managementcontext eerst moet worden gecorrigeerd of geverifieerd, niet als verborgen peer-product.

## Voorstel voor Pulse-shell

De Pulse-shell moet dashboard-first blijven. De managementwaarheid van Pulse zit in de campaign page: actuele snapshot, primair reviewspoor, kleine correctie, eigenaar en bounded hercheck. Dat is de canonlaag; niet een ontbrekende PDF.

Als later een formele openingslaag of deelbaar artefact nodig is, moet die Pulse niet in een report-shell duwen. De enige toelaatbare vorm is een compacte review-opening: momentopname nu, wat vraagt directe aandacht, welke kleine stap volgt nu, wanneer hercheck je. Geen volledige executive cover, geen zware factorarchitectuur en geen quasi-peer methodieklaag.

Pulse moet daardoor expliciet compact blijven in visual weight: weinig blokken, hoge scanbaarheid, sterke reviewvolgorde en geen suggestie dat dit product een volledige managementrapportage vervangt. Pulse is een bounded reviewroute en moet ook zo blijven ogen.

## Grootste risico’s als dit niet wordt gecorrigeerd

Het eerste risico is methodische vervaging. Als bounded routes dezelfde shell blijven erven als zwaardere routes, dan wordt de begrenzing inhoudelijk wel gezegd maar visueel tegengesproken. Dat ondermijnt vertrouwen en maakt productgrenzen diffuser.

Het tweede risico is portfoliovervaging. Onboarding kan dan te veel als mini-peer-product gaan lezen, Leadership als verborgen peer-product, en Pulse als embryonale reportroute. Dan vervagen bounded peer-zwaarte, bounded support-zwaarte en compacte review-zwaarte precies daar waar het portfolio ze nodig heeft.

Het derde risico is toekomstige driftversnelling. Zolang de non-core producten één gedeelde shell en één parityreflex houden, zullen latere verbeteringen automatisch weer richting meer uniformiteit bewegen. Dan wordt elk goedbedoeld kwaliteitssignaal opnieuw een route naar verkeerde gelijkheid.

## Minimale normalisatiestappen

Stap één is canonisch, niet visueel: leg een aparte non-core canonlaag vast die boven de productimplementaties hangt. Die laag definieert wat gedeeld blijft en wat niet langer generiek mag zijn: executive rails wel, productspecifieke managementarchitectuur niet.

Stap twee is taalsanering: verwijder Onboarding-boundarytaal die nog via retentie-negaties wordt gedefinieerd, en leg voor Leadership en Pulse een expliciete blocklist vast tegen core-kernwoorden en quasi-peer- of quasi-diagnostische taal.

Stap drie is shellsanering: vervang in de report-engine de generieke non-core rebrand-shell door productspecifieke non-core shells voor Onboarding en Leadership. Niet volledig nieuw design, wel verschillende openingslogica, blokzwaarte en paginaritmes per productrol.

Stap vier is dashboardsanering: behoud één gedeelde kwaliteitscontractlaag voor dashboarddata, maar maak de blokgrammatica minder uniform. Onboarding, Leadership en Pulse mogen niet langer automatisch hetzelfde ritme erven van summarycards, managementblokken en follow-through.

Stap vijf is governance: maak de nieuwe non-core canonlaag leidend voor alle latere wijzigingen aan dashboard, preview en formele output voor deze drie producten. Zonder die canonlaag blijft elke verbetering opnieuw parity boven differentiatie zetten.

## Aanbevolen volgende stap

De aanbevolen volgende stap is een compacte non-core canon/spec opstellen en vastzetten als leidende governancelaag. Die spec moet drie dingen tegelijk doen: shared executive rails vastleggen, anti-template-leakage regels expliciet maken, en per product een eigen shellcontract beschrijven voor dashboard, preview en formele output.

Pas daarna moet gerichte uitvoering openen. De eerste implementatiewave hoort dan niet breed te redesignen, maar alleen drie dingen te doen: Onboarding-taalsanering, Leadership-shell-ontlasting en een harde Pulse-guardrail tegen report-shell-overerving.
