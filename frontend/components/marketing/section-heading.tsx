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
  const eyebrowColor = light ? 'text-[#DCEFEA]' : 'text-[#3C8D8A]'
  const titleColor = light ? 'text-[#F7F5F1]' : 'text-[#132033]'
  const descriptionColor = light ? 'text-[rgba(247,245,241,0.65)]' : 'text-[#4A5563]'

  return (
    <div className={wrapper}>
      <p className={`text-[0.6rem] font-medium uppercase tracking-[0.14em] ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h2
        className={`mt-3 max-w-[18ch] font-display text-[clamp(1.6rem,3.5vw,2.2rem)] leading-[1.15] ${
          align === 'center' ? 'mx-auto' : ''
        } ${titleColor}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-[52ch] text-base leading-relaxed ${
            align === 'center' ? 'mx-auto' : ''
          } ${descriptionColor}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
