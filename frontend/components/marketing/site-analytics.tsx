import { Analytics } from '@vercel/analytics/next'

// Cookieloze first-party analytics via Vercel Web Analytics.
// Bewuste keuze (2026-07-04): geen GA4/gtag — dat script werd door de eigen
// CSP geblokkeerd en zou de footerclaim "geen trackingcookies op de
// marketingsite" breken. Vercel Analytics draait same-origin
// (/_vercel/insights/*), dus de CSP blijft dicht en de claim blijft waar.
export function SiteAnalytics() {
  return <Analytics />
}
