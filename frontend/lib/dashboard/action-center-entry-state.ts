import type { ActionCenterRouteContract } from '@/lib/action-center-route-contract'

export type ActionCenterEntryTone = 'slate' | 'amber' | 'emerald'

export type HrActionCenterEntryState = {
  label: string
  tone: ActionCenterEntryTone
  body: string
}

export function getActionCenterEntryState(
  route: Pick<ActionCenterRouteContract, 'entryStage' | 'routeStatus'>,
): HrActionCenterEntryState {
  if (route.entryStage === 'attention') {
    return {
      label: 'Nog geen opvolging geopend',
      tone: 'slate',
      body: 'Er is nog geen expliciete opvolging geopend in Action Center.',
    }
  }

  if (route.entryStage === 'candidate') {
    return {
      label: 'Route-kandidaat',
      tone: 'amber',
      body: 'Er zijn al eerste opvolgsignalen vastgelegd, maar de route is nog niet expliciet geopend.',
    }
  }

  switch (route.routeStatus) {
    case 'in-uitvoering':
      return {
        label: 'Actieve opvolging',
        tone: 'emerald',
        body: 'De opvolging is geopend en wordt nu actief uitgevoerd.',
      }
    case 'geblokkeerd':
      return {
        label: 'Actieve opvolging',
        tone: 'amber',
        body: 'De opvolging is geopend, maar vraagt eerst een zichtbare blokkade-oplossing.',
      }
    case 'afgerond':
      return {
        label: 'Actieve opvolging',
        tone: 'slate',
        body: 'De opvolging is geopend en als afgerond vastgelegd.',
      }
    case 'gestopt':
      return {
        label: 'Actieve opvolging',
        tone: 'slate',
        body: 'De opvolging is geopend en bewust gestopt.',
      }
    case 'te-bespreken':
    default:
      return {
        label: 'Actieve opvolging',
        tone: 'amber',
        body: 'De opvolging is geopend en wacht nog op eigenaar, eerste stap of reviewmoment.',
      }
  }
}
