import type { ActionPlaybook } from '@/lib/products/shared/types'

export const PULSE_ACTION_PLAYBOOKS: Record<string, Record<string, ActionPlaybook>> = {
  leadership: {
    HOOG: {
      title: 'Leiderschap vraagt directe review',
      decision: 'Beslis welke leidingcontext nu direct extra steun, feedbackritme of escalatie vraagt.',
      validate: 'Toets of medewerkers vooral richting, beschikbaarheid of autonomie-ondersteuning missen.',
      owner: 'HR business partner met betrokken leidinggevende',
      actions: [
        'Plan binnen 2 weken een korte review op feedback, richting en opvolging in de meest afwijkende teams.',
        'Leg 1 concreet gedrags- of ritmebesluit vast voor de komende 30 dagen.',
      ],
      caution: 'Maak dit nog geen breed leiderschapsprogramma; Pulse vraagt eerst gerichte review en correctie.',
      review: 'Doe binnen 30-45 dagen een korte hercheck of de gekozen correctie zichtbaar effect heeft.',
    },
    MIDDEN: {
      title: 'Leiderschap is een actief aandachtspunt',
      decision: 'Kies of dit nu een beperkte teamreview vraagt of nog een korte verificatie in gesprekken.',
      validate: 'Controleer of het signaal zich concentreert in een paar teams of leidingcontexten.',
      owner: 'HR business partner',
      actions: [
        'Maak leidinggevende check-ins en opvolging in de komende maand explicieter.',
        'Koppel het signaal aan 1 concrete observatie die in de volgende review wordt getoetst.',
      ],
      caution: 'Laat een middensignaal niet automatisch uitgroeien tot een generieke leiderschapsclaim.',
    },
  },
  culture: {
    HOOG: {
      title: 'Veiligheid en samenwerking vragen snelle check',
      decision: 'Beslis waar bespreekbaarheid of teamveiligheid nu eerst actief moet worden hersteld.',
      validate: 'Toets in welke teams zorgen of frictie te laat of te onveilig bespreekbaar worden.',
      owner: 'HR lead met betrokken teamlead',
      actions: [
        'Plan een korte teamreview op veiligheid en samenwerking.',
        'Leg vast welk gedrag of ritme direct anders moet om eerder signaleren mogelijk te maken.',
      ],
      caution: 'Ga niet direct naar een brede cultuurinterventie zonder teamcontext.',
    },
    MIDDEN: {
      title: 'Cultuur is een reviewspoor',
      decision: 'Kies welk team of welke context als eerste verificatie verdient.',
      validate: 'Onderzoek of dit vooral teamdynamiek, psychologische veiligheid of cultuurfit raakt.',
      owner: 'HR lead',
      actions: [
        'Neem het signaal mee in het eerstvolgende team- of leiderschapsgesprek.',
        'Bepaal welke reviewvraag in de komende maand opnieuw moet worden gesteld.',
      ],
      caution: 'Gebruik Pulse hier voor bijsturing, niet voor te brede cultuurdiagnose.',
    },
  },
  growth: {
    HOOG: {
      title: 'Perspectief vraagt een zichtbare volgende stap',
      decision: 'Beslis waar zicht op groei of ontwikkelruimte nu als eerste hersteld moet worden.',
      validate: 'Toets of medewerkers vooral meer perspectief, gesprek of feitelijke ontwikkelruimte missen.',
      owner: 'HR development-owner',
      actions: [
        'Maak binnen 30 dagen een concrete vervolgstap of ontwikkelroute zichtbaar.',
        'Beleg wie het eerstvolgende perspectiefgesprek voert.',
      ],
      caution: 'Pulse maakt zichtbaar dat iets nu schuurt; beloof geen route die inhoudelijk niet waargemaakt kan worden.',
    },
    MIDDEN: {
      title: 'Groei blijft een actief monitoringspunt',
      decision: 'Kies of meer zicht of meer gesprek nu de logische eerste correctie is.',
      validate: 'Controleer waar perspectief het minst concreet of bespreekbaar voelt.',
      owner: 'HR development-owner',
      actions: [
        'Voeg een korte perspectiefcheck toe aan de eerstvolgende gespreksronde.',
        'Leg vast wat voor de volgende Pulse-cycle zichtbaar verbeterd moet zijn.',
      ],
      caution: 'Laat dit niet hangen in alleen communicatie als de route inhoudelijk leeg blijft.',
    },
  },
  compensation: {
    HOOG: {
      title: 'Beloning vraagt scherpe afbakening',
      decision: 'Beslis of dit nu vooral een fairness-, voorwaarden- of uitlegbaarheidsspoor is.',
      validate: 'Toets waar voorwaarden of ervaren eerlijkheid nu het sterkst schuren.',
      owner: 'HR lead',
      actions: [
        'Doe een gerichte check op de meest afwijkende rol of groep.',
        'Kies 1 communicatie- of voorwaardenactie die binnen 30 dagen helder moet zijn.',
      ],
      caution: 'Gebruik Pulse niet om meteen brede beloningsclaims te doen zonder extra toetsing.',
    },
    MIDDEN: {
      title: 'Beloning blijft op de radar',
      decision: 'Kies of extra uitleg nu al genoeg is of dat een inhoudelijke check nodig blijft.',
      validate: 'Controleer of het signaal vooral in een paar groepen speelt.',
      owner: 'HR lead',
      actions: [
        'Verhelder de huidige beloningslogica gericht voor de betrokken groep.',
        'Leg vast welk signaal in een volgende review opnieuw bekeken wordt.',
      ],
      caution: 'Communicatie is alleen genoeg als de onderliggende voorwaarden ook geloofwaardig zijn.',
    },
  },
  workload: {
    HOOG: {
      title: 'Werkdruk vraagt directe ontlasting',
      decision: 'Beslis welke drukbron nu direct omlaag moet in teamritme, planning of prioritering.',
      validate: 'Toets of het om structurele overbelasting, piekdruk of gebrek aan herstel gaat.',
      owner: 'Leidinggevende met HR en operations',
      actions: [
        'Voer binnen 2 weken een korte werklastreview uit.',
        'Schrap of herprioriteer minimaal 1 concrete drukbron binnen 30 dagen.',
      ],
      caution: 'Noem dit niet alleen een perceptiesignaal als teams feitelijk geen ruimte ervaren.',
      review: 'Plan binnen 30 dagen een review of de ontlasting echt voelbaar was.',
    },
    MIDDEN: {
      title: 'Werkdruk moet actief gemonitord blijven',
      decision: 'Kies of dit nu een teamreview of alleen scherpere prioritering vraagt.',
      validate: 'Controleer waar druk oploopt en of herstel nog voldoende lukt.',
      owner: 'Leidinggevende met HR business partner',
      actions: [
        'Maak werkdruk expliciet onderwerp van het eerstvolgende teamoverleg.',
        'Kies 1 beperkte correctie in planning of prioriteit.',
      ],
      caution: 'Middensignalen op werkdruk lopen snel op als er geen zichtbare correctie volgt.',
    },
  },
  role_clarity: {
    HOOG: {
      title: 'Rolhelderheid vraagt snelle explicitering',
      decision: 'Beslis welke prioriteiten of verwachtingen nu direct verduidelijkt moeten worden.',
      validate: 'Toets waar tegenstrijdige opdrachten of rolgrenzen het meeste frictie geven.',
      owner: 'Leidinggevende met HR business partner',
      actions: [
        'Maak binnen 30 dagen prioriteiten en rolgrenzen expliciet voor de betrokken groep.',
        'Leg vast wie escalatie of besluitvorming sneller moet stroomlijnen.',
      ],
      caution: 'Los dit niet alleen op papier op; de dagelijkse prioritering moet voelbaar duidelijker worden.',
    },
    MIDDEN: {
      title: 'Rolhelderheid blijft een actief reviewpunt',
      decision: 'Kies welk deel nu eerst scherper moet: prioriteiten, eigenaarschap of besluitvorming.',
      validate: 'Onderzoek waar verwachtingen nog diffuus of tegenstrijdig zijn.',
      owner: 'Leidinggevende',
      actions: [
        'Gebruik het volgende teammoment om verwachtingen en prioriteiten te verduidelijken.',
        'Bepaal welke vraag in de volgende review terug moet komen.',
      ],
      caution: 'Zonder expliciete opvolging blijft dit een terugkerend sluimerpunt.',
    },
  },
}
