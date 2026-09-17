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
    expect(src).toContain('De uitnodiging is bijgewerkt met de nieuwe afdelingslinks.')
  })
  it('gebruikt de gedeelde uitnodigingstekst in plaats van een eigen kopie', () => {
    expect(src).toContain('buildInviteTemplate')
    expect(src).not.toContain('function buildInviteBody')
    expect(src).not.toContain('const SCAN_WHY')
    expect(src).not.toContain('10-15 minuten')
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

  it('geeft de toelichtingen uit de spec', () => {
    expect(src).toContain('De dag waarop je de uitnodiging verstuurt.')
    expect(src).toContain('Op deze datum vraagt Loep je de meting te sluiten of te verlengen. Drie weken is gebruikelijk; verlengen kan met twee weken per keer.')
    // Niets dwingt closes_at af (alleen is_active telt): beloof niet dat invullen dan stopt.
    expect(src).not.toContain('Na deze datum kan niemand meer invullen')
    expect(src).toContain('Op die dag zet Loep de herinneringstekst voor je klaar; jij verstuurt hem vanuit je eigen mail.')
    expect(src).toContain('inclusief parttimers en oproepkrachten')
    expect(src).toContain('niet het hele personeelsbestand')
    expect(src).toContain('Alle nieuwe medewerkers die je in deze ronde uitnodigt.')
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
