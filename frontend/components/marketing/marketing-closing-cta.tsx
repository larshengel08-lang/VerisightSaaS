'use client'

import Link from 'next/link'
import { Arrow, FF, SHELL, T, SectionMark } from '@/components/marketing/design-tokens'

interface MarketingClosingCtaProps {
  href: string
  id?: string
  sectionIndex?: string
  sectionLabel?: string
  backdropNumber?: string | null
  title?: string
  accentTitle?: string
  body?: string
  buttonLabel?: string
  note?: string
  showSectionMark?: boolean
}

export function MarketingClosingCta({
  href,
  id = 'kennismaking',
  sectionIndex = '06',
  sectionLabel = 'Plan een kennismaking',
  backdropNumber = sectionIndex,
  title = 'Wilt u zien',
  accentTitle = 'welke route nu het meest logisch is?',
  body = 'Plan een korte kennismaking. Dan ziet u of Verisight past, welke eerste route logisch is en hoe de output er in uw situatie uit kan zien.',
  buttonLabel = 'Plan een kennismaking',
  note,
  showSectionMark = true,
}: MarketingClosingCtaProps) {
  void backdropNumber
  return (
    <section
      id={id}
      style={{
        background: `linear-gradient(180deg, ${T.paper} 0%, ${T.paperSoft} 100%)`,
        overflow: 'hidden',
        padding: 'clamp(56px, 7vw, 92px) 0',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, position: 'relative' }}>
        {showSectionMark ? <SectionMark num={sectionIndex} label={sectionLabel} inView /> : null}

        <div
          className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,0.78fr)] xl:items-end"
          style={{ minHeight: 320 }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: T.ink,
                fontFamily: FF,
                fontSize: 'clamp(3rem, 5vw, 4.9rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 0.95,
                marginBottom: 18,
                maxWidth: '10.5ch',
              }}
            >
              {title}
              <br />
              <span style={{ color: ACcent, fontStyle: 'italic', fontWeight: 300 }}>{accentTitle}</span>
            </h2>
          </div>

          <div style={{ maxWidth: '31rem', minWidth: 0 }}>
            <p style={{ color: T.inkSoft, fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>{body}</p>

            <Link
              href={href}
              style={{
                alignItems: 'center',
                background: T.ink,
                color: '#fff',
                display: 'inline-flex',
                fontSize: 15,
                fontWeight: 600,
                gap: 10,
                justifyContent: 'space-between',
                padding: '16px 22px',
                textDecoration: 'none',
              }}
            >
              {buttonLabel} <Arrow />
            </Link>
            {note ? (
              <p style={{ color: T.inkMuted, fontSize: 12.5, lineHeight: 1.65, marginTop: 12 }}>{note}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
const ACcent = 'oklch(0.45 0.18 50)'
