import { test, expect } from '@playwright/test';

const signedInUser = {
  id: 42,
  name: 'Public Q&A Tester',
  email: 'qa.tester@example.com',
  role_id: 2,
  role: { role_name: 'Standard User' },
};

const question = {
  id: 10,
  user_id: 42,
  slug: 'api-testing',
  title: 'API Testing',
  body: 'How should this public API be tested?',
  created_at: '2025-12-01T10:00:00Z',
  views: 12,
  net_votes: 3,
  user_vote: 0,
  answers_count: 1,
  tags: [],
  user: signedInUser,
  answers: [
    {
      id: 20,
      user_id: 42,
      body: 'Use an integration test against the public response.',
      net_votes: 1,
      user_vote: 0,
      is_accepted: false,
      user: signedInUser,
    },
  ],
};

let publicVoteCount;

test.beforeEach(async ({ page }, testInfo) => {
  publicVoteCount = question.net_votes;
  if (!testInfo.title.includes('guest voting')) {
    await page.addInitScript(({ user }) => {
      localStorage.setItem('token', 'qa-test-token');
      localStorage.setItem('user', JSON.stringify(user));
    }, { user: signedInUser });
  }

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'GET' && url.pathname === '/api/questions') {
      await route.fulfill({ json: { data: [{ ...question, net_votes: publicVoteCount }] } });
      return;
    }
    if (request.method() === 'GET' && url.pathname === '/api/questions/api-testing') {
      await route.fulfill({ json: { ...question, net_votes: publicVoteCount } });
      return;
    }
    if (request.method() === 'POST' && url.pathname === '/api/questions/api-testing/vote') {
      if (!request.headers().authorization) {
        await route.fulfill({ status: 401, json: { message: 'Unauthenticated.' } });
        return;
      }
      publicVoteCount = 4;
      await route.fulfill({ json: { net_votes: publicVoteCount, user_vote: 1 } });
      return;
    }
    if (request.method() === 'POST' && url.pathname === '/api/answers/20/vote') {
      if (!request.headers().authorization) {
        await route.fulfill({ status: 401, json: { message: 'Unauthenticated.' } });
        return;
      }
      await route.fulfill({ json: { net_votes: 2, user_vote: 1 } });
      return;
    }
    if (request.method() === 'POST' && url.pathname === '/api/questions/api-testing/answers') {
      await route.fulfill({
        status: 201,
        json: {
          answer: {
            id: 21,
            user_id: 42,
            body: 'This answer was posted from the public detail page.',
            user: signedInUser,
          },
        },
      });
      return;
    }

    await route.continue();
  });
});

test('public Q&A exposes counts, answers, voting, and answer posting', async ({ page }) => {
  await page.goto('/');
  const homeDiscussion = page.getByRole('link', { name: /API Testing/ }).last();
  await expect(homeDiscussion).toHaveAttribute('href', '/questions/api-testing');
  await homeDiscussion.click();
  await expect(page).toHaveURL(/\/questions\/api-testing$/);

  await page.goto('/questions');

  await expect(page.getByText('3', { exact: true })).toBeVisible();
  const answersLink = page.getByRole('link', { name: '1 Answers' });
  await expect(answersLink).toHaveAttribute('href', '/questions/api-testing');
  await answersLink.click();

  await expect(page).toHaveURL(/\/questions\/api-testing$/);
  await expect(page.getByText('Use an integration test against the public response.')).toBeVisible();

  await page.getByRole('button', { name: 'Upvote question' }).click();
  await expect(page.getByText('4', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Upvote answer' }).click();
  await expect(page.getByText('2', { exact: true })).toBeVisible();

  await page.getByRole('textbox', { name: 'Your answer' }).fill('This answer was posted from the public detail page.');
  await page.getByRole('button', { name: 'Post Answer' }).click();
  await expect(page.getByText('This answer was posted from the public detail page.')).toBeVisible();
  await expect(page.getByRole('heading', { name: '2 Answers' })).toBeVisible();

  await page.goto('/questions');
  await expect(page.getByText('4', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /API Testing/ }).click();
  await expect(page).toHaveURL(/\/questions\/api-testing$/);
});

test('guest voting shows a friendly sign-in message', async ({ page }) => {
  await page.goto('/questions/api-testing');

  await page.getByRole('button', { name: 'Upvote question' }).click();

  await expect(page.getByText('Please sign in to vote.')).toBeVisible();
  await expect(page.getByText('Unauthenticated.')).toHaveCount(0);
});
