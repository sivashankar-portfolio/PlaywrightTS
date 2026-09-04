import {test,expect} from '@playwright/test';

test("Drag and Drop",async ({page})=>{

await page.goto("http://127.0.0.1:8080/tests/playwright-interactions-practice.html");

await page.getByRole('tab',{name:/Mouse Actions/}).click();

await page.dragAndDrop("#drag-src","#drop-zone");

await page. waitForTimeout(4000);

})

test("dropTo method",async ({page})=>{

await page.goto("http://127.0.0.1:8080/tests/playwright-interactions-practice.html");

await page.getByRole('tab',{name:/Mouse Actions/}).click();

await page.locator("#drag-src").dragTo(page.locator("#drop-zone"));

await page. waitForTimeout(4000);




})



test("hover mouse.down() hover mouse.up()",async ({page})=>{

await page.goto("http://127.0.0.1:8080/tests/playwright-interactions-practice.html");

await page.getByRole('tab',{name:/Mouse Actions/}).click();

await page.locator("#drag-src").hover();
await page.mouse.down();
await page.locator("#drop-zone").hover();
await page.mouse.up();

await page. waitForTimeout(4000);




})