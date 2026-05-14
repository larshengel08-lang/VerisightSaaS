import { readFileSync } from "node:fs";
import { ActionCenterPreview } from "@/components/dashboard/action-center-preview";
import { describe, expect, it } from "vitest";
import { projectActionCenterCoreSemantics } from "@/lib/action-center-core-semantics";
import { buildLiveActionCenterItems } from "@/lib/action-center-live";
import type { LiveActionCenterCampaignContext } from "@/lib/action-center-live-context";
import { projectActionCenterRoute } from "@/lib/action-center-route-contract";
import { projectActionCenterRouteFollowUpRelation } from "@/lib/action-center-route-reopen";
import type { Campaign, CampaignStats } from "@/lib/types";
import type { CampaignDeliveryRecord } from "@/lib/ops-delivery";
import type { PilotLearningCheckpoint, PilotLearningDossier } from "@/lib/pilot-learning";
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
    management_action_outcome: "bijstellen",
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

function buildCheckpoint(overrides: Partial<PilotLearningCheckpoint> = {}): PilotLearningCheckpoint {
  return {
    id: "checkpoint",
    dossier_id: "dossier-exit",
    checkpoint_key: "first_management_use",
    owner_label: "HR lead",
    status: "bevestigd",
    objective_signal_notes: null,
    qualitative_notes: null,
    interpreted_observation: null,
    confirmed_lesson: null,
    lesson_strength: "terugkerend_patroon",
    destination_areas: ["operations"],
    updated_at: "2026-04-24T09:00:00.000Z",
    created_at: "2026-04-15T10:00:00.000Z",
    ...overrides,
  } as PilotLearningCheckpoint;
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
    learningCheckpoints: [
      buildCheckpoint({
        id: "checkpoint-follow-up-review",
        checkpoint_key: "follow_up_review",
        owner_label: "HR lead",
        status: "uitgevoerd",
        confirmed_lesson: "De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.",
        updated_at: "2026-04-24T09:00:00.000Z",
      }),
    ],
  };
}

function buildFollowUpTargetContext(): LiveActionCenterCampaignContext {
  return {
    ...buildLiveContext(),
    campaign: buildCampaign({
      id: "campaign-pulse",
      name: "Pulse voorjaar",
      scan_type: "pulse",
    }),
    stats: buildStats({
      campaign_id: "campaign-pulse",
      campaign_name: "Pulse voorjaar",
      scan_type: "pulse",
    }),
    deliveryRecord: buildDeliveryRecord({
      id: "delivery-pulse",
      campaign_id: "campaign-pulse",
    }),
    learningDossier: buildDossier({
      id: "dossier-pulse",
      campaign_id: "campaign-pulse",
      title: "Pulse follow-through voorjaar",
      scan_type: "pulse",
      triage_status: "bevestigd",
      management_action_outcome: "bijstellen",
      case_public_summary: "Een nieuwe pulse-route staat klaar als heldere vervolghandoff voor dezelfde afdeling.",
    }),
    learningCheckpoints: [
      buildCheckpoint({
        id: "checkpoint-pulse-review",
        dossier_id: "dossier-pulse",
        checkpoint_key: "follow_up_review",
        owner_label: "HR lead",
        status: "bevestigd",
        confirmed_lesson: "De vervolghandoff voor dezelfde afdeling staat open voor de volgende managerstap.",
      }),
    ],
  };
}

function buildSecondFollowUpTargetContext(): LiveActionCenterCampaignContext {
  return {
    ...buildLiveContext(),
    campaign: buildCampaign({
      id: "campaign-pulse-2",
      name: "Pulse zomer",
      scan_type: "pulse",
    }),
    stats: buildStats({
      campaign_id: "campaign-pulse-2",
      campaign_name: "Pulse zomer",
      scan_type: "pulse",
    }),
    deliveryRecord: buildDeliveryRecord({
      id: "delivery-pulse-2",
      campaign_id: "campaign-pulse-2",
    }),
    learningDossier: buildDossier({
      id: "dossier-pulse-2",
      campaign_id: "campaign-pulse-2",
      title: "Tweede pulse follow-through",
      scan_type: "pulse",
      triage_status: "bevestigd",
      management_action_outcome: "bijstellen",
      case_public_summary: "Een tweede open pulse-route maakt de vervolghandoff in V1 bewust ambigu.",
    }),
  };
}

