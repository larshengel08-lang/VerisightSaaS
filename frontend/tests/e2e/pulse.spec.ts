import { expect, test } from '@playwright/test'

test('pulse page follows the bounded follow-on canon', async ({ page }) => {
  await page.goto('/producten/pulse')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik pulse om compact te herijken wat nu direct aandacht vraagt/i,
  })
  const routefitHeading = page.getByRole('heading', { name: /gebruik pulse pas na een eerdere managementread/i })
  const visibilityHeading = page.getByRole('heading', {
    name: /welke compacte reviewvraag vraagt nu direct aandacht/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /wat u ontvangt is een compacte managementhandoff/i,
  })
  const scopeHeading = page.getByRole('heading', { name: /pulse blijft een bounded vervolgroute/i })
  const trustHeading = page.getByRole('heading', {
    name: /wanneer pulse niet de juiste route is/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of pulse nu de juiste bounded vervolgroute is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/geen extra hoofdroute/i).first()).toBeVisible()
  await expect(page.getByText(/bounded vervolgroute/i).first()).toBeVisible()
  await expect(page.getByText(/compacte managementhandoff/i).first()).toBeVisible()
  await expect(page.getByText(/vorige vergelijkbare pulse/i).first()).toBeVisible()
  await expect(page.getByText(/compacte reviewroute/i).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk retentiescan/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
