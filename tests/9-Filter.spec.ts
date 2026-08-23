import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
test('filter scenario', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/tests/FilteringLocators.html');

    await page.getByRole('listitem').filter({ hasText: 'Product 2' })
        .getByRole('button', { name: 'Add to cart' }).click();

    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const filename = path.join(dirname, 'test-results', `screenshots`, `screenshot_${Date.now()}.png`);

    await page.screenshot({ path: filename, fullPage: true })

    const locator = page.getByRole('listitem').filter({ hasNotText: 'Out of stock' });

    await expect(locator).toHaveCount(2);




});


test('Identify using hasNot', async ({ page }) => {


    await page.goto('http://127.0.0.1:5500/tests/FilteringLocators.html');

    await page.getByRole('listitem')
        .filter({ hasNot: page.getByRole('heading', { name: 'Product 2' }) }).getByRole('button', { name: 'Add to cart' })
        .click();

    // await page.screenshot();

});


test('using visible:true', async ({ page }) => {

    await page.goto('http://127.0.0.1:5500/tests/FilteringLocators_Visibility.html');

    await page.locator('button').filter({ visible: true }).click();

})


test('asset all item in list ', async ({ page }) => {

    await page.goto('http://127.0.0.1:5500/tests/FilteringLocators_Visibility.html');

    const list = page.getByRole('listitem');

    //If you change the order of items , test fails
   await  expect(list).toHaveText(['apple','banana','orange']);

})

test('Filter chanining', async ({ page }) => {

    await page.goto('http://127.0.0.1:5500/tests/Filterchaining.html');

    const list = page.getByRole('listitem');

   await list.filter({hasText:'Mary'})
   .filter({has:page.getByRole('button',{name:'Say goodbye'})})
   .screenshot({path:`tests/test-results/screenshots/FilterChaining_${Date.now()}.png`})

})


