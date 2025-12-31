import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/accessibility',
  fullyParallel: true,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: process.env.A11Y_BASE_URL || 'http://127.0.0.1:4173',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
  },
  webServer: process.env.A11Y_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
