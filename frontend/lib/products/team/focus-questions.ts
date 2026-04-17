export const TEAM_FOCUS_QUESTIONS: Record<string, Record<string, string[]>> = {
  leadership: {
    HOOG: [
      'In welke afdeling ontbreekt nu vooral richting, steun of escalatiemogelijkheid en wie moet dat als eerste verifieren?',
      'Welke lokale leidingcontext moet als eerste worden geverifieerd voordat je breder ingrijpt?',
      'Wat moet hier eerst worden besproken om te zien of dit echt een lokaal patroon is en niet alleen een momentopname?',
    ],
    MIDDEN: [
      'Is dit vooral een afdelingsspecifiek aansturingssignaal of een bredere managementfrictie?',
      'Welke korte lokale check voorkomt dat dit signaal diffuus blijft en wanneer lees je het opnieuw?',
    ],
  },
  culture: {
    HOOG: [
      'Waar voelt bespreekbaarheid of samenwerking het minst veilig in de directe werkcontext en wie moet daar als eerste bij aan tafel?',
      'Welke afdeling vraagt nu als eerste een verificatiegesprek over teamveiligheid of samenwerking?',
    ],
    MIDDEN: [
      'Gaat dit vooral om lokaal teamgedrag of om een bredere samenwerkingsfrictie?',
      'Welk afdelingsgesprek helpt hier sneller dan een brede cultuurreactie en wanneer verwacht je de eerste herleesbare check?',
    ],
  },
  growth: {
    HOOG: [
      'Waar ontbreekt lokaal het meeste perspectief of ontwikkelruimte en wie moet dat als eerste verduidelijken?',
      'Welke afdeling vraagt nu als eerste een gesprek over groei, ontwikkeling of zicht op vervolgstappen?',
    ],
    MIDDEN: [
      'Is hier vooral meer perspectief nodig of vooral meer duidelijkheid over de route?',
      'Wie moet lokaal als eerste verifiëren wat hier ontbreekt?',
    ],
  },
  compensation: {
    HOOG: [
      'In welke afdelingen voelt beloning of voorwaarden nu het minst passend bij de werkcontext en wie moet dit eerst toetsen?',
      'Moet dit eerst lokaal worden geverifieerd op fairness, werkdruk of uitlegbaarheid?',
    ],
    MIDDEN: [
      'Is dit vooral een lokaal uitlegbaarheidssignaal of ligt er inhoudelijk meer onder?',
      'Welke afdeling of rolcontext vraagt hier eerst extra toetsing?',
    ],
  },
  workload: {
    HOOG: [
      'Waar is werkdruk lokaal nu het minst houdbaar en welke eigenaar moet daar nu als eerste op handelen?',
      'Welke afdeling vraagt als eerste ontlasting, herprioritering of een check op structurele piekdruk?',
    ],
    MIDDEN: [
      'Is dit vooral piekdruk of begint lokale structurele overbelasting zichtbaar te worden?',
      'Welk lokaal gesprek moet nu als eerste gevoerd worden?',
    ],
  },
  role_clarity: {
    HOOG: [
      'In welke afdelingen zijn prioriteiten of verwachtingen nu het minst helder en wie moet daar nu als eerste op expliciteren?',
      'Waar moet management nu als eerste rolgrenzen, eigenaarschap of besluitvorming expliciteren?',
    ],
    MIDDEN: [
      'Welke lokale onduidelijkheid is nog corrigeerbaar zonder brede reorganisatie?',
      'Wie moet dit afdelingsspoor als eerste trekken?',
    ],
  },
}
