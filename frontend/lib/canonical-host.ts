export function getCanonicalHostRedirectUrl(args: {
  hostname: string | null
  pathname: string
  search: string
}) {
  const hostname = args.hostname?.toLowerCase() ?? null

  if (!hostname || hostname !== 'verisight.nl') {
    return null
  }

  return `https://www.getloep.nl${args.pathname}${args.search}`
}
