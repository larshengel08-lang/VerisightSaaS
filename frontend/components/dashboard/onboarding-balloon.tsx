'use client'

/**
 * Onboarding balloons — stapsgewijze begeleiding voor nieuwe HR-managers.
 *
 * Werking:
 *  - Stap 1: ballon verschijnt op het dashboard naast "Open dashboard →"
 *  - Stap 2: ballon verschijnt op de campagnepagina naast de PDF-knop
 *  - Voortgang opgeslagen in localStorage (verisight_onboarding_step)
 *  - Alleen zichtbaar voor niet-admins (bepaald server-side, doorgegeven als prop)
 */

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'verisight_onboarding_step'
const DONE = 99

function getStep(): number {
  if (typeof window === 'undefined') return 0
  const val = localStorage.getItem(STORAGE_KEY)
  return val ? parseInt(val, 10) : 1
}

function saveStep(step: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(step))
}

// ── Zichtbare ballon ────────────────────────────────────────────────────────

interface BalloonProps {
  step: number
  label: string
  align?: 'left' | 'right'
}

export function OnboardingBalloon({ step, label, align = 'left' }: BalloonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getStep() === step)
  }, [step])

  if (!visible) return null

  return (
    <div
      className={`pointer-events-none absolute bottom-full z-20 mb-2 ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {/* Tekst-ballon */}
      <div className="flex animate-bounce items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg">
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-600">
          {step}
        </span>
        {label}
      </div>
      {/* Pijlpunt naar beneden */}
      <div
        className={`-mt-1.5 h-2.5 w-2.5 rotate-45 bg-blue-600 ${
          align === 'right' ? 'ml-auto mr-4' : 'ml-4'
        }`}
      />
    </div>
  )
}

// ── Onzichtbare component — zet stap vooruit bij page load ──────────────────

export function OnboardingAdvancer({ fromStep }: { fromStep: number }) {
  useEffect(() => {
    if (getStep() === fromStep) {
      saveStep(fromStep + 1)
    }
  }, [fromStep])

  return null
}

// ── Markeer onboarding als afgerond ────────────────────────────────────────

export function OnboardingFinisher() {
  useEffect(() => {
    saveStep(DONE)
  }, [])

  return null
}
