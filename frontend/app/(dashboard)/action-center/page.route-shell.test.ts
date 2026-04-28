import { readFileSync } from "node:fs";
import { ActionCenterPreview } from "@/components/dashboard/action-center-preview";
import { describe, expect, it } from "vitest";
import { projectActionCenterCoreSemantics } from "@/lib/action-center-core-semantics";
import { buildLiveActionCenterItems } from "@/lib/action-center-live";
import type { LiveActionCenterCampaignContext } from "@/lib/action-center-live-context";
import { projectActionCenterRoute } from "@/lib/action-center-route-contract";
import type { Campaign, CampaignStats } from "@/lib/types";
import type { CampaignDeliveryRecord } from "@/lib/ops-delivery";
import type { PilotLearningDossier } from "@/lib/pilot-learning";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

  it("renders detail-first review meaning and action frame from grouped core semantics", () => {
    const context = buildLiveContext();
    const [item] = buildLiveActionCenterItems([context]);

    const markup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [item],
        initialSelectedItemId: item.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );

    expect(markup).toContain("Waarom we opnieuw kijken");
    expect(markup).toContain(item.coreSemantics.reviewSemantics.reviewReason);
    expect(markup).toContain("Wat we dan toetsen");
    expect(markup).toContain(item.coreSemantics.reviewSemantics.reviewQuestion);
    expect(markup).toContain("Laatste reviewuitkomst");
    expect(markup).toContain("Bijstellen");
    expect(markup).toContain("Waarom nu");
    expect(markup).toContain(item.coreSemantics.actionFrame.whyNow);
    expect(markup).toContain("Eerste stap");
    expect(markup).toContain(item.coreSemantics.actionFrame.firstStep);
    expect(markup).toContain("Eigenaar");
    expect(markup).toContain(item.coreSemantics.actionFrame.owner);
    expect(markup).toContain("Verwacht effect");
    expect(markup).toContain(item.coreSemantics.actionFrame.expectedEffect);
  });

  it("renders the compact result loop on route detail from grouped result semantics", () => {
    const context = buildLiveContext();
    const [item] = buildLiveActionCenterItems([context]);

    const markup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [item],
        initialSelectedItemId: item.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );

    expect(markup).toContain("Wat is geprobeerd");
    expect(markup).toContain(item.coreSemantics.resultLoop.whatWasTried);
    expect(markup).toContain("Wat zagen we terug");
    expect(markup).toContain(item.coreSemantics.resultLoop.whatWeObserved);
    expect(markup).toContain("Wat is besloten");
    expect(markup).toContain(item.coreSemantics.resultLoop.whatWasDecided);
  });

  it("renders closing semantics only for completed or intentionally stopped routes", () => {
    const context = buildLiveContext();
    const [baseItem] = buildLiveActionCenterItems([context]);
    const completedItem = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        closingSemantics: {
          status: "afgerond" as const,
        },
      },
    };
    const stoppedItem = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        closingSemantics: {
          status: "gestopt" as const,
        },
      },
    };

    const ongoingMarkup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [baseItem],
        initialSelectedItemId: baseItem.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );
    const completedMarkup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [completedItem],
        initialSelectedItemId: completedItem.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );
    const stoppedMarkup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [stoppedItem],
        initialSelectedItemId: stoppedItem.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );

    expect(ongoingMarkup).not.toContain("Afgerond voor nu");
    expect(ongoingMarkup).not.toContain("Bewust gestopt");
    expect(completedMarkup).toContain("Afgerond voor nu");
    expect(stoppedMarkup).toContain("Bewust gestopt");
  });

  it("keeps the landing summary compact with a last route-read instead of full detail semantics", () => {
    const context = buildLiveContext();
    const [item] = buildLiveActionCenterItems([context]);

    const markup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [item],
        initialSelectedItemId: item.id,
        initialView: "overview",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );

    expect(markup).toContain("Laatste route-read");
    expect(markup).toContain(item.coreSemantics.resultLoop.whatWeObserved);
    expect(markup).not.toContain("Waarom we opnieuw kijken");
    expect(markup).not.toContain("Wat we dan toetsen");
    expect(markup).not.toContain("Wat is geprobeerd");
    expect(markup).not.toContain("Wat zagen we terug");
    expect(markup).not.toContain("Wat is besloten");
  });

  it("requires preview items to carry canonical core semantics as one grouped field", () => {
    const context = buildLiveContext();
    const [item] = buildLiveActionCenterItems([context]);
    const route = projectActionCenterRoute(context);

    expect(item).toBeDefined();
    expect(item.coreSemantics).toEqual(projectActionCenterCoreSemantics({
      campaign: context.campaign,
      assignedManager: context.assignedManager,
      deliveryRecord: context.deliveryRecord,
      learningDossier: context.learningDossier,
      learningCheckpoints: context.learningCheckpoints,
      route,
    }));
    expect(item.coreSemantics).toMatchObject({
      route: {
        campaignId: context.campaign.id,
        entryStage: "active",
        reviewOutcome: item.reviewOutcome,
      },
      reviewSemantics: {
        reviewReason: item.reviewReason ?? item.reason,
        reviewOutcomeRaw: item.reviewOutcome,
        reviewOutcomeVisible: "bijstellen",
        reviewQuestion: item.expectedEffect ?? item.nextStep,
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
