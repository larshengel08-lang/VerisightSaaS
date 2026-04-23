import { defineConfig, devices } from '@playwright/test'

const port = process.env.PLAYWRIGHT_PORT ?? '3002'
const baseURL = `http://127.0.0.1:${port}`
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const acceptanceMode = process.env.VERISIGHT_ACCEPTANCE_MODE
const frontendRuntime = process.env.VERISIGHT_ACCEPTANCE_FRONTEND_RUNTIME === 'dev' ? 'dev' : 'start'
const webServerCommand =
  frontendRuntime === 'dev'
    ? `${npmCommand} run dev -- --port ${port}`
    : `${npmCommand} run build && ${npmCommand} run start -- --port ${port}`
const reuseExistingServer =
  acceptanceMode === 'local'
    ? false
    : !process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer,
    timeout: frontendRuntime === 'dev' ? 180 * 1000 : 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
