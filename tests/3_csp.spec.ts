import { test, expect, chromium } from '@playwright/test';

test('CSP blocks injected script by default',async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext(); // bypassCSP not set → default false
  const page = await context.newPage();

  await page.goto('http://localhost:3000');

  // Try injecting a script that modifies the page
  await page.addScriptTag({ content: `document.getElementById('heading').innerText = 'Injected!'` });

  const text = await page.locator('#heading').textContent();
  console.log('Without bypassCSP:', text); // stays "Original Content" — CSP blocked it

  await browser.close();
});


test('bypassCSP allows injected script to run',{tag: '@csp'} ,async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ bypassCSP: true }); // 👈 key setting
  const page = await context.newPage();

  await page.goto('http://localhost:3000');

  await page.addScriptTag({ content: `document.getElementById('heading').innerText = 'Injected!'` });

  const text = await page.locator('#heading').textContent();
  console.log('With bypassCSP:', text); // becomes "Injected!" — CSP bypassed

  expect(text).toBe('Injected!');

  await browser.close();
});