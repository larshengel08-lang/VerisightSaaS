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
  const taglineClass =
    size === 'sm'
      ? 'text-[0.58rem] tracking-[0.22em]'
      : 'text-[0.62rem] tracking-[0.24em]'

  return (
    <Link href={href} className={`inline-flex flex-col items-start leading-none ${className}`}>
      <span className={`font-bold tracking-tight text-blue-700 ${wordClass}`}>
        Verisight
      </span>
      {showTagline && (
        <span className={`mt-1 font-semibold uppercase text-slate-400 ${taglineClass}`}>
          People, patterns, priorities
        </span>
      )}
    </Link>
  )
}
