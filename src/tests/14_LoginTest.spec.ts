import {test} from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { getJsonArray } from '../utils/testdatareader.js';

const creds = getJsonArray("loginTestData");

//Page Object Model implemented in this test
test.describe("tests ",()=>{

    for(const data of creds)
    {
            test(`Login success with credentials - ${data.username}`,async ({page})=>{

    const  loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(data.username,data.password);

            });
    }
})
