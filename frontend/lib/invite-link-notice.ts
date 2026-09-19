import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

// /complete-account stuurt naar /login?error=invite als de activatielink niet
// meer geldig is (mislukte verifyOtp of geen sessie binnen de wachttijd).
// Zonder uitleg landde de klant stil op een kale inlogpagina (walkthrough 0).
// Pure functie zodat hij zonder browseromgeving te testen is, net als
// lib/auth-link-error.ts (dat de hash-variant van Supabase zelf afhandelt).

export const INVITE_LINK_NOTICE = `De activatielink is verlopen of al gebruikt. Vraag via de link Wachtwoord vergeten hieronder een nieuwe link aan, of mail ${LOEP_CONTACT_EMAIL}.`

/**
 * @param search de volledige `window.location.search`, met of zonder `?`
 * @returns de melding als de URL `error=invite` bevat, anders null
 */
export function inviteLinkNoticeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search)
  return params.get('error') === 'invite' ? INVITE_LINK_NOTICE : null
}
