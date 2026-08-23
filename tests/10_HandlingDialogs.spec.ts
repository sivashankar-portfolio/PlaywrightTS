import {test,expect } from '@playwright/test';
import { assert } from 'console';

test('Verify dialog basic',async({page})=>{

await page.goto('http://127.0.0.1:5500/tests/dialog.html');


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

await page.goto('http://127.0.0.1:5500/tests/dialog.html');

    await page.evaluate(`(() => {
    window.waitForPrintDialog = new Promise(f => window.print = f);
})()`);

await page.getByText('Print Page').click();

await page.waitForFunction('window.waitForPrintDialog');
})


//runBeforeUnload

test('run before unload - dismiss ',async({page})=>{

await page.goto('http://127.0.0.1:5500/tests/dialog.html');


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

await page.goto('http://127.0.0.1:5500/tests/dialog.html');


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

