import type { ActionPlaybook } from '@/lib/products/shared/types'

export const EXIT_ACTION_PLAYBOOKS: Record<string, Record<string, ActionPlaybook>> = {
  leadership: {
    HOOG: {
      title: 'Leiderschap vraagt een expliciet managementspoor',
      decision:
        'Beslis eerst of dit vooral een leidinggevend patroon in enkele teams is of een breder MT-thema dat gezamenlijke opvolging vraagt.',
      validate:
        'Toets in welke teams feedback, richting, waardering of escalatie het vaakst terugkomen in exitgesprekken en open antwoorden.',
      owner: 'HR business partner met betrokken leidinggevende',
      actions: [
        'Voer binnen 2 weken een gericht gesprek met de betrokken leidinggevende en HR over waar opvolging zichtbaar ontbrak.',
        'Kies binnen 30 dagen 1 concreet gedrags- of ritmebesluit dat in de meest afwijkende teams anders moet.',
      ],
      caution:
        'Maak dit niet direct een organisatiebreed leiderschapsprobleem zonder eerst teamcontext en patroonsterkte te toetsen.',
    },
    MIDDEN: {
      title: 'Leiderschap is een eerste verificatiespoor',
      decision:
        'Beslis of dit signaal nu al een gericht managementgesprek vraagt, of eerst een beperkt verificatiespoor in teams en open antwoorden.',
      validate:
        'Controleer of het signaal vooral speelt rond feedback, richting of bespreekbaarheid, en of dat beeld in meerdere teams terugkomt.',
      owner: 'HR business partner',
      actions: [
        'Gebruik het eerstvolgende MT- of HR-overleg om te bepalen welke leidinggevende context als eerste moet worden getoetst.',
        'Koppel het gekozen spoor aan 1 opvolgactie die binnen 30-90 dagen zichtbaar moet worden.',
      ],
      caution:
        'Behandel een gemengd signaal niet als definitieve verklaring voor vertrek voordat het patroon steviger is gevalideerd.',
    },
  },
  culture: {
    HOOG: {
      title: 'Cultuur en veiligheid vragen bestuurlijke keuze',
      decision:
        'Beslis of dit vooral een teamspecifiek veiligheidsspoor is of een breder cultuurthema dat MT-aandacht en opvolging vraagt.',
      validate:
        'Toets waar medewerkers zich het minst vrij voelden om zorgen, fouten of afwijkende meningen bespreekbaar te maken.',
      owner: 'HR lead met betrokken MT-lid',
      actions: [
        'Plan binnen 2 weken een verdiepingsgesprek met de sterkst afwijkende teams over veiligheid, samenwerking en escalatie.',
        'Kies 1 concreet cultuur- of teamritme-besluit dat binnen 30-90 dagen getoetst wordt.',
      ],
      caution:
        'Noem dit niet direct een cultuurprobleem van de hele organisatie als het mogelijk om een beperkte set teams of contexten gaat.',
    },
    MIDDEN: {
      title: 'Cultuur is een af te bakenen vertrekspoor',
      decision:
        'Beslis of dit signaal eerst lokaal moet worden verdiept of al breed genoeg is voor een MT-gesprek over bespreekbaarheid en samenwerking.',
      validate:
        'Onderzoek of het vooral gaat om psychologische veiligheid, cultuurfit of spanningen in samenwerking.',
      owner: 'HR lead',
      actions: [
        'Gebruik team- of MT-overleg om het meest waarschijnlijke veiligheidsspoor expliciet te benoemen.',
        'Koppel daar 1 gerichte 30-90 dagenactie aan in plaats van een brede cultuuragenda.',
      ],
      caution:
        'Een gemengd signaal vraagt afbakening; ga niet te snel naar brede cultuurinterventies zonder extra toetsing.',
    },
  },
  growth: {
    HOOG: {
      title: 'Groeiperspectief vraagt een expliciet herstelbesluit',
      decision:
        'Beslis of het grootste probleem nu zit in gebrek aan zicht op perspectief, gebrek aan gesprek of feitelijk te weinig ontwikkelruimte.',
      validate:
        'Toets waar het verschil het grootst is tussen verwacht perspectief, gevoerd loopbaangesprek en ervaren doorgroeikans.',
      owner: 'HR development-owner met betrokken leidinggevende',
      actions: [
        'Maak binnen 30 dagen zichtbaar welke ontwikkel- of groeiroute voor de sterkst afwijkende groepen het eerst moet worden hersteld.',
        'Beleg per betrokken team wie het eerstvolgende loopbaan- of ontwikkelgesprek trekt.',
      ],
      caution:
        'Beloof geen groei- of loopbaanroute die organisatorisch niet realistisch of niet uitlegbaar is.',
    },
    MIDDEN: {
      title: 'Groei is een logisch eerste besluitspoor',
      decision:
        'Beslis of medewerkers nu vooral meer zicht, meer gesprek of meer feitelijke ontwikkelruimte missen.',
      validate:
        'Controleer in welke teams groeipaden onvoldoende concreet of onvoldoende bespreekbaar zijn.',
      owner: 'HR development-owner',
      actions: [
        'Kies 1 groep waar groei als eerste expliciet besproken en opgevolgd wordt.',
        'Leg vast welke 30-90 dagenactie zicht op perspectief direct concreter moet maken.',
      ],
      caution:
        'Verwar een gebrek aan perspectief niet automatisch met een breed loyaliteitsprobleem zonder verdere duiding.',
    },
  },
  compensation: {
    HOOG: {
      title: 'Beloning vraagt bestuurlijke duiding',
      decision:
        'Beslis of de kern nu ligt in hoogte, ervaren fairness of uitlegbaarheid van voorwaarden, en of dat een beperkt of breder managementspoor is.',
      validate:
        'Toets of vertrekkers vooral de beloningshoogte, de transparantie of de passendheid van voorwaarden noemen.',
      owner: 'HR lead met MT of directie',
      actions: [
        'Voer een gerichte fairness- of markttoets uit voor de sterkst afwijkende groepen.',
        'Bepaal binnen 30-90 dagen welk belonings- of communicatiebesluit eerst zichtbaar moet worden.',
      ],
      caution:
        'Ga niet uit van een puur salarisprobleem als ervaren eerlijkheid of uitleg er zichtbaar mee verweven zijn.',
    },
    MIDDEN: {
      title: 'Beloning speelt mee, maar vraagt afbakening',
      decision:
        'Beslis of dit signaal nu vooral communicatie en uitleg vraagt, of al wijst op een inhoudelijk voorwaardenprobleem.',
      validate:
        'Onderzoek of dit spoor geconcentreerd zit in specifieke rollen, teams of marktsituaties.',
      owner: 'HR lead',
      actions: [
        'Gebruik het eerstvolgende managementgesprek om het dominante beloningsvraagstuk scherp te kiezen.',
        'Koppel daar 1 beperkte 30-90 dagenactie aan in plaats van een brede voorwaardenherziening.',
      ],
      caution:
        'Communicatie alleen is onvoldoende als het feitelijke voorwaardenprobleem daarna nog blijft staan.',
    },
  },
  workload: {
    HOOG: {
      title: 'Werkdruk vraagt directe keuze en eigenaarschap',
      decision:
        'Beslis eerst waar structurele druk echt verlicht moet worden en welk team of welke rol als eerste managementingreep vraagt.',
      validate:
        'Breng in kaart waar belasting structureel is, waar herstel ontbreekt en welke prioriteiten het vaakst botsen.',
      owner: 'Betrokken leidinggevende met HR en operations',
      actions: [
        'Voer binnen 2 weken een werklastreview uit in de meest afwijkende teams.',
        'Kies binnen 30 dagen welke taken, prioriteiten of bezettingskeuzes omlaag moeten om lucht te geven.',
      ],
      caution:
        'Noem dit niet alleen een perceptievraag als het patroon wijst op feitelijk te weinig ruimte of herstel.',
    },
    MIDDEN: {
      title: 'Werkdruk is het eerste verbeterspoor',
      decision:
        'Beslis of dit vooral een piekprobleem, een structureel capaciteitsprobleem of een prioriteringsprobleem is.',
      validate:
        'Toets in welke teams het druksignaal het sterkst terugkomt en welk deel daarvan al eerder zichtbaar was.',
      owner: 'Betrokken leidinggevende met HR business partner',
      actions: [
        'Gebruik het eerstvolgende team- of MT-gesprek om 1 drukspoor expliciet te kiezen.',
        'Leg vast welke 30-90 dagenactie direct meer herstel of regelruimte moet opleveren.',
      ],
      caution:
        'Laat een gemengd werkdruksignaal niet liggen; zonder afbakening blijft het snel bij constatering in plaats van verbetering.',
    },
  },
  role_clarity: {
    HOOG: {
      title: 'Rolhelderheid vraagt een expliciet keuze- en herstelspoor',
      decision:
        'Beslis of het probleem nu vooral zit in prioriteiten, rolgrenzen of onduidelijke besluitvorming, en waar dat eerst hersteld moet worden.',
      validate:
        'Toets waar verwachtingen, verantwoordelijkheden of escalatiepunten het minst helder waren voordat mensen vertrokken.',
      owner: 'Betrokken leidinggevende met HR business partner',
      actions: [
        'Maak binnen 30 dagen per betrokken team expliciet welke prioriteiten, rolgrenzen en escalatielijnen eerst helder moeten zijn.',
        'Kies 1 managementbesluit dat tegenstrijdige verwachtingen direct terugbrengt tot werkbare keuzes.',
      ],
      caution:
        'Probeer dit niet op te lossen met alleen functiebeschrijvingen; dagelijkse prioritering is meestal de echte bron.',
    },
    MIDDEN: {
      title: 'Rolhelderheid is een corrigeerbaar vertrekspoor',
      decision:
        'Beslis welk deel van de onduidelijkheid eerst prioriteit krijgt: verwachtingen, eigenaarschap of dagelijkse besluitvorming.',
      validate:
        'Onderzoek welke rolonduidelijkheid het vaakst terugkomt in exitinput, gesprekken of teamcontext.',
      owner: 'Betrokken leidinggevende',
      actions: [
        'Gebruik het eerstvolgende managementgesprek om het belangrijkste helderheidsspoor te kiezen.',
        'Koppel daar 1 duidelijke 30-90 dagenactie aan in teamritme of rolafspraken.',
      ],
      caution:
        'Zonder expliciete opvolging blijft rolhelderheid snel een terugkerend sluimerpunt in plaats van een opgelost thema.',
    },
  },
}
