import * as path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import {
  advanceGuidedSelfServeAcceptanceFixture,
  loadGuidedSelfServeAcceptanceFixture,
  type GuidedSelfServeAcceptanceFixture,
} from './guided-self-serve-acceptance.helpers'

const artifactsDir = path.resolve(process.cwd(), '..', '.codex-artifacts')

async function loginAsAcceptanceUser(page: Page, fixture: GuidedSelfServeAcceptanceFixture) {
  await page.goto('/login')
  await page.getByLabel(/e-mailadres/i).fill(fixture.email)
  await page.getByLabel(/wachtwoord/i).fill(fixture.password)
  await page.getByRole('button', { name: /^inloggen$/i }).click()
  await page.waitForURL('**/dashboard')
}

test.describe.serial('first-next-step ux check', () => {
  test.setTimeout(120_000)

  let fixture: GuidedSelfServeAcceptanceFixture | null = null

  test.beforeAll(async () => {
    fixture = await loadGuidedSelfServeAcceptanceFixture()
    await advanceGuidedSelfServeAcceptanceFixture('min_display')
    await advanceGuidedSelfServeAcceptanceFixture('patterns')
  })

  test('keeps home and campaign detail guidance visible, ordered and bounded', async ({ page }) => {
    if (!fixture) {
      throw new Error('Acceptance fixture ontbreekt.')
    }

    await loginAsAcceptanceUser(page, fixture)

    const executionSection = page.getByText(/jouw uitvoerstatus/i).first()
    const firstNextStepHeading = page.getByRole('heading', { name: /van activatie naar eerste managementstap/i })
    const legacyFirstRouteHeading = page.getByRole('heading', { name: /van eerste login naar eerste managementread/i })

    await expect(executionSection).toBeVisible()
    await expect(page.getByText(/guided self-serve - setup journey/i).first()).toBeVisible()
    await expect(page.getByText(/guided self-serve - threshold journey/i).first()).toBeVisible()
    await expect(firstNextStepHeading).toBeVisible()
    await expect(legacyFirstRouteHeading).toHaveCount(0)

    await page.screenshot({
      path: path.join(artifactsDir, 'first-next-step-dashboard-home.png'),
      fullPage: true,
    })

    const thresholdDetailHref = await page.getByRole('link', { name: /open dashboard/i }).first().getAttribute('href')

    if (!thresholdDetailHref) {
      throw new Error('Threshold detail-link ontbreekt op dashboard-home.')
    }

    await page.goto(thresholdDetailHref)

    await expect(page.getByRole('heading', { name: /van vertrekduiding naar managementroute/i })).toBeVisible()
    await expect(page.getByText(/mogelijke vervolgroutes/i).first()).toBeVisible()
    await expect(page.getByText(/geen standaard vervolg/i).first()).toBeVisible()
    await expect(page.getByText(/^ExitScan ritmeroute$/i)).toBeVisible()
    await expect(page.getByText(/^RetentieScan$/i)).toBeVisible()
    await expect(page.getByText(/niet als standaard upsell na exitscan/i).first()).toBeVisible()
    await expect(page.getByText(/named leader/i)).toHaveCount(0)

    await page.screenshot({
      path: path.join(artifactsDir, 'first-next-step-campaign-detail.png'),
      fullPage: true,
    })
  })
})
