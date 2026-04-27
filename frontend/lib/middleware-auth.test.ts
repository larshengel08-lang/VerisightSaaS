import { afterEach, describe, expect, it, vi } from 'vitest'
import { shouldBypassSupabaseForRequest } from '@/lib/middleware-auth'

describe('middleware auth gating', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('bypasses supabase on public routes when env is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    expect(shouldBypassSupabaseForRequest('/')).toBe(true)
    expect(shouldBypassSupabaseForRequest('/producten')).toBe(true)
    expect(shouldBypassSupabaseForRequest('/kennismaking')).toBe(true)
    expect(shouldBypassSupabaseForRequest('/api/contact')).toBe(true)
  })

  it('keeps protected routes guarded when env is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    expect(shouldBypassSupabaseForRequest('/dashboard')).toBe(false)
  })

  it('does not bypass supabase when env is present', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')

    expect(shouldBypassSupabaseForRequest('/')).toBe(false)
  })
})
