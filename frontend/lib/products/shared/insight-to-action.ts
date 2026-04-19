import { getRiskBandFromScore } from '@/lib/management-language'
import type { ScanType } from '@/lib/types'
import type { ActionPlaybook, DashboardDecisionCard, DashboardFollowThroughCard } from '@/lib/products/shared/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity'] as const
const GUARDRAIL_REPLACEMENTS: Array<[string, string]> = [
  ['zal leiden tot', 'kan helpen bij'],
  ['garandeert', 'ondersteunt'],
  ['garanderen', 'ondersteunen'],
  ['bewijst', 'onderbouwt'],
  ['bewijs', 'onderbouwing'],
  ['oorzaak', 'spoor'],
  ['oorzaken', 'sporen'],
  ['oplossen', 'gericht opvolgen'],
]

export interface InsightToActionItem {
  title: string
  body: string
}

export interface InsightToActionFollowUpItem {
  window: '30 dagen' | '60 dagen' | '90 dagen'
  title: string
  body: string
}

export interface InsightToActionBlock {
  title: string
  intro: string
  managementPriorities: InsightToActionItem[]
  verificationQuestions: string[]
  possibleFirstActions: InsightToActionItem[]
  followUp30_60_90: InsightToActionFollowUpItem[]
  guardrailNote: string
}

function dedupeStrings(items: string[], limit: number) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    const normalized = item.replace(/\s+/g, ' ').trim()
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(normalized)
    if (result.length >= limit) break
  }
  return result
}

function softenCopy(text: string) {
  let softened = text.replace(/\s+/g, ' ').trim()
  for (const [source, target] of GUARDRAIL_REPLACEMENTS) {
    softened = softened.replaceAll(source, target)
    softened = softened.replaceAll(source.charAt(0).toUpperCase() + source.slice(1), target.charAt(0).toUpperCase() + target.slice(1))
  }
  return softened
}

function formatFocusText(labels: string[]) {
  if (labels.length === 0) return 'dit spoor'
  if (labels.length === 1) return labels[0]
  return `${labels[0]} en ${labels[1]}`
}

function getCardBody(cards: DashboardFollowThroughCard[], title: string, fallback: string) {
  return cards.find((card) => card.title === title)?.body ?? fallback
}

function ensureQuestion(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  return normalized.endsWith('?') ? normalized : `${normalized.replace(/[.]$/, '')}?`
}

function buildFallbackQuestions(scanType: ScanType, focusText: string, nextStepBody: string) {
  if (scanType === 'retention') {
    return [
      `Welk deel van ${focusText.toLowerCase()} vraagt nu eerst verificatie voordat opvolging breder wordt gemaakt?`,
      'Welke teams of contexten vragen nu als eerste een begrensde verificatie?',
      ensureQuestion(nextStepBody),
      'Welke eerste signalen moeten we binnen 60 dagen terugzien voordat we dit spoor zwaarder maken?',
      ensureQuestion(`Wanneer herwegen we of ${focusText.toLowerCase()} vervolgmeting of een andere route vraagt`),
    ]
  }

  return [
    `Welk deel van ${focusText.toLowerCase()} moeten we nu eerst toetsen voordat dit spoor breder wordt gemaakt?`,
    'Welke team- of managementcontext vraagt nu als eerste een gerichte verificatie?',
    ensureQuestion(nextStepBody),
    'Welke eerste signalen moeten we binnen 60 dagen terugzien voordat we dit als breder vertrekpatroon lezen?',
    ensureQuestion(`Wanneer herijken we of ${focusText.toLowerCase()} verdere verdieping of juist begrenzing vraagt`),
  ]
}

function buildFallbackActions(scanType: ScanType, focusText: string, firstAction: string, firstOwner: string) {
  const base = [
    firstAction,
    `Beleg ${firstOwner.toLowerCase()} als eerste eigenaar van ${focusText.toLowerCase()} en maak de eerstvolgende managementsessie expliciet.`,
  ]

  if (scanType === 'retention') {
    base.push(`Plan een beperkte verificatie of interventiestap rond ${focusText.toLowerCase()} en leg direct vast wanneer je terugkijkt.`)
  } else {
    base.push(`Kies een kleine verbeterstap rond ${focusText.toLowerCase()} en spreek direct af wanneer je terugkijkt op uitvoering en signalen.`)
  }

  return base
}

function buildFollowUp(scanType: ScanType, focusText: string, firstOwner: string, firstAction: string, reviewMoment: string): InsightToActionFollowUpItem[] {
  if (scanType === 'retention') {
    return [
      {
        window: '30 dagen',
        title: 'Maak verificatie en eigenaar expliciet',
        body: `Bevestig welk deel van ${focusText.toLowerCase()} nu eerst verificatie vraagt, beleg ${firstOwner.toLowerCase()} en maak de eerste stap concreet.`,
      },
      {
        window: '60 dagen',
        title: 'Review de eerste stap',
        body: `Toets of ${firstAction.toLowerCase()} zichtbaar loopt en welke eerste groepssignalen of werkritmes nu al verschuiven.`,
      },
      {
        window: '90 dagen',
        title: 'Herweeg vervolgroute',
        body: `Gebruik ${reviewMoment.toLowerCase()} om bewust te kiezen: doorgaan op hetzelfde spoor, beperkt verbreden, vervolgmeten of stoppen.`,
      },
    ]
  }

  return [
    {
      window: '30 dagen',
      title: 'Maak route en eigenaar expliciet',
      body: `Bevestig welk deel van ${focusText.toLowerCase()} nu eerst bestuurlijke opvolging vraagt, beleg ${firstOwner.toLowerCase()} en maak de eerste stap concreet.`,
    },
    {
      window: '60 dagen',
      title: 'Review de eerste verbeterstap',
      body: `Toets of ${firstAction.toLowerCase()} zichtbaar loopt en welke eerste signalen uit gesprek, context of nieuwe exitinput terugkomen.`,
    },
    {
      window: '90 dagen',
      title: 'Herweeg vervolgstap',
      body: `Gebruik ${reviewMoment.toLowerCase()} om bewust te kiezen: verdiepen, begrenzen, vervolgmeten of stoppen.`,
    },
  ]
}

