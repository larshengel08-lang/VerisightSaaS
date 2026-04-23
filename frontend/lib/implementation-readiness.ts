import type { DeliveryMode, ScanType } from '@/lib/types'

export function normalizeDeliveryMode(mode: DeliveryMode | null | undefined): DeliveryMode {
  return mode === 'live' ? 'live' : 'baseline'
}

export function getDeliveryModeLabel(mode: DeliveryMode | null | undefined, scanType: ScanType) {
  const resolved = normalizeDeliveryMode(mode)
  if (resolved === 'live') {
    return scanType === 'retention' ? 'Ritme / live' : 'Live / doorlopend'
  }
  return 'Baseline'
}

export function getDeliveryModeDescription(mode: DeliveryMode | null | undefined, scanType: ScanType) {
  const resolved = normalizeDeliveryMode(mode)
  if (resolved === 'live') {
    return scanType === 'retention'
      ? 'Gebruik dit pas nadat een eerste RetentieScan-baseline en opvolgritme staan. Live of ritme is een vervolgroute, geen standaard eerste setup.'
      : scanType === 'team'
        ? 'Gebruik dit pas nadat TeamScan in een latere wave ook echt als herhaal- of vervolgroute is geopend. In deze wave blijft TeamScan baseline-only.'
        : scanType === 'onboarding'
          ? 'Gebruik dit pas nadat onboarding in een latere wave ook echt als vervolg- of multi-checkpointroute is geopend. In deze wave blijft onboarding baseline-only.'
      : 'Gebruik dit pas nadat ExitScan Baseline, volumelogica en eigenaar voor opvolging scherp zijn. Live blijft een bewuste vervolgroute.'
  }

  return scanType === 'retention'
    ? 'Dit is de standaard eerste route voor RetentieScan. Gebruik baseline om eerst een privacy-first groepsbeeld en eerste managementduiding op te bouwen.'
    : scanType === 'team'
      ? 'Dit is de standaard eerste route voor TeamScan. Gebruik baseline om eerst een veilige department-first lokale read op te bouwen voordat verdere lokalisatie logisch wordt.'
      : scanType === 'onboarding'
        ? 'Dit is de standaard eerste route voor onboarding in deze wave. Gebruik baseline om eerst een enkel checkpoint per campaign op groepsniveau leesbaar te maken.'
    : 'Dit is de standaard eerste route voor ExitScan. Gebruik baseline om vertrek eerst bestuurlijk leesbaar te maken voordat doorlopende opvolging logisch wordt.'
}

export function getInviteDefaultForDeliveryMode(mode: DeliveryMode | null | undefined) {
  return normalizeDeliveryMode(mode) === 'baseline'
}

export type CampaignReadinessState = {
  setupComplete: boolean
  invitesLive: boolean
  outputReady: boolean
  analysisReady: boolean
  clientAccessActivated: boolean
  clientActivationPending: boolean
  launchReady: boolean
  headline: string
  detail: string
  nextStep: string
}

