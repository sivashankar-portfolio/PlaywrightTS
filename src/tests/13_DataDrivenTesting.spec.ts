import {test,expect} from '@playwright/test';
import { getJsonArray } from '../utils/testdatareader.js';
import { CustomLogger } from '../logger/customlogger.js';

const testdata= [


    {username:"standard_user",password:"secret_sauce"},
    {username:"locked_out_user",password:"secret_sauce"},
    {username:"invalid_user",password:"wrong_password"}
];
test.describe('Data driven using testdescribe and for of loop',()=>{

    for(const data of testdata)
    {
        test(`Login test with username ${data.username}`,async({page})=>{
                logger.info("launching the url");
                await page.goto("https://www.saucedemo.com/");
                logger.info("entering username & password");

                await page.locator('#user-name').fill(data.username);
                await page.locator('#password').fill(data.password);
                await page.locator('#login-button').click();
                logger.info("clicked logged in")


                if(data.username==='standard_user' && data.password==='secret_sauce')
                {
                    //verify successful login
                    await expect(page).toHaveURL(/inventory.html/)
                }
                if(data.username==='locked_out_user' && data.password==='secret_sauce')
                {
                    //verify locked out user error message
                    await expect(page.locator("//div[@class='login-box']//*[contains(text(),'locked out')]")).toBeVisible();
                }

                if(data.username==='invalid_user' && data.password==='wrong_password')
                {
                    //verify locked out user error message
                    await expect(page.locator("//div[@class='login-box']//*[contains(text(),'Username and password do not match')]")).toBeVisible();
                }

                 
        });




    }




})

// make sure env variable is set to corresponding testdata json file
// "TEST_DATA_PATH": "./src/resources/testdata/loginTestData.json"
const loginData = getJsonArray("loginTestData")
const logger = new CustomLogger();
test.describe('Data driven using json and  for of loop',()=>{

    for(const data of loginData)
    {
        test(`Login test with username  ${data.username}`,async({page})=>{
           

                await page.goto("https://www.saucedemo.com/");
                await page.locator('#user-name').fill(data.username);
                await page.locator('#password').fill(data.password);
                await page.locator('#login-button').click();


                if(data.username==='standard_user' && data.password==='secret_sauce')
                {
                    //verify successful login
                    await expect(page).toHaveURL(/inventory.html/)
                }
                if(data.username==='locked_out_user' && data.password==='secret_sauce')
                {
                    //verify locked out user error message
                    await expect(page.locator("//div[@class='login-box']//*[contains(text(),'locked out')]")).toBeVisible();
                }

                if(data.username==='invalid_user' && data.password==='wrong_password')
                {
                    //verify locked out user error message
                    await expect(page.locator("//div[@class='login-box']//*[contains(text(),'Username and password do not match')]")).toBeVisible();
                }

                 
        });




    }




})



