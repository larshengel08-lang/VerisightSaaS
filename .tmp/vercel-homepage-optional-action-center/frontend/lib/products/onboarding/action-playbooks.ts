import type { ActionPlaybook } from '@/lib/products/shared/types'

export const ONBOARDING_ACTION_PLAYBOOKS: Record<string, Record<string, ActionPlaybook>> = {
  leadership: {
    HOOG: {
      title: 'Leiding en steun vragen snelle aanscherping',
      decision: 'Beslis waar nieuwe medewerkers in deze fase nu direct meer richting, bereikbaarheid of steun nodig hebben.',
      validate: 'Toets of de frictie vooral zit in prioritering, opvolging of beschikbaarheid van leiding.',
      owner: 'HR met betrokken leidinggevende',
      actions: [
        'Plan binnen 2 weken een gerichte check op verwachtingen, support en escalatieroutes voor deze instroomgroep.',
        'Leg 1 concrete correctie vast in feedbackritme of begeleidingsmomenten.',
      ],
      caution: 'Maak dit nog geen breed leiderschapstraject; deze wave vraagt eerst een checkpoint-correctie.',
      review: 'Bekijk op het volgende checkpoint of de gekozen steunmaatregel zichtbaar effect had.',
    },
    MIDDEN: {
      title: 'Leiding blijft een actief checkpoint',
      decision: 'Kies of dit nu al een kleine correctie vraagt of eerst extra verificatie in gesprekken.',
      validate: 'Controleer of nieuwe medewerkers vooral richting of sneller contact missen.',
      owner: 'HR business partner',
      actions: [
        'Maak leidinggevende check-ins explicieter voor deze instroomgroep.',
        'Leg vast welke vraag op het volgende checkpoint terug moet komen.',
      ],
      caution: 'Laat een middensignaal niet vanzelf uitgroeien tot een brede leiderschapsclaim.',
      review: 'Gebruik een volgend checkpoint alleen als bounded vervolg nadat de check-in en begeleidingsafspraken expliciet zijn belegd.',
    },
    LAAG: {
      title: 'Leiding werkt hier al als borgspoor',
      decision: 'Beslis wat in richting, bereikbaarheid of steun nu expliciet behouden moet blijven voor de volgende instroomgroep.',
      validate: 'Toets welke leidinggevende handeling nieuwe medewerkers nu het meest helpt om goed te landen.',
      owner: 'HR + onboarding-owner',
      actions: [
        'Leg de werkende check-in of begeleidingsroutine expliciet vast als borgactie voor de volgende instroomgroep.',
        'Bevestig met de leidinggevende welke steun zichtbaar hetzelfde moet blijven tot het volgende checkpoint.',
      ],
      caution: 'Gebruik een stabiel signaal niet als excuus om begeleiding onzichtbaar te maken; borg juist wat nu werkt.',
      review: 'Toets op het volgende checkpoint of dezelfde leiding- en steunstructuur nog steeds als stabiel wordt ervaren.',
    },
  },
  culture: {
    HOOG: {
      title: 'Inbedding en veiligheid vragen een vroege check',
      decision: 'Beslis waar bespreekbaarheid of teaminbedding voor nieuwe medewerkers nu eerst versterkt moet worden.',
      validate: 'Toets of vragen, fouten of onzekerheid in deze fase te weinig ruimte krijgen.',
      owner: 'HR lead met teamlead',
      actions: [
        'Plan een korte teamcheck op inbedding en bespreekbaarheid.',
        'Maak 1 zichtbaar gedrags- of ritmebesluit voor de eerstvolgende weken.',
      ],
      caution: 'Ga niet direct naar een brede cultuurinterventie zonder eerst de vroege teamcontext te toetsen.',
      review: 'Gebruik het volgende checkpoint om te toetsen of de gekozen inbeddingsactie merkbaar verschil maakt.',
    },
    MIDDEN: {
      title: 'Inbedding blijft een aandachtsspoor',
      decision: 'Kies welk team of welke samenwerkingscontext als eerste verificatie verdient.',
      validate: 'Onderzoek of dit vooral teamdynamiek of algemene werkcontext raakt.',
      owner: 'HR lead',
      actions: [
        'Neem het signaal mee in het eerstvolgende team- of onboardinggesprek.',
        'Bepaal welke vraag in de komende fase opnieuw bekeken moet worden.',
      ],
      caution: 'Gebruik onboarding hier voor vroege correctie, niet voor brede cultuurdiagnose.',
      review: 'Gebruik een volgend checkpoint alleen als bounded vervolg nadat de eerste contextcheck expliciet is gedaan.',
    },
    LAAG: {
      title: 'Inbedding werkt nu als stabiele basis',
      decision: 'Beslis welke team- of samenwerkingsroutine nu bewust behouden moet blijven voor nieuwe medewerkers.',
      validate: 'Toets welke vorm van inbedding of veiligheid de huidige stabiele landing het meest ondersteunt.',
      owner: 'HR lead met teamlead',
      actions: [
        'Bevestig welke bestaande teamroutine of onboardingritme nu zichtbaar bijdraagt aan een stabiele start.',
        'Leg 1 borgactie vast zodat deze inbedding ook voor de volgende instroomgroep overeind blijft.',
      ],
      caution: 'Laat een stabiel checkpoint niet verdwijnen in algemeen optimisme; benoem expliciet wat behouden moet blijven.',
      review: 'Toets op het volgende checkpoint of dezelfde teamcontext nog steeds als veilig en helpend wordt ervaren.',
    },
  },
  growth: {
    HOOG: {
      title: 'Leren en perspectief vragen een zichtbare stap',
      decision: 'Beslis waar nieuwe medewerkers nu het duidelijkst meer leerruimte of perspectief nodig hebben.',
      validate: 'Toets of het vooral gaat om begeleiding, oefenruimte of zicht op succes in de rol.',
      owner: 'HR development-owner',
      actions: [
        'Maak binnen 30 dagen een concrete begeleidings- of leerstap zichtbaar.',
        'Beleg wie het eerstvolgende ontwikkelgesprek voert.',
      ],
      caution: 'Beloof geen route die in de praktijk niet waar te maken is; houd de correctie klein en zichtbaar.',
      review: 'Gebruik het volgende checkpoint om te toetsen of de extra begeleiding of ontwikkelstap merkbaar is geland.',
    },
    MIDDEN: {
      title: 'Groei blijft een vroeg monitoringspunt',
      decision: 'Kies of meer begeleiding of meer perspectief nu de logische eerste correctie is.',
      validate: 'Controleer waar instroom het minst zicht heeft op goed landen in de rol.',
      owner: 'HR development-owner',
      actions: [
        'Voeg een korte leervraag toe aan het eerstvolgende onboardingmoment.',
        'Leg vast wat op het volgende checkpoint beter merkbaar moet zijn.',
      ],
      caution: 'Laat dit niet hangen in alleen communicatie als feitelijke ondersteuning ontbreekt.',
      review: 'Gebruik een volgend checkpoint alleen als bounded vervolg nadat de leer- of begeleidingsactie zichtbaar is belegd.',
    },
    LAAG: {
      title: 'Ontwikkelruimte werkt nu als borgspoor',
      decision: 'Beslis welke vorm van begeleiding of perspectief nu expliciet behouden moet blijven voor nieuwe medewerkers.',
      validate: 'Toets welke ontwikkel- of begeleidingsstap het meest bijdraagt aan de huidige stabiele landing.',
      owner: 'HR development-owner',
      actions: [
        'Leg vast welke begeleidingsroutine of leerstap nu zichtbaar werkt en herhaal die bewust voor de volgende instroomgroep.',
        'Bevestig wie deze stabiele ontwikkelervaring bewaakt tot het volgende checkpoint.',
      ],
      caution: 'Gebruik een stabiel groeisignaal niet om ondersteuning te vroeg af te bouwen.',
      review: 'Toets op het volgende checkpoint of dezelfde ontwikkelruimte nog steeds als helpend wordt ervaren.',
    },
  },
  compensation: {
    HOOG: {
      title: 'Praktische voorwaarden vragen snelle verduidelijking',
      decision: 'Beslis of dit checkpoint nu vooral wijst op onduidelijke afspraken of praktische startfrictie.',
      validate: 'Toets welke afspraak, ondersteuning of uitleg het eerst moet worden rechtgezet.',
      owner: 'HR lead',
      actions: [
        'Doe een gerichte check op de meest voorkomende praktische startfrictie.',
        'Kies 1 communicatie- of voorwaardenactie die binnen 30 dagen helder moet zijn.',
      ],
      caution: 'Gebruik onboarding niet om meteen brede arbeidsvoorwaardenclaims te doen zonder extra toetsing.',
      review: 'Gebruik het volgende checkpoint om te toetsen of de verduidelijking of praktische correctie merkbaar is geland.',
    },
    MIDDEN: {
      title: 'Voorwaarden blijven op de radar',
      decision: 'Kies of extra uitleg nu al genoeg is of dat een inhoudelijke check nodig blijft.',
      validate: 'Controleer of het signaal breed speelt of aan een specifieke startfrictie hangt.',
      owner: 'HR lead',
      actions: [
        'Verhelder de huidige afspraken of ondersteuning gericht voor deze instroomgroep.',
        'Leg vast welke vraag op het volgende checkpoint terug moet komen.',
      ],
      caution: 'Communicatie helpt alleen als de onderliggende startervaring ook klopt.',
      review: 'Gebruik een volgend checkpoint alleen als bounded vervolg nadat de eerste verduidelijking aantoonbaar is opgepakt.',
    },
    LAAG: {
      title: 'Startvoorwaarden zijn nu een borglaag',
      decision: 'Beslis welke praktische afspraak of ondersteuning nu expliciet behouden moet blijven voor een stabiele start.',
      validate: 'Toets welke afspraak of ondersteuning nieuwe medewerkers nu het meest helpt om zonder frictie te landen.',
      owner: 'HR lead',
      actions: [
        'Leg de werkende startafspraak of ondersteuning expliciet vast als standaard voor de volgende instroomgroep.',
        'Bevestig welke praktische duidelijkheid tot het volgende checkpoint onveranderd zichtbaar moet blijven.',
      ],
      caution: 'Laat stabiele voorwaarden niet onzichtbaar worden; benoem wat nu werkt zodat het niet stilletjes afbrokkelt.',
      review: 'Toets op het volgende checkpoint of dezelfde praktische basis nog steeds als duidelijk en helpend wordt ervaren.',
    },
  },
  workload: {
    HOOG: {
      title: 'Eerste werkdruk vraagt snelle ontlasting',
      decision: 'Beslis welke informatie- of werkdrukbron in deze fase nu direct omlaag moet.',
      validate: 'Toets of het om te veel informatie, te hoge verwachtingen of te weinig herstelruimte gaat.',
      owner: 'Leidinggevende met HR',
      actions: [
        'Voer binnen 2 weken een korte review uit op tempo, verwachtingen en prioriteiten voor deze instroomgroep.',
        'Schrap of herprioriteer minimaal 1 concrete drukbron.',
      ],
      caution: 'Noem dit niet alleen een perceptiesignaal als nieuwe medewerkers feitelijk geen ruimte ervaren om te landen.',
      review: 'Toets op het volgende checkpoint of de gekozen ontlasting echt merkbaar was.',
    },
    MIDDEN: {
      title: 'Werkdruk moet actief gevolgd blijven',
      decision: 'Kies of dit nu een kleine teamcorrectie of alleen scherpere prioritering vraagt.',
      validate: 'Controleer waar overload ontstaat in informatie, taakdruk of verwachtingen.',
      owner: 'Leidinggevende met HR business partner',
      actions: [
        'Maak werkdruk expliciet onderwerp van het eerstvolgende onboardinggesprek.',
        'Kies 1 beperkte correctie in tempo of prioriteit.',
      ],
      caution: 'Middensignalen op werkdruk lopen snel op als er geen zichtbare correctie volgt.',
      review: 'Gebruik een volgend checkpoint alleen als bounded vervolg nadat prioritering of tempo daadwerkelijk is aangepast.',
    },
    LAAG: {
      title: 'Werkdruk blijft nu beheersbaar',
      decision: 'Beslis welke keuze in tempo, prioritering of herstelruimte expliciet behouden moet blijven.',
      validate: 'Toets welke werkafspraak of prioritering de huidige stabiele landing het sterkst ondersteunt.',
      owner: 'Leidinggevende met HR business partner',
      actions: [
        'Leg vast welke werkdruk- of prioriteringskeuze nu zichtbaar helpt om nieuwe medewerkers beheersbaar te laten landen.',
        'Bevestig met leiding en HR welke drukbron bewust laag moet blijven tot het volgende checkpoint.',
      ],
      caution: 'Laat een stabiel werkdrukbeeld niet automatisch los; borg wat nu echt helpt voordat nieuwe druk oploopt.',
      review: 'Toets op het volgende checkpoint of dezelfde werkdrukbeheersing nog steeds als helpend wordt ervaren.',
    },
  },
  role_clarity: {
    HOOG: {
      title: 'Rolhelderheid vraagt directe explicitering',
      decision: 'Beslis welke prioriteiten, verantwoordelijkheden of succescriteria nu direct duidelijker moeten worden.',
      validate: 'Toets waar nieuwe medewerkers tegenstrijdige uitleg of verwachtingen ervaren.',
      owner: 'Leidinggevende met HR business partner',
      actions: [
        'Maak binnen 30 dagen prioriteiten en succescriteria expliciet voor deze instroomgroep.',
        'Leg vast wie escalatie of besluitvorming sneller moet stroomlijnen.',
      ],
      caution: 'Los dit niet alleen op papier op; de dagelijkse aansturing moet voelbaar duidelijker worden.',
      review: 'Toets op het volgende checkpoint of de extra rolduidelijkheid ook daadwerkelijk merkbaar is voor nieuwe medewerkers.',
    },
    MIDDEN: {
      title: 'Rolhelderheid blijft een actief checkpoint',
      decision: 'Kies welk deel nu eerst scherper moet: prioriteiten, eigenaarschap of succesverwachting.',
      validate: 'Onderzoek waar verwachtingen nog diffuus of tegenstrijdig zijn.',
      owner: 'Leidinggevende',
      actions: [
        'Gebruik het volgende team- of onboardingmoment om verwachtingen te verduidelijken.',
        'Bepaal welke vraag op het volgende checkpoint terug moet komen.',
      ],
      caution: 'Zonder expliciete opvolging blijft dit snel een terugkerende vroege frictie.',
      review: 'Gebruik een volgend checkpoint alleen als bounded vervolg nadat de explicitering zichtbaar is gedaan.',
    },
    LAAG: {
      title: 'Rolhelderheid is nu een borgspoor',
      decision: 'Beslis welke vorm van rolduidelijkheid of verwachtingsmanagement expliciet behouden moet blijven.',
      validate: 'Toets welke prioriteit, roluitleg of succesverwachting nu het meest helpt om deze stabiele landing vast te houden.',
      owner: 'Leidinggevende met HR business partner',
      actions: [
        'Leg de werkende rol- of prioriteringsuitleg expliciet vast voor de volgende instroomgroep.',
        'Bevestig wie bewaakt dat deze rolduidelijkheid zichtbaar hetzelfde blijft tot het volgende checkpoint.',
      ],
      caution: 'Gebruik stabiele rolhelderheid niet als reden om onboarding losser te maken; borg wat nu werkt.',
      review: 'Toets op het volgende checkpoint of dezelfde rolduidelijkheid nog steeds als stabiel en helpend wordt ervaren.',
    },
  },
}
