import { expect, test } from '@playwright/test'

test('tarieven page follows the commercial-calm canon', async ({ page }) => {
  await page.goto('/tarieven')

  const heroHeading = page.getByRole('heading', {
    name: /transparante prijsankers voor de eerste kooproute en rust in de vervolgstappen/i,
  })
  const anchorsHeading = page.getByRole('heading', {
    name: /de eerste koop blijft helder met twee kernankers/i,
  })
  const includedHeading = page.getByRole('heading', {
    name: /wat in het eerste traject inbegrepen is/i,
  })
  const boundedHeading = page.getByRole('heading', {
    name: /bounded vervolglogica komt pas na de eerste kooproute/i,
  })
  const calmHeading = page.getByRole('heading', {
    name: /prijsrust komt uit scope, niet uit pakket-theater/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /twijfelt u welke eerste route commercieel en inhoudelijk past/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(anchorsHeading).toBeVisible()
  await expect(includedHeading).toBeVisible()
  await expect(boundedHeading).toBeVisible()
  await expect(calmHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText('ExitScan Baseline', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('RetentieScan Baseline', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/geen licenties of vlakke planmatrix/i)).toBeVisible()
  await expect(page.getByText(/quote-only vervolg na baseline/i)).toBeVisible()
  await expect(page.getByText(/geen concurrerend eerste pakket naast exitscan baseline/i)).toBeVisible()

  const sectionOrder = await Promise.all(
    [anchorsHeading, includedHeading, boundedHeading, calmHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
