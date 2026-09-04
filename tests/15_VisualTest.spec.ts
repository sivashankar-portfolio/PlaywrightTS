import { test, expect } from '@playwright/test';

/**
 * VISUAL TESTING WITH PLAYWRIGHT
 * ================================
 * Functional assertions (toHaveText, toBeVisible, toHaveValue...) only check the DOM/state -
 * they cannot catch a button that renders the wrong color, a layout that has shifted, or text
 * that overflows its container. Visual testing solves that gap by comparing a SCREENSHOT of the
 * page/element against a previously-saved "baseline" image, pixel by pixel.
 *
 * The core API is `expect(locatorOrPage).toHaveScreenshot(name)`:
 *   - 1st run   -> no baseline exists yet. Playwright WRITES the screenshot as the new baseline
 *                  but still FAILS the test - this forces you to look at the generated image
 *                  before trusting it, instead of silently accepting whatever happened to render.
 *   - Later runs -> Playwright takes a new screenshot and diffs it against the saved baseline.
 *                   If pixels differ beyond the allowed threshold, the test FAILS and an
 *                   actual / expected / diff image trio is written to test-results/.
 *   - Once a reviewed baseline is committed, a run that renders identically PASSES.
 *
 * Baselines are stored next to the spec file in a folder named
 * `15_VisualTest.spec.ts-snapshots/`, suffixed with the OS + browser project that produced them
 * (e.g. `-chromium-win32.png`) because font/anti-aliasing rendering differs per platform.
 *
 * First-time setup for THIS file (run once, review the images, then commit them):
 *   npx playwright test 15_VisualTest --update-snapshots
 * Re-running `npx playwright test 15_VisualTest` after that should report all green.
 *
 * All tests below point at tests/playwright-visual-testing-practice.html, which was built
 * specifically to exercise these scenarios (dynamic clock, running CSS animations, hover/focus
 * states, a toggleable layout bug, etc).
 */

const VISUAL_PAGE = 'http://127.0.0.1:8080/tests/playwright-visual-testing-practice.html';

// playwright.config.ts sets launchOptions.slowMo = 500 project-wide so OTHER demo specs are easy
// to watch headed. Screenshot assertions don't benefit from that (nobody is watching a pixel
// diff happen) and, combined with parallel workers, the extra 500ms-per-action was enough to
// blow past toHaveScreenshot()'s default 5s stability timeout. Overriding it back to 0 here is
// scoped to just this file - it does not affect any other spec's project config.
test.use({ launchOptions: { slowMo: 0 } });

test.describe('1. Screenshot basics', () => {


  test("plain basic visual test1",async({page})=>{

    await page.goto("https://playwright.dev");

    await expect(page).toHaveScreenshot();

  })

  test('full page screenshot', async ({ page }) => {
    await page.goto(VISUAL_PAGE);

    // fullPage:true stitches the ENTIRE scrollable page into one image, not just the viewport.
    // Good for "did anything anywhere on this page change" smoke checks; bad when the page has
    // constantly-changing content, because any tiny difference anywhere fails the whole test.
    await expect(page).toHaveScreenshot('full-page.png', { fullPage: true });
  });

  test('single element screenshot', async ({ page }) => {
    await page.goto(VISUAL_PAGE);

    // Scoping the screenshot to ONE locator is usually the better default: it is smaller,
    // faster to compare, and immune to unrelated changes happening elsewhere on the page.
    const priceCard = page.locator('#basic-price-card');
    await expect(priceCard).toHaveScreenshot('price-card.png');
  });

  test('clipped region of the page', async ({ page }) => {
    await page.goto(VISUAL_PAGE);

    // clip lets you screenshot an arbitrary rectangle in page coordinates, independent of any
    // single element - handy for "just the header band" type checks.
    await expect(page).toHaveScreenshot('clipped-header.png', {
      clip: { x: 0, y: 0, width: 500, height: 200 },
    });
  });

  test('tolerating minor pixel noise with thresholds', async ({ page }) => {
    await page.goto(VISUAL_PAGE);

    const priceCard = page.locator('#basic-price-card');

    // Two independent knobs control how "strict" a comparison is:
    //   threshold          - per-PIXEL color-difference sensitivity, 0 (identical) to 1 (ignore all).
    //   maxDiffPixelRatio   - how many DIFFERING pixels (as a % of the image) are still a pass.
    // Real CI runners often render fonts/anti-aliasing a hair differently than your laptop, so a
    // small tolerance avoids flaky failures without hiding genuine layout regressions.
    await expect(priceCard).toHaveScreenshot('price-card-tolerant.png', {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    });
  });

});

