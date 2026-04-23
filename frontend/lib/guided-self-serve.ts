type GuidedSelfServePhase =
  | 'closed'
  | 'data_required'
  | 'ready_to_invite'
  | 'responses_incoming'
  | 'dashboard_active'
  | 'first_next_step_available'

type GuidedStatusKey =
  | 'setup_incomplete'
  | 'data_required'
  | 'ready_to_invite'
  | 'responses_incoming'
  | 'dashboard_active'
  | 'first_next_step_available'

type GuidedStatusState = 'done' | 'current' | 'blocked'

export interface GuidedStatusBlock {
  key: GuidedStatusKey
  label: string
  status: GuidedStatusState
}

export interface GuidedNextAction {
  title: string
  body: string
}

export interface GuidedSelfServeState {
  phase: GuidedSelfServePhase
  headline: string
  detail: string
  nextAction: GuidedNextAction
  dashboardVisible: boolean
  deeperInsightsVisible: boolean
  statusBlocks: GuidedStatusBlock[]
}

interface GuidedSelfServeArgs {
  isActive: boolean
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
}

const STATUS_FLOW: GuidedStatusKey[] = [
  'setup_incomplete',
  'data_required',
  'ready_to_invite',
  'responses_incoming',
  'dashboard_active',
  'first_next_step_available',
]

const STATUS_LABELS: Record<GuidedStatusKey, string> = {
  setup_incomplete: 'Setup incompleet',
  data_required: 'Data vereist',
  ready_to_invite: 'Klaar om uit te nodigen',
  responses_incoming: 'Responses binnen',
  dashboard_active: 'Dashboard actief',
  first_next_step_available: 'Eerste vervolgstap beschikbaar',
}

function buildStatusBlocks(current: GuidedStatusKey): GuidedStatusBlock[] {
  const currentIndex = STATUS_FLOW.indexOf(current)

  return STATUS_FLOW.map((key, index) => ({
    key,
    label: STATUS_LABELS[key],
    status: index < currentIndex ? 'done' : index === currentIndex ? 'current' : current === 'setup_incomplete' ? 'blocked' : 'blocked',
  }))
}

export function buildGuidedSelfServeState(args: GuidedSelfServeArgs): GuidedSelfServeState {
  if (!args.isActive) {
    return {
      phase: 'closed',
      headline: 'Campagne gesloten',
      detail: 'De uitvoerfase is afgerond. Gebruik dashboard, rapport en terugblik nu voor het vervolggesprek en de gekozen opvolgroute.',
      nextAction: {
        title: 'Plan het vervolggesprek',
        body: 'Gebruik de uitkomst nu om eerste besluiten, eigenaar en vervolgroute expliciet te maken.',
      },
      dashboardVisible: true,
      deeperInsightsVisible: true,
      statusBlocks: buildStatusBlocks('first_next_step_available'),
    }
  }

  if (args.totalInvited === 0) {
    return {
      phase: 'data_required',
      headline: 'Deelnemersbestand ontbreekt nog',
      detail: 'Verisight heeft account en campagne klaargezet. Lever nu eerst het deelnemersbestand aan en controleer daarna de importpreview voordat iemand wordt uitgenodigd.',
      nextAction: {
        title: 'Lever het deelnemersbestand aan',
        body: 'Upload een CSV- of Excel-bestand, controleer de validatie en ga pas daarna door naar uitnodigen.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      statusBlocks: buildStatusBlocks('setup_incomplete').map((item) =>
        item.key === 'data_required' ? { ...item, status: 'current' } : item,
      ),
    }
  }

  if (args.invitesNotSent > 0) {
    return {
      phase: 'ready_to_invite',
      headline: 'De setup staat klaar voor launch',
      detail: `${args.totalInvited} deelnemer(s) staan klaar, maar ${args.invitesNotSent} uitnodiging(en) zijn nog niet verstuurd. Controleer de aanlevering en start daarna pas de inviteflow.`,
      nextAction: {
        title: 'Verstuur de uitnodigingen',
        body: 'Zodra het bestand klopt kun je de inviteflow veilig starten. Tot die tijd blijft het dashboard bewust gesloten.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      statusBlocks: buildStatusBlocks('ready_to_invite'),
    }
  }

  if (!args.hasMinDisplay) {
    return {
      phase: 'responses_incoming',
      headline: 'Responses lopen binnen',
      detail: `Er zijn ${args.totalCompleted} responses binnen. Vanaf 5 responses wordt de eerste dashboardread veilig genoeg om zichtbaar te maken.`,
      nextAction: {
        title: 'Volg respons en stuur zo nodig een reminder',
        body: 'Laat de inviteflow eerst verder lopen en bouw meer responses op. Het dashboard gaat pas open zodra de eerste veilige responsegrens is gehaald.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      statusBlocks: buildStatusBlocks('responses_incoming'),
    }
  }

  if (!args.hasEnoughData) {
    return {
      phase: 'dashboard_active',
      headline: 'Dashboard actief, nog bewust compact',
      detail: `De eerste veilige drempel is gehaald. Vanaf ${args.totalCompleted} responses is de dashboardread bruikbaar, maar verdiepende patroonduiding blijft bewust dicht tot minstens 10 responses.`,
      nextAction: {
        title: 'Gebruik nu de compacte dashboardread',
        body: 'Lees wat al zichtbaar is, houd conclusies voorlopig indicatief en blijf tegelijk respons opbouwen richting patroonniveau.',
      },
      dashboardVisible: true,
      deeperInsightsVisible: false,
      statusBlocks: buildStatusBlocks('dashboard_active'),
    }
  }

  return {
    phase: 'first_next_step_available',
    headline: 'Eerste vervolgstap beschikbaar',
    detail: 'De campagne heeft nu genoeg respons voor veilige dashboardactivatie en eerste patroonduiding. Vanaf hier hoort de flow door te schuiven naar de eerste managementstap, niet terug naar setup.',
    nextAction: {
      title: 'Maak de eerste vervolgstap expliciet',
      body: 'Gebruik dashboard en rapport nu om eerste eigenaar, eerste managementactie en reviewmoment vast te leggen.',
    },
    dashboardVisible: true,
    deeperInsightsVisible: true,
    statusBlocks: buildStatusBlocks('first_next_step_available'),
  }
}
