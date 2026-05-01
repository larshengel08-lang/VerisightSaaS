import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

type RouteCloseoutPilotArtifact = {
  hrOwner: { email: string; password: string }
  closeoutRouteContext: { focusItemId: string }
}

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')

function readPilotArtifact() {
  if (!existsSync(artifactPath)) {
    throw new Error('Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')
  }

  return JSON.parse(readFileSync(artifactPath, 'utf8')) as RouteCloseoutPilotArtifact
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
  const hasDetailMarkers = async () => {
    const markers = [
      page.getByText('BEHANDELROUTE', { exact: true }),
      page.getByRole('button', { name: 'Route afsluiten', exact: true }),
      page.getByText('ROUTE AFGESLOTEN', { exact: true }),
    ]

    for (const marker of markers) {
      if (await marker.isVisible().catch(() => false)) {
        return true
      }
    }

    return false
  }

  await page.goto(`/action-center?focus=${encodeURIComponent(focusItemId)}`)
  await expect(page).toHaveURL(new RegExp(`focus=${escapeRegExp(encodeURIComponent(focusItemId))}$`))

  const openFocusButton = page.getByRole('button', { name: 'Open focusactie' })
  await expect
    .poll(async () => {
      if (await hasDetailMarkers()) return 'detail'
      if (await openFocusButton.isVisible().catch(() => false)) return 'button'
      return 'waiting'
    })
    .not.toBe('waiting')

  if (!(await hasDetailMarkers()) && (await openFocusButton.isVisible().catch(() => false))) {
    await openFocusButton.click()
  }

  await expect
    .poll(async () => hasDetailMarkers())
    .toBe(true)
}

test.describe('action center route closeout', () => {
  let pilot: RouteCloseoutPilotArtifact

  test.beforeAll(() => {
    reseedPilot()
    pilot = readPilotArtifact()
  })

  test('hr can explicitly close a route that is ready for closeout and see it persist', async ({ page }) => {
    const uniqueNote = `Route afgerond na HR closeout ${Date.now().toString().slice(-6)}`

    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.waitForURL(/\/dashboard$/)

    await openFocusedRoute(page, pilot.closeoutRouteContext.focusItemId)
    await expect(page.getByRole('button', { name: 'Route afsluiten', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Route afsluiten', exact: true }).click()
    await page.getByLabel('Afsluitstatus').selectOption('afgerond')
    await page.getByLabel('Afsluitreden').selectOption('effect-voldoende-zichtbaar')
    await page.getByLabel('Toelichting').fill(uniqueNote)
    await page.getByRole('button', { name: 'Closeout opslaan', exact: true }).click()

    await expect(page.getByText('Route afgesloten', { exact: true })).toBeVisible()
    await expect(page.getByText('Afgerond voor nu', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Effect voldoende zichtbaar', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(uniqueNote)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Route afsluiten', exact: true })).toHaveCount(0)

    await page.goto(`/action-center?focus=${encodeURIComponent(pilot.closeoutRouteContext.focusItemId)}`)
    await expect(page).toHaveURL(
      new RegExp(`focus=${escapeRegExp(encodeURIComponent(pilot.closeoutRouteContext.focusItemId))}$`),
    )
    await expect(page.getByRole('button', { name: 'Open focusactie', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Open focusactie', exact: true }).click()
    await expect(page.getByText('Route afgesloten', { exact: true })).toBeVisible()
    await expect(page.getByText(uniqueNote)).toBeVisible()
  })
})
