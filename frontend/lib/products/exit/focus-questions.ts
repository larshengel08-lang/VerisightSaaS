export const EXIT_FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'Wat vertellen vertrekkers over de relatie met hun leidinggevende?',
      'In welke teams lijkt dit het sterkst te spelen?',
    ],
    MIDDEN: ['Worden feedback en ontwikkeling voldoende concreet besproken?'],
  },
  culture: {
    HOOG: [
      'Voelen medewerkers zich vrij om problemen of afwijkende meningen te delen?',
      'Zijn er teams waar dit patroon duidelijk sterker terugkomt?',
    ],
    MIDDEN: ['Welke situaties lijken de psychologische veiligheid onder druk te zetten?'],
  },
  growth: {
    HOOG: [
      'Weten medewerkers welke volgende stap binnen de organisatie realistisch is?',
      'Waar zit de grootste kloof tussen verwachting en ervaren perspectief?',
    ],
    MIDDEN: ['Hoe zichtbaar en bespreekbaar zijn groeipaden nu echt?'],
  },
  compensation: {
    HOOG: ['Hoe wordt beloning intern ervaren ten opzichte van vergelijkbare functies?'],
    MIDDEN: ['Speelt vooral de hoogte van beloning, of ook de uitleg en transparantie?'],
  },
  workload: {
    HOOG: [
      'Is de werkbelasting structureel of vooral piekgebonden?',
      'Waar lijkt onvoldoende herstelruimte mee te spelen?',
    ],
    MIDDEN: ['Welke teams ervaren de hoogste druk en waardoor komt dat?'],
  },
  role_clarity: {
    HOOG: ['Waar zijn verwachtingen, verantwoordelijkheden of prioriteiten onvoldoende helder?'],
    MIDDEN: ['Welke rolonduidelijkheid komt het vaakst terug in gesprekken of feedback?'],
  },
}
