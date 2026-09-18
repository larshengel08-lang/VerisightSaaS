import { describe, expect, it } from 'vitest'
import { INVITE_LINK_NOTICE, inviteLinkNoticeFromSearch } from './invite-link-notice'

describe('inviteLinkNoticeFromSearch', () => {
  it('geeft de melding bij ?error=invite', () => {
    expect(inviteLinkNoticeFromSearch('?error=invite')).toBe(INVITE_LINK_NOTICE)
    expect(inviteLinkNoticeFromSearch('error=invite')).toBe(INVITE_LINK_NOTICE)
    expect(inviteLinkNoticeFromSearch('?foo=1&error=invite')).toBe(INVITE_LINK_NOTICE)
  })

  it('geeft niets zonder of met een andere fout', () => {
    expect(inviteLinkNoticeFromSearch('')).toBeNull()
    expect(inviteLinkNoticeFromSearch('?')).toBeNull()
    expect(inviteLinkNoticeFromSearch('?error=auth')).toBeNull()
    expect(inviteLinkNoticeFromSearch('?next=/dashboard')).toBeNull()
  })

  it('legt uit wat er is gebeurd en waar de klant verder kan, zonder streepjes', () => {
    expect(INVITE_LINK_NOTICE).toContain('De activatielink is verlopen of al gebruikt.')
    expect(INVITE_LINK_NOTICE).toContain('via de link Wachtwoord vergeten hieronder')
    expect(INVITE_LINK_NOTICE).toContain('hallo@getloep.nl')
    expect(INVITE_LINK_NOTICE).not.toMatch(/[—–]/)
  })
})
