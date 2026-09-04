import {test,expect} from '@playwright/test';

test('Shadow DOM',async ({page})=>{

await page.goto('http://127.0.0.1:8080/tests/playwright-locator-practice-simple_1.html');

await page.locator(`#maintab-shadow`).click();

await page.locator(`#openBtn`).click();

const confirmationMsg =  page.getByText(`Clicked button inside OPEN shadow DOM`);

console.log("Display Text inside Shadow DOM :: ",await confirmationMsg.innerText());

await expect(confirmationMsg).toContainText(`Clicked button inside OPEN shadow DOM`);

//Try to click an element inside closed Shadow

await page.locator('#closedBtn').click();

const confirmationMsgClosedBtn = page.getByText(`Clicked button inside CLOSED shadow DOM`);

await expect( confirmationMsgClosedBtn).toContainText(`inside CLOSED shadow DOM`);

})