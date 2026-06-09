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
    <div className={`marketing-panel overflow-hidden rounded-[1.75rem] border border-[var(--border)] ${className}`.trim()}>
      <div className="space-y-4 p-4 md:hidden">
        {rows.map((row) => (
          <div key={row[0]} className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] p-4">
            {row.map((cell, index) => (
              <div key={`${row[0]}-${index}`} className={index === 0 ? '' : 'mt-3 border-t border-[var(--border)] pt-3'}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{columns[index]}</p>
                <p className={`mt-1 text-sm leading-7 ${index === 1 ? 'font-semibold text-[var(--ink)]' : 'text-[var(--text)]'}`}>{cell}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="hidden border-b border-[var(--border)] bg-[var(--bg)] text-sm font-semibold text-[var(--text)] md:grid"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <div key={column} className="px-6 py-4 text-[0.72rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            {column}
          </div>
        ))}
      </div>

      {rows.map((row) => (
        <div
          key={row[0]}
          className="hidden border-b border-[var(--border)] last:border-b-0 md:grid"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {row.map((cell, index) => (
            <div
              key={`${row[0]}-${index}`}
              className={`px-6 py-5 text-sm leading-7 ${index === 1 ? 'font-semibold text-[var(--ink)]' : 'text-[var(--text)]'}`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
