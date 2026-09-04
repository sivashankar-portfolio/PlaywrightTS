import {test} from '@playwright/test';
import { getJsonObject,getJsonArray, getTestData } from '../utils/testdatareader.js';


test('test playwright launch',async({page})=>{

const url = getTestData("base-url");
console.log(url);

await page.goto(url);

})

test("second testcase", ()=>{

    const user:Record<string,number> ={

        age:32,
        weight:116
    }

    for(const key in user)
    {
        console.log(`key ${key} and value ${user[key]}`);
    }


})


test("Fetch individual values from testdata",()=>{

const user = getJsonObject("user");
console.log(user.name)

const ids = getJsonArray("ids");
console.log(ids[0])


})