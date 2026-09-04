import { test, expect } from '@playwright/test';
import { log } from 'node:console';

const URL = 'http://127.0.0.1:8080/tests/playwright-interactions-practice.html';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await page.getByRole('tab', { name: /Scroll/ }).click();
});

test('scroll within a fixed-height box via evaluate', async ({ page }) => {
  const box = page.locator('#scroll-box');
  await box.evaluate(el => (el.scrollTop = el.scrollHeight));
  const scrollTop = await box.evaluate(el => el.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);
});

test('mouse.wheel scrolls a box vertically', async ({ page }) => {
  const box = page.locator('#mw-vbox');
  await box.hover();

  await expect(page.locator('#mw-vpos')).toHaveText('0');

  await page.mouse.wheel(0, 300); // scroll DOWN
  await expect(page.locator('#mw-vpos')).not.toHaveText('0');

  const afterDown = Number(await page.locator('#mw-vpos').textContent());

  await page.mouse.wheel(0, -100); // scroll back UP a bit
  const afterUp = Number(await page.locator('#mw-vpos').textContent());
  expect(afterUp).toBeLessThan(afterDown);
});

test('mouse.wheel scrolls a box horizontally (deltaX)', async ({ page }) => {
  const box = page.locator('#mw-hbox');
  await box.hover();

  await expect(page.locator('#mw-hpos')).toHaveText('0');

  await page.mouse.wheel(300, 0); // deltaX scrolls horizontally
  await expect(page.locator('#mw-hpos')).not.toHaveText('0');
});

test('mouse.wheel scrolls the whole page (window.scrollY)', async ({ page }) => {
  // position the pointer over the page, not inside a scrollable box
  await page.mouse.move(400, 300);
  await page.mouse.wheel(0, 600);

  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(0);
});

test('infinite scroll loads items via repeated mouse.wheel', async ({ page }) => {
  const box = page.locator('#inf-box');
  const list = page.locator('#inf-list li');
  const done = page.locator('#inf-done');

  await expect(list).toHaveCount(5);
  await box.hover();

  const MAX_ATTEMPTS = 15;
  for (let i = 0; i < MAX_ATTEMPTS && !(await done.isVisible()); i++) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(150);
  }

  await expect(done).toBeVisible();
  await expect(list).toHaveCount(25);
});

test('page.evaluate: absolute scroll with element.scrollTo()', async ({ page }) => {
  const box = page.locator('#pev-box');
  await box.evaluate(el => el.scrollTo({ top: 300, behavior: 'instant' }));

  const scrollTop = await box.evaluate(el => el.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);
});

test('page.evaluate: relative scroll with element.scrollBy()', async ({ page }) => {
  const box = page.locator('#pev-box2');

  await box.evaluate(el => el.scrollBy(0, 100));
  const firstStep = await box.evaluate(el => el.scrollTop);
  expect(firstStep).toBeGreaterThan(0);

  await box.evaluate(el => el.scrollBy(0, 100));
  const secondStep = await box.evaluate(el => el.scrollTop);
  expect(secondStep).toBeGreaterThan(firstStep);
});

test('page.evaluate: scroll whole page to bottom then back to top', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const atBottom = await page.evaluate(() => window.scrollY);
  expect(atBottom).toBeGreaterThan(0);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const atTop = await page.evaluate(() => window.scrollY);
  expect(atTop).toBe(0);
});

test('scrollIntoView via evaluate vs scrollIntoViewIfNeeded', async ({ page }) => {
  const target = page.locator('#scroll-target');

  // raw scrollIntoView always scrolls, and lets you control alignment
  await target.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(target).toBeInViewport();

  // Playwright's built-in helper only scrolls if the element isn't already visible
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeInViewport();
});


test('ScrollIntoViewIfNeeded',async({page})=>{

    const target = page.locator("//div[text()='Tile 7']");

    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(5000);
    console.log("Scrolled Successfully :: ", await target.textContent())
})