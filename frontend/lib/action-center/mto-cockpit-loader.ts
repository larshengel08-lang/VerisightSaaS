import { createClient } from '@/lib/supabase/server'
import type {
  ManagementActionDepartmentOwnerDefault,
  ManagementActionRecord,
  ManagementActionReviewRecord,
  ManagementActionUpdateRecord,
} from '@/lib/management-actions'
import { buildMtoDepartmentReadModel } from '@/lib/products/mto/department-intelligence'
import type { Respondent, SurveyResponse } from '@/lib/types'

interface Args {
  campaignId: string
  organizationId: string
  canManageCampaign: boolean
  hasEnoughData: boolean
  responses: Array<SurveyResponse & { respondents: Respondent }>
  orgAverageSignal: number
}

export async function loadMtoActionCenterCampaignData(args: Args) {
  const supabase = await createClient()
  const departmentReadModel = args.hasEnoughData
    ? buildMtoDepartmentReadModel({
        responses: args.responses,
        orgAverageSignal: args.orgAverageSignal,
      })
    : null

  const { data: managementActionsRaw } = await supabase
    .from('management_actions')
    .select('*')
    .eq('organization_id', args.organizationId)
    .eq('campaign_id', args.campaignId)
    .order('created_at', { ascending: false })
  const managementActions = (managementActionsRaw ?? []) as ManagementActionRecord[]
  const actionIds = managementActions.map((action) => action.id)

  const { data: managementActionUpdatesRaw } =
    actionIds.length > 0
      ? await supabase
          .from('management_action_updates')
          .select('*')
          .in('action_id', actionIds)
          .order('created_at', { ascending: false })
      : { data: [] }
  const managementActionUpdates = (managementActionUpdatesRaw ?? []) as ManagementActionUpdateRecord[]

  const { data: managementActionReviewsRaw } =
    actionIds.length > 0
      ? await supabase
          .from('management_action_reviews')
          .select('*')
          .in('action_id', actionIds)
          .order('created_at', { ascending: false })
      : { data: [] }
  const managementActionReviews = (managementActionReviewsRaw ?? []) as ManagementActionReviewRecord[]

  const { data: managementActionOwnerDefaultsRaw } =
    args.canManageCampaign
      ? await supabase
          .from('management_action_department_owners')
          .select('*')
          .eq('organization_id', args.organizationId)
          .order('department', { ascending: true })
      : { data: [] }
  const managementActionOwnerDefaults = (
    managementActionOwnerDefaultsRaw ?? []
  ) as ManagementActionDepartmentOwnerDefault[]

  return {
    departmentReadModel,
    managementActions,
    managementActionUpdates,
    managementActionReviews,
    managementActionOwnerDefaults,
  }
}
