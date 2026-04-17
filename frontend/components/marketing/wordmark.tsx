import Link from 'next/link'
import Image from 'next/image'

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
  const imageSize =
    size === 'sm'
      ? { width: 260, height: 60 }
      : { width: 320, height: 74 }

  return (
    <Link href={href} className={`inline-flex flex-col items-start leading-none ${className}`}>
      <Image
        src={showTagline ? '/verisight-wordmark.svg' : '/verisight-logo-text.svg'}
        alt="Verisight"
        width={imageSize.width}
        height={imageSize.height}
        className={size === 'sm' ? 'h-auto w-[220px] sm:w-[240px]' : 'h-auto w-[250px] sm:w-[290px]'}
        style={light ? { filter: 'brightness(0) invert(1)' } : undefined}
        priority
      />
    </Link>
  )
}
