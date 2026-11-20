import { test, expect, type Page } from '@playwright/test';

async function dismissConsent(page: Page) {
  const button = page.getByRole('button', { name: 'Use essential only', exact: true });
  await button.click({ timeout: 8_000 });
}
async function enterRole(page: Page, role: 'resident' | 'institution' | 'platform admin') {
  await page.goto('/sign-in/');
  await page.getByRole('button', { name: 'Open ' + role + ' demo' }).click();
  await expect(page.getByText('Demo workspace', { exact: true })).toBeVisible();
}

test('homepage, search and keyboard navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /everything lugari.*one place/i })).toBeVisible();
  await dismissConsent(page);
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('searchbox').fill('Mautuma transformer');
  await dialog.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Search Lugari' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lukusi Electricity Project' })).toBeVisible();
  await page.getByRole('link', { name: 'Lukusi Electricity Project' }).click();
  await expect(page.getByRole('heading', { name: 'Project photos' })).toBeVisible();
  await expect(page.getByAltText(/wooden power poles loaded/i)).toBeVisible();
  await expect(page.getByText('Approved budget')).toBeVisible();
});

test('ward, theme, language and low-bandwidth settings persist', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 820 });
  await page.goto('/');
  await dismissConsent(page);
  await page.getByLabel('Select your ward').selectOption('mautuma');
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page).toHaveURL(/wards\/mautuma/);
  await expect(page.getByRole('heading', { name: 'Mautuma Ward', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await page.getByRole('button', { name: 'Switch to Kiswahili' }).click();
  await page.getByRole('button', { name: /hifadhi data/i }).click();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
  await expect(page.locator('html')).toHaveAttribute('data-saver', 'on');
  await expect(page.locator('.hero-media')).toBeHidden();
  await expect(page.getByLabel('Chagua wadi yako')).toHaveValue('mautuma');
});

test('project filters, empty state and opportunity save', async ({ page }) => {
  await page.goto('/projects/');
  await dismissConsent(page);
  await page.getByRole('combobox', { name: /^Ward\b/ }).selectOption('Mautuma');
  await page.getByRole('combobox', { name: /^Category\b/ }).selectOption('Water');
  await expect(page.getByRole('heading', { name: 'No matches for these filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByRole('link', { name: 'Manyonyi Solar Water Project' })).toBeVisible();

  await page.goto('/jobs/');
  await page.getByRole('link', { name: 'Mathematics Teaching Assistant' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  await enterRole(page, 'resident');
  await page.getByRole('navigation', { name: 'Resident workspace' }).getByRole('link', { name: 'Saved items' }).click();
  await expect(page.getByRole('link', { name: 'Mathematics Teaching Assistant' })).toBeVisible();
});

test('issue submission flows through institution and public status', async ({ page }) => {
  await page.goto('/report/');
  await dismissConsent(page);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Choose an issue type.' })).toBeVisible();
  await page.getByLabel('What is the issue?').selectOption('Electricity');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('combobox', { name: /^Ward\b/ }).selectOption('mautuma');
  await page.getByLabel('Village, estate or landmark').fill('Example market lane');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Describe what happened').fill('Example transformer failure blocked power service to the market.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('checkbox', { name: /i understand/i }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Submit demo report' }).click();
  const reference = await page.locator('.font-mono').innerText();
  await expect(page.getByRole('heading', { name: 'Your demo report was recorded' })).toBeVisible();
  await enterRole(page, 'institution');
  await page.getByRole('link', { name: 'Cases', exact: true }).click();
  await page.getByRole('button', { name: reference, exact: true }).click();
  await expect(page.getByText(/Suggested priority: High/)).toBeVisible();
  await page.getByRole('button', { name: 'Accept priority' }).click();
  await page.getByLabel('Assign staff').selectOption('Field officer');
  await page.locator('select[name=status]').selectOption('Referred');
  await page.getByLabel('Internal notes').fill('This internal note is private.');
  await page.getByLabel('Public response').fill('Referred to the demo field officer.');
  await page.getByRole('button', { name: 'Save case update' }).click();
  await expect(page.getByText(/Case updated in demo mode/)).toBeVisible();
  await page.getByRole('link', { name: 'Open public tracker' }).click();
  await expect(page.getByText('Referred to the demo field officer.')).toBeVisible();
  await expect(page.getByText('This internal note is private.')).toHaveCount(0);
  await expect(page.getByText('Example market lane')).toHaveCount(0);
});

test('communication consent and admin decisions remain available after reload', async ({ page }) => {
  await page.goto('/account/subscriptions/');
  await dismissConsent(page);
  await page.getByRole('checkbox', { name: 'SMS', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Jobs', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Allow sponsored offers' }).check();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'SMS', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Jobs', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Unsubscribe from marketing' }).click();
  await expect(page.getByRole('checkbox', { name: 'Allow sponsored offers' })).not.toBeChecked();
  await enterRole(page, 'platform admin');
  await page.getByRole('link', { name: 'Verification', exact: true }).click();
  await page.getByRole('button', { name: 'Example Growers Hub', exact: true }).click();
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByRole('link', { name: 'Audit log', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Approved', exact: true })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'verification-growers' })).toBeVisible();
});

test('campaign supports preview, approval and scheduling', async ({ page }) => {
  await page.goto('/');
  await dismissConsent(page);
  await enterRole(page, 'institution');
  await page.getByRole('link', { name: 'Campaigns', exact: true }).click();
  await page.getByLabel('Campaign name').fill('Example Mautuma water update');
  await page.getByRole('combobox', { name: /^Ward\b/ }).selectOption('mautuma');
  await page.getByRole('checkbox', { name: 'SMS' }).check();
  await page.getByRole('checkbox', { name: 'WhatsApp' }).check();
  await page.getByLabel('Message', { exact: true }).fill('Check the Mautuma ward page for the community water update.');
  await expect(page.getByRole('heading', { name: 'SMS preview' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'WhatsApp preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit for approval' }).click();
  await expect(page.getByText('Saved status: Awaiting approval')).toBeVisible();
  await enterRole(page, 'platform admin');
  await page.getByRole('link', { name: 'Advertising', exact: true }).click();
  await page.getByRole('button', { name: 'Approve campaign' }).click();
  await expect(page.getByText('No campaigns are waiting for approval.')).toBeVisible();
  await enterRole(page, 'institution');
  await page.getByRole('link', { name: 'Campaigns', exact: true }).click();
  await page.getByRole('button', { name: 'Example Mautuma water update' }).click();
  await page.getByLabel('Schedule time (East Africa Time)').fill('2030-12-01T09:00');
  await page.getByRole('button', { name: 'Schedule demo campaign' }).click();
  await expect(page.getByText('Campaign scheduled in demo mode. No messages were sent.')).toBeVisible();
});

test('mobile layouts fit the smallest requested widths', async ({ page }) => {
  for (const width of [320, 375, 430]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/projects/', '/wards/mautuma/', '/report/']) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});

test('publishing updates the ward while private pages stay noindex', async ({ page }) => {
  await page.goto('/portal/content/');
  await expect(page.getByRole('button', { name: 'Open institution demo' })).toBeVisible();
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await dismissConsent(page);
  await enterRole(page, 'institution');
  await page.getByRole('link', { name: 'Publishing', exact: true }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Example Mautuma market notice');
  await page.getByRole('combobox', { name: /^Ward\b/ }).selectOption('mautuma');
  await page.getByRole('textbox', { name: 'Details', exact: true }).fill('Review the sample market priorities at the next community meeting.');
  await page.getByRole('combobox', { name: /^Status\b/ }).selectOption('Pending review');
  await page.getByRole('button', { name: 'Save announcement' }).click();
  await expect(page.getByRole('heading', { name: 'Edit announcement' })).toBeVisible();
  await page.getByRole('combobox', { name: /^Status\b/ }).selectOption('Published');
  await page.getByRole('button', { name: 'Save announcement' }).click();
  await page.goto('/wards/mautuma/');
  await expect(page.getByRole('heading', { name: 'Example Mautuma market notice' })).toBeVisible();
  await page.goto('/wards/lwandeti/');
  await expect(page.getByRole('heading', { name: 'Example Mautuma market notice' })).toHaveCount(0);
});

test('static export serves offline fallback and manifest', async ({ page, context, request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).display).toBe('standalone');
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBeTruthy();
  await context.setOffline(true);
  await page.goto('/about/');
  await expect(page.getByRole('heading', { name: 'You’re offline' })).toBeVisible();
});
