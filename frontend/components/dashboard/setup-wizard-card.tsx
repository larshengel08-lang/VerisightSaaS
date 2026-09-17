'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'
import {
  MIN_INVITED_PER_DEPARTMENT,
  MIN_INVITED_TOTAL,
  validateDepartmentInvitedCount,
  validateInvitedTotal,
} from '@/lib/response-activation'
import {
  DEFAULT_REMINDER_AFTER_DAYS,
  REMINDER_CHOICES,
  addDays,
  defaultClosesAt,
  isReminderChoice,
  maxClosesAt,
  minClosesAt,
  reminderConfigFromChoice,
  validateSchedule,
  type ReminderChoice,
} from '@/lib/campaign-schedule'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { ConfirmDialog } from './confirm-dialog'
import { CampaignTimeline } from './campaign-timeline'
import { buildCampaignTimeline } from '@/lib/dashboard/campaign-timeline'
import {
  buildInviteTemplate,
  buildSegmentSurveyLinks,
  buildSurveyLink,
  slugify,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'
import { saveLaunchSetupAction, confirmLaunchAction } from '@/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions'
import { saveSegmentDepartmentsAction } from '@/app/(dashboard)/campaigns/[id]/setup/segment-actions'

export interface SetupWizardCardProps {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  initialLaunchDate: string | null
  initialInvitedCount: number | null
  /** campaigns.closes_at (date), of null als er nog geen sluitdatum is ingesteld. */
  initialClosesAt: string | null
  /** Uit campaign_delivery_records.reminder_config; null als nog nooit opgeslagen. */
  initialReminderChoice: ReminderChoice | null
  segmentDepartments?: SegmentDepartmentStored[] | null
  departmentResponseCounts?: Record<string, number>
}

type WizardStep = 1 | 2

interface DeptRow {
  label: string
  invitedCount: number | ''
}

const SCAN_TIP: Partial<Record<ScanType, string>> = {
  retention:  'Informeer je team vooraf dat er een korte vragenlijst aankomt. Dat verhoogt de respons aanzienlijk.',
  exit:       'Stuur leidinggevenden vooraf een korte intro. Medewerkers die het verwachten vullen vaker in.',
  onboarding: 'Laat de direct leidinggevende weten dat nieuwe medewerkers een korte vragenlijst ontvangen.',
}

// Toelichting bij "Aantal deelnemers", per scan (spec 2026-09-16 par. 5.2).
const INVITED_COUNT_HELP: Partial<Record<ScanType, string>> = {
  retention:  'Iedereen die je uitnodigt, inclusief parttimers en oproepkrachten. Stagiairs alleen als ze de vragenlijst ook krijgen.',
  exit:       'Het aantal mensen dat in de meetperiode vertrekt en de vragenlijst krijgt, niet het hele personeelsbestand.',
  onboarding: 'Alle nieuwe medewerkers die je in deze ronde uitnodigt.',
}
const DEFAULT_INVITED_COUNT_HELP = 'Iedereen die de vragenlijst van je krijgt.'
const LAUNCH_DATE_HELP = 'De dag waarop je de uitnodiging verstuurt.'
const CLOSES_AT_HELP = 'Op deze datum vraagt Loep je de meting te sluiten of te verlengen. Drie weken is gebruikelijk; verlengen kan met twee weken per keer.'
const REMINDER_HELP = 'Op die dag zet Loep de herinneringstekst voor je klaar; jij verstuurt hem vanuit je eigen mail.'
const DEPARTMENT_HELP = `Per afdeling zijn minimaal ${MIN_INVITED_PER_DEPARTMENT} ingevulde vragenlijsten nodig om apart in het rapport te verschijnen, en vanaf 10 zie je de spreiding.`

const fieldLabelClass = 'mb-1 block text-xs font-semibold text-white/50'
const helpClass = 'mt-1 text-[10px] leading-relaxed text-white/40'
const inputClass =
  'w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50'

export function SetupWizardCard({
  campaignId,
  scanType,
  organizationName,
  publicSurveyToken,
  frontendBaseUrl,
  initialLaunchDate,
  initialInvitedCount,
  initialClosesAt,
  initialReminderChoice,
  segmentDepartments,
  departmentResponseCounts,
}: SetupWizardCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Segment-modus: de campagne heeft een (evt. lege) afdelingslijst (spec
  // 2026-07-12 par. 1/5). Een lege lijst betekent "modus aan, klant moet nog
  // vullen": geen algemene link wordt dan getoond, wel het afdelingenblok.
  const segmentMode = Boolean(segmentDepartments)

  // Altijd stap 1 (spec 2026-09-16 par. 5.2): tot de lancering kan de klant
  // corrigeren, ook na een herlaad. De opgeslagen waarden staan voorgevuld.
  const [step, setStep] = useState<WizardStep>(1)
  const [launchDate, setLaunchDate] = useState(initialLaunchDate ?? '')
  const [closesAt, setClosesAt] = useState(
    initialClosesAt ?? (initialLaunchDate ? defaultClosesAt(initialLaunchDate) : ''),
  )
  // Zolang de klant de sluitdatum niet zelf heeft aangeraakt, volgt hij de
  // startdatum (start + 21). Daarna blijft de eigen keuze staan. Een eerder
  // opgeslagen standaardwaarde telt als niet aangeraakt, anders zakt hij na een
  // latere startdatum onder de minimale looptijd.
  const [closesAtTouched, setClosesAtTouched] = useState(
    Boolean(initialClosesAt) &&
      !(initialLaunchDate && initialClosesAt === defaultClosesAt(initialLaunchDate)),
  )
  const [reminderChoice, setReminderChoice] = useState<ReminderChoice>(
    initialReminderChoice ?? DEFAULT_REMINDER_AFTER_DAYS,
  )
  const [invitedCount, setInvitedCount] = useState<number | ''>(initialInvitedCount ?? '')
  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [step2Error, setStep2Error] = useState<string | null>(null)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const [everCopied, setEverCopied] = useState(false)
  const [copiedDeptSlug, setCopiedDeptSlug] = useState<string | null>(null)
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false)

  // Rijen voor het afdelingenblok. Startpunt: bestaande afdelingen, of (als
  // de lijst nog leeg is) twee lege rijen zodat de minimaal-2-eis meteen
  // zichtbaar is.
  const [deptRows, setDeptRows] = useState<DeptRow[]>(() => {
    if (segmentDepartments && segmentDepartments.length > 0) {
      return segmentDepartments.map((d) => ({
        label: d.label,
        invitedCount: d.invited_count ?? '',
      }))
    }
    return [{ label: '', invitedCount: '' }, { label: '', invitedCount: '' }]
  })

  // Afdelingen met >=1 respondent: naam-wijziging/verwijdering niet meer
  // toegestaan, de link is al in omloop (spec 2026-07-12 par. 3).
  const lockedDepartments = new Set(
    Object.keys(departmentResponseCounts ?? {}).filter(
      (label) => (departmentResponseCounts![label] ?? 0) > 0,
    ),
  )

  // Alleen rijen met een ingevulde naam tellen mee: een leeg-genaamde rij
  // wordt bij opslaan niet meegenomen in segment_departments, dus het getoonde
  // totaal moet daarmee overeenkomen.
  const totalInvited = deptRows
    .filter((row) => row.label.trim())
    .reduce((sum, row) => sum + (typeof row.invitedCount === 'number' ? row.invitedCount : 0), 0)

  const surveyLink = buildSurveyLink(frontendBaseUrl, publicSurveyToken)
  const scanLabel = SCAN_TYPE_LABELS[scanType] ?? scanType
  const inviteDepartmentLinks =
    segmentDepartments && segmentDepartments.length > 0
      ? buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, segmentDepartments)
      : undefined
  const { subject: inviteSubject, body: inviteBody } = buildInviteTemplate({
    senderName: '',
    organizationName,
    scanType,
    surveyLink,
    departmentLinks: inviteDepartmentLinks,
  })

  const [editableSubject, setEditableSubject] = useState(inviteSubject)
  const [editableBody, setEditableBody] = useState(inviteBody)

  const today = new Date().toISOString().slice(0, 10)
  const tip = SCAN_TIP[scanType]
  const invitedHelp = INVITED_COUNT_HELP[scanType] ?? DEFAULT_INVITED_COUNT_HELP
  const reminderDateLabel =
    reminderChoice !== 'none' && launchDate ? formatDutchDate(addDays(launchDate, reminderChoice)) : null
  // Vooruitblik voor stap 3 (spec 2026-09-16 par. 4.2): dezelfde tijdlijn als
  // op de kaart van een lopende meting, met wat de klant nu invult.
  const previewReminderConfig = reminderConfigFromChoice(reminderChoice)
  const previewTimeline = buildCampaignTimeline({
    launchDate: launchDate || null,
    launchConfirmedAt: null,
    reminderEnabled: previewReminderConfig.enabled,
    reminderAfterDays: previewReminderConfig.firstReminderAfterDays,
    reminderHandledAt: null,
    reminderSkipped: false,
    closesAt: closesAt || null,
    scanType,
  })

  function handleLaunchDateChange(value: string) {
    setLaunchDate(value)
    if (!closesAtTouched) setClosesAt(value ? defaultClosesAt(value) : '')
  }

  function handleReminderChange(raw: string) {
    const parsed: unknown = raw === 'none' ? 'none' : Number(raw)
    if (isReminderChoice(parsed)) setReminderChoice(parsed)
  }

  function updateDeptRow(index: number, patch: Partial<DeptRow>) {
    setDeptRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addDeptRow() {
    setDeptRows((prev) => [...prev, { label: '', invitedCount: '' }])
  }

  function removeDeptRow(index: number) {
    setDeptRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleCopyDeptLink(slug: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setEverCopied(true)
      setCopiedDeptSlug(slug)
      setTimeout(() => setCopiedDeptSlug(null), 2000)
    } catch { /* clipboard unavailable */ }
  }

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    setStep1Error(null)

    // Dezelfde regels als saveLaunchSetupAction, zodat de klant de fout hier
    // al leest en de server alleen nog de tweede grens is.
    const schedule = validateSchedule(
      { launchDate, closesAt, reminderChoice, today },
      { storedLaunchDate: initialLaunchDate },
    )
    if (!schedule.ok) { setStep1Error(schedule.error); return }

    if (segmentMode) {
      const incoming = deptRows
        .filter((row) => row.label.trim())
        .map((row) => ({
          label: row.label.trim(),
          invited_count: typeof row.invitedCount === 'number' ? row.invitedCount : 0,
        }))
      if (incoming.length < 2) {
        setStep1Error('Vul minimaal 2 afdelingen in (naam + aantal deelnemers).')
        return
      }
      for (const row of incoming) {
        const deptError = validateDepartmentInvitedCount(row.label, row.invited_count)
        if (deptError) { setStep1Error(deptError); return }
      }
      const totalError = validateInvitedTotal(totalInvited)
      if (totalError) { setStep1Error(totalError); return }

      startTransition(async () => {
        const segResult = await saveSegmentDepartmentsAction(campaignId, incoming)
        if (!segResult.ok) { setStep1Error(segResult.error ?? 'Er ging iets mis.'); return }
        // totalInvited is afgeleid van dezelfde gefilterde rijen als `incoming`
        // en komt dus overeen met wat saveSegmentDepartmentsAction als som opsloeg.
        const launchResult = await saveLaunchSetupAction(campaignId, {
          launchDate,
          invitedCount: totalInvited,
          closesAt,
          reminderChoice,
        })
        if (!launchResult.ok) {
          // De servermelding zegt zelf al wat wel en niet is opgeslagen en of
          // je opnieuw moet proberen; hier alleen de afdelingen erbij noemen.
          setStep1Error(
            `Afdelingen zijn opgeslagen. ${launchResult.error ?? 'De planning is niet opgeslagen. Probeer opnieuw.'}`,
          )
          return
        }
        setStep(2)
      })
      return
    }

    const invitedError = validateInvitedTotal(invitedCount)
    if (invitedError) { setStep1Error(invitedError); return }
    startTransition(async () => {
      const result = await saveLaunchSetupAction(campaignId, {
        launchDate,
        invitedCount: Number(invitedCount),
        closesAt,
        reminderChoice,
      })
      if (!result.ok) { setStep1Error(result.error ?? 'Er ging iets mis.'); return }
      setStep(2)
    })
  }

  async function handleCopy(text: string, which: 'subject' | 'body') {
    try {
      await navigator.clipboard.writeText(text)
      setEverCopied(true)
      if (which === 'subject') { setCopiedSubject(true); setTimeout(() => setCopiedSubject(false), 2000) }
      else { setCopiedBody(true); setTimeout(() => setCopiedBody(false), 2000) }
    } catch { /* clipboard unavailable */ }
  }

  function openLaunchDialog() {
    setStep2Error(null)
    setLaunchDialogOpen(true)
  }

  function backToStep1() {
    setStep2Error(null)
    setStep(1)
  }

  // Onomkeerbaar (spec 2026-09-16 par. 5.2 en 9): pas na de eigen dialoog telt
  // de meting als gestart en is stap 1 niet meer te wijzigen.
  function handleConfirmLaunch() {
    setLaunchDialogOpen(false)
    startTransition(async () => {
      const result = await confirmLaunchAction(campaignId)
      if (!result.ok) { setStep2Error(result.error ?? 'Er ging iets mis.'); return }
      router.refresh()
    })
  }

  return (
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8A020]">
        {scanLabel}
      </p>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
        Welkom {organizationName} bij Loep
      </h1>
      <p className="mt-2 text-[0.95rem] text-[color:var(--dashboard-text)]">
        Doorloop drie stappen om je meting te starten.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">

        {/* Stap 1 */}
        <div className={`relative rounded-[18px] p-5 ${step === 1 ? 'bg-[#0D1B2A]' : 'border border-[color:var(--dashboard-frame-border)] bg-white opacity-45'}`}>
          <p className={`mb-3 text-xs font-semibold ${step === 1 ? 'text-[#E8A020]' : 'text-[color:var(--dashboard-muted)]'}`}>
            {step > 1 ? 'Stap 1: klaar' : 'Stap 1: nu'}
          </p>
          <p className={`mb-1 text-sm font-semibold ${step === 1 ? 'text-white' : 'text-[color:var(--dashboard-ink)]'}`}>
            Planning en deelnemers
          </p>
          <p className={`text-xs ${step === 1 ? 'text-white/50' : 'text-[color:var(--dashboard-muted)]'}`}>
            Wanneer start en sluit de meting, en naar hoeveel medewerkers gaat hij?
          </p>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="launch-date" className={fieldLabelClass}>Startdatum</label>
                <input
                  id="launch-date"
                  type="date" min={today} value={launchDate}
                  onChange={(e) => handleLaunchDateChange(e.target.value)}
                  className={inputClass}
                />
                <p className={helpClass}>{LAUNCH_DATE_HELP}</p>
              </div>

              <div>
                <label htmlFor="closes-at" className={fieldLabelClass}>Sluitdatum</label>
                <input
                  id="closes-at"
                  type="date"
                  min={launchDate ? minClosesAt(launchDate) : today}
                  max={launchDate ? maxClosesAt(launchDate) : undefined}
                  value={closesAt}
                  onChange={(e) => { setClosesAtTouched(true); setClosesAt(e.target.value) }}
                  className={inputClass}
                />
                <p className={helpClass}>{CLOSES_AT_HELP}</p>
              </div>

              <div>
                <label htmlFor="reminder-choice" className={fieldLabelClass}>Herinnering</label>
                <select
                  id="reminder-choice"
                  value={String(reminderChoice)}
                  onChange={(e) => handleReminderChange(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  {REMINDER_CHOICES.map((choice) => (
                    <option key={String(choice.value)} value={String(choice.value)} className="text-[#0D1B2A]">
                      {choice.label}
                    </option>
                  ))}
                </select>
                <p className={helpClass}>
                  {REMINDER_HELP}
                  {reminderDateLabel ? ` Dat is op ${reminderDateLabel}.` : ''}
                </p>
              </div>

              {segmentMode ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-white/50">Afdelingen en links</p>
                    <p className={helpClass}>{DEPARTMENT_HELP}</p>
                    <p className={helpClass}>{invitedHelp}</p>
                  </div>

                  <div className="space-y-2">
                    {deptRows.map((row, index) => {
                      const isLocked = lockedDepartments.has(row.label)
                      const links = row.label.trim()
                        ? buildSegmentSurveyLinksSafe(frontendBaseUrl, publicSurveyToken, row.label)
                        : null
                      return (
                        <div key={index} className="rounded-lg border border-white/15 bg-white/5 p-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={row.label}
                              disabled={isLocked}
                              placeholder="Afdelingsnaam"
                              onChange={(e) => updateDeptRow(index, { label: e.target.value })}
                              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50 disabled:opacity-50"
                            />
                            <input
                              type="number" min={MIN_INVITED_PER_DEPARTMENT}
                              value={row.invitedCount}
                              placeholder="aantal"
                              onChange={(e) =>
                                updateDeptRow(index, {
                                  invitedCount: e.target.value === '' ? '' : Number(e.target.value),
                                })
                              }
                              className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50"
                            />
                            {!isLocked && deptRows.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeDeptRow(index)}
                                className="rounded-lg border border-white/15 px-2 text-xs text-white/50 hover:bg-white/10"
                                aria-label="Verwijder afdeling"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {isLocked && (
                            <p className="mt-1.5 text-[10px] text-white/40">
                              Naam vergrendeld: er zijn al responses op deze link.
                            </p>
                          )}
                          {links && (
                            <div className="mt-2 flex items-center gap-2">
                              <code className="flex-1 truncate rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] text-white/50">
                                {links.url}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopyDeptLink(links.slug, links.url)}
                                className="whitespace-nowrap rounded border border-white/20 px-2 py-1 text-[10px] font-semibold text-white/80 hover:bg-white/10"
                              >
                                {copiedDeptSlug === links.slug ? 'Gekopieerd ✓' : 'Kopieer link'}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={addDeptRow}
                    className="w-full rounded-lg border border-dashed border-white/30 px-3 py-2 text-xs text-white/70 hover:bg-white/5"
                  >
                    + Afdeling toevoegen
                  </button>

                  <div className="flex items-center justify-between border-t border-white/15 pt-2 text-xs text-white/70">
                    <span>Totaal deelnemers (minimaal {MIN_INVITED_TOTAL})</span>
                    <strong className="text-white">{totalInvited}</strong>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="invited-count" className={fieldLabelClass}>Aantal deelnemers</label>
                    <input
                      id="invited-count"
                      type="number" min={MIN_INVITED_TOTAL} value={invitedCount} placeholder="bijv. 40"
                      onChange={(e) => setInvitedCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className={inputClass}
                    />
                    <p className={helpClass}>{invitedHelp}</p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-white/50">Vragenlijstlink</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-[10px] text-white/70">
                        {surveyLink}
                      </code>
                      <a href={surveyLink} target="_blank" rel="noopener noreferrer"
                        className="whitespace-nowrap rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">
                        Test →
                      </a>
                    </div>
                    <p className={helpClass}>
                      Alleen openen om te controleren. Vul hem niet volledig in, anders tellen jouw antwoorden mee.
                    </p>
                  </div>
                </>
              )}

              {step1Error && (
                <p role="alert" className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300">{step1Error}</p>
              )}

              <button type="submit" disabled={isPending}
                className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                {isPending ? 'Bezig...' : 'Opslaan en verder →'}
              </button>
            </form>
          )}
        </div>

        {/* Stap 2 */}
        <div className={`relative rounded-[18px] p-5 ${step === 2 ? 'bg-[#0D1B2A]' : 'border border-[color:var(--dashboard-frame-border)] bg-white opacity-45'}`}>
          {step < 2 && (
            <span className="absolute right-4 top-4 text-[color:var(--dashboard-muted)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
          )}
          <p className={`mb-3 text-xs font-semibold ${step === 2 ? 'text-[#E8A020]' : 'text-[color:var(--dashboard-muted)]'}`}>
            {step === 2 ? 'Stap 2: nu' : 'Stap 2'}
          </p>
          <p className={`mb-1 text-sm font-semibold ${step === 2 ? 'text-white' : 'text-[color:var(--dashboard-ink)]'}`}>
            Uitnodiging versturen
          </p>
          <p className={`text-xs ${step === 2 ? 'text-white/50' : 'text-[color:var(--dashboard-muted)]'}`}>
            Pas de tekst aan en stuur vanuit je eigen e-mail.
          </p>

          {step === 2 && (
            <div className="mt-5 space-y-3">

              <button
                type="button"
                onClick={backToStep1}
                disabled={isPending}
                className="text-[10px] font-semibold text-white/60 underline underline-offset-2 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Terug naar stap 1
              </button>

              {tip && (
                <div className="rounded-xl bg-[#E8A020]/15 border border-[#E8A020]/30 px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-[#E8A020] mb-0.5">Advies</p>
                  <p className="text-[11px] leading-relaxed text-white/70">{tip}</p>
                </div>
              )}

              {segmentMode && (
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-white/50 mb-1">Deel per afdeling de eigen link</p>
                  <p className="text-[11px] leading-relaxed text-white/60">
                    Er is bewust geen algemene link. Gebruik de links uit stap 1 per afdeling.
                  </p>
                </div>
              )}

              {/* Onderwerp */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="invite-subject" className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Onderwerp</label>
                  <button type="button" onClick={() => handleCopy(editableSubject, 'subject')}
                    className="text-[10px] font-semibold text-[#E8A020] hover:opacity-80">
                    {copiedSubject ? 'Gekopieerd ✓' : 'Kopieer'}
                  </button>
                </div>
                <input
                  id="invite-subject"
                  type="text"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
                />
              </div>

              {/* Bericht */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="invite-body" className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Bericht</label>
                  <button type="button" onClick={() => handleCopy(editableBody, 'body')}
                    className="text-[10px] font-semibold text-[#E8A020] hover:opacity-80">
                    {copiedBody ? 'Gekopieerd ✓' : 'Kopieer'}
                  </button>
                </div>
                <textarea
                  id="invite-body"
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  rows={11}
                  className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs leading-relaxed text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
                />
              </div>
              <p className="text-[10px] text-white/40">Je kunt de tekst aanpassen voor je kopieert. Vergeet niet je naam in te vullen bij &ldquo;Met vriendelijke groet&rdquo;.</p>

              <div className="border-t border-white/15 pt-3">
                {step2Error && (
                  <p role="alert" className="mb-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300">{step2Error}</p>
                )}
                <button type="button" onClick={openLaunchDialog} disabled={isPending}
                  className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                  {isPending ? 'Bezig...' : 'Ja, verstuurd →'}
                </button>
                {!everCopied && (
                  <p className="mt-1.5 text-center text-[10px] text-white/30">Tip: kopieer de tekst hierboven voor je verstuurt</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stap 3: vooruitblik. Na de lancering staat dezelfde tijdlijn op de kaart van de lopende meting. */}
        <div className="relative rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-5">
          <span className="absolute right-4 top-4 text-[color:var(--dashboard-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <p className="mb-3 text-xs font-semibold text-[color:var(--dashboard-muted)]">Stap 3</p>
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">Volgen en afronden</p>
          <p className="mb-4 text-xs text-[color:var(--dashboard-muted)]">
            Na de lancering volg je hier de respons en sluit je de meting.
          </p>
          <CampaignTimeline timeline={previewTimeline} dimmed />
        </div>
      </div>

      <ConfirmDialog
        open={launchDialogOpen}
        title="Heb je de uitnodiging verstuurd?"
        onClose={() => setLaunchDialogOpen(false)}
        actions={[
          { label: 'Nog niet', onClick: () => setLaunchDialogOpen(false) },
          { label: 'Ja, verstuurd', onClick: handleConfirmLaunch, variant: 'primary', disabled: isPending },
        ]}
      >
        <p>Heb je de uitnodiging naar je medewerkers gestuurd? Daarna telt de meting als gestart en kun je stap 1 niet meer wijzigen.</p>
        {!everCopied ? (
          <p className="font-semibold text-[#B9571F]">
            Je hebt nog niets gekopieerd. Kopieer eerst het onderwerp en het bericht en verstuur ze vanuit je eigen mail.
          </p>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

// Live link-preview tijdens het intypen: de naam is dan nog niet per se een
// geldige/unieke slug (leeg, dubbel met een andere rij). De echte validatie
// (incl. duplicaatcheck) gebeurt server-side bij opslaan via
// saveSegmentDepartmentsAction. Deze functie geeft alleen een voorlopige
// link, op basis van de gedeelde slugify() uit self-send-comms.ts.
function buildSegmentSurveyLinksSafe(
  frontendBaseUrl: string,
  publicSurveyToken: string,
  label: string,
): { slug: string; url: string } | null {
  const slug = slugify(label)
  if (!slug) return null
  const [dep] = buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, [{ label, slug }])
  return dep ? { slug, url: dep.url } : null
}
