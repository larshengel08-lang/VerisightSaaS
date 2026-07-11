import { afterEach, describe, expect, it, vi } from 'vitest'

const { mockCreateUser, mockListUsers, mockUpdateUserById, mockSignInWithOtp } = vi.hoisted(() => ({
  mockCreateUser: vi.fn(),
  mockListUsers: vi.fn(),
  mockUpdateUserById: vi.fn(),
  mockSignInWithOtp: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        createUser: mockCreateUser,
        listUsers: mockListUsers,
        updateUserById: mockUpdateUserById,
      },
    },
  }),
}))

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => ({
    auth: { signInWithOtp: mockSignInWithOtp },
  }),
}))

import { resolveInviteRole, sendActivationLink } from './invite-helpers'

describe('resolveInviteRole', () => {
  it('geeft owner terug voor owner (2026-07-09 regressie: viel eerder stilzwijgend terug op viewer)', () => {
    expect(resolveInviteRole('owner')).toBe('owner')
  })

  it('geeft member terug voor member', () => {
    expect(resolveInviteRole('member')).toBe('member')
  })

  it('valt terug op viewer voor viewer of ontbrekende waarde', () => {
    expect(resolveInviteRole('viewer')).toBe('viewer')
    expect(resolveInviteRole(undefined)).toBe('viewer')
  })
})

const BASE_ARGS = {
  email: 'hr@julitestbv.nl',
  fullName: 'Julia Test',
  orgName: 'JulitestBv',
  origin: 'https://www.getloep.nl',
}

const EXISTING_UNCONFIRMED_USER = {
  id: 'user-123',
  email: 'hr@julitestbv.nl',
  email_confirmed_at: null,
  user_metadata: { some_old_field: 'x' },
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
    expect(mockListUsers).not.toHaveBeenCalled() // brand-new user: geen lookup nodig
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1)
  })

  it('bevestigt een bestaande maar nog onbevestigde user (bijv. van vóór deze fix) alsnog, i.p.v. die zonder confirm te laten staan', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'email_exists', message: 'already registered' } })
    mockListUsers.mockResolvedValue({ data: { users: [EXISTING_UNCONFIRMED_USER] }, error: null })
    mockUpdateUserById.mockResolvedValue({ data: {}, error: null })
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })

    await sendActivationLink(BASE_ARGS)

    expect(mockUpdateUserById).toHaveBeenCalledWith('user-123', {
      email_confirm: true,
      user_metadata: {
        some_old_field: 'x',
        full_name: BASE_ARGS.fullName,
        organization_name: BASE_ARGS.orgName,
      },
    })
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1)
  })

  it('slaat updateUserById over als de bestaande user al bevestigd is (resend-pad, geen onnodige call)', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'email_exists', message: 'already registered' } })
    mockListUsers.mockResolvedValue({
      data: { users: [{ ...EXISTING_UNCONFIRMED_USER, email_confirmed_at: '2026-07-07T10:00:00Z' }] },
      error: null,
    })
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })

    await sendActivationLink(BASE_ARGS)

    expect(mockUpdateUserById).not.toHaveBeenCalled()
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1)
  })

  it('zoekt de juiste pagina op als de user niet op pagina 1 staat, hoofdletterongevoelig op e-mail', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'email_exists', message: 'already registered' } })
    mockListUsers
      .mockResolvedValueOnce({
        data: { users: Array.from({ length: 200 }, (_, i) => ({ id: `other-${i}`, email: `x${i}@voorbeeld.nl` })) },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { users: [{ ...EXISTING_UNCONFIRMED_USER, email: 'HR@JulitestBv.nl' }] },
        error: null,
      })
    mockUpdateUserById.mockResolvedValue({ data: {}, error: null })
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })

    await sendActivationLink(BASE_ARGS)

    expect(mockListUsers).toHaveBeenCalledTimes(2)
    expect(mockUpdateUserById).toHaveBeenCalledWith('user-123', expect.anything())
  })

  it('gaat door zonder te falen als de user door een race condition niet meer te vinden is', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'email_exists', message: 'already registered' } })
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null })
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })

    await expect(sendActivationLink(BASE_ARGS)).resolves.not.toThrow()
    expect(mockUpdateUserById).not.toHaveBeenCalled()
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1)
  })

  it('faalt hard als updateUserById mislukt (fail loud, geen halve uitnodiging)', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'email_exists', message: 'already registered' } })
    mockListUsers.mockResolvedValue({ data: { users: [EXISTING_UNCONFIRMED_USER] }, error: null })
    mockUpdateUserById.mockResolvedValue({ data: null, error: { message: 'kapot' } })

    await expect(sendActivationLink(BASE_ARGS)).rejects.toMatchObject({ message: 'kapot' })
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })

  it('faalt hard bij een onverwachte createUser-fout en verstuurt dan geen OTP-mail (fail loud, geen halve uitnodiging)', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { code: 'unexpected_failure', message: 'kapot' } })

    await expect(sendActivationLink(BASE_ARGS)).rejects.toMatchObject({ code: 'unexpected_failure' })
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })
})
