import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

type HrPilotArtifact = {
  campaignId: string
  hrOwner: { email: string; password: string }
  routeContext: {
    overviewUrl: string
    reportsUrl: string
    campaignDetailUrl: string
    actionCenterUrl: string
    actionCenterFocusUrl: string
  }
}

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
const artifact = existsSync(artifactPath)
  ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as HrPilotArtifact)
  : null

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('E-mailadres').fill(email)
  await page.getByLabel('Wachtwoord').fill(password)
  await Promise.all([
    page.waitForURL(/\/(dashboard|action-center)(?:\?.*)?$/),
    page.getByRole('button', { name: 'Inloggen' }).click(),
  ])
}

test.describe('action center hr happy path', () => {
  test.skip(!artifact, 'Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')

  const pilot = artifact as HrPilotArtifact

  test('shows one canonical HR route across overview, reports, campaign detail, and Action Center detail', async ({
    page,
  }) => {
    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/)

    await expect(page.getByRole('heading', { name: /overzicht/i })).toBeVisible()
    await expect(page.getByText('Actieve opvolging').first()).toBeVisible()
    await expect(page.locator(`a[href="${pilot.routeContext.campaignDetailUrl}"]`).first()).toBeVisible()

    await page.goto(pilot.routeContext.reportsUrl)
    await expect(page.getByText('Rapportbibliotheek')).toBeVisible()
    await expect(page.locator(`a[href="${pilot.routeContext.actionCenterUrl}"]`).first()).toBeVisible()

    await page.goto(pilot.routeContext.campaignDetailUrl)
    await expect(page).toHaveURL(new RegExp(`${pilot.campaignId}$`))
    await expect(page.locator(`a[href="${pilot.routeContext.actionCenterFocusUrl}"]`).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /open in action center/i }).first()).toBeVisible()

    await page.goto(pilot.routeContext.actionCenterFocusUrl)
    await expect(page).toHaveURL(new RegExp(`focus=${pilot.campaignId}$`))
    await expect(page.getByRole('heading', { name: 'Action Center', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Open focusactie' }).click()
    await expect(page.getByText(/waarom we opnieuw kijken/i)).toBeVisible()
    await expect(page.getByText(/wat we dan toetsen/i)).toBeVisible()
    await expect(page.getByText(/eerste stap/i)).toBeVisible()
    await expect(page.getByText(/wat is geprobeerd/i)).toBeVisible()
    await expect(page.getByText(/wat zagen we terug/i)).toBeVisible()
    await expect(page.getByText(/wat is besloten/i)).toBeVisible()
    await expect(page.getByText(/eerder afgerond in deze route|afgerond voor nu|bewust gestopt/i)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open broncampagne' }).last()).toBeVisible()
  })
})
