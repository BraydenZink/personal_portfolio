import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/', name: 'home', heading: 'Brayden Zink' },
  { path: '/projects', name: 'projects', heading: 'Selected work' },
  { path: '/skills', name: 'skills', heading: 'Skills and tools' },
  { path: '/contact', name: 'contact', heading: "Let's talk" },
];

const VALID_FORM = { Name: 'Alex Rivera', Email: 'alex@example.com', Message: 'Hello, I would like to talk.' };

async function fillForm(page) {
  for (const [label, value] of Object.entries(VALID_FORM)) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
}

const isMobile = (testInfo) => testInfo.project.name === 'mobile';

for (const { path, name, heading } of PAGES) {
  test.describe(`${name} page`, () => {
    test('renders with no errors, overflow or broken images', async ({ page }, testInfo) => {
      const problems = [];
      page.on('pageerror', (err) => problems.push(err.message));
      page.on('console', (msg) => msg.type() === 'error' && problems.push(msg.text()));
      page.on('response', (res) => res.status() >= 400 && problems.push(`${res.status()} ${res.url()}`));

      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.getByText(/Loading/)).toHaveCount(0);

      // Lazy images only load near the viewport, so scroll through the whole page first.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForLoadState('networkidle');

      const brokenImages = await page.$$eval('img', (images) =>
        images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
      );
      expect(brokenImages).toEqual([]);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      expect(problems).toEqual([]);

      await page.screenshot({
        path: `docs/screenshots/${testInfo.project.name}-${name}.png`,
        fullPage: true,
      });
    });

    test('survives a direct page refresh', async ({ page }) => {
      await page.goto(path);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    });
  });
}

test.describe('navigation', () => {
  test('reaches every page through the menu', async ({ page }, testInfo) => {
    await page.goto('/');
    for (const { path, heading } of [...PAGES.slice(1), PAGES[0]]) {
      if (isMobile(testInfo)) await page.getByRole('button', { name: 'Open menu' }).click();
      const label = path === '/' ? 'Home' : path.slice(1).replace(/^./, (c) => c.toUpperCase());
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    }
  });

  test('every internal link on every page leads to a real page', async ({ page }) => {
    const known = new Set(PAGES.map((p) => p.path));
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.getByText(/Loading/)).toHaveCount(0);
      const hrefs = await page.$$eval('main a[href^="/"], header a[href^="/"]', (links) =>
        links.map((link) => link.getAttribute('href')),
      );
      for (const href of hrefs) expect(known, `${href} on ${path}`).toContain(href);
    }
  });

  test('every external link is a real URL, not a placeholder', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.getByText(/Loading/)).toHaveCount(0);
      const hrefs = await page.$$eval('a[href]', (links) => links.map((link) => link.getAttribute('href')));
      for (const href of hrefs) expect(href).not.toContain('TODO');
    }
  });

  test('unknown pages show the 404 page', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});

test.describe('projects page', () => {
  test('shows three projects and the filter narrows them', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('article')).toHaveCount(3);
    await page.getByRole('button', { name: 'Construction' }).click();
    await expect(page.locator('article')).toHaveCount(1);
    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.locator('article')).toHaveCount(3);
  });
});

test.describe('API failures', () => {
  test('a failed load shows an error, and retry recovers', async ({ page }) => {
    let shouldFail = true;
    await page.route('**/api/skills', (route) =>
      shouldFail ? route.fulfill({ status: 500, json: { error: 'x' } }) : route.continue(),
    );
    await page.goto('/skills');
    await expect(page.getByRole('alert')).toContainText("couldn't be loaded");
    shouldFail = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('meter').first()).toBeVisible();
  });
});

test.describe('contact form', () => {
  test('shows field errors from the server', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('Please enter your name.')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  });

  test('confirms success and clears the form', async ({ page }) => {
    // Answered here so that no real message is involved.
    await page.route('**/api/contact', (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('status')).toContainText('Your message was sent');
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
  });

  test('offers LinkedIn when sending fails, and keeps the message', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 503, json: { error: 'Your message could not be sent right now.' } }),
    );
    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('alert').getByRole('link', { name: 'LinkedIn' })).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(VALID_FORM.Message);
  });
});
