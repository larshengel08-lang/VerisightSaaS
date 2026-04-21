import { expect, test } from '@playwright/test'

test('leadership scan page follows the management specialist canon', async ({ page }) => {
  await page.goto('/producten/leadership-scan')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik leadership scan wanneer managementcontext zelf eerst duiding vraagt/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies leadership scan wanneer een bestaand signaal nu vernauwt naar leidingcontext/i,
  })
  const contextHeading = page.getByRole('heading', {
    name: /de route specialiseert naar managementcontext zonder een generieke leadershippage te worden/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie waar leidingcontext, sturing en managementomgeving nu eerst verificatie vragen/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /u ontvangt een managementread met eerste verificatievraag, owner en reviewgrens/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /leadership scan blijft begrensd: geen 360-tool, geen named leader readout/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /leadership scan is een specialistische managementroute, geen extra hoofdroute/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of leadership scan nu de juiste managementcontext-route is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(contextHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/specialistische managementroute/i).first()).toBeVisible()
  await expect(page.getByText(/group-level only/i).first()).toBeVisible()
  await expect(page.getByText(/geen 360-tool/i).first()).toBeVisible()
  await expect(page.getByText(/geen generieke supportpagina/i).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk trustgrenzen/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, contextHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
