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

for (const [name, path] of publicRoutes) {
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
}
