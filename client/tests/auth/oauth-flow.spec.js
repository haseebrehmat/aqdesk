import { expect, test } from '@playwright/test'

const socialUser = {
  id: 99,
  name: 'OAuth Student',
  email: 'oauth@example.test',
  role: { role_name: 'Standard User' },
  profile: {},
}

test('social callback exchanges a single-use code once and stays signed in', async ({ page }) => {
  let exchangeRequests = 0

  await page.route('**/api/auth/exchange', async (route) => {
    exchangeRequests += 1

    if (exchangeRequests > 1) {
      await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ message: 'Code already used' }) })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'oauth-test-token', token_type: 'Bearer', user: socialUser }),
    })
  })

  await page.goto(`/auth/success?code=${'a'.repeat(64)}`)
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.waitForTimeout(1_700)

  await expect(page).toHaveURL(/\/dashboard$/)
  expect(exchangeRequests).toBe(1)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBe('oauth-test-token')
})

test('landing page shows the dashboard action for an authenticated user', async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('token', 'oauth-test-token')
    localStorage.setItem('user', JSON.stringify(user))
  }, socialUser)

  await page.goto('/')

  const dashboardLinks = page.getByRole('link', { name: 'Go to Dashboard' })
  await expect(dashboardLinks.first()).toBeVisible()
  await expect(dashboardLinks.first()).toHaveAttribute('href', '/dashboard')
})
