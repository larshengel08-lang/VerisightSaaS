import { expect, test } from '@playwright/test'

test('combinatie page follows the bounded portfolio canon', async ({ page }) => {
  await page.goto('/producten/combinatie')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik combinatie wanneer beide managementvragen echt naast elkaar zijn komen te liggen/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies combinatie pas nadat exitscan of retentiescan al scherp staat/i,
  })
  const relationHeading = page.getByRole('heading', {
    name: /de route verbindt exitscan en retentiescan zonder derde hoofdwedge te worden/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie hoe vertrekduiding en vroegsignalering samen een gedeelde managementlijn vormen/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /u ontvangt een gedeelde managementstructuur boven op twee gerichte routes/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /de route blijft bounded: geen bundel, geen standaardpakket/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /combinatie is een portfolioroute, geen derde kernproduct/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of combinatie nu echt logisch is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(relationHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/geen derde kernproduct/i).first()).toBeVisible()
  await expect(page.getByText(/bekijk exitscan/i).first()).toBeVisible()
  await expect(page.getByText(/bekijk retentiescan/i).first()).toBeVisible()
  await expect(page.getByText(/niet als bundel of standaardpakket/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /open exitscan-voorbeeldrapport/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /open retentiescan-voorbeeldrapport/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, relationHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
