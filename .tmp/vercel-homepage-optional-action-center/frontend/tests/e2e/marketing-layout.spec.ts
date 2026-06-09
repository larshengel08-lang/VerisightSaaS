import { expect, test } from '@playwright/test'

const coreRoutes = [
  {
    path: '/',
    heading: /krijg scherper zicht op vertrek, behoud en de eerste logische managementroute/i,
  },
  {
    path: '/producten',
    heading: /kies de route die past bij de managementvraag die nu echt openligt/i,
  },
  {
    path: '/tarieven',
    heading: /transparante prijsankers, heldere scope en bewuste vervolgroutes/i,
  },
  {
    path: '/vertrouwen',
    heading: /methodiek, privacy en rapportgrenzen in gewone managementtaal/i,
  },
] as const

for (const route of coreRoutes) {
  test(`marketing layout stays stable on ${route.path}`, async ({ page }) => {
    await page.goto(route.path)

    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('heading', { name: route.heading })).toBeVisible()
    await expect(page.locator('.marketing-shell').first()).toBeVisible()

    const hasHorizontalOverflow = await page.evaluate(() => {
      const root = document.documentElement
      return root.scrollWidth > root.clientWidth + 1
    })

    expect(hasHorizontalOverflow).toBe(false)
  })
}
