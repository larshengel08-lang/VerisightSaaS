import type { MemberRole } from '@/lib/types'

export type CustomerCampaignAction =
  | 'view_dashboard'
  | 'view_report'
  | 'import_respondents'
  | 'launch_invites'
  | 'send_reminders'
  | 'review_launch'

const OWNER_ONLY_ACTIONS = new Set<CustomerCampaignAction>([
  'import_respondents',
  'launch_invites',
  'send_reminders',
  'review_launch',
])

const SHARED_READ_ACTIONS = new Set<CustomerCampaignAction>(['view_dashboard', 'view_report'])

const ACTION_LABELS: Record<CustomerCampaignAction, string> = {
  view_dashboard: 'Dashboard lezen',
  view_report: 'Rapport gebruiken',
  import_respondents: 'Deelnemers aanleveren',
  launch_invites: 'Inviteflow starten',
  send_reminders: 'Reminders versturen',
  review_launch: 'Launchstatus en vervolgstap bevestigen',
}

export function getCustomerActionPermission(
  role: MemberRole | null | undefined,
  action: CustomerCampaignAction,
) {
  if (!role) {
    return false
  }

  if (SHARED_READ_ACTIONS.has(action)) {
    return true
  }

  if (OWNER_ONLY_ACTIONS.has(action)) {
    return role === 'owner'
  }

  return false
}

export function getPermissionDeniedMessage(action: Exclude<CustomerCampaignAction, 'view_dashboard' | 'view_report'>) {
  switch (action) {
    case 'import_respondents':
      return 'Alleen de klant owner kan deelnemers aanleveren. Stem deze stap af met de aangewezen owner of laat Verisight begeleiden.'
    case 'launch_invites':
      return 'Alleen de klant owner kan de inviteflow starten. Controleer eerst wie deze campaign draagt voordat je verdergaat.'
    case 'send_reminders':
      return 'Alleen de klant owner kan reminders versturen. Houd ownership en timing eerst expliciet.'
    case 'review_launch':
    default:
      return 'Alleen de klant owner kan launchstatus en vervolgstap bevestigen.'
  }
}

export function getCustomerRoleSummary(role: MemberRole | null | undefined) {
  if (role === 'owner') {
    return {
      label: 'Klant owner',
      description:
        'Draagt de klantuitvoering op launchkritieke stappen en houdt ownership, timing en vervolgstap expliciet.',
      allowedActions: [
        ACTION_LABELS.import_respondents,
        ACTION_LABELS.launch_invites,
        ACTION_LABELS.send_reminders,
        ACTION_LABELS.review_launch,
      ],
      restrictedActions: [] as string[],
    }
  }

  if (role === 'member') {
    return {
      label: 'Member',
      description:
        'Heeft ondersteunende toegang binnen begeleide uitvoering, maar launchkritieke klantacties blijven bewust bij de klant owner.',
      allowedActions: [ACTION_LABELS.view_dashboard, ACTION_LABELS.view_report],
      restrictedActions: [
        ACTION_LABELS.import_respondents,
        ACTION_LABELS.launch_invites,
        ACTION_LABELS.send_reminders,
        ACTION_LABELS.review_launch,
      ],
    }
  }

  if (role === 'viewer') {
    return {
      label: 'Viewer',
      description:
        'Blijft read-first: gebruikt dashboard en rapport, maar neemt geen launchkritieke acties.',
      allowedActions: [ACTION_LABELS.view_dashboard, ACTION_LABELS.view_report],
      restrictedActions: [
        ACTION_LABELS.import_respondents,
        ACTION_LABELS.launch_invites,
        ACTION_LABELS.send_reminders,
        ACTION_LABELS.review_launch,
      ],
    }
  }

  return {
    label: 'Geen rol',
    description: 'Deze gebruiker heeft nog geen expliciete klantrol voor deze campaign.',
    allowedActions: [] as string[],
    restrictedActions: [
      ACTION_LABELS.import_respondents,
      ACTION_LABELS.launch_invites,
      ACTION_LABELS.send_reminders,
      ACTION_LABELS.review_launch,
    ],
  }
}
