import Link from 'next/link'

const displayFont = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const bodyFont = 'var(--font-ibm-plex-sans), system-ui, sans-serif'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F4F1EA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: '-0.02em',
            color: '#0D1B2A',
            textDecoration: 'none',
            marginBottom: 40,
          }}
        >
          Loep<span style={{ color: '#E8A020' }}>.</span>
        </Link>

        <p
          style={{
            fontFamily: displayFont,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#B9571F',
            marginBottom: 14,
          }}
        >
          Pagina niet gevonden
        </p>

        <h1
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 'clamp(28px, 4.5vw, 40px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: '#0D1B2A',
            marginBottom: 16,
          }}
        >
          Deze pagina bestaat niet of is verplaatst.
        </h1>

        <p
          style={{
            fontFamily: bodyFont,
            fontSize: 16,
            lineHeight: 1.6,
            color: '#4A6070',
            marginBottom: 32,
          }}
        >
          Controleer de URL, of bekijk welke scan bij je vraagstuk past.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <Link
            href="/producten"
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: 15,
              color: '#FFFFFF',
              background: '#B9571F',
              borderRadius: 6,
              padding: '13px 22px',
              textDecoration: 'none',
            }}
          >
            Bekijk de producten
          </Link>
          <Link
            href="/kennismaking"
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: 15,
              color: '#0D1B2A',
              background: 'transparent',
              border: '1px solid rgba(13,27,42,0.25)',
              borderRadius: 6,
              padding: '12px 22px',
              textDecoration: 'none',
            }}
          >
            Plan een kennismaking
          </Link>
        </div>

        <p style={{ fontFamily: bodyFont, fontSize: 13, color: '#8B95A0' }}>
          Foutcode 404 ·{' '}
          <a href="mailto:hallo@getloep.nl" style={{ color: '#4A6070' }}>
            hallo@getloep.nl
          </a>
        </p>
      </div>
    </div>
  )
}
