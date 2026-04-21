import { expect, test } from '@playwright/test'

test('pulse page follows the bounded follow-on canon', async ({ page }) => {
  await page.goto('/producten/pulse')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik pulse wanneer u na een eerste route kort wilt toetsen wat nu verschuift/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies pulse pas nadat een eerste route of patroonbeeld al managementtaal heeft gegeven/i,
  })
  const relationHeading = page.getByRole('heading', {
    name: /pulse volgt op een eerder beeld en opent geen nieuwe hoofdroute/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie wat nu verschuift sinds de vorige bestuurlijke read/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /u ontvangt een compacte reviewlaag voor monitoring, opvolging en ritme/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /pulse blijft bounded: review, hercheck en ritme zonder nieuwe baselineclaim/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /pulse is een vervolgroute, geen nieuwe eerste koop/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of pulse nu de logische vervolgstap is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(relationHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/geen nieuwe eerste koop/i).first()).toBeVisible()
  await expect(page.getByText(/bounded vervolgroute/i).first()).toBeVisible()
  await expect(page.getByText(/review, hercheck en ritme/i).first()).toBeVisible()
  await expect(page.getByText(/retentiescan ritmeroute blijft breder/i).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk retentiescan/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, relationHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
