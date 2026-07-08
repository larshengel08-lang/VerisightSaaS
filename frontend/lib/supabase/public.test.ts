import { describe, expect, it, vi } from 'vitest'

const mockCreateClient = vi.fn(() => ({}))

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

describe('createPublicClient', () => {
  it('gebruikt pkce-flow, zodat de OTP-link ?code= teruggeeft i.p.v. een #access_token-hash die /auth/callback niet kan lezen (2026-07-08 regressie)', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    const { createPublicClient } = await import('./public')
    createPublicClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({
        auth: expect.objectContaining({ flowType: 'pkce' }),
      }),
    )
  })
})
