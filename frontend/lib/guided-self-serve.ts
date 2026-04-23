import {
  FIRST_DASHBOARD_THRESHOLD,
  FIRST_INSIGHT_THRESHOLD,
  buildResponseActivationState,
} from '@/lib/response-activation'

type GuidedSelfServePhase =
  | 'closed'
  | 'participant_data_required'
  | 'import_validation_required'
  | 'launch_date_required'
  | 'communication_ready'
  | 'ready_to_invite'
  | 'survey_running'
  | 'dashboard_active'
  | 'first_next_step_available'

type GuidedStatusKey =
  | 'setup_incomplete'
  | 'participant_data_required'
  | 'import_validation_required'
  | 'launch_date_required'
  | 'communication_ready'
  | 'ready_to_invite'
  | 'survey_running'
  | 'dashboard_active'
  | 'first_next_step_available'

type GuidedCheckpointKey = 'implementation_intake' | 'import_qa' | 'invite_readiness'
type GuidedCheckpointState = 'pending' | 'confirmed' | 'not_applicable'
type GuidedActor = 'verisight' | 'customer' | 'shared'
type GuidedStatusState = 'done' | 'current' | 'blocked'

export interface GuidedStatusBlock {
  key: GuidedStatusKey
  label: string
  status: GuidedStatusState
}

export interface GuidedBlocker {
  title: string
  detail: string
  recovery: string
  actor: GuidedActor
}

export interface GuidedNextAction {
  title: string
  body: string
}

export interface GuidedSelfServeState {
  phase: GuidedSelfServePhase
  currentStateLabel: string
  headline: string
  detail: string
  nextAction: GuidedNextAction
  dashboardVisible: boolean
  deeperInsightsVisible: boolean
  verisightNow: string
  customerNow: string
  blockers: GuidedBlocker[]
  statusBlocks: GuidedStatusBlock[]
}

export interface GuidedSelfServeDisciplineInput {
  checkpointKey: GuidedCheckpointKey
  manualState: GuidedCheckpointState
}

interface GuidedSelfServeArgs {
  isActive: boolean
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  importQaConfirmed?: boolean
  launchTimingConfirmed?: boolean
  communicationReady?: boolean
  importReady?: boolean
}

const STATUS_FLOW: GuidedStatusKey[] = [
  'setup_incomplete',
  'participant_data_required',
  'import_validation_required',
  'launch_date_required',
  'communication_ready',
  'ready_to_invite',
  'survey_running',
  'dashboard_active',
  'first_next_step_available',
]

const PHASE_FLOW: GuidedSelfServePhase[] = [
  'participant_data_required',
  'import_validation_required',
  'launch_date_required',
  'communication_ready',
  'ready_to_invite',
  'survey_running',
  'dashboard_active',
  'first_next_step_available',
]

const PRE_LIVE_PHASES = new Set<GuidedSelfServePhase>([
  'participant_data_required',
  'import_validation_required',
  'launch_date_required',
  'communication_ready',
  'ready_to_invite',
])

const STATUS_LABELS: Record<GuidedStatusKey, string> = {
  setup_incomplete: 'Setup incompleet',
  participant_data_required: 'Deelnemersdata vereist',
  import_validation_required: 'Import validatie vereist',
  launch_date_required: 'Launchdatum vereist',
  communication_ready: 'Communicatie gereed',
  ready_to_invite: 'Klaar om uit te nodigen',
  survey_running: 'Respons loopt',
  dashboard_active: 'Dashboard actief',
  first_next_step_available: 'Eerste vervolgstap beschikbaar',
}

function checkpointCountsAsConfirmed(state: GuidedCheckpointState | undefined) {
  return state === 'confirmed' || state === 'not_applicable'
}

export function deriveGuidedSelfServeDiscipline(
  checkpoints: GuidedSelfServeDisciplineInput[],
) {
  const checkpointMap = new Map(
    checkpoints.map((checkpoint) => [checkpoint.checkpointKey, checkpoint.manualState]),
  )

  return {
    importQaConfirmed: checkpointCountsAsConfirmed(checkpointMap.get('import_qa')),
    launchTimingConfirmed: checkpointCountsAsConfirmed(
      checkpointMap.get('implementation_intake'),
    ),
    communicationReady: checkpointCountsAsConfirmed(checkpointMap.get('invite_readiness')),
  }
}

