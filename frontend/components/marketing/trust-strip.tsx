interface TrustStripProps {
  items: readonly string[]
  tone?: 'light' | 'dark'
}

export function TrustStrip({ items, tone = 'light' }: TrustStripProps) {
  const wrapper =
    tone === 'dark'
      ? 'border-white/10 bg-white/5 text-slate-200'
      : 'border-slate-200 bg-white text-slate-700 shadow-sm'

  const dot = tone === 'dark' ? 'bg-blue-300' : 'bg-blue-600'
  const label = tone === 'dark' ? 'text-white/90' : 'text-slate-800'

  return (
    <div className={`rounded-2xl border ${wrapper}`}>
      <div className="grid gap-3 px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${dot}`} />
            <span className={`text-sm font-medium ${label}`}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
