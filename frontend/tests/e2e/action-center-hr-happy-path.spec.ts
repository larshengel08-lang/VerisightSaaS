import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

type HrPilotArtifact = {
  campaignId: string
  hrOwner: { email: string; password: string }
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
    const routeContext = {
      reportsUrl: '/reports',
      campaignDetailUrl: `/campaigns/${pilot.campaignId}`,
      actionCenterUrl: '/action-center',
      actionCenterFocusUrl: `/action-center?focus=${pilot.campaignId}`,
    }

    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/)

    await expect(page.getByRole('heading', { name: /overzicht/i })).toBeVisible()
    await expect(page.getByText('Wat nu leesbaar is')).toBeVisible()
    await expect(page.locator(`a[href="${routeContext.campaignDetailUrl}"]`).first()).toBeVisible()

    await page.goto(routeContext.reportsUrl)
    await expect(page.getByText('Rapportbibliotheek')).toBeVisible()
    await expect(page.locator(`a[href="${routeContext.actionCenterUrl}"]`).first()).toBeVisible()

    await page.goto(routeContext.campaignDetailUrl)
    await expect(page).toHaveURL(new RegExp(`${pilot.campaignId}$`))
    await expect(page.locator(`a[href="${routeContext.actionCenterFocusUrl}"]`).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /open in action center/i }).first()).toBeVisible()

    await page.goto(routeContext.actionCenterFocusUrl)
    await expect(page).toHaveURL(new RegExp(`focus=${pilot.campaignId}$`))
    await expect(page.getByRole('heading', { name: 'Action Center', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Open focusactie' }).click()
    await expect(page.getByText(/waarom dit nu speelt/i)).toBeVisible()
    await expect(page.getByText(/laatste beslissing|nog geen expliciete reviewbeslissing/i)).toBeVisible()
    await expect(page.getByText(/huidige stap/i)).toBeVisible()
    await expect(page.getByText(/wat is geprobeerd|nog geen opeenvolgende resultaatmomenten zichtbaar/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /route staat klaar voor eerste reactie|eerste lokale follow-through/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Managerreactie opslaan' })).toHaveCount(0)
    await expect(page.getByText(/eerder afgerond in deze route|afgerond voor nu|bewust gestopt/i)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open broncampagne' }).last()).toBeVisible()
  })
})
