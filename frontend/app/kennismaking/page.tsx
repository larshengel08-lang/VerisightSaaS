import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingHeroIntro, MarketingHeroSupport } from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Kennismaking',
  description:
    'Plan een kennismaking en ontdek welke route nu het best past. In 30 minuten krijgt u scherp welke eerste stap logisch is: exit, behoud, team of onboarding.',
  alternates: { canonical: '/kennismaking' },
}

const reassuranceItems = [
  'In 30 minuten krijgt u scherp welke eerste route het best past bij uw vraagstuk.',
  'We bespreken exit, behoud, team of onboarding zonder eerst een losse demo-route te forceren.',
  'Na het gesprek weet u of een eerste stap logisch is en welke bounded vervolgrichting eventueel later hoort.',
] as const

export default function KennismakingPage() {
  return (
    <MarketingPageShell
      theme="neutral"
      pageType="support"
      ctaHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'kennismaking_primary_cta' })}
      ctaLabel="Plan een kennismaking"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-[#3C8D8A]">Kennismaking</p>
          <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[#132033]">
            Plan een kennismaking en ontdek welke route nu het best past.
          </h1>
          <p className="marketing-hero-copy text-[#4A5563]">
            In 30 minuten krijgt u scherp welke eerste stap logisch is: exit, behoud, team of onboarding.
          </p>
          <div className="marketing-hero-cta-row marketing-hero-actions">
            <Link href="#formulier" className="marketing-button-primary">
              Plan een kennismaking
            </Link>
            <Link href="/producten" className="marketing-button-secondary">
              Bekijk de routes
            </Link>
          </div>
        </MarketingHeroIntro>
      }
      heroSupport={
        <MarketingHeroSupport>
          {reassuranceItems.map((item) => (
            <div key={item} className="marketing-support-note">
              <p className="text-sm leading-7 text-[#4A5563]">{item}</p>
            </div>
          ))}
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <div id="formulier" className="scroll-mt-24">
          <MarketingInlineContactPanel
            eyebrow="Kennismakingsformulier"
            title="Vertel kort wat nu speelt."
            body="We gebruiken dit gesprek om de juiste eerste route te bepalen, niet om u door een generieke demo te leiden."
            defaultRouteInterest="nog-onzeker"
            defaultCtaSource="kennismaking_form"
          />
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Eerst oriënteren?"
          title="Bekijken wat Verisight al zichtbaar maakt."
          body="Als u nog eerst wilt zien welke routes er zijn en hoe de output eruitziet, kunt u vanuit producten of de homepage verder oriënteren."
          primaryHref="/producten"
          primaryLabel="Bekijk de routes"
          secondaryHref="/"
          secondaryLabel="Terug naar home"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}