test.describe('2. Dynamic content - masking what you cannot control', () => {

  test('mask a live-updating clock', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    // The practice page groups its demos into tabs; only "Screenshot Basics" is visible on load,
    // so every other section must be switched to first, or its elements are display:none (which
    // toHaveScreenshot() will correctly refuse to screenshot - "element is not visible").
    await page.getByRole('tab', { name: /Dynamic Content/ }).click();

    // #live-clock ticks every second (see the HTML's setInterval). Screenshotting it directly
    // would fail on almost every re-run since the text keeps changing. `mask` paints a solid box
    // over the given locator(s) BEFORE the screenshot is taken and BEFORE the diff - the masked
    // region is excluded from comparison entirely, so its content is free to change.
    const clock = page.locator('#live-clock');
    await expect(clock).toBeVisible();

    // Screenshot the whole card (clock's closest ".card" ancestor) so the mask's effect - a solid
    // block where the clock used to be - is actually visible in the captured image.
    const clockCard = clock.locator('xpath=ancestor::div[contains(@class,"card")][1]');
    await expect(clockCard).toHaveScreenshot('clock-card-masked.png', {
      mask: [clock],
      maskColor: '#FF00FF', // optional - an obvious color makes masked regions easy to spot in review
    });
  });

  test('freeze dynamic text instead of masking it', async ({ page }) => {
    // Alternative to masking: freeze the page's clock BEFORE navigating, so the value never
    // changes in the first place. A naive `locator.evaluate(el => el.textContent = '12:00:00')`
    // AFTER load looks tempting but is unreliable here - the page's own `setInterval(tickClock,
    // 1000)` (see the HTML) is still running and will overwrite that manual edit with the real
    // time within a second, causing an intermittent flake depending on exact timing.
    //
    // page.clock.setFixedTime() pins Date/Date.now() to a fixed instant for the WHOLE page
    // lifetime - time-based callbacks like setInterval simply never advance, so tickClock() runs
    // once at load (rendering "12:00:00") and then never again. Must be called before goto() so
    // the page's very first render already sees the fixed time.
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00'));
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Dynamic Content/ }).click();

    await expect(page.locator('#live-clock')).toHaveText('12:00:00');
    await expect(page.locator('#live-clock')).toHaveScreenshot('clock-frozen.png');
  });

  test('mask multiple random elements at once', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Dynamic Content/ }).click();

    // mask accepts an ARRAY of locators - use it whenever more than one part of the page is
    // non-deterministic (here: a randomized avatar gradient + a randomized notification count).
    const avatar = page.locator('#random-avatar');
    const badge = page.locator('#random-badge');
    const card = avatar.locator('xpath=ancestor::div[contains(@class,"card")][1]');

    await expect(card).toHaveScreenshot('dynamic-avatar-card.png', {
      mask: [avatar, badge],
    });
  });

});

