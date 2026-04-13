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
      : 'marketing-panel border-slate-200 bg-white'

  const titleClass = tone === 'dark' ? 'text-white' : 'text-slate-950'
  const bodyClass = tone === 'dark' ? 'text-slate-300' : 'text-slate-600'

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`.trim()}>
      {items.map((item) => (
        <div key={item.title} className={`${panelClass} p-5`.trim()}>
          <p className={`text-base font-semibold ${titleClass}`}>{item.title}</p>
          <p className={`mt-3 text-sm leading-7 ${bodyClass}`}>{item.body}</p>
        </div>
      ))}
    </div>
  )
}
