import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

type ActionCenterPilotArtifact = {
  hrOwner: { email: string; password: string }
  followUp?: {
    sourceCampaignId: string
    targetCampaignId: string
    sourceRouteTitle: string
    scopeLabel: string
    sourceActionCenterFocusUrl: string
    targetActionCenterFocusUrl: string
    triggerReason: string
    triggerReasonLabel: string
    manager: {
      email: string
      password: string
      userId: string
      displayName: string
      scopeLabel: string
      scopeValue: string
    }
  }
}

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
const artifact = existsSync(artifactPath)
  ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as ActionCenterPilotArtifact)
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

test.describe('action center route reopen flow', () => {
  test.skip(!artifact, 'Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')

  const pilot = artifact as ActionCenterPilotArtifact

  test('hr starts a same-scope follow-up route and the source route stays historical', async ({ page }) => {
    if (!pilot.followUp) {
      throw new Error('Seed artifact mist followUp-context voor Task 7.')
    }

    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.goto(pilot.followUp.sourceActionCenterFocusUrl)
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(pilot.followUp.sourceActionCenterFocusUrl)}$`))
    await page.getByRole('button', { name: /^Acties/ }).click()

    await expect(page.getByText('Action Center / Acties')).toBeVisible()
    await expect(page.getByText('Afgerond voor nu', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: pilot.followUp.sourceRouteTitle })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Start vervolgroute' })).toBeVisible()
    await expect(page.getByText('Open vanuit deze gesloten route een nieuwe HR-handoff binnen dezelfde afdeling.')).toBeVisible()

    await page.getByLabel('Kies manager').selectOption({ label: pilot.followUp.manager.displayName })
    await page.getByRole('radio', { name: pilot.followUp.triggerReasonLabel, exact: true }).check()
    await page.getByRole('button', { name: 'Start vervolgroute' }).click()

    await expect(page.getByRole('heading', { name: 'Eerste lokale follow-through' })).toBeVisible()
    await expect(page.getByText(pilot.followUp.scopeLabel, { exact: true }).first()).toBeVisible()

    await expect(
      page.getByText('Voor deze doelroute bestaat al een manager response carrier; overschrijven is in V1 niet toegestaan.'),
    ).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Eerste lokale follow-through' })).toBeVisible()
  })
})