function buildStatusBlocks(phase: GuidedSelfServePhase | GuidedStatusKey): GuidedStatusBlock[] {
  if (phase === 'closed') {
    return STATUS_FLOW.map((key) => ({
      key,
      label: STATUS_LABELS[key],
      status: 'done',
    }))
  }

  if (phase === 'setup_incomplete') {
    return STATUS_FLOW.map((key) => ({
      key,
      label: STATUS_LABELS[key],
      status: key === 'setup_incomplete' ? 'current' : 'blocked',
    }))
  }

  const currentPhaseIndex = PHASE_FLOW.indexOf(phase as GuidedSelfServePhase)

  return STATUS_FLOW.map((key) => {
    if (key === 'setup_incomplete') {
      return {
        key,
        label: STATUS_LABELS[key],
        status: PRE_LIVE_PHASES.has(phase as GuidedSelfServePhase) ? 'current' : 'done',
      }
    }

    const phaseIndex = PHASE_FLOW.indexOf(key as GuidedSelfServePhase)
    return {
      key,
      label: STATUS_LABELS[key],
      status:
        phaseIndex < currentPhaseIndex
          ? 'done'
          : phaseIndex === currentPhaseIndex
            ? 'current'
            : 'blocked',
    }
  })
}

function buildState(
  phase: Exclude<GuidedSelfServePhase, 'closed'>,
  overrides: Omit<GuidedSelfServeState, 'phase' | 'currentStateLabel' | 'statusBlocks'>,
): GuidedSelfServeState {
  return {
    phase,
    currentStateLabel: STATUS_LABELS[phase],
    statusBlocks: buildStatusBlocks(phase),
    ...overrides,
  }
}

function buildGovernanceCarryoverBlockers(args: {
  importQaConfirmed: boolean
  launchTimingConfirmed: boolean
  communicationReady: boolean
  invitesNotSent: number
}) {
  const items: GuidedBlocker[] = []

  if (!args.importQaConfirmed) {
    items.push({
      title: 'Importcontrole mist nog expliciete bevestiging',
      detail:
        'De survey kan al beweging hebben, maar de administratieve import-QA is nog niet handmatig afgerond.',
      recovery:
        'Laat Verisight de importbevestiging netjes vastleggen zodat uitvoerstatus en deliverydiscipline gelijklopen.',
      actor: 'verisight',
    })
  }

  if (!args.launchTimingConfirmed) {
    items.push({
      title: 'Launchdiscipline mist nog timingbevestiging',
      detail:
        'Er is al live survey-activiteit, maar het launchmoment is nog niet expliciet bevestigd in deliverycontrol.',
      recovery:
        'Laat het gekozen launchmoment alsnog expliciet vastleggen zodat de route overdraagbaar blijft.',
      actor: 'shared',
    })
  }

  if (!args.communicationReady) {
    items.push({
      title: 'Communicatiebevestiging mist nog',
      detail:
        'De survey loopt of heeft gelopen, maar de communicatiegate staat administratief nog open.',
      recovery: 'Laat de launchcommunicatie alsnog expliciet bevestigen in dezelfde deliveryroute.',
      actor: 'shared',
    })
  }

  if (args.invitesNotSent > 0) {
    items.push({
      title: 'Nog niet alle uitnodigingen zijn verstuurd',
      detail: `${args.invitesNotSent} deelnemer(s) hebben nog geen uitnodiging of verzendbevestiging, terwijl de survey al wel loopt.`,
      recovery:
        'Werk de resterende uitnodigingen of launchbevestigingen bij zodat de survey netjes volledig live staat.',
      actor: 'customer',
    })
  }

  return items
}

function getClosedStatusKey(totalCompleted: number): GuidedStatusKey {
  const activationState = buildResponseActivationState(totalCompleted)

  if (activationState.deeperInsightsVisible) {
    return 'first_next_step_available'
  }

  if (activationState.dashboardVisible) {
    return 'dashboard_active'
  }

  return 'survey_running'
}

