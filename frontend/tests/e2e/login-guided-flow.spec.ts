import { expect, test } from '@playwright/test'

test('login page explains the guided customer execution flow', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: /inloggen/i })).toBeVisible()
  await expect(page.getByText(/begeleide klantuitvoering/i)).toBeVisible()
  await expect(
    page.getByText(/na login zie je direct wat nu ontbreekt, wanneer deelnemers kunnen worden aangeleverd/i),
  ).toBeVisible()
  await expect(page.getByLabel(/e-mailadres/i)).toBeVisible()
  await expect(page.getByLabel(/wachtwoord/i)).toBeVisible()
})
