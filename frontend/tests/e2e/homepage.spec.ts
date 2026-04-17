import { expect, test } from '@playwright/test'

test('homepage shows the main hero and contact form', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /krijg scherper zicht op vertrek, behoud en de eerste logische managementroute/i }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: /vertel kort welke managementvraag nu speelt/i }),
  ).toBeVisible()

  await expect(page.getByLabel(/naam/i)).toBeVisible()
  await expect(page.getByLabel(/werk e-mail/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /verstuur bericht/i })).toBeVisible()
})
