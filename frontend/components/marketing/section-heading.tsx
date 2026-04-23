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
  const wrapper = align === 'center' ? 'mx-auto max-w-[72rem] text-center' : 'max-w-[78rem] text-left'
  const eyebrowColor = light ? 'text-[rgba(215,239,233,0.86)]' : 'text-[var(--petrol)]'
  const titleColor = light ? 'text-[var(--bg)]' : 'text-[var(--ink)]'
  const descriptionColor = light ? 'text-[rgba(247,245,241,0.72)]' : 'text-[var(--text)]'

  return (
    <div className={wrapper}>
      {eyebrow ? (
        <p className={`text-[0.84rem] font-medium uppercase tracking-[0.18em] ${eyebrowColor}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`${eyebrow ? 'mt-3' : ''} max-w-none font-display text-[clamp(2.15rem,4.4vw,3.7rem)] font-light leading-[1.03] tracking-[-0.045em] ${
          align === 'center' ? 'mx-auto' : ''
        } ${titleColor}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-[76ch] text-[1rem] leading-8 ${
            align === 'center' ? 'mx-auto' : ''
          } ${descriptionColor}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
