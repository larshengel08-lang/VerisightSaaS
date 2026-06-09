import React, { type ReactNode } from "react";

type Tone = "slate" | "blue" | "emerald" | "amber";
type Surface = "default" | "ops";
type HeroVariant = "default" | "editorial";
type SectionVariant = "default" | "quiet";
type ChartVariant = "default" | "quiet";
type RailVariant = "default" | "quiet";
type KeyValueVariant = "default" | "quiet";
type SummaryBarVariant = "default" | "quiet";
type FocusPanelVariant = "default" | "campaign-detail";

const TONE_SURFACES: Record<Tone, string> = {
  slate:
    "border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]",
  blue: "border-[#c8d7df] bg-[color:var(--dashboard-blue-soft)]",
  emerald:
    "border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]",
  amber: "border-[#e6d6af] bg-[color:var(--dashboard-amber-soft)]",
};

const OPS_TONE_SURFACES: Record<Tone, string> = {
  slate: "border-[color:var(--border)] bg-white",
  blue: "border-[#dfe6ea] bg-[#fbfcfd]",
  emerald: "border-[#d8e4df] bg-[#f8fbf9]",
  amber: "border-[#e7e0d1] bg-[#fcfbf7]",
};

const TONE_LABELS: Record<Tone, string> = {
  slate: "text-[color:var(--dashboard-text)]",
  blue: "text-[#204655]",
  emerald: "text-[color:var(--dashboard-accent-strong)]",
  amber: "text-[#7a5b18]",
};

const OPS_TONE_LABELS: Record<Tone, string> = {
  slate: "text-[color:var(--text)]",
  blue: "text-[color:var(--text)]",
  emerald: "text-[#3C8D8A]",
  amber: "text-[#8C6B1F]",
};

const CARD_SHADOW = "shadow-[0_2px_8px_rgba(17,24,39,0.035)]";
const PANEL_GLOW =
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/55";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getToneSurface(tone: Tone, surface: Surface) {
  return surface === "ops" ? OPS_TONE_SURFACES[tone] : TONE_SURFACES[tone];
}

function getToneLabel(tone: Tone, surface: Surface) {
  return surface === "ops" ? OPS_TONE_LABELS[tone] : TONE_LABELS[tone];
}

