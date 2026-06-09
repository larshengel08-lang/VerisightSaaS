interface MarketingProofStripProps {
  items: readonly {
    title: string
    body: string
  }[]
  tone?: 'light' | 'dark'
  className?: string
}

export function MarketingProofStrip({
  items,
  tone = 'light',
  className = '',
}: MarketingProofStripProps) {
  const panelClass =
    tone === 'dark'
      ? 'marketing-panel-dark border-white/10 bg-white/5'
      : 'marketing-panel border-[var(--border)] bg-[var(--surface)]'

  const titleClass = tone === 'dark' ? 'text-white' : 'text-[var(--ink)]'
  const bodyClass = tone === 'dark' ? 'text-slate-300' : 'text-[var(--text)]'

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`.trim()}>
      {items.map((item) => (
        <div key={item.title} className={`${panelClass} rounded-[1.5rem] p-6`.trim()}>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Proof</p>
          <p className={`mt-3 text-lg font-semibold ${titleClass}`}>{item.title}</p>
          <p className={`mt-3 text-sm leading-7 ${bodyClass}`}>{item.body}</p>
        </div>
      ))}
    </div>
  )
}
