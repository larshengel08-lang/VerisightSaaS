export interface AccountHeading {
  label: string
  /** True als het label een storing benoemt in plaats van de organisatie. */
  degraded: boolean
}

/**
 * Wat er in de kop van de ingelogde omgeving staat (spec 2026-09-16 par. 6.5).
 * Vóór dit plan: het maildomein met een hoofdletter ("Hotmail"). Nu: de naam
 * uit organizations, en als die er niet is een zichtbaar degraded label.
 * Nooit iets afleiden uit het e-mailadres.
 */
export function resolveAccountHeading(args: {
  names: string[]
  error: string | null
  isAdmin: boolean
}): AccountHeading {
  if (args.error) return { label: 'Organisatie niet geladen', degraded: true }
  if (args.names.length === 1) return { label: args.names[0], degraded: false }
  if (args.names.length > 1) return { label: `${args.names.length} organisaties`, degraded: false }
  if (args.isAdmin) return { label: 'Loep beheer', degraded: false }
  return { label: 'Geen organisatie gekoppeld', degraded: true }
}
