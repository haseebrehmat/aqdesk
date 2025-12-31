import { test, expect } from '@playwright/test';

const signedInUser = {
  id: 42,
  name: 'Route Tester',
  email: 'route.tester@example.com',
  role_id: 4,
  role: { role_name: 'Admin' },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ user }) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, { user: signedInUser });

  await page.route('**/api/dashboard/summary', async (route) => {
    await route.fulfill({
      json: {
        stats: { workspaces: 3, questions: 4, answers: 5, applications: 2 },
        activity: [
          { label: 'Jul', questions: 0, answers: 1 },
          { label: 'Aug', questions: 1, answers: 0 },
          { label: 'Sep', questions: 1, answers: 1 },
          { label: 'Oct', questions: 0, answers: 2 },
          { label: 'Nov', questions: 2, answers: 1 },
          { label: 'Dec', questions: 0, answers: 0 },
        ],
      },
    });
  });
});

test('public and authenticated navigation use different URLs and layouts', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'Your activity' })).toBeVisible();
  await expect(page.getByText('Six-month contribution trend')).toBeVisible();
  await expect(page.getByText('5', { exact: true })).toBeVisible();

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

test('creation actions are only available in the authenticated dashboard', async ({ page }) => {
  await page.goto('/opportunities');
  await expect(page.getByRole('link', { name: 'Post a Listing' })).toHaveCount(0);

  await page.goto('/questions');
  await expect(page.getByRole('link', { name: 'Start Discussion' })).toHaveCount(0);

  await page.goto('/dashboard/questions');
  await expect(page.getByRole('button', { name: 'Ask Question' })).toBeVisible();

  await page.goto('/dashboard/opportunities');
  await expect(page.getByRole('link', { name: 'Post Opportunity' })).toHaveAttribute(
    'href',
    '/dashboard/opportunities/create',
  );
});
