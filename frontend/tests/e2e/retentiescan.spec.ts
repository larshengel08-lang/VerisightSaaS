import { expect, test } from '@playwright/test'

test('retentiescan page follows the core product canon without weakening dual-core architecture', async ({
  page,
}) => {
  await page.goto('/producten/retentiescan')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik retentiescan wanneer u eerder wilt zien waar behoud onder druk staat/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies retentiescan wanneer actieve behoudsdruk nu de open managementvraag is/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie waar retentiesignaal, aanvullende signalen en vertrekdruk nu samenkomen/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /u ontvangt een bestuurlijke read, rapport en voorbeeldbare deliverable/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /de route blijft compact: baseline eerst, ritme alleen bewust/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /retentiescan geeft groepssignalen en prioriteiten, geen individuele voorspelling/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of retentiescan nu de juiste eerste route is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/exitscan logischer/i).first()).toBeVisible()
  await expect(page.getByText(/geen individuele signalen naar management/i).first()).toBeVisible()
  await expect(page.getByText(/compacte vervolgmeting blijft een lichtere vervolgcomponent/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /open retentiescan-voorbeeldrapport/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
