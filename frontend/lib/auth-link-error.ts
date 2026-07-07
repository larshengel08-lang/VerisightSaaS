// Vertaalt Supabase's auth-foutmelding (in de URL-hash na een verlopen of
// ongeldige activatie-/magic-link) naar een vriendelijke NL-tekst, zonder
// technisch jargon. Supabase redirect bij een otp-verificatiefout naar de
// geconfigureerde Site URL (niet naar /auth/callback — daar is dan geen geldige
// `code` voor), dus deze fout kan in principe op elke pagina landen; de
// parser is bewust een losstaande, pure functie zodat hij zonder browser-
// omgeving (jsdom) getest kan worden. Zie ook: fix(invites) commit fc6c7d9.

export interface AuthLinkError {
  title: string
  message: string
}

const MESSAGES: Record<string, AuthLinkError> = {
  otp_expired: {
    title: 'Link verlopen of al gebruikt',
    message:
      'Deze activatielink is verlopen of al gebruikt. Vraag degene die je heeft uitgenodigd om een nieuwe link te sturen.',
  },
}

const FALLBACK: AuthLinkError = {
  title: 'Inloggen niet gelukt',
  message: 'Deze link is niet (meer) geldig. Vraag een nieuwe link aan bij degene die je heeft uitgenodigd.',
}

/**
 * @param hash de volledige `window.location.hash`, inclusief het `#`-teken (of leeg)
 * @returns null als er geen Supabase auth-error in de hash staat
 */
export function parseAuthLinkError(hash: string): AuthLinkError | null {
  const trimmed = hash.replace(/^#/, '')
  if (!trimmed) return null

  const params = new URLSearchParams(trimmed)
  const error = params.get('error')
  if (error !== 'access_denied' && error !== 'server_error') return null

  const errorCode = params.get('error_code')
  return (errorCode && MESSAGES[errorCode]) || FALLBACK
}
