'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'
import { buildInviteTemplate, buildSurveyLink } from '@/lib/self-send-comms'
import { saveLaunchSetupAction, confirmLaunchAction } from '@/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions'

interface Props {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  initialLaunchDate: string | null
  initialInvitedCount: number | null
}

type WizardStep = 1 | 2

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  const bg = done
    ? 'bg-[color:var(--dashboard-accent-strong)]'
    : active
      ? 'bg-[#E8A020]'
      : 'bg-[color:var(--dashboard-soft)]'
  const text = done || active ? 'text-white' : 'text-[color:var(--dashboard-muted)]'
  return (
    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${bg} ${text}`}>
      {done ? '✓' : n}
    </div>
  )
}

export function SetupWizardCard({
  campaignId,
  scanType,
  organizationName,
  publicSurveyToken,
  frontendBaseUrl,
  initialLaunchDate,
  initialInvitedCount,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<WizardStep>(
    initialLaunchDate && initialInvitedCount ? 2 : 1,
  )
  const [launchDate, setLaunchDate] = useState(initialLaunchDate ?? '')
  const [invitedCount, setInvitedCount] = useState<number | ''>(
    initialInvitedCount ?? '',
  )
  const [linkTested, setLinkTested] = useState(false)
  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [step2Error, setStep2Error] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const surveyLink = buildSurveyLink(frontendBaseUrl, publicSurveyToken)
  const scanLabel = SCAN_TYPE_LABELS[scanType] ?? scanType
  const inviteTemplate = buildInviteTemplate({
    senderName: 'HR',
    organizationName,
    scanLabel,
    surveyLink,
  })
  const inviteText = `Onderwerp: ${inviteTemplate.subject}\n\n${inviteTemplate.body}`
  const today = new Date().toISOString().slice(0, 10)

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    setStep1Error(null)
    if (!launchDate) {
      setStep1Error('Vul een startdatum in.')
      return
    }
    if (!invitedCount || Number(invitedCount) < 1) {
      setStep1Error('Vul het aantal deelnemers in (minimaal 1).')
      return
    }
    startTransition(async () => {
      const result = await saveLaunchSetupAction(
        campaignId,
        launchDate,
        Number(invitedCount),
      )
      if (!result.ok) {
        setStep1Error(result.error ?? 'Er ging iets mis.')
        return
      }
      setStep(2)
    })
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  async function handleConfirmLaunch() {
    setStep2Error(null)
    startTransition(async () => {
      const result = await confirmLaunchAction(campaignId)
      if (!result.ok) {
        setStep2Error(result.error ?? 'Er ging iets mis.')
        return
      }
      router.refresh()
    })
  }

  return (
    <section className="rounded-[22px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-7">
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
        Campagne klaarzetten
      </h1>
      <p className="mt-2 text-[0.95rem] text-[color:var(--dashboard-text)]">
        Drie stappen — klaar in ongeveer 5 minuten.
      </p>

      <div className="mt-6 space-y-4">
        {/* Stap 1 */}
        <div
          className={`rounded-[18px] border bg-white px-5 py-4 ${step === 1 ? 'border-[color:var(--dashboard-frame-border)]' : 'border-transparent opacity-60'}`}
        >
          <div className="flex items-center gap-3">
            <StepBadge n={1} active={step === 1} done={step > 1} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">
                Startdatum instellen
              </p>
              <p className="text-xs text-[color:var(--dashboard-muted)]">
                Wanneer stuur je de uitnodiging? Naar hoeveel medewerkers?
              </p>
            </div>
            {step === 1 && (
              <span className="ml-auto rounded-full bg-[#FAEEDA] px-2.5 py-0.5 text-xs font-semibold text-[#E8A020]">
                Nu doen
              </span>
            )}
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--dashboard-muted)]">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[color:var(--dashboard-frame-border)] px-3 py-2 text-sm text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dashboard-accent-strong)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[color:var(--dashboard-muted)]">
                    Aantal deelnemers
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={invitedCount}
                    onChange={(e) =>
                      setInvitedCount(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    placeholder="bijv. 40"
                    required
                    className="w-full rounded-lg border border-[color:var(--dashboard-frame-border)] px-3 py-2 text-sm text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--dashboard-accent-strong)]"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold text-[color:var(--dashboard-muted)]">
                  Survey-link
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-3 py-2 text-xs text-[color:var(--dashboard-ink)]">
                    {surveyLink}
                  </code>
                  <a
                    href={surveyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap rounded-lg border border-[color:var(--dashboard-frame-border)] px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] hover:bg-[color:var(--dashboard-soft)]"
                  >
                    Test link →
                  </a>
                </div>
                <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">
                  Let op: open de link alleen om te controleren of hij werkt. Vul de survey niet volledig in — jouw antwoorden tellen anders mee in de resultaten.
                </p>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-[color:var(--dashboard-muted)]">
                  <input
                    type="checkbox"
                    checked={linkTested}
                    onChange={(e) => setLinkTested(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  Ik heb de link getest en hij werkt
                </label>
              </div>

              {step1Error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {step1Error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-60"
              >
                {isPending ? 'Bezig…' : 'Opslaan en verder →'}
              </button>
            </form>
          )}
        </div>

        {/* Stap 2 */}
        <div
          className={`rounded-[18px] border bg-white px-5 py-4 ${step === 2 ? 'border-[color:var(--dashboard-frame-border)]' : 'border-transparent opacity-40'}`}
        >
          <div className="flex items-center gap-3">
            <StepBadge n={2} active={step === 2} done={false} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">
                Uitnodiging versturen
              </p>
              <p className="text-xs text-[color:var(--dashboard-muted)]">
                Kopieer de tekst en stuur vanuit je eigen e-mail
              </p>
            </div>
            {step === 2 && (
              <span className="ml-auto rounded-full bg-[#FAEEDA] px-2.5 py-0.5 text-xs font-semibold text-[#E8A020]">
                Nu doen
              </span>
            )}
          </div>

          {step === 2 && (
            <div className="mt-4 space-y-3">
              <pre className="whitespace-pre-wrap rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] p-3 text-xs text-[color:var(--dashboard-ink)]">
                {inviteText}
              </pre>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-[color:var(--dashboard-frame-border)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)]"
              >
                {copied ? 'Gekopieerd ✓' : 'Kopieer uitnodiging'}
              </button>

              <div className="border-t border-[color:var(--dashboard-frame-border)] pt-3">
                <p className="mb-2 text-xs text-[color:var(--dashboard-muted)]">
                  Heb je de uitnodiging verstuurd naar je medewerkers?
                </p>
                {step2Error && (
                  <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {step2Error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleConfirmLaunch}
                  disabled={isPending}
                  className="inline-flex items-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-60"
                >
                  {isPending ? 'Bezig…' : 'Ik heb de uitnodiging verstuurd →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stap 3 (informatief) */}
        <div className="rounded-[18px] border border-transparent px-5 py-4 opacity-40">
          <div className="flex items-center gap-3">
            <StepBadge n={3} active={false} done={false} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">
                Volgen & afronden
              </p>
              <p className="text-xs text-[color:var(--dashboard-muted)]">
                Respons monitoren · herinnering · rapport via Loep
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
