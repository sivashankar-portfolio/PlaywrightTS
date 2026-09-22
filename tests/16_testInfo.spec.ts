import {test,expect} from '@playwright/test';

test("Verify testInfo",async({page},testInfo)=>{

await page.goto("https://www.amazon.in");

console.log(`Testcase :: ${testInfo.title} executed`)
console.log(` ${testInfo.outputDir} `)
console.log(` ${testInfo.snapshotDir} `)
console.log(` ${testInfo.retry} `)
console.log(` ${testInfo.workerIndex} `)
console.log(` ${testInfo.annotations} `)

})