function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  aside,
  tone,
  surface,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  tone: Tone;
  surface: Surface;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={joinClasses(
              surface === "ops"
                ? "text-xs tracking-[0.22em]"
                : "text-[11px] tracking-[0.24em]",
              "font-semibold uppercase",
              getToneLabel(tone, surface),
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={joinClasses(
            surface === "ops"
              ? "mt-1 text-lg text-[color:var(--ink)]"
              : "mt-2 max-w-4xl text-[1.65rem] text-[color:var(--dashboard-ink)] sm:text-[1.85rem]",
            "font-semibold tracking-[-0.04em]",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={joinClasses(
              surface === "ops"
                ? "mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text)]"
                : "mt-3 max-w-4xl text-sm leading-7 text-[color:var(--dashboard-text)] sm:text-[0.95rem]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {aside ? (
        <div
          className={
            surface === "ops"
              ? "sm:text-right"
              : "shrink-0 lg:max-w-[340px] lg:text-right"
          }
        >
          {aside}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  meta,
  actions,
  aside,
  tone = "slate",
  surface = "default",
  variant = "default",
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: Tone;
  surface?: Surface;
  variant?: HeroVariant;
}) {
  const toneSurface = getToneSurface(tone, surface);
  const isEditorial = surface === "default" && variant === "editorial";

  return (
    <section
      data-dashboard-primitive="hero"
      className={joinClasses(
        isEditorial
          ? "relative overflow-visible border-b border-[color:var(--dashboard-frame-border)] px-0 pb-8 pt-1"
          : "",
        surface === "ops"
          ? "overflow-visible rounded-lg border p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)] sm:p-6"
          : "relative overflow-hidden rounded-xl border px-6 py-6 sm:px-7 sm:py-7",
        surface === "default" && variant === "default" && CARD_SHADOW,
        surface === "default" && variant === "default" && PANEL_GLOW,
        isEditorial
          ? "rounded-none border-x-0 border-t-0 bg-transparent shadow-none"
          : "",
        !isEditorial && toneSurface,
      )}
    >
      {surface === "default" && variant === "default" ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.86),transparent_36%)]" />
      ) : null}
      <div
        className={joinClasses(
          isEditorial
            ? "relative grid gap-6 xl:grid-cols-[minmax(0,1.18fr),minmax(280px,0.58fr)] xl:items-start"
            : "",
          surface === "ops"
            ? "grid gap-6 xl:grid-cols-[minmax(0,1.5fr),minmax(320px,0.9fr)]"
            : "relative grid gap-5 xl:grid-cols-[minmax(0,1.4fr),minmax(280px,0.6fr)] xl:items-start",
        )}
      >
        <div className={surface === "default" ? "min-w-0" : undefined}>
          <p
            className={joinClasses(
              surface === "ops"
                ? "text-xs tracking-[0.22em]"
                : "text-[11px] tracking-[0.24em]",
              "font-semibold uppercase",
              getToneLabel(tone, surface),
            )}
          >
            {eyebrow}
          </p>
          <h1
            className={joinClasses(
              surface === "ops"
                ? "mt-3 text-[1.75rem] font-bold tracking-tight text-[color:var(--ink)] sm:text-[2rem]"
                : "mt-3 max-w-4xl text-[2rem] font-semibold tracking-[-0.05em] text-[color:var(--dashboard-ink)] sm:text-[2.45rem]",
              isEditorial &&
                "mt-4 max-w-5xl text-[2.45rem] leading-[0.98] tracking-[-0.055em] sm:text-[3.15rem]",
            )}
          >
            {title}
          </h1>
          <p
            className={joinClasses(
              surface === "ops"
                ? "mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text)]"
                : "mt-4 max-w-4xl text-sm leading-7 text-[color:var(--dashboard-text)] sm:text-[0.97rem]",
              isEditorial &&
                "max-w-3xl text-[0.98rem] leading-7 text-slate-600",
            )}
          >
            {description}
          </p>
          {meta ? (
            <div
              className={joinClasses(
                isEditorial
                  ? "mt-6 flex flex-wrap gap-2.5"
                  : "mt-5 flex flex-wrap gap-2",
              )}
            >
              {meta}
            </div>
          ) : null}
          {actions ? (
            <div
              className={
                surface === "ops"
                  ? "mt-5 flex flex-wrap items-center gap-3"
                  : isEditorial
                    ? "mt-6 flex flex-wrap items-center gap-3.5"
                    : "mt-6 flex flex-wrap items-center gap-3"
              }
            >
              {actions}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div
            className={joinClasses(
              surface === "ops"
                ? "rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(19,32,51,0.03)]"
                : "rounded-[18px] border border-white/70 bg-white/72 p-4 backdrop-blur-sm",
              isEditorial &&
                "rounded-[24px] border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(249,247,244,0.96),rgba(244,240,234,0.78))] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] backdrop-blur-none",
            )}
          >
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function DashboardSection({
  title,
  description,
  eyebrow,
  aside,
  children,
  id,
  tone = "slate",
  surface = "default",
  variant = "default",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  aside?: ReactNode;
  children: ReactNode;
  id?: string;
  tone?: Tone;
  surface?: Surface;
  variant?: SectionVariant;
}) {
  const isQuiet = surface === "default" && variant === "quiet";

  return (
    <section
      id={id}
      data-dashboard-primitive="section"
      className={joinClasses(
        isQuiet
          ? "rounded-xl border-[color:var(--dashboard-frame-border)] bg-[#fcfaf7] shadow-[0_1px_4px_rgba(10,25,47,0.04)]"
          : "",
        surface === "ops"
          ? "scroll-mt-36 rounded-lg border p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]"
          : "relative scroll-mt-40 overflow-hidden rounded-xl border px-5 py-5 sm:px-6 sm:py-6",
        surface === "default" && variant === "default" && CARD_SHADOW,
        surface === "default" && variant === "default" && PANEL_GLOW,
        !isQuiet && getToneSurface(tone, surface),
      )}
    >
      <DashboardSectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        aside={aside}
        tone={tone}
        surface={surface}
      />
      <div
        className={joinClasses(
          surface === "ops"
            ? "mt-5 border-t border-[color:var(--border)]/80 pt-5"
            : "mt-5 border-t border-[color:var(--dashboard-frame-border)] pt-5",
          isQuiet && "border-[color:var(--dashboard-frame-border)]/70",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function DashboardDisclosure({
  title,
  description,
  children,
  defaultOpen = false,
  badge,
  surface = "default",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  surface?: Surface;
}) {
  return (
    <details
      open={defaultOpen}
      className={joinClasses(
        surface === "ops"
          ? "group scroll-mt-36 rounded-lg border border-[color:var(--border)] bg-white shadow-[0_1px_3px_rgba(10,25,47,0.03)]"
          : "group scroll-mt-40 overflow-hidden rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)]",
        surface === "default" && CARD_SHADOW,
      )}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p
            className={joinClasses(
              "text-base font-semibold",
              surface === "ops"
                ? "text-[color:var(--ink)]"
                : "text-[color:var(--dashboard-ink)]",
            )}
          >
            {title}
          </p>
          {description ? (
            <p
              className={joinClasses(
                surface === "ops"
                  ? "mt-1 text-sm leading-6 text-[color:var(--text)]"
                  : "mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div
          className={
            surface === "ops"
              ? "flex items-center gap-3"
              : "flex flex-wrap items-center gap-2"
          }
        >
          {badge}
          <span
            className={joinClasses(
              surface === "ops"
                ? "rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-1 text-xs font-medium text-[color:var(--text)]"
                : "rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--dashboard-text)]",
            )}
          >
            <span className="group-open:hidden">
              {surface === "ops" ? "Toon" : "Toon detail"}
            </span>
            <span className="hidden group-open:inline">
              {surface === "ops" ? "Verberg" : "Verberg detail"}
            </span>
            {surface === "ops" ? " detail" : null}
          </span>
        </div>
      </summary>
      <div
        className={joinClasses(
          surface === "ops"
            ? "border-t border-[color:var(--border)]/80 px-5 py-5 sm:px-6"
            : "border-t border-[color:var(--dashboard-frame-border)] px-5 py-5 sm:px-6",
        )}
      >
        {children}
      </div>
    </details>
  );
}

export function DashboardStatCard({
  title,
  value,
  body,
  tone = "slate",
  eyebrow,
  surface = "default",
}: {
  title: string;
  value?: string;
  body: string;
  tone?: Tone;
  eyebrow?: string;
  surface?: Surface;
}) {
  return (
    <div
      data-dashboard-primitive="stat-card"
      className={joinClasses(
        surface === "ops"
          ? "rounded-lg border p-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)] sm:p-5"
          : "relative overflow-hidden rounded-lg border px-4 py-4 sm:px-5 sm:py-5",
        surface === "default" && CARD_SHADOW,
        surface === "default" && PANEL_GLOW,
        getToneSurface(tone, surface),
      )}
    >
      {eyebrow ? (
        <p
          className={joinClasses(
            surface === "ops"
              ? "text-xs tracking-[0.18em]"
              : "text-[11px] tracking-[0.22em]",
            "font-semibold uppercase",
            getToneLabel(tone, surface),
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <p
        className={joinClasses(
          surface === "ops"
            ? "mt-1 text-[color:var(--ink)]"
            : "mt-2 text-[color:var(--dashboard-ink)]",
          "text-sm font-semibold",
        )}
      >
        {title}
      </p>
      {value ? (
        <p
          className={joinClasses(
            surface === "ops"
              ? "mt-3 text-[1.7rem] font-bold tracking-tight text-[color:var(--ink)]"
              : "mt-4 text-[2.15rem] font-semibold tracking-[-0.06em] text-[color:var(--dashboard-ink)]",
          )}
        >
          {value}
        </p>
      ) : null}
      <p
        className={joinClasses(
          surface === "ops"
            ? "text-[color:var(--text)]"
            : "text-[color:var(--dashboard-text)]",
          "mt-3 text-sm leading-6",
        )}
      >
        {body}
      </p>
    </div>
  );
}

export const DashboardPanel = DashboardStatCard;

export function DashboardChartPanel({
  eyebrow,
  title,
  description,
  aside,
  children,
  tone = "slate",
  variant = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  tone?: Tone;
  variant?: ChartVariant;
}) {
  const isQuiet = variant === "quiet";

  return (
    <div
      data-dashboard-primitive="chart-panel"
      className={joinClasses(
        isQuiet
          ? "relative overflow-hidden rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-white/90 px-5 py-5 shadow-[0_12px_28px_rgba(17,24,39,0.04)] sm:px-6 sm:py-6"
          : "",
        "relative overflow-hidden rounded-[20px] border px-4 py-4 sm:px-5 sm:py-5",
        variant === "default" && CARD_SHADOW,
        variant === "default" && PANEL_GLOW,
        variant === "default" && TONE_SURFACES[tone],
      )}
    >
      <DashboardSectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        aside={aside}
        tone={tone}
        surface="default"
      />
      <div
        className={joinClasses(
          "mt-5 pt-5",
          isQuiet
            ? "border-t border-[color:var(--dashboard-frame-border)]/70"
            : "border-t border-white/70",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DashboardRecommendationRail({
  eyebrow,
  title,
  description,
  aside,
  children,
  tone = "blue",
  variant = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  tone?: Tone;
  variant?: RailVariant;
}) {
  const isQuiet = variant === "quiet";

  return (
    <section
      data-dashboard-primitive="recommendation-rail"
      className={joinClasses(
        isQuiet
          ? "relative overflow-hidden rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(252,250,247,0.98),rgba(244,241,236,0.9))] px-5 py-5 shadow-[0_12px_32px_rgba(17,24,39,0.05)] sm:px-6 sm:py-6"
          : "",
        "relative overflow-hidden rounded-[22px] border px-4 py-4 sm:px-5 sm:py-5",
        variant === "default" && CARD_SHADOW,
        variant === "default" && PANEL_GLOW,
        variant === "default" && TONE_SURFACES[tone],
      )}
    >
      <div
        className={joinClasses(
          isQuiet
            ? "grid gap-6 xl:grid-cols-[minmax(240px,0.36fr),minmax(0,0.64fr)] xl:items-start"
            : "grid gap-5 xl:grid-cols-[minmax(220px,0.34fr),minmax(0,0.66fr)] xl:items-start",
        )}
      >
        <div className="px-1 py-1">
          {eyebrow ? (
            <p
              className={joinClasses(
                "text-[11px] font-semibold uppercase tracking-[0.24em]",
                TONE_LABELS[tone],
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h3
            className={joinClasses(
              "mt-3 font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]",
              isQuiet ? "text-[1.55rem] leading-tight" : "text-[1.35rem]",
            )}
          >
            {title}
          </h3>
          {description ? (
            <p
              className={joinClasses(
                "mt-3 text-sm text-[color:var(--dashboard-text)]",
                isQuiet ? "leading-6" : "leading-7",
              )}
            >
              {description}
            </p>
          ) : null}
          {aside ? <div className="mt-4">{aside}</div> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export function DashboardChip({
  label,
  tone = "slate",
  surface = "default",
}: {
  label: string;
  tone?: Tone;
  surface?: Surface;
}) {
  return (
    <span
      className={joinClasses(
        surface === "ops" ? "px-3 py-1 text-[11px]" : "px-3.5 py-1.5 text-[11px]",
        "inline-flex items-center rounded-[4px] border font-semibold uppercase tracking-[0.16em]",
        getToneSurface(tone, surface),
        getToneLabel(tone, surface),
      )}
    >
      {label}
    </span>
  );
}

export function DashboardKeyValue({
  label,
  value,
  accent,
  helpText,
  surface = "default",
  variant = "default",
}: {
  label: string;
  value: string;
  accent?: string;
  helpText?: string;
  surface?: Surface;
  variant?: KeyValueVariant;
}) {
  const isQuiet = surface === "default" && variant === "quiet";

  return (
    <div
      className={joinClasses(
        isQuiet
          ? "rounded-[18px] border border-[color:var(--dashboard-frame-border)]/85 bg-white/72 px-4 py-3.5"
          : "",
        surface === "ops"
          ? "rounded-[16px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3"
          : !isQuiet
            ? "rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-3"
            : "",
      )}
    >
      <div className="flex items-center gap-1.5">
        <p
          className={joinClasses(
            surface === "ops"
              ? "text-[color:var(--muted)]"
              : "text-[color:var(--dashboard-muted)]",
            "text-[11px] font-semibold uppercase tracking-[0.22em]",
          )}
        >
          {label}
        </p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p
        className={joinClasses(
          surface === "ops"
            ? "text-[color:var(--ink)]"
            : "text-[color:var(--dashboard-ink)]",
          "mt-2 text-lg font-semibold",
          accent,
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function DashboardSummaryBar({
  items,
  anchors,
  actions,
  surface = "default",
  variant = "default",
}: {
  items: Array<{ label: string; value: string; tone?: Tone }>;
  anchors: Array<{ id: string; label: string }>;
  actions?: ReactNode;
  surface?: Surface;
  variant?: SummaryBarVariant;
}) {
  const isQuiet = surface === "default" && variant === "quiet";

  return (
    <div
      className={joinClasses(
        surface === "ops"
          ? "sticky top-[4.35rem] z-30 space-y-3"
          : isQuiet
            ? "sticky top-[5.85rem] z-30 space-y-2.5"
            : "sticky top-[5.85rem] z-30 space-y-3",
      )}
    >
      <div
        className={joinClasses(
          isQuiet
            ? "rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[#fcfaf7]/92 p-3.5 shadow-[0_12px_28px_rgba(17,24,39,0.06)] backdrop-blur"
            : "",
          surface === "ops"
            ? "rounded-[18px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-3 shadow-[0_8px_18px_rgba(19,32,51,0.06)] backdrop-blur"
            : !isQuiet
              ? "rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar-strong)] p-3 shadow-[0_14px_28px_rgba(17,24,39,0.08)] backdrop-blur-xl"
              : "",
        )}
      >
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr),auto] xl:items-start">
          <div
            className={joinClasses(
              surface === "ops"
                ? "grid gap-2 md:grid-cols-2 xl:grid-cols-4"
                : isQuiet
                  ? "grid gap-2.5 md:grid-cols-2 xl:grid-cols-4"
                  : "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
            )}
          >
            {items.map((item) => (
              <div
                key={item.label}
                className={joinClasses(
                  isQuiet
                    ? "rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3.5"
                    : "",
                  surface === "ops"
                    ? "rounded-2xl border px-4 py-3"
                    : "rounded-[22px] border px-4 py-3",
                  isQuiet && surface === "default"
                    ? "text-[color:var(--dashboard-ink)]"
                    : getToneSurface(item.tone ?? "slate", surface),
                  surface === "default" &&
                    getToneLabel(item.tone ?? "slate", surface),
                )}
              >
                <p
                  className={joinClasses(
                    "text-[11px] font-semibold uppercase tracking-[0.18em]",
                    surface === "ops" &&
                      getToneLabel(item.tone ?? "slate", surface),
                  )}
                >
                  {item.label}
                </p>
                <p
                  className={joinClasses(
                    surface === "ops"
                      ? "text-[color:var(--ink)]"
                      : "text-[color:var(--dashboard-ink)]",
                    "mt-2 text-sm font-semibold",
                  )}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      <nav
        className={joinClasses(
          isQuiet
            ? "rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white/88 px-3 py-2.5 shadow-[0_8px_18px_rgba(17,24,39,0.04)] backdrop-blur"
            : "",
          surface === "ops"
            ? "rounded-[16px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 px-3 py-2 shadow-[0_8px_18px_rgba(19,32,51,0.06)] backdrop-blur"
            : !isQuiet
              ? "rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar-strong)] px-3 py-2 shadow-[0_10px_20px_rgba(17,24,39,0.06)] backdrop-blur-xl"
              : "",
        )}
      >
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor) => (
            <a
              key={anchor.id}
              href={`#${anchor.id}`}
              className={joinClasses(
                isQuiet
                  ? "rounded-full border border-transparent bg-[color:var(--dashboard-soft)] px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-text)] transition-colors hover:border-[color:var(--dashboard-frame-border)] hover:bg-white hover:text-[color:var(--dashboard-ink)]"
                  : "",
                surface === "ops"
                  ? "rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-xs font-semibold text-[color:var(--text)] transition-colors hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]"
                  : !isQuiet
                    ? "rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-text)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
                    : "",
              )}
            >
              {anchor.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function DashboardTimeline({
  items,
  title,
  description,
  surface = "default",
}: {
  title?: string;
  description?: string;
  items: Array<{ title: string; body: string; tone?: Tone }>;
  surface?: Surface;
}) {
  return (
    <div
      className={joinClasses(
        surface === "ops"
          ? "rounded-[18px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4 sm:p-5"
          : "rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] p-4 sm:p-5",
      )}
    >
      {title ? (
        <h3
          className={joinClasses(
            surface === "ops"
              ? "text-[color:var(--ink)]"
              : "text-[color:var(--dashboard-ink)]",
            "text-sm font-semibold",
          )}
        >
          {title}
        </h3>
      ) : null}
      {description ? (
        <p
          className={joinClasses(
            surface === "ops"
              ? "mt-1 text-[color:var(--text)]"
              : "mt-2 text-[color:var(--dashboard-text)]",
            "text-sm leading-6",
          )}
        >
          {description}
        </p>
      ) : null}
      <div
        className={joinClasses(
          surface === "ops" ? "mt-4 space-y-4" : "mt-5 space-y-4",
        )}
      >
        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="grid gap-4 md:grid-cols-[88px,minmax(0,1fr)]"
          >
            <div className="flex items-start gap-3 md:flex-col md:gap-2">
              <span
                className={joinClasses(
                  surface === "ops"
                    ? "h-9 w-9 bg-[color:var(--ink)] text-[color:var(--bg)]"
                    : "h-10 w-10 bg-[color:var(--dashboard-accent-strong)] text-white",
                  "inline-flex items-center justify-center rounded-full text-sm font-semibold",
                )}
              >
                {index + 1}
              </span>
              <div
                className={joinClasses(
                  surface === "ops"
                    ? "bg-[color:var(--border)]"
                    : "bg-[color:var(--dashboard-frame-border)]",
                  "hidden h-full w-px md:block",
                )}
              />
            </div>
            <div
              className={joinClasses(
                surface === "ops"
                  ? "rounded-[16px] border p-4"
                  : "rounded-[16px] border px-4 py-4",
                surface === "default" && CARD_SHADOW,
                getToneSurface(item.tone ?? "slate", surface),
              )}
            >
              <p
                className={joinClasses(
                  surface === "ops" ? "text-xs" : "text-[11px]",
                  "font-semibold uppercase tracking-[0.18em]",
                  getToneLabel(item.tone ?? "slate", surface),
                )}
              >
                Fase {index + 1}
              </p>
              <p
                className={joinClasses(
                  surface === "ops"
                    ? "text-[color:var(--ink)]"
                    : "text-[color:var(--dashboard-ink)]",
                  "mt-2 text-sm font-semibold",
                )}
              >
                {item.title}
              </p>
              <p
                className={joinClasses(
                  surface === "ops"
                    ? "text-[color:var(--text)]"
                    : "text-[color:var(--dashboard-text)]",
                  "mt-2 text-sm leading-6",
                )}
              >
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type RiskBand = "HOOG" | "MIDDEN" | "LAAG";

const RISK_ACCENT_COLORS: Record<RiskBand, string> = {
  HOOG: "#C65B52",
  MIDDEN: "#C88C20",
  LAAG: "#2E7C6D",
};

export function SignalStatCard({
  label,
  value,
  subline,
  band,
}: {
  label: string;
  value: string;
  subline?: string;
  band?: RiskBand | "neutral";
}) {
  const accentColor =
    band && band !== "neutral" ? RISK_ACCENT_COLORS[band] : "#8A7D6E";

  return (
    <div className="rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_1px_3px_rgba(10,25,47,0.04)]">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
          {label}
        </p>
      </div>
      <p className="dash-number mt-3 text-[2rem] leading-none text-[color:var(--dashboard-ink)]">
        {value}
      </p>
      {subline ? (
        <p className="mt-2 text-[0.8rem] text-[color:var(--dashboard-muted)]">
          {subline}
        </p>
      ) : null}
    </div>
  );
}

export function InsightStatCard({
  label,
  value,
  subline,
}: {
  label: string;
  value: string;
  subline?: string;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_1px_3px_rgba(10,25,47,0.04)]">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-[#8A7D6E]" />
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-[color:var(--dashboard-ink)]">
        {value}
      </p>
      {subline ? (
        <p className="mt-2 text-[0.8rem] text-[color:var(--dashboard-muted)]">
          {subline}
        </p>
      ) : null}
    </div>
  );
}

export function FocusPanel({
  items,
  variant = "default",
}: {
  items: Array<{ text: string; moduleLabel?: string }>;
  variant?: FocusPanelVariant;
}) {
  const isCampaignDetail = variant === "campaign-detail";

  return (
    <aside
      className={joinClasses(
        isCampaignDetail
          ? "hidden w-[320px] shrink-0 self-start rounded-[28px] bg-[#111827] p-7 shadow-[0_24px_60px_rgba(15,23,42,0.28)] xl:sticky xl:top-[92px] xl:block"
          : "hidden w-[312px] shrink-0 self-start rounded-[28px] bg-[#132033] p-7 shadow-[0_22px_54px_rgba(15,23,42,0.24)] xl:sticky xl:top-[88px] xl:block",
      )}
    >
      <div
        className={joinClasses(
          isCampaignDetail ? "mb-5 space-y-3" : "mb-5 space-y-3",
        )}
      >
        <div
          className={joinClasses(
            isCampaignDetail
              ? "h-1 w-12 rounded-full bg-[#7FC6B6]"
              : "h-1 w-12 rounded-full bg-[#7FC6B6]",
          )}
        />
        <p
          className={joinClasses(
            isCampaignDetail
              ? "text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/62"
              : "text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/62",
          )}
        >
          Aanbevolen focus
        </p>
      </div>

      <p
        className={joinClasses(
          isCampaignDetail
            ? "mb-6 text-[1.95rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white"
            : "mb-6 text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white",
        )}
      >
        {isCampaignDetail
          ? "Eerste managementroute."
          : "Waar nu aandacht naartoe gaat."}
      </p>

      <ol className={joinClasses(isCampaignDetail ? "space-y-0" : "space-y-0")}>
        {items.map((item, index) => (
          <li
            key={`${item.text}-${index}`}
            className={joinClasses(
              isCampaignDetail
                ? "flex gap-4 border-t border-white/10 py-5 first:border-t-0 first:pt-0 last:pb-0"
                : "flex gap-4 border-t border-white/10 py-5 first:border-t-0 first:pt-0 last:pb-0",
            )}
          >
            <span
              className={joinClasses(
                isCampaignDetail
                  ? "mt-1 inline-flex w-8 shrink-0 text-[1rem] font-semibold tracking-[-0.03em] text-[#8FD4C5]"
                  : "mt-1 inline-flex w-8 shrink-0 text-[1rem] font-semibold tracking-[-0.03em] text-[#8FD4C5]",
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p
                className={joinClasses(
                  isCampaignDetail
                    ? "text-[1.05rem] font-medium leading-7 text-white"
                    : "text-[1.02rem] font-medium leading-7 text-white",
                )}
              >
                {item.text}
              </p>
              {item.moduleLabel ? (
                <span
                  className={joinClasses(
                    isCampaignDetail
                      ? "mt-3 inline-block rounded-full bg-white/8 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55"
                      : "mt-1.5 inline-block rounded-full bg-white/7 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-white/50",
                  )}
                >
                  {item.moduleLabel}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label="Meer informatie"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--dashboard-frame-border)] bg-white text-[10px] font-semibold leading-none text-[color:var(--dashboard-muted)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)] focus:border-[color:var(--dashboard-accent-soft-border)] focus:text-[color:var(--dashboard-accent-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dashboard-accent-soft)]"
      >
        i
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-2xl bg-[color:var(--dashboard-ink)] px-3 py-2 text-xs font-medium leading-5 text-white shadow-xl group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}
