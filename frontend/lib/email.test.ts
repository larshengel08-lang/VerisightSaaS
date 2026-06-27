import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
    },
  })),
}))

describe('sendLoepEmail', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.LOEP_FROM_EMAIL = 'hallo@getloep.nl'
    vi.resetModules()
  })

  it('verstuurt een e-mail zonder error te gooien', async () => {
    const { sendLoepEmail } = await import('./email')
    await expect(sendLoepEmail({
      to: 'hr@klant.nl',
      subject: 'Test',
      html: '<p>Test</p>',
    })).resolves.toBeUndefined()
  })

  it('logt warning en resolvet als RESEND_API_KEY ontbreekt', async () => {
    delete process.env.RESEND_API_KEY
    const { sendLoepEmail } = await import('./email')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(sendLoepEmail({ to: 'hr@klant.nl', subject: 'Test', html: '<p>Test</p>' })).resolves.toBeUndefined()
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
