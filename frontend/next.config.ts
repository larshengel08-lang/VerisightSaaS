import type { NextConfig } from "next";
import path from "path";

const configuredDistDir = process.env.NEXT_DIST_DIR?.trim()
const distDir =
  process.env.VERCEL === '1' || process.env.CI === 'true'
    ? undefined
    : configuredDistDir && configuredDistDir !== '.next'
      ? configuredDistDir
      : undefined

const connectSrc = [
  "'self'",
  'https://*.supabase.co',
  'wss://*.supabase.co',
  'https://verisight-production.up.railway.app',
]
const scriptSrc = ["'self'", "'unsafe-inline'"]
const isLocalAcceptanceDev = process.env.VERISIGHT_ACCEPTANCE_FRONTEND_RUNTIME === 'dev'
const isDevelopment = process.env.NODE_ENV !== 'production'
if (isLocalAcceptanceDev || isDevelopment) {
  scriptSrc.push("'unsafe-eval'")
}

const localSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
if (localSupabaseUrl?.startsWith('http://127.0.0.1') || localSupabaseUrl?.startsWith('http://localhost')) {
  const localSupabaseOrigin = new URL(localSupabaseUrl).origin
  connectSrc.push(localSupabaseOrigin)
  connectSrc.push(localSupabaseOrigin.replace(/^http/, 'ws'))
}

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
      // Supabase API + auth
      `connect-src ${connectSrc.join(' ')}`,
      // Next.js inline scripts + Google Fonts
      `script-src ${scriptSrc.join(' ')}`,
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
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  turbopack: {
    // Silences the "multiple lockfiles" workspace root warning
    root: path.resolve(__dirname),
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
