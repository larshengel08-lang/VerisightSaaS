import type { ActionCenterFollowThroughMailTriggerType } from '@/lib/action-center-follow-through-mail'

export interface ActionCenterFollowThroughMailRenderInput {
  triggerType: ActionCenterFollowThroughMailTriggerType
  recipientRole: 'manager' | 'hr_oversight'
  campaignName: string
  scopeLabel: string
  actionCenterHref: string
  inviteArtifactHref?: string | null
}

export interface ActionCenterFollowThroughMailRendered {
  subject: string
  emailText: string
  emailHtml: string
}

function buildSubject(args: Pick<ActionCenterFollowThroughMailRenderInput, 'triggerType' | 'campaignName' | 'scopeLabel'>) {
  switch (args.triggerType) {
    case 'assignment_created':
      return `Nieuwe Action Center-route ${args.campaignName} / ${args.scopeLabel}`
    case 'review_upcoming':
      return `Reviewmoment ${args.campaignName} / ${args.scopeLabel}`
    case 'review_overdue':
      return `Review achterstallig ${args.campaignName} / ${args.scopeLabel}`
    case 'follow_up_open_after_review':
      return `Open follow-up na review ${args.campaignName} / ${args.scopeLabel}`
  }
}

function buildLead(args: Pick<ActionCenterFollowThroughMailRenderInput, 'triggerType' | 'recipientRole'>) {
  switch (args.triggerType) {
    case 'assignment_created':
      return 'Er staat een nieuwe toegewezen route klaar die aandacht vraagt in Action Center.'
    case 'review_upcoming':
      return 'Het geplande reviewmoment komt eraan. Open dit reviewmoment in Action Center.'
    case 'review_overdue':
      return args.recipientRole === 'manager'
        ? 'Het geplande reviewmoment is verstreken en vraagt nu aandacht in Action Center.'
        : 'Een reviewmoment blijft achterstallig en vraagt HR-oversight in Action Center.'
    case 'follow_up_open_after_review':
      return 'De review is vastgelegd, maar de route blijft open en vraagt nog bounded vervolg in Action Center.'
  }
}

export function renderActionCenterFollowThroughMail(
  args: ActionCenterFollowThroughMailRenderInput,
): ActionCenterFollowThroughMailRendered {
  const subject = buildSubject(args)
  const lead = buildLead(args)
  const instruction = 'Leg status, reviewuitkomst en vervolg alleen in Action Center vast.'
  const artifactBlock = args.inviteArtifactHref
    ? `Download desgewenst het bestaande agenda-artifact: ${args.inviteArtifactHref}`
    : null

  return {
    subject,
    emailText: [lead, `Open Action Center: ${args.actionCenterHref}`, artifactBlock, instruction]
      .filter(Boolean)
      .join('\n\n'),
    emailHtml: [
      `<p>${lead}</p>`,
      `<p>Open <a href="${args.actionCenterHref}">Action Center</a>.</p>`,
      args.inviteArtifactHref
        ? `<p>Download desgewenst het bestaande <a href="${args.inviteArtifactHref}">agenda-artifact</a>.</p>`
        : '',
      `<p>${instruction}</p>`,
    ].join(''),
  }
}
