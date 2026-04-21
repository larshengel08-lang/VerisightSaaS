import { expect, test } from '@playwright/test'

test('vertrouwen page follows the trust-verification canon', async ({ page }) => {
  await page.goto('/vertrouwen')

  const heroHeading = page.getByRole('heading', {
    name: /methodiek, privacy en rapportgrenzen in gewone managementtaal/i,
  })
  const boundariesHeading = page.getByRole('heading', {
    name: /deze pagina bevestigt grenzen, geen nieuwe route of prijs/i,
  })
  const privacyHeading = page.getByRole('heading', {
    name: /privacy en zorgvuldigheid moeten publiek toetsbaar zijn voordat een traject start/i,
  })
  const readingHeading = page.getByRole('heading', {
    name: /lees dashboard en rapport als managementduiding, niet als diagnose/i,
  })
  const supportHeading = page.getByRole('heading', {
    name: /de formele basis moet de trustlaag kunnen dragen/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u de trustbasis toetsen naast uw gekozen route/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(boundariesHeading).toBeVisible()
  await expect(privacyHeading).toBeVisible()
  await expect(readingHeading).toBeVisible()
  await expect(supportHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/geen nieuwe routekeuze of prijsvergelijking/i)).toBeVisible()
  await expect(page.getByText(/hoe voorkom je schijnprecisie/i)).toBeVisible()
  await expect(page.getByText(/wat voor productvorm koop je/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk privacybeleid/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /verwerkersovereenkomst/i }).first()).toBeVisible()
  await expect(page.getByText(/geen routecatalogus/i)).toHaveCount(0)

  const sectionOrder = await Promise.all(
    [boundariesHeading, privacyHeading, readingHeading, supportHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
