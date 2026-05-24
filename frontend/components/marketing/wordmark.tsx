import Link from 'next/link'

interface WordmarkProps {
  href?: string
  size?: 'sm' | 'md'
  showTagline?: boolean
  light?: boolean
  className?: string
}

export function Wordmark({
  href = '/',
  size = 'md',
  showTagline = true,
  light = false,
  className = '',
}: WordmarkProps) {
  const textSize = size === 'sm' ? 'clamp(2.1rem, 2.8vw, 2.6rem)' : 'clamp(2.45rem, 3.4vw, 3.15rem)'
  const textColor = light ? '#FFFFFF' : 'var(--ink)'
  const taglineColor = light ? 'rgba(255,255,255,0.68)' : 'rgba(13,27,42,0.46)'

  return (
    <Link href={href} className={`inline-flex flex-col items-start leading-none ${className}`}>
      <span
        aria-label="Loep"
        style={{
          alignItems: 'baseline',
          color: textColor,
          display: 'inline-flex',
          fontFamily: 'var(--font-inter-tight), Inter, sans-serif',
          fontSize: textSize,
          fontWeight: 800,
          letterSpacing: '-0.06em',
          lineHeight: 0.92,
        }}
      >
        Loep
        <span
          aria-hidden
          style={{
            background: 'var(--brand-accent-mid)',
            borderRadius: '999px',
            display: 'inline-block',
            height: size === 'sm' ? 8 : 10,
            marginLeft: size === 'sm' ? 6 : 7,
            width: size === 'sm' ? 8 : 10,
          }}
        />
      </span>
      {showTagline ? (
        <span
          style={{
            color: taglineColor,
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '0.58rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            marginTop: 6,
            textTransform: 'uppercase',
          }}
        >
          People, Patterns, Priorities
        </span>
      ) : null}
    </Link>
  )
}
