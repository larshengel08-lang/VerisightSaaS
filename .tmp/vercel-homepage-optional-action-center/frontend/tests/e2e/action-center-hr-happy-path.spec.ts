import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

type HrPilotArtifact = {
  campaignId: string
  hrOwner: { email: string; password: string }
  routeContext: {
    campaignDetailUrl: string
    actionCenterUrl: string
    actionCenterFocusUrl: string
  }
}

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
const artifact = existsSync(artifactPath)
  ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as HrPilotArtifact)
  : null

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

test.describe('action center hr happy path', () => {
  test.skip(!artifact, 'Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')

  const pilot = artifact as HrPilotArtifact

  test('shows one canonical HR route across overview, reports, campaign detail, and Action Center detail', async ({
    page,
  }) => {
    const routeContext = {
      reportsUrl: '/reports',
      campaignDetailUrl: pilot.routeContext.campaignDetailUrl,
      actionCenterUrl: pilot.routeContext.actionCenterUrl,
      actionCenterFocusUrl: pilot.routeContext.actionCenterFocusUrl,
    }

    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/)

    await expect(page.getByRole('heading', { name: /overzicht/i })).toBeVisible()
    await expect(page.getByText('Wat nu leesbaar is', { exact: true })).toBeVisible()
    await expect(page.locator(`a[href="${routeContext.campaignDetailUrl}"]`).first()).toBeVisible()

    await page.goto(routeContext.reportsUrl)
    await expect(page.getByText('Rapportbibliotheek')).toBeVisible()
    await expect(page.locator(`a[href="${routeContext.actionCenterUrl}"]`).first()).toBeVisible()

    await page.goto(routeContext.campaignDetailUrl)
    await expect(page).toHaveURL(new RegExp(`${pilot.campaignId}$`))
    await expect(page.getByRole('link', { name: /action center/i }).first()).toBeVisible()

    await page.goto(routeContext.actionCenterFocusUrl)
    await expect(page).toHaveURL(new RegExp(`focus=${escapeRegExp(routeContext.actionCenterFocusUrl.split('focus=')[1] ?? '')}$`))
    await expect(page.getByRole('heading', { name: 'Action Center', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Open focusactie' }).click()
    await expect(page.getByText(/waarom dit nu speelt/i)).toBeVisible()
    await expect(page.getByText(/laatste beslissing|nog geen expliciete reviewbeslissing/i)).toBeVisible()
    await expect(page.getByText(/actievoortgang/i)).toBeVisible()
    await expect(page.getByText('Hierna', { exact: true })).toBeVisible()
    await expect(page.getByText('Verwacht effect', { exact: true })).toBeVisible()
    await expect(page.getByText('Wat is geprobeerd', { exact: true })).toBeVisible()
    await expect(page.getByText(/nog geen opeenvolgende resultaatmomenten zichtbaar/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /eerste managerstap|eerste concrete managerstap|eerste managerstap staat vast|eerste lokale follow-through/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Managerreactie opslaan' })).toHaveCount(0)
    await expect(page.getByText(/nog geen expliciete beslismomenten zichtbaar|afgerond voor nu|bewust gestopt/i)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open broncampagne' }).last()).toBeVisible()
  })
})
