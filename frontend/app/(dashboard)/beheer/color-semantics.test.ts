import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('admin color semantics', () => {
  it('keeps ops blue neutral and reserves amber/emerald for real status meaning', () => {
    const beheerSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const contactSource = readFileSync(new URL('./contact-aanvragen/page.tsx', import.meta.url), 'utf8')
    const learningsSource = readFileSync(new URL('./klantlearnings/page.tsx', import.meta.url), 'utf8')
    const primitivesSource = readFileSync(
      new URL('../../../components/dashboard/dashboard-primitives.tsx', import.meta.url),
      'utf8',
    )

    expect(primitivesSource).toContain('blue: "border-[#dfe6ea] bg-[#fbfcfd]"')
    expect(primitivesSource).toContain('blue: "text-[color:var(--text)]"')

    expect(beheerSource).toContain("tone: setupProgressCount === 4 ? 'emerald' : 'amber'")
    expect(beheerSource).toContain("tone={openFollowUpCount > 0 ? 'amber' : 'slate'}")
    expect(beheerSource).toContain("tone={step4Done ? 'emerald' : 'amber'}")
    expect(beheerSource).toContain('title="Learning default"')
    expect(beheerSource).toContain('tone="slate"')

    expect(contactSource).toContain("tone: Object.keys(linkedCampaignsByLead).length > 0 ? 'slate' : 'slate'")

    expect(learningsSource).toContain("surface=\"ops\"")
    expect(learningsSource).toContain("title=\"Ontbrekende configuratie\" body={configError} tone=\"amber\"")
    expect(learningsSource).toContain("title=\"Backendfout\" body={loadError} tone=\"amber\"")
  })
})
