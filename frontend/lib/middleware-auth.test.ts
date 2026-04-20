import { describe, expect, it } from 'vitest'
import { resolveMiddlewareAuthMode } from '@/lib/middleware-auth'

describe('middleware auth mode', () => {
  it('bypasses supabase on public routes when env is missing', () => {
    expect(
      resolveMiddlewareAuthMode({
        pathname: '/action-center-preview',
        hasSupabaseEnv: false,
      }),
    ).toBe('public_without_auth')
  })

  it('keeps protected routes behind supabase even when env is missing', () => {
    expect(
      resolveMiddlewareAuthMode({
        pathname: '/dashboard',
        hasSupabaseEnv: false,
      }),
    ).toBe('requires_supabase')
  })
})
