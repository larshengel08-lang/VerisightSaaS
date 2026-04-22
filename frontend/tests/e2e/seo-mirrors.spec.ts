import { expect, test } from '@playwright/test'

const mirrorCases = [
  {
    slug: 'verloop-analyse',
    hero: /verloopanalyse die verder gaat dan losse exitinput/i,
    primaryRoute: /bekijk exitscan/i,
    forbiddenRoute: /bekijk retentiescan/i,
  },
  {
    slug: 'exitgesprekken-analyse',
    hero: /analyseer exitgesprekken als managementinput, niet als losse verhalen/i,
    primaryRoute: /bekijk exitscan/i,
    forbiddenRoute: /bekijk retentiescan/i,
  },
  {
    slug: 'medewerkersbehoud-analyse',
    hero: /medewerkersbehoud analyseren zonder brede mto of predictorframing/i,
    primaryRoute: /bekijk retentiescan/i,
    forbiddenRoute: /bekijk exitscan/i,
  },
] as const

for (const mirror of mirrorCases) {
  test(`${mirror.slug} follows the mirror handoff canon`, async ({ page }) => {
    await page.goto(`/oplossingen/${mirror.slug}`)

    await expect(page.getByRole('heading', { name: mirror.hero })).toBeVisible()
    await expect(page.getByRole('heading', { name: /waarom deze situatie aandacht vraagt/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /waarom de huidige aanpak hier te weinig lijn geeft/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /welke route hier het beste op past/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /korte proof- en trustlaag/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /ga verder via de productroute die hier echt bij past/i })).toBeVisible()

    await expect(page.getByText(/buyer-facing handofflaag/i).first()).toBeVisible()
    await expect(page.getByRole('link', { name: mirror.primaryRoute }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: mirror.forbiddenRoute })).toHaveCount(0)
    await expect(page.getByText(/geen productoverzicht/i).first()).toBeVisible()
  })
}
