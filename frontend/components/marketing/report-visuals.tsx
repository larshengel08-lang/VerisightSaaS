function ChromeDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-[#DDD8CF]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#DDD8CF]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#DDD8CF]" />
    </div>
  )
}

function DashboardChip({
  label,
  tone,
}: {
  label: string
  tone: 'dark' | 'teal' | 'mint'
}) {
  const classes = {
    dark: 'bg-[#21324B] text-white',
    teal: 'bg-[#4E9A95] text-white',
    mint: 'bg-[#DFF2ED] text-[#2D6663]',
  }

  return <span className={`rounded-[0.58rem] px-3 py-1 text-[0.92rem] font-semibold ${classes[tone]}`}>{label}</span>
}

export function PortfolioOverviewVisual() {
  return (
    <div className="overflow-hidden rounded-[1.08rem] border border-[#DDD5C7] bg-[#FEFCF7] shadow-none">
      <div className="flex items-center justify-between border-b border-[#E7E0D5] px-6 py-4 text-[0.98rem] text-[#334155]">
        <ChromeDots />
        <span>RetentieScan · Q2 rapport</span>
        <span className="font-medium">Verisight</span>
      </div>

      <div className="grid gap-6 px-6 py-7 lg:grid-cols-[0.94fr_1.26fr]">
        <div>
          <p className="text-[0.98rem] font-semibold uppercase tracking-[0.24em] text-[#1F3550]">Top prioriteiten</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[0.85rem] border border-[#DDD5C7] bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="max-w-[11ch] text-[1.1rem] leading-8 text-[#132033]">Werkdruk in Operations</p>
                <DashboardChip label="Hoog" tone="dark" />
              </div>
            </div>
            <div className="rounded-[0.85rem] border border-[#DDD5C7] bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="max-w-[11ch] text-[1.1rem] leading-8 text-[#132033]">Onboarding &lt; 6 mnd</p>
                <DashboardChip label="Verhoogd" tone="teal" />
              </div>
            </div>
            <div className="rounded-[0.85rem] border border-[#DDD5C7] bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="max-w-[12ch] text-[1.1rem] leading-8 text-[#132033]">Loopbaanperspectief</p>
                <DashboardChip label="Aandacht" tone="mint" />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[0.98rem] font-semibold uppercase tracking-[0.24em] text-[#1F3550]">Eerste actie</p>
            <p className="mt-4 max-w-[18ch] text-[1.12rem] leading-9 text-[#21324B]">
              Plan gesprekken met teamleads in Operations over werkverdeling voor einde maand.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[0.98rem] font-semibold uppercase tracking-[0.24em] text-[#1F3550]">
              Behoudssignaal · 12 mnd
            </p>
            <span className="text-[1.35rem] font-medium text-[#21324B]">+3.1 pt</span>
          </div>

          <div className="mt-5 rounded-[0.95rem] border border-[#DDD5C7] bg-white px-5 py-5">
            <div className="relative h-[13.6rem] overflow-hidden rounded-[0.95rem] bg-[linear-gradient(180deg,#FDFCF7_0%,#F8FBF9_100%)]">
              <div className="absolute inset-y-5 left-[7%] w-px bg-[#E7E1D7]" />
              <div className="absolute inset-y-5 left-[30%] w-px bg-[#E7E1D7]" />
              <div className="absolute inset-y-5 left-[53%] w-px bg-[#E7E1D7]" />
              <div className="absolute inset-y-5 left-[76%] w-px bg-[#E7E1D7]" />
              <svg viewBox="0 0 500 220" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="portfolioAreaFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#CFE9E4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#F6FBF9" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 150 C45 148 75 152 105 148 C145 143 162 122 205 124 C245 126 268 126 305 111 C347 94 380 101 418 86 C447 75 470 74 500 64 L500 220 L0 220 Z"
                  fill="url(#portfolioAreaFill)"
                />
                <path
                  d="M0 150 C45 148 75 152 105 148 C145 143 162 122 205 124 C245 126 268 126 305 111 C347 94 380 101 418 86 C447 75 470 74 500 64"
                  fill="none"
                  stroke="#4A9A97"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-[7%] pb-1 text-[0.96rem] text-[#445266]">
                <span>Q2 &apos;24</span>
                <span>Q3</span>
                <span>Q4</span>
                <span>Q1 &apos;25</span>
                <span>Q2</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ['Vertrekrisico', '12%'],
              ['Engagement', '7.4'],
              ['Onboarding', '8.1'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[0.85rem] border border-[#DDD5C7] bg-white px-4 py-4">
                <p className="text-[0.94rem] uppercase tracking-[0.12em] text-[#435066]">{label}</p>
                <p className="mt-3 text-[2rem] font-medium text-[#132033]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ value, tone }: { value: number; tone: 'dark' | 'teal' | 'mint' }) {
  const fills = {
    dark: 'bg-[#21324B]',
    teal: 'bg-[#4E8E8B]',
    mint: 'bg-[#CDE6E0]',
  }

  return (
    <div className="relative h-4 overflow-hidden rounded-[999px] bg-[#F2EEE6]">
      <div className={`h-full rounded-full ${fills[tone]}`} style={{ width: `${Math.min(value, 10) * 10}%` }} />
      <div className="absolute inset-y-0 left-1/2 w-px bg-[#D2CCC1]" />
    </div>
  )
}

function SegmentBadge({ label, tone }: { label: string; tone: 'teal' | 'mint' }) {
  return (
    <span
      className={`inline-flex rounded-[0.58rem] px-3 py-1 text-[0.96rem] font-semibold ${
        tone === 'teal' ? 'bg-[#4E8E8B] text-white' : 'bg-[#DFF2ED] text-[#2E6A67]'
      }`}
    >
      {label}
    </span>
  )
}

export function SegmentDeepDiveVisual() {
  const rows = [
    {
      team: 'Operations',
      n: 'n = 84',
      values: [
        { score: 5.4, tone: 'teal' as const },
        { score: 6.1, tone: 'mint' as const },
        { score: 4.2, tone: 'dark' as const },
        { score: 6.8, tone: 'mint' as const },
      ],
      badge: <SegmentBadge label="Aandacht" tone="teal" />,
    },
    {
      team: 'Commercie',
      n: 'n = 42',
      values: [
        { score: 7.2, tone: 'mint' as const },
        { score: 7.4, tone: 'mint' as const },
        { score: 6.0, tone: 'mint' as const },
        { score: 7.1, tone: 'mint' as const },
      ],
      badge: <SegmentBadge label="Stabiel" tone="mint" />,
    },
    {
      team: 'Finance',
      n: 'n = 28',
      values: [
        { score: 6.6, tone: 'mint' as const },
        { score: 7.8, tone: 'mint' as const },
        { score: 7.1, tone: 'mint' as const },
        { score: 8.0, tone: 'mint' as const },
      ],
      badge: <SegmentBadge label="Stabiel" tone="mint" />,
    },
  ]

  return (
    <div className="overflow-hidden rounded-[1.08rem] border border-[#DDD5C7] bg-[#FEFCF7] shadow-none">
      <div className="flex items-center justify-between border-b border-[#E7E0D5] px-6 py-4 text-[0.98rem] text-[#334155]">
        <ChromeDots />
        <span>Deep Dive Segment · scores per afdeling</span>
        <span className="font-medium">Add-on</span>
      </div>

      <div className="border-b border-[#E7E0D5] px-6 py-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[0.98rem] font-semibold uppercase tracking-[0.24em] text-[#1F3550]">Segmentatie</p>
            <h3 className="mt-4 text-[1.75rem] font-medium leading-tight text-[#132033]">
              Vier thema&apos;s, vijf afdelingen, één leesbaar beeld
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[1rem] text-[#334155]">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-[#21324B]" />
              <span>&lt; 5.0 Hoog risico</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-[#4E8E8B]" />
              <span>5.0 – 5.9 Aandacht</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-[#CDE6E0]" />
              <span>≥ 6.0 Stabiel / sterk</span>
            </div>
            <div className="h-8 w-px bg-[#E0D8CA]" />
            <div className="flex items-center gap-3">
              <span>Benchmark</span>
              <span className="text-[1.35rem] font-semibold text-[#132033]">6.8</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_0.74fr] gap-6 border-b border-[#E7E0D5] pb-4 text-[0.98rem] font-semibold uppercase tracking-[0.16em] text-[#1F3550]">
          <span>Afdeling</span>
          <span>Groeiperspectief</span>
          <span>Leiderschap</span>
          <span>Werkbelasting</span>
          <span>Rolhelderheid</span>
          <span>Signaal</span>
        </div>

        <div className="divide-y divide-[#E7E0D5]">
          {rows.map((row) => (
            <div key={row.team} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_0.74fr] gap-6 py-7">
              <div>
                <p className="text-[1.05rem] font-medium text-[#132033]">{row.team}</p>
                <p className="mt-1 text-[0.98rem] text-[#536174]">{row.n}</p>
              </div>
              {row.values.map((entry, index) => (
                <div key={`${row.team}-${index}`}>
                  <ScoreBar value={entry.score} tone={entry.tone} />
                  <p className="mt-3 text-[1.02rem] font-medium text-[#132033]">{entry.score.toFixed(1)}</p>
                </div>
              ))}
              <div className="flex items-center">{row.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
