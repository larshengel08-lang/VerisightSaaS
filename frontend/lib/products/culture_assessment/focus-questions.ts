export const CULTURE_ASSESSMENT_FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  engagement_involvement: {
    HOOG: [
      'Waar in de organisatie lijkt betrokkenheid nu het meest onder druk te staan?',
      'Is dit vooral een breed organisatiepatroon of een geconcentreerd verschil tussen onderdelen?',
    ],
    MIDDEN: [
      'Welke onderdelen laten een merkbaar ander betrokkenheidsbeeld zien dan het organisatieniveau?',
    ],
  },
  trust_psychological_safety: {
    HOOG: [
      'Waar lijken vertrouwen en bespreekbaarheid nu het meest te schuiven?',
      'Welke verschillen tussen onderdelen vragen eerst bestuurlijke aandacht?',
    ],
    MIDDEN: [
      'Gaat het vooral om veilige tegenspraak, openheid of voorspelbaarheid van sturing?',
    ],
  },
  leadership_direction: {
    HOOG: [
      'Waar voelen richting, beschikbaarheid of bestuurlijke sturing nu het minst helder?',
      'Welke delen van de organisatie vragen eerst een scherpere leiderschapsread?',
    ],
    MIDDEN: [
      'Welke managementcontext vraagt eerst verduidelijking voordat extra vervolgacties logisch zijn?',
    ],
  },
  collaboration_alignment: {
    HOOG: [
      'Waar lopen samenwerking en alignment tussen onderdelen nu het meest uiteen?',
      'Welke delen van de organisatie laten nu de grootste spanningsverschillen zien?',
    ],
  },
  workload_capacity: {
    HOOG: [
      'Waar lijkt werkdruk nu het duidelijkst te botsen met draagkracht of herstel?',
      'Welke onderdelen tonen nu de grootste concentratie van uitvoerbaarheidsdruk?',
    ],
  },
}
