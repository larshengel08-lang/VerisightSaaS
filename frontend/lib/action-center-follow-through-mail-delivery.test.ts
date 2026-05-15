import { describe, expect, it, vi } from 'vitest'
import { deliverActionCenterFollowThroughMail } from './action-center-follow-through-mail-delivery'

describe('action center follow-through mail delivery', () => {
  it('posts a bounded Resend payload and returns the provider id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 're_123' }),
    })

    const result = await deliverActionCenterFollowThroughMail(
      {
        recipientEmail: 'manager@example.com',
        subject: 'Reviewmoment ExitScan Q2 / Sales',
        emailText: 'Open Action Center',
        emailHtml: '<p>Open Action Center</p>',
      },
      {
        fetchImpl: fetchMock,
        resendApiKey: 're_test',
        emailFrom: 'Verisight <noreply@verisight.nl>',
      },
    )

    expect(result).toEqual({
      ok: true,
      providerMessageId: 're_123',
    })
  })
})
