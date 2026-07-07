import { afterEach, describe, expect, it, vi } from 'vitest'

const { mockCreateUser, mockSignInWithOtp } = vi.hoisted(() => ({
  mockCreateUser: vi.fn(),
  mockSignInWithOtp: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: { admin: { createUser: mockCreateUser } },
  }),
}))

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => ({
    auth: { signInWithOtp: mockSignInWithOtp },
  }),
}))

import { sendActivationLink } from './invite-helpers'

const BASE_ARGS = {
  email: 'hr@julitestbv.nl',
  fullName: 'Julia Test',
  orgName: 'JulitestBv',
  origin: 'https://www.getloep.nl',
}

describe('sendActivationLink', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('maakt de auth-user vooraf bevestigd aan, zodat Supabase de gebrande Magic Link-mail gebruikt i.p.v. de nooit-gerebrande Confirm-signup-mail', async () => {
    mockCreateUser.mockResolvedValue({ data: {}, error: null })
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })

    await sendActivationLink(BASE_ARGS)

    expect(mockCreateUser).toHaveBeenCalledWith({
      email: BASE_ARGS.email,
      email_confirm: true,
      user_metadata: { full_name: BASE_ARGS.fullName, organization_name: BASE_ARGS.orgName },
    })
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1)
  })

  it('gaat idempotent door (geen throw) als de user al bestaat (email_exists) — dekt "opnieuw uitnodigen"', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'email_exists', message: 'already registered' } })
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })

    await expect(sendActivationLink(BASE_ARGS)).resolves.not.toThrow()
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1)
  })

  it('faalt hard bij een onverwachte createUser-fout en verstuurt dan geen OTP-mail (fail loud, geen halve uitnodiging)', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'unexpected_failure', message: 'kapot' } })

    await expect(sendActivationLink(BASE_ARGS)).rejects.toMatchObject({ code: 'unexpected_failure' })
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })
})
