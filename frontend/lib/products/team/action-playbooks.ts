import type { ActionPlaybook } from '@/lib/products/shared/types'

export const TEAM_ACTION_PLAYBOOKS: Record<string, Record<string, ActionPlaybook>> = {
  leadership: {
    HOOG: {
      title: 'Lokale leidingcontext vraagt directe verificatie',
      decision: 'Beslis welke afdeling nu eerst een lokale check op richting, steun of escalatie vraagt.',
      validate: 'Toets waar medewerkers vooral richting, beschikbaarheid of steun missen in hun directe werkcontext.',
      owner: 'HR business partner met verantwoordelijke afdelingsleider',
      actions: [
        'Plan binnen 2 weken een kort afdelingsgesprek over richting, steun en escalatie.',
        'Leg 1 concrete lokale correctie vast voor de komende 30 dagen.',
      ],
      caution: 'Maak dit nog geen brede leiderschapsclaim; TeamScan vraagt eerst lokale verificatie.',
      review: 'Doe binnen 30-45 dagen een lokale hercheck of dit afdelingsspoor echt rustiger is geworden.',
    },
    MIDDEN: {
      title: 'Leidingcontext is lokaal een actief aandachtspunt',
      decision: 'Kies of dit nu een korte afdelingscheck vraagt of nog een beperkte verificatie in gesprekken.',
      validate: 'Controleer of het signaal zich echt concentreert in een paar afdelingen.',
      owner: 'HR business partner',
      actions: [
        'Maak lokale check-ins en opvolging voor de betrokken afdeling explicieter.',
        'Koppel het signaal aan 1 lokale observatie die in de volgende review wordt getoetst.',
      ],
      caution: 'Laat een middensignaal niet automatisch uitgroeien tot een brede managementclaim.',
      review: 'Lees dit spoor opnieuw zodra de lokale check is gedaan of de eerstvolgende responsegroep compleet is.',
    },
  },
  culture: {
    HOOG: {
      title: 'Teamveiligheid vraagt snelle lokale check',
      decision: 'Beslis welke afdeling nu eerst expliciet op veiligheid en samenwerking moet worden getoetst.',
      validate: 'Toets waar zorgen of frictie in de directe werkcontext te laat of te onveilig bespreekbaar worden.',
      owner: 'HR lead met afdelingsverantwoordelijke',
      actions: [
        'Plan een korte afdelingsreview op veiligheid en samenwerking.',
        'Leg vast welk gedrag of ritme direct anders moet om eerdere bespreekbaarheid mogelijk te maken.',
      ],
      caution: 'Ga niet direct naar een brede cultuurinterventie zonder lokale bevestiging.',
      review: 'Plan binnen 30-45 dagen een hercheck op dezelfde lokale context.',
    },
    MIDDEN: {
      title: 'Cultuur is lokaal een verificatiespoor',
      decision: 'Kies welke afdeling of context als eerste lokale verificatie verdient.',
      validate: 'Onderzoek of dit vooral teamdynamiek, veiligheid of samenwerkingsritme raakt.',
      owner: 'HR lead',
      actions: [
        'Neem het signaal mee in het eerstvolgende afdelings- of teamgesprek.',
        'Bepaal welke lokale vraag in de komende maand opnieuw moet worden gesteld.',
      ],
      caution: 'Gebruik TeamScan hier voor lokalisatie, niet voor brede cultuurdiagnose.',
      review: 'Toets in de volgende lokale check of het gesprek ook echt nieuwe duidelijkheid opleverde.',
    },
  },
  growth: {
    HOOG: {
      title: 'Lokaal perspectief vraagt een zichtbare vervolgstap',
      decision: 'Beslis welke afdeling nu eerst zicht op ontwikkeling of perspectief moet terugkrijgen.',
      validate: 'Toets of medewerkers lokaal vooral meer perspectief, gesprek of feitelijke ruimte missen.',
      owner: 'HR development-owner met afdelingslead',
      actions: [
        'Maak binnen 30 dagen een concrete vervolgstap of perspectiefgesprek zichtbaar voor de betrokken afdeling.',
        'Beleg wie dit lokale spoor trekt.',
      ],
      caution: 'Beloof geen route die lokaal niet waargemaakt kan worden.',
      review: 'Kijk binnen 30-45 dagen opnieuw of dit lokale groeisignaal minder scherp is.',
    },
    MIDDEN: {
      title: 'Groei blijft lokaal een monitoringspunt',
      decision: 'Kies of lokaal meer zicht of meer gesprek nu de logische eerste correctie is.',
      validate: 'Controleer waar perspectief het minst concreet of bespreekbaar voelt.',
      owner: 'HR development-owner',
      actions: [
        'Voeg een korte perspectiefcheck toe aan de eerstvolgende afdelingsgesprekken.',
        'Leg vast wat lokaal zichtbaar beter moet zijn bij de volgende check.',
      ],
      caution: 'Laat dit niet hangen in alleen communicatie als de lokale route leeg blijft.',
      review: 'Lees dit spoor opnieuw na de eerste zichtbare vervolgstap.',
    },
  },
  compensation: {
    HOOG: {
      title: 'Beloning vraagt scherpe lokale afbakening',
      decision: 'Beslis of dit lokaal vooral een fairness-, voorwaarden- of uitlegbaarheidsspoor is.',
      validate: 'Toets waar voorwaarden of ervaren eerlijkheid nu het sterkst schuren in de directe werkcontext.',
      owner: 'HR lead',
      actions: [
        'Doe een gerichte check op de meest afwijkende afdeling of rolcontext.',
        'Kies 1 communicatie- of voorwaardenactie die binnen 30 dagen helder moet zijn.',
      ],
      caution: 'Gebruik TeamScan niet om meteen brede beloningsclaims te doen zonder extra toetsing.',
      review: 'Herlees dit signaal pas nadat de lokale check op fairness of voorwaarden is gedaan.',
    },
    MIDDEN: {
      title: 'Beloning blijft lokaal op de radar',
      decision: 'Kies of extra uitleg lokaal nu al genoeg is of dat inhoudelijke check nodig blijft.',
      validate: 'Controleer of het signaal vooral in een paar afdelingen of rolcontexten speelt.',
      owner: 'HR lead',
      actions: [
        'Verhelder de huidige beloningslogica gericht voor de betrokken afdeling.',
        'Leg vast welk lokaal signaal in een volgende review opnieuw bekeken wordt.',
      ],
      caution: 'Communicatie is alleen genoeg als de onderliggende voorwaarden ook lokaal geloofwaardig zijn.',
      review: 'Toets in de volgende lokale review of het signaal smaller of duidelijker is geworden.',
    },
  },
  workload: {
    HOOG: {
      title: 'Werkdruk vraagt directe lokale ontlasting',
      decision: 'Beslis welke afdeling nu direct drukbron, planning of prioritering moet verlichten.',
      validate: 'Toets of het om structurele overbelasting, piekdruk of gebrek aan herstel gaat.',
      owner: 'Afdelingsleider met HR en operations',
      actions: [
        'Voer binnen 2 weken een korte lokale werklastreview uit.',
        'Schrap of herprioriteer minimaal 1 concrete drukbron binnen 30 dagen.',
      ],
      caution: 'Noem dit niet alleen een perceptiesignaal als de afdeling feitelijk geen ruimte ervaart.',
      review: 'Plan binnen 30 dagen een lokale check of de ontlasting echt voelbaar was.',
    },
    MIDDEN: {
      title: 'Werkdruk moet lokaal gemonitord blijven',
      decision: 'Kies of dit nu een afdelingsreview of alleen scherpere prioritering vraagt.',
      validate: 'Controleer waar druk oploopt en of herstel lokaal nog voldoende lukt.',
      owner: 'Afdelingsleider met HR business partner',
      actions: [
        'Maak werkdruk expliciet onderwerp van het eerstvolgende afdelingsoverleg.',
        'Kies 1 beperkte correctie in planning of prioriteit.',
      ],
      caution: 'Middensignalen op werkdruk lopen snel op als lokaal geen zichtbare correctie volgt.',
      review: 'Kijk in de volgende lokale check of de druk weer terugvalt of juist opstapelt.',
    },
  },
  role_clarity: {
    HOOG: {
      title: 'Rolhelderheid vraagt snelle lokale explicitering',
      decision: 'Beslis welke afdeling nu direct prioriteiten, rolgrenzen of eigenaarschap moet verduidelijken.',
      validate: 'Toets waar tegenstrijdige opdrachten of rolgrenzen lokaal het meeste frictie geven.',
      owner: 'Afdelingsleider met HR business partner',
      actions: [
        'Maak binnen 30 dagen prioriteiten en rolgrenzen expliciet voor de betrokken afdeling.',
        'Leg vast wie escalatie of besluitvorming sneller moet stroomlijnen.',
      ],
      caution: 'Los dit niet alleen op papier op; de dagelijkse prioritering moet lokaal voelbaar duidelijker worden.',
      review: 'Plan een lokale hercheck of de rolverwarring ook echt kleiner is geworden.',
    },
    MIDDEN: {
      title: 'Rolhelderheid blijft lokaal een actief reviewpunt',
      decision: 'Kies welk deel nu eerst scherper moet: prioriteiten, eigenaarschap of besluitvorming.',
      validate: 'Onderzoek waar verwachtingen nog diffuus of tegenstrijdig zijn in de directe werkcontext.',
      owner: 'Afdelingsleider',
      actions: [
        'Gebruik het volgende afdelingsmoment om verwachtingen en prioriteiten te verduidelijken.',
        'Bepaal welke lokale vraag in de volgende review terug moet komen.',
      ],
      caution: 'Zonder expliciete opvolging blijft dit een terugkerend lokaal sluimerpunt.',
      review: 'Toets in de volgende lokale check of de belangrijkste onduidelijkheid kleiner is geworden.',
    },
  },
}
