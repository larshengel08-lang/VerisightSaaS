import type { ActionPlaybook } from '@/lib/products/shared/types'

export const LEADERSHIP_ACTION_PLAYBOOKS: Record<string, Record<string, ActionPlaybook>> = {
  leadership: {
    HOOG: {
      title: 'Leidingcontext vraagt directe managementduiding',
      decision: 'Beslis welke managementcontext nu als eerste een korte verificatie of correctie vraagt.',
      validate: 'Toets waar richting, beschikbaarheid, prioritering of escalatie in de huidige aansturing het meest schuurt.',
      owner: 'HR lead met verantwoordelijke MT-sponsor',
      actions: [
        'Plan binnen 2 weken een korte managementhuddle over richting, prioriteiten en escalatie.',
        'Leg 1 zichtbare correctie vast voor de komende 30 dagen.',
      ],
      caution: 'Gebruik dit nog niet als named leader claim of individuele beoordeling.',
      review: 'Doe binnen 30-45 dagen een bounded hercheck of deze managementcontext merkbaar werkbaarder is geworden.',
    },
    MIDDEN: {
      title: 'Leidingcontext is een actief aandachtspunt',
      decision: 'Kies of dit nu een korte managementcheck vraagt of eerst een gerichte verificatie in gesprekken.',
      validate: 'Controleer of het signaal vooral gaat over richting, consistentie of bespreekbaarheid in de aansturing.',
      owner: 'HR lead',
      actions: [
        'Maak het eerstvolgende managementgesprek expliciet over richting, prioritering en escalatie.',
        'Leg 1 observatie vast die in de volgende review moet terugkomen.',
      ],
      caution: 'Laat een middensignaal niet automatisch uitgroeien tot een brede leiderschapsclaim.',
      review: 'Lees dit spoor opnieuw zodra de eerste managementcheck is gedaan of een volgende responsegroep compleet is.',
    },
    LAAG: {
      title: 'Stabiele leidingcontext vraagt borging',
      decision: 'Beslis wat in de huidige aansturing expliciet behouden moet blijven zodat dit stabiele managementbeeld niet toevallig blijft.',
      validate: 'Toets welke managementroutine, beschikbaarheid of duidelijkheid nu juist werkt en bewust geborgd moet worden.',
      owner: 'HR lead met MT-sponsor',
      actions: [
        'Leg vast welke managementroutine of werkafspraak nu expliciet behouden moet blijven.',
        'Gebruik de volgende review om te toetsen of dit stabiele beeld overeind blijft.',
      ],
      caution: 'Lees een laag signaal niet als bewijs van leiderschapskwaliteit of reden om managementreflectie over te slaan.',
      review: 'Gebruik een volgende check alleen als bounded bevestiging dat deze stabiele managementcontext overeind blijft.',
    },
  },
  role_clarity: {
    HOOG: {
      title: 'Prioriteiten en rolgrenzen vragen snelle explicitering',
      decision: 'Beslis welke managementcontext nu direct prioriteiten, besluitvorming of rolgrenzen moet verduidelijken.',
      validate: 'Toets waar tegenstrijdige opdrachten of onduidelijke verwachtingen het meeste frictie geven.',
      owner: 'MT-sponsor met HR business partner',
      actions: [
        'Maak binnen 30 dagen prioriteiten en eigenaarschap expliciet voor de betrokken context.',
        'Leg vast wie dit managementspoor blijft bewaken.',
      ],
      caution: 'Los dit niet alleen op papier op; de dagelijkse aansturing moet merkbaar duidelijker worden.',
      review: 'Plan een hercheck of de belangrijkste onduidelijkheid ook echt kleiner is geworden.',
    },
    MIDDEN: {
      title: 'Rolhelderheid blijft een managementreviewpunt',
      decision: 'Kies welk deel nu eerst scherper moet: prioriteiten, besluitvorming of eigenaarschap.',
      validate: 'Onderzoek waar verwachtingen diffuus of tegenstrijdig blijven in de huidige aansturing.',
      owner: 'MT-sponsor',
      actions: [
        'Gebruik het volgende managementmoment om verwachtingen en prioriteiten te verduidelijken.',
        'Bepaal welke vraag in de volgende review terug moet komen.',
      ],
      caution: 'Zonder expliciete opvolging blijft dit een terugkerend managementsignaal.',
      review: 'Toets in de volgende review of de belangrijkste onduidelijkheid kleiner is geworden.',
    },
    LAAG: {
      title: 'Rolhelderheid oogt stabiel maar vraagt borging',
      decision: 'Beslis welke duidelijkheid in prioriteiten of eigenaarschap bewust behouden moet blijven.',
      validate: 'Controleer welke managementafspraken nu juist voor helderheid zorgen en expliciet geborgd moeten worden.',
      owner: 'MT-sponsor',
      actions: [
        'Bevestig welke prioriteiten of eigenaarschapsafspraken nu zichtbaar werken.',
        'Toets in de volgende review of dezelfde duidelijkheid overeind is gebleven.',
      ],
      caution: 'Gebruik dit niet als excuus om rolverwarring elders impliciet te laten groeien.',
      review: 'Houd de volgende check klein en gericht op behoud van de huidige duidelijkheid.',
    },
  },
  culture: {
    HOOG: {
      title: 'Bespreekbaarheid vraagt snelle managementcheck',
      decision: 'Beslis welke managementcontext nu eerst openheid, veiligheid of escalatie moet versterken.',
      validate: 'Toets waar zorgen of lastige signalen te laat of te onveilig bespreekbaar worden.',
      owner: 'HR lead met MT-sponsor',
      actions: [
        'Plan een korte managementreview op bespreekbaarheid en escalatie.',
        'Leg vast welk gedrag of ritme direct anders moet om eerdere signalering mogelijk te maken.',
      ],
      caution: 'Ga niet direct naar een brede cultuurinterventie zonder managementbevestiging.',
      review: 'Plan binnen 30-45 dagen een bounded hercheck op dezelfde context.',
    },
    MIDDEN: {
      title: 'Cultuur is een management-contextsignaal',
      decision: 'Kies welke managementcontext als eerste duiding verdient.',
      validate: 'Onderzoek of dit vooral gaat om bespreekbaarheid, samenwerkingsritme of beslisgedrag.',
      owner: 'HR lead',
      actions: [
        'Neem het signaal mee in het eerstvolgende managementgesprek.',
        'Bepaal welke contextvraag in de komende maand opnieuw moet worden gesteld.',
      ],
      caution: 'Gebruik Leadership Scan hier voor managementduiding, niet voor brede cultuurdiagnose.',
      review: 'Toets in de volgende check of het gesprek ook echt nieuwe duidelijkheid opleverde.',
    },
    LAAG: {
      title: 'Bespreekbaarheid oogt werkbaar',
      decision: 'Beslis welke managementcontext openheid nu juist ondersteunt en bewust behouden moet blijven.',
      validate: 'Controleer welke managementroutines of gedragingen bespreekbaarheid nu geloofwaardig maken.',
      owner: 'HR lead',
      actions: [
        'Benoem expliciet welk bespreekritme of escalatiegedrag nu werkt.',
        'Gebruik de volgende review om te toetsen of deze openheid overeind blijft.',
      ],
      caution: 'Een stabiel cultuursignaal betekent niet dat bredere cultuurvragen al volledig zijn opgelost.',
      review: 'Houd de vervolgcheck klein en gericht op behoud van dezelfde werkbare context.',
    },
  },
  growth: {
    HOOG: {
      title: 'Ontwikkelruimte vraagt een zichtbare managementstap',
      decision: 'Beslis welke managementcontext nu eerst perspectief of begeleiding moet teruggeven.',
      validate: 'Toets of medewerkers vooral meer perspectief, coaching of feitelijke ruimte missen.',
      owner: 'HR development-owner met MT-sponsor',
      actions: [
        'Maak binnen 30 dagen een concrete vervolg- of coachingsstap zichtbaar.',
        'Beleg wie dit managementspoor trekt.',
      ],
      caution: 'Beloof geen route die in de huidige managementcontext niet waargemaakt kan worden.',
      review: 'Kijk binnen 30-45 dagen opnieuw of dit groeisignaal minder scherp is.',
    },
    MIDDEN: {
      title: 'Ontwikkelruimte blijft een managementmonitoringpunt',
      decision: 'Kies of meer zicht of meer gesprek nu de logische eerste correctie is.',
      validate: 'Controleer waar perspectief het minst concreet of bespreekbaar voelt.',
      owner: 'HR development-owner',
      actions: [
        'Voeg een korte ontwikkelcheck toe aan de eerstvolgende managementgesprekken.',
        'Leg vast wat zichtbaar beter moet zijn bij de volgende check.',
      ],
      caution: 'Laat dit niet hangen in alleen communicatie als de managementroute leeg blijft.',
      review: 'Lees dit spoor opnieuw na de eerste zichtbare vervolgstap.',
    },
    LAAG: {
      title: 'Ontwikkelruimte oogt werkbaar',
      decision: 'Beslis welke vorm van perspectief of begeleiding nu expliciet behouden moet blijven.',
      validate: 'Controleer welke managementcontext ontwikkelruimte nu juist geloofwaardig en zichtbaar maakt.',
      owner: 'HR development-owner',
      actions: [
        'Leg vast welke vorm van perspectief of begeleiding nu duidelijk werkt.',
        'Gebruik de volgende review om te toetsen of dit spoor zichtbaar overeind blijft.',
      ],
      caution: 'Gebruik een laag signaal niet als bewijs dat verdere ontwikkelvragen nergens meer spelen.',
      review: 'Beperk de vervolgcheck tot behoud van de huidige werkbare ontwikkelcontext.',
    },
  },
}
