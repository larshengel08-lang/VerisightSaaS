import { describe, expect, it, vi } from 'vitest'

const mockCreateClient = vi.fn(() => ({}))

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

describe('createPublicClient', () => {
  it('gebruikt implicit-flow, niet pkce: deze client draait server-side zonder browseropslag voor een code_verifier, en de ontvanger van de activatiemail zit sowieso in een andere browser dan de afzender (2026-07-08, gecorrigeerd na een live test die op /login?error=auth vastliep)', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    const { createPublicClient } = await import('./public')
    createPublicClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({
        auth: expect.objectContaining({ flowType: 'implicit' }),
      }),
    )
  })
})
