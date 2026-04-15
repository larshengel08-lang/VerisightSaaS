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
  const textAlign = align === 'center' ? 'mx-auto max-w-4xl text-center' : 'max-w-3xl text-left'
  const eyebrowColor = light ? 'text-blue-300' : 'text-blue-600'
  const titleColor = light ? 'text-white' : 'text-slate-950'
  const descriptionColor = light ? 'text-slate-300' : 'text-slate-600'

  return (
    <div className={textAlign}>
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${eyebrowColor}`}>{eyebrow}</p>
      <h2 className={`font-display mt-4 max-w-[14ch] text-[clamp(2.3rem,5vw,4.3rem)] leading-[0.98] ${align === 'center' ? 'mx-auto' : ''} ${titleColor}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 max-w-3xl text-base leading-8 md:text-lg ${align === 'center' ? 'mx-auto' : ''} ${descriptionColor}`}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