test.describe('3. Animations - freezing motion before capture', () => {

  test('spinner without disabling animations would be flaky', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Animations/ }).click();

    // .spinner rotates continuously via a CSS @keyframes animation. Two screenshots taken a
    // moment apart would land on different rotation angles, so a naive comparison is inherently
    // flaky. The fix is the `animations` option below, not a mask - we WANT to see the spinner's
    // shape/color, just not mid-rotation.
    const spinner = page.locator('.spinner').first();
    await expect(spinner).toBeVisible();

    // animations:'disabled' makes Playwright finish/cancel all CSS transitions & running CSS
    // animations before the screenshot is taken, so every run captures the same static frame.
    await expect(spinner).toHaveScreenshot('spinner-frozen.png', { animations: 'disabled' });
  });

  test('sliding banner and fading toast - same fix, different animations', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Animations/ }).click();

    // Works regardless of WHICH CSS property is animating (transform, opacity, ...) because
    // Playwright disables the animation mechanism itself, not a specific property.
    await expect(page.locator('.slide-banner')).toHaveScreenshot('banner-frozen.png', { animations: 'disabled' });
    await expect(page.locator('.fade-toast')).toHaveScreenshot('toast-frozen.png', { animations: 'disabled' });
  });

  test('project-wide default via test config (documented, not re-run here)', async () => {
    // Rather than repeating { animations: 'disabled' } on every call, most real projects set it
    // once in playwright.config.ts:
    //
    //   export default defineConfig({
    //     expect: { toHaveScreenshot: { animations: 'disabled' } },
    //   });
    //
    // Left as a comment (not applied to this repo's config) so it doesn't silently change the
    // behavior of screenshots taken in OTHER spec files.
    expect(true).toBe(true);
  });

});

test.describe('4. UI states - capturing something other than the default look', () => {

  test('hover state', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /UI States/ }).click();

    const hoverTarget = page.locator('#hover-target');

    // Baseline #1: default (un-hovered) appearance.
    await expect(hoverTarget).toHaveScreenshot('button-default.png');

    // .hover() moves the mouse over the element and keeps it there, so the :hover CSS state is
    // still active at the moment the screenshot is captured - this is DIFFERENT from click(),
    // which would trigger the click handler and move on.
    await hoverTarget.hover();
    await expect(hoverTarget).toHaveScreenshot('button-hover.png');
  });

  test('focus state', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /UI States/ }).click();

    const focusTarget = page.locator('#focus-target');

    // .focus() sets keyboard focus without clicking, so :focus-visible styling (the outline
    // ring, here) renders in the capture - useful for accessibility-focused visual checks.
    await focusTarget.focus();
    await expect(focusTarget).toHaveScreenshot('button-focused.png');
  });

  test('disabled vs enabled state of the same element', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /UI States/ }).click();

    const submitBtn = page.locator('#toggle-disable-target');
    const toggleBtn = page.getByRole('button', { name: 'Toggle Disabled' });

    await expect(submitBtn).toHaveScreenshot('submit-enabled.png');

    await toggleBtn.click();
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toHaveScreenshot('submit-disabled.png');
  });

  test('loading skeleton must never leak into a "loaded" baseline', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /UI States/ }).click();

    // A very common real-world visual-testing bug: taking the screenshot BEFORE async content
    // has finished loading, so the baseline accidentally captures a spinner/skeleton instead of
    // real content. Always assert the loaded state exists (or the loading state is GONE) before
    // calling toHaveScreenshot().
    const skeletons = page.locator('.skeleton');
    await expect(skeletons.first()).toBeVisible();

    // In a real app you'd await network/state here; this demo's skeleton is static markup, so we
    // just demonstrate the guard pattern against the grid of tiles instead, which IS fully loaded.
    await expect(page.locator('#tile-grid')).toHaveScreenshot('tile-grid.png');
  });

});

