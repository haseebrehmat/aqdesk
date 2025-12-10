import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicRoutes = [
  ['home', '/'],
  ['about', '/about'],
  ['questions', '/questions'],
  ['opportunities', '/opportunities'],
  ['events', '/events'],
  ['podcasts', '/podcasts'],
]

const auditedRoutes = [
  ...publicRoutes,
  ['sign in', '/login'],
  ['registration', '/register'],
]

for (const [name, path] of auditedRoutes) {
  test(`${name} meets automated WCAG 2.1 A and AA checks`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.flatMap((node) => node.target),
    }))

    expect(summary).toEqual([])
  })

  test(`${name} has a main landmark and one primary heading`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })

    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('')
  })

  test(`${name} reflows without horizontal document overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto(path, { waitUntil: 'networkidle' })

    const sizes = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))

    expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth)
  })
}

for (const [name, path] of publicRoutes) {
  test(`${name} skip link moves keyboard focus to main content`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })

    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })
}
