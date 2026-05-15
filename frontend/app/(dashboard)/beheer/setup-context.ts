import type { Campaign, Organization } from '@/lib/types'

type SetupContextInput = {
  organizations: Pick<Organization, 'id' | 'is_active' | 'name' | 'slug'>[]
  campaigns: Pick<Campaign, 'id' | 'organization_id' | 'is_active' | 'created_at' | 'name'>[]
  selectedOrganizationId: string | null
  selectedCampaignId: string | null
}

type SetupContext = {
  selectedOrganizationId: string | null
  selectedCampaignId: string | null
  selectedOrganization: Pick<Organization, 'id' | 'is_active' | 'name' | 'slug'> | null
  selectedCampaign: Pick<Campaign, 'id' | 'organization_id' | 'is_active' | 'created_at' | 'name'> | null
  respondentsLocked: boolean
  clientAccessLocked: boolean
}

export function resolveSetupContext(input: SetupContextInput): SetupContext {
  const activeOrganizations = input.organizations.filter((organization) => organization.is_active)
  const selectedOrganization =
    activeOrganizations.find((organization) => organization.id === input.selectedOrganizationId) ?? activeOrganizations[0] ?? null

  const campaignsForOrganization = selectedOrganization
    ? input.campaigns
        .filter((campaign) => campaign.organization_id === selectedOrganization.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : []

  const selectedCampaign =
    campaignsForOrganization.find((campaign) => campaign.id === input.selectedCampaignId) ??
    campaignsForOrganization.find((campaign) => campaign.is_active) ??
    campaignsForOrganization[0] ??
    null

  return {
    selectedOrganizationId: selectedOrganization?.id ?? null,
    selectedCampaignId: selectedCampaign?.id ?? null,
    selectedOrganization,
    selectedCampaign,
    respondentsLocked: !selectedCampaign,
    clientAccessLocked: !selectedCampaign,
  }
}
