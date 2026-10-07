import {test,expect} from '@playwright/test';

test('trace test',async({page})=>{

    await page.goto('https://www.saucedemo.com');
    await page.fill(`#user-name`,`standard_user`);
    // Voluntarily failing the case to learn  trace concept
    await page.fill(`#password`,`secret_sauce_`);
    await page.click(`#login-button`);
    //expected url ->  https://www.saucedemo.com/inventory.html
    await expect(page).toHaveURL(/inventory\.html/)

    
})