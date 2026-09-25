import { beforeEach, describe, expect, it, vi } from 'vitest'

let user: { id: string } | null = { id: 'user-1' }
let orgMemberRole: string | null = 'owner'
let isAdmin = false
let isActive = false
let campaignError: { message: string } | null = null
let totalCompleted = 18
let statsError: { message: string } | null = null
let upsertRows = 1
let upsertError: { message: string } | null = null
let upserts: Array<{ payload: Record<string, unknown>; options: unknown }> = []
let purgedAt: string | null = null
let purgedError: { code?: string; message: string } | null = null

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user } }) },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: (columns: string) => ({
            eq: () => ({
              single: async () => ({ data: { organization_id: 'org-1' } }),
              maybeSingle: async () => {
                // Deel C: loadDataPurgedAt vraagt alleen deze kolom op.
                if (columns === 'data_purged_at') {
                  return purgedError ? { data: null, error: purgedError } : { data: { data_purged_at: purgedAt }, error: null }
                }
                return campaignError ? { data: null, error: campaignError } : { data: { is_active: isActive }, error: null }
              },
            }),
          }),
        }
      }
      if (table === 'profiles') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_verisight_admin: isAdmin } }) }) }) }
      }
      if (table === 'org_members') {
        return {
          select: () => ({
            eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: orgMemberRole ? { role: orgMemberRole } : null }) }) }),
          }),
        }
      }
      if (table === 'campaign_stats') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () =>
                statsError
                  ? { data: null, error: statsError }
                  : { data: { total_completed: totalCompleted, scan_type: 'retention' }, error: null },
            }),
          }),
        }
      }
      if (table === 'campaign_decisions') {
        return {
          upsert: (payload: Record<string, unknown>, options: unknown) => ({
            select: async () => {
              upserts.push({ payload, options })
              if (upsertError) return { data: null, error: upsertError }
              return { data: Array.from({ length: upsertRows }, () => ({ campaign_id: 'campaign-1' })), error: null }
            },
          }),
        }
      }
      throw new Error(`onverwachte tabel in de test: ${table}`)
    },
  }),
}))

import { saveCampaignDecisionAction } from './decision-actions'

const besluit = {
  decidedAt: '2026-04-02',
  primaryTopic: 'Groeiperspectief',
  primaryAction: 'Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.',
  owner: 'Sanne de Vries',
  followUpDate: '2026-06-15',
}

beforeEach(() => {
  user = { id: 'user-1' }
  orgMemberRole = 'owner'
  isAdmin = false
  isActive = false
  campaignError = null
  totalCompleted = 18
  statsError = null
  upsertRows = 1
  upsertError = null
  upserts = []
  purgedAt = null
  purgedError = null
})

describe('saveCampaignDecisionAction (plan 3b)', () => {
  it('slaat het besluit op als upsert op campaign_id, met recorded_by', async () => {
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result).toEqual({ ok: true })
    expect(upserts).toHaveLength(1)
    expect(upserts[0].options).toEqual({ onConflict: 'campaign_id' })
    expect(upserts[0].payload).toMatchObject({
      campaign_id: 'campaign-1',
      organization_id: 'org-1',
      recorded_by: 'user-1',
      primary_topic: 'Groeiperspectief',
      owner: 'Sanne de Vries',
      follow_up_date: '2026-06-15',
    })
    expect(upserts[0].payload).not.toHaveProperty('updated_at')
  })

  it('laat de operator schrijven, ook zonder lidmaatschap', async () => {
    isAdmin = true
    orgMemberRole = null
    expect(await saveCampaignDecisionAction('campaign-1', besluit)).toEqual({ ok: true })
  })

  it.each(['member', 'viewer', null])('weigert een meelezer (%s) en schrijft niets', async (role) => {
    orgMemberRole = role
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Alleen de eigenaar van deze Loep-omgeving kan het besluit vastleggen.')
    expect(upserts).toHaveLength(0)
  })

  it('weigert zonder login', async () => {
    user = null
    expect(await saveCampaignDecisionAction('campaign-1', besluit)).toEqual({ ok: false, error: 'Niet ingelogd.' })
  })

  it('geeft de validatiemelding terug en schrijft niets', async () => {
    const result = await saveCampaignDecisionAction('campaign-1', { ...besluit, owner: ' ' })
    expect(result).toEqual({ ok: false, error: 'Vul in wie eigenaar is van dit besluit.' })
    expect(upserts).toHaveLength(0)
  })

  it('weigert na de opschoning met de reden in plaats van "nog niet klaar", en schrijft niets', async () => {
    purgedAt = '2028-06-16T03:00:00Z'
    // Ook met een formulier dat anders niet door de validatie komt: de reden gaat vóór.
    const result = await saveCampaignDecisionAction('campaign-1', { ...besluit, owner: ' ' })
    expect(result).toEqual({
      ok: false,
      error:
        'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een besluit vastleggen kan daarom niet meer.',
    })
    expect(upserts).toHaveLength(0)
  })

  it('slaat gewoon op als de kolom data_purged_at nog niet bestaat (migratie niet gedraaid)', async () => {
    purgedError = { code: '42703', message: 'column campaigns.data_purged_at does not exist' }
    expect(await saveCampaignDecisionAction('campaign-1', besluit)).toEqual({ ok: true })
  })

  it('faalt luid als niet na te gaan is of de gegevens nog bestaan', async () => {
    purgedError = { code: '500', message: 'kapot' }
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Kon niet nagaan of de gegevens van deze meting nog bestaan: kapot')
    expect(upserts).toHaveLength(0)
  })

  it('weigert op een lopende meting', async () => {
    isActive = true
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.error).toBe('Een besluit vastleggen kan pas als de meting gesloten is en het rapport klaarstaat.')
    expect(upserts).toHaveLength(0)
  })

  it('weigert onder de rapportdrempel', async () => {
    totalCompleted = 9
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.error).toBe('Een besluit vastleggen kan pas als de meting gesloten is en het rapport klaarstaat.')
  })

  it('Fail Loud: een mislukte campagnequery is geen "meting staat open"', async () => {
    campaignError = { message: 'timeout' }
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result).toEqual({ ok: false, error: 'Opslaan mislukt: timeout.' })
    expect(upserts).toHaveLength(0)
  })

  it('Fail Loud: een mislukte statusquery is geen "onder de drempel"', async () => {
    statsError = { message: 'timeout' }
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.error).toBe('Opslaan mislukt: Loep kon niet vaststellen of het rapport klaarstaat (timeout).')
    expect(upserts).toHaveLength(0)
  })

  it('Fail Loud: een databasefout komt als melding terug', async () => {
    upsertError = { message: 'relation "campaign_decisions" does not exist' }
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result).toEqual({
      ok: false,
      error: 'Opslaan mislukt: relation "campaign_decisions" does not exist',
    })
  })

  it('Fail Loud: nul geraakte rijen is geen stil succes', async () => {
    upsertRows = 0
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result).toEqual({ ok: false, error: 'Opslaan mislukt: het besluit is niet opgeslagen (geen rechten op deze meting).' })
  })
})

