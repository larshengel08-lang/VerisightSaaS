import type { ReportProduct } from './report_scene_schema'

export const REPORT_MICRO_STRUCTURE_V3 = {
  appliesTo: ['P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P10', 'B1'] as const,
  requiredOrder: ['title', 'hoe-lees-je-dit', 'uitleg-of-waarom-dit-ertoe-doet', 'visual-or-table-content'] as const,
  principle:
    'Use one compact readability layer before the main content block so boardroom readers can interpret visuals without expanding the report into long-form method text.'
}

export const REPORT_STATIC_COPY_V3: Record<
  ReportProduct,
  {
    handoff_nonclaim: string
    score_explanation: string
    product_is: string
    product_not_for: string
    sdt_explanation: string
    allowedTerms: string[]
    forbiddenTerms: string[]
  }
> = {
  ES: {
    handoff_nonclaim:
      'Lees dit niet als bewijs van één oorzaak van vertrek en ook niet als garantie dat een interventie het patroon oplost.',
    score_explanation:
      'Elke response draagt bij aan een frictiescore op 1–10. Gebruik die als compacte managementsamenvatting, niet als diagnose of causaliteitsclaim.',
    product_is: 'ExitScan is bestuurlijke vertrekduiding op groepsniveau.',
    product_not_for: 'Niet bedoeld als diagnose, individuele beoordeling of bewezen ROI-model.',
    sdt_explanation:
      'SDT blijft de verklarende basislaag voor autonomie, competentie en verbondenheid binnen de werksituatie.',
    allowedTerms: ['vertrek', 'frictie', 'hoofdredenen', 'meespelende factoren', 'eerdere signalering'],
    forbiddenTerms: ['retentiesignaal', 'stay-intent', 'bevlogenheid', 'vertrekintentie-groepen']
  },
  RS: {
    handoff_nonclaim:
      'Lees dit niet als voorspelling van individueel vertrek en ook niet als diagnose van teamcultuur.',
    score_explanation:
      'Het retentiesignaal leest het groepsbeeld op 1–10. Gebruik het als samenvattende managementlaag, niet als predictor of objectief oordeel.',
    product_is: 'RetentieScan is vroegsignalering op behoud voor groepen en segmenten.',
    product_not_for: 'Niet bedoeld als brede MTO, individuele predictor of performance-instrument.',
    sdt_explanation:
      'SDT blijft de verklarende basislaag voor autonomie, competentie en verbondenheid naast de aanvullende behoudssignalen.',
    allowedTerms: ['retentiesignaal', 'stay-intent', 'bevlogenheid', 'vertrekintentie-groepen', 'behoud'],
    forbiddenTerms: ['vertrekredenen', 'werkfrictie zichtbaar', 'vervangingskosten', 'exposure_eur']
  }
}

export const PRODUCT_TERMINOLOGY_GUARDRAILS = {
  sharedDoNotUseAsPlaceholders: ['geen data beschikbaar', 'placeholder', 'tbd'],
  futureReuseRule:
    'Use the v3 reporting grammar by default for future management reports where product logic allows.'
}
