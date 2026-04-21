import { expect, test } from '@playwright/test'

test('onboarding page follows the peer route canon', async ({ page }) => {
  await page.goto('/producten/onboarding-30-60-90')

  const heroHeading = page.getByRole('heading', {
    name: /gebruik onboarding 30-60-90 wanneer u vroeg wilt zien hoe nieuwe medewerkers nu landen/i,
  })
  const routefitHeading = page.getByRole('heading', {
    name: /kies onboarding 30-60-90 wanneer de lifecycle-vraag zelf nu centraal staat/i,
  })
  const lifecycleHeading = page.getByRole('heading', {
    name: /de route opent een eigen lifecycle-checkpoint zonder de dual-core architectuur over te nemen/i,
  })
  const visibilityHeading = page.getByRole('heading', {
    name: /zie hoe nieuwe medewerkers nu landen in rol, leiding, team en werkcontext/i,
  })
  const deliverableHeading = page.getByRole('heading', {
    name: /u ontvangt een checkpoint-read met owner, eerste actie en reviewgrens/i,
  })
  const scopeHeading = page.getByRole('heading', {
    name: /de route blijft begrensd: geen journey-suite, geen client onboardinglaag/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /onboarding 30-60-90 is een serieuze route, maar geen nieuwe dominante hoofdwedge/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /wilt u toetsen of onboarding 30-60-90 nu de juiste route is/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(routefitHeading).toBeVisible()
  await expect(lifecycleHeading).toBeVisible()
  await expect(visibilityHeading).toBeVisible()
  await expect(deliverableHeading).toBeVisible()
  await expect(scopeHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText(/geen client onboarding-tool/i).first()).toBeVisible()
  await expect(page.getByText(/lifecycle-checkpoint route/i).first()).toBeVisible()
  await expect(page.getByText(/geen gewone support-route/i).first()).toBeVisible()
  await expect(page.getByText(/nieuwe medewerkers nu landen/i).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk retentiescan/i }).first()).toBeVisible()

  const sectionOrder = await Promise.all(
    [routefitHeading, lifecycleHeading, visibilityHeading, deliverableHeading, scopeHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
})