/**
 * Reviewpunt uit taak 10: `validateDecisionInput` gaat ervan uit dat zijn
 * invoer al door `normalizeDecisionInput` is gegaan. Die preconditie stond
 * alleen in de JSDoc. Deze tests leggen de volgorde vast op gedrag: draait
 * iemand normaliseren en valideren om, dan valt minstens een van deze tests om.
 */
describe('saveCampaignDecisionAction normaliseert vóór het valideert', () => {
  it.each([
    ['primaryTopic', 'Vul in over welk onderwerp het besluit gaat.'],
    ['primaryAction', 'Vul in wat jullie precies gaan doen. Een onderwerp is nog geen afspraak.'],
    ['owner', 'Vul in wie eigenaar is van dit besluit.'],
  ])('weigert %s als er alleen witruimte staat, en schrijft niets', async (field, melding) => {
    const result = await saveCampaignDecisionAction('campaign-1', { ...besluit, [field]: '   \t  ' })
    expect(result).toEqual({ ok: false, error: melding })
    expect(upserts).toHaveLength(0)
  })

  it('weigert niet onterecht als een optioneel veld alleen witruimte bevat', async () => {
    // Ongenormaliseerd zou '  ' als ingevulde tweede actie tellen en de melding
    // "Vul bij het tweede punt ook het onderwerp in." opleveren.
    const result = await saveCampaignDecisionAction('campaign-1', {
      ...besluit,
      secondaryTopic: '',
      secondaryAction: '   ',
    })
    expect(result).toEqual({ ok: true })
    expect(upserts[0].payload.secondary_action).toBe('')
  })

  it('weigert een tekst niet die alleen mét zijn witruimte te lang is', async () => {
    // Ongenormaliseerd zou dit de lengtegrens van 120 tekens overschrijden.
    const result = await saveCampaignDecisionAction('campaign-1', {
      ...besluit,
      primaryTopic: `   ${'a'.repeat(120)}   `,
    })
    expect(result).toEqual({ ok: true })
    expect(upserts[0].payload.primary_topic).toBe('a'.repeat(120))
  })

  it('slaat de getrimde waarden op, niet de ruwe formulierinvoer', async () => {
    await saveCampaignDecisionAction('campaign-1', {
      ...besluit,
      owner: '  Sanne de Vries  ',
      primaryTopic: '  Groeiperspectief\n',
    })
    expect(upserts[0].payload).toMatchObject({
      owner: 'Sanne de Vries',
      primary_topic: 'Groeiperspectief',
    })
  })
})

describe('saveCampaignDecisionAction haalt de ids van de server, niet uit het formulier', () => {
  it('negeert ids die in de formulierinvoer zijn meegestuurd', async () => {
    await saveCampaignDecisionAction('campaign-1', {
      ...besluit,
      campaign_id: 'andere-campagne',
      organization_id: 'andere-org',
      recorded_by: 'andere-gebruiker',
      campaignId: 'andere-campagne',
      organizationId: 'andere-org',
      updated_at: '2020-01-01T00:00:00Z',
    })
    expect(upserts).toHaveLength(1)
    expect(upserts[0].payload).toMatchObject({
      campaign_id: 'campaign-1',
      organization_id: 'org-1',
      recorded_by: 'user-1',
    })
    expect(upserts[0].payload).not.toHaveProperty('updated_at')
  })
})
