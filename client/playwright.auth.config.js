import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/auth',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: process.env.AUTH_BASE_URL || 'http://127.0.0.1:3000',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
  },
})
