import Link from "next/link";
import { redirect } from "next/navigation";
import { PdfDownloadButton } from "@/app/(dashboard)/campaigns/[id]/pdf-download-button";
import {
  DashboardChip,
  DashboardHero,
  DashboardSection,
} from "@/components/dashboard/dashboard-primitives";
import {
  buildReportLibraryEntries,
  filterReportLibraryEntries,
  getReportEntryBridge,
  type ReportLibraryCategory,
} from "@/lib/dashboard/report-library";
import {
  canOpenActionCenterRoute,
  hasOpenedActionCenterRoute,
} from "@/lib/dashboard/open-action-center-route";
import { SuiteAccessDenied } from "@/components/dashboard/suite-access-denied";
import { createClient } from "@/lib/supabase/server";
import { loadSuiteAccessContext } from "@/lib/suite-access-server";
import { getCampaignAverageSignalScore } from "@/lib/types";

const CATEGORY_OPTIONS: Array<{ key: ReportLibraryCategory; label: string }> = [
  { key: "all", label: "Alle" },
  { key: "management", label: "Management" },
  { key: "module", label: "Module" },
  { key: "cohort", label: "Cohort" },
];

function normalizeCategory(
  value: string | string[] | undefined,
): ReportLibraryCategory {
  return typeof value === "string" &&
    CATEGORY_OPTIONS.some((option) => option.key === value)
    ? (value as ReportLibraryCategory)
    : "all";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const category = normalizeCategory(resolvedSearchParams?.kind);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const { context } = await loadSuiteAccessContext(supabase, user.id);

  if (!context.canViewReports) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen rapporten"
        description="Jouw login opent alleen Action Center. Rapporten, survey-inzichten en campagnedetails blijven zichtbaar voor HR en Loep."
      />
    );
  }

  const { data: stats } = await supabase
    .from("campaign_stats")
    .select("*")
    .order("created_at", { ascending: false });
  const campaigns = stats ?? [];
  const campaignIds = campaigns.map((campaign) => campaign.campaign_id);
  const { data: deliveryRecords } =
    campaignIds.length > 0
      ? await supabase
          .from("campaign_delivery_records")
          .select("campaign_id, lifecycle_stage, first_management_use_confirmed_at")
          .in("campaign_id", campaignIds)
      : { data: [] };
  const routeEntryStageByCampaignId = Object.fromEntries(
    (deliveryRecords ?? [])
      .filter((record) => hasOpenedActionCenterRoute(record))
      .map((record) => [record.campaign_id, "active" as const]),
  );
  const routeOpenableByCampaignId = Object.fromEntries(
    (deliveryRecords ?? [])
      .filter((record) => canOpenActionCenterRoute(record))
      .map((record) => [record.campaign_id, true]),
  );
  const reportModel = buildReportLibraryEntries(campaigns, {
    routeEntryStageByCampaignId,
    routeOpenableByCampaignId,
  });
  const filteredEntries = filterReportLibraryEntries(
    reportModel.entries,
    category,
  );
  const reportCards = filteredEntries.map((entry) => {
    const reportBridge = getReportEntryBridge(entry);

    return {
      entry,
      ...reportBridge,
    };
  });
  const featuredReportBridge = reportModel.featured
    ? getReportEntryBridge(reportModel.featured)
    : null;
  const averageSignal =
    reportModel.entries.length > 0
      ? (
          reportModel.entries.reduce((sum, entry) => {
            const source = campaigns.find(
              (campaign) => campaign.campaign_id === entry.campaignId,
            );
            return (
              sum + (source ? (getCampaignAverageSignalScore(source) ?? 0) : 0)
            );
          }, 0) / reportModel.entries.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Rapportbibliotheek"
        title="Rapporten die nu leesbaar zijn."
        description="Open alleen de rapporten die al genoeg basis hebben voor een goed gesprek. Deze bibliotheek blijft compact: wat is leesbaar, voor welk type gesprek en via welke campagne open je de onderliggende route."
        tone="slate"
        variant="editorial"
        meta={
          <>
            <DashboardChip
              label={`${reportModel.entries.length} rapport${reportModel.entries.length === 1 ? "" : "en"} beschikbaar`}
              tone="emerald"
            />
            <DashboardChip
              label={
                averageSignal
                  ? `${averageSignal}/10 gemiddeld signaal`
                  : "Respons bepaalt beschikbaarheid"
              }
              tone={averageSignal ? "blue" : "slate"}
            />
            <DashboardChip
              label={
                reportModel.featured
                  ? "Klaar voor bespreking"
                  : "Nog geen rapport klaar voor bespreking"
              }
              tone={reportModel.featured ? "emerald" : "amber"}
            />
          </>
        }
        actions={
          reportModel.featured ? (
            <>
              <PdfDownloadButton
                campaignId={reportModel.featured.campaignId}
                campaignName={reportModel.featured.campaignName}
                scanType={reportModel.featured.scanType}
              />
              <Link
                href={featuredReportBridge?.href ?? `/campaigns/${reportModel.featured.campaignId}`}
                className="inline-flex rounded-[6px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f1e30]"
              >
                {featuredReportBridge?.bridge.ctaLabel ?? "Open campagnedetail"}
              </Link>
            </>
          ) : (
            <DashboardChip
              label="Nog geen rapport beschikbaar"
              tone="amber"
            />
          )
        }
        aside={
          reportModel.featured ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-accent-strong)]">
                  Aanbevolen rapport
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
                  {reportModel.featured.subtitle}
                </p>
                <p className="mt-2 text-[1.55rem] font-semibold leading-tight tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                  {reportModel.featured.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">
                  {reportModel.featured.description}
                </p>
              </div>
              <div className="space-y-2 rounded-xl border border-[color:var(--dashboard-frame-border)] bg-white/70 px-4 py-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
                {reportModel.featured.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between gap-4 border-b border-[color:var(--dashboard-frame-border)]/70 py-2 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
                      {stat.label}
                    </p>
                    <p className="text-base font-semibold text-[color:var(--dashboard-ink)]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">
                Wanneer de rapportlaag opent
              </p>
              <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                Rapporten verschijnen pas als een campagne genoeg respons en duiding heeft om goed te kunnen lezen.
              </p>
            </div>
          )
        }
      />

      <DashboardSection
        eyebrow="Bibliotheek"
        title="Wat nu leesbaar is"
        description="Open de rapportlaag alleen waar het beeld al stevig genoeg is. De bibliotheek blijft gekoppeld aan echte campagnes en maakt snel zichtbaar welk type output voor je klaarstaat."
        variant="quiet"
        aside={
          <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
            {CATEGORY_OPTIONS.map((option) => {
              const active = option.key === category;
              return (
                <Link
                  key={option.key}
                  href={
                    option.key === "all"
                      ? "/reports"
                      : `/reports?kind=${option.key}`
                  }
                  className={`inline-flex rounded-[4px] border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] text-white"
                      : "border-transparent bg-[color:var(--dashboard-soft)] text-[color:var(--dashboard-ink)] hover:border-[color:var(--dashboard-frame-border)] hover:bg-white hover:text-[color:var(--dashboard-accent-strong)]"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        }
      >
        {filteredEntries.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),300px]">
            <div className="space-y-3">
              {reportCards.map(({ entry, bridge, href }) => (
                <article
                  key={entry.campaignId}
                  className={`rounded-xl border px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.04)] sm:px-5 sm:py-5 ${
                    entry.recommended
                      ? "border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]"
                      : "border-[color:var(--dashboard-frame-border)] bg-white"
                  }`}
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),160px,auto] xl:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
                          {entry.categoryLabel}
                        </p>
                        {entry.recommended ? (
                          <DashboardChip
                            label="Eerst bespreken"
                            tone="emerald"
                          />
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                        {entry.title}
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
                        {entry.summary}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7d6b]">
                        {bridge.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#5e6b78]">
                        {bridge.body}
                      </p>
                    </div>

                    <div className="grid gap-1.5 text-sm text-[color:var(--dashboard-text)] xl:justify-items-end xl:pt-1 xl:text-right">
                      <p>{entry.metaLeft}</p>
                      <p>{entry.metaRight}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:self-start xl:justify-end">
                      <Link
                        href={href}
                        className="inline-flex rounded-[6px] border border-[color:var(--dashboard-frame-border)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:bg-white"
                      >
                        {bridge.ctaLabel}
                      </Link>
                      <PdfDownloadButton
                        campaignId={entry.campaignId}
                        campaignName={entry.campaignName}
                        scanType={entry.scanType}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(248,247,243,0.96),rgba(243,240,235,0.82))] px-5 py-5 shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                Leescontext
              </p>
              <p className="mt-3 text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                Wanneer deze bibliotheek opent.
              </p>
              <div className="mt-5 space-y-4 text-sm leading-6 text-[color:var(--dashboard-text)]">
                <div className="border-b border-[color:var(--dashboard-frame-border)]/70 pb-4">
                  Rapporten verschijnen pas als een campagne genoeg respons en duiding heeft om goed te kunnen lezen.
                </div>
                <div className="border-b border-[color:var(--dashboard-frame-border)]/70 pb-4">
                  De lijst blijft gekoppeld aan echte campagnes, niet aan losse exports of handmatige bundels.
                </div>
                <div>
                  Open eerst de campaign detailpagina als je context nodig hebt. Gebruik Action Center pas wanneer een route al in opvolging staat.
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[color:var(--dashboard-frame-border)] bg-white/80 px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Er zijn in deze categorie nog geen rapporten met voldoende respons
            en duiding. Gebruik eerst dashboard en campagnedetail om het eerste
            overzicht stevig te krijgen.
          </div>
        )}
      </DashboardSection>

    </div>
  );
}
