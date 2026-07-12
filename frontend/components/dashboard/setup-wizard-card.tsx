'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'
import { buildSegmentSurveyLinks, buildSurveyLink, type SegmentDepartmentStored } from '@/lib/self-send-comms'
import { saveLaunchSetupAction, confirmLaunchAction } from '@/app/(dashboard)/campaigns/[id]/setup/launch-setup-actions'
import { saveSegmentDepartmentsAction } from '@/app/(dashboard)/campaigns/[id]/setup/segment-actions'

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

type WizardStep = 1 | 2

interface DeptRow {
  label: string
  invitedCount: number | ''
}

const SCAN_WHY: Partial<Record<ScanType, string>> = {
  retention: 'Jouw eerlijke inzicht helpt ons gericht te verbeteren wat jij en je collega\'s dagelijks ervaren.',
  exit:      'Jouw eerlijke inzicht helpt ons begrijpen wat er speelt bij vertrek — voor de mensen die blijven.',
  onboarding: 'Jouw ervaring helpt ons de eerste maanden beter vorm te geven voor nieuwe collega\'s.',
}

const SCAN_TIP: Partial<Record<ScanType, string>> = {
  retention:  'Informeer je team vooraf dat er een korte vragenlijst aankomt. Dat verhoogt de respons aanzienlijk.',
  exit:       'Stuur leidinggevenden vooraf een korte intro — medewerkers die het verwachten vullen vaker in.',
  onboarding: 'Laat de direct leidinggevende weten dat nieuwe medewerkers een korte vragenlijst ontvangen.',
}

function buildInviteBody(args: {
  organizationName: string
  scanLabel: string
  surveyLink: string
  scanType: ScanType
}): { subject: string; body: string } {
  const why = SCAN_WHY[args.scanType] ?? 'Jouw inzicht helpt ons als organisatie verder.'
  const subject = `Uitnodiging: korte vragenlijst - ${args.organizationName}`
  const body = [
    'Beste collega,',
    '',
    `${args.organizationName} houdt een korte, anonieme vragenlijst (${args.scanLabel}).`,
    '',
    why,
    '',
    'Je antwoorden worden alleen op groepsniveau gerapporteerd en zijn niet naar jou herleidbaar.',
    '',
    `Vul de vragenlijst hier in (10-15 minuten): ${args.surveyLink}`,
    '',
    'Alvast bedankt voor je deelname.',
    '',
    'Met vriendelijke groet,',
    'HR',
  ].join('\n')
  return { subject, body }
}

