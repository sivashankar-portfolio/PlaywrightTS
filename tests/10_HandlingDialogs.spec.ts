import {test,expect } from '@playwright/test';
import { assert } from 'console';

test('Verify dialog basic',async({page})=>{

await page.goto('http://127.0.0.1:8080/tests/dialog.html');


// By default, dialogs are auto-dismissed by playwright itself
await page.locator('#alertBtn').click();
//------------------------------------------------------------------
page.once('dialog',async(dialog)=>{
    dialog.accept();
})

await page.locator('#confirmBtn').click();
//--------------------------------------------------------------
page.once('dialog',async(dialog)=>{
    dialog.accept("Hello there ");
    console.log(dialog.message())
})


await page.locator('#promptBtn').click();


})


test('Print dialog test',async({page})=>{

await page.goto('http://127.0.0.1:8080/tests/dialog.html');

    await page.evaluate(`(() => {
    window.waitForPrintDialog = new Promise(f => window.print = f);
})()`);

await page.getByText('Print Page').click();

await page.waitForFunction('window.waitForPrintDialog');
})


//runBeforeUnload

test('run before unload - dismiss ',async({page})=>{

await page.goto('http://127.0.0.1:8080/tests/dialog.html');


page.once('dialog',async (dialog)=>{

    if( dialog.type()=== 'beforeunload')
    {
        console.log("before unload dialog ...");
        await dialog.dismiss();
    }
})

await page.locator('#beforeUnloadBtn').click();



})


test('run before unload - accept() ',async({page})=>{

await page.goto('http://127.0.0.1:8080/tests/dialog.html');


page.once('dialog',async (dialog)=>{

    if( dialog.type()=== 'beforeunload')
    {
        console.log("before unload dialog ...");
        await dialog.accept();
    }
})

await page.locator('#beforeUnloadBtn').click();

await page.close({ runBeforeUnload: true });

})


// Dialog handler registered before ANY action - verifying it still catches
// a dialog that only fires 11 actions later.
test('dialog handler registered before first action - still works',async({page})=>{

await page.goto('http://127.0.0.1:8080/tests/dialog.html');

let dialogHandled = false;

// Handler registered right after goto, before the 10 unrelated actions below
page.on('dialog', async (dialog) => {
    console.log('Dialog message:', dialog.message());
    dialogHandled = true;
    await dialog.accept();
});

// 1
await expect(page.locator('h1')).toHaveText('Playwright Dialog Demo');
// 2
await expect(page).toHaveTitle('Playwright Dialog Demo');
// 3
await expect(page.locator('#alertBtn')).toBeVisible();
// 4
await expect(page.locator('#confirmBtn')).toBeVisible();
// 5
await expect(page.locator('#promptBtn')).toBeVisible();
// 6
await expect(page.locator('#printBtn')).toBeVisible();
// 7
await expect(page.locator('#beforeUnloadBtn')).toBeVisible();
// 8
await expect(page.locator('#alertBtn')).toBeEnabled();
// 9
await expect(page.locator('#confirmBtn')).toBeEnabled();
// 10
await expect(page.locator('#promptBtn')).toBeEnabled();

// 11 - only now does the action that actually triggers the dialog happen
await page.locator('#alertBtn').click();
console.log(`dialoghandled :: ${dialogHandled}`);
expect(dialogHandled).toBe(true);

})

