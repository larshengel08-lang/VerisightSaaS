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
  const textAlign = align === 'center' ? 'text-center' : 'text-left'
  const eyebrowColor = light ? 'text-blue-300' : 'text-blue-600'
  const titleColor = light ? 'text-white' : 'text-slate-950'
  const descriptionColor = light ? 'text-slate-300' : 'text-slate-600'

  return (
    <div className={textAlign}>
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${eyebrowColor}`}>{eyebrow}</p>
      <h2 className={`font-display mt-4 text-balance text-4xl md:text-5xl ${titleColor}`}>{title}</h2>
      {description ? (
        <p className={`mt-5 text-lg leading-8 ${descriptionColor}`}>{description}</p>
      ) : null}
    </div>
  )
}
