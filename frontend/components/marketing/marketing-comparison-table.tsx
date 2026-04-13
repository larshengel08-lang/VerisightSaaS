interface MarketingComparisonTableProps {
  columns: readonly string[]
  rows: readonly (readonly string[])[]
  className?: string
}

export function MarketingComparisonTable({
  columns,
  rows,
  className = '',
}: MarketingComparisonTableProps) {
  return (
    <div className={`marketing-panel overflow-hidden ${className}`.trim()}>
      <div className="space-y-4 p-4 md:hidden">
        {rows.map((row) => (
          <div key={row[0]} className="rounded-2xl border border-slate-200 bg-white p-4">
            {row.map((cell, index) => (
              <div key={`${row[0]}-${index}`} className={index === 0 ? '' : 'mt-3 border-t border-slate-100 pt-3'}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{columns[index]}</p>
                <p className={`mt-1 text-sm leading-7 ${index === 1 ? 'font-semibold text-slate-950' : 'text-slate-600'}`}>{cell}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="hidden border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 md:grid"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <div key={column} className="px-6 py-4">
            {column}
          </div>
        ))}
      </div>

      {rows.map((row) => (
        <div
          key={row[0]}
          className="hidden border-b border-slate-200 last:border-b-0 md:grid"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {row.map((cell, index) => (
            <div
              key={`${row[0]}-${index}`}
              className={`px-6 py-5 text-sm leading-7 ${index === 1 ? 'font-semibold text-slate-950' : 'text-slate-600'}`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