function getIsoDateDaysFromNow(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(12, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function renderFollowUpAffordanceMarkup(args: {
  memberRole: "owner" | "member" | "viewer";
  triageStatus: "bevestigd" | "uitgevoerd";
  managementActionOutcome: "bijstellen" | "afronden";
  canAssignManagers: boolean;
  canRespondToRequests: boolean;
  workspaceSubtitle: string;
  withTargetCandidate?: boolean;
  withDirectActiveSuccessor?: boolean;
  withAmbiguousTargetCandidates?: boolean;
  withOptimisticDirectSuccessor?: boolean;
}) {
  const sourceContext = {
    ...buildLiveContext(),
    memberRole: args.memberRole,
    learningDossier: buildDossier({
      triage_status: args.triageStatus,
      management_action_outcome: args.managementActionOutcome,
      case_public_summary:
        args.triageStatus === "uitgevoerd"
          ? "De eerste route is bewust afgerond en klaar voor een eventuele vervolgroute."
          : "De eerste route blijft actief en vraagt nog een gerichte vervolgstap.",
    }),
  } satisfies LiveActionCenterCampaignContext;
  const contexts: LiveActionCenterCampaignContext[] = [sourceContext];

  if (args.withTargetCandidate ?? true) {
    const targetContext = buildFollowUpTargetContext();

    if (args.withDirectActiveSuccessor) {
      const sourceRoute = projectActionCenterRoute(sourceContext);
      const targetRoute = projectActionCenterRoute(targetContext);
      const relation = projectActionCenterRouteFollowUpRelation({
        route_relation_type: "follow-up-from",
        source_campaign_id: sourceContext.campaign.id,
        target_campaign_id: targetContext.campaign.id,
        source_route_id: sourceRoute.routeId,
        target_route_id: targetRoute.routeId,
        trigger_reason: "nieuw-segment-signaal",
        recorded_at: "2026-04-30T09:00:00.000Z",
        recorded_by_role: "hr_owner",
      });

      contexts[0] = {
        ...sourceContext,
        routeFollowUpRelations: [relation],
      };
      contexts.push({
        ...targetContext,
        routeFollowUpRelations: [relation],
      });
    } else {
      contexts.push(targetContext);
    }
  }

  let items = buildLiveActionCenterItems(contexts);
  const item = items.find((candidate) => candidate.coreSemantics.route.campaignId === sourceContext.campaign.id)!;

  if (args.withAmbiguousTargetCandidates) {
    items = [
      ...items,
      ...buildLiveActionCenterItems([buildSecondFollowUpTargetContext()]),
    ];
  }

  if (args.withOptimisticDirectSuccessor) {
    const targetItem = items.find((candidate) => candidate.id !== item.id && candidate.teamId === item.teamId);
    if (targetItem) {
      items = items.map((candidate) =>
        candidate.id === targetItem.id
          ? {
              ...candidate,
              coreSemantics: {
                ...candidate.coreSemantics,
                followUpSemantics: {
                  isDirectSuccessor: true,
                  lineageLabel: "Vervolg op eerdere route",
                  triggerReason: "nieuw-campaign-signaal",
                  triggerReasonLabel: "Nieuw campaign-signaal",
                  sourceRouteId: item.coreSemantics.route.routeId,
                },
              },
            }
          : candidate,
      );
    }
  }

  const markup = renderToStaticMarkup(
    createElement(ActionCenterPreview, {
      initialItems: items,
      initialSelectedItemId: item.id,
      initialView: "actions",
      fallbackOwnerName: "Admin",
      ownerOptions: ["Manager Operations", "Manager Support"],
      managerOptions: [
        { value: "manager-1", label: "Manager Operations" },
        { value: "manager-2", label: "Manager Support" },
      ],
      workbenchHref: "/action-center/dossier",
      hideSidebar: true,
      readOnly: false,
      canAssignManagers: args.canAssignManagers,
      canRespondToRequests: args.canRespondToRequests,
      routeFollowUpEndpoint: "/api/action-center-route-follow-ups",
      workspaceName: "Action Center",
      workspaceSubtitle: args.workspaceSubtitle,
    }),
  );

  return { item, items, markup };
}

function renderOverviewMarkup() {
  const contexts = [buildLiveContext(), buildFollowUpTargetContext()];
  const items = buildLiveActionCenterItems(contexts);

  return renderToStaticMarkup(
    createElement(ActionCenterPreview, {
      initialItems: items,
      initialView: "overview",
      fallbackOwnerName: "Admin",
      ownerOptions: ["Manager Operations", "Manager Support"],
      workbenchHref: "/dashboard",
      workbenchLabel: "Open broncampagne",
      workspaceName: "Action Center",
      workspaceSubtitle: "Live opvolging",
      hideSidebar: true,
      readOnly: true,
      boundedOverviewOnly: true,
      itemHrefs: Object.fromEntries(items.map((item) => [item.id, `/campaigns/${item.coreSemantics.route.campaignId}`])),
    }),
  );
}

describe("action center landing shell", () => {
  it("parses contextual entry params and passes the selected view through to the preview", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("view?: string");
    expect(pageSource).toContain("resolveActionCenterEntryParams");
    expect(pageSource).toContain("initialView={entry.view}");
    expect(pageSource).toContain("boundedOverviewOnly={entry.view === 'overview'}");
    expect(pageSource).toContain("allowEmptyInitialSelection={hasAmbiguousCampaignFocus}");
    expect(pageSource).toContain("source === 'campaign-detail'");
    expect(pageSource).toContain("source === 'review-moments'");
  });

  it("keeps a thin shell around the preview and route params", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("<ActionCenterPreview");
    expect(pageSource).toContain("searchParams");
    expect(pageSource).toContain('routeFollowUpEndpoint="/api/action-center-route-follow-ups"');
    expect(pageSource).toContain("hideSidebar");
    expect(pageSource).toContain("readOnly");
    expect(pageSource).toContain("boundedOverviewOnly");
  });

  it("renders the route as a bounded overview cockpit instead of a broad workflow suite", () => {
    const markup = renderOverviewMarkup();

    expect(markup).toContain("Action Center");
    expect(markup).toContain("Overzicht van managementopvolging en acties.");
    expect(markup).toContain("Actieve routes");
    expect(markup).toContain("Te bespreken / reviewbaar");
    expect(markup).toContain("Geblokkeerd");
    expect(markup).toContain("Niet beschikbaar");
    expect(markup).toContain("Afgerond");
    expect(markup).toContain("Wat vraagt nu aandacht?");
    expect(markup).toContain("Komende reviews");

    expect(markup).not.toContain("Bestuurlijke teruglezing");
    expect(markup).not.toContain("Managers en toewijzing");
    expect(markup).not.toContain("Open alle acties");
    expect(markup).not.toContain("Open managers");
    expect(markup).not.toContain("Actie aanmaken");
    expect(markup).not.toContain("Action Center / Reviewmomenten");
    expect(markup).not.toContain("Mijn teams");
  });

  it("loads route reopen rows into the live action-center contexts", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("action_center_route_reopens");
    expect(pageSource).toContain("projectActionCenterRouteReopen");
    expect(pageSource).toContain("routeReopens:");
  });

  it("renders shell markup that should expose the follow-up route trigger affordances", () => {
    const { item, markup } = renderFollowUpAffordanceMarkup({
      memberRole: "owner",
      triageStatus: "uitgevoerd",
      managementActionOutcome: "afronden",
      canAssignManagers: true,
      canRespondToRequests: true,
      workspaceSubtitle: "Verisight + HR",
    });

    expect(item.coreSemantics.route.routeStatus).toBe("afgerond");
    expect(markup).toContain("Start vervolgroute");
    expect(markup).toContain("Kies manager");
    expect(markup).toContain("Kies aanleiding");
    expect(markup).toContain('name="follow-up-manager"');
    expect(markup).toContain('name="follow-up-trigger-reason"');
    expect(markup).toContain("Nieuw campaign-signaal");
    expect(markup).toContain("Nieuw segmentsignaal");
    expect(markup).toContain("Hernieuwde HR-beoordeling");
  });

  it("keeps the trigger disabled when a closed route already has a direct active follow-up successor", () => {
    const { item, items, markup } = renderFollowUpAffordanceMarkup({
      memberRole: "owner",
      triageStatus: "uitgevoerd",
      managementActionOutcome: "afronden",
      canAssignManagers: true,
      canRespondToRequests: true,
      workspaceSubtitle: "Verisight + HR",
      withDirectActiveSuccessor: true,
    });

    const directSuccessor = items.find(
      (candidate) =>
        candidate.id !== item.id &&
        candidate.coreSemantics.followUpSemantics.isDirectSuccessor &&
        candidate.coreSemantics.followUpSemantics.sourceRouteId === item.coreSemantics.route.routeId,
    );

    expect(item.coreSemantics.route.routeStatus).toBe("afgerond");
    expect(directSuccessor ? ["open-verzoek", "te-bespreken", "in-uitvoering"].includes(directSuccessor.status) : false).toBe(true);
    expect(directSuccessor?.coreSemantics.followUpSemantics.triggerReasonLabel).toBe("Nieuw segmentsignaal");
    expect(markup).toContain("Voor deze gesloten route loopt al een directe actieve vervolgroute (Nieuw segmentsignaal).");
    expect(markup).not.toContain("Start vervolgroute");
    expect(markup).not.toContain("Kies manager");
    expect(markup).not.toContain("Kies aanleiding");
  });

  it("keeps the trigger disabled when no single same-scope target route can be derived", () => {
    const { item, markup } = renderFollowUpAffordanceMarkup({
      memberRole: "owner",
      triageStatus: "uitgevoerd",
      managementActionOutcome: "afronden",
      canAssignManagers: true,
      canRespondToRequests: true,
      workspaceSubtitle: "Verisight + HR",
      withTargetCandidate: false,
    });

    expect(item.coreSemantics.route.routeStatus).toBe("afgerond");
    expect(markup).toContain("Nog geen eenduidige open doelroute beschikbaar binnen deze afdeling.");
    expect(markup).not.toContain("Start vervolgroute");
    expect(markup).not.toContain("Kies manager");
    expect(markup).not.toContain("Kies aanleiding");
  });

  it("keeps the trigger hidden when multiple same-scope targets are open", () => {
    const { item, markup } = renderFollowUpAffordanceMarkup({
      memberRole: "owner",
      triageStatus: "uitgevoerd",
      managementActionOutcome: "afronden",
      canAssignManagers: true,
      canRespondToRequests: true,
      workspaceSubtitle: "Verisight + HR",
      withAmbiguousTargetCandidates: true,
    });

    expect(item.coreSemantics.route.routeStatus).toBe("afgerond");
    expect(markup).toContain("Er zijn meerdere open doelroutes binnen deze afdeling. Kies in V1 eerst één eenduidige vervolgrichting.");
    expect(markup).not.toContain("Start vervolgroute");
    expect(markup).not.toContain("Kies manager");
    expect(markup).not.toContain("Kies aanleiding");
  });

  it("keeps the trigger hidden after the target route is locally marked as the direct successor", () => {
    const { item, items, markup } = renderFollowUpAffordanceMarkup({
      memberRole: "owner",
      triageStatus: "uitgevoerd",
      managementActionOutcome: "afronden",
      canAssignManagers: true,
      canRespondToRequests: true,
      workspaceSubtitle: "Verisight + HR",
      withOptimisticDirectSuccessor: true,
    });

    const optimisticSuccessor = items.find(
      (candidate) =>
        candidate.id !== item.id &&
        candidate.coreSemantics.followUpSemantics.isDirectSuccessor &&
        candidate.coreSemantics.followUpSemantics.sourceRouteId === item.coreSemantics.route.routeId,
    );

    expect(optimisticSuccessor?.coreSemantics.followUpSemantics.triggerReasonLabel).toBe("Nieuw campaign-signaal");
    expect(markup).toContain("Voor deze gesloten route loopt al een directe actieve vervolgroute (Nieuw campaign-signaal).");
    expect(markup).not.toContain("Start vervolgroute");
    expect(markup).not.toContain("Kies manager");
    expect(markup).not.toContain("Kies aanleiding");
  });

  it("keeps follow-up affordances hidden for a closed route without HR or Verisight capabilities", () => {
    const { item, markup } = renderFollowUpAffordanceMarkup({
      memberRole: "viewer",
      triageStatus: "uitgevoerd",
      managementActionOutcome: "afronden",
      canAssignManagers: false,
      canRespondToRequests: false,
      workspaceSubtitle: "Manager alleen",
    });

    expect(item.coreSemantics.route.routeStatus).toBe("afgerond");
    expect(markup).not.toContain("Start vervolgroute");
    expect(markup).not.toContain("Kies manager");
    expect(markup).not.toContain("Kies aanleiding");
    expect(markup).not.toContain("Nieuw campaign-signaal");
  });

  it("keeps follow-up affordances hidden for non-closed routes even with HR or Verisight capabilities", () => {
    const { item, markup } = renderFollowUpAffordanceMarkup({
      memberRole: "owner",
      triageStatus: "bevestigd",
      managementActionOutcome: "bijstellen",
      canAssignManagers: true,
      canRespondToRequests: true,
      workspaceSubtitle: "Verisight + HR",
    });

    expect(item.coreSemantics.route.routeStatus).toBe("in-uitvoering");
    expect(markup).not.toContain("Start vervolgroute");
    expect(markup).not.toContain("Kies manager");
    expect(markup).not.toContain("Kies aanleiding");
    expect(markup).not.toContain("Nieuw campaign-signaal");
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

    expect(markup).toContain("Laatste beslissing");
    expect(markup).toContain("Bijstellen");
    expect(markup).toContain("Waarom dit besluit");
    expect(markup).toContain(item.coreSemantics.latestDecision?.decisionReason ?? "");
    expect(markup).toContain("Volgende toets");
    expect(markup).toContain(item.coreSemantics.latestDecision?.nextCheck ?? "");
    expect(markup).toContain("Huidige stap");
    expect(markup).toContain(item.coreSemantics.actionProgress.currentStep ?? "");
    expect(markup).toContain("Hierna");
    expect(markup).toContain(item.coreSemantics.actionProgress.nextStep ?? "");
    expect(markup).toContain("Verwacht effect");
    expect(markup).toContain(item.coreSemantics.actionProgress.expectedEffect ?? "");
  });

  it("renders a compact route summary layer on detail from shared route semantics", () => {
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

    expect(markup).toContain("Route-read");
    expect(markup).toContain(item.coreSemantics.routeSummary.stateLabel);
    expect(markup).toContain("Vraagt nu");
    expect(markup).toContain(item.coreSemantics.routeSummary.routeAsk);
    expect(markup).toContain("Voortgang");
    expect(markup).toContain(item.coreSemantics.routeSummary.progressSummary);
  });

  it("renders compact decision history from shared semantics on route detail", () => {
    const context = buildLiveContext();
    const [baseItem] = buildLiveActionCenterItems([context]);
    const item = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        latestDecision: {
          decisionEntryId: "decision-latest",
          sourceRouteId: baseItem.id,
          decision: "bijstellen" as const,
          decisionReason: "De eerste teamread gaf genoeg richting om de route kleiner en concreter te maken.",
          nextCheck: "Toets of de managercheck het knelpunt binnen twee weken specifieker maakt.",
          decisionRecordedAt: "2026-04-23T10:00:00.000Z",
          reviewCompletedAt: "2026-04-23T10:00:00.000Z",
          currentStepSnapshot: "Voer de managercheck met operations deze week uit.",
          observationSnapshot: "Dezelfde frictie kwam in twee teams terug.",
        },
        decisionHistory: [
          {
            decisionEntryId: "decision-latest",
            sourceRouteId: baseItem.id,
            decision: "bijstellen" as const,
            decisionReason: "De eerste teamread gaf genoeg richting om de route kleiner en concreter te maken.",
            nextCheck: "Toets of de managercheck het knelpunt binnen twee weken specifieker maakt.",
            decisionRecordedAt: "2026-04-23T10:00:00.000Z",
            reviewCompletedAt: "2026-04-23T10:00:00.000Z",
            currentStepSnapshot: "Voer de managercheck met operations deze week uit.",
            observationSnapshot: "Dezelfde frictie kwam in twee teams terug.",
          },
          {
            decisionEntryId: "decision-earlier",
            sourceRouteId: baseItem.id,
            decision: "doorgaan" as const,
            decisionReason: "De eerste signalen waren sterk genoeg voor een bounded vervolgstap.",
            nextCheck: "Kijk of het eerste teamgesprek daadwerkelijk gepland is.",
            decisionRecordedAt: "2026-04-18T10:00:00.000Z",
            reviewCompletedAt: "2026-04-18T10:00:00.000Z",
            currentStepSnapshot: "Plan een eerste teamgesprek met operations.",
            observationSnapshot: "Het patroon werd in meerdere exits bevestigd.",
          },
        ],
      },
    };

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

    expect(markup).toContain("Beslisgeschiedenis");
    expect(markup).toContain("De eerste teamread gaf genoeg richting om de route kleiner en concreter te maken.");
    expect(markup).toContain("Toets of de managercheck het knelpunt binnen twee weken specifieker maakt.");
    expect(markup).toContain("Voer de managercheck met operations deze week uit.");
    expect(markup).toContain("Dezelfde frictie kwam in twee teams terug.");
    expect(markup).toContain("Plan een eerste teamgesprek met operations.");
  });

  it("renders route action cards on detail when a route carries multiple concrete actions", () => {
    const context = {
      ...buildLiveContext(),
      routeActions: [
        {
          actionId: "action-1",
          routeId: "campaign-exit::org-1::department::operations",
          themeKey: "leadership" as const,
          actionText: "Plan twee teamgesprekken over leiderschap en werkdruk.",
          expectedEffect: "Maak zichtbaar of leiderschap de werkdrukfrictie versterkt.",
          reviewScheduledFor: "2026-05-12",
          status: "open" as const,
          createdAt: "2026-04-30T09:00:00.000Z",
          updatedAt: "2026-04-30T09:00:00.000Z",
        },
        {
          actionId: "action-2",
          routeId: "campaign-exit::org-1::department::operations",
          themeKey: "workload" as const,
          actionText: "Leg een bounded herverdeling van piekwerk vast.",
          expectedEffect: "Maak zichtbaar of de piekbelasting in twee weken lager voelt.",
          reviewScheduledFor: "2026-05-19",
          status: "in_review" as const,
          createdAt: "2026-04-30T09:00:00.000Z",
          updatedAt: "2026-05-10T09:00:00.000Z",
        },
      ],
      actionReviews: [
        {
          actionReviewId: "review-2",
          actionId: "action-2",
          reviewedAt: "2026-05-10T09:00:00.000Z",
          observation: "De werkdruk daalt nog niet zichtbaar in beide teams.",
          actionOutcome: "bijsturen-nodig" as const,
          followUpNote: "Herverdeel ook de piekoverdracht in de vroege dienst.",
        },
      ],
    };
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

    expect(markup).toContain("Acties in deze route");
    expect(markup).toContain("Leiderschap");
    expect(markup).toContain("Plan twee teamgesprekken over leiderschap en werkdruk.");
    expect(markup).toContain("Werkdruk");
    expect(markup).toContain("Leg een bounded herverdeling van piekwerk vast.");
    expect(markup).toContain("Laatste review (Bijsturen nodig)");
    expect(markup).toContain("De werkdruk daalt nog niet zichtbaar in beide teams.");
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

  it("renders closing semantics with a compact closeout summary only for completed or intentionally stopped routes", () => {
    const context = buildLiveContext();
    const [baseItem] = buildLiveActionCenterItems([context]);
    const completedItem = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        closingSemantics: {
          status: "afgerond" as const,
          summary: "De route is afgerond na de laatste teamreview.",
          historicalSummary: null,
        },
      },
    };
    const stoppedItem = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        closingSemantics: {
          status: "gestopt" as const,
          summary: "De route stopt omdat er nu geen draagvlak is voor opvolging.",
          historicalSummary: null,
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
    expect(ongoingMarkup).not.toContain("De route is afgerond na de laatste teamreview.");
    expect(ongoingMarkup).not.toContain("De route stopt omdat er nu geen draagvlak is voor opvolging.");
    expect(completedMarkup).toContain("Afgerond voor nu");
    expect(completedMarkup).toContain("De route is afgerond na de laatste teamreview.");
    expect(stoppedMarkup).toContain("Bewust gestopt");
    expect(stoppedMarkup).toContain("De route stopt omdat er nu geen draagvlak is voor opvolging.");
  });

  it("renders historical closeout meaning only when an active route carries real historical closeout truth", () => {
    const activeHistoricalContext = {
      ...buildLiveContext(),
      learningCheckpoints: [
        buildCheckpoint({
          id: "cp-follow-up-review",
          checkpoint_key: "follow_up_review",
          owner_label: "HR",
          confirmed_lesson:
            "De vorige stap is afgerond; borg nu of de afspraken in de komende twee weken standhouden.",
          qualitative_notes: "De eerdere cyclus kon worden afgerond; deze route bewaakt alleen de borging.",
        }),
      ],
    };
    const activeOrdinaryContext = {
      ...buildLiveContext(),
      learningCheckpoints: [
        buildCheckpoint({
          id: "cp-follow-up-review",
          checkpoint_key: "follow_up_review",
          owner_label: "HR",
          confirmed_lesson: "Blijf de afspraken de komende twee weken actief volgen.",
          qualitative_notes: "Het teamoverleg blijft nog onder review.",
          interpreted_observation: "De eerste interventie geeft rust, maar we blijven volgen.",
        }),
      ],
    };
    const [historicalItem] = buildLiveActionCenterItems([activeHistoricalContext]);
    const [ordinaryItem] = buildLiveActionCenterItems([activeOrdinaryContext]);

    const historicalMarkup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [historicalItem],
        initialSelectedItemId: historicalItem.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );
    const ordinaryMarkup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [ordinaryItem],
        initialSelectedItemId: ordinaryItem.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );

    expect(historicalItem.coreSemantics.closingSemantics.status).toBe("lopend");
    expect(historicalItem.coreSemantics.closingSemantics.historicalSummary).toContain("vorige stap is afgerond");
    expect(historicalMarkup).toContain("Eerder afgerond in deze route");
    expect(historicalMarkup).toContain(
      "De vorige stap is afgerond; borg nu of de afspraken in de komende twee weken standhouden.",
    );

    expect(ordinaryItem.coreSemantics.closingSemantics.status).toBe("lopend");
    expect(ordinaryItem.coreSemantics.closingSemantics.historicalSummary).toBeNull();
    expect(ordinaryMarkup).not.toContain("Eerder afgerond in deze route");
  });

  it("does not render the historical closeout panel for negated or not-finished-yet closeout phrasing", () => {
    const notFinishedLessons = [
      "De vorige stap is niet afgerond; we moeten eerst de afspraken opnieuw toetsen.",
      "Deze cyclus is nog niet afgesloten en blijft actief onder review.",
    ];

    for (const confirmedLesson of notFinishedLessons) {
      const [item] = buildLiveActionCenterItems([
        {
          ...buildLiveContext(),
          learningCheckpoints: [
            buildCheckpoint({
              id: `cp-follow-up-review-${confirmedLesson}`,
              checkpoint_key: "follow_up_review",
              owner_label: "HR",
              confirmed_lesson: confirmedLesson,
              qualitative_notes: "De route blijft actief en vraagt nog opvolging.",
            }),
          ],
        },
      ]);

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

      expect(item.coreSemantics.closingSemantics.status).toBe("lopend");
      expect(item.coreSemantics.closingSemantics.historicalSummary).toBeNull();
      expect(markup).not.toContain("Eerder afgerond in deze route");
    }
  });

  it("shows explicit closeout metadata in the route shell when present", () => {
    const context = buildLiveContext();
    const [baseItem] = buildLiveActionCenterItems([context]);
    const item = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        routeCloseout: {
          closeoutStatus: "gestopt",
          closeoutReason: "bewust-niet-voortzetten",
          closeoutNote: "Route bewust beeindigd na lokaal overleg.",
          closedAt: "2026-05-20T09:00:00.000Z",
          closedByRole: "hr",
          readyForCloseout: false,
        },
      },
    };

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

    expect(markup).toContain("Route afgesloten");
    expect(markup).toContain("Bewust niet voortzetten");
  });

  it("renders compact lineage labels for reopened and follow-up routes", () => {
    const context = buildLiveContext();
    const [baseItem] = buildLiveActionCenterItems([context]);
    const reopenedItem = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        route: {
          ...baseItem.coreSemantics.route,
          isReopened: true,
          reopenedAt: "2026-05-21T09:00:00.000Z",
          reopenReason: "te-vroeg-afgesloten" as const,
          lineageLabel: "Heropend traject" as const,
        },
        lineageSemantics: {
          label: "Heropend traject" as const,
          summary: "Te vroeg afgesloten na eerdere afsluiting",
          followUpFromRouteId: null,
          followUpTargetRouteId: null,
        },
      },
    };
    const followUpItem = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        route: {
          ...baseItem.coreSemantics.route,
          followUpFromRouteId: "route-older",
          lineageLabel: "Vervolg op eerdere route" as const,
        },
        lineageSemantics: {
          label: "Vervolg op eerdere route" as const,
          summary: "Nieuw traject na eerdere routeafsluiting",
          followUpFromRouteId: "route-older",
          followUpTargetRouteId: null,
        },
      },
    };

    const reopenedMarkup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [reopenedItem],
        initialSelectedItemId: reopenedItem.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );
    const followUpMarkup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [followUpItem],
        initialSelectedItemId: followUpItem.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );

    expect(reopenedMarkup).toContain("Heropend traject");
    expect(followUpMarkup).toContain("Vervolg op eerdere route");
  });

  it("shows a compact ready-for-closeout hint for routes whose actions are finished but not yet explicitly closed", () => {
    const context = buildLiveContext();
    const [baseItem] = buildLiveActionCenterItems([context]);
    const item = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        routeActionCards: [
          {
            actionId: "action-1",
            routeId: baseItem.id,
            managerResponseId: "response-1",
            campaignId: context.campaign.id,
            orgId: context.campaign.organization_id,
            routeScopeType: "department" as const,
            routeScopeValue: context.scopeValue,
            managerUserId: context.assignedManager?.userId ?? "manager-1",
            ownerName: context.assignedManager?.displayName ?? "Manager Operations",
            ownerAssignedAt: context.assignedManager?.assignedAt ?? "2026-04-21T08:00:00.000Z",
            themeKey: "leadership" as const,
            actionText: "Borg de nieuwe feedbackafspraak in het teamritme.",
            expectedEffect: "Het team benoemt de afspraak nu consistent in weekstarts.",
            reviewScheduledFor: "2026-05-14",
            status: "afgerond" as const,
            latestReview: null,
            createdAt: "2026-05-01T09:00:00.000Z",
            updatedAt: "2026-05-05T09:00:00.000Z",
          },
        ],
        routeCloseout: {
          closeoutStatus: null,
          closeoutReason: null,
          closeoutNote: null,
          closedAt: null,
          closedByRole: null,
          readyForCloseout: true,
        },
      },
    };

    const markup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [item],
        initialSelectedItemId: item.id,
        initialView: "actions",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        canCloseRoutes: true,
        routeCloseoutEndpoint: "/api/action-center-route-closeouts",
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: false,
      }),
    );

    expect(markup).toContain("Klaar voor closeout");
    expect(markup).toContain("Route afsluiten");
    expect(markup).not.toContain("Route afgesloten");
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
    expect(markup).toContain("Route");
    expect(markup).toContain(item.coreSemantics.routeSummary.stateLabel);
    expect(markup).toContain("Lezing");
    expect(markup).toContain(item.coreSemantics.routeSummary.overviewSummary);
    expect(markup).not.toContain("Laatste beslissing");
    expect(markup).not.toContain("Waarom dit besluit");
    expect(markup).not.toContain("Volgende toets");
    expect(markup).not.toContain("Signaal");
    expect(markup).not.toContain("Huidige stap");
    expect(markup).not.toContain("Hierna");
    expect(markup).not.toContain("Beslisgeschiedenis");
    expect((markup.match(/>Route</g) ?? []).length).toBe(1);
    expect((markup.match(/>Lezing</g) ?? []).length).toBe(1);
  });

  it("shows only the compact overview lineage label for a follow-up route in overview", () => {
    const context = buildLiveContext();
    const [baseItem] = buildLiveActionCenterItems([context]);
    const item = {
      ...baseItem,
      coreSemantics: {
        ...baseItem.coreSemantics,
        lineageSummary: {
          overviewLabel: "Vervolg op eerdere route" as const,
          backwardLabel: "Vervolg op eerdere route" as const,
          backwardRouteId: "route-earlier",
          forwardLabel: "Later opgevolgd" as const,
          forwardRouteId: "route-later",
          detailLabels: ["Vervolg op eerdere route", "Later opgevolgd"] as const,
        },
      },
    };

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

    expect(markup).toContain("Vervolg op eerdere route");
    expect(markup).not.toContain("Later opgevolgd");
    expect(markup).not.toContain("Heropend traject");
    expect((markup.match(/Vervolg op eerdere route/g) ?? []).length).toBe(1);
  });

  it("shows team Review < 7 dagen for upcoming reviews within the next week", () => {
    const context = buildLiveContext();
    const [item] = buildLiveActionCenterItems([
      {
        ...context,
        learningDossier: buildDossier({
          review_moment: getIsoDateDaysFromNow(5),
        }),
      },
    ]);

    const markup = renderToStaticMarkup(
      createElement(ActionCenterPreview, {
        initialItems: [item],
        initialSelectedItemId: item.id,
        initialView: "teams",
        fallbackOwnerName: "Admin",
        ownerOptions: ["Manager Operations"],
        workbenchHref: "/action-center/dossier",
        hideSidebar: true,
        readOnly: true,
      }),
    );

    expect(markup).toContain("Review &lt; 7 dagen");
    expect(markup).toMatch(/Review &lt; 7 dagen<\/p><\/div><p[^>]*>1<\/p>/);
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
      latestVisibleUpdateNote: item.updates[0]?.note ?? null,
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
        whatWasTried: item.updates[0]?.note ?? null,
      },
      closingSemantics: {
        status: "lopend",
      },
    });
  });
});
