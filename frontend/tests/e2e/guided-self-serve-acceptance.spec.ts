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

  test('setup journey keeps invite launch behind explicit pre-launch control', async ({ page }) => {
    if (!fixture) {
      throw new Error('Acceptance fixture ontbreekt.')
    }

    await loginAsAcceptanceUser(page, fixture)

    await expect(page.getByText(/jouw uitvoerstatus/i).first()).toBeVisible()
    await expect(page.getByText(/deelnemersbestand ontbreekt nog/i).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /open uitvoerflow/i }).first()).toBeVisible()

    await page.goto(`/campaigns/${fixture.setup_campaign_id}`)

    await expect(page.getByText(/begeleide uitvoerflow/i).first()).toBeVisible()
    await expect(page.getByText(/deelnemersbestand ontbreekt nog/i).first()).toBeVisible()
    await expect(page.getByText(/dashboard nog niet actief/i).first()).toBeVisible()
    await expect(page.getByText(/pre-launch overzicht/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf-rapport/i })).toHaveCount(0)

    await page.locator('input[type="file"]').setInputFiles(invalidImportPath)
    await page.getByRole('button', { name: /^bestand controleren$/i }).click()

    await expect(page.getByText(/import validatie vereist/i).first()).toBeVisible()
    await expect(page.getByText(/corrigeer eerst deze rijen/i)).toBeVisible()
    await expect(page.getByText(/dit e-mailadres staat dubbel in het bestand/i)).toBeVisible()
    await expect(page.getByText(/e-mailadres is ongeldig/i)).toBeVisible()

    await page.locator('input[type="file"]').setInputFiles(validImportPath)
    await page.getByRole('button', { name: /^bestand controleren$/i }).click()

    await expect(page.getByText(/preview van geldige rijen/i).first()).toBeVisible()
    await expect(page.getByText(/import klaar voor start/i).first()).toBeVisible()

    await page.getByRole('button', { name: /importeer 5 deelnemers/i }).click()

    await expect(page.getByText(/5 deelnemer\(s\) toegevoegd/i)).toBeVisible({ timeout: 15000 })
    await page.reload()
    await expect(page.getByRole('button', { name: /start uitnodigingen \(5\)/i })).toBeDisabled()

    await page.getByLabel(/formele startdatum/i).fill('2026-05-01')
    await page.getByLabel(/afzendernaam/i).fill('HR Team Noord')
    await page.getByLabel(/korte introcontext/i).fill('We kondigen dit intern alvast kort aan.')
    await page.getByLabel(/korte slotcontext/i).fill('Vragen over planning kun je aan HR stellen.')
    await page.getByRole('button', { name: /sla launchinstellingen op/i }).click()

    await expect(page.getByText(/1 mei 2026/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/we kondigen dit intern alvast kort aan/i).first()).toBeVisible({ timeout: 15000 })

    await page.getByLabel(/ik heb timing, deelnemerscommunicatie en reminderinstellingen gecontroleerd/i).check()
    await page.getByRole('button', { name: /bevestig launch/i }).click()

    await expect(page.getByText(/launch bevestigd op/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: /start uitnodigingen \(5\)/i })).toBeEnabled()

    await page.getByRole('button', { name: /start uitnodigingen \(5\)/i }).click()

    await expect(page.getByText(/5 uitnodiging\(en\) gestart/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/respons loopt/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: /pdf-rapport/i })).toHaveCount(0)
    await expect(page.getByText(/dashboard nog niet actief/i).first()).toBeVisible()
  })

  test('threshold journey unlocks dashboard first and deeper guidance only at pattern readiness', async ({ page }) => {
    if (!fixture) {
      throw new Error('Acceptance fixture ontbreekt.')
    }

    await loginAsAcceptanceUser(page, fixture)
    await page.goto(`/campaigns/${fixture.threshold_campaign_id}`)

    await expect(page.getByText(/respons loopt/i).first()).toBeVisible()
    await expect(page.getByText(/dashboard nog niet actief/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf-rapport/i })).toHaveCount(0)

    await advanceGuidedSelfServeAcceptanceFixture('min_display')
    await page.reload()

    await expect(page.getByText(/dashboard actief, nog bewust compact/i).first()).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByRole('button', { name: /pdf-rapport/i }).first()).toBeVisible()
    await expect(page.getByText(/vertrekduiding en managementgesprek/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/verdiepende analyse wordt zichtbaar vanaf 10 ingevulde responses/i)).toBeVisible({
      timeout: 15000,
    })

    await advanceGuidedSelfServeAcceptanceFixture('patterns')
    await page.reload()

    await expect(page.getByText(/eerste vervolgstap beschikbaar/i).first()).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText(/verdiepende analyse wordt zichtbaar vanaf 10 ingevulde responses/i)).toHaveCount(0)
    await expect(page.getByText(/focusvragen en route-uitvoer worden betekenisvoller zodra het dashboard minstens 10 responses heeft/i)).toHaveCount(0)
    await expect(page.getByText(/van vertrekduiding naar managementroute/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: /pdf-rapport/i }).first()).toBeVisible()
  })
})
