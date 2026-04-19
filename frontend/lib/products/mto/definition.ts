import type { ScanDefinition } from '@/lib/scan-definitions'

export const mtoScanDefinition: ScanDefinition = {
  scanType: 'mto',
  productName: 'MTO',
  signalLabel: 'MTO-signaal',
  signalLabelLower: 'mto-signaal',
  summaryLabel: 'Brede organisatieread',
  methodologyText:
    'MTO is in deze fase een bredere organisatiebrede hoofdmeting met een veilige afdelingsread. Het product bundelt volledige werkbeleving, de volledige werkfactorlaag en een brede richtingsvraag tot een brede organisatieread, gevolgd door bounded department intelligence boven de suppressiedrempel. MTO blijft bewust intern, campaign-centered, privacy-first en nog zonder suitebrede action engine.',
  whatItIsText:
    'Een brede hoofdmeting die laat zien welke combinatie van werkbeleving en werkfactoren nu de meeste organisatieduiding vraagt, plus welke afdelingen daar veilig en bounded uit springen.',
  whatItIsNotText:
    'Geen individueel tevredenheidsoordeel, geen formeel rapport, geen volledige shared action engine en geen publieke hoofdroute in deze wave.',
  howToReadText:
    'Lees MTO eerst als brede organisatieread: welke themas vallen nu het meest op, welke brede managementvraag hoort daar als eerste bij en welke afdelingen boven de veilige suppressiedrempel extra duiding vragen. Houd deze fase bewust bij bounded department intelligence en een begrensde vervolglijn, niet bij directe uitrol van rapport- of suitebrede actionlagen.',
  privacyBoundaryText:
    'Output blijft privacy-first. Afdelingen openen alleen boven de veilige suppressiedrempel; kleine groepen blijven onderdrukt en er is nog geen vrije segment explorer.',
  evidenceStatusText:
    'MTO is in deze fase methodisch een hoofdmeting met bounded department intelligence: intern, campaign-centered en zonder formele rapportlaag of volledige action engine. De huidige vorm helpt een brede organisatieread en veilige afdelingshandoffs openen, maar is nog geen volledige hoofdroute-ervaring.',
  signalHelp:
    'MTO-signaal 1-10: samenvattend groepssignaal van brede werkbeleving en werkfactoren in deze campaign. Hogere score = scherper breed organisatiethema dat nu eerste managementduiding vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Afdelingsreads openen alleen boven de veilige suppressiedrempel. MTO blijft een geaggregeerde hoofdmeting met bounded department intelligence, niet een individueel tevredenheidsoordeel of formele reportlaag.',
  segmentText:
    'Department intelligence is in deze fase een bounded tweede laag boven op de brede organisatieread. De focus blijft op organisatiebreed beeld, veilige afdelingsreads, topprioriteiten en een eerste bounded vervolgstap.',
}
