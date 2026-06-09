import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

type RouteActionPilotArtifact = {
  campaignId: string
  orgId: string
  routeContext: { focusItemId: string }
  hrOwner: { email: string; password: string }
  managers: Array<{ email: string; password: string; scopeLabel: string; scopeType: 'department' | 'item'; scopeValue: string }>
}

const artifactPath = path.join(process.cwd(), 'tests', 'e2e', '.action-center-pilot.json')
const artifact = existsSync(artifactPath)
  ? (JSON.parse(readFileSync(artifactPath, 'utf8')) as RouteActionPilotArtifact)
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function openFocusedRoute(page: import('@playwright/test').Page, focusItemId: string) {
  await page.goto(`/action-center?focus=${encodeURIComponent(focusItemId)}`)
  await expect(page).toHaveURL(new RegExp(`focus=${escapeRegExp(encodeURIComponent(focusItemId))}$`))
  await page.getByRole('button', { name: 'Open focusactie' }).click()
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
}

async function ensureManagerResponseExists(page: import('@playwright/test').Page) {
  const saveButton = page.getByRole('button', { name: 'Managerreactie opslaan', exact: true })
  if (!(await saveButton.count())) {
    return
  }
  await expect(saveButton).toBeVisible()
  await page.getByRole('button', { name: 'Inplannen', exact: true }).click()
  await page.getByLabel('Wat is nu de bounded reactie?').fill(
    'We zetten deze route om naar twee compacte lokale acties met elk een eigen reviewmoment.',
  )
  await page.getByLabel('Wanneer reviewen we dit?').fill('2026-05-18')
  await saveButton.click()
  await expect(page.getByRole('button', { name: 'Actie toevoegen', exact: true })).toBeVisible()
}

function routeActionEditor(page: import('@playwright/test').Page) {
  return page
    .locator('form')
    .filter({ has: page.getByRole('heading', { name: 'Actie toevoegen', exact: true }) })
    .first()
}

async function submitRouteAction(page: import('@playwright/test').Page) {
  const editor = routeActionEditor(page)
  await editor.evaluate((element) => {
    element.scrollIntoView({ block: 'center' })
  })
  await expect(editor.getByRole('button', { name: 'Actie toevoegen', exact: true })).toBeVisible()
  await editor.evaluate((form) => {
    ;(form as HTMLFormElement).requestSubmit()
  })
}

test.describe('action center route action cards', () => {
  test.skip(!artifact, 'Seeded pilot artifact ontbreekt. Draai eerst scripts/seed-action-center-manager-pilot.mjs.')

  const pilot = artifact as RouteActionPilotArtifact

  test('manager can add multiple themed actions under one route and save a per-action review', async ({ page }) => {
    const manager = pilot.managers[0]
    const suffix = Date.now().toString().slice(-6)
    const firstAction = `Plan deze week een gericht teamgesprek over leiderschapsfeedback ${suffix}.`
    const secondAction = `Leg deze week een gericht groeigesprek vast in het teamoverleg ${suffix}.`
    const reviewObservation = `Het team noemt groei explicieter sinds de tweede actie ${suffix}.`

    await login(page, manager.email, manager.password)
    await page.waitForURL(/\/action-center$/)

    await openFocusedRoute(page, pilot.routeContext.focusItemId)
    await ensureManagerResponseExists(page)

    await page.getByRole('button', { name: 'Actie toevoegen', exact: true }).click()
    await routeActionEditor(page).getByLabel('Thema').selectOption('leadership')
    await routeActionEditor(page).getByLabel('Wanneer reviewen we dit?').fill('2026-05-15')
    await routeActionEditor(page).getByLabel('Wat ga je doen?').fill(firstAction)
    await routeActionEditor(page).getByLabel('Wat moet dit zichtbaar maken?').fill(
      `Binnen twee weken moet zichtbaar zijn of leiderschapsfrictie kleiner wordt in dit team ${suffix}.`,
    )
    await expect(routeActionEditor(page).getByLabel('Wanneer reviewen we dit?')).toHaveValue('2026-05-15')
    await expect(routeActionEditor(page).getByLabel('Wat ga je doen?')).toHaveValue(firstAction)
    await expect(routeActionEditor(page).getByLabel('Wat moet dit zichtbaar maken?')).toHaveValue(
      `Binnen twee weken moet zichtbaar zijn of leiderschapsfrictie kleiner wordt in dit team ${suffix}.`,
    )
    await submitRouteAction(page)

    await expect(page.getByText(firstAction)).toBeVisible()
    await expect(page.getByText('Review 15 mei 2026')).toBeVisible()

    await page.getByRole('button', { name: 'Actie toevoegen', exact: true }).click()
    await routeActionEditor(page).getByLabel('Thema').selectOption('growth')
    await routeActionEditor(page).getByLabel('Wanneer reviewen we dit?').fill('2026-05-20')
    await routeActionEditor(page).getByLabel('Wat ga je doen?').fill(secondAction)
    await routeActionEditor(page).getByLabel('Wat moet dit zichtbaar maken?').fill(
      `Binnen twee weken moet zichtbaar zijn of groeiperspectief duidelijker terugkomt in dit team ${suffix}.`,
    )
    await expect(routeActionEditor(page).getByLabel('Wanneer reviewen we dit?')).toHaveValue('2026-05-20')
    await expect(routeActionEditor(page).getByLabel('Wat ga je doen?')).toHaveValue(secondAction)
    await expect(routeActionEditor(page).getByLabel('Wat moet dit zichtbaar maken?')).toHaveValue(
      `Binnen twee weken moet zichtbaar zijn of groeiperspectief duidelijker terugkomt in dit team ${suffix}.`,
    )
    await submitRouteAction(page)

    await expect(page.getByText(secondAction)).toBeVisible()
    await expect(page.getByText('Review 20 mei 2026')).toBeVisible()

    await page.getByRole('button', { name: 'Review toevoegen', exact: true }).first().click()
    await page.getByLabel('Wat zagen we terug?').fill(reviewObservation)
    await page.getByLabel('Wat betekent dit?').selectOption('effect-zichtbaar')
    await page.getByLabel('Follow-upnotitie').fill('Nog een week monitoren en dan afronden.')
    await page.getByRole('button', { name: 'Review opslaan', exact: true }).click()

    const reviewedActionCard = page
      .getByText(firstAction)
      .locator('xpath=ancestor::div[contains(@class, "rounded-[18px]")][1]')

    await expect(reviewedActionCard.getByText(reviewObservation)).toBeVisible()
    await expect(reviewedActionCard.getByRole('button', { name: 'Review toevoegen', exact: true })).toHaveCount(0)

    await openFocusedRoute(page, pilot.routeContext.focusItemId)
    const reopenedReviewedActionCard = page
      .getByText(firstAction)
      .locator('xpath=ancestor::div[contains(@class, "rounded-[18px]")][1]')

    await expect(reopenedReviewedActionCard).toBeVisible()
    await expect(page.getByText(secondAction)).toBeVisible()
    await expect(reopenedReviewedActionCard.getByText(reviewObservation)).toBeVisible()
    await expect(reopenedReviewedActionCard.getByRole('button', { name: 'Review toevoegen', exact: true })).toHaveCount(0)
  })
})
