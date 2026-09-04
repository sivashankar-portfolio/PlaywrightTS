import {test,expect,Page} from '@playwright/test';


async function testBody({page}:{page:Page})
{

await page.goto(`http://127.0.0.1:8080/tests/login.html`,{timeout:10000});

//getByTestId -> By default looks data-testid atrribute 
await page.getByTestId(`login-button`).click();
// get the displayed text using page.getByText()
const locator =  page.getByText(`Login Success`);
await expect(locator).toBeVisible();

// Display the text content in console
const text = await locator.textContent();
console.log(`Displayed message is \n${text}`);

}


test('verify login',testBody);