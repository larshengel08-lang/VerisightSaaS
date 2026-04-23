import * as path from 'node:path'
import { expect, test } from '@playwright/test'
import {
  advanceGuidedSelfServeAcceptanceFixture,
  loadGuidedSelfServeAcceptanceFixture,
  type GuidedSelfServeAcceptanceFixture,
} from './guided-self-serve-acceptance.helpers'

const fixturesDir = path.resolve(process.cwd(), 'tests', 'fixtures', 'guided-self-serve')
const invalidImportPath = path.join(fixturesDir, 'invalid-import.csv')
const validImportPath = path.join(fixturesDir, 'valid-import.csv')

async function loginAsAcceptanceUser(page: any, fixture: GuidedSelfServeAcceptanceFixture) {
  await page.goto('/login')
  await page.getByLabel(/e-mailadres/i).fill(fixture.email)
  await page.getByLabel(/wachtwoord/i).fill(fixture.password)
  await page.getByRole('button', { name: /^inloggen$/i }).click()
  await page.waitForURL('**/dashboard')
}

test.describe.serial('guided self-serve acceptance', () => {
  let fixture: GuidedSelfServeAcceptanceFixture | null = null

  test.beforeAll(async () => {
    fixture = await loadGuidedSelfServeAcceptanceFixture()
  })

  test('setup journey guides import recovery and explicit invite launch', async ({ page }) => {
    if (!fixture) {
      throw new Error('Acceptance fixture ontbreekt.')
    }

    await loginAsAcceptanceUser(page, fixture)

    await expect(page.getByText(/jouw uitvoerstatus/i).first()).toBeVisible()
    await expect(page.getByText(/deelnemersbestand ontbreekt nog/i).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /open uitvoerflow/i }).first()).toBeVisible()

    await page.goto(`/campaigns/${fixture.setup_campaign_id}`)

    await expect(page.getByRole('heading', { name: /begeleide uitvoerflow/i })).toBeVisible()
    await expect(page.getByText(/deelnemersbestand ontbreekt nog/i).first()).toBeVisible()
    await expect(page.getByText(/dashboard nog niet actief/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf-rapport/i })).toHaveCount(0)

    await page.locator('input[type="file"]').setInputFiles(invalidImportPath)
    await page.getByRole('button', { name: /^bestand controleren$/i }).click()

    await expect(page.getByText(/import validatie vereist/i).first()).toBeVisible()
    await expect(page.getByText(/dit e-mailadres staat dubbel in het bestand/i)).toBeVisible()
    await expect(page.getByText(/valid email address/i)).toBeVisible()

    await page.locator('input[type="file"]').setInputFiles(validImportPath)
    await page.getByLabel(/verstuur direct uitnodigingen na een geslaagde import/i).uncheck()
    await page.getByRole('button', { name: /^bestand controleren$/i }).click()

    await expect(page.getByText(/preview van geldige rijen/i).first()).toBeVisible()
    await expect(page.getByText(/klaar om uit te nodigen/i).first()).toBeVisible()

    await page.getByRole('button', { name: /importeer 2 deelnemers/i }).click()

    await expect(page.getByText(/2 deelnemer\(s\) toegevoegd/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /start uitnodigingen \(2\)/i })).toBeVisible()

    await page.getByRole('button', { name: /start uitnodigingen \(2\)/i }).click()

    await expect(page.getByText(/2 uitnodiging\(en\) gestart/i)).toBeVisible()
    await expect(page.getByText(/responses lopen binnen/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf-rapport/i })).toHaveCount(0)
    await expect(page.getByText(/dashboard nog niet actief/i).first()).toBeVisible()
  })

  test('threshold journey unlocks dashboard first and deeper guidance only at pattern readiness', async ({ page }) => {
    if (!fixture) {
      throw new Error('Acceptance fixture ontbreekt.')
    }

    await loginAsAcceptanceUser(page, fixture)
    await page.goto(`/campaigns/${fixture.threshold_campaign_id}`)

    await expect(page.getByText(/responses lopen binnen/i).first()).toBeVisible()
    await expect(page.getByText(/dashboard nog niet actief/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf-rapport/i })).toHaveCount(0)

    await advanceGuidedSelfServeAcceptanceFixture('min_display')
    await page.reload()

    await expect(page.getByText(/dashboard actief, nog bewust compact/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf-rapport/i }).first()).toBeVisible()
    await expect(page.getByText(/vertrekduiding en managementgesprek/i)).toBeVisible()
    await expect(page.getByText(/verdieping nog dicht/i)).toBeVisible()
    await expect(page.getByText(/nog \d+ responses tot eerste patroonduiding/i).first()).toBeVisible()

    await advanceGuidedSelfServeAcceptanceFixture('patterns')
    await page.reload()

    await expect(page.getByText(/eerste vervolgstap beschikbaar/i).first()).toBeVisible()
    await expect(page.getByText(/verdieping nog dicht/i)).toHaveCount(0)
    await expect(page.getByText(/focusvragen en route-uitvoer worden betekenisvoller zodra het dashboard minstens 10 responses heeft/i)).toHaveCount(0)
    await expect(page.getByText(/van vertrekduiding naar managementroute/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf-rapport/i }).first()).toBeVisible()
  })
})
