import { expect, test } from '@playwright/test'

test('homepage shows the main hero, preview and final cta', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /zien\.\s*prioriteren\.\s*handelen\./i }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: /geen losse rapportage\..*wel een helder besluitspoor\./i }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: /wilt u zien.*welke route nu het meest logisch is/i }),
  ).toBeVisible()

  await expect(page.getByRole('link', { name: /plan een kennismaking/i }).last()).toHaveAttribute(
    'href',
    /\/kennismaking\?/i,
  )
})
