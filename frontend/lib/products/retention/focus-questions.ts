export const RETENTION_FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'In welke teams lijkt leidinggevend gedrag het sterkst samen te hangen met het retentiesignaal?',
      'Welke ondersteuning missen medewerkers nu het meest van hun leidinggevende?',
      'Is dit eerst een teamspoor of al een breder managementthema dat snelle opvolging vraagt?',
    ],
    MIDDEN: [
      'Worden feedback, waardering en ontwikkelgesprekken voldoende consequent gevoerd?',
      'Welk eerste besluit helpt hier kiezen tussen verder valideren en direct opvolgen?',
    ],
  },
  culture: {
    HOOG: [
      'Voelen medewerkers zich vrij om zorgen vroeg te delen?',
      'Waar lijkt psychologische veiligheid of cultuurfit het meest onder druk te staan?',
      'Welk team of welke groep moet hier eerst worden gevalideerd voordat acties worden opgeschaald?',
    ],
    MIDDEN: [
      'Welke teams laten het meest gemengde beeld zien op veiligheid en cultuurmatch?',
      'Is hier eerst een teamdialoog nodig of vooral een scherpere keuze over waar management prioriteit legt?',
    ],
  },
  growth: {
    HOOG: [
      'Weten medewerkers welke volgende stap binnen de organisatie realistisch is?',
      'Waar ontbreekt een geloofwaardig groeiperspectief het sterkst?',
      'Wat moet hier eerst worden gekozen: meer zicht op perspectief, meer gesprek of meer feitelijke ontwikkelruimte?',
    ],
    MIDDEN: [
      'Hoe zichtbaar en bespreekbaar zijn groeipaden in de dagelijkse praktijk?',
      'Wie trekt dit spoor als eerste zodat het niet alleen een HR-observatie blijft?',
    ],
  },
  compensation: {
    HOOG: [
      'Worden beloning en voorwaarden als eerlijk en uitlegbaar ervaren?',
      'Welk deel vraagt nu als eerste opvolging: hoogte, fairness of uitlegbaarheid?',
    ],
    MIDDEN: [
      'Speelt vooral de hoogte van beloning, of ook de transparantie eromheen?',
      'Welk beperkte besluit is hier logischer dan direct een brede voorwaardenaanpak?',
    ],
  },
  workload: {
    HOOG: [
      'Waar zet werkdruk behoud het sterkst onder druk?',
      'Is de belasting structureel of vooral piekgebonden?',
      'Welke groep moet management hier eerst ontlasten of herprioriteren?',
    ],
    MIDDEN: [
      'Welke groepen hebben het minste herstel of regelruimte in hun werk?',
      'Wie moet dit eerste spoor trekken en welke beperkte 30-90 dagenactie hoort daarbij?',
    ],
  },
  role_clarity: {
    HOOG: [
      'Waar missen medewerkers de meeste duidelijkheid over verwachtingen en prioriteiten?',
      'Moet management hier eerst rolgrenzen, prioriteiten of dagelijkse besluitvorming aanscherpen?',
    ],
    MIDDEN: [
      'Welke rolonduidelijkheid werkt nu vooral door in werkbeleving en behoud?',
      'Welk eerste besluit voorkomt dat dit aandachtspunt zonder eigenaar blijft liggen?',
    ],
  },
}
