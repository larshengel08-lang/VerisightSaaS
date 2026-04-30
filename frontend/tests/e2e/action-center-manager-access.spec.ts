import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

type ManagerPilotArtifact = {
  campaignId: string
  orgId: string
  hrOwner: { email: string; password: string }
  routeContext: { focusItemId: string }
  managers: Array<{ email: string; password: string; scopeLabel: string; scopeType: 'department' | 'item'; scopeValue: string }>
}

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
const artifact = existsSync(artifactPath)
  ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as ManagerPilotArtifact)
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

async function openFocusedRoute(page: import('@playwright/test').Page, focusItemId: string) {
  await page.goto(`/action-center?focus=${encodeURIComponent(focusItemId)}`)
  await expect(page).toHaveURL(new RegExp(`focus=${escapeRegExp(encodeURIComponent(focusItemId))}$`))
  await page.getByRole('button', { name: 'Open focusactie' }).click()
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
}

async function ensureBoundedResponseReady(page: import('@playwright/test').Page) {
  const saveButton = page.getByRole('button', { name: 'Managerreactie opslaan', exact: true })
  if (!(await saveButton.count())) {
    return
  }
  await expect(saveButton).toBeVisible()

  await page.getByRole('button', { name: 'Inplannen', exact: true }).click()
  await page.getByLabel('Wat is nu de bounded reactie?').fill(
    'We bespreken dit maandag in het teamoverleg en scherpen daarna de eerstvolgende stap aan.',
  )
  await page.getByLabel('Wanneer reviewen we dit?').fill('2026-05-18')
  await page.getByRole('checkbox').check()
  await page.getByLabel('Thema').selectOption('leadership')
  await page.getByLabel('Wat ga je concreet doen?').fill(
    'Plan een kort teamgesprek over feedbackritme en leg een vaste terugkoppeling vast.',
  )
  await page.getByLabel('Wat moet dit zichtbaar maken?').fill(
    'Binnen twee weken moet duidelijk worden of feedbackafspraken consistenter terugkomen in het team.',
  )
  await saveButton.click()
  await expect(page.getByRole('button', { name: 'Actie toevoegen', exact: true })).toBeVisible()
}

test.describe('action center manager access', () => {
  test.skip(!artifact, 'Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')

  const pilot = artifact as ManagerPilotArtifact

  test('hr owner keeps both modules inside one shared shell', async ({ page }) => {
    await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
    await page.waitForURL(/\/dashboard$/)

    await expect(page.getByRole('navigation').getByRole('link', { name: 'Action Center' })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Rapporten' })).toBeVisible()

    await page.goto('/action-center')
    await expect(page.getByRole('heading', { name: 'Action Center', exact: true })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Managers', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Managers en toewijzing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open managers' })).toBeVisible()
  })

  test('manager assignee lands on action center only and gets denied on insights routes', async ({ page }) => {
    const manager = pilot.managers[0]
    await login(page, manager.email, manager.password)
    await page.waitForURL(/\/action-center$/)

    await expect(page.getByRole('navigation').getByRole('link', { name: 'Action Center' })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Reports' })).toHaveCount(0)
    await expect(page.locator('aside').getByText('Overview')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open focusactie' })).toBeVisible()
    await expect(page.locator('main').getByText(manager.scopeLabel, { exact: true }).first()).toBeVisible()

    await openFocusedRoute(page, pilot.routeContext.focusItemId)
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
    const managerResponseSaveCount = await page.getByRole('button', { name: 'Managerreactie opslaan', exact: true }).count()
    const routeActionAddCount = await page.getByRole('button', { name: 'Actie toevoegen', exact: true }).count()
    expect(managerResponseSaveCount + routeActionAddCount).toBeGreaterThan(0)

    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: 'Je ziet hier geen rapporten' })).toBeVisible()

    await page.goto(`/campaigns/${pilot.campaignId}`)
    await expect(page.getByRole('heading', { name: 'Je ziet hier geen campagnedetail' })).toBeVisible()
  })

  test('manager can save a bounded first response and see the route transition persist', async ({ page }) => {
    const manager = pilot.managers[0]
    await login(page, manager.email, manager.password)
    await page.waitForURL(/\/action-center$/)

    await openFocusedRoute(page, pilot.routeContext.focusItemId)
    await ensureBoundedResponseReady(page)
    await expect(page.getByRole('button', { name: 'Actie toevoegen', exact: true })).toBeVisible()
    const savedRouteTitle = (await page.getByRole('heading', { level: 2 }).textContent())?.trim() ?? ''

    await openFocusedRoute(page, pilot.routeContext.focusItemId)
    await expect(page.getByRole('heading', { name: new RegExp(escapeRegExp(savedRouteTitle), 'i') })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Actie toevoegen', exact: true })).toBeVisible()
  })
})