export function SetupWizardCard({
  campaignId,
  scanType,
  organizationName,
  publicSurveyToken,
  frontendBaseUrl,
  initialLaunchDate,
  initialInvitedCount,
  segmentDepartments,
  departmentResponseCounts,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Segment-modus: de campagne heeft een (evt. lege) afdelingslijst (spec
  // 2026-07-12 §1/§5). Een lege lijst betekent "modus aan, klant moet nog
  // vullen" — géén algemene link wordt dan getoond, wel het afdelingenblok.
  const segmentMode = Boolean(segmentDepartments)

  const [step, setStep] = useState<WizardStep>(
    initialLaunchDate && initialInvitedCount ? 2 : 1,
  )
  const [launchDate, setLaunchDate] = useState(initialLaunchDate ?? '')
  const [invitedCount, setInvitedCount] = useState<number | ''>(initialInvitedCount ?? '')
  const [linkTested, setLinkTested] = useState(false)
  const [step1Error, setStep1Error] = useState<string | null>(null)
  const [step2Error, setStep2Error] = useState<string | null>(null)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)
  const [everCopied, setEverCopied] = useState(false)
  const [copiedDeptSlug, setCopiedDeptSlug] = useState<string | null>(null)

  // Rijen voor het afdelingenblok. Startpunt: bestaande afdelingen, of — als
  // de lijst nog leeg is (modus net aangezet) — twee lege rijen zodat de
  // minimaal-2-eis meteen zichtbaar is.
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
  // toegestaan — de link is al in omloop (spec §3).
  const lockedDepartments = new Set(
    Object.keys(departmentResponseCounts ?? {}).filter(
      (label) => (departmentResponseCounts![label] ?? 0) > 0,
    ),
  )

  const totalInvited = deptRows.reduce(
    (sum, row) => sum + (typeof row.invitedCount === 'number' ? row.invitedCount : 0),
    0,
  )

  const surveyLink = buildSurveyLink(frontendBaseUrl, publicSurveyToken)
  const scanLabel = SCAN_TYPE_LABELS[scanType] ?? scanType
  const { subject: inviteSubject, body: inviteBody } = buildInviteBody({
    organizationName,
    scanLabel,
    surveyLink,
    scanType,
  })

  const [editableSubject, setEditableSubject] = useState(inviteSubject)
  const [editableBody, setEditableBody] = useState(inviteBody)

  const today = new Date().toISOString().slice(0, 10)
  const tip = SCAN_TIP[scanType]

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
    if (!launchDate) { setStep1Error('Vul een startdatum in.'); return }

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
      startTransition(async () => {
        const segResult = await saveSegmentDepartmentsAction(campaignId, incoming)
        if (!segResult.ok) { setStep1Error(segResult.error ?? 'Er ging iets mis.'); return }
        const launchResult = await saveLaunchSetupAction(campaignId, launchDate, totalInvited)
        if (!launchResult.ok) { setStep1Error(launchResult.error ?? 'Er ging iets mis.'); return }
        setStep(2)
      })
      return
    }

    if (!invitedCount || Number(invitedCount) < 1) { setStep1Error('Vul het aantal deelnemers in (minimaal 1).'); return }
    startTransition(async () => {
      const result = await saveLaunchSetupAction(campaignId, launchDate, Number(invitedCount))
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

  async function handleConfirmLaunch() {
    setStep2Error(null)
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
        Doorloop drie stappen om je scan te lanceren.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">

        {/* Stap 1 */}
        <div className={`relative rounded-[18px] p-5 ${step === 1 ? 'bg-[#0D1B2A]' : 'border border-[color:var(--dashboard-frame-border)] bg-white opacity-45'}`}>
          <p className={`mb-3 text-xs font-semibold ${step === 1 ? 'text-[#E8A020]' : 'text-[color:var(--dashboard-muted)]'}`}>
            {step > 1 ? 'Stap 1 — Klaar ✓' : 'Stap 1 — Nu'}
          </p>
          <p className={`mb-1 text-sm font-semibold ${step === 1 ? 'text-white' : 'text-[color:var(--dashboard-ink)]'}`}>
            Startdatum instellen
          </p>
          <p className={`text-xs ${step === 1 ? 'text-white/50' : 'text-[color:var(--dashboard-muted)]'}`}>
            Wanneer stuur je de uitnodiging? Naar hoeveel medewerkers?
          </p>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Startdatum</label>
                <input
                  type="date" min={today} value={launchDate} required
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50"
                />
              </div>

              {segmentMode ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-white/50">Afdelingen &amp; links</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-white/40">
                      Elke afdeling krijgt een eigen link — minimaal 5 deelnemers per afdeling
                      voor zichtbaarheid in het rapport.
                    </p>
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
                              type="number" min={1}
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
                              🔒 naam vergrendeld — er zijn al responses op deze link
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
                    <span>Totaal deelnemers</span>
                    <strong className="text-white">{totalInvited}</strong>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/50">Aantal deelnemers</label>
                    <input
                      type="number" min={1} value={invitedCount} placeholder="bijv. 40" required
                      onChange={(e) => setInvitedCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E8A020]/50"
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-white/50">Survey-link</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-[10px] text-white/70">
                        {surveyLink}
                      </code>
                      <a href={surveyLink} target="_blank" rel="noopener noreferrer"
                        className="whitespace-nowrap rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">
                        Test →
                      </a>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-white/40">
                      Alleen openen om te controleren — niet volledig invullen, anders tellen jouw antwoorden mee.
                    </p>
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-[10px] text-white/50">
                      <input type="checkbox" checked={linkTested} onChange={(e) => setLinkTested(e.target.checked)} className="h-3.5 w-3.5 rounded" />
                      Link getest en werkt
                    </label>
                  </div>
                </>
              )}

              {step1Error && (
                <p className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300">{step1Error}</p>
              )}

              <button type="submit" disabled={isPending}
                className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                {isPending ? 'Bezig…' : 'Opslaan en verder →'}
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
            Stap 2{step === 2 ? ' — Nu' : ''}
          </p>
          <p className={`mb-1 text-sm font-semibold ${step === 2 ? 'text-white' : 'text-[color:var(--dashboard-ink)]'}`}>
            Uitnodiging versturen
          </p>
          <p className={`text-xs ${step === 2 ? 'text-white/50' : 'text-[color:var(--dashboard-muted)]'}`}>
            Pas de tekst aan en stuur vanuit je eigen e-mail.
          </p>

          {step === 2 && (
            <div className="mt-5 space-y-3">

              {/* Tip sticky */}
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
                    Er is bewust géén algemene link — gebruik de links uit stap 1 per afdeling.
                  </p>
                </div>
              )}

              {/* Onderwerp */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Onderwerp</label>
                  <button type="button" onClick={() => handleCopy(editableSubject, 'subject')}
                    className="text-[10px] font-semibold text-[#E8A020] hover:opacity-80">
                    {copiedSubject ? 'Gekopieerd ✓' : 'Kopieer'}
                  </button>
                </div>
                <textarea
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  rows={1}
                  className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Bericht</label>
                  <button type="button" onClick={() => handleCopy(editableBody, 'body')}
                    className="text-[10px] font-semibold text-[#E8A020] hover:opacity-80">
                    {copiedBody ? 'Gekopieerd ✓' : 'Kopieer'}
                  </button>
                </div>
                <textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  rows={11}
                  className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs leading-relaxed text-white/90 focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
                />
              </div>
              <p className="text-[10px] text-white/40">Je kunt de tekst aanpassen voor je kopieert. Vergeet niet je naam in te vullen bij &ldquo;Met vriendelijke groet&rdquo;.</p>

              <div className="border-t border-white/15 pt-3">
                {step2Error && (
                  <p className="mb-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300">{step2Error}</p>
                )}
                <button type="button" onClick={handleConfirmLaunch} disabled={isPending}
                  className="w-full rounded-lg bg-[#E8A020] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90 disabled:opacity-50">
                  {isPending ? 'Bezig…' : 'Ja, verstuurd →'}
                </button>
                {!everCopied && (
                  <p className="mt-1.5 text-center text-[10px] text-white/30">Tip: kopieer de tekst hierboven voor je verstuurt</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stap 3 */}
        <div className="relative rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-5 opacity-45">
          <span className="absolute right-4 top-4 text-[color:var(--dashboard-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <p className="mb-3 text-xs font-semibold text-[color:var(--dashboard-muted)]">Stap 3</p>
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">Volgen &amp; rapport</p>
          <p className="text-xs text-[color:var(--dashboard-muted)]">
            Respons monitoren · herinnering sturen · rapport via Loep.
          </p>
        </div>
      </div>
    </section>
  )
}

// Live link-preview tijdens het intypen: de naam is dan nog niet per se een
// geldige/unieke slug (leeg, dubbel met een andere rij) — de echte validatie
// (incl. duplicaatcheck) gebeurt server-side bij opslaan via
// saveSegmentDepartmentsAction. Deze functie geeft alleen een voorlopige
// link, gebaseerd op dezelfde slugify-regels als buildSegmentDepartments.
function buildSegmentSurveyLinksSafe(
  frontendBaseUrl: string,
  publicSurveyToken: string,
  label: string,
): { slug: string; url: string } | null {
  const slug = slugifyPreview(label)
  if (!slug) return null
  const [dep] = buildSegmentSurveyLinks(frontendBaseUrl, publicSurveyToken, [{ label, slug }])
  return dep ? { slug, url: dep.url } : null
}

function slugifyPreview(label: string): string {
  return label
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
