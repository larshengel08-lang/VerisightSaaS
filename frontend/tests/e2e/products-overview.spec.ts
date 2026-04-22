import { expect, test } from '@playwright/test'

test('producten overview follows the portfolio hierarchy canon', async ({ page }) => {
  await page.goto('/producten')

  const heroHeading = page.getByRole('heading', {
    name: /kies eerst welke kernroute de managementvraag nu opent/i,
  })
  const coreHeading = page.getByRole('heading', {
    name: /exitscan en retentiescan blijven de twee kernroutes van de eerste koop/i,
  })
  const portfolioHeading = page.getByRole('heading', {
    name: /combinatie hoort pas na een heldere eerste route/i,
  })
  const boundedHeading = page.getByRole('heading', {
    name: /bounded vervolgroutes horen na de eerste managementread/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /de portfoliohiërarchie moet ook publiek geloofwaardig blijven/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /twijfelt u welke route nu eerst telt/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(coreHeading).toBeVisible()
  await expect(portfolioHeading).toBeVisible()
  await expect(boundedHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByRole('heading', { name: 'ExitScan', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'RetentieScan', exact: true })).toBeVisible()
  await expect(page.getByText(/portfolioroute op aanvraag/i).first()).toBeVisible()
  await expect(page.getByText(/geen derde kernproduct/i)).toBeVisible()
  await expect(page.getByText(/pulse/i).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [coreHeading, portfolioHeading, boundedHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
