import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

type RouteCloseoutPilotArtifact = {
  hrOwner: { email: string; password: string }
  closeoutRouteContext: { focusItemId: string; routeTitle: string }
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

function getScopeLabelFromFocusItemId(focusItemId: string) {
  return focusItemId.split('::').at(-1)?.toUpperCase() ?? ''
}

function getScopedRouteCard(
  page: import('@playwright/test').Page,
  routeTitle: string,
  routeScopeLabel?: string,
) {
  const namePattern = routeScopeLabel
    ? new RegExp(`${escapeRegExp(routeScopeLabel)}\\s*/.*${escapeRegExp(routeTitle)}`, 'i')
    : new RegExp(escapeRegExp(routeTitle), 'i')

  return page.getByRole('button', { name: namePattern }).first()
}

function buildScopedRouteSearch(routeTitle: string, routeScopeLabel?: string) {
  return routeScopeLabel ? `${routeTitle} ${routeScopeLabel}` : routeTitle
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

async function openFocusedRoute(
  page: import('@playwright/test').Page,
  focusItemId: string,
  routeTitle?: string,
  routeScopeLabel?: string,
) {
  const hasDetailMarkers = async () => {
    const markers = [
      page.getByText(/behandelroute/i),
      page.getByText(/actieve route/i),
      page.getByRole('button', { name: 'Route afsluiten', exact: true }),
      page.getByText(/route afgesloten/i),
    ]

    for (const marker of markers) {
      if (await marker.isVisible().catch(() => false)) {
        return true
      }
    }

    return false
  }

  await page.goto(`/action-center?focus=${encodeURIComponent(focusItemId)}`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(new RegExp(`focus=${escapeRegExp(encodeURIComponent(focusItemId))}$`))

  const openFocusButton = page.getByRole('button', { name: 'Open focusactie' })
  const routeCard = routeTitle ? getScopedRouteCard(page, routeTitle, routeScopeLabel) : null
  const routeHeading = routeTitle ? page.getByRole('heading', { level: 2, name: routeTitle }) : null

  if (routeTitle) {
    await page
      .getByPlaceholder('Zoek actie, team of eigenaar')
      .fill(buildScopedRouteSearch(routeTitle, routeScopeLabel))
  }

  if (routeCard && (await routeCard.isVisible().catch(() => false))) {
    await routeCard.click()
  }

  await expect
    .poll(async () => {
      if (routeHeading && (await routeHeading.isVisible().catch(() => false))) return 'heading'
      if (await hasDetailMarkers()) return 'detail'
      if (routeCard && (await routeCard.isVisible().catch(() => false))) return 'card'
      if (await openFocusButton.isVisible().catch(() => false)) return 'button'
      return 'waiting'
    })
    .not.toBe('waiting')

  if (routeCard && !(routeHeading && (await routeHeading.isVisible().catch(() => false))) && (await routeCard.isVisible().catch(() => false))) {
    await routeCard.click()
  }

  if (
    !(routeHeading && (await routeHeading.isVisible().catch(() => false))) &&
    !(await hasDetailMarkers()) &&
    (await openFocusButton.isVisible().catch(() => false))
  ) {
    await openFocusButton.click()
  }

  if (routeHeading) {
    await expect(routeHeading).toBeVisible()
  }
  await expect
    .poll(async () => hasDetailMarkers())
    .toBe(true)
}

async function openClosedRouteFromOverview(
  page: import('@playwright/test').Page,
  routeTitle: string,
  routeScopeLabel?: string,
) {
  await page.getByRole('button', { name: 'Overzicht', exact: true }).click()
  await page
    .getByPlaceholder('Zoek actie, team of eigenaar')
    .fill(buildScopedRouteSearch(routeTitle, routeScopeLabel))
  const routeCard = getScopedRouteCard(page, routeTitle, routeScopeLabel)
  await expect(routeCard).toBeVisible()
  await routeCard.click()
}

test.describe('action center route closeout', () => {
  let pilot: RouteCloseoutPilotArtifact

  test.beforeAll(() => {
    reseedPilot()
    pilot = readPilotArtifact()
  })

  test('hr can explicitly close a route that is ready for closeout and see it persist', async ({ page }) => {
    const uniqueNote = `Route afgerond na HR closeout ${Date.now().toString().slice(-6)}`
    const closeoutScopeLabel = getScopeLabelFromFocusItemId(pilot.closeoutRouteContext.focusItemId)

    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.waitForURL(/\/dashboard$/)

    await openFocusedRoute(
      page,
      pilot.closeoutRouteContext.focusItemId,
      pilot.closeoutRouteContext.routeTitle,
      closeoutScopeLabel,
    )
    await expect(page.getByRole('button', { name: 'Route afsluiten', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Route afsluiten', exact: true }).click()
    await page.getByLabel('Afsluitstatus').selectOption('afgerond')
    await page.getByLabel('Afsluitreden').selectOption('effect-voldoende-zichtbaar')
    await page.getByLabel('Toelichting').fill(uniqueNote)
    await page.getByRole('button', { name: 'Closeout opslaan', exact: true }).click()

    await page.waitForURL(/\/action-center(?:\?.*)?$/, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Action Center', exact: true })).toBeVisible()
    await openClosedRouteFromOverview(page, pilot.closeoutRouteContext.routeTitle, closeoutScopeLabel)
    await expect(page.getByText('Route afgesloten', { exact: true })).toBeVisible()
    await expect(page.getByText('Afgerond voor nu', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Effect voldoende zichtbaar', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(uniqueNote)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Route afsluiten', exact: true })).toHaveCount(0)

    await page.goto(`/action-center?focus=${encodeURIComponent(pilot.closeoutRouteContext.focusItemId)}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page).toHaveURL(
      new RegExp(`focus=${escapeRegExp(encodeURIComponent(pilot.closeoutRouteContext.focusItemId))}$`),
    )
    await openClosedRouteFromOverview(page, pilot.closeoutRouteContext.routeTitle, closeoutScopeLabel)
    await expect(page.getByText('Route afgesloten', { exact: true })).toBeVisible()
    await expect(page.getByText(uniqueNote)).toBeVisible()
  })
})
