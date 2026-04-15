import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { getMarketingProductBySlug } from '@/lib/marketing-products'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

type Props = {
  params: Promise<{ slug: string }>
}

function getTheme(slug: string, product: { status: string } | null) {
  if (slug === 'retentiescan') {
    return {
      accent: '#059669',
      accentSoft: '#d1fae5',
      panel: '#ecfdf5',
      badge: 'Vroegsignalering',
    }
  }

  if (slug === 'combinatie') {
    return {
      accent: '#0284c7',
      accentSoft: '#dbeafe',
      panel: '#f0f9ff',
      badge: 'Portfolioroute',
    }
  }

  if (product?.status === 'reserved_future') {
    return {
      accent: '#475569',
      accentSoft: '#e2e8f0',
      panel: '#f8fafc',
      badge: 'Bewust nog niet actief',
    }
  }

  return {
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    panel: '#eff6ff',
    badge: 'Vertrekduiding',
  }
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const theme = getTheme(slug, product)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #f8fbff 0%, #ffffff 45%, #eef4ff 100%)',
          padding: '56px',
          color: '#0f172a',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-40px',
            width: '320px',
            height: '320px',
            borderRadius: '999px',
            background: theme.accentSoft,
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-110px',
            left: '-70px',
            width: '360px',
            height: '360px',
            borderRadius: '999px',
            background: '#e2e8f0',
            opacity: 0.5,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxWidth: '760px',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '999px',
                background: '#ffffff',
                border: `2px solid ${theme.accentSoft}`,
                color: theme.accent,
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '999px',
                  background: theme.accent,
                }}
              />
              {theme.badge}
            </div>
            <div style={{ fontSize: '76px', fontWeight: 700, lineHeight: 1.02 }}>{product.label}</div>
            <div style={{ fontSize: '34px', lineHeight: 1.3, color: '#334155' }}>{product.tagline}</div>
            <div style={{ fontSize: '26px', lineHeight: 1.5, color: '#475569', maxWidth: '840px' }}>
              {product.description}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              minWidth: '280px',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderRadius: '32px',
                background: '#0d1b2e',
                color: '#ffffff',
                padding: '26px',
                boxShadow: '0 24px 70px rgba(15, 23, 42, 0.18)',
              }}
            >
              <div style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#93c5fd' }}>
                Verisight
              </div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.2 }}>
                {product.serviceOutput ?? 'Dashboard en managementrapport'}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRadius: '26px',
                background: theme.panel,
                border: `2px solid ${theme.accentSoft}`,
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#64748b' }}>
                Voor
              </div>
              <div style={{ fontSize: '24px', lineHeight: 1.35, color: '#0f172a' }}>
                {product.serviceAudience ?? 'HR-teams en directies'}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '999px',
                background: theme.accent,
              }}
            />
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>www.verisight.nl</div>
          </div>
          <div style={{ fontSize: '24px', color: '#334155' }}>ExitScan en RetentieScan voor HR-teams</div>
        </div>
      </div>
    ),
    size,
  )
}
