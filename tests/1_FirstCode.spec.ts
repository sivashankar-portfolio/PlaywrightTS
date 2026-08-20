import {test,expect,Page} from '@playwright/test';


async function verifyTitle(page: Page )
{
   // the base url is read from playwright.config.ts Use object
    await page.goto('/',{timeout:40000});
    //     when you give parameter between / / it is considered as RegExp 
    await expect(page).toHaveTitle(/Playwright/,{timeout:20000});

    //screenshot by directly giving name only
    await page.screenshot({path:'screenshot.png',fullPage:true})

    //screenshot by giving file path important dont give slash in the beginning
    await page.screenshot({path:'test-results/demo/screenshot.png',fullPage:true})
    //timestamp
    await page.screenshot({path:`test-results/demo/screenshot-${Date.now()}.png`,fullPage:true})

}

// test('has',verifyTitle({page}));

// test() expects a callback that Playwright invokes with the test fixtures.
// Calling verifyTitle({page}) directly here would run it immediately (before
// the test framework provides a real `page`) and `page` isn't even in scope,
// so instead pass an async ({page}) => ... callback that calls verifyTitle
// with the actual Page fixture supplied by Playwright at test-run time.

test('has title', async ({ page }) => {
    await verifyTitle(page);
});