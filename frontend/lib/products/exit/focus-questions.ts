export const EXIT_FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'Wat vertellen vertrekkers over steun, feedback en opvolging vanuit hun leidinggevende?',
      'In welke teams of leidinggevende contexten lijkt dit het sterkst mee te spelen in vertrek?',
    ],
    MIDDEN: ['Worden feedback, richting en ontwikkeling op tijd concreet genoeg besproken?'],
  },
  culture: {
    HOOG: [
      'Voelden vertrekkers zich vrij om zorgen, fouten of afwijkende meningen bespreekbaar te maken?',
      'Zijn er teams waar dit vertrekbeeld duidelijk sterker terugkomt?',
    ],
    MIDDEN: ['Welke situaties lijken psychologische veiligheid of cultuurfit het meest onder druk te zetten?'],
  },
  growth: {
    HOOG: [
      'Waren loopbaanperspectief en ontwikkelruimte concreet genoeg vóórdat mensen vertrokken?',
      'Waar zit de grootste kloof tussen verwachting, gesprek en ervaren perspectief?',
    ],
    MIDDEN: ['Hoe zichtbaar en bespreekbaar zijn groeipaden nu echt voor de groepen die vertrekken?'],
  },
  compensation: {
    HOOG: ['Hoe wordt beloning ervaren ten opzichte van vergelijkbare functies en wat wordt daar intern over besproken?'],
    MIDDEN: ['Speelt vooral de hoogte van beloning, of juist ook de uitleg, fairness en transparantie?'],
  },
  workload: {
    HOOG: [
      'Is de ervaren werkbelasting structureel of vooral piekgebonden in de teams waar vertrek speelt?',
      'Waar lijkt onvoldoende herstelruimte of prioritering mee te spelen in vertrek?',
    ],
    MIDDEN: ['Welke teams ervaren de hoogste druk en welk deel daarvan was vooraf al zichtbaar?'],
  },
  role_clarity: {
    HOOG: ['Waar zijn verwachtingen, verantwoordelijkheden of prioriteiten onvoldoende helder vóór vertrek?'],
    MIDDEN: ['Welke rolonduidelijkheid komt het vaakst terug in gesprekken, feedback of exitinput?'],
  },
}
