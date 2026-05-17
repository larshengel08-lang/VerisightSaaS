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

    expect(beheerSource).toContain('title="Setuphub voor nieuwe klant en campaign"')
    expect(beheerSource).toContain('title="Kernwerkbanken"')
    expect(beheerSource).toContain('title="Operations & registries"')
    expect(beheerSource).toContain("tone={setupProgressCount === 4 ? 'emerald' : 'amber'}")
    expect(beheerSource).toContain("tone={billingReadyCount > 0 ? 'emerald' : 'amber'}")
    expect(beheerSource).toContain("tone={healthAttentionCount > 0 ? 'amber' : 'emerald'}")
    expect(beheerSource).toContain("tone={proofPublicCount > 0 ? 'emerald' : 'slate'}")
    expect(beheerSource).toContain('tone="slate"')
    expect(beheerSource).not.toContain('Open delivery- en activatiewerk')
    expect(beheerSource).not.toContain('Billing default')
    expect(beheerSource).not.toContain('Health review default')
    expect(beheerSource).not.toContain('Proof ladder default')

    expect(contactSource).toContain("tone: Object.keys(linkedCampaignsByLead).length > 0 ? 'slate' : 'slate'")

    expect(learningsSource).toContain("surface=\"ops\"")
    expect(learningsSource).toContain("title=\"Ontbrekende configuratie\" body={configError} tone=\"amber\"")
    expect(learningsSource).toContain("title=\"Backendfout\" body={loadError} tone=\"amber\"")
  })
})
