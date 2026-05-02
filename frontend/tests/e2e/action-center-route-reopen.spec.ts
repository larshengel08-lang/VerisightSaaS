import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

type ActionCenterPilotArtifact = {
  hrOwner: { email: string; password: string }
  followUp?: {
    sourceCampaignId: string
    targetCampaignId: string
    sourceRouteTitle: string
    targetRouteTitle: string
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
const seedScriptPath = path.join(process.cwd(), 'scripts', 'seed-action-center-manager-pilot.mjs')

function readArtifact() {
  return existsSync(artifactPath)
    ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as ActionCenterPilotArtifact)
    : null
}

function reseedPilotArtifact() {
  if (!existsSync(seedScriptPath)) {
    throw new Error(`Seed script ontbreekt op ${seedScriptPath}.`)
  }

  execFileSync(process.execPath, [seedScriptPath], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
}

async function expectFocusUrl(page: import('@playwright/test').Page, relativeUrl: string) {
  const expected = new URL(relativeUrl, 'http://127.0.0.1')
  await expect
    .poll(() => {
      const current = new URL(page.url())
      return {
        pathname: current.pathname,
        focus: current.searchParams.get('focus'),
      }
    })
    .toEqual({
      pathname: expected.pathname,
      focus: expected.searchParams.get('focus'),
    })
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
  test('hr can start a follow-up route and manager sees the same direct lineage context', async ({ page }) => {
    reseedPilotArtifact()

    const pilot = readArtifact()
    if (!pilot) {
      throw new Error('Seeded pilot artifact ontbreekt na reseed.')
    }

    if (!pilot.followUp) {
      throw new Error('Seed artifact mist followUp-context voor Task 7.')
    }

    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.goto(pilot.followUp.sourceActionCenterFocusUrl)
    await expectFocusUrl(page, pilot.followUp.sourceActionCenterFocusUrl)
    await page.getByRole('button', { name: /^Acties/ }).click()

    await expect(page.getByText('Action Center / Acties')).toBeVisible()
    await expect(page.getByRole('heading', { name: pilot.followUp.sourceRouteTitle })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Start vervolgroute' })).toBeVisible()
    await page.getByLabel('Kies manager').selectOption({ value: pilot.followUp.manager.userId })
    await page.getByRole('radio', { name: pilot.followUp.triggerReasonLabel, exact: true }).check()
    const followUpResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/action-center-route-follow-ups') && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Start vervolgroute', exact: true }).click()
    const followUpResponse = await followUpResponsePromise
    expect(followUpResponse.status()).toBe(201)

    await expectFocusUrl(page, pilot.followUp.targetActionCenterFocusUrl)
    await expect(page.getByRole('heading', { name: pilot.followUp.targetRouteTitle })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Vervolg op eerdere route', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Vervolg op eerdere route', exact: true }).click()
    await expectFocusUrl(page, pilot.followUp.sourceActionCenterFocusUrl)
    await expect(page.getByRole('heading', { name: pilot.followUp.sourceRouteTitle })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Later opgevolgd', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Later opgevolgd', exact: true }).click()
    await expectFocusUrl(page, pilot.followUp.targetActionCenterFocusUrl)
    await expect(page.getByRole('heading', { name: pilot.followUp.targetRouteTitle })).toBeVisible()

    await page.getByRole('button', { name: 'Uitloggen' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await login(page, pilot.followUp.manager.email, pilot.followUp.manager.password)
    await page.goto(pilot.followUp.targetActionCenterFocusUrl)
    await expectFocusUrl(page, pilot.followUp.targetActionCenterFocusUrl)
    await page.getByRole('button', { name: /^Acties/ }).click()

    await expect(page.getByRole('heading', { name: pilot.followUp.targetRouteTitle })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Vervolg op eerdere route', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Vervolg op eerdere route', exact: true }).click()
    await expectFocusUrl(page, pilot.followUp.sourceActionCenterFocusUrl)
    await expect(page.getByRole('heading', { name: pilot.followUp.sourceRouteTitle })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Later opgevolgd', exact: true })).toBeVisible()
  })
})