export function buildCampaignReadinessState({
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasMinDisplay,
  hasEnoughData,
  activeClientAccessCount,
  pendingClientInviteCount,
  importReady,
  launchControlReady = true,
  launchControlBlockers = [],
}: {
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  activeClientAccessCount: number
  pendingClientInviteCount: number
  importReady: boolean
  launchControlReady?: boolean
  launchControlBlockers?: string[]
}): CampaignReadinessState {
  const setupComplete = totalInvited > 0
  const invitesLive = setupComplete && invitesNotSent === 0
  const outputReady = hasMinDisplay && incompleteScores === 0
  const analysisReady = hasEnoughData && incompleteScores === 0
  const clientAccessActivated = activeClientAccessCount > 0
  const clientActivationPending = !clientAccessActivated && pendingClientInviteCount > 0
  const launchReady =
    importReady &&
    launchControlReady &&
    invitesLive &&
    outputReady &&
    (clientAccessActivated || clientActivationPending)

  if (!setupComplete) {
    return {
      setupComplete,
      invitesLive,
      outputReady,
      analysisReady,
      clientAccessActivated,
      clientActivationPending,
      launchReady,
      headline: 'Setup nog niet compleet',
      detail: 'Zonder respondenten is de implementation route nog niet gestart. Gebruik eerst een gecontroleerde import als hard startpunt.',
      nextStep: 'Importeer eerst een gevalideerd respondentbestand en bepaal daarna pas of invites direct uit mogen.',
    }
  }

  if (!importReady) {
    return {
      setupComplete,
      invitesLive,
      outputReady,
      analysisReady,
      clientAccessActivated,
      clientActivationPending,
      launchReady,
      headline: 'Import nog niet vrijgegeven',
      detail: 'Het deelnemersbestand is nog niet vrijgegeven voor launch. Controleer eerst de importpreview, herstel de gemelde rijen of kolommen en bevestig daarna opnieuw.',
      nextStep: 'Werk eerst het deelnemersbestand bij en rond de importcontrole af voordat je uitnodigingen of klantactivatie verder opent.',
    }
  }

  if (!invitesLive) {
    return {
      setupComplete,
      invitesLive,
      outputReady,
      analysisReady,
      clientAccessActivated,
      clientActivationPending,
      launchReady,
      headline: 'Invites nog niet volledig live',
      detail: `${invitesNotSent} respondent(en) hebben nog geen uitnodiging ontvangen. Houd livegang en klantactivatie terughoudend totdat de uitnodigingslaag klopt.`,
      nextStep: 'Controleer importkwaliteit en verstuur eerst alle ontbrekende uitnodigingen of reminders.',
    }
  }

  if (!launchControlReady) {
    return {
      setupComplete,
      invitesLive,
      outputReady,
      analysisReady,
      clientAccessActivated,
      clientActivationPending,
      launchReady,
      headline: 'Launchcontrole nog niet compleet',
      detail:
        launchControlBlockers.length > 0
          ? launchControlBlockers.join(' ')
          : 'Startdatum, communicatiepreview of reminderinstellingen missen nog expliciete bevestiging.',
      nextStep: 'Rond eerst de pre-launchcontrole af voordat je livegang of eerste klantactivatie als afgerond behandelt.',
    }
  }

  if (!outputReady) {
    return {
      setupComplete,
      invitesLive,
      outputReady,
      analysisReady,
      clientAccessActivated,
      clientActivationPending,
      launchReady,
      headline: 'Eerste output nog in opbouw',
      detail: incompleteScores > 0
        ? `${incompleteScores} response(s) bevatten nog onvolledige scoredata.`
        : `Er zijn ${totalCompleted} responses binnen; vanaf 5 wordt eerste detailweergave veilig genoeg voor klantuitleg en acceptatie.`,
      nextStep: 'Wacht op voldoende responses of herstel eerst de incomplete scoredata voordat je output als eerste managementread positioneert.',
    }
  }

  if (!clientAccessActivated && !clientActivationPending) {
    return {
      setupComplete,
      invitesLive,
      outputReady,
      analysisReady,
      clientAccessActivated,
      clientActivationPending,
      launchReady,
      headline: 'Klantactivatie nog niet gestart',
      detail: 'Setup en eerste output zijn bruikbaar, maar de klant heeft nog geen dashboardtoegang of openstaande activatie.',
      nextStep: 'Nodig nu de klantcontactpersoon uit en plan de eerste dashboard- of rapportread in dezelfde beweging.',
    }
  }

  if (clientActivationPending) {
    return {
      setupComplete,
      invitesLive,
      outputReady,
      analysisReady,
      clientAccessActivated,
      clientActivationPending,
      launchReady,
      headline: 'Klantactivatie loopt',
      detail: 'De activatiemail is verstuurd, maar dashboardtoegang is nog niet bevestigd. Houd support en eerste klantcontact daarom actief in de gaten.',
      nextStep: 'Bevestig accountactivatie en begeleid daarna het eerste dashboard- of rapportgebruik.',
    }
  }

  return {
    setupComplete,
    invitesLive,
    outputReady,
    analysisReady,
    clientAccessActivated,
    clientActivationPending,
    launchReady,
    headline: analysisReady ? 'Launch readiness op orde' : 'Eerste klantread mogelijk',
    detail: analysisReady
      ? 'Setup, inviteflow, eerste output en klanttoegang zijn op orde. Deze campagne is operationeel sterk genoeg voor eerste managementduiding.'
      : 'De klant kan veilig live, maar het inhoudelijke beeld blijft nog indicatief totdat er minstens 10 responses zijn.',
    nextStep: analysisReady
      ? 'Gebruik nu dashboard en rapport samen voor het eerste managementgesprek en leg de eerste eigenaar of vervolgstap vast.'
      : 'Gebruik deze campagne nu voor eerste klantread en responsopbouw, niet voor te scherpe patroonclaims.',
  }
}
