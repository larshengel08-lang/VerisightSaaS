export const PUBLIC_ROUTES = [
  '/',
  '/signup',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/complete-account',
  '/auth',
  '/privacy',
  '/voorwaarden',
  '/dpa',
  '/vertrouwen',
  '/kennismaking',
  '/pilot',
  '/survey',
  '/product',
  '/producten',
  '/aanpak',
  '/tarieven',
  '/oplossingen',
  '/inzichten',
  '/examples',
  '/dev/qa-login',
] as const

export const PUBLIC_API_ROUTES = ['/api/contact'] as const

// Alleen deze app-gebieden vereisen een sessie. Al het andere valt door naar
// Next zelf, dat publieke pagina's of de 404-pagina rendert. Een onbekend pad
// mag nooit op /login uitkomen (dat gebeurde eerder ook met /opengraph-image,
// waardoor alle link-previews kapot waren).
export const PROTECTED_APP_ROUTES = [
  '/dashboard',
  '/beheer',
  '/campaigns',
  '/reports',
  '/action-center',
  '/dev',
] as const

export const PUBLIC_STATIC_ASSET_EXTENSIONS = [
  'svg',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'pdf',
] as const

export const PUBLIC_STATIC_ASSET_PATTERN = new RegExp(
  `.*\\.(?:${PUBLIC_STATIC_ASSET_EXTENSIONS.join('|')})$`,
)

export function isPublicRoutePath(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function isPublicApiRoutePath(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function isProtectedAppRoutePath(pathname: string): boolean {
  return PROTECTED_APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export function isPublicStaticAssetPath(pathname: string): boolean {
  return PUBLIC_STATIC_ASSET_PATTERN.test(pathname)
}
