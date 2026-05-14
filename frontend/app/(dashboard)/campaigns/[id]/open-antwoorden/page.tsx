export default function OpenAnswersPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
          Resultaten
        </p>
        <h1 className="font-serif text-[2.2rem] leading-[1.02] tracking-[-0.045em] text-[color:var(--dashboard-ink)]">
          Alle open antwoorden
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
          Geanonimiseerde open antwoorden, gegroepeerd per zichtbaar thema.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[color:var(--dashboard-ink)]">Thematische clusters</h2>
      </section>
    </div>
  )
}
