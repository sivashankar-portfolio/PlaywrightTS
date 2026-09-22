import { test, expect } from '@playwright/test';
import { setDevice } from '../src/utils/DeviceUtils';
import { VisualUtil } from '../src/utils/VisulaUtils';

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

  test("timeanddate",async({page})=>{
    // Skipped: timeanddate.com sits behind Cloudflare bot-protection that serves a
    // "verify you are human" interstitial to automated/headless browsers instead of the
    // real page. That's the site's own anti-bot control, not something to defeat from a
    // test - and even if bypassed today, it can be re-triggered at any time, making this
    // permanently flaky. Every other test in this file targets the local practice HTML
    // page for exactly this reason (see VISUAL_PAGE) - do the same here if this scenario
    // is still needed, rather than pointing it at a live third-party site.
    test.skip(true, 'timeanddate.com serves a bot-detection challenge to automated browsers - not reliably testable against a live third-party site.');

    await page.goto("https://www.timeanddate.com/");
    const section = page.locator(`//*[contains(text(),'Current Time')]/ancestor::div[contains(@class,'tad-box')]`);
    const clockLocator=page.locator(`#clk_box`);

    //mask the live clock before taking screenshot
    await clockLocator.evaluate((clock)=>{
      clock.style.visibility='hidden'
    })

    //Wait for any animations or lazy loading
    await section.waitFor({state:'visible'})

    //take screenshot of only specific section and compare it
     expect(await section.screenshot()).toMatchSnapshot();

   })

  test('full page screenshot', async ({ page }) => {
    await page.goto(VISUAL_PAGE);

    // fullPage:true stitches the ENTIRE scrollable page into one image, not just the viewport.
    // Good for "did anything anywhere on this page change" smoke checks; bad when the page has
    // constantly-changing content, because any tiny difference anywhere fails the whole test.
    await expect(page).toHaveScreenshot('FullPageScreenshot.png', { fullPage: true });
  });

  test('single element screenshot-1', async ({ page }) => {
    await page.goto(VISUAL_PAGE);

    // Scoping the screenshot to ONE locator is usually the better default: it is smaller,
    // faster to compare, and immune to unrelated changes happening elsewhere on the page.
    const priceCard = page.locator('#basic-price-card');
    await expect(priceCard).toHaveScreenshot();
  });

  test('Mobile View Port',async({page})=>{

    await page.setViewportSize({width:375,height:812});
    await page.goto('https://www.playwright.dev');

     expect(await page.screenshot()).toMatchSnapshot();


  })

  test("Open Amazon on iPhoneX viewport", async ({ page }) => {
    await setDevice(page, "iPhoneX"); // just one call
    await page.goto("https://www.amazon.com");
     expect(await page.screenshot({ path: "amazon-iPhoneX.png" })).toMatchSnapshot();
  });


     test("Open Amazon with maxDiffPixels settings", async ({ page }) => {
    await setDevice(page, "Pixel5"); // just one call
    await page.goto("https://www.amazon.com");
     await expect(page).toHaveScreenshot({maxDiffPixels:100})
  });

   test("Open Amazon with threshold settings", async ({ page }) => {
    await setDevice(page, "Pixel5"); // just one call
    await page.goto("https://www.amazon.com");
   await  expect( page.locator("//a[@aria-label='Amazon']")).toBeVisible();
     expect(await page.screenshot({ path: "amazon-iPhoneX.png" })).toMatchSnapshot({threshold:0.1});
  });

  test("FullPage comparison",async({page},testInfo)=>{

    await page.goto("https://www.playwright.dev");

    await VisualUtil.compareFullPage(page,testInfo.title);


  })

});

 