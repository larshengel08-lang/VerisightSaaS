import type { NextConfig } from "next";
import path from "path";

const configuredDistDir = process.env.NEXT_DIST_DIR?.trim()
const distDir =
  process.env.VERCEL === '1' || process.env.CI === 'true'
    ? undefined
    : configuredDistDir && configuredDistDir !== '.next'
      ? configuredDistDir
      : undefined
const isProduction = process.env.NODE_ENV === 'production'
const localSupabaseConnectSources = isProduction
  ? []
  : ['http://127.0.0.1:54321', 'http://localhost:54321', 'ws://127.0.0.1:54321', 'ws://localhost:54321']

// Backend-origin voor connect-src: afgeleid uit de daadwerkelijke API-URL, zodat
// de CSP correct blijft als de Railway-host wijzigt. Voorheen stond hier een
// hardcoded host (verisight-production.up.railway.app) die inmiddels dood is;
// de echte backend draait op web-production-bf382. Overweeg een stabiel eigen
// domein (bv. api.getloep.nl) om deze afhankelijkheid van de auto-host op te heffen.
const backendApiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!raw) return 'https://web-production-bf382.up.railway.app'
  try {
    return new URL(raw).origin
  } catch {
    return 'https://web-production-bf382.up.railway.app'
  }
})()

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Supabase API + auth. Analytics loopt via Vercel Web Analytics
      // (same-origin /_vercel/insights/*), dus de CSP blijft bewust dicht.
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${backendApiOrigin} ${localSupabaseConnectSources.join(' ')}`.trim(),
      // Next.js dev runtime needs unsafe-eval for fast refresh and client hydration.
      `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  ...(distDir ? { distDir } : {}),
  turbopack: {
    // Silences the "multiple lockfiles" workspace root warning
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      // Oude /oplossingen-routes → direct naar de juiste scan-sectie op /producten (geen dubbele hop)
      { source: '/oplossingen/verloop-analyse', destination: '/producten#loep-vertrek', permanent: true },
      { source: '/oplossingen/exitgesprekken-analyse', destination: '/producten#loep-vertrek', permanent: true },
      { source: '/oplossingen/medewerkersbehoud-analyse', destination: '/producten#loep-behoud', permanent: true },
      { source: '/oplossingen/:slug(exit.*)', destination: '/producten#loep-vertrek', permanent: true },
      { source: '/oplossingen/:slug(retentie.*)', destination: '/producten#loep-behoud', permanent: true },
      { source: '/oplossingen/:slug(onboarding.*)', destination: '/producten#loep-start', permanent: true },
      { source: '/oplossingen', destination: '/producten', permanent: true },
      { source: '/oplossingen/:slug*', destination: '/producten', permanent: true },
      // Losse productpagina's geconsolideerd onder één /producten-pagina.
      // Loep Cultuurbeeld blijft bewust een eigen (stille) pagina en redirect NIET.
      { source: '/producten/exitscan', destination: '/producten#loep-vertrek', permanent: true },
      { source: '/producten/retentiescan', destination: '/producten#loep-behoud', permanent: true },
      { source: '/producten/onboarding-30-60-90', destination: '/producten#loep-start', permanent: true },
      // Tarieven gevouwen in /producten
      { source: '/tarieven', destination: '/producten#tarieven', permanent: true },
      // /aanpak was een wees-pagina met verouderde terminologie; de werkwijze
      // staat nu in de "zo werkt elke scan"-sectie op /producten (keuze 2026-07-04).
      { source: '/aanpak', destination: '/producten', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/examples/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, noarchive, nosnippet',
          },
        ],
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
