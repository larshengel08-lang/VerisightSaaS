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
  type ReportLibraryCategory,
} from "@/lib/dashboard/report-library";
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

const REPORT_FLOW_STEPS = [
  {
    title: "Samenvatting",
    body: "Gebruik dashboard en rapport samen om te bepalen welk patroon nu telt en welke conclusie nog te vroeg is.",
  },
  {
    title: "Eerste stap",
    body: "Leg de eerste eigenaar en eerste stap vast zodra het rapport een echt managementgesprek opent. Zo blijft de output niet hangen in alleen inzicht.",
  },
  {
    title: "Reviewmoment",
    body: "Koppel het rapport altijd aan een reviewmoment in Action Center. Dan blijft opvolging zichtbaar en controleerbaar.",
  },
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
        description="Jouw login opent alleen Action Center. Rapporten, survey-inzichten en campagnedetails blijven zichtbaar voor HR en Verisight."
      />
    );
  }

  const { data: stats } = await supabase
    .from("campaign_stats")
    .select("*")
    .order("created_at", { ascending: false });
  const campaigns = stats ?? [];
  const reportModel = buildReportLibraryEntries(campaigns);
  const filteredEntries = filterReportLibraryEntries(
    reportModel.entries,
    category,
  );
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
        title="Klaar voor het overleg."
        description="Gebruik rapporten als compacte samenvatting voor overleg: eerst wat nu telt, daarna wie verder oppakt en welke opvolging logisch is. Geen ruwe data-dump, wel duidelijke output in dezelfde familie als dashboard en Action Center."
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
                href={`/campaigns/${reportModel.featured.campaignId}`}
                className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
              >
                Open campagnedetail
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
              <div className="space-y-2 rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-white/70 px-4 py-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
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
                Rapporten verschijnen pas als een campagne genoeg respons en duiding heeft om goed te kunnen bespreken.
              </p>
            </div>
          )
        }
      />

      <DashboardSection
        eyebrow="Bibliotheek"
        title="Rapporten klaar voor bespreking"
        description="Open alleen rapporten die al genoeg basis hebben voor een goed gesprek. De rapporten blijven gekoppeld aan echte campagnes en sluiten direct aan op dashboard en Action Center."
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
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] text-white"
                      : "border-transparent bg-[color:var(--dashboard-soft)] text-[color:var(--dashboard-ink)] hover:border-[color:var(--dashboard-frame-border)] hover:bg-white hover:text-[#234B57]"
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
              {filteredEntries.map((entry) => (
                <article
                  key={entry.campaignId}
                  className={`rounded-[28px] border px-4 py-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] sm:px-5 sm:py-5 ${
                    entry.recommended
                      ? "border-[color:var(--dashboard-accent-soft-border)] bg-[linear-gradient(180deg,rgba(230,245,240,0.9),rgba(244,250,247,0.96))]"
                      : "border-[color:var(--dashboard-frame-border)] bg-white/82"
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
                    </div>

                    <div className="grid gap-1.5 text-sm text-[color:var(--dashboard-text)] xl:justify-items-end xl:pt-1 xl:text-right">
                      <p>{entry.metaLeft}</p>
                      <p>{entry.metaRight}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:self-start xl:justify-end">
                      <Link
                        href={`/campaigns/${entry.campaignId}`}
                        className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:border-[#d6e4e8] hover:bg-white"
                      >
                        Open rapportread
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

            <aside className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(248,247,243,0.96),rgba(243,240,235,0.82))] px-5 py-5 shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                Toegang en ritme
              </p>
              <p className="mt-3 text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                Wanneer deze bibliotheek echt opent.
              </p>
              <div className="mt-5 space-y-4 text-sm leading-6 text-[color:var(--dashboard-text)]">
                <div className="border-b border-[color:var(--dashboard-frame-border)]/70 pb-4">
                  Rapporten verschijnen pas als een campagne genoeg respons en duiding heeft om goed te kunnen bespreken.
                </div>
                <div className="border-b border-[color:var(--dashboard-frame-border)]/70 pb-4">
                  De lijst blijft gekoppeld aan echte campagnes, niet aan losse
                  exports of handmatige bundels.
                </div>
                <div>
                  Gebruik eerst dashboard en campagnedetail als het beeld nog
                  niet stevig genoeg is om als rapport te delen.
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-white/80 px-5 py-8 text-sm leading-7 text-[color:var(--dashboard-text)]">
            Er zijn in deze categorie nog geen rapporten met voldoende respons
            en duiding. Gebruik eerst dashboard en campagnedetail om het eerste
            overzicht stevig te krijgen.
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        eyebrow="Vervolg"
        title="Van rapport naar opvolging"
        description="Een rapport is geen eindpunt. Gebruik het om de samenvatting te delen en leg daarna in Action Center vast wie verder oppakt, wat de eerste stap is en wanneer het onderwerp terugkomt."
        variant="quiet"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.7fr),minmax(0,1fr)]">
          <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(240,246,245,0.96),rgba(232,241,238,0.78))] px-5 py-5 shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-accent-strong)]">
              Rapportdoel
            </p>
            <p className="mt-3 text-[1.45rem] font-semibold leading-tight tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
              Een rapport is het begin van de opvolging.
            </p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">
              De rapportlaag bundelt wat bestuurlijk telt. Daarna hoort de
              opvolging expliciet terug te landen in Action Center, met
              eigenaar, eerste stap en reviewmoment.
            </p>
          </div>

          <ol className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-white/82 shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
            {REPORT_FLOW_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-3 border-b border-[color:var(--dashboard-frame-border)]/70 px-5 py-5 last:border-b-0 sm:grid-cols-[72px,minmax(0,1fr)]"
              >
                <div className="text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-[color:var(--dashboard-accent-strong)]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">
                    {step.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </DashboardSection>
    </div>
  );
}