export function buildDashboardInsightToAction({
  scanType,
  factorAverages,
  hasEnoughData,
  followThroughCards,
  nextStep,
  focusQuestions,
  actionPlaybooks,
}: {
  scanType: ScanType
  factorAverages: Record<string, number>
  hasEnoughData: boolean
  followThroughCards: DashboardFollowThroughCard[]
  nextStep: DashboardDecisionCard
  focusQuestions: Record<string, Record<string, string[]>>
  actionPlaybooks: Record<string, Record<string, ActionPlaybook>>
}): InsightToActionBlock | null {
  if (scanType !== 'exit' && scanType !== 'retention') {
    return null
  }

  const factorLabels: Record<string, string> = {
    leadership: 'Leiderschap',
    culture: 'Cultuur',
    growth: 'Groeiperspectief',
    compensation: 'Beloning',
    workload: 'Werkbelasting',
    role_clarity: 'Rolhelderheid',
  }

  const rankedFactors = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
    .map((factor) => ({
      key: factor,
      label: factorLabels[factor],
      signalValue: 11 - factorAverages[factor],
      band: getRiskBandFromScore(11 - factorAverages[factor]),
    }))
    .sort((a, b) => b.signalValue - a.signalValue)

  if (rankedFactors.length === 0) return null

  const primaryFactor = rankedFactors[0]
  const secondaryFactor = rankedFactors[1] ?? null
  const focusText = formatFocusText([primaryFactor.label, secondaryFactor?.label ?? ''].filter(Boolean))
  const firstOwner = getCardBody(followThroughCards, 'Eerste eigenaar', 'de eerste eigenaar')
  const firstAction = getCardBody(followThroughCards, 'Eerste actie', 'Maak de eerste stap expliciet.')
  const reviewMoment = getCardBody(followThroughCards, 'Reviewmoment', 'plan een bewust reviewmoment')
  const priorityNow = getCardBody(
    followThroughCards,
    'Prioriteit nu',
    `${focusText} vormen nu het eerste spoor om bestuurlijk te wegen.`,
  )

  const questionsFromFactors = rankedFactors.slice(0, 2).flatMap((factor) => focusQuestions[factor.key]?.[factor.band] ?? [])
  const questions = dedupeStrings(
    questionsFromFactors.concat(buildFallbackQuestions(scanType, focusText, nextStep.body)).map(softenCopy),
    5,
  )

  const actionsFromFactors = rankedFactors.slice(0, 2).flatMap((factor) => actionPlaybooks[factor.key]?.[factor.band]?.actions ?? [])
  const actionBodies = dedupeStrings(
    [firstAction].concat(actionsFromFactors, buildFallbackActions(scanType, focusText, firstAction, firstOwner)).map(softenCopy),
    3,
  )

  const guardrailNote =
    scanType === 'retention'
      ? hasEnoughData
        ? 'Gebruik dit als verificatie- en opvolgroute, niet als individuele predictor of bewijs van causaliteit.'
        : 'Dit blijft een indicatieve verificatie- en opvolgroute, niet een individuele predictor of bewijs van causaliteit.'
      : hasEnoughData
        ? 'Gebruik dit als managementinput: geen diagnose, geen causale zekerheid en geen individuele beoordeling.'
        : 'Dit blijft een indicatieve managementroute: geen diagnose, geen causale zekerheid en geen individuele beoordeling.'

  return {
    title: 'Van inzicht naar eerste opvolging',
    intro: 'Gebruik deze compacte bridge om bestaand dashboardmateriaal te vertalen naar een eerste managementroute.',
    managementPriorities: [
      {
        title: 'Prioriteit 1',
        body: softenCopy(priorityNow),
      },
      {
        title: 'Eerst afbakenen',
        body:
          scanType === 'retention' || !hasEnoughData
            ? softenCopy(`Houd verificatie eerst bounded: ${nextStep.body} Maak dit spoor niet groter voordat je het scherper hebt getoetst.`)
            : softenCopy(`${nextStep.body} Houd dit spoor bounded en toets eerst waar de meeste managementwaarde zit.`),
      },
      {
        title: 'Beleg eigenaar en review',
        body: softenCopy(`${firstOwner}. Maak daarnaast expliciet dat je ${reviewMoment.toLowerCase()}`),
      },
    ],
    verificationQuestions: questions,
    possibleFirstActions: actionBodies.map((body, index) => ({
      title: `Mogelijke eerste actie ${index + 1}`,
      body: softenCopy(body),
    })),
    followUp30_60_90: buildFollowUp(scanType, focusText, firstOwner, firstAction, reviewMoment).map((item) => ({
      ...item,
      body: softenCopy(item.body),
    })),
    guardrailNote,
  }
}
