export const RETENTION_FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'In welke teams lijkt leidinggevend gedrag het sterkst samen te hangen met behoudssignalen?',
      'Welke ondersteuning missen medewerkers nu het meest van hun leidinggevende?',
    ],
    MIDDEN: ['Worden feedback, waardering en ontwikkelgesprekken voldoende consequent gevoerd?'],
  },
  culture: {
    HOOG: [
      'Voelen medewerkers zich vrij om zorgen vroeg te delen?',
      'Waar lijkt psychologische veiligheid of cultuurfit het meest onder druk te staan?',
    ],
    MIDDEN: ['Welke teams laten het meest gemengde beeld zien op veiligheid en cultuurmatch?'],
  },
  growth: {
    HOOG: [
      'Weten medewerkers welke volgende stap binnen de organisatie realistisch is?',
      'Waar ontbreekt een geloofwaardig groeiperspectief het sterkst?',
    ],
    MIDDEN: ['Hoe zichtbaar en bespreekbaar zijn groeipaden in de dagelijkse praktijk?'],
  },
  compensation: {
    HOOG: ['Worden beloning en voorwaarden als eerlijk en uitlegbaar ervaren?'],
    MIDDEN: ['Speelt vooral de hoogte van beloning, of ook de transparantie eromheen?'],
  },
  workload: {
    HOOG: [
      'Waar zet werkdruk behoud het sterkst onder druk?',
      'Is de belasting structureel of vooral piekgebonden?',
    ],
    MIDDEN: ['Welke groepen hebben het minste herstel of regelruimte in hun werk?'],
  },
  role_clarity: {
    HOOG: ['Waar missen medewerkers de meeste duidelijkheid over verwachtingen en prioriteiten?'],
    MIDDEN: ['Welke rolonduidelijkheid werkt nu vooral door in werkbeleving en behoud?'],
  },
}
