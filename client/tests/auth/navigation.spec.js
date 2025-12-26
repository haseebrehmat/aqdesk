import { test, expect } from '@playwright/test';

const signedInUser = {
  id: 42,
  name: 'Route Tester',
  email: 'route.tester@example.com',
  role_id: 4,
  role: { role_name: 'Standard User' },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ user }) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, { user: signedInUser });
});

test('public and authenticated navigation use different URLs and layouts', async ({ page }) => {
  await page.goto('/dashboard');

  const sidebar = page.locator('aside');
  await expect(sidebar.getByRole('link', { name: 'Q&A Board' })).toHaveAttribute('href', '/dashboard/questions');
  await expect(sidebar.getByRole('link', { name: 'Opportunities' })).toHaveAttribute('href', '/dashboard/opportunities');
  await expect(sidebar.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/dashboard/events');
  await expect(sidebar.getByRole('link', { name: 'Podcasts' })).toHaveAttribute('href', '/dashboard/podcasts');

  await sidebar.getByRole('link', { name: 'Opportunities' }).click();
  await expect(page).toHaveURL(/\/dashboard\/opportunities$/);
  await expect(page.getByRole('heading', { name: 'Job Opportunities' })).toBeVisible();
  await expect(sidebar).toBeVisible();

  await page.goto('/opportunities');
  await expect(page).toHaveURL(/\/opportunities$/);
  await expect(page.getByRole('link', { name: 'Go to Dashboard' })).toBeVisible();
  await expect(page.locator('aside')).toHaveCount(0);
});
