import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./setup-wizard-card.tsx', import.meta.url), 'utf8')

describe('setup-wizard afdelingsblok', () => {
  it('toont in segment-modus een blok per afdeling met naam, aantal en kopieerlink', () => {
    expect(src).toContain('saveSegmentDepartmentsAction')
    expect(src).toContain('buildSegmentSurveyLinks')
  })
  it('vergrendelt de naam van afdelingen met responses', () => {
    expect(src).toContain('lockedDepartments')
    expect(src).toMatch(/naam vergrendeld|al responses/i)
  })
  it('toont het automatisch opgetelde totaal', () => {
    expect(src).toMatch(/Totaal deelnemers|totalInvited/)
  })
  it('managet de n>=5-verwachting expliciet (via de gedeelde constante)', () => {
    expect(src).toMatch(/minimaal \$\{MIN_INVITED_PER_DEPARTMENT\}|minimaal 5/)
  })
  it('vraagt het enkelvoudige aantal niet meer in segment-modus', () => {
    expect(src).toMatch(/hasSegments|segmentMode/)
  })
  it('werkt de afdelingslinks in stap 2 bij na opnieuw opslaan van stap 1', () => {
    // De uitnodiging werd eenmalig uit de props opgebouwd; na "Terug naar stap 1"
    // en een hernoemde afdeling bleef stap 2 dode links tonen.
    expect(src).toContain('refreshInviteDraft')
    expect(src).toMatch(/buildSegmentSurveyLinks\(frontendBaseUrl, publicSurveyToken, segResult\.departments\)/)
    expect(src).toContain('replacedEdits')
    // De melding alleen aanzetten vanuit het opslaan: een latere save zonder
    // gewijzigde links mag hem niet wissen voordat de klant stap 2 ziet.
    expect(src).toContain('if (refreshed.replacedEdits) setInviteLinksReplacedEdits(true)')
    expect(src).not.toContain('setInviteLinksReplacedEdits(refreshed.replacedEdits)')
    // Uit zodra de klant de tekst zelf bewerkt of kopieert.
    expect(src).toMatch(/onChange=\{\(e\) => \{ setEditableSubject\(e\.target\.value\); setInviteLinksReplacedEdits\(false\) \}\}/)
    expect(src).toMatch(/onChange=\{\(e\) => \{ setEditableBody\(e\.target\.value\); setInviteLinksReplacedEdits\(false\) \}\}/)
    expect(src).toMatch(/async function handleCopy\(text: string, which: 'subject' \| 'body'\) \{\s+setInviteLinksReplacedEdits\(false\)/)
    expect(src).toContain('De uitnodiging is opnieuw opgebouwd met wat je in stap 1 hebt opgeslagen (sluitdatum of afdelingslinks).')
  })
  it('gebruikt de gedeelde uitnodigingstekst in plaats van een eigen kopie', () => {
    expect(src).toContain('buildInviteTemplate')
    expect(src).not.toContain('function buildInviteBody')
    expect(src).not.toContain('const SCAN_WHY')
    expect(src).not.toContain('10-15 minuten')
  })
})

describe('setup-wizard kopieerknoppen: Fail Loud bij geweigerd klembord', () => {
  it('markeert onderwerp/bericht pas als gekopieerd nadat writeText slaagt, en toont een melding als het klembord weigert', () => {
    // handleCopy: geen "Gekopieerd" meer voor een writeText die nooit resolvet.
    expect(src).toMatch(/async function handleCopy\(text: string, which: 'subject' \| 'body'\) \{[\s\S]*?await navigator\.clipboard\.writeText\(text\)/)
    expect(src).toMatch(/catch \{[\s\S]*?setCopyErrorField\(which\)/)
    expect(src).not.toContain('catch { /* clipboard unavailable */ }')
    expect(src).toContain("Kopiëren lukte niet. Selecteer de tekst en kopieer met Ctrl+C.")
  })

  it('geeft elk veld een eigen role="alert"-melding bij een mislukte kopie', () => {
    expect(src).toMatch(/copyErrorField === 'subject' &&[\s\S]*?role="alert"/)
    expect(src).toMatch(/copyErrorField === 'body' &&[\s\S]*?role="alert"/)
  })

  it('telt een handmatige Ctrl+C met het hele veld geselecteerd ook als kopiëren', () => {
    expect(src).toContain('function handleManualCopy')
    expect(src).toMatch(/selectionStart === 0 && selectionEnd === value\.length/)
    expect(src).toContain("onCopy={() => handleManualCopy('subject')}")
    expect(src).toContain("onCopy={() => handleManualCopy('body')}")
    // Een geslaagde handmatige kopie telt mee voor de "nog niets gekopieerd"-melding.
    expect(src).toMatch(/function handleManualCopy\([\s\S]*?setEverCopied\(true\)/)
  })

  it('selecteert het veld zelf als writeText faalt, zodat Ctrl+C meteen kan', () => {
    expect(src).toMatch(/inviteSubjectRef : inviteBodyRef\)\.current\?\.select\(\)/)
  })

  it('past hetzelfde Fail Loud-patroon toe op de afdelingslink-kopieerknop', () => {
    expect(src).toContain('function handleManualDeptCopy')
    expect(src).toContain('deptCopyError')
    expect(src).not.toContain("catch { /* clipboard unavailable */ }")
    expect(src).toMatch(/handleCopyDeptLink[\s\S]*?catch \{[\s\S]*?setDeptCopyError\(slug\)/)
    expect(src).toContain('selectElementText')
  })

  it('wist een oude edits-vervangen-melding nog steeds bij het kopiëren van onderwerp of bericht', () => {
    // Regressie: de Fail Loud-fix mag de bestaande "edits replaced"-melding
    // niet laten hangen zodra de klant opnieuw kopieert.
    expect(src).toMatch(/async function handleCopy\(text: string, which: 'subject' \| 'body'\) \{\s+setInviteLinksReplacedEdits\(false\)/)
  })
})

describe('setup-wizard stap 1: planning en drempels (spec 2026-09-16 par. 4.1 en 5.2)', () => {
  it('heeft een sluitdatum- en herinneringsveld en valideert via de gedeelde planningsregels', () => {
    expect(src).toContain('validateSchedule')
    expect(src).toContain('defaultClosesAt')
    expect(src).toContain('REMINDER_CHOICES')
    expect(src).toContain('Sluitdatum')
    expect(src).toContain('Herinnering')
  })

  it('geeft de toelichtingen uit de spec, met de sluitdatum-toelichting die sinds het amendement weer waar is', () => {
    expect(src).toContain('De dag waarop je de uitnodiging verstuurt.')
    // Amendement par. 4.3a (18-9): de backend dwingt de sluitdatum nu af, dus de belofte mag terug.
    expect(src).toContain('Na deze datum kan niemand meer invullen. Drie weken is gebruikelijk; sluiten of verlengen (twee weken per keer) doe je hier in Loep.')
    expect(src).not.toContain('Op deze datum vraagt Loep je de meting te sluiten of te verlengen')
    expect(src).toContain('Op die dag zet Loep de herinneringstekst voor je klaar; jij verstuurt hem vanuit je eigen mail.')
    expect(src).toContain('inclusief parttimers en oproepkrachten')
    expect(src).toContain('niet het hele personeelsbestand')
    expect(src).toContain('Alle nieuwe medewerkers die je in deze ronde uitnodigt.')
  })

  it('zet de sluitdatum in de uitnodiging en ververst de tekst na het opslaan van stap 1, in beide modi', () => {
    // Drie opbouwplekken (eerste render, segment-tak, niet-segment-tak) krijgen allemaal de sluitdatum mee.
    // Gescopet op buildInviteTemplate-aanroepen: een kale telling van
    // "closesAt: closesAt || null" in het hele bestand raakt ook de
    // (bestaande, ongerelateerde) previewTimeline-opbouw voor stap 3, die
    // dezelfde variabele voor een ander doel meegeeft.
    const inviteTemplateCalls = src.split('buildInviteTemplate(').slice(1)
    expect(inviteTemplateCalls.length).toBe(3)
    expect(inviteTemplateCalls.every((chunk) => /closesAt: closesAt \|\| null/.test(chunk.slice(0, 400)))).toBe(true)
    // Beide takken verversen de conceptmail; vóór dit plan deed alleen de segment-tak dat,
    // waardoor een in stap 1 gekozen sluitdatum niet in de tekst van stap 2 belandde.
    expect(src.match(/refreshInviteDraft\(/g)?.length).toBe(2)
  })

  it('dwingt de drempels client-side af met dezelfde helpers als de server', () => {
    expect(src).toContain('validateInvitedTotal')
    expect(src).toContain('validateDepartmentInvitedCount')
    expect(src).not.toContain('minimaal 1)')
  })

  it('laat het formulier de Nederlandse melding geven in plaats van de browsermelding', () => {
    expect(src).toContain('noValidate')
    expect(src).toContain('min={today}')
  })

  it('heeft geen "Link getest"-checkbox meer', () => {
    expect(src).not.toContain('Link getest')
    expect(src).not.toContain('linkTested')
  })

  it('opent altijd op stap 1 zodat de klant tot de lancering kan corrigeren', () => {
    expect(src).toContain('useState<WizardStep>(1)')
  })

  it('bevat geen em- of en-dashes in de UI-copy', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})

describe('setup-wizard stap 2: terug en bevestigen (spec 2026-09-16 par. 5.2)', () => {
  it('biedt in stap 2 een weg terug naar stap 1', () => {
    expect(src).toContain('Terug naar stap 1')
    expect(src).toContain('setStep(1)')
  })

  it('deactiveert de terugknop zolang een lancering in behandeling is', () => {
    expect(src).toMatch(/onClick=\{backToStep1\}[\s\S]*?disabled=\{isPending\}[\s\S]*?Terug naar stap 1/)
  })

  it('vraagt bevestiging in een eigen dialoog voordat de meting als gestart telt', () => {
    expect(src).toContain('ConfirmDialog')
    expect(src).toContain('Heb je de uitnodiging naar je medewerkers gestuurd? Daarna telt de meting als gestart en kun je stap 1 niet meer wijzigen.')
    expect(src).toContain("'Ja, verstuurd'")
    expect(src).toContain("'Nog niet'")
    expect(src).not.toMatch(/(?<![A-Za-z_])confirm\(/)
  })

  it('zegt in de dialoog dat er nog niets gekopieerd is als dat zo is', () => {
    expect(src).toContain('Je hebt nog niets gekopieerd.')
    expect(src).toContain('!everCopied')
  })
})

describe('setup-wizard stap 3 (spec 2026-09-16 par. 4.2)', () => {
  it('toont de tijdlijn als vooruitblik en belooft geen rapport via Loep', () => {
    expect(src).toContain('Volgen en afronden')
    expect(src).toContain('previewTimeline')
    expect(src).toContain('<CampaignTimeline timeline={previewTimeline} dimmed />')
    expect(src).not.toContain('rapport via Loep')
  })
})

describe('setup-wizard responsive en invoervelden (spec 2026-09-16 par. 7, walkthrough 8.1 en 3.12)', () => {
  it('zet de drie stappen onder elkaar onder lg en naast elkaar vanaf lg', () => {
    expect(src).toContain('grid grid-cols-1 gap-3 lg:grid-cols-3')
    expect(src).not.toContain('grid grid-cols-3 gap-3')
  })

  it('houdt het onderwerp een eenregelig invoerveld dat niet afkapt', () => {
    expect(src).toMatch(/<input\s+id="invite-subject"/)
    expect(src).not.toMatch(/<textarea\s+id="invite-subject"/)
  })
})
