import { expect, test } from '@playwright/test'

test('aanpak page follows the process-confidence canon', async ({ page }) => {
  await page.goto('/aanpak')

  const heroHeading = page.getByRole('heading', {
    name: /van eerste gesprek tot bruikbare output zonder los implementatietraject/i,
  })
  const fitHeading = page.getByRole('heading', {
    name: /deze pagina helpt zodra de route helder is en u vooral zekerheid zoekt over het traject/i,
  })
  const processHeading = page.getByRole('heading', {
    name: /hoe een verisight-route beweegt van intake naar eerste managementread/i,
  })
  const handoffHeading = page.getByRole('heading', {
    name: /wanneer eerste waarde zichtbaar wordt en wat u daarna in handen heeft/i,
  })
  const includedHeading = page.getByRole('heading', {
    name: /een duidelijke productvorm met vaste output/i,
  })
  const trustHeading = page.getByRole('heading', {
    name: /voorspelbaar genoeg voor planning\. begrensd genoeg voor vertrouwen/i,
  })
  const closingHeading = page.getByRole('heading', {
    name: /vertel kort welke managementvraag nu speelt/i,
  })

  await expect(heroHeading).toBeVisible()
  await expect(fitHeading).toBeVisible()
  await expect(processHeading).toBeVisible()
  await expect(handoffHeading).toBeVisible()
  await expect(includedHeading).toBeVisible()
  await expect(trustHeading).toBeVisible()
  await expect(closingHeading).toBeVisible()

  await expect(page.getByText('Geen losse surveytool', { exact: true })).toBeVisible()
  await expect(
    page.getByText('First value is snel, maar nooit sneller dan de responsbasis toelaat.', { exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.getByText('Dashboard, managementrapport en bestuurlijke handoff', { exact: true }),
  ).toBeVisible()

  const sectionOrder = await Promise.all(
    [fitHeading, processHeading, handoffHeading, includedHeading, trustHeading, closingHeading].map(
      async (locator) => (await locator.boundingBox())?.y ?? 0,
    ),
  )

  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))

  await expect(page.getByLabel(/naam/i)).toBeVisible()
  await expect(page.getByLabel(/werk e-mail/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /verstuur bericht/i })).toBeVisible()
})
