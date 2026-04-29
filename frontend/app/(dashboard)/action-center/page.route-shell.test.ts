import { readFileSync } from "node:fs";
import { ActionCenterPreview } from "@/components/dashboard/action-center-preview";
import { describe, expect, it } from "vitest";
import { projectActionCenterCoreSemantics } from "@/lib/action-center-core-semantics";
import { buildLiveActionCenterItems } from "@/lib/action-center-live";
import type { LiveActionCenterCampaignContext } from "@/lib/action-center-live-context";
import { projectActionCenterRoute } from "@/lib/action-center-route-contract";
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
    learningCheckpoints: [],
  };
}

function getIsoDateDaysFromNow(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

describe("action center landing shell", () => {
  it("keeps a thin shell around the preview and route params", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("<ActionCenterPreview");
    expect(pageSource).toContain("searchParams");
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
    expect(markup).toContain("Besluit");
    expect(markup).toContain("Bijstellen");
    expect(markup).toContain("Stap");
    expect(markup).toContain(item.coreSemantics.actionProgress.currentStep ?? "");
    expect(markup).not.toContain("Laatste beslissing");
    expect(markup).not.toContain("Waarom dit besluit");
    expect(markup).not.toContain("Volgende toets");
    expect(markup).not.toContain("Signaal");
    expect(markup).not.toContain("Huidige stap");
    expect(markup).not.toContain("Hierna");
    expect(markup).not.toContain("Beslisgeschiedenis");
    expect((markup.match(/>Stap</g) ?? []).length).toBe(1);
    expect((markup.match(/>Besluit</g) ?? []).length).toBe(1);
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
      latestVisibleUpdateNote: null,
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
