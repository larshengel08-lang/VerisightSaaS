import type { ActionPlaybook } from '@/lib/products/shared/types'

export const RETENTION_ACTION_PLAYBOOK_CALIBRATION_NOTE =
  'Deze playbooks zijn v1-richtlijnen op basis van werkfactoren en signaalpatronen. We ijken ze na de eerste pilotronde op echte RetentieScan-data, zodat prioritering en actieroutes beter aansluiten op wat in de praktijk het meeste effect heeft.'

export const RETENTION_ACTION_PLAYBOOKS: Record<string, Record<string, ActionPlaybook>> = {
  leadership: {
    HOOG: {
      title: 'Leiderschap vraagt directe opvolging',
      decision:
        'Beslis eerst in welke teams dit nu een direct managementgesprek vraagt en of het spoor vooral over feedback, richting of autonomie-ondersteuning gaat.',
      validate:
        'Toets binnen welke teams het vooral gaat om gebrek aan richting, feedback, waardering of autonomie-ondersteuning.',
      owner: 'HR business partner met betrokken leidinggevende',
      actions: [
        'Start binnen 30 dagen een vaste manager check-in ritme voor de meest afwijkende teams.',
        'Maak coachend gedrag en autonomie-ondersteuning expliciet onderdeel van het volgende leidinggevendenoverleg.',
        'Bepaal per team welke escalaties of spanningen direct HR-ondersteuning vragen.',
      ],
      caution: 'Maak dit niet meteen een generieke leiderschapsoverdracht; toets eerst welk concreet gedrag medewerkers missen.',
    },
    MIDDEN: {
      title: 'Leiderschap is een aandachtspunt, nog geen harde breuklijn',
      decision:
        'Beslis of dit signaal nu al een gerichte leidinggevende opvolging vraagt, of eerst een beperkt verificatiespoor in enkele teams.',
      validate: 'Controleer of het signaal breed speelt of vooral geconcentreerd zit bij een paar teams of rollen.',
      owner: 'HR business partner',
      actions: [
        'Voeg een korte check toe op feedback, waardering en ontwikkelgesprekken in de eerstvolgende teamcyclus.',
        'Laat managers expliciet ophalen waar medewerkers meer richting of steun nodig hebben.',
      ],
      caution: 'Ga niet direct uit van een individueel managersprobleem zonder team- of contextcheck.',
    },
  },
  culture: {
    HOOG: {
      title: 'Veiligheid en samenwerking vragen snelle validatie',
      decision:
        'Beslis of dit vooral een teamspecifiek veiligheidsspoor is of een breder cultuurthema dat direct MT-opvolging verdient.',
      validate: 'Toets waar medewerkers zich nu het minst vrij voelen om zorgen, fouten of afwijkende meningen te delen.',
      owner: 'HR lead met betrokken MT-lid',
      actions: [
        'Plan een teamsessie over veiligheid en samenwerking in de groepen met het sterkste signaal.',
        'Maak concreet welk gedrag gewenst is en welk gedrag niet langer acceptabel is.',
        'Controleer of teamdynamiek, cultuurfit of verandering de grootste bron van spanning vormt.',
      ],
      caution: 'Noem dit niet meteen een cultuurprobleem van de hele organisatie als het mogelijk om enkele teams gaat.',
    },
    MIDDEN: {
      title: 'Cultuursignalen vragen verfijning',
      decision:
        'Beslis welk deel eerst verificatie vraagt: psychologische veiligheid, samenwerking of fit met de huidige manier van werken.',
      validate: 'Onderzoek of het vooral gaat om psychologische veiligheid, samenwerking of fit met de huidige manier van werken.',
      owner: 'HR lead',
      actions: [
        'Gebruik teamleadsessies om te toetsen waar medewerkers zich onvoldoende gehoord of veilig voelen.',
        'Neem cultuur- en veiligheidssignalen mee in de eerstvolgende leidinggevendendialoog.',
      ],
      caution: 'Houd onderscheid tussen brede cultuur en lokale teamdynamiek.',
    },
  },
  growth: {
    HOOG: {
      title: 'Groeiperspectief ontbreekt te zichtbaar',
      decision:
        'Beslis of de eerste ingreep nu moet zitten in zicht op perspectief, feitelijke ontwikkelruimte of het gesprek daarover.',
      validate: 'Toets of medewerkers vooral een volgende stap missen of dat ontwikkelruimte in de huidige rol al tekortschiet.',
      owner: 'HR development-owner met betrokken leidinggevende',
      actions: [
        'Maak binnen 30 dagen groeipaden, interne kansen en ontwikkelgesprekken zichtbaar voor de sterkst afwijkende groepen.',
        'Laat managers per team benoemen welke ontwikkelroute realistisch en uitlegbaar is.',
        'Koppel ontwikkelruimte aan behoudsacties in plaats van alleen aan beoordelingsmomenten.',
      ],
      caution: 'Beloof geen doorgroei die organisatorisch niet realistisch is.',
    },
    MIDDEN: {
      title: 'Groei is een oplosbaar aandachtspunt',
      decision:
        'Beslis of medewerkers nu vooral meer zicht, meer gesprek of meer feitelijke ruimte voor ontwikkeling nodig hebben.',
      validate: 'Check of medewerkers vooral meer zicht, meer gesprek of meer feitelijke ontwikkelruimte nodig hebben.',
      owner: 'HR development-owner',
      actions: [
        'Voeg een compacte ontwikkelvraag toe aan de eerstvolgende check-in of voortgangsbespreking.',
        'Maak bestaande leer- of mobiliteitsopties beter zichtbaar.',
      ],
      caution: 'Verwar gebrek aan zicht op groei niet automatisch met een gebrek aan ambitie of loyaliteit.',
    },
  },
  compensation: {
    HOOG: {
      title: 'Beloning en voorwaarden vragen bestuurlijke duiding',
      decision:
        'Beslis of het dominante vraagstuk nu hoogte, ervaren fairness of uitlegbaarheid van voorwaarden is en welke groep eerst opvolging vraagt.',
      validate: 'Controleer of de pijn vooral zit in hoogte, transparantie of passendheid van voorwaarden voor duurzaam werken.',
      owner: 'HR lead met MT of directie',
      actions: [
        'Maak de beloningslogica en groeiregels voor de betrokken groepen explicieter en beter uitlegbaar.',
        'Toets of gerichte markt- of fairnesschecks nodig zijn voor specifieke functies of teams.',
        'Kijk ook naar niet-financiele voorwaarden die behoud direct ondersteunen.',
      ],
      caution: 'Ga niet uit van een puur salarisprobleem als ook uitleg en ervaren eerlijkheid meespelen.',
    },
    MIDDEN: {
      title: 'Beloning speelt mee, maar vraagt nuance',
      decision:
        'Beslis of dit eerst een communicatie- en uitlegvraag is of al een inhoudelijk voorwaardenbesluit vraagt.',
      validate: 'Onderzoek of medewerkers vooral meer helderheid of feitelijk betere voorwaarden verwachten.',
      owner: 'HR lead',
      actions: [
        'Verduidelijk hoe beloning en voorwaarden samenhangen met rol, groei en verwachtingen.',
        'Inventariseer of het signaal bij enkele groepen sterker is dan organisatiebreed.',
      ],
      caution: 'Communicatie alleen lost het probleem niet op als de feitelijke passendheid echt onvoldoende is.',
    },
  },
  workload: {
    HOOG: {
      title: 'Werkdruk vraagt directe ontlasting',
      decision:
        'Beslis eerst in welke teams werk of prioriteit direct omlaag moet en welk deel van de druk nu structureel onhoudbaar is.',
      validate: 'Breng in kaart waar de belasting structureel is en waar prioriteiten, planning of bezetting uit balans zijn.',
      owner: 'Betrokken leidinggevende met HR en operations',
      actions: [
        'Voer direct een werklastreview uit in de meest afwijkende teams.',
        'Schrap, herprioriteer of verplaats werk binnen 30 dagen waar dat aantoonbaar lucht geeft.',
        'Maak herstel, bereikbaarheid en piekbelasting expliciet onderdeel van de opvolging.',
      ],
      caution: 'Noem het niet alleen een perceptieprobleem als teams feitelijk te weinig ruimte of capaciteit hebben.',
    },
    MIDDEN: {
      title: 'Werkdruk is zichtbaar, maar nog corrigeerbaar',
      decision:
        'Beslis of dit vooral piekdruk, structurele overbelasting of een prioriteringsvraag is voordat je acties breder maakt.',
      validate: 'Toets of het vooral om piekdruk, structurele overbelasting of onvoldoende regelruimte gaat.',
      owner: 'Betrokken leidinggevende met HR business partner',
      actions: [
        'Maak in teamoverleggen ruimte om werkdruk, planning en herstel expliciet te bespreken.',
        'Volg 1-2 teams extra nauw in de komende 30-90 dagen.',
      ],
      caution: 'Een aandachtspunt kan snel opschuiven richting direct aandachtspunt als het genegeerd wordt.',
    },
  },
  role_clarity: {
    HOOG: {
      title: 'Prioriteiten en rolgrenzen zijn te diffuus',
      decision:
        'Beslis eerst waar prioriteiten, rolgrenzen of besluitvorming het meest uit elkaar lopen en welk team als eerste herstel vraagt.',
      validate: 'Toets waar verwachtingen, beslisruimte of tegenstrijdige opdrachten nu het minst helder zijn.',
      owner: 'Betrokken leidinggevende met HR business partner',
      actions: [
        'Maak per team een kort overzicht van prioriteiten, rolgrenzen en escalatiepunten.',
        'Laat leidinggevenden expliciet benoemen wat nu wel en niet in elke rol wordt verwacht.',
        'Breng tegenstrijdige doelen of opdrachten direct terug tot werkbare keuzes.',
      ],
      caution: 'Probeer dit niet op te lossen met alleen functiebeschrijvingen; dagelijkse prioritering is meestal de echte bron.',
    },
    MIDDEN: {
      title: 'Rolhelderheid vraagt explicitering',
      decision:
        'Beslis welk deel nu eerst scherp moet worden gezet: prioriteiten, eigenaarschap of dagelijkse besluitvorming.',
      validate: 'Onderzoek of het vooral gaat om prioriteiten, eigenaarschap of onduidelijke besluitvorming.',
      owner: 'Betrokken leidinggevende',
      actions: [
        'Gebruik teamoverleggen om prioriteiten en rolverwachtingen explicieter te maken.',
        'Leg voor de meest afwijkende groepen vast waar verwarring nu vooral ontstaat.',
      ],
      caution: 'Zonder expliciete follow-up blijft rolhelderheid vaak een terugkerend sluimerpunt.',
    },
  },
}
