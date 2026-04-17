export const PULSE_FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'Wat in de dagelijkse aansturing vraagt nu als eerste bijsturing of expliciete steun?',
      'Welke teams of leidingcontexten voelen dit signaal op dit moment het sterkst?',
      'Welk reviewbesluit hoort hier nu bij voordat een volgende Pulse-cycle logisch is?',
    ],
    MIDDEN: [
      'Gaat dit vooral om richting, feedback of beschikbaarheid van leidinggevenden?',
      'Welke beperkte managementcheck voorkomt dat dit signaal blijft doorschuiven?',
    ],
  },
  culture: {
    HOOG: [
      'Waar lijkt bespreekbaarheid of psychologische veiligheid nu het meeste onder druk te staan?',
      'Is dit een lokaal teamsignaal of een bredere samenwerkingsfrictie die sneller aandacht vraagt?',
    ],
    MIDDEN: [
      'Welke spanning in samenwerking moet nu eerst getoetst worden?',
      'Welk gesprek helpt hier sneller dan een brede cultuuractie?',
    ],
  },
  growth: {
    HOOG: [
      'Waar ontbreekt op dit moment het meeste perspectief of ontwikkelruimte?',
      'Welke concrete vervolgstap kan management nu zichtbaar maken om dit signaal te laten zakken?',
    ],
    MIDDEN: [
      'Mist hier vooral zicht op groei of feitelijke ruimte om te ontwikkelen?',
      'Wie trekt dit reviewspoor in de komende 30 dagen?',
    ],
  },
  compensation: {
    HOOG: [
      'Voelt dit nu vooral als een hoogte-, fairness- of voorwaardenprobleem?',
      'Welke groep of rol vraagt eerst extra uitleg of herijking?',
    ],
    MIDDEN: [
      'Gaat het op dit moment meer om uitlegbaarheid dan om inhoudelijke aanpassing?',
      'Welk beperkte besluit hoort hier eerst bij?',
    ],
  },
  workload: {
    HOOG: [
      'Waar vraagt werkdruk nu de snelste ontlasting of herprioritering?',
      'Welke taken, pieken of verwachtingen moeten als eerste worden teruggebracht?',
    ],
    MIDDEN: [
      'Is dit vooral een pieksignaal of begint structurele overbelasting zichtbaar te worden?',
      'Welke eerste teamreview hoort hier nu bij?',
    ],
  },
  role_clarity: {
    HOOG: [
      'Waar zijn prioriteiten of verwachtingen op dit moment het minst helder?',
      'Welke rol- of besluitfrictie moet management nu als eerste expliciteren?',
    ],
    MIDDEN: [
      'Welke onduidelijkheid is nu nog corrigeerbaar zonder brede reorganisatie?',
      'Wie moet dit spoor als eerste trekken?',
    ],
  },
}
