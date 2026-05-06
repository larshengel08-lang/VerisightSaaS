export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-lg border border-[color:var(--border)] bg-white p-6">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-4 h-10 w-56 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-slate-100" />
        <div className="mt-2 h-4 w-full max-w-xl rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-[color:var(--border)] bg-white p-5">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-32 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-[color:var(--border)] bg-white p-6">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-[18px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4">
              <div className="h-9 w-9 rounded-full bg-slate-200" />
              <div className="mt-3 h-3 w-20 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

