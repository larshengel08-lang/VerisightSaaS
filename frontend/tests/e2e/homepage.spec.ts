import { expect, test } from '@playwright/test'

test('homepage shows the main hero and contact form', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /weet waarom mensen vertrekken/i }),
  ).toBeVisible()

  await expect(
    page.getByText(/vertrek- en retentiesignalen zichtbaar te maken/i).first(),
  ).toBeVisible()

  await expect(page.getByRole('link', { name: /plan een kennismaking/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /bekijk voorbeeldrapport/i }).first()).toBeVisible()

  await expect(page.locator('#voorbeeldoutput').getByText(/^Voorbeeldrapport$/)).toBeVisible()
  await expect(page.getByText(/kies de route die nu past/i)).toBeVisible()
  await expect(page.getByText(/vertrouwen en privacy/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: /een kort gesprek maakt snel duidelijk wat nu past/i })).toBeVisible()

  await expect(page.getByLabel(/naam/i)).toBeVisible()
  await expect(page.getByLabel(/werk e-mail/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /verstuur bericht/i })).toBeVisible()
})