export function buildGuidedSelfServeState(args: GuidedSelfServeArgs): GuidedSelfServeState {
  const importQaConfirmed = args.importQaConfirmed ?? false
  const launchTimingConfirmed = args.launchTimingConfirmed ?? false
  const communicationReady = args.communicationReady ?? false
  const surveyLive = args.totalCompleted > 0 || args.invitesNotSent === 0
  const activationState = buildResponseActivationState(args.totalCompleted)

  if (!args.isActive) {
    const closedStatusKey = getClosedStatusKey(args.totalCompleted)
    const outputReached = activationState.dashboardVisible

    return {
      phase: 'closed',
      currentStateLabel: STATUS_LABELS[closedStatusKey],
      headline: 'Campagne gesloten',
      detail: outputReached
        ? 'De uitvoerfase is afgerond. Gebruik dashboard, rapport en terugblik nu voor het vervolggesprek en de gekozen opvolgroute.'
        : `De uitvoerfase is afgerond voordat de eerste veilige dashboarddrempel is gehaald. Tot er minstens ${FIRST_DASHBOARD_THRESHOLD} responses zijn, blijven dashboard en rapport nog gesloten.`,
      nextAction: {
        title: outputReached ? 'Plan het vervolggesprek' : 'Beslis of een heropening nodig is',
        body: outputReached
          ? 'Gebruik de uitkomst nu om eerste besluiten, eigenaar en vervolgroute expliciet te maken.'
          : 'Zonder eerste dashboardread blijft deze wave onder de veilige leesdrempel. Heropen alleen als extra respons nog logisch en methodologisch eerlijk is.',
      },
      dashboardVisible: activationState.dashboardVisible,
      deeperInsightsVisible: activationState.deeperInsightsVisible,
      verisightNow: outputReached
        ? 'Verisight bewaakt nu vooral de nette close-out, rapporttoegang en bounded follow-up van deze campagne.'
        : 'Verisight bewaakt nu vooral een nette close-out zonder output vrij te geven onder de leesdrempel.',
      customerNow: outputReached
        ? 'Gebruik de output nu voor terugblik, besluitvorming en het expliciet kiezen van een vervolgroute.'
        : 'Beoordeel nu alleen of extra respons nog logisch is; zonder veilige dashboardread blijft deze campagne inhoudelijk bewust beperkt.',
      blockers: outputReached
        ? []
        : [
            {
              title: 'Eerste dashboardread is niet gehaald',
              detail: activationState.statusDetail,
              recovery:
                'Heropen alleen als extra respons nog logisch en methodologisch eerlijk is.',
              actor: 'shared',
            },
          ],
      statusBlocks: buildStatusBlocks(closedStatusKey),
    }
  }

  if (args.totalInvited === 0) {
    return buildState('participant_data_required', {
      headline: 'Deelnemersbestand ontbreekt nog',
      detail:
        'Na login zie je direct waar de campagne staat: account en campagne staan klaar, maar zonder deelnemersbestand blijft setup bewust dicht.',
      nextAction: {
        title: 'Lever het deelnemersbestand aan',
        body: 'Upload een CSV- of Excel-bestand met minimaal e-mailadressen. Pas daarna kan Verisight de importpreview en launchflow veilig vrijgeven.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      verisightNow:
        'Verisight bewaakt productgrenzen, campagne-opzet en de gesloten launchflow tot er bruikbare deelnemersdata is.',
      customerNow:
        'Lever nu alleen het juiste deelnemersbestand aan. Je hoeft geen surveytool, productsetup of rapportinstellingen te beheren.',
      blockers: [
        {
          title: 'Deelnemersbestand ontbreekt',
          detail:
            'Zonder deelnemers kan de campagne nog niet naar importcontrole of uitnodigingen bewegen.',
          recovery:
            'Upload een CSV- of Excel-bestand met minimaal e-mailadressen via de uitvoerflow.',
          actor: 'customer',
        },
        {
          title: 'Setup blijft bewust begrensd',
          detail:
            'Het dashboard gaat pas open als data, importcontrole en launchdiscipline expliciet rond zijn.',
          recovery:
            'Wacht niet op dashboardoutput; lever eerst het bestand aan zodat Verisight de volgende gate kan vrijgeven.',
          actor: 'verisight',
        },
      ],
    })
  }

  if (args.importReady === false) {
    return buildState('import_validation_required', {
      headline: 'Import validatie vereist',
      detail:
        'Het deelnemersbestand is nog niet vrijgegeven voor launch. Controleer de preview, herstel de gemelde rijen of kolommen en ga pas daarna verder.',
      nextAction: {
        title: 'Controleer het deelnemersbestand',
        body: 'Werk de gemelde rijen of kolommen bij en controleer daarna opnieuw totdat de import echt klaar is voor start.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      verisightNow:
        'Verisight houdt de importgrenzen dicht tot preview, veldkwaliteit en releasecondities methodisch kloppen.',
      customerNow:
        'Herstel nu alleen het deelnemersbestand en controleer opnieuw; launch en dashboard blijven bewust gesloten.',
      blockers: [
        {
          title: 'Het deelnemersbestand vraagt nog herstel',
          detail:
            'De preview of kolomkwaliteit is nog niet schoon genoeg om deze campagne veilig vrij te geven voor start.',
          recovery:
            'Werk de gemelde rijen of kolommen bij en controleer opnieuw tot de import zonder blokkades door de preview komt.',
          actor: 'customer',
        },
      ],
    })
  }

  if (surveyLive) {
    const governanceCarryoverBlockers = buildGovernanceCarryoverBlockers({
      importQaConfirmed,
      launchTimingConfirmed,
      communicationReady,
      invitesNotSent: args.invitesNotSent,
    })

    if (!args.hasMinDisplay) {
      return buildState('survey_running', {
        headline: 'Respons loopt, dashboard nog bewust dicht',
        detail: activationState.statusDetail,
        nextAction: {
          title: 'Volg respons en houd de route in beweging',
          body: 'Laat de vragenlijst eerst verder lopen, stuur zo nodig reminders en bouw meer responses op voordat je volledige dashboarduitlezing verwacht.',
        },
        dashboardVisible: false,
        deeperInsightsVisible: false,
        verisightNow:
          'Verisight bewaakt de begrensde surveyflow, reminders en deliverykwaliteit terwijl de eerste responses binnenkomen.',
        customerNow:
          'Volg nu alleen respons en wacht met conclusies tot de eerste veilige dashboarddrempel is bereikt.',
        blockers: [
          {
            title: 'Nog onder de eerste leesdrempel',
            detail: activationState.statusDetail,
            recovery: `Bouw verder op naar minimaal ${FIRST_DASHBOARD_THRESHOLD} ingevulde responses voordat je dashboardgebruik verwacht.`,
            actor: 'shared',
          },
          ...governanceCarryoverBlockers,
        ],
      })
    }

    if (!args.hasEnoughData) {
      return buildState('dashboard_active', {
        headline: 'Dashboard actief, nog bewust compact',
        detail: activationState.statusDetail,
        nextAction: {
          title: 'Gebruik nu de compacte dashboardread',
          body: 'Lees wat al zichtbaar is, houd conclusies voorlopig indicatief en blijf tegelijk respons opbouwen richting patroonniveau.',
        },
        dashboardVisible: true,
        deeperInsightsVisible: false,
        verisightNow:
          'Verisight laat nu alleen de veilige eerste dashboardlaag zien en houdt verdiepende patronen nog bewust begrensd.',
        customerNow:
          'Gebruik nu de compacte dashboardread voor eerste richting, maar blijf respons opbouwen voordat je bredere managementconclusies trekt.',
        blockers: [
          {
            title: 'Verdieping blijft nog beperkt',
            detail: activationState.statusDetail,
            recovery: `Werk door naar minstens ${FIRST_INSIGHT_THRESHOLD} ingevulde responses voor een volwaardiger eerste vervolgstap.`,
            actor: 'shared',
          },
          ...governanceCarryoverBlockers,
        ],
      })
    }

    return buildState('first_next_step_available', {
      headline: 'Eerste vervolgstap beschikbaar',
      detail:
        `De campagne heeft nu genoeg respons voor veilige dashboardactivatie en eerste patroonduiding. Vanaf ${FIRST_INSIGHT_THRESHOLD} responses hoort de flow door te schuiven naar de eerste managementstap, niet terug naar setup.`,
      nextAction: {
        title: 'Maak de eerste vervolgstap expliciet',
        body: 'Gebruik dashboard en rapport nu om eerste eigenaar, eerste managementactie en reviewmoment vast te leggen.',
      },
      dashboardVisible: true,
      deeperInsightsVisible: true,
      verisightNow:
        'Verisight bewaakt nu vooral dat de route bounded blijft en netjes doorloopt naar managementgebruik en follow-up.',
      customerNow:
        'Leg nu vast wat de eerste managementactie is, wie eigenaar wordt en wanneer jullie de vervolgstap reviewen.',
      blockers: governanceCarryoverBlockers,
    })
  }

  if (!importQaConfirmed) {
    return buildState('import_validation_required', {
      headline: 'Import validatie vereist',
      detail: `${args.totalInvited} deelnemer(s) staan in de campagne, maar de importcontrole is nog niet expliciet bevestigd. Daardoor blijft start bewust geblokkeerd.`,
      nextAction: {
        title: 'Rond de importcontrole af',
        body: 'Controleer preview, metadata en fouten eerst volledig. Pas na een schone import hoort deze flow door te schuiven naar launchdiscipline.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      verisightNow:
        'Verisight bewaakt de importgrenzen, previewkwaliteit en foutopvang zodat de launchflow geen vervuilde deelnemerslaag krijgt.',
      customerNow:
        'Controleer nu alleen of het juiste deelnemersbestand is aangeleverd en herstel eventuele importissues in dezelfde flow.',
      blockers: [
        {
          title: 'Importcontrole staat nog open',
          detail:
            'De campagne heeft deelnemers, maar er is nog geen expliciete QA-bevestiging op preview, metadata en importkeuze.',
          recovery:
            'Bevestig eerst dat de aangeleverde rijen kloppen en herstel fouten voordat je verdergaat.',
          actor: 'shared',
        },
      ],
    })
  }

  if (!launchTimingConfirmed) {
    return buildState('launch_date_required', {
      headline: 'Launchmoment staat nog niet vast',
      detail:
        'De deelnemerslaag is gevalideerd, maar de survey hoort nog niet live te gaan zolang timing en launchmoment niet expliciet zijn bevestigd.',
      nextAction: {
        title: 'Bevestig het launchmoment',
        body: 'Maak expliciet wanneer de uitnodigingen de deur uit mogen. Daarna kan de flow pas naar communicatiecontrole en bewuste release.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      verisightNow:
        'Verisight houdt de uitnodigingen bewust tegen tot timing, doelgroep en launchdiscipline expliciet zijn bevestigd.',
      customerNow:
        'Bevestig nu wanneer de vragenlijst echt mag starten. Nog niet uitnodigen voordat dit launchmoment helder is.',
      blockers: [
        {
          title: 'Launchmoment ontbreekt',
          detail: 'Zonder bevestigd launchmoment wordt uitnodigen te vroeg of oncontroleerbaar.',
          recovery: 'Leg vast op welk moment de uitnodigingen veilig live mogen gaan.',
          actor: 'customer',
        },
      ],
    })
  }

  if (!communicationReady) {
    return buildState('communication_ready', {
      headline: 'Communicatie moet nog launch-klaar worden',
      detail:
        'Timing staat, maar de launchflow blijft nog dicht tot de communicatie en contactroute expliciet gereed zijn verklaard.',
      nextAction: {
        title: 'Bevestig dat de communicatie gereed is',
        body: 'Zorg dat aankondiging, intern contactmoment en deliveryverwachting kloppen. Pas dan horen de uitnodigingen echt vrijgegeven te worden.',
      },
      dashboardVisible: false,
      deeperInsightsVisible: false,
      verisightNow:
        'Verisight bewaakt releasecontrole, invitegrenzen en deliverydiscipline totdat communicatie en timing samen groen zijn.',
      customerNow:
        'Bevestig nu dat de interne communicatie klaarstaat en dat deelnemers het juiste contactmoment krijgen.',
      blockers: [
        {
          title: 'Communicatie is nog niet vrijgegeven',
          detail:
            'De campagne heeft wel data en timing, maar nog geen expliciete bevestiging dat de launchcommunicatie klopt.',
          recovery:
            'Bevestig eerst dat de aankondiging en het contactmoment gereed zijn voor deze launch.',
          actor: 'shared',
        },
      ],
    })
  }

  return buildState('ready_to_invite', {
    headline: 'De setup staat klaar voor launch',
      detail:
        `${args.totalInvited} deelnemer(s) staan klaar. Product, import, launchmoment en communicatie zijn gecontroleerd; de uitnodigingen wachten alleen nog op bewuste start.`,
    nextAction: {
      title: 'Start de uitnodigingen',
      body: 'Start nu bewust de uitnodigingen. Daarna verschuift de aandacht van setup naar lopende respons en responsmonitoring.',
    },
    dashboardVisible: false,
    deeperInsightsVisible: false,
    verisightNow:
      'Verisight heeft de veilige launchflow voorbereid en houdt de release begrensd tot deze bewuste startstap.',
    customerNow:
      'Start nu de uitnodigingen voor deze campagne. Daarna hoef je vooral nog respons te volgen, niet terug naar setup.',
    blockers: [
      {
        title: 'Uitnodigingen zijn nog niet gestart',
        detail: 'De launchflow is verder groen, maar zonder invite-release blijft de survey nog stil.',
        recovery: 'Start de uitnodigingen vanuit deze flow zodra het gekozen moment bereikt is.',
        actor: 'customer',
      },
    ],
  })
}
