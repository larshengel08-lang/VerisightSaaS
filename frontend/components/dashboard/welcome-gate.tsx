'use client'

import { useState, useEffect } from 'react'
import { SetupWizardCard } from './setup-wizard-card'
import type { ScanType } from '@/lib/types'
import type { SegmentDepartmentStored } from '@/lib/self-send-comms'

interface Props {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  initialLaunchDate: string | null
  initialInvitedCount: number | null
  segmentDepartments?: SegmentDepartmentStored[] | null
  departmentResponseCounts?: Record<string, number>
}

const BALLOONS = [
  { left: '8%',  delay: '0s',    dur: '3.8s', color: '#E8A020', size: 44 },
  { left: '20%', delay: '0.4s',  dur: '4.2s', color: '#0D1B2A', size: 36 },
  { left: '35%', delay: '0.2s',  dur: '3.5s', color: '#E8A020', size: 52 },
  { left: '50%', delay: '0.7s',  dur: '4.6s', color: '#c4e0f5', size: 40 },
  { left: '63%', delay: '0.1s',  dur: '3.9s', color: '#0D1B2A', size: 48 },
  { left: '77%', delay: '0.5s',  dur: '4.1s', color: '#E8A020', size: 34 },
  { left: '88%', delay: '0.3s',  dur: '3.6s', color: '#c4e0f5', size: 42 },
]

export function WelcomeGate(props: Props) {
  const storageKey = `loep_welcome_seen_${props.campaignId}`
  const [seen, setSeen] = useState<boolean | null>(null)

  useEffect(() => {
    setSeen(localStorage.getItem(storageKey) === '1')
  }, [storageKey])

  function handleBegin() {
    localStorage.setItem(storageKey, '1')
    setSeen(true)
  }

  // Still hydrating
  if (seen === null) return null

  if (seen) {
    return (
      <SetupWizardCard {...props} />
    )
  }

  return (
    <>
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(12deg); opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(18px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .balloon-wrap {
          position: absolute;
          bottom: -60px;
          animation: float-up var(--dur) var(--delay) ease-in infinite;
        }
        .balloon-inner {
          animation: sway 2.4s ease-in-out infinite alternate;
        }
        .balloon-body {
          border-radius: 50%;
          position: relative;
        }
        .balloon-body::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 28px;
          background: rgba(0,0,0,0.25);
        }
        .welcome-content {
          animation: fade-in-up 0.7s 0.3s both;
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 24,
          background: 'linear-gradient(160deg, #0D1B2A 0%, #1B3550 100%)',
        }}
      >
        {/* Balloons */}
        {BALLOONS.map((b, i) => (
          <div
            key={i}
            className="balloon-wrap"
            style={{ left: b.left, '--dur': b.dur, '--delay': b.delay } as React.CSSProperties}
          >
            <div className="balloon-inner">
              <div
                className="balloon-body"
                style={{ width: b.size, height: b.size * 1.15, background: b.color, opacity: 0.85 }}
              />
            </div>
          </div>
        ))}

        {/* Content */}
        <div className="welcome-content" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 480, zIndex: 1 }}>
          <p style={{ color: '#E8A020', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>
            {props.organizationName}
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '2.6rem', lineHeight: 1.1, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
            Je eerste scan staat klaar.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 40px' }}>
            In drie stappen lanceer je de uitnodiging naar je medewerkers. Klaar in ongeveer 5 minuten.
          </p>
          <button
            onClick={handleBegin}
            style={{
              background: '#E8A020',
              color: '#0D1B2A',
              border: 'none',
              borderRadius: 14,
              padding: '16px 40px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Begin met de setup →
          </button>
        </div>
      </div>
    </>
  )
}
