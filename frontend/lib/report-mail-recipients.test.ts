import { describe, expect, it } from 'vitest'
import { buildReportMailRecipients } from '@/lib/report-mail-recipients'

describe('buildReportMailRecipients (spec 2026-09-11 par. 5)', () => {
  it('bundelt eigenaren, het organisatieadres en de operator', () => {
    expect(
      buildReportMailRecipients({
        ownerInviteEmails: ['hr@klant.nl'],
        organizationContactEmail: 'directie@klant.nl',
        operatorEmail: 'hallo@getloep.nl',
      }),
    ).toEqual(['hr@klant.nl', 'directie@klant.nl', 'hallo@getloep.nl'])
  })

  it('ontdubbelt op kleine letters', () => {
    expect(
      buildReportMailRecipients({
        ownerInviteEmails: ['HR@Klant.nl', ' hr@klant.nl '],
        organizationContactEmail: 'hr@klant.nl',
        operatorEmail: 'hallo@getloep.nl',
      }),
    ).toEqual(['hr@klant.nl', 'hallo@getloep.nl'])
  })

  it('negeert lege en onvolledige adressen', () => {
    expect(
      buildReportMailRecipients({
        ownerInviteEmails: [null, undefined, '', '  ', 'geen-adres'],
        organizationContactEmail: null,
        operatorEmail: 'hallo@getloep.nl',
      }),
    ).toEqual(['hallo@getloep.nl'])
  })
})
