import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
const artifact = existsSync(artifactPath)
  ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as {
      campaignId: string
      hrOwner: { email: string; password: string }
      managers: Array<{
        email: string
        password: string
        scopeLabel: string
        displayName?: string
        userId?: string
      }>
      followUp?: {
        targetCampaignId: string
        targetActionCenterFocusUrl: string
        manager: {
          email: string
          password: string
          scopeLabel: string
          displayName: string
          userId: string
        }
      }
    })
  : null

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test.describe('action center manager access', () => {
  test.skip(!artifact, 'Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')

  const pilot = artifact as
    | {
        campaignId: string
        hrOwner: { email: string; password: string }
        managers: Array<{
          email: string
          password: string
          scopeLabel: string
          displayName?: string
          userId?: string
        }>
        followUp?: {
          targetCampaignId: string
          targetActionCenterFocusUrl: string
          manager: {
            email: string
            password: string
            scopeLabel: string
            displayName: string
            userId: string
          }
        }
      }
    | null

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('E-mailadres').fill(email)
  await page.getByLabel('Wachtwoord').fill(password)
  await Promise.all([
    page.waitForURL(/\/(dashboard|action-center)(?:\?.*)?$/),
    page.getByRole('button', { name: 'Inloggen' }).click(),
  ])
}

  test('hr owner keeps both modules inside one shared shell', async ({ page }) => {
    if (!pilot) {
      throw new Error('Seed artifact ontbreekt voor manager access test.')
    }

    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.waitForURL(/\/dashboard$/)

    await expect(page.getByRole('navigation').getByRole('link', { name: 'Action Center' })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Rapporten' })).toBeVisible()

    await page.goto('/action-center', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Action Center', exact: true })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Managers', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Managers en toewijzing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open managers' })).toBeVisible()
  })

  test('manager assignee lands on action center only and gets denied on insights routes', async ({ page }) => {
    if (!pilot) {
      throw new Error('Seed artifact ontbreekt voor manager access test.')
    }

    const followUpManager = pilot.followUp?.manager ?? pilot.managers[0]
    const targetCampaignId = pilot.followUp?.targetCampaignId ?? pilot.campaignId
    const manager = followUpManager
    await login(page, manager.email, manager.password)
    await page.waitForURL(/\/action-center$/)

    await expect(page.getByRole('navigation').getByRole('link', { name: 'Action Center' })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Reports' })).toHaveCount(0)
    await expect(page.locator('aside').getByText('Overview')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open focusactie' })).toBeVisible()
    await expect(page.locator('main').getByText(manager.scopeLabel, { exact: true }).first()).toBeVisible()

    await page.getByRole('button', { name: 'Open focusactie' }).click()
    await expect(page.getByRole('heading', { name: /route staat klaar voor eerste reactie|eerste lokale follow-through/i })).toBeVisible()
    await expect(page.getByText('Bevestigen', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Aanscherpen', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Inplannen', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Begrenzen / volgen', { exact: true }).first()).toBeVisible()

    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: 'Je ziet hier geen rapporten' })).toBeVisible()

    await page.goto(`/campaigns/${targetCampaignId}`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Je ziet hier geen campagnedetail' })).toBeVisible()
  })

  test('manager can save a bounded first response and see the route transition persist', async ({ page }) => {
    if (!pilot) {
      throw new Error('Seed artifact ontbreekt voor manager access test.')
    }

    const followUpManager = pilot.followUp?.manager ?? pilot.managers[0]
    const targetCampaignId = pilot.followUp?.targetCampaignId ?? pilot.campaignId
    const targetFocusUrl = pilot.followUp?.targetActionCenterFocusUrl ?? `/action-center?focus=${targetCampaignId}`
    const manager = followUpManager
    const focusUrl = targetFocusUrl
    await login(page, manager.email, manager.password)
    await page.waitForURL(/\/action-center$/)

    await page.goto(focusUrl)
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(focusUrl)}$`))
    await page.getByRole('button', { name: 'Open focusactie' }).click()
    await expect(page.getByRole('heading', { name: /route staat klaar voor eerste reactie|eerste lokale follow-through/i })).toBeVisible()

    await page.getByRole('button', { name: 'Inplannen', exact: true }).click()
    await page.getByLabel('Wat is nu de bounded reactie?').fill('We bespreken dit maandag in het teamoverleg en scherpen daarna de eerstvolgende stap aan.')
    await page.getByLabel('Wanneer reviewen we dit?').fill('2026-05-18')
    await page.getByRole('checkbox').check()
    await page.getByLabel('Thema').selectOption('leadership')
    await page.getByLabel('Wat ga je concreet doen?').fill('Plan een kort teamgesprek over feedbackritme en leg een vaste terugkoppeling vast.')
    await page.getByLabel('Wat moet dit zichtbaar maken?').fill('Binnen twee weken moet duidelijk worden of feedbackafspraken consistenter terugkomen in het team.')

    await page.getByRole('button', { name: 'Managerreactie opslaan' }).click()

    await expect(page.getByRole('heading', { name: 'Eerste lokale follow-through' })).toBeVisible()
    await expect(page.getByText('Inplannen', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('18 mei 2026')).toBeVisible()
    await expect(page.getByLabel('Thema')).toHaveValue('leadership')
    await expect(page.getByLabel('Wat ga je concreet doen?')).toHaveValue(
      'Plan een kort teamgesprek over feedbackritme en leg een vaste terugkoppeling vast.',
    )
    await expect(page.getByLabel('Wat moet dit zichtbaar maken?')).toHaveValue(
      'Binnen twee weken moet duidelijk worden of feedbackafspraken consistenter terugkomen in het team.',
    )
    const savedRouteTitle = (await page.getByRole('heading', { level: 2 }).textContent())?.trim() ?? ''

    await page.goto(focusUrl)
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(focusUrl)}$`))
    await page
      .getByRole('button', { name: new RegExp(escapeRegExp(savedRouteTitle), 'i') })
      .first()
      .click()
    await expect(page.getByRole('heading', { name: 'Eerste lokale follow-through' })).toBeVisible()
    await expect(page.getByText('Inplannen', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('18 mei 2026')).toBeVisible()
    await expect(page.getByLabel('Thema')).toHaveValue('leadership')
    await expect(page.getByLabel('Wat ga je concreet doen?')).toHaveValue(
      'Plan een kort teamgesprek over feedbackritme en leg een vaste terugkoppeling vast.',
    )
  })
})
