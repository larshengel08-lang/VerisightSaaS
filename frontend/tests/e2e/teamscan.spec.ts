import { expect, test } from '@playwright/test'

test('teamscan page follows the specialist support canon', async ({ page }) => {
  await page.goto('/producten/teamscan')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik teamscan wanneer een breder signaal lokaal eerst verificatie vraagt/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies teamscan wanneer lokale team- of leidingcontext nu de echte vervolgvraag is/i,
  })
  const contextHeading = page.getByRole('heading', {
    name: /de route vernauwt een bestaand signaal naar team- of afdelingscontext zonder een brede teamsuite te openen/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie waar team- of afdelingscontext nu eerst verificatie vraagt/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /u ontvangt een lokale managementread met eerste eigenaar, actie en reviewgrens/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /teamscan blijft begrensd: geen brede teamscan, geen manager ranking/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /teamscan is een specialistische support-route, geen extra hoofdroute/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of teamscan nu de juiste specialistische vervolgstap is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(contextHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/specialistische support-route/i).first()).toBeVisible()
  await expect(page.getByText(/lokale verificatie/i).first()).toBeVisible()
  await expect(page.getByText(/geen brede teamscan/i).first()).toBeVisible()
  await expect(page.getByText(/geen simpele bounded utility/i).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk retentiescan/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, contextHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
