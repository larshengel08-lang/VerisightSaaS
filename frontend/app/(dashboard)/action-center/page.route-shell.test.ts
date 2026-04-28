import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildLiveActionCenterItems } from "@/lib/action-center-live";
import type { LiveActionCenterCampaignContext } from "@/lib/action-center-live-context";
import type { Campaign, CampaignStats } from "@/lib/types";
import type { CampaignDeliveryRecord } from "@/lib/ops-delivery";
import type { PilotLearningDossier } from "@/lib/pilot-learning";

function buildCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "campaign-exit",
    organization_id: "org-1",
    name: "Exit voorjaar",
    scan_type: "exit",
    delivery_mode: "live",
    is_active: true,
    enabled_modules: null,
    created_at: "2026-04-10T10:00:00.000Z",
    closed_at: null,
    ...overrides,
  };
}

function buildStats(overrides: Partial<CampaignStats> = {}): CampaignStats {
  return {
    campaign_id: "campaign-exit",
    campaign_name: "Exit voorjaar",
    scan_type: "exit",
    organization_id: "org-1",
    is_active: true,
    created_at: "2026-04-10T10:00:00.000Z",
    total_invited: 84,
    total_completed: 26,
    completion_rate_pct: 31,
    avg_risk_score: 6.8,
    avg_signal_score: 6.8,
    band_high: 12,
    band_medium: 9,
    band_low: 5,
    ...overrides,
  };
}

function buildDeliveryRecord(overrides: Partial<CampaignDeliveryRecord> = {}): CampaignDeliveryRecord {
  return {
    id: "delivery-exit",
    organization_id: "org-1",
    campaign_id: "campaign-exit",
    contact_request_id: null,
    lifecycle_stage: "first_management_use",
    exception_status: "none",
    operator_owner: "Verisight delivery",
    next_step: "Leg de eerste bounded opvolgstap vast.",
    operator_notes: "De eerste managementread staat klaar voor follow-through.",
    customer_handoff_note: "De managementread is klaar voor een eerste bounded follow-through.",
    launch_date: null,
    launch_confirmed_at: null,
    participant_comms_config: null,
    reminder_config: null,
    first_management_use_confirmed_at: "2026-04-20T09:00:00.000Z",
    follow_up_decided_at: null,
    learning_closed_at: null,
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-24T10:00:00.000Z",
    ...overrides,
  };
}

function buildDossier(overrides: Partial<PilotLearningDossier> = {}): PilotLearningDossier {
  return {
    id: "dossier-exit",
    organization_id: "org-1",
    campaign_id: "campaign-exit",
    contact_request_id: null,
    title: "Exit follow-through voorjaar",
    route_interest: "exitscan",
    scan_type: "exit",
    delivery_mode: "live",
    triage_status: "bevestigd",
    lead_contact_name: null,
    lead_organization_name: null,
    lead_work_email: null,
    lead_employee_count: null,
    buyer_question: null,
    expected_first_value: "Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.",
    buying_reason: null,
    trust_friction: null,
    implementation_risk: null,
    first_management_value: "Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?",
    first_action_taken: "Leg eigenaar en eerste correctie in het MT-overleg vast.",
    review_moment: "2026-05-12",
    adoption_outcome: null,
    management_action_outcome: "opschalen",
    next_route: null,
    stop_reason: null,
    case_evidence_closure_status: "lesson_only",
    case_approval_status: "draft",
    case_permission_status: "not_requested",
    case_quote_potential: "laag",
    case_reference_potential: "laag",
    case_outcome_quality: "indicatief",
    case_outcome_classes: [],
    claimable_observations: null,
    supporting_artifacts: null,
    case_public_summary: "De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.",
    created_by: null,
    updated_by: null,
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-24T10:00:00.000Z",
    ...overrides,
  } as PilotLearningDossier;
}

function buildLiveContext(): LiveActionCenterCampaignContext {
  return {
    campaign: buildCampaign(),
    stats: buildStats(),
    organizationName: "Acme BV",
    memberRole: "owner",
    scopeType: "department",
    scopeValue: "org-1::department::operations",
    scopeLabel: "Operations",
    peopleCount: 38,
    assignedManager: {
      userId: "manager-1",
      displayName: "Manager Operations",
      assignedAt: "2026-04-21T08:00:00.000Z",
    },
    deliveryRecord: buildDeliveryRecord(),
    deliveryCheckpoints: [],
    learningDossier: buildDossier(),
    learningCheckpoints: [],
  };
}

describe("action center landing shell", () => {
  it("keeps the server page thin and delegates the UI to ActionCenterPreview", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("buildLiveActionCenterItems(liveContexts)");
    expect(pageSource).toContain("getLiveActionCenterSummary(items)");
    expect(pageSource).toContain("<ActionCenterPreview");
    expect(pageSource).toContain("hideSidebar");
  });

  it("passes a focused campaign id from the route shell into the preview", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("searchParams");
    expect(pageSource).toContain("focusItemId");
    expect(pageSource).toContain("initialSelectedItemId={focusItemId}");
  });

  it("keeps route detail rendering delegated to preview helpers", () => {
    const previewSource = readFileSync(
      new URL("../../../components/dashboard/action-center-preview.tsx", import.meta.url),
      "utf8",
    );

    expect(previewSource).toContain("RouteFieldCard");
    expect(previewSource).toContain("RouteOutcomeCard");
    expect(previewSource).toContain("getReviewOutcomeMeta");
    expect(previewSource).toContain("getOwnerDisplayName");
    expect(previewSource).toContain("initialItems.find((item) => item.id === initialSelectedItemId)");
  });

  it("requires preview items to carry canonical core semantics as one grouped field", () => {
    const context = buildLiveContext();
    const [item] = buildLiveActionCenterItems([context]);

    expect(item).toBeDefined();
    expect(item.coreSemantics).toMatchObject({
      route: {
        campaignId: context.campaign.id,
        entryStage: "active",
        reviewOutcome: item.reviewOutcome,
      },
      reviewSemantics: {
        reviewOutcomeRaw: item.reviewOutcome,
        reviewOutcomeVisible: "bijstellen",
      },
      actionFrame: {
        owner: item.ownerName,
        expectedEffect: item.expectedEffect,
      },
      resultLoop: {
        whatWasTried: "Leg eigenaar en eerste correctie in het MT-overleg vast.",
      },
      closingSemantics: {
        status: "lopend",
      },
    });
  });
});
