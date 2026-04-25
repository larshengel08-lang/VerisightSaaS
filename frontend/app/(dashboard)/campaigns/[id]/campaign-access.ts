import type { MemberRole } from '@/lib/types'

export type CampaignAccessState = {
  canRead: boolean
  canManage: boolean
  roleChip: string
  scopeChip: string
  noteTitle: string | null
  noteBody: string | null
  deniedTitle: string
  deniedBody: string
}

export type CampaignRouteUnavailableState = {
  eyebrow: string
  chipLabel: string
  title: string
  body: string
}

export function buildCampaignAccessState(args: {
  isVerisightAdmin: boolean
  membershipRole: MemberRole | null | undefined
}): CampaignAccessState {
  if (args.isVerisightAdmin) {
    return {
      canRead: true,
      canManage: true,
      roleChip: 'Verisight admin',
      scopeChip: 'Volledige campaignbediening',
      noteTitle: null,
      noteBody: null,
      deniedTitle: 'Deze campaign is niet beschikbaar',
      deniedBody:
        'Je hebt geen toegang tot deze campaign of hij bestaat niet meer binnen jouw accountbereik.',
    }
  }

  if (args.membershipRole === 'owner') {
    return {
      canRead: true,
      canManage: true,
      roleChip: 'Owner - Verisight',
      scopeChip: 'Volledige campaignbediening',
      noteTitle: null,
      noteBody: null,
      deniedTitle: 'Deze campaign is niet beschikbaar',
      deniedBody:
        'Je hebt geen toegang tot deze campaign of hij bestaat niet meer binnen jouw accountbereik.',
    }
  }

  if (args.membershipRole === 'member') {
    return {
      canRead: true,
      canManage: true,
      roleChip: 'Member - Verisight delivery',
      scopeChip: 'Beheer + meelezen',
      noteTitle: 'Je leest en beheert mee, maar de eerste eigenaar blijft expliciet',
      noteBody:
        'Je accountrol geeft je beheerrechten, maar is niet automatisch de eerste eigenaar van deze route. Kijk in Actie welke eerste eigenaar en eerste volgende stap nu leidend zijn.',
      deniedTitle: 'Deze campaign is niet beschikbaar',
      deniedBody:
        'Je hebt geen toegang tot deze campaign of hij bestaat niet meer binnen jouw accountbereik.',
    }
  }

  if (args.membershipRole === 'viewer') {
    return {
      canRead: true,
      canManage: false,
      roleChip: 'Viewer - klantread',
      scopeChip: 'Alleen lezen',
      noteTitle: 'Je leest mee, maar Verisight beheert deze route',
      noteBody:
        'Dit account is read-only voor dashboard en PDF. Verisight blijft owner van setup, activatievrijgave en delivery; in Actie zie je welke eerste volgende stap nu voorligt.',
      deniedTitle: 'Deze campaign is niet beschikbaar',
      deniedBody:
        'Je hebt geen toegang tot deze campaign of hij bestaat niet meer binnen jouw accountbereik.',
    }
  }

  return {
    canRead: false,
    canManage: false,
    roleChip: 'Geen campaigntoegang',
    scopeChip: 'Geen toegang',
    noteTitle: null,
    noteBody: null,
    deniedTitle: 'Deze campaign is niet beschikbaar',
    deniedBody:
      'Je hebt geen toegang tot deze campaign of hij bestaat niet meer binnen jouw accountbereik. Ga terug naar het campaignoverzicht of vraag Verisight om de juiste route vrij te geven.',
  }
}

export function buildCampaignRouteUnavailableState(reason: 'denied' | 'missing_data'): CampaignRouteUnavailableState {
  if (reason === 'missing_data') {
    return {
      eyebrow: 'Campaign nu niet beschikbaar',
      chipLabel: '404-achtig gedrag',
      title: 'Deze campaign is nu niet beschikbaar',
      body:
        'De campaign bestaat wel, maar heeft nog geen leesbare route of campaigndata om hier veilig te tonen. Ga terug naar het campaignoverzicht en open alleen campaigns die daar al expliciet zichtbaar zijn.',
    }
  }

  return {
    eyebrow: 'Geen campaigntoegang',
    chipLabel: 'Denied / no-access',
    title: 'Deze campaign is niet beschikbaar',
    body:
      'Je hebt geen toegang tot deze campaign of hij bestaat niet meer binnen jouw accountbereik. Ga terug naar het campaignoverzicht of vraag Verisight om de juiste route vrij te geven.',
  }
}
