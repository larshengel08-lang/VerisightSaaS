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
          background: 'linear-gradient(145deg, #f4f1ea 0%, #ffffff 48%, #efe8dc 100%)',
          padding: '56px',
          color: '#0d1b2a',
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
            background: 'rgba(232,160,32,0.18)',
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
            background: 'rgba(13,27,42,0.08)',
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
                background: '#ffffff',
                border: '2px solid rgba(232,160,32,0.26)',
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
              ExitScan + RetentieScan
            </div>
            <div style={{ fontSize: '74px', fontWeight: 700, lineHeight: 1.02 }}>
              Kies eerst de juiste route.
            </div>
            <div style={{ fontSize: '34px', lineHeight: 1.3, color: '#4A6070' }}>
              Begrijp waarom mensen gingen of zie eerder waar behoud onder druk staat.
            </div>
            <div style={{ fontSize: '26px', lineHeight: 1.5, color: '#4A6070' }}>
              Loep levert twee duidelijke producten met dashboard, rapport en managementduiding in dezelfde taal.
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
                color: '#ffffff',
                padding: '28px',
                boxShadow: '0 24px 70px rgba(15, 23, 42, 0.18)',
              }}
            >
              <div style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#F2C76F' }}>
                Voor HR-teams
              </div>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.2 }}>
                Dashboard, rapport en productkeuze in één commerciële flow
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderRadius: '28px',
                background: '#ffffff',
                border: '2px solid rgba(13,27,42,0.12)',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#6A7783' }}>
                Live routes
              </div>
              <div style={{ fontSize: '24px', lineHeight: 1.3, color: '#0D1B2A' }}>
                ExitScan
              </div>
              <div style={{ fontSize: '24px', lineHeight: 1.3, color: '#B07A10' }}>
                RetentieScan
              </div>
              <div style={{ fontSize: '22px', lineHeight: 1.3, color: '#4A6070' }}>
                Combinatie
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
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D1B2A' }}>www.verisight.nl</div>
          </div>
          <div style={{ fontSize: '24px', color: '#4A6070' }}>ExitScan en RetentieScan voor HR-teams</div>
        </div>
      </div>
    ),
    size,
  )
}

