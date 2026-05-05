import Script from 'next/script'

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const cloudflareBeaconToken = process.env.NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN

export function SiteAnalytics() {
  if (!googleAnalyticsId && !cloudflareBeaconToken) {
    return null
  }

  return (
    <>
      {googleAnalyticsId ? (
        <>
          <Script
            id="google-analytics-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      ) : null}

      {cloudflareBeaconToken ? (
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: cloudflareBeaconToken })}
        />
      ) : null}
    </>
  )
}
