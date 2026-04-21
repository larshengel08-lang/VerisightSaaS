import { expect, test } from '@playwright/test'

test('exitscan page follows the core product canon without weakening dual-core architecture', async ({
  page,
}) => {
  await page.goto('/producten/exitscan')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik exitscan wanneer u vertrek eerst bestuurlijk wilt duiden/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies exitscan wanneer vertrekduiding nu de open managementvraag is/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie hoe frictiescore, vertrekpatronen en werkfrictie samenkomen/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /u ontvangt een bestuurlijke read, rapport en voorbeeldbare deliverable/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /de route blijft compact: baseline eerst, verdieping alleen bewust/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /exitscan geeft signalen en managementduiding, geen diagnose/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of exitscan nu de juiste eerste route is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/retentiescan logischer/i).first()).toBeVisible()
  await expect(page.getByText(/segment deep dive blijft optionele verdieping/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /open exitscan-voorbeeldrapport/i }).first()).toBeVisible()
  await expect(page.getByText(/geen individuele beoordeling of causale zekerheid/i)).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
