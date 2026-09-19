import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('campagnedetail: verlengingen tellen (spec 2026-09-16 par. 4.3)', () => {
  it('telt de verlengingen uit de auditevents binnen de eigen organisatie', () => {
    expect(source).toContain("contains('metadata', { extension: true })")
    expect(source).toContain("eq('organization_id', stats.organization_id)")
    expect(source).toContain('extensionCount: extensionCount ?? 0')
  })

  it('faalt luid als de telling niet lukt, in plaats van 0 verlengingen aan te nemen', () => {
    expect(source).toContain('{ count: extensionCount, error: extensionCountError }')
    expect(source).toContain('if (extensionCountError)')
    expect(source).toContain('throw new Error(`Kon het aantal verlengingen niet laden: ${extensionCountError.message}`)')
  })
})

describe('campagnedetail: Fail Loud op delivery record en herinneringsevents', () => {
  it('leest de fout van beide queries uit en gooit een duidelijke Error', () => {
    expect(source).toContain('{ data: deliveryRecord, error: deliveryRecordError }')
    expect(source).toContain('{ data: reminderEvents, error: reminderEventsError }')
    expect(source).toContain('if (deliveryRecordError)')
    expect(source).toContain('throw new Error(`Kon de lanceergegevens van de meting niet laden: ${deliveryRecordError.message}`)')
    expect(source).toContain('if (reminderEventsError)')
    expect(source).toContain('throw new Error(`Kon de herinneringsstatus van de meting niet laden: ${reminderEventsError.message}`)')
  })

  it('een ontbrekend delivery record (geen fout, data null) blijft legitiem: maybeSingle, geen throw op !deliveryRecord', () => {
    const deliveryQuery = source.slice(source.indexOf(".from('campaign_delivery_records')"), source.indexOf(".from('campaign_action_audit_events')"))
    expect(deliveryQuery).toContain('.maybeSingle()')
    expect(source).not.toMatch(/if \(!deliveryRecord\)/)
  })
})

describe('campagnedetail: Fail Loud op campagnegegevens en organisatienaam', () => {
  it('gooit bij een mislukte campaigns-query, want die levert sluitdatum en gesloten-status', () => {
    expect(source).toContain('{ data: campaignMeta, error: campaignMetaError }')
    expect(source).toContain('if (campaignMetaError)')
    expect(source).toContain('throw new Error(`Kon de gegevens van de meting niet laden: ${campaignMetaError.message}`)')
  })

  it('gooit bij een mislukte organisatie-query; een ontbrekende naam zonder fout blijft zichtbaar gedegradeerd', () => {
    expect(source).toContain('{ data: orgData, error: orgDataError }')
    expect(source).toContain('if (orgDataError)')
    expect(source).toContain('throw new Error(`Kon de organisatienaam niet laden: ${orgDataError.message}`)')
    expect(source).not.toMatch(/if \(!orgData\)|if \(!campaignMeta\)/)
  })
})
