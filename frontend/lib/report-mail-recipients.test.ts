import { describe, expect, it } from 'vitest'
import { buildReportMailRecipients, countCustomerRecipients } from '@/lib/report-mail-recipients'

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

describe('countCustomerRecipients (defect 2: operator-only send moet niet als succes ogen)', () => {
  it('telt alle adressen behalve het operator-adres', () => {
    expect(
      countCustomerRecipients(['hr@klant.nl', 'directie@klant.nl', 'hallo@getloep.nl'], 'hallo@getloep.nl'),
    ).toBe(2)
  })

  it('geeft 0 als alleen de operator overblijft (geen klantadres bekend)', () => {
    expect(countCustomerRecipients(['hallo@getloep.nl'], 'hallo@getloep.nl')).toBe(0)
  })

  it('normaliseert hoofdletters en spaties zoals buildReportMailRecipients dat al doet', () => {
    expect(countCustomerRecipients([' hr@klant.nl ', 'HALLO@GETLOEP.NL'], 'hallo@getloep.nl')).toBe(1)
  })

  it('geeft 0 op een lege ontvangerslijst', () => {
    expect(countCustomerRecipients([], 'hallo@getloep.nl')).toBe(0)
  })
})
