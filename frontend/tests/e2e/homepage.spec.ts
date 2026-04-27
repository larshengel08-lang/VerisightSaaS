import { expect, test } from '@playwright/test'

test('homepage shows the main hero, preview and final cta', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /zien\.\s*prioriteren\.\s*handelen\./i }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: /geen losse output\..*wel een duidelijke lijn\./i }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: /wilt u scherper zien.*wat nu aandacht vraagt/i }),
  ).toBeVisible()

  await expect(page.getByRole('link', { name: /plan een kennismaking/i }).last()).toHaveAttribute(
    'href',
    /\/kennismaking\?/i,
  )
})
