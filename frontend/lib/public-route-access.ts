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
  '/survey',
  '/product',
  '/producten',
  '/aanpak',
  '/tarieven',
  '/oplossingen',
  '/inzichten',
  '/examples',
] as const

export const PUBLIC_API_ROUTES = ['/api/contact'] as const

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

export function isPublicStaticAssetPath(pathname: string): boolean {
  return PUBLIC_STATIC_ASSET_PATTERN.test(pathname)
}
