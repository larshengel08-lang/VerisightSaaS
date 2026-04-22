import { expect, test } from '@playwright/test'

test('leadership scan page follows the bounded support canon', async ({ page }) => {
  await page.goto('/producten/leadership-scan')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik leadership scan wanneer managementcontext zelf eerst duiding vraagt/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies leadership scan wanneer een bestaand signaal nu vernauwt naar managementcontext/i,
  })
  const questionHeading = page.getByRole('heading', {
    name: /de managementvraag blijft begrensd en contextspecifiek/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie welke managementcontext het bestaande people-signaal nu kleurt/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /leadership scan blijft een bounded support-route, geen verborgen peer-product/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of leadership scan nu past/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(questionHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/bounded support-route/i).first()).toBeVisible()
  await expect(page.getByText(/group-level only/i).first()).toBeVisible()
  await expect(page.getByText(/geen 360-tool/i).first()).toBeVisible()
  await expect(page.getByText(/geen verborgen peer-product/i).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk trustgrenzen/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, questionHeading, visibilityHeading, scopeHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
