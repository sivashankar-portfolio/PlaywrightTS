import { test, expect } from '@playwright/test';


test.use({channel:'msedge'})
test('bypassCSP allows injected script to run', {tag : `@csp`},async ({ browser }) => {
  const context = await browser.newContext({ bypassCSP: true });
  const page = await context.newPage();

  await page.goto('http://localhost:3000');
  await page.addScriptTag({ content: `document.getElementById('heading').innerText = 'Injected!'` });

  const text = await page.locator('#heading').textContent();
  expect(text).toBe('Injected!');
  // No need to manually close browser — Playwright Test handles it
});