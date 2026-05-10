interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
}: SectionHeadingProps) {
  const wrapper = align === 'center' ? 'mx-auto max-w-4xl text-center' : 'max-w-[56rem] text-left'
  const eyebrowColor = light ? 'text-[rgba(242,240,241,0.72)]' : 'text-[var(--meta)]'
  const titleColor = light ? 'text-[var(--bg)]' : 'text-[var(--ink)]'
  const descriptionColor = light ? 'text-[rgba(242,240,241,0.72)]' : 'text-[var(--muted)]'

  return (
    <div className={wrapper}>
      <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.18em] ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h2
        className={`mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] ${
          align === 'center' ? 'mx-auto' : ''
        } ${titleColor}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-5 max-w-[58ch] text-[1.02rem] leading-[1.75] ${
            align === 'center' ? 'mx-auto' : ''
          } ${descriptionColor}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
