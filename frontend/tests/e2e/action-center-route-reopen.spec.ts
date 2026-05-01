import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

type RouteReopenPilotArtifact = {
  hrOwner: { email: string; password: string }
  closeoutRouteContext: { focusItemId: string }
  followUpRouteContext: { targetFocusItemId: string }
}

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')

function readPilotArtifact() {
  if (!existsSync(artifactPath)) {
    throw new Error('Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')
  }

  return JSON.parse(readFileSync(artifactPath, 'utf8')) as RouteReopenPilotArtifact
}

function reseedPilot() {
  execFileSync('node', ['./scripts/seed-action-center-manager-pilot.mjs'], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

async function openFocusedRoute(page: import('@playwright/test').Page, focusItemId: string) {
  await page.goto(`/action-center?focus=${encodeURIComponent(focusItemId)}`)
  await expect(page).toHaveURL(new RegExp(`focus=${escapeRegExp(encodeURIComponent(focusItemId))}$`))

  const openFocusButton = page.getByRole('button', { name: 'Open focusactie' })
  if (await openFocusButton.isVisible().catch(() => false)) {
    await openFocusButton.click()
  }
}

test.describe('action center route reopen', () => {
  let pilot: RouteReopenPilotArtifact

  test.beforeAll(() => {
    reseedPilot()
    pilot = readPilotArtifact()
  })

  test('hr can reopen a closed route and see the reopened lineage persist', async ({ page }) => {
    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.waitForURL(/\/dashboard$/)

    await openFocusedRoute(page, pilot.closeoutRouteContext.focusItemId)
    await expect(page.getByText('Route afgesloten', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Heropen traject', exact: true }).click()

    await expect(page.getByText('Heropend traject', { exact: true })).toBeVisible()

    await page.goto(`/action-center?focus=${encodeURIComponent(pilot.closeoutRouteContext.focusItemId)}`)
    await expect(page).toHaveURL(
      new RegExp(`focus=${escapeRegExp(encodeURIComponent(pilot.closeoutRouteContext.focusItemId))}$`),
    )
    await page.getByRole('button', { name: 'Open focusactie', exact: true }).click()
    await expect(page.getByText('Heropend traject', { exact: true })).toBeVisible()
  })

  test('active follow-up route shows compact lineage back to the earlier route', async ({ page }) => {
    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.waitForURL(/\/dashboard$/)

    await openFocusedRoute(page, pilot.followUpRouteContext.targetFocusItemId)
    await expect(page.getByText('Vervolg op eerdere route', { exact: true })).toBeVisible()
  })
})