test.describe('5. Responsive & theme - same component, different context', () => {

  test('component reflow across viewport sizes', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Responsive/ }).click();

    const responsiveBox = page.locator('#responsive-demo');

    // Looping setViewportSize() + toHaveScreenshot() is the standard pattern for responsive
    // visual coverage: one baseline PER breakpoint, so a mobile-only wrapping bug can't hide
    // behind a desktop-only test run.
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await expect(responsiveBox).toHaveScreenshot(`responsive-${vp.name}.png`);
    }
  });

  test('light vs dark theme', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Responsive/ }).click();

    const themeBox = page.locator('#theme-box');
    const toggleBtn = page.getByRole('button', { name: 'Toggle Theme' });

    await expect(themeBox).toHaveScreenshot('theme-light.png');

    await toggleBtn.click();
    await expect(themeBox).toHaveScreenshot('theme-dark.png');
  });

  test('emulateMedia drives OS-level color-scheme preference directly', async ({ page }) => {
    // Some apps read prefers-color-scheme instead of a manual toggle. emulateMedia lets you set
    // that OS-level signal directly, without needing any in-page toggle button at all.
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(VISUAL_PAGE);

    await expect(page.locator('h1')).toHaveScreenshot('heading-dark-media.png');
  });

});

test.describe('6. Regression playground - watching a real diff happen', () => {

  test('capture the nav baseline (clean state)', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Regression Playground/ }).click();

    // This is the ONLY place in the suite that writes 'nav-baseline.png' - kept deliberately
    // isolated from the "buggy" comparison below so that a bulk `--update-snapshots` run always
    // regenerates it from the clean state, never accidentally from the regressed one.
    await expect(page.locator('#nav-demo')).toHaveScreenshot('nav-baseline.png');
  });

  test('toggling the layout bug fails the same baseline comparison (run manually)', async ({ page }) => {
    // Skipped by default. Why: it compares against the SAME 'nav-baseline.png' file the test
    // above owns. If this test were left enabled during `--update-snapshots`, Playwright would
    // happily overwrite that baseline with the BUGGY screenshot too (update-snapshots writes
    // whatever it captures, unconditionally, for every toHaveScreenshot call it sees) - silently
    // destroying the clean baseline. In a real diff-review workflow a human decides which image
    // to accept; here we keep that decision safe by never letting this path auto-write.
    //
    // To see the real failure + actual/expected/diff images:
    //   1. Comment out the test.skip(...) line below.
    //   2. npx playwright test 15_VisualTest -g "toggling the layout bug"   (no --update-snapshots)
    //   3. Inspect test-results/ for the diff image, then re-comment the skip.
    test.skip(true, 'Enable manually to watch a real visual diff fail - see comment above.');

    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Regression Playground/ }).click();

    const navDemo = page.locator('#nav-demo');
    const toggleBugBtn = page.getByRole('button', { name: 'Toggle Layout Bug' });

    // Introduce a layout regression (extra top padding via a CSS class), then compare against
    // the baseline the previous test already captured in its clean state.
    await toggleBugBtn.click();
    await expect(navDemo).toHaveScreenshot('nav-baseline.png');
  });

  test('color-only regression that text assertions would miss', async ({ page }) => {
    await page.goto(VISUAL_PAGE);
    await page.getByRole('tab', { name: /Regression Playground/ }).click();

    const pill = page.locator('#status-pill');
    const cycleBtn = page.getByRole('button', { name: 'Cycle Status' });

    // toHaveText() only checks the string "Operational" - it would happily pass even if the pill
    // rendered bright red instead of green. A screenshot comparison is the only way to catch a
    // pure styling/color regression like this.
    await expect(pill).toHaveText('Operational');
    await expect(pill).toHaveScreenshot('status-pill-operational.png');

    // Cycling changes both the text AND the color class - re-assert both to show the contrast
    // with the text-only check above.
    await cycleBtn.click();
    await expect(pill).toHaveText('Degraded');
    await expect(pill).toHaveScreenshot('status-pill-degraded.png');
  });

});

/**
 * CLI CHEATSHEET
 * ================
 * npx playwright test 15_VisualTest                     run just this file (first run = record baselines)
 * npx playwright test 15_VisualTest --update-snapshots   accept current rendering as the new baseline
 * npx playwright show-report                             open the HTML report with side-by-side diff images
 *
 * Baselines are OS/browser specific (e.g. "-chromium-win32.png"). Commit the ones that match
 * your CI runner's platform, or generate them inside CI itself, so local (Windows) and CI
 * (often Linux) machines don't produce spurious diffs from font-rendering differences alone.
 */
