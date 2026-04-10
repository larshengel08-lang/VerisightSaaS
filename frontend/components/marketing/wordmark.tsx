import Link from 'next/link'

interface WordmarkProps {
  href?: string
  size?: 'sm' | 'md'
  showTagline?: boolean
  className?: string
}

export function Wordmark({
  href = '/',
  size = 'md',
  showTagline = true,
  className = '',
}: WordmarkProps) {
  const wordClass =
    size === 'sm'
      ? 'text-[1.5rem] sm:text-[1.65rem]'
      : 'text-[1.75rem] sm:text-[2rem]'
  const markClass =
    size === 'sm'
      ? 'h-[1.2em] w-[0.86em]'
      : 'h-[1.28em] w-[0.92em]'
  const taglineClass =
    size === 'sm'
      ? 'text-[0.58rem] tracking-[0.22em]'
      : 'text-[0.62rem] tracking-[0.24em]'

  return (
    <Link href={href} className={`inline-flex flex-col items-start leading-none ${className}`}>
      <span className={`inline-flex items-end font-bold tracking-tight text-blue-700 ${wordClass}`}>
        <span aria-hidden="true" className={`mr-[0.02em] inline-flex items-end ${markClass}`}>
          <svg viewBox="0 0 58 68" className="h-full w-full overflow-visible" role="presentation">
            <path
              d="M10 12 L24 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 30 L50 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>erisight</span>
      </span>
      {showTagline && (
        <span className={`mt-1 font-semibold uppercase text-slate-400 ${taglineClass}`}>
          People, patterns, priorities
        </span>
      )}
    </Link>
  )
}
