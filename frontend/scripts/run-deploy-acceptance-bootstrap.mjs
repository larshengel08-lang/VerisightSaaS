import path from 'node:path'

import {
  buildAcceptanceConfig,
  buildRunId,
  createArtifactDirectory,
  createBrowserAndLogin,
  createOrganizationViaBackend,
  createSupabaseAdmin,
  ensureAdminProfile,
  ensureAuthUser,
  ensureOrgMembership,
  findOrganizationBySlug,
  writeJson,
  writeText,
} from './deploy-acceptance-shared.mjs'

async function main() {
  const config = buildAcceptanceConfig()
  const admin = createSupabaseAdmin(config)
  const runId = buildRunId('bootstrap')
  const artifactsDir = createArtifactDirectory(config, 'bootstrap', runId)
  const startedAt = new Date().toISOString()

  if (!config.backendAdminToken) {
    throw new Error('BACKEND_ADMIN_TOKEN ontbreekt voor bootstrap.')
  }
  if (!config.acceptanceAdminEmail || !config.acceptanceAdminPassword) {
    throw new Error('ACCEPTANCE_ADMIN_EMAIL of ACCEPTANCE_ADMIN_PASSWORD ontbreekt.')
  }
  if (!config.acceptanceCustomerEmail || !config.acceptanceCustomerPassword) {
    throw new Error('ACCEPTANCE_CUSTOMER_EMAIL of ACCEPTANCE_CUSTOMER_PASSWORD ontbreekt.')
  }

  const acceptanceAdminUser = await ensureAuthUser(admin, {
    email: config.acceptanceAdminEmail,
    password: config.acceptanceAdminPassword,
    fullName: 'Verisight Acceptance Admin',
  })
  await ensureAdminProfile(admin, acceptanceAdminUser.id)

  const acceptanceCustomerUser = await ensureAuthUser(admin, {
    email: config.acceptanceCustomerEmail,
    password: config.acceptanceCustomerPassword,
    fullName: 'Verisight Acceptance Customer',
  })

  let acceptanceOrg = await findOrganizationBySlug(admin, config.acceptanceOrgSlug)
  if (!acceptanceOrg) {
    await createOrganizationViaBackend(config, {
      name: config.acceptanceOrgName,
      slug: config.acceptanceOrgSlug,
      contactEmail: config.acceptanceCustomerEmail,
    })
    acceptanceOrg = await findOrganizationBySlug(admin, config.acceptanceOrgSlug)
  }

  if (!acceptanceOrg?.id) {
    throw new Error('Acceptance-org kon niet worden gevonden of aangemaakt.')
  }

  await ensureOrgMembership(admin, {
    orgId: acceptanceOrg.id,
    userId: acceptanceAdminUser.id,
    role: 'owner',
  })
  await ensureOrgMembership(admin, {
    orgId: acceptanceOrg.id,
    userId: acceptanceCustomerUser.id,
    role: config.acceptanceCustomerRole,
  })

  const { browser: adminBrowser, page: adminPage } = await createBrowserAndLogin({
    frontendUrl: config.frontendUrl,
    email: config.acceptanceAdminEmail,
    password: config.acceptanceAdminPassword,
  })
  await adminPage.goto(`${config.frontendUrl}/beheer`, { waitUntil: 'networkidle' })
  await adminPage.screenshot({ path: path.join(artifactsDir, 'bootstrap-admin.png'), fullPage: true })
  await adminBrowser.close()

  const { browser: customerBrowser, page: customerPage } = await createBrowserAndLogin({
    frontendUrl: config.frontendUrl,
    email: config.acceptanceCustomerEmail,
    password: config.acceptanceCustomerPassword,
  })
  await customerPage.goto(`${config.frontendUrl}/dashboard`, { waitUntil: 'networkidle' })
  await customerPage.screenshot({ path: path.join(artifactsDir, 'bootstrap-customer.png'), fullPage: true })
  const customerText = await customerPage.textContent('body')
  await customerBrowser.close()

  const manifest = {
    kind: 'bootstrap',
    runId,
    startedAt,
    completedAt: new Date().toISOString(),
    acceptanceOrgId: acceptanceOrg.id,
    acceptanceOrgSlug: acceptanceOrg.slug,
    acceptanceAdminUserId: acceptanceAdminUser.id,
    acceptanceCustomerUserId: acceptanceCustomerUser.id,
  }

  writeJson(path.join(artifactsDir, 'run-manifest.json'), manifest)
  writeText(
    path.join(artifactsDir, 'audit.md'),
    `# Verisight bootstrap acceptance\n\n` +
      `Run ID: \`${runId}\`\n` +
      `Org: \`${acceptanceOrg.slug}\`\n\n` +
      `## Resultaat\n` +
      `- acceptance-admin user staat klaar\n` +
      `- acceptance-klant user staat klaar\n` +
      `- acceptance-org bestaat\n` +
      `- memberships zijn gekoppeld\n` +
      `- admin-login is browsermatig gevalideerd\n` +
      `- klant-login is browsermatig gevalideerd\n\n` +
      `## Buyer-facing check\n` +
      `- dashboardtekst bevat acceptance-context: ${String(customerText ?? '').includes(config.acceptanceOrgName) ? 'ja' : 'niet expliciet'}\n`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
