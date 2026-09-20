import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
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
          background: 'linear-gradient(145deg, #F4F1EA 0%, #FFFFFF 48%, #EEE8DE 100%)',
          padding: '56px',
          color: '#0D1B2A',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-90px',
            right: '-30px',
            width: '320px',
            height: '320px',
            borderRadius: '999px',
            background: 'rgba(232,160,32,0.16)',
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-60px',
            width: '360px',
            height: '360px',
            borderRadius: '999px',
            background: '#EEE8DE',
            opacity: 0.85,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '28px', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '720px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '2px solid rgba(232,160,32,0.35)',
                color: '#B07A10',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '999px',
                  background: '#E8A020',
                }}
              />
              Loep Behoud · Loep Vertrek · Loep Start
            </div>
            <div style={{ fontSize: '58px', fontWeight: 700, lineHeight: 1.05 }}>
              Zie waar behoud onder druk staat, voordat mensen gaan.
            </div>
            <div style={{ fontSize: '30px', lineHeight: 1.3, color: '#4A6070' }}>
              Waar het wringt, waarom volgens je mensen zelf, en waar je begint.
            </div>
            <div style={{ fontSize: '26px', lineHeight: 1.5, color: '#6A7783' }}>
              Meting en rapport. Het gesprek met je MT voer je zelf.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '320px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderRadius: '30px',
                background: '#0D1B2A',
                color: '#FFFFFF',
                padding: '28px',
                boxShadow: '0 24px 70px rgba(13, 27, 42, 0.18)',
              }}
            >
              <div style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#E8A020' }}>
                Voor HR en management
              </div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.2 }}>
                Een rapport dat je MT-gesprek leidt
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderRadius: '28px',
                background: '#FFFFFF',
                border: '2px solid rgba(13,27,42,0.15)',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#6A7783' }}>
                Drie scans
              </div>
              <div style={{ fontSize: '24px', lineHeight: 1.3, color: '#0D1B2A' }}>
                Loep Vertrek
              </div>
              <div style={{ fontSize: '24px', lineHeight: 1.3, color: '#0D1B2A' }}>
                Loep Behoud
              </div>
              <div style={{ fontSize: '24px', lineHeight: 1.3, color: '#0D1B2A' }}>
                Loep Start
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
                background: '#E8A020',
              }}
            />
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D1B2A' }}>www.getloep.nl</div>
          </div>
          <div style={{ fontSize: '24px', color: '#4A6070' }}>Meting en rapport · Het gesprek voer je zelf</div>
        </div>
      </div>
    ),
    size,
  )
}
