import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
const artifact = existsSync(artifactPath)
  ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as {
      campaignId: string
      hrOwner: { email: string; password: string }
      managers: Array<{ email: string; password: string; scopeLabel: string }>
    })
  : null

test.describe('action center manager access', () => {
  test.skip(!artifact, 'Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')

  const pilot = artifact as {
    campaignId: string
    hrOwner: { email: string; password: string }
    managers: Array<{ email: string; password: string; scopeLabel: string }>
  }

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('E-mailadres').fill(email)
  await page.getByLabel('Wachtwoord').fill(password)
  await Promise.all([
    page.waitForURL(/\/(dashboard|action-center)(?:\?.*)?$/),
    page.getByRole('button', { name: 'Inloggen' }).click(),
  ])
}

  test('hr owner keeps both modules inside one shared shell', async ({ page }) => {
    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.waitForURL(/\/dashboard$/)

    await expect(page.getByRole('navigation').getByRole('link', { name: 'Action Center' })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Rapporten' })).toBeVisible()

    await page.goto('/action-center')
    await expect(page.getByRole('heading', { name: 'Action Center', exact: true })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Managers', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Managers en toewijzing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open managers' })).toBeVisible()
  })

  test('manager assignee lands on action center only and gets denied on insights routes', async ({ page }) => {
    const manager = pilot.managers[0]
    await login(page, manager.email, manager.password)
    await page.waitForURL(/\/action-center$/)

    await expect(page.getByRole('navigation').getByRole('link', { name: 'Action Center' })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Reports' })).toHaveCount(0)
    await expect(page.locator('aside').getByText('Overview')).toHaveCount(0)
    await expect(page.getByText(manager.scopeLabel, { exact: true }).first()).toBeVisible()

    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: 'Je ziet hier geen rapporten' })).toBeVisible()

    await page.goto(`/campaigns/${pilot.campaignId}`)
    await expect(page.getByRole('heading', { name: 'Je ziet hier geen campagnedetail' })).toBeVisible()
  })
})